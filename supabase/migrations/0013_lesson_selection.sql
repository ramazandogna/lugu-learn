-- 0013 lesson selection, student title, speaking targets.
--
-- 1. `program_assignments.open_lesson_ids`: the lessons the admin opened for this student in this program.
--    Null = every lesson (they open one after another, as before). Otherwise the student walks the open
--    lessons in sequence order: the current lesson is the first open lesson not yet completed; every other
--    lesson is locked ("ask your teacher" when it is not open, "finish the one before" when it is).
--    Replaces the 0012 `open_through_sequence` gate: existing gates are converted, the column stays (unused,
--    nulled) so a rollback of the frontend keeps working; it can be dropped in a later migration.
-- 2. `student_profiles.honor_title` (+ optional `honor_title_until`): a title the admin gives, shown to the student.
-- 3. `speaking_session_notes.topics` / `targets`: what was talked about and per-target result.

alter table lugu.program_assignments add column open_lesson_ids uuid[];

update lugu.program_assignments a
set open_lesson_ids = coalesce((
      select array_agg(l.id order by l.sequence) from lugu.curriculum_lessons l
      where l.version_id = a.curriculum_version_id and l.status <> 'archived' and l.sequence <= a.open_through_sequence),
      '{}'),
    open_through_sequence = null
where a.open_through_sequence is not null;

alter table lugu.program_events drop constraint program_events_kind_check;
alter table lugu.program_events add constraint program_events_kind_check check (kind in (
  'assigned', 'forward', 'backward', 'set_lesson', 'restart_lesson', 'pause', 'resume', 'archive',
  'lesson_completed', 'program_completed', 'gate', 'open_lessons'));

alter table lugu.student_profiles
  add column honor_title text check (length(btrim(honor_title)) between 1 and 160),
  add column honor_title_until timestamptz;

alter table lugu.speaking_session_notes
  add column topics text check (length(topics) <= 8000),
  -- [{ "text": "...", "result": "met" | "partly" | "not" | null }]
  add column targets jsonb not null default '[]'::jsonb check (jsonb_typeof(targets) = 'array');

-- True when the admin has not opened the lesson for this assignment.
create or replace function lugu.teacher_locked(p_a lugu.program_assignments, p_lesson_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_a.open_lesson_ids is not null and not (p_lesson_id = any (p_a.open_lesson_ids))
$$;

-- Where the student stands with a selection: the first open lesson not completed; when none is left, the next
-- lesson not completed after the open ones (locked until the admin opens it), else the first one not completed;
-- null when every lesson is completed.
create function lugu.selection_current_lesson(p_a lugu.program_assignments) returns uuid
language sql stable security definer set search_path = '' as $$
  select l.id from lugu.curriculum_lessons l
  where l.version_id = p_a.curriculum_version_id and l.status <> 'archived'
    and not exists (select 1 from lugu.lesson_completion_records r where r.assignment_id = p_a.id and r.lesson_id = l.id)
  order by (l.id = any (coalesce(p_a.open_lesson_ids, '{}'))) desc,
           -- Among closed lessons only: those after the last open one come first.
           case when l.id = any (coalesce(p_a.open_lesson_ids, '{}')) then false
                else l.sequence < coalesce((select max(o.sequence) from lugu.curriculum_lessons o
                                            where o.id = any (coalesce(p_a.open_lesson_ids, '{}'))), 0) end,
           l.sequence
  limit 1
$$;

create or replace function lugu.lesson_access(p_student_id uuid, p_lesson_id uuid)
returns table (assignment_id uuid, assignment_status text, is_current boolean, is_completed boolean)
language sql stable security definer set search_path = '' as $$
  select a.id, a.status,
         a.current_lesson_id is not distinct from l.id and not lugu.teacher_locked(a, l.id),
         exists (select 1 from lugu.lesson_completion_records r where r.assignment_id = a.id and r.lesson_id = l.id)
  from lugu.curriculum_lessons l
  join lugu.program_assignments a on a.curriculum_version_id = l.version_id and a.student_id = p_student_id
  where l.id = p_lesson_id and a.status <> 'archived'
  order by case a.status when 'active' then 0 when 'paused' then 1 else 2 end, a.created_at desc
  limit 1
$$;

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
                                    'curriculum_name', (select c.name from lugu.curriculum_versions v
                                                        join lugu.curricula c on c.id = v.curriculum_id
                                                        where v.id = v_a.curriculum_version_id),
                                    'selection', v_a.open_lesson_ids is not null),
    'lessons', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id, 'sequence', x.sequence, 'title', x.title, 'estimated_minutes', x.estimated_minutes,
        'state', case
          when x.id is not distinct from v_a.current_lesson_id and x.teacher_locked and x.completed_at is null then 'locked'
          when x.id is not distinct from v_a.current_lesson_id and x.in_progress then 'in_progress'
          when x.id is not distinct from v_a.current_lesson_id and (v_a.status = 'active' or x.completed_at is null)
            then 'current'
          when x.completed_at is not null then 'completed'
          else 'locked' end,
        'teacher_locked', x.teacher_locked and x.completed_at is null,
        'replay_available', x.completed_at is not null,
        'completed_at', x.completed_at,
        'tagline', x.meta ->> 'tagline',
        'character', x.meta ->> 'character') order by x.sequence)
      from (
        select l.id, l.sequence, l.title, l.estimated_minutes,
               lugu.teacher_locked(v_a, l.id) as teacher_locked,
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

-- student_home: 0012 body plus the profile's active honor title and each assignment's open-lesson count.
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
        'profile_completed_at', sp.profile_completed_at,
        'honor_title', case when sp.honor_title_until is null or sp.honor_title_until > now() then sp.honor_title end)
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

-- complete_lesson: 0010 body; with a selection the next lesson is `selection_current_lesson`, and the
-- program completes only when every lesson is completed.
create or replace function lugu.complete_lesson(session_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_uid uuid := lugu.require_active_student();
  v_s lugu.learning_sessions;
  v_a lugu.program_assignments;
  v_content jsonb;
  v_sec text;
  v_min numeric;
  v_percent numeric;
  v_first boolean;
  v_xp integer := 0;
  v_lesson_xp integer;
  v_seq integer;
  v_next uuid;
  v_awarded jsonb := '[]'::jsonb;
  v_ach record;
  v_stars integer;
begin
  select * into v_s from lugu.learning_sessions s where s.id = v_session_id and s.student_id = v_uid for update;
  if not found then
    raise exception 'LUGU_SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_s.status = 'completed' then
    select * into v_a from lugu.program_assignments a where a.id = v_s.assignment_id;
    return jsonb_build_object(
      'completed', true, 'already_completed', true, 'kind', v_s.kind, 'xp_awarded', 0, 'achievements', '[]'::jsonb,
      'stars', lugu.lesson_stars((select r.percent from lugu.assessment_results r where r.session_id = v_s.id)),
      'next_lesson_id', v_a.current_lesson_id, 'assignment_status', v_a.status);
  end if;

  v_s := lugu.student_session(v_session_id);
  v_content := lugu.session_content(v_s);
  foreach v_sec in array lugu.section_keys() loop
    if lugu.section_required(v_content, v_sec) and (
         not exists (select 1 from lugu.session_section_progress p
                     where p.session_id = v_s.id and p.section = v_sec and p.status = 'completed')
         or not lugu.section_criteria_met(v_s, v_content, v_sec)) then
      raise exception 'LUGU_LESSON_INCOMPLETE' using errcode = 'P0001', detail = v_sec;
    end if;
  end loop;
  select r.percent into v_percent from lugu.assessment_results r where r.session_id = v_s.id;
  v_min := coalesce((v_content #>> '{completion,minAssessmentPercent}')::numeric, 0);
  if v_min > 0 and (v_percent is null or v_percent < v_min) then
    raise exception 'LUGU_ASSESSMENT_BELOW_MINIMUM' using errcode = 'P0001';
  end if;

  v_stars := lugu.lesson_stars(v_percent);
  update lugu.learning_sessions s set status = 'completed', completed_at = now(), last_seen_at = now()
  where s.id = v_s.id;

  select * into v_a from lugu.program_assignments a where a.id = v_s.assignment_id for update;
  if v_s.kind = 'replay' then
    return jsonb_build_object(
      'completed', true, 'already_completed', false, 'kind', 'replay', 'xp_awarded', 0, 'achievements', '[]'::jsonb,
      'stars', v_stars,
      'next_lesson_id', v_a.current_lesson_id, 'assignment_status', v_a.status);
  end if;

  v_first := not exists (select 1 from lugu.lesson_completion_records r
                         where r.student_id = v_uid and r.lesson_id = v_s.lesson_id);
  insert into lugu.lesson_completion_records (assignment_id, lesson_id, student_id, session_id, package_id, summary)
  values (v_a.id, v_s.lesson_id, v_uid, v_s.id, v_s.package_id, jsonb_build_object(
    'assessment_percent', v_percent,
    'stars', v_stars,
    'active_seconds', v_s.active_seconds,
    'vocabulary_items', jsonb_array_length(coalesce(v_content -> 'vocabulary', '[]'))));

  if v_first then
    v_lesson_xp := lugu.setting_numeric('rewards.lesson_xp', 100)::int;
    if v_lesson_xp > 0 then
      insert into lugu.progress_rewards (student_id, amount, reason, lesson_id, session_id)
      values (v_uid, v_lesson_xp, 'lesson_completed', v_s.lesson_id, v_s.id);
      v_xp := v_lesson_xp;
    end if;
    for v_ach in
      insert into lugu.student_achievement_records (student_id, achievement_id)
      select v_uid, ac.id from lugu.achievements ac
      where ac.active and ac.kind = 'lessons_completed'
        and ac.threshold <= (select count(distinct r.lesson_id) from lugu.lesson_completion_records r
                             where r.student_id = v_uid)
      on conflict do nothing
      returning achievement_id
    loop
      select jsonb_insert(v_awarded, '{-1}', to_jsonb(ac.key), true) into v_awarded
      from lugu.achievements ac where ac.id = v_ach.achievement_id;
      insert into lugu.progress_rewards (student_id, amount, reason, achievement_id, session_id)
      select v_uid, ac.xp, 'achievement', ac.id, v_s.id from lugu.achievements ac
      where ac.id = v_ach.achievement_id and ac.xp > 0;
      v_xp := v_xp + coalesce((select ac.xp from lugu.achievements ac where ac.id = v_ach.achievement_id), 0);
    end loop;
  end if;

  if v_a.open_lesson_ids is not null then
    v_next := lugu.selection_current_lesson(v_a);
  else
    select l.sequence into v_seq from lugu.curriculum_lessons l where l.id = v_s.lesson_id;
    select l.id into v_next from lugu.curriculum_lessons l
    where l.version_id = v_a.curriculum_version_id and l.sequence > v_seq and l.status <> 'archived'
    order by l.sequence limit 1;
  end if;

  insert into lugu.program_events (assignment_id, kind, from_lesson_id, to_lesson_id, actor_id)
  values (v_a.id, 'lesson_completed', v_s.lesson_id, v_next, v_uid);
  if v_next is null then
    update lugu.program_assignments a set status = 'completed', current_lesson_id = null where a.id = v_a.id
    returning * into v_a;
    insert into lugu.program_events (assignment_id, kind, from_lesson_id, actor_id)
    values (v_a.id, 'program_completed', v_s.lesson_id, v_uid);
  else
    update lugu.program_assignments a set current_lesson_id = v_next where a.id = v_a.id
    returning * into v_a;
  end if;

  return jsonb_build_object(
    'completed', true, 'already_completed', false, 'kind', 'primary', 'xp_awarded', v_xp, 'achievements', v_awarded,
    'stars', v_stars,
    'next_lesson_id', v_a.current_lesson_id, 'assignment_status', v_a.status);
end $$;

-- Sets (or clears, with null) the open lessons and moves the current lesson to the first open one not
-- completed. Lessons must belong to the assignment's version. Logged as a program event and audited.
create function lugu.admin_set_open_lessons(assignment_id uuid, lesson_ids uuid[], note text default null)
returns lugu.program_assignments
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_assignment uuid := assignment_id;
  v_ids uuid[];
  v_note text := nullif(btrim(note), '');
  v_admin uuid := lugu.require_admin();
  v_a lugu.program_assignments;
  v_from uuid[];
  v_prev uuid;
  v_next uuid;
begin
  select * into v_a from lugu.program_assignments a where a.id = v_assignment for update;
  if not found then
    raise exception 'LUGU_ASSIGNMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_a.status = 'archived' then
    raise exception 'LUGU_ASSIGNMENT_ARCHIVED' using errcode = 'P0001';
  end if;
  if lesson_ids is not null then
    select coalesce(array_agg(l.id order by l.sequence), '{}') into v_ids from lugu.curriculum_lessons l
    where l.version_id = v_a.curriculum_version_id and l.status <> 'archived' and l.id = any (lesson_ids);
    if cardinality(v_ids) <> (select count(distinct x) from unnest(lesson_ids) x) then
      raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001', detail = 'lesson not in program';
    end if;
  end if;
  v_from := v_a.open_lesson_ids;
  v_prev := v_a.current_lesson_id;
  update lugu.program_assignments a set open_lesson_ids = v_ids, open_through_sequence = null
  where a.id = v_a.id returning * into v_a;

  if v_ids is not null then
    v_next := lugu.selection_current_lesson(v_a);
    if v_next is not null and v_next is distinct from v_prev then
      update lugu.learning_sessions s set status = 'abandoned', last_seen_at = now()
      where s.assignment_id = v_a.id and s.kind = 'primary' and s.status = 'active' and s.lesson_id = v_prev;
      update lugu.program_assignments a
      set current_lesson_id = v_next, status = case when a.status = 'completed' then 'active' else a.status end
      where a.id = v_a.id returning * into v_a;
    end if;
  end if;

  insert into lugu.program_events (assignment_id, kind, from_lesson_id, to_lesson_id, actor_id, note)
  values (v_a.id, 'open_lessons', v_prev, v_a.current_lesson_id, v_admin,
          coalesce(v_note, case when v_ids is null then 'Tüm dersler açık'
                                else cardinality(v_ids) || ' ders açık' end));
  perform lugu.audit('admin_set_open_lessons', 'program_assignments', v_a.id::text,
    jsonb_build_object('from', v_from, 'to', v_ids, 'note', v_note));
  return v_a;
end $$;

-- 0012 RPC kept for an old frontend: "open through N" = a selection of lessons 1..N.
create or replace function lugu.admin_set_lesson_gate(assignment_id uuid, open_through integer, note text default null)
returns lugu.program_assignments
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_a lugu.program_assignments;
begin
  select * into v_a from lugu.program_assignments a where a.id = admin_set_lesson_gate.assignment_id;
  return lugu.admin_set_open_lessons(admin_set_lesson_gate.assignment_id,
    case when open_through is null then null else coalesce((
      select array_agg(l.id) from lugu.curriculum_lessons l
      where l.version_id = v_a.curriculum_version_id and l.status <> 'archived' and l.sequence <= open_through), '{}') end,
    note);
end $$;

revoke all on function lugu.selection_current_lesson(lugu.program_assignments) from public, anon, authenticated;
revoke all on function lugu.admin_set_open_lessons(uuid, uuid[], text) from public, anon;
grant execute on function lugu.admin_set_open_lessons(uuid, uuid[], text) to authenticated;
