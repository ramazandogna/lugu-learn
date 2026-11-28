-- 0012 teacher gate: the admin decides how far a student may go in a program.
-- `open_through_sequence` = the highest lesson sequence the student may open. Null = no gate (lessons
-- open one after another as before). Completing a lesson still moves `current_lesson_id` forward; a
-- current lesson beyond the gate waits, locked, until the admin opens it. Completed lessons stay replayable.

alter table lugu.program_assignments
  add column open_through_sequence integer check (open_through_sequence >= 1);

alter table lugu.program_events drop constraint program_events_kind_check;
alter table lugu.program_events add constraint program_events_kind_check check (kind in (
  'assigned', 'forward', 'backward', 'set_lesson', 'restart_lesson', 'pause', 'resume', 'archive',
  'lesson_completed', 'program_completed', 'gate'));

-- True when the lesson is beyond the assignment's gate.
create function lugu.teacher_locked(p_a lugu.program_assignments, p_lesson_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_a.open_through_sequence is not null
     and coalesce((select l.sequence from lugu.curriculum_lessons l where l.id = p_lesson_id), 0) > p_a.open_through_sequence
$$;

create or replace function lugu.lesson_access(p_student_id uuid, p_lesson_id uuid)
returns table (assignment_id uuid, assignment_status text, is_current boolean, is_completed boolean)
language sql stable security definer set search_path = '' as $$
  select a.id, a.status,
         a.current_lesson_id is not distinct from l.id
           and (a.open_through_sequence is null or l.sequence <= a.open_through_sequence),
         exists (select 1 from lugu.lesson_completion_records r where r.assignment_id = a.id and r.lesson_id = l.id)
  from lugu.curriculum_lessons l
  join lugu.program_assignments a on a.curriculum_version_id = l.version_id and a.student_id = p_student_id
  where l.id = p_lesson_id and a.status <> 'archived'
  order by case a.status when 'active' then 0 when 'paused' then 1 else 2 end, a.created_at desc
  limit 1
$$;

create or replace function lugu.student_session(p_session_id uuid) returns lugu.learning_sessions
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := lugu.require_active_student();
  v_s lugu.learning_sessions;
  v_a lugu.program_assignments;
begin
  select * into v_s from lugu.learning_sessions s where s.id = p_session_id and s.student_id = v_uid for update;
  if not found then
    raise exception 'LUGU_SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_s.status <> 'active' then
    raise exception 'LUGU_SESSION_NOT_ACTIVE' using errcode = 'P0001';
  end if;
  select * into v_a from lugu.program_assignments a where a.id = v_s.assignment_id;
  if v_s.kind = 'primary' then
    if v_a.status <> 'active' then
      raise exception 'LUGU_ASSIGNMENT_NOT_ACTIVE' using errcode = 'P0001';
    end if;
    if v_a.current_lesson_id is distinct from v_s.lesson_id then
      raise exception 'LUGU_LESSON_NOT_CURRENT' using errcode = 'P0001';
    end if;
    if lugu.teacher_locked(v_a, v_s.lesson_id) then
      raise exception 'LUGU_LESSON_LOCKED' using errcode = 'P0001';
    end if;
  elsif v_a.status not in ('active', 'completed') then
    raise exception 'LUGU_ASSIGNMENT_NOT_ACTIVE' using errcode = 'P0001';
  end if;
  return v_s;
end $$;

create or replace function lugu.student_home() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := lugu.current_student_id();
begin
  if v_uid is null then
    raise exception 'LUGU_NOT_STUDENT' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'profile', (
      select jsonb_build_object(
        'user_id', sp.user_id, 'student_code', sp.student_code, 'first_name', sp.first_name,
        'display_name', sp.display_name, 'grade', sp.grade, 'avatar_key', sp.avatar_key,
        'school', case when sc.id is null then null
                       else jsonb_build_object('id', sc.id, 'name', sc.name, 'city', sc.city, 'district', sc.district) end,
        'status', pr.status, 'must_change_password', pr.must_change_password,
        'profile_completed_at', sp.profile_completed_at)
      from lugu.student_profiles sp
      join lugu.profiles pr on pr.user_id = sp.user_id
      left join lugu.schools sc on sc.id = sp.school_id
      where sp.user_id = v_uid),
    'assignments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'status', a.status,
        'curriculum', jsonb_build_object('id', c.id, 'name', c.name, 'version', v.version),
        'lessons_total', (select count(*) from lugu.curriculum_lessons l
                          where l.version_id = a.curriculum_version_id and l.status <> 'archived'),
        'lessons_completed', (select count(distinct r.lesson_id) from lugu.lesson_completion_records r
                              where r.assignment_id = a.id),
        'current_lesson', (
          select jsonb_build_object(
            'id', l.id, 'sequence', l.sequence, 'title', l.title, 'estimated_minutes', l.estimated_minutes,
            'in_progress', exists (select 1 from lugu.learning_sessions s
                                   where s.student_id = v_uid and s.lesson_id = l.id
                                     and s.kind = 'primary' and s.status = 'active'),
            'tagline', (select p.content #>> '{meta,tagline}' from lugu.lesson_content_packages p
                        where p.lesson_id = l.id and p.status = 'published'),
            'teacher_locked', lugu.teacher_locked(a, l.id))
          from lugu.curriculum_lessons l where l.id = a.current_lesson_id))
        order by a.created_at)
      from lugu.program_assignments a
      join lugu.curriculum_versions v on v.id = a.curriculum_version_id
      join lugu.curricula c on c.id = v.curriculum_id
      where a.student_id = v_uid and a.status <> 'archived'), '[]'::jsonb),
    'xp', (select coalesce(sum(r.amount), 0) from lugu.progress_rewards r where r.student_id = v_uid),
    'achievements_count', (select count(*) from lugu.student_achievement_records r where r.student_id = v_uid),
    'mastered_words', (select count(*) from lugu.vocabulary_mastery m
                       where m.student_id = v_uid and m.mastered_at is not null));
end $$;

create or replace function lugu.student_learning_map(assignment_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_assignment_id uuid := assignment_id;
  v_uid uuid := lugu.current_student_id();
  v_a lugu.program_assignments;
begin
  if v_uid is null then
    raise exception 'LUGU_NOT_STUDENT' using errcode = 'P0001';
  end if;
  select * into v_a from lugu.program_assignments a
  where a.id = v_assignment_id and a.student_id = v_uid and a.status <> 'archived';
  if not found then
    raise exception 'LUGU_ASSIGNMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'assignment', jsonb_build_object('id', v_a.id, 'status', v_a.status, 'current_lesson_id', v_a.current_lesson_id,
                                    'open_through_sequence', v_a.open_through_sequence),
    'lessons', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id, 'sequence', x.sequence, 'title', x.title, 'estimated_minutes', x.estimated_minutes,
        'state', case
          when x.id is not distinct from v_a.current_lesson_id and lugu.teacher_locked(v_a, x.id) then 'locked'
          when x.id is not distinct from v_a.current_lesson_id and x.in_progress then 'in_progress'
          when x.id is not distinct from v_a.current_lesson_id and (v_a.status = 'active' or x.completed_at is null)
            then 'current'
          when x.completed_at is not null then 'completed'
          else 'locked' end,
        'replay_available', x.completed_at is not null,
        'completed_at', x.completed_at,
        'tagline', x.meta ->> 'tagline',
        'character', x.meta ->> 'character') order by x.sequence)
      from (
        select l.id, l.sequence, l.title, l.estimated_minutes,
               (select max(r.completed_at) from lugu.lesson_completion_records r
                where r.assignment_id = v_a.id and r.lesson_id = l.id) as completed_at,
               exists (select 1 from lugu.learning_sessions s
                       where s.student_id = v_uid and s.lesson_id = l.id
                         and s.kind = 'primary' and s.status = 'active') as in_progress,
               (select p.content -> 'meta' from lugu.lesson_content_packages p
                where p.lesson_id = l.id and p.status = 'published') as meta
        from lugu.curriculum_lessons l
        where l.version_id = v_a.curriculum_version_id and l.status <> 'archived') x), '[]'::jsonb));
end $$;

-- Sets (or clears, with null) the gate. Logged as a program event and audited.
create function lugu.admin_set_lesson_gate(assignment_id uuid, open_through integer, note text default null)
returns lugu.program_assignments
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_assignment uuid := assignment_id;
  v_through integer := open_through;
  v_note text := nullif(btrim(note), '');
  v_admin uuid := lugu.require_admin();
  v_a lugu.program_assignments;
  v_from integer;
begin
  if v_through is not null and v_through < 1 then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_a from lugu.program_assignments a where a.id = v_assignment for update;
  if not found then
    raise exception 'LUGU_ASSIGNMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_a.status = 'archived' then
    raise exception 'LUGU_ASSIGNMENT_ARCHIVED' using errcode = 'P0001';
  end if;
  v_from := v_a.open_through_sequence;
  update lugu.program_assignments a set open_through_sequence = v_through where a.id = v_a.id returning * into v_a;
  insert into lugu.program_events (assignment_id, kind, to_lesson_id, actor_id, note)
  values (v_a.id, 'gate',
          (select l.id from lugu.curriculum_lessons l
           where l.version_id = v_a.curriculum_version_id and l.sequence = v_through),
          v_admin, v_note);
  perform lugu.audit('admin_set_lesson_gate', 'program_assignments', v_a.id::text,
    jsonb_build_object('from', v_from, 'to', v_through, 'note', v_note));
  return v_a;
end $$;

revoke all on function lugu.teacher_locked(lugu.program_assignments, uuid) from public, anon;
revoke all on function lugu.admin_set_lesson_gate(uuid, integer, text) from public, anon;
grant execute on function lugu.admin_set_lesson_gate(uuid, integer, text) to authenticated;
