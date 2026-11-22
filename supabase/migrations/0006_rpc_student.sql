-- 0006 student RPCs. Every learning-state write a student can make goes through these functions.
-- Public RPCs keep the contract's argument names (for supabase-js named args); bodies copy them into
-- v_* locals and use `#variable_conflict use_column` so unqualified names in SQL are always columns.

-- ───────────────────────── grading (authoritative; mirrored by src/domain/grading.ts) ─────────────────────────

create function lugu.grade_response(question jsonb, response jsonb) returns boolean
language sql immutable parallel safe set search_path = '' as $$
  select coalesce(case question ->> 'type'
    -- The response is the index into the original (unshuffled) options.
    when 'choice' then
      case when jsonb_typeof(response) = 'number' and jsonb_typeof(question -> 'answer') = 'number'
           then (response #>> '{}')::numeric = trunc((response #>> '{}')::numeric)
                and (response #>> '{}')::numeric = (question ->> 'answer')::numeric
           else false end
    -- Tokens come from the question itself, so they are compared exactly, element by element.
    when 'order' then
      jsonb_typeof(response) = 'array' and jsonb_typeof(question -> 'answer') = 'array'
      and response = question -> 'answer'
    when 'text' then
      case when jsonb_typeof(response) = 'string' and jsonb_typeof(question -> 'accept') = 'array'
                and lugu.normalize_answer(response #>> '{}') <> ''
           then exists (select 1 from jsonb_array_elements_text(question -> 'accept') a
                        where lugu.normalize_answer(a) = lugu.normalize_answer(response #>> '{}'))
           else false end
    else false end, false)
$$;

create function lugu.grade_vocab(item jsonb, direction text, chosen text) returns boolean
language sql immutable parallel safe set search_path = '' as $$
  select coalesce(
    lugu.normalize_answer(chosen) <> ''
    and lugu.normalize_answer(chosen) = lugu.normalize_answer(
      case direction when 'en_tr' then item ->> 'tr' when 'tr_en' then item ->> 'en' end),
    false)
$$;

-- ───────────────────────── package helpers ─────────────────────────

create function lugu.section_keys() returns text[]
language sql immutable parallel safe set search_path = '' as $$
  select array['review', 'vocabulary', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment']
$$;

-- Every gradable question in a package with the section it belongs to.
create function lugu.package_questions(content jsonb) returns table (section text, question jsonb)
language sql immutable parallel safe set search_path = '' as $$
  select 'review', q from jsonb_array_elements(coalesce(content #> '{review,questions}', '[]')) q
  union all
  select 'story', q from jsonb_array_elements(coalesce(content #> '{story,questions}', '[]')) q
  union all
  select 'explanation', s -> 'check' from jsonb_array_elements(coalesce(content #> '{explanation,steps}', '[]')) s
  where jsonb_typeof(s -> 'check') = 'object'
  union all
  select 'homework', g -> k from jsonb_array_elements(coalesce(content #> '{homework,groups}', '[]')) g
  cross join unnest(array['complete', 'order', 'meaning']) k
  union all
  select 'assessment', q from jsonb_array_elements(coalesce(content #> '{assessment,quiz}', '[]')) q
  union all
  select 'assessment', q from jsonb_array_elements(coalesce(content #> '{assessment,reading,questions}', '[]')) q
$$;

-- review is optional; a section whose completion rule is switched off is optional too.
create function lugu.section_required(content jsonb, section text) returns boolean
language sql immutable parallel safe set search_path = '' as $$
  select case section
    when 'review' then false
    when 'vocab_quiz' then coalesce((content #>> '{completion,requireVocabMastery}')::boolean, true)
    when 'story' then coalesce((content #>> '{completion,requireStory}')::boolean, true)
    when 'homework' then coalesce((content #>> '{completion,requireHomework}')::boolean, true)
    when 'assessment' then coalesce((content #>> '{completion,requireAssessment}')::boolean, true)
    else true end
$$;

create function lugu.strip_assessment_question(q jsonb) returns jsonb
language sql volatile set search_path = '' as $$
  -- Order tokens are shuffled here because an author may have stored them in answer order.
  select case when q ->> 'type' = 'order'
    then (q - 'answer' - 'hint' - 'explain')
         || jsonb_build_object('tokens', (select jsonb_agg(t order by random()) from jsonb_array_elements(q -> 'tokens') t))
    else q - 'answer' - 'accept' - 'hint' - 'explain' end
$$;

create function lugu.strip_assessment_keys(content jsonb) returns jsonb
language sql volatile set search_path = '' as $$
  select jsonb_set(
    jsonb_set(content, '{assessment,quiz}',
      (select coalesce(jsonb_agg(lugu.strip_assessment_question(q) order by o), '[]')
       from jsonb_array_elements(coalesce(content #> '{assessment,quiz}', '[]')) with ordinality t (q, o))),
    '{assessment,reading,questions}',
    (select coalesce(jsonb_agg(lugu.strip_assessment_question(q) order by o), '[]')
     from jsonb_array_elements(coalesce(content #> '{assessment,reading,questions}', '[]')) with ordinality t (q, o)))
$$;

-- ───────────────────────── access helpers ─────────────────────────

-- The student's assignment that contains the lesson (open ones first), and the lesson's derived state.
create function lugu.lesson_access(p_student_id uuid, p_lesson_id uuid)
returns table (assignment_id uuid, assignment_status text, is_current boolean, is_completed boolean)
language sql stable security definer set search_path = '' as $$
  select a.id, a.status, a.current_lesson_id is not distinct from l.id,
         exists (select 1 from lugu.lesson_completion_records r where r.assignment_id = a.id and r.lesson_id = l.id)
  from lugu.curriculum_lessons l
  join lugu.program_assignments a on a.curriculum_version_id = l.version_id and a.student_id = p_student_id
  where l.id = p_lesson_id and a.status <> 'archived'
  order by case a.status when 'active' then 0 when 'paused' then 1 else 2 end, a.created_at desc
  limit 1
$$;

-- Loads and locks the caller's session, enforcing account, session, assignment and lesson state.
create function lugu.student_session(p_session_id uuid) returns lugu.learning_sessions
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
  elsif v_a.status not in ('active', 'completed') then
    raise exception 'LUGU_ASSIGNMENT_NOT_ACTIVE' using errcode = 'P0001';
  end if;
  return v_s;
end $$;

create function lugu.session_content(p_session lugu.learning_sessions) returns jsonb
language sql stable security definer set search_path = '' as $$
  select p.content from lugu.lesson_content_packages p where p.id = p_session.package_id
$$;

create function lugu.section_unlocked(p_session_id uuid, p_content jsonb, p_section text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (
    select 1 from unnest(lugu.section_keys()) with ordinality k (sec, idx)
    where idx < array_position(lugu.section_keys(), p_section)
      and lugu.section_required(p_content, sec)
      and not exists (
        select 1 from lugu.session_section_progress p
        where p.session_id = p_session_id and p.section = k.sec and p.status = 'completed'))
$$;

-- Replay sessions do not touch vocabulary_mastery, so their mastery is derived from the session's own attempts:
-- streaks restart at each miss; an item is mastered once any streak reaches two.
create function lugu.session_vocab_state(p_session_id uuid, p_item_id text)
returns table (correct_count integer, mastered boolean)
language sql stable security definer set search_path = '' as $$
  with a as (
    select qa.correct, qa.created_at,
           count(*) filter (where not qa.correct) over (order by qa.created_at, qa.id) as grp
    from lugu.question_attempts qa
    where qa.session_id = p_session_id and qa.section = 'vocab_quiz' and qa.question_id = p_item_id
  ), b as (
    select grp, sum(case when correct then 1 else 0 end) over (partition by grp order by created_at) as streak
    from a
  )
  select coalesce((select sum(case when a.correct then 1 else 0 end) from a where a.grp = (select max(grp) from a)), 0)::int,
         coalesce((select bool_or(b.streak >= 2) from b), false)
$$;

create function lugu.section_criteria_met(p_session lugu.learning_sessions, p_content jsonb, p_section text) returns boolean
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

create function lugu.require_section(p_section text) returns void
language plpgsql immutable set search_path = '' as $$
begin
  if p_section is null or not (p_section = any (lugu.section_keys())) then
    raise exception 'LUGU_INVALID_SECTION' using errcode = 'P0001';
  end if;
end $$;

create function lugu.session_payload(p_session_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'session', (select to_jsonb(s) from lugu.learning_sessions s where s.id = p_session_id),
    'sections', coalesce((
      select jsonb_agg(to_jsonb(p) order by array_position(lugu.section_keys(), p.section))
      from lugu.session_section_progress p where p.session_id = p_session_id), '[]'::jsonb))
$$;

-- ───────────────────────── read RPCs ─────────────────────────

create function lugu.student_home() returns jsonb
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
                        where p.lesson_id = l.id and p.status = 'published'))
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

create function lugu.student_learning_map(assignment_id uuid) returns jsonb
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
    'assignment', jsonb_build_object('id', v_a.id, 'status', v_a.status, 'current_lesson_id', v_a.current_lesson_id),
    'lessons', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id, 'sequence', x.sequence, 'title', x.title, 'estimated_minutes', x.estimated_minutes,
        'state', case
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

create function lugu.student_lesson_content(lesson_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_lesson_id uuid := lesson_id;
  v_uid uuid := lugu.require_active_student();
  v_acc record;
  v_pkg lugu.lesson_content_packages;
begin
  select * into v_acc from lugu.lesson_access(v_uid, v_lesson_id);
  if not found then
    raise exception 'LUGU_LESSON_NOT_ASSIGNED' using errcode = 'P0001';
  end if;
  if not ((v_acc.is_current and v_acc.assignment_status = 'active')
          or (v_acc.is_completed and v_acc.assignment_status in ('active', 'completed'))) then
    raise exception 'LUGU_LESSON_LOCKED' using errcode = 'P0001';
  end if;
  -- An open session stays on the revision it started with, even if a newer one was published since.
  select p.* into v_pkg
  from lugu.learning_sessions s join lugu.lesson_content_packages p on p.id = s.package_id
  where s.student_id = v_uid and s.lesson_id = v_lesson_id and s.status = 'active'
  order by (s.kind = 'primary') desc
  limit 1;
  if not found then
    select p.* into v_pkg from lugu.lesson_content_packages p
    where p.lesson_id = v_lesson_id and p.status = 'published';
  end if;
  if v_pkg.id is null then
    raise exception 'LUGU_NO_PUBLISHED_PACKAGE' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'package_id', v_pkg.id, 'lesson_id', v_pkg.lesson_id, 'revision', v_pkg.revision,
    'content', lugu.strip_assessment_keys(v_pkg.content));
end $$;

-- ───────────────────────── session RPCs ─────────────────────────

create function lugu.start_or_resume_session(lesson_id uuid, kind text default 'primary') returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_lesson_id uuid := lesson_id;
  v_kind text := kind;
  v_uid uuid := lugu.require_active_student();
  v_acc record;
  v_s lugu.learning_sessions;
  v_package_id uuid;
begin
  if v_kind is null or v_kind not in ('primary', 'replay') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_acc from lugu.lesson_access(v_uid, v_lesson_id);
  if not found then
    raise exception 'LUGU_LESSON_NOT_ASSIGNED' using errcode = 'P0001';
  end if;
  if v_kind = 'primary' then
    if v_acc.assignment_status <> 'active' then
      raise exception 'LUGU_ASSIGNMENT_NOT_ACTIVE' using errcode = 'P0001';
    end if;
    if not v_acc.is_current then
      if v_acc.is_completed then
        raise exception 'LUGU_USE_REPLAY' using errcode = 'P0001';
      end if;
      raise exception 'LUGU_LESSON_LOCKED' using errcode = 'P0001';
    end if;
  else
    if v_acc.assignment_status not in ('active', 'completed') then
      raise exception 'LUGU_ASSIGNMENT_NOT_ACTIVE' using errcode = 'P0001';
    end if;
    if not v_acc.is_completed then
      raise exception 'LUGU_REPLAY_NOT_AVAILABLE' using errcode = 'P0001';
    end if;
  end if;

  select * into v_s from lugu.learning_sessions s
  where s.student_id = v_uid and s.lesson_id = v_lesson_id and s.kind = v_kind and s.status = 'active';

  if not found then
    select p.id into v_package_id from lugu.lesson_content_packages p
    where p.lesson_id = v_lesson_id and p.status = 'published';
    if v_package_id is null then
      raise exception 'LUGU_NO_PUBLISHED_PACKAGE' using errcode = 'P0001';
    end if;
    insert into lugu.learning_sessions (student_id, assignment_id, lesson_id, package_id, kind)
    values (v_uid, v_acc.assignment_id, v_lesson_id, v_package_id, v_kind)
    on conflict do nothing
    returning * into v_s;
    if v_s.id is null then
      -- A concurrent call created it first.
      select * into v_s from lugu.learning_sessions s
      where s.student_id = v_uid and s.lesson_id = v_lesson_id and s.kind = v_kind and s.status = 'active';
    else
      insert into lugu.session_section_progress (session_id, section)
      select v_s.id, k from unnest(lugu.section_keys()) k;
    end if;
  else
    update lugu.learning_sessions s set last_seen_at = now() where s.id = v_s.id;
  end if;
  return lugu.session_payload(v_s.id);
end $$;

create function lugu.save_section_state(session_id uuid, section text, state jsonb, active_seconds_delta integer default 0)
returns void
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_section text := section;
  v_state jsonb := state;
  -- Clients save every few seconds; a larger delta is a clock jump or tampering, not study time.
  v_delta integer := greatest(0, least(coalesce(active_seconds_delta, 0), 600));
  v_s lugu.learning_sessions;
begin
  perform lugu.require_section(v_section);
  v_s := lugu.student_session(v_session_id);
  if v_state is null or jsonb_typeof(v_state) <> 'object' then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  if octet_length(v_state::text) > 262144 then
    raise exception 'LUGU_STATE_TOO_LARGE' using errcode = 'P0001';
  end if;
  if not lugu.section_unlocked(v_s.id, lugu.session_content(v_s), v_section) then
    raise exception 'LUGU_SECTION_LOCKED' using errcode = 'P0001';
  end if;
  update lugu.session_section_progress p set
    state = v_state,
    status = case when p.status = 'not_started' then 'in_progress' else p.status end,
    started_at = coalesce(p.started_at, now()),
    active_seconds = p.active_seconds + v_delta
  where p.session_id = v_s.id and p.section = v_section;
  update lugu.learning_sessions s set
    current_section = v_section, last_seen_at = now(), active_seconds = s.active_seconds + v_delta
  where s.id = v_s.id;
  update lugu.break_sessions b set next_section_started_at = now()
  where b.session_id = v_s.id and b.ended_at is not null and b.next_section_started_at is null
    and b.after_section <> v_section;
end $$;

create function lugu.record_answer(
  session_id uuid, section text, question_id text, response jsonb,
  response_ms integer default null, hint_used boolean default false)
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
  v_s lugu.learning_sessions;
  v_content jsonb;
  v_q jsonb;
  v_correct boolean;
  v_no integer;
begin
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
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms, hint_used)
  values (v_s.id, v_s.student_id, v_s.package_id, v_section, v_question_id, v_no, v_response, v_correct, v_ms, v_hint);
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
  session_id uuid, item_id text, direction text, chosen text, response_ms integer default null)
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
  v_content jsonb;
  v_item jsonb;
  v_expected text;
  v_correct boolean;
  v_no integer;
  v_count integer;
  v_mastered boolean;
begin
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
    (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms)
  values (v_s.id, v_s.student_id, v_s.package_id, 'vocab_quiz', v_item_id, v_no,
          jsonb_build_object('direction', v_direction, 'chosen', v_chosen), v_correct, v_ms);

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

create function lugu.submit_assessment(session_id uuid, answers jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_answers jsonb := answers;
  v_s lugu.learning_sessions;
  v_content jsonb;
  v_graded jsonb;
  v_qc integer; v_qt integer; v_rc integer; v_rt integer;
  v_qp numeric; v_rp numeric; v_p numeric;
begin
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
     quiz_percent, reading_percent, percent, answers)
  values (v_s.id, v_s.student_id, v_s.package_id, v_qc, v_qt, v_rc, v_rt, v_qp, v_rp, v_p, v_graded);

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

create function lugu.record_session_event(session_id uuid, kind text, data jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_kind text := kind;
  v_data jsonb := coalesce(data, '{}'::jsonb);
  v_s lugu.learning_sessions;
  v_idle integer;
begin
  if v_kind is null or v_kind not in ('visibility_hidden', 'visibility_visible', 'fullscreen_exit', 'leave_warning',
                                      'interrupted', 'resumed', 'idle_start', 'idle_end') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  if jsonb_typeof(v_data) <> 'object' or octet_length(v_data::text) > 4096 then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  v_s := lugu.student_session(v_session_id);
  insert into lugu.session_events (session_id, student_id, kind, data) values (v_s.id, v_s.student_id, v_kind, v_data);
  if v_kind = 'idle_end' and jsonb_typeof(v_data -> 'idle_seconds') = 'number' then
    v_idle := greatest(0, least((v_data ->> 'idle_seconds')::numeric, 7200))::int;
    update lugu.learning_sessions s set idle_seconds = s.idle_seconds + v_idle, last_seen_at = now() where s.id = v_s.id;
  else
    update lugu.learning_sessions s set last_seen_at = now() where s.id = v_s.id;
  end if;
end $$;

create function lugu.start_break(session_id uuid, after_section text, planned_minutes integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_after text := after_section;
  v_minutes integer := planned_minutes;
  v_s lugu.learning_sessions;
  v_b lugu.break_sessions;
begin
  perform lugu.require_section(v_after);
  if v_minutes is null or v_minutes not in (0, 10, 15, 20, 30) then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  v_s := lugu.student_session(v_session_id);
  if exists (select 1 from lugu.break_sessions b where b.session_id = v_s.id and b.ended_at is null) then
    raise exception 'LUGU_BREAK_ALREADY_OPEN' using errcode = 'P0001';
  end if;
  insert into lugu.break_sessions (session_id, student_id, after_section, planned_minutes)
  values (v_s.id, v_s.student_id, v_after, v_minutes)
  returning * into v_b;
  return to_jsonb(v_b);
end $$;

create function lugu.end_break(break_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_break_id uuid := break_id;
  v_uid uuid := lugu.require_active_student();
  v_b lugu.break_sessions;
begin
  select * into v_b from lugu.break_sessions b where b.id = v_break_id and b.student_id = v_uid for update;
  if not found then
    raise exception 'LUGU_BREAK_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_b.ended_at is null then
    update lugu.break_sessions b set
      ended_at = now(),
      early_return = now() < b.started_at + make_interval(mins => b.planned_minutes)
    where b.id = v_b.id
    returning * into v_b;
    update lugu.learning_sessions s set
      break_seconds = s.break_seconds + least(extract(epoch from v_b.ended_at - v_b.started_at)::int, 86400),
      last_seen_at = now()
    where s.id = v_b.session_id;
  end if;
  return to_jsonb(v_b);
end $$;

create function lugu.complete_section(session_id uuid, section text) returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_session_id uuid := session_id;
  v_section text := section;
  v_s lugu.learning_sessions;
  v_content jsonb;
  v_p lugu.session_section_progress;
begin
  perform lugu.require_section(v_section);
  v_s := lugu.student_session(v_session_id);
  v_content := lugu.session_content(v_s);
  select * into v_p from lugu.session_section_progress p where p.session_id = v_s.id and p.section = v_section;
  if v_p.status = 'completed' then
    return to_jsonb(v_p);
  end if;
  if not lugu.section_unlocked(v_s.id, v_content, v_section) then
    raise exception 'LUGU_SECTION_LOCKED' using errcode = 'P0001';
  end if;
  if not lugu.section_criteria_met(v_s, v_content, v_section) then
    raise exception 'LUGU_SECTION_CRITERIA_NOT_MET' using errcode = 'P0001';
  end if;
  update lugu.session_section_progress p set
    status = 'completed', completed_at = now(), started_at = coalesce(p.started_at, now())
  where p.id = v_p.id
  returning * into v_p;
  update lugu.learning_sessions s set last_seen_at = now() where s.id = v_s.id;
  return to_jsonb(v_p);
end $$;

create function lugu.complete_lesson(session_id uuid) returns jsonb
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
begin
  select * into v_s from lugu.learning_sessions s where s.id = v_session_id and s.student_id = v_uid;
  if not found then
    raise exception 'LUGU_SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_s.status = 'completed' then
    select * into v_a from lugu.program_assignments a where a.id = v_s.assignment_id;
    return jsonb_build_object(
      'completed', true, 'already_completed', true, 'kind', v_s.kind, 'xp_awarded', 0, 'achievements', '[]'::jsonb,
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

  update lugu.learning_sessions s set status = 'completed', completed_at = now(), last_seen_at = now()
  where s.id = v_s.id;

  select * into v_a from lugu.program_assignments a where a.id = v_s.assignment_id for update;
  if v_s.kind = 'replay' then
    return jsonb_build_object(
      'completed', true, 'already_completed', false, 'kind', 'replay', 'xp_awarded', 0, 'achievements', '[]'::jsonb,
      'next_lesson_id', v_a.current_lesson_id, 'assignment_status', v_a.status);
  end if;

  -- A lesson the admin moved the student back to is taken again as a normal primary session and gets its own
  -- record; rewards are granted only for the student's first completion of that lesson.
  v_first := not exists (select 1 from lugu.lesson_completion_records r
                         where r.student_id = v_uid and r.lesson_id = v_s.lesson_id);
  insert into lugu.lesson_completion_records (assignment_id, lesson_id, student_id, session_id, package_id, summary)
  values (v_a.id, v_s.lesson_id, v_uid, v_s.id, v_s.package_id, jsonb_build_object(
    'assessment_percent', v_percent,
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
    'next_lesson_id', v_a.current_lesson_id, 'assignment_status', v_a.status);
end $$;

-- ───────────────────────── schools & profile ─────────────────────────

create function lugu.search_schools(q text) returns setof lugu.schools
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_key text := lugu.fold_key(q);
begin
  if auth.uid() is null or not exists (select 1 from lugu.profiles p where p.user_id = auth.uid()) then
    raise exception 'LUGU_FORBIDDEN' using errcode = 'P0001';
  end if;
  if length(v_key) < 2 then
    return;
  end if;
  return query
    select s.* from lugu.schools s
    where s.merged_into_id is null
      and (lugu.fold_key(s.name) || ' ' || lugu.fold_key(s.city) || ' ' || lugu.fold_key(s.district))
          like '%' || v_key || '%'
    order by (lugu.fold_key(s.name) like v_key || '%') desc, s.name
    limit 10;
end $$;

create function lugu.add_school(name text, city text, district text default null, country text default 'Türkiye')
returns lugu.schools
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_name text := regexp_replace(btrim(coalesce(name, '')), '\s+', ' ', 'g');
  v_city text := regexp_replace(btrim(coalesce(city, '')), '\s+', ' ', 'g');
  v_district text := nullif(regexp_replace(btrim(coalesce(district, '')), '\s+', ' ', 'g'), '');
  v_country text := coalesce(nullif(regexp_replace(btrim(coalesce(country, '')), '\s+', ' ', 'g'), ''), 'Türkiye');
  v_row lugu.schools;
  v_hops integer := 0;
begin
  if not lugu.is_admin() then
    perform lugu.require_active_student();
  end if;
  if length(lugu.fold_key(v_name)) < 2 or v_city = '' or length(v_name) > 200 or length(v_city) > 100
     or length(v_district) > 100 then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  insert into lugu.schools (name, city, district, country) values (v_name, v_city, v_district, v_country)
  on conflict on constraint schools_normalized_key_key do nothing
  returning * into v_row;
  if v_row.id is null then
    select * into v_row from lugu.schools s
    where s.normalized_key = lugu.school_key(v_name, v_city, v_district, v_country);
  end if;
  while v_row.merged_into_id is not null and v_hops < 10 loop
    select * into v_row from lugu.schools s where s.id = v_row.merged_into_id;
    v_hops := v_hops + 1;
  end loop;
  return v_row;
end $$;

create function lugu.update_my_profile(
  first_name text default null, last_name text default null, display_name text default null,
  grade integer default null, school_id uuid default null, avatar_key text default null)
returns lugu.student_profiles
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_first text := nullif(btrim(first_name), '');
  v_last text := nullif(btrim(last_name), '');
  v_display text := nullif(btrim(display_name), '');
  v_grade integer := grade;
  v_school uuid := school_id;
  v_avatar text := nullif(btrim(avatar_key), '');
  v_uid uuid := lugu.require_active_student();
  v_row lugu.student_profiles;
begin
  if v_school is not null then
    select coalesce(s.merged_into_id, s.id) into v_school from lugu.schools s where s.id = v_school;
    if v_school is null then
      raise exception 'LUGU_SCHOOL_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;
  begin
    update lugu.student_profiles sp set
      first_name = coalesce(v_first, sp.first_name),
      last_name = coalesce(v_last, sp.last_name),
      display_name = coalesce(v_display, sp.display_name),
      grade = coalesce(v_grade, sp.grade),
      school_id = coalesce(v_school, sp.school_id),
      avatar_key = coalesce(v_avatar, sp.avatar_key)
    where sp.user_id = v_uid
    returning * into v_row;
  exception when check_violation then
    raise exception 'LUGU_INVALID_PROFILE' using errcode = 'P0001';
  end;
  if v_row.user_id is null then
    raise exception 'LUGU_NOT_STUDENT' using errcode = 'P0001';
  end if;
  if v_row.profile_completed_at is null and v_row.first_name is not null and v_row.grade is not null
     and v_row.school_id is not null and v_row.avatar_key is not null then
    update lugu.student_profiles sp set profile_completed_at = now() where sp.user_id = v_uid
    returning * into v_row;
  end if;
  return v_row;
end $$;

create function lugu.mark_password_changed() returns void
language plpgsql security definer set search_path = '' as $$
begin
  update lugu.profiles p set must_change_password = false where p.user_id = auth.uid();
  if not found then
    raise exception 'LUGU_FORBIDDEN' using errcode = 'P0001';
  end if;
end $$;

-- ───────────────────────── privileges ─────────────────────────

revoke all on all functions in schema lugu from public;
revoke all on all functions in schema lugu from anon;
grant execute on function lugu.is_admin(), lugu.current_student_id(), lugu.student_has_version(uuid) to authenticated;
grant execute on function
  lugu.student_home(),
  lugu.student_learning_map(uuid),
  lugu.student_lesson_content(uuid),
  lugu.start_or_resume_session(uuid, text),
  lugu.save_section_state(uuid, text, jsonb, integer),
  lugu.complete_section(uuid, text),
  lugu.record_answer(uuid, text, text, jsonb, integer, boolean),
  lugu.record_vocab_answer(uuid, text, text, text, integer),
  lugu.submit_assessment(uuid, jsonb),
  lugu.record_session_event(uuid, text, jsonb),
  lugu.start_break(uuid, text, integer),
  lugu.end_break(uuid),
  lugu.complete_lesson(uuid),
  lugu.search_schools(text),
  lugu.add_school(text, text, text, text),
  lugu.update_my_profile(text, text, text, integer, uuid, text),
  lugu.mark_password_changed()
to authenticated;
