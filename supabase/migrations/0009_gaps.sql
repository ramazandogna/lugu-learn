-- 0009 gaps found while building the frontends: review items from earlier lessons, open break lookup,
-- explanation completion rule, atomic lesson reorder and new revision, reviewed academic insights,
-- ai_jobs.speaking_session_id, lesson stars.

-- ───────────────────────── tables ─────────────────────────

create table lugu.academic_insights (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'reviewed')),
  ai_job_id uuid references lugu.ai_jobs (id) on delete set null,
  reviewed_by uuid default auth.uid() references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index academic_insights_student_idx on lugu.academic_insights (student_id, created_at desc);
create index academic_insights_ai_job_idx on lugu.academic_insights (ai_job_id);
create trigger academic_insights_updated_at before update on lugu.academic_insights
  for each row execute function lugu.set_updated_at();
alter table lugu.academic_insights enable row level security;
create policy academic_insights_admin on lugu.academic_insights for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
grant select, insert, update, delete on lugu.academic_insights to authenticated;

alter table lugu.ai_jobs
  add column speaking_session_id uuid references lugu.speaking_sessions (id) on delete set null;
create index ai_jobs_speaking_session_idx on lugu.ai_jobs (speaking_session_id);

-- ───────────────────────── helpers ─────────────────────────

create function lugu.lesson_stars(p_percent numeric) returns integer
language sql immutable parallel safe set search_path = '' as $$
  select case when p_percent >= 90 then 3 when p_percent >= 70 then 2 else 1 end
$$;

-- Weak vocabulary from the student's earlier lessons of the assignment that holds p_lesson_id.
create function lugu.review_candidates(p_student_id uuid, p_lesson_id uuid)
returns table (package_id uuid, item_id text, item jsonb, incorrect_count integer, last_attempt_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.package_id, m.item_id, v, m.incorrect_count, m.last_attempt_at
  from lugu.curriculum_lessons cur
  join lugu.curriculum_lessons l on l.version_id = cur.version_id and l.sequence < cur.sequence
  join lugu.lesson_content_packages p on p.lesson_id = l.id
  join lugu.vocabulary_mastery m on m.package_id = p.id and m.student_id = p_student_id
  cross join lateral (
    select x from jsonb_array_elements(coalesce(p.content -> 'vocabulary', '[]')) x where x ->> 'id' = m.item_id
  ) i (v)
  where cur.id = p_lesson_id and m.incorrect_count > 0
  order by m.incorrect_count desc, m.last_attempt_at desc nulls last
  limit 6
$$;

-- ───────────────────────── student RPCs ─────────────────────────

create function lugu.student_review_items(lesson_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_lesson_id uuid := lesson_id;
  v_uid uuid := lugu.require_active_student();
begin
  if not exists (select 1 from lugu.lesson_access(v_uid, v_lesson_id)) then
    raise exception 'LUGU_LESSON_NOT_ASSIGNED' using errcode = 'P0001';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'package_id', c.package_id, 'item_id', c.item_id, 'en', c.item ->> 'en', 'tr', c.item ->> 'tr',
      'example', c.item -> 'example', 'incorrect_count', c.incorrect_count, 'last_attempt_at', c.last_attempt_at)
      order by c.incorrect_count desc, c.last_attempt_at desc nulls last)
    from lugu.review_candidates(v_uid, v_lesson_id) c), '[]'::jsonb);
end $$;

-- Review answers on earlier items are recorded as attempts (section 'review', the item's own package);
-- they do not change vocabulary_mastery, which belongs to that item's lesson.
create function lugu.record_review_answer(session_id uuid, package_id uuid, item_id text, chosen text, response_ms integer default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_package_id uuid := package_id;
  v_item_id text := item_id;
  v_chosen text := coalesce(chosen, '');
  v_ms integer := case when response_ms between 0 and 3600000 then response_ms end;
  v_s lugu.learning_sessions;
  v_item jsonb;
  v_correct boolean;
  v_no integer;
begin
  v_s := lugu.student_session(v_session_id);
  select c.item into v_item from lugu.review_candidates(v_s.student_id, v_s.lesson_id) c
  where c.package_id = v_package_id and c.item_id = v_item_id;
  if v_item is null then
    raise exception 'LUGU_ITEM_NOT_FOUND' using errcode = 'P0001';
  end if;
  v_correct := lugu.grade_vocab(v_item, 'en_tr', v_chosen);
  select count(*) + 1 into v_no from lugu.question_attempts qa
  where qa.session_id = v_s.id and qa.section = 'review' and qa.question_id = v_item_id;
  insert into lugu.question_attempts
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms)
  values (v_s.id, v_s.student_id, v_package_id, 'review', v_item_id, v_no,
          jsonb_build_object('direction', 'en_tr', 'chosen', v_chosen), v_correct, v_ms);
  update lugu.session_section_progress p set
    attempts_count = p.attempts_count + 1,
    correct_count = p.correct_count + case when v_correct then 1 else 0 end,
    status = case when p.status = 'not_started' then 'in_progress' else p.status end,
    started_at = coalesce(p.started_at, now())
  where p.session_id = v_s.id and p.section = 'review';
  return jsonb_build_object('correct', v_correct, 'expected', v_item ->> 'tr', 'attempt_no', v_no);
end $$;

create function lugu.student_open_break(session_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_uid uuid := lugu.current_student_id();
begin
  if v_uid is null then
    raise exception 'LUGU_NOT_STUDENT' using errcode = 'P0001';
  end if;
  return (select to_jsonb(b) from lugu.break_sessions b
          where b.session_id = v_session_id and b.student_id = v_uid and b.ended_at is null
          order by b.started_at desc limit 1);
end $$;

-- Explanation: every step's check question attempted at least once.
create or replace function lugu.section_criteria_met(p_session lugu.learning_sessions, p_content jsonb, p_section text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  if not lugu.section_required(p_content, p_section) then
    return true;
  end if;
  case p_section
    when 'vocab_quiz' then
      if p_session.kind = 'primary' then
        return not exists (
          select 1 from jsonb_array_elements(p_content -> 'vocabulary') v
          where not exists (
            select 1 from lugu.vocabulary_mastery m
            where m.student_id = p_session.student_id and m.package_id = p_session.package_id
              and m.item_id = v ->> 'id' and m.mastered_at is not null));
      end if;
      return not exists (
        select 1 from jsonb_array_elements(p_content -> 'vocabulary') v
        where not (select st.mastered from lugu.session_vocab_state(p_session.id, v ->> 'id') st));
    when 'story' then
      return not exists (
        select 1 from jsonb_array_elements(p_content #> '{story,questions}') q
        where not exists (
          select 1 from lugu.question_attempts qa
          where qa.session_id = p_session.id and qa.section = 'story' and qa.question_id = q ->> 'id'));
    when 'explanation' then
      return not exists (
        select 1 from jsonb_array_elements(coalesce(p_content #> '{explanation,steps}', '[]')) s
        where jsonb_typeof(s -> 'check') = 'object' and not exists (
          select 1 from lugu.question_attempts qa
          where qa.session_id = p_session.id and qa.section = 'explanation' and qa.question_id = s #>> '{check,id}'));
    when 'homework' then
      return not exists (
        select 1 from jsonb_array_elements(p_content #> '{homework,groups}') g
        cross join unnest(array['complete', 'order', 'meaning']) k
        where not exists (
          select 1 from lugu.question_attempts qa
          where qa.session_id = p_session.id and qa.section = 'homework'
            and qa.question_id = g -> k ->> 'id' and qa.correct));
    when 'assessment' then
      return exists (select 1 from lugu.assessment_results r where r.session_id = p_session.id);
    else
      return true;
  end case;
end $$;

-- Adds `stars` to the result and to the completion record summary.
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
  select * into v_s from lugu.learning_sessions s where s.id = v_session_id and s.student_id = v_uid;
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

  -- A lesson the admin moved the student back to is taken again as a normal primary session and gets its own
  -- record; rewards are granted only for the student's first completion of that lesson.
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

  select l.sequence into v_seq from lugu.curriculum_lessons l where l.id = v_s.lesson_id;
  select l.id into v_next from lugu.curriculum_lessons l
  where l.version_id = v_a.curriculum_version_id and l.sequence > v_seq and l.status <> 'archived'
  order by l.sequence limit 1;

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

-- ───────────────────────── admin RPCs ─────────────────────────

create function lugu.admin_reorder_lessons(version_id uuid, lesson_ids uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_version uuid := version_id;
  v_ids uuid[] := lesson_ids;
  v_admin uuid := lugu.require_admin();
  v_status text;
begin
  select v.status into v_status from lugu.curriculum_versions v where v.id = v_version for update;
  if v_status is null then
    raise exception 'LUGU_VERSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_status <> 'draft' then
    raise exception 'LUGU_VERSION_LOCKED' using errcode = 'P0001';
  end if;
  -- The list must be exactly the version's lessons, each once.
  if v_ids is null or cardinality(v_ids) <> (select count(distinct x) from unnest(v_ids) x)
     or (select array_agg(l.id order by l.id) from lugu.curriculum_lessons l where l.version_id = v_version)
        is distinct from (select array_agg(x order by x) from unnest(v_ids) x) then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  set constraints lugu.curriculum_lessons_version_sequence_key deferred;
  update lugu.curriculum_lessons l set sequence = o.ord
  from unnest(v_ids) with ordinality o (id, ord)
  where l.id = o.id and l.sequence <> o.ord;
  set constraints lugu.curriculum_lessons_version_sequence_key immediate;
  perform lugu.audit('admin_reorder_lessons', 'curriculum_versions', v_version::text,
    jsonb_build_object('lesson_ids', to_jsonb(v_ids)));
end $$;

create function lugu.admin_new_revision(package_id uuid, content jsonb) returns lugu.lesson_content_packages
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_package uuid := package_id;
  v_content jsonb := content;
  v_admin uuid := lugu.require_admin();
  v_src lugu.lesson_content_packages;
  v_new lugu.lesson_content_packages;
begin
  if v_content is null or jsonb_typeof(v_content) <> 'object' then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_src from lugu.lesson_content_packages p where p.id = v_package;
  if not found then
    raise exception 'LUGU_PACKAGE_NOT_FOUND' using errcode = 'P0001';
  end if;
  -- Serialises concurrent revisions of the same lesson (revision = max + 1 in the trigger).
  perform 1 from lugu.curriculum_lessons l where l.id = v_src.lesson_id for update;
  insert into lugu.lesson_content_packages (lesson_id, status, content, origin, created_by)
  values (v_src.lesson_id, 'draft', v_content, 'manual', v_admin)
  returning * into v_new;
  insert into lugu.lesson_admin_material (package_id, teacher_guide, speaking_plan, visual_plan, qa_report)
  select v_new.id, m.teacher_guide, m.speaking_plan, m.visual_plan, m.qa_report
  from lugu.lesson_admin_material m where m.package_id = v_src.id;
  perform lugu.audit('admin_new_revision', 'lesson_content_packages', v_new.id::text,
    jsonb_build_object('from_package_id', v_src.id, 'lesson_id', v_src.lesson_id, 'revision', v_new.revision));
  return v_new;
end $$;

revoke all on all functions in schema lugu from public;
revoke all on all functions in schema lugu from anon;
grant execute on function
  lugu.student_review_items(uuid),
  lugu.record_review_answer(uuid, uuid, text, text, integer),
  lugu.student_open_break(uuid),
  lugu.admin_reorder_lessons(uuid, uuid[]),
  lugu.admin_new_revision(uuid, jsonb)
to authenticated;
