-- 0010 QA fixes: idempotent answer RPCs (client ids), verified password change, lesson source notes
-- hidden from students, complete_lesson lock order, no listing policy on the public asset bucket.

-- ───────────────────────── idempotent attempts ─────────────────────────

alter table lugu.question_attempts add column client_id uuid;
create unique index question_attempts_client_id_key on lugu.question_attempts (student_id, client_id)
  where client_id is not null;
alter table lugu.assessment_results add column client_id uuid;
create unique index assessment_results_client_id_key on lugu.assessment_results (student_id, client_id)
  where client_id is not null;

-- Signatures change (new trailing argument), so the old overloads go first.
drop function lugu.record_answer(uuid, text, text, jsonb, integer, boolean);
drop function lugu.record_vocab_answer(uuid, text, text, text, integer);
drop function lugu.record_review_answer(uuid, uuid, text, text, integer);
drop function lugu.submit_assessment(uuid, jsonb);

create function lugu.record_answer(
  session_id uuid, section text, question_id text, response jsonb,
  response_ms integer default null, hint_used boolean default false, client_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_section text := section;
  v_question_id text := question_id;
  v_response jsonb := coalesce(response, 'null'::jsonb);
  v_ms integer := case when response_ms between 0 and 3600000 then response_ms end;
  v_hint boolean := coalesce(hint_used, false);
  v_client uuid := client_id;
  v_prev lugu.question_attempts;
  v_s lugu.learning_sessions;
  v_content jsonb;
  v_q jsonb;
  v_correct boolean;
  v_no integer;
begin
  -- A retried call (same client id) returns the first result and writes nothing.
  select * into v_prev from lugu.question_attempts qa where qa.student_id = auth.uid() and qa.client_id = v_client;
  if v_client is not null and v_prev.id is not null then
    select pq.question into v_q
    from lugu.lesson_content_packages p, lugu.package_questions(p.content) pq
    where p.id = v_prev.package_id and pq.section = v_prev.section and pq.question ->> 'id' = v_prev.question_id;
    return jsonb_build_object('correct', v_prev.correct,
      'expected', case v_q ->> 'type' when 'text' then v_q #> '{accept,0}' else v_q -> 'answer' end,
      'attempt_no', v_prev.attempt_no);
  end if;
  perform lugu.require_section(v_section);
  if v_section = 'assessment' then
    raise exception 'LUGU_USE_SUBMIT_ASSESSMENT' using errcode = 'P0001';
  end if;
  if v_section = 'vocab_quiz' then
    raise exception 'LUGU_USE_VOCAB_ANSWER' using errcode = 'P0001';
  end if;
  if v_section = 'vocabulary' then
    raise exception 'LUGU_INVALID_SECTION' using errcode = 'P0001';
  end if;
  v_s := lugu.student_session(v_session_id);
  v_content := lugu.session_content(v_s);
  if not lugu.section_unlocked(v_s.id, v_content, v_section) then
    raise exception 'LUGU_SECTION_LOCKED' using errcode = 'P0001';
  end if;
  select pq.question into v_q from lugu.package_questions(v_content) pq
  where pq.section = v_section and pq.question ->> 'id' = v_question_id;
  if v_q is null then
    raise exception 'LUGU_QUESTION_NOT_FOUND' using errcode = 'P0001';
  end if;
  v_correct := lugu.grade_response(v_q, v_response);
  select count(*) + 1 into v_no from lugu.question_attempts qa
  where qa.session_id = v_s.id and qa.section = v_section and qa.question_id = v_question_id;
  insert into lugu.question_attempts
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms, hint_used, client_id)
  values (v_s.id, v_s.student_id, v_s.package_id, v_section, v_question_id, v_no, v_response, v_correct, v_ms, v_hint, v_client);
  update lugu.session_section_progress p set
    attempts_count = p.attempts_count + 1,
    correct_count = p.correct_count + case when v_correct then 1 else 0 end,
    status = case when p.status = 'not_started' then 'in_progress' else p.status end,
    started_at = coalesce(p.started_at, now())
  where p.session_id = v_s.id and p.section = v_section;
  update lugu.learning_sessions s set last_seen_at = now() where s.id = v_s.id;
  return jsonb_build_object(
    'correct', v_correct,
    'expected', case v_q ->> 'type' when 'text' then v_q #> '{accept,0}' else v_q -> 'answer' end,
    'attempt_no', v_no);
end $$;

create function lugu.record_vocab_answer(
  session_id uuid, item_id text, direction text, chosen text, response_ms integer default null, client_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_item_id text := item_id;
  v_direction text := direction;
  v_chosen text := coalesce(chosen, '');
  v_ms integer := case when response_ms between 0 and 3600000 then response_ms end;
  v_s lugu.learning_sessions;
  v_client uuid := client_id;
  v_prev lugu.question_attempts;
  v_content jsonb;
  v_item jsonb;
  v_expected text;
  v_correct boolean;
  v_no integer;
  v_count integer;
  v_mastered boolean;
begin
  select * into v_prev from lugu.question_attempts qa where qa.student_id = auth.uid() and qa.client_id = v_client;
  if v_client is not null and v_prev.id is not null then
    -- Retry: report the current state; nothing is written and mastery is untouched.
    select s.* into v_s from lugu.learning_sessions s where s.id = v_prev.session_id;
    select v into v_item from lugu.lesson_content_packages p, jsonb_array_elements(p.content -> 'vocabulary') v
    where p.id = v_prev.package_id and v ->> 'id' = v_prev.question_id;
    if v_s.kind = 'primary' then
      select m.correct_count, m.mastered_at is not null into v_count, v_mastered from lugu.vocabulary_mastery m
      where m.student_id = v_prev.student_id and m.package_id = v_prev.package_id and m.item_id = v_prev.question_id;
    else
      select st.correct_count, st.mastered into v_count, v_mastered from lugu.session_vocab_state(v_s.id, v_prev.question_id) st;
    end if;
    return jsonb_build_object('correct', v_prev.correct, 'mastered', coalesce(v_mastered, false),
      'correct_count', coalesce(v_count, 0),
      'expected', case v_prev.response ->> 'direction' when 'en_tr' then v_item ->> 'tr' else v_item ->> 'en' end);
  end if;
  if v_direction is null or v_direction not in ('en_tr', 'tr_en') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  v_s := lugu.student_session(v_session_id);
  v_content := lugu.session_content(v_s);
  if not lugu.section_unlocked(v_s.id, v_content, 'vocab_quiz') then
    raise exception 'LUGU_SECTION_LOCKED' using errcode = 'P0001';
  end if;
  select v into v_item from jsonb_array_elements(v_content -> 'vocabulary') v where v ->> 'id' = v_item_id;
  if v_item is null then
    raise exception 'LUGU_ITEM_NOT_FOUND' using errcode = 'P0001';
  end if;
  v_expected := case v_direction when 'en_tr' then v_item ->> 'tr' else v_item ->> 'en' end;
  v_correct := lugu.grade_vocab(v_item, v_direction, v_chosen);

  select count(*) + 1 into v_no from lugu.question_attempts qa
  where qa.session_id = v_s.id and qa.section = 'vocab_quiz' and qa.question_id = v_item_id;
  insert into lugu.question_attempts
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms, client_id)
  values (v_s.id, v_s.student_id, v_s.package_id, 'vocab_quiz', v_item_id, v_no,
          jsonb_build_object('direction', v_direction, 'chosen', v_chosen), v_correct, v_ms, v_client);

  if v_s.kind = 'primary' then
    -- Engine rule: mastered after two correct answers since the last miss; a miss resets the count.
    -- mastered_at is never cleared, so a mastered item stays mastered.
    insert into lugu.vocabulary_mastery as m
      (student_id, package_id, item_id, correct_count, incorrect_count, last_attempt_at)
    values (v_s.student_id, v_s.package_id, v_item_id,
            case when v_correct then 1 else 0 end, case when v_correct then 0 else 1 end, now())
    on conflict on constraint vocabulary_mastery_pkey do update set
      correct_count = case when v_correct then m.correct_count + 1 else 0 end,
      incorrect_count = m.incorrect_count + case when v_correct then 0 else 1 end,
      mastered_at = coalesce(m.mastered_at, case when v_correct and m.correct_count + 1 >= 2 then now() end),
      last_attempt_at = now()
    returning m.correct_count, m.mastered_at is not null into v_count, v_mastered;
  else
    select st.correct_count, st.mastered into v_count, v_mastered
    from lugu.session_vocab_state(v_s.id, v_item_id) st;
  end if;

  update lugu.session_section_progress p set
    attempts_count = p.attempts_count + 1,
    correct_count = p.correct_count + case when v_correct then 1 else 0 end,
    status = case when p.status = 'not_started' then 'in_progress' else p.status end,
    started_at = coalesce(p.started_at, now())
  where p.session_id = v_s.id and p.section = 'vocab_quiz';
  update lugu.learning_sessions s set last_seen_at = now() where s.id = v_s.id;
  return jsonb_build_object('correct', v_correct, 'mastered', v_mastered, 'correct_count', v_count, 'expected', v_expected);
end $$;

create function lugu.record_review_answer(session_id uuid, package_id uuid, item_id text, chosen text, response_ms integer default null, client_id uuid default null)
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
  v_client uuid := client_id;
  v_prev lugu.question_attempts;
  v_item jsonb;
  v_correct boolean;
  v_no integer;
begin
  select * into v_prev from lugu.question_attempts qa where qa.student_id = auth.uid() and qa.client_id = v_client;
  if v_client is not null and v_prev.id is not null then
    select v ->> 'tr' into v_chosen from lugu.lesson_content_packages p, jsonb_array_elements(p.content -> 'vocabulary') v
    where p.id = v_prev.package_id and v ->> 'id' = v_prev.question_id;
    return jsonb_build_object('correct', v_prev.correct, 'expected', v_chosen, 'attempt_no', v_prev.attempt_no);
  end if;
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
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms, client_id)
  values (v_s.id, v_s.student_id, v_package_id, 'review', v_item_id, v_no,
          jsonb_build_object('direction', 'en_tr', 'chosen', v_chosen), v_correct, v_ms, v_client);
  update lugu.session_section_progress p set
    attempts_count = p.attempts_count + 1,
    correct_count = p.correct_count + case when v_correct then 1 else 0 end,
    status = case when p.status = 'not_started' then 'in_progress' else p.status end,
    started_at = coalesce(p.started_at, now())
  where p.session_id = v_s.id and p.section = 'review';
  return jsonb_build_object('correct', v_correct, 'expected', v_item ->> 'tr', 'attempt_no', v_no);
end $$;

create function lugu.submit_assessment(session_id uuid, answers jsonb, client_id uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_answers jsonb := answers;
  v_s lugu.learning_sessions;
  v_client uuid := client_id;
  v_r lugu.assessment_results;
  v_content jsonb;
  v_graded jsonb;
  v_qc integer; v_qt integer; v_rc integer; v_rt integer;
  v_qp numeric; v_rp numeric; v_p numeric;
begin
  select r.* into v_r from lugu.assessment_results r
  where r.student_id = auth.uid() and r.client_id = v_client and r.session_id = v_session_id;
  if v_client is not null and v_r.id is not null then
    return jsonb_build_object(
      'quiz_correct', v_r.quiz_correct, 'quiz_total', v_r.quiz_total, 'reading_correct', v_r.reading_correct,
      'reading_total', v_r.reading_total, 'quiz_percent', v_r.quiz_percent, 'reading_percent', v_r.reading_percent,
      'percent', v_r.percent, 'results', (select jsonb_agg(x - 'response') from jsonb_array_elements(v_r.answers) x));
  end if;
  if v_answers is null or jsonb_typeof(v_answers) <> 'object' then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  v_s := lugu.student_session(v_session_id);
  v_content := lugu.session_content(v_s);
  if not lugu.section_unlocked(v_s.id, v_content, 'assessment') then
    raise exception 'LUGU_SECTION_LOCKED' using errcode = 'P0001';
  end if;
  if exists (select 1 from lugu.assessment_results r where r.session_id = v_s.id) then
    raise exception 'LUGU_ASSESSMENT_ALREADY_SUBMITTED' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'question_id', g.qid, 'part', g.part, 'response', g.resp, 'correct', g.correct) order by g.ord), '[]')
  into v_graded
  from (
    select q.part, q.ord, q.question ->> 'id' as qid,
           coalesce(v_answers -> (q.question ->> 'id'), 'null'::jsonb) as resp,
           lugu.grade_response(q.question, v_answers -> (q.question ->> 'id')) as correct
    from (
      select 'quiz' as part, o as ord, e as question
      from jsonb_array_elements(coalesce(v_content #> '{assessment,quiz}', '[]')) with ordinality t (e, o)
      union all
      select 'reading', 1000 + o, e
      from jsonb_array_elements(coalesce(v_content #> '{assessment,reading,questions}', '[]')) with ordinality t (e, o)
    ) q
  ) g;

  select count(*) filter (where (x ->> 'part') = 'quiz' and (x ->> 'correct')::boolean),
         count(*) filter (where (x ->> 'part') = 'quiz'),
         count(*) filter (where (x ->> 'part') = 'reading' and (x ->> 'correct')::boolean),
         count(*) filter (where (x ->> 'part') = 'reading')
  into v_qc, v_qt, v_rc, v_rt
  from jsonb_array_elements(v_graded) x;

  v_qp := case when v_qt = 0 then 0 else round(100.0 * v_qc / v_qt, 2) end;
  v_rp := case when v_rt = 0 then 0 else round(100.0 * v_rc / v_rt, 2) end;
  v_p := case when v_qt + v_rt = 0 then 0 else round(100.0 * (v_qc + v_rc) / (v_qt + v_rt), 2) end;

  insert into lugu.question_attempts
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct)
  select v_s.id, v_s.student_id, v_s.package_id, 'assessment', x ->> 'question_id', 1, x -> 'response',
         (x ->> 'correct')::boolean
  from jsonb_array_elements(v_graded) x;

  insert into lugu.assessment_results
    (session_id, student_id, package_id, quiz_correct, quiz_total, reading_correct, reading_total,
     quiz_percent, reading_percent, percent, answers, client_id)
  values (v_s.id, v_s.student_id, v_s.package_id, v_qc, v_qt, v_rc, v_rt, v_qp, v_rp, v_p, v_graded, v_client);

  update lugu.session_section_progress p set
    attempts_count = p.attempts_count + v_qt + v_rt,
    correct_count = p.correct_count + v_qc + v_rc,
    status = case when p.status = 'not_started' then 'in_progress' else p.status end,
    started_at = coalesce(p.started_at, now())
  where p.session_id = v_s.id and p.section = 'assessment';

  return jsonb_build_object(
    'quiz_correct', v_qc, 'quiz_total', v_qt, 'reading_correct', v_rc, 'reading_total', v_rt,
    'quiz_percent', v_qp, 'reading_percent', v_rp, 'percent', v_p,
    'results', (select jsonb_agg(x - 'response') from jsonb_array_elements(v_graded) x));
end $$;

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
  -- Locked before the status check, so a second tab waits and then gets the idempotent answer.
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

-- ───────────────────────── verified password change ─────────────────────────

-- Fingerprint of the Auth password hash at the moment must_change_password was set. Kept in its own
-- table (no policies) because students can read their own profiles row.
create table lugu.password_change_markers (
  user_id uuid primary key references lugu.profiles (user_id) on delete cascade,
  marker text,
  set_at timestamptz not null default now()
);
alter table lugu.password_change_markers enable row level security;

create function lugu.password_marker(p_user_id uuid) returns text
language sql stable security definer set search_path = '' as $$
  select md5(u.encrypted_password) from auth.users u where u.id = p_user_id
$$;

create function lugu.capture_password_marker() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.must_change_password and (tg_op = 'INSERT' or not old.must_change_password) then
    insert into lugu.password_change_markers (user_id, marker) values (new.user_id, lugu.password_marker(new.user_id))
    on conflict (user_id) do update set marker = excluded.marker, set_at = now();
  end if;
  return new;
end $$;
create trigger profiles_password_marker after insert or update of must_change_password on lugu.profiles
  for each row execute function lugu.capture_password_marker();

-- reset-password updates the Auth password and then sets the flag again (already true): refresh the marker.
create function lugu.refresh_password_marker(p_user_id uuid) returns void
language sql security definer set search_path = '' as $$
  insert into lugu.password_change_markers (user_id, marker) values (p_user_id, lugu.password_marker(p_user_id))
  on conflict (user_id) do update set marker = excluded.marker, set_at = now()
$$;

insert into lugu.password_change_markers (user_id, marker)
select p.user_id, lugu.password_marker(p.user_id) from lugu.profiles p where p.must_change_password
on conflict (user_id) do nothing;

create or replace function lugu.mark_password_changed() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_flag boolean;
  v_marker text;
begin
  select p.must_change_password into v_flag from lugu.profiles p where p.user_id = auth.uid();
  if v_flag is null then
    raise exception 'LUGU_FORBIDDEN' using errcode = 'P0001';
  end if;
  if not v_flag then
    return;
  end if;
  select m.marker into v_marker from lugu.password_change_markers m where m.user_id = auth.uid();
  if lugu.password_marker(auth.uid()) is not distinct from v_marker then
    raise exception 'LUGU_PASSWORD_NOT_CHANGED' using errcode = 'P0001';
  end if;
  update lugu.profiles p set must_change_password = false where p.user_id = auth.uid();
  delete from lugu.password_change_markers m where m.user_id = auth.uid();
end $$;

-- ───────────────────────── lesson notes hidden from students ─────────────────────────

-- RLS cannot hide a column and admins share the `authenticated` role, so students lose direct
-- SELECT on curriculum_lessons (it carries source_notes) and get the fields they need from RPCs.
drop policy curriculum_lessons_student_select on lugu.curriculum_lessons;

create function lugu.student_lesson_titles() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', l.id, 'title', l.title, 'sequence', l.sequence) order by l.sequence), '[]'::jsonb)
  from lugu.curriculum_lessons l
  where lugu.current_student_id() is not null and lugu.student_has_version(l.version_id)
$$;

-- ───────────────────────── storage ─────────────────────────

do $migration$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    -- Public bucket URLs do not need a SELECT policy; this one only allowed listing every asset.
    execute 'drop policy if exists "lesson-assets public read" on storage.objects';
  end if;
end
$migration$;

revoke all on all functions in schema lugu from public;
revoke all on all functions in schema lugu from anon;
grant execute on function
  lugu.record_answer(uuid, text, text, jsonb, integer, boolean, uuid),
  lugu.record_vocab_answer(uuid, text, text, text, integer, uuid),
  lugu.record_review_answer(uuid, uuid, text, text, integer, uuid),
  lugu.submit_assessment(uuid, jsonb, uuid),
  lugu.student_lesson_titles()
to authenticated;
revoke execute on function lugu.refresh_password_marker(uuid) from authenticated;
grant execute on function lugu.refresh_password_marker(uuid) to service_role;
