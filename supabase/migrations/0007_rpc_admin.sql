-- 0007 admin RPCs. Each checks lugu.is_admin() (via require_admin) and writes admin_audit_logs.
-- Plain CRUD on admin tables goes through RLS; these cover changes that must stay consistent or be logged.

-- Structural backstop for publishing; the full LessonPackage schema is enforced in the app/edge function.
create function lugu.package_is_well_formed(content jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(
    content ->> 'schemaVersion' = '1'
    and jsonb_typeof(content -> 'meta') = 'object'
    and jsonb_typeof(content -> 'vocabulary') = 'array' and jsonb_array_length(content -> 'vocabulary') >= 3
    and jsonb_typeof(content #> '{story,questions}') = 'array'
    and jsonb_typeof(content #> '{explanation,steps}') = 'array'
    and jsonb_typeof(content #> '{homework,groups}') = 'array' and jsonb_array_length(content #> '{homework,groups}') >= 1
    and jsonb_typeof(content #> '{assessment,quiz}') = 'array'
    and jsonb_typeof(content #> '{assessment,reading,questions}') = 'array'
    and not exists (
      select 1 from jsonb_array_elements(content -> 'vocabulary') v
      where coalesce(v ->> 'id', '') = '' or coalesce(v ->> 'en', '') = '' or coalesce(v ->> 'tr', '') = '')
    and not exists (
      select 1 from lugu.package_questions(content) q
      where jsonb_typeof(q.question) <> 'object' or coalesce(q.question ->> 'id', '') = ''
         or coalesce(q.question ->> 'type', '') not in ('choice', 'order', 'text'))
    and (select count(*) = count(distinct x.id) from (
           select q.question ->> 'id' as id from lugu.package_questions(content) q
           union all
           select v ->> 'id' from jsonb_array_elements(content -> 'vocabulary') v) x),
    false)
$$;

create function lugu.next_lesson_after(p_version_id uuid, p_sequence integer) returns uuid
language sql stable security definer set search_path = '' as $$
  select l.id from lugu.curriculum_lessons l
  where l.version_id = p_version_id and l.sequence > p_sequence and l.status <> 'archived'
  order by l.sequence limit 1
$$;

create function lugu.previous_lesson_before(p_version_id uuid, p_sequence integer) returns uuid
language sql stable security definer set search_path = '' as $$
  select l.id from lugu.curriculum_lessons l
  where l.version_id = p_version_id and l.sequence < p_sequence and l.status <> 'archived'
  order by l.sequence desc limit 1
$$;

create function lugu.admin_assign_program(student_id uuid, version_id uuid, start_lesson_id uuid default null)
returns lugu.program_assignments
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_student uuid := student_id;
  v_version uuid := version_id;
  v_start uuid := start_lesson_id;
  v_admin uuid := lugu.require_admin();
  v_row lugu.program_assignments;
begin
  if not exists (select 1 from lugu.student_profiles sp where sp.user_id = v_student) then
    raise exception 'LUGU_STUDENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not exists (select 1 from lugu.curriculum_versions v where v.id = v_version and v.status = 'published') then
    raise exception 'LUGU_VERSION_NOT_PUBLISHED' using errcode = 'P0001';
  end if;
  if v_start is null then
    v_start := lugu.next_lesson_after(v_version, 0);
  elsif not exists (select 1 from lugu.curriculum_lessons l
                    where l.id = v_start and l.version_id = v_version and l.status <> 'archived') then
    raise exception 'LUGU_LESSON_NOT_IN_PROGRAM' using errcode = 'P0001';
  end if;
  if v_start is null then
    raise exception 'LUGU_VERSION_EMPTY' using errcode = 'P0001';
  end if;
  begin
    insert into lugu.program_assignments (student_id, curriculum_version_id, start_lesson_id, current_lesson_id, assigned_by)
    values (v_student, v_version, v_start, v_start, v_admin)
    returning * into v_row;
  exception when unique_violation then
    raise exception 'LUGU_ALREADY_ASSIGNED' using errcode = 'P0001';
  end;
  insert into lugu.program_events (assignment_id, kind, to_lesson_id, actor_id)
  values (v_row.id, 'assigned', v_start, v_admin);
  perform lugu.audit('admin_assign_program', 'program_assignments', v_row.id::text,
    jsonb_build_object('student_id', v_student, 'version_id', v_version, 'start_lesson_id', v_start));
  return v_row;
end $$;

create function lugu.admin_set_progress(assignment_id uuid, action text, lesson_id uuid default null, note text default null)
returns lugu.program_assignments
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_assignment uuid := assignment_id;
  v_action text := action;
  v_lesson uuid := lesson_id;
  v_note text := nullif(btrim(note), '');
  v_admin uuid := lugu.require_admin();
  v_a lugu.program_assignments;
  v_from uuid;
  v_to uuid;
  v_seq integer;
  v_status text;
begin
  if v_action is null or v_action not in
     ('forward', 'backward', 'set_lesson', 'restart_lesson', 'pause', 'resume', 'archive') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_a from lugu.program_assignments a where a.id = v_assignment for update;
  if not found then
    raise exception 'LUGU_ASSIGNMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_a.status = 'archived' then
    raise exception 'LUGU_ASSIGNMENT_ARCHIVED' using errcode = 'P0001';
  end if;
  v_from := v_a.current_lesson_id;
  v_to := v_from;
  v_status := v_a.status;
  select l.sequence into v_seq from lugu.curriculum_lessons l where l.id = v_from;

  case v_action
    when 'forward' then
      if v_from is null then
        raise exception 'LUGU_NO_NEXT_LESSON' using errcode = 'P0001';
      end if;
      v_to := lugu.next_lesson_after(v_a.curriculum_version_id, v_seq);
      if v_to is null then
        raise exception 'LUGU_NO_NEXT_LESSON' using errcode = 'P0001';
      end if;
    when 'backward' then
      -- From a completed program, "back" reopens its last lesson.
      v_to := lugu.previous_lesson_before(v_a.curriculum_version_id, coalesce(v_seq, 2147483647));
      if v_to is null then
        raise exception 'LUGU_NO_PREVIOUS_LESSON' using errcode = 'P0001';
      end if;
      if v_status = 'completed' then v_status := 'active'; end if;
    when 'set_lesson' then
      if v_lesson is null or not exists (
           select 1 from lugu.curriculum_lessons l
           where l.id = v_lesson and l.version_id = v_a.curriculum_version_id and l.status <> 'archived') then
        raise exception 'LUGU_LESSON_NOT_IN_PROGRAM' using errcode = 'P0001';
      end if;
      v_to := v_lesson;
      if v_status = 'completed' then v_status := 'active'; end if;
    when 'restart_lesson' then
      if v_from is null then
        raise exception 'LUGU_NO_CURRENT_LESSON' using errcode = 'P0001';
      end if;
    when 'pause' then
      if v_status <> 'active' then
        raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
      end if;
      v_status := 'paused';
    when 'resume' then
      if v_status <> 'paused' then
        raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
      end if;
      v_status := 'active';
    when 'archive' then
      v_status := 'archived';
  end case;

  -- Sessions are abandoned, never deleted: their attempts stay in the history.
  if v_action = 'archive' then
    update lugu.learning_sessions s set status = 'abandoned'
    where s.assignment_id = v_a.id and s.status = 'active';
  elsif v_action = 'restart_lesson' then
    update lugu.learning_sessions s set status = 'abandoned'
    where s.assignment_id = v_a.id and s.status = 'active' and s.kind = 'primary' and s.lesson_id = v_from;
  elsif v_action in ('forward', 'backward', 'set_lesson') then
    update lugu.learning_sessions s set status = 'abandoned'
    where s.assignment_id = v_a.id and s.status = 'active' and s.kind = 'primary'
      and s.lesson_id is distinct from v_to;
  end if;

  update lugu.program_assignments a set current_lesson_id = v_to, status = v_status
  where a.id = v_a.id
  returning * into v_a;

  insert into lugu.program_events (assignment_id, kind, from_lesson_id, to_lesson_id, actor_id, note)
  values (v_a.id, v_action, v_from, v_to, v_admin, v_note);
  perform lugu.audit('admin_set_progress', 'program_assignments', v_a.id::text,
    jsonb_build_object('action', v_action, 'from_lesson_id', v_from, 'to_lesson_id', v_to, 'note', v_note));
  return v_a;
end $$;

create function lugu.admin_set_package_status(package_id uuid, status text) returns lugu.lesson_content_packages
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_package uuid := package_id;
  v_status text := status;
  v_admin uuid := lugu.require_admin();
  v_p lugu.lesson_content_packages;
  v_old text;
begin
  if v_status is null or v_status not in ('draft', 'ai_generated', 'qa', 'review', 'approved', 'published', 'archived') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_p from lugu.lesson_content_packages p where p.id = v_package for update;
  if not found then
    raise exception 'LUGU_PACKAGE_NOT_FOUND' using errcode = 'P0001';
  end if;
  v_old := v_p.status;
  if v_old = v_status then
    return v_p;
  end if;
  if v_old = 'published' and v_status <> 'archived' then
    raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if v_old = 'archived' and v_p.published_at is not null then
    raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if v_status = 'published' then
    if v_old <> 'approved' then
      raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
    end if;
    if not lugu.package_is_well_formed(v_p.content) then
      raise exception 'LUGU_PACKAGE_INVALID' using errcode = 'P0001';
    end if;
    update lugu.lesson_content_packages p set status = 'archived'
    where p.lesson_id = v_p.lesson_id and p.status = 'published';
  end if;
  update lugu.lesson_content_packages p set status = v_status where p.id = v_p.id returning * into v_p;
  perform lugu.audit('admin_set_package_status', 'lesson_content_packages', v_p.id::text,
    jsonb_build_object('from', v_old, 'to', v_status, 'lesson_id', v_p.lesson_id, 'revision', v_p.revision));
  return v_p;
end $$;

create function lugu.admin_publish_version(version_id uuid) returns lugu.curriculum_versions
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_version uuid := version_id;
  v_admin uuid := lugu.require_admin();
  v_v lugu.curriculum_versions;
begin
  select * into v_v from lugu.curriculum_versions v where v.id = v_version for update;
  if not found then
    raise exception 'LUGU_VERSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_v.status <> 'draft' then
    raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if not exists (select 1 from lugu.curriculum_lessons l where l.version_id = v_v.id and l.status <> 'archived') then
    raise exception 'LUGU_VERSION_EMPTY' using errcode = 'P0001';
  end if;
  update lugu.curriculum_versions v set status = 'published', published_at = now() where v.id = v_v.id
  returning * into v_v;
  update lugu.curricula c set status = 'active' where c.id = v_v.curriculum_id and c.status = 'draft';
  perform lugu.audit('admin_publish_version', 'curriculum_versions', v_v.id::text,
    jsonb_build_object('curriculum_id', v_v.curriculum_id, 'version', v_v.version));
  return v_v;
end $$;

-- Copies the latest version's objectives, lessons (ids remapped) and each lesson's published package with its
-- admin material. Copied packages are published inside a draft version, which no student can be assigned yet.
create function lugu.admin_new_version(curriculum_id uuid) returns lugu.curriculum_versions
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_curriculum uuid := curriculum_id;
  v_admin uuid := lugu.require_admin();
  v_src lugu.curriculum_versions;
  v_new lugu.curriculum_versions;
  v_obj_map jsonb := '{}'::jsonb;
  v_lesson_map jsonb := '{}'::jsonb;
  v_r record;
  v_id uuid;
  v_pkg uuid;
begin
  perform 1 from lugu.curricula c where c.id = v_curriculum for update;
  if not found then
    raise exception 'LUGU_CURRICULUM_NOT_FOUND' using errcode = 'P0001';
  end if;
  select * into v_src from lugu.curriculum_versions v where v.curriculum_id = v_curriculum
  order by v.version desc limit 1;

  insert into lugu.curriculum_versions (curriculum_id, version, status, notes, created_by)
  values (v_curriculum, coalesce(v_src.version, 0) + 1, 'draft',
          case when v_src.id is not null then 'v' || v_src.version || ' kopyası' end, v_admin)
  returning * into v_new;

  if v_src.id is not null then
    for v_r in select * from lugu.curriculum_objectives o where o.version_id = v_src.id order by o.sort, o.code loop
      insert into lugu.curriculum_objectives (version_id, code, text, sort)
      values (v_new.id, v_r.code, v_r.text, v_r.sort) returning id into v_id;
      v_obj_map := v_obj_map || jsonb_build_object(v_r.id::text, v_id);
    end loop;

    for v_r in select * from lugu.curriculum_lessons l where l.version_id = v_src.id order by l.sequence loop
      insert into lugu.curriculum_lessons
        (version_id, sequence, title, objective_ids, estimated_minutes, status, source_notes)
      values (v_new.id, v_r.sequence, v_r.title,
              array(select (v_obj_map ->> x::text)::uuid from unnest(v_r.objective_ids) x where v_obj_map ? x::text),
              v_r.estimated_minutes, v_r.status, v_r.source_notes)
      returning id into v_id;
      v_lesson_map := v_lesson_map || jsonb_build_object(v_r.id::text, v_id);

      select p.id into v_pkg from lugu.lesson_content_packages p where p.lesson_id = v_r.id and p.status = 'published';
      if v_pkg is not null then
        with ins as (
          insert into lugu.lesson_content_packages (lesson_id, revision, status, content, origin, created_by)
          select v_id, 1, 'published', p.content, p.origin, v_admin from lugu.lesson_content_packages p where p.id = v_pkg
          returning id)
        insert into lugu.lesson_admin_material (package_id, teacher_guide, speaking_plan, visual_plan, qa_report)
        select ins.id, m.teacher_guide, m.speaking_plan, m.visual_plan, m.qa_report
        from ins left join lugu.lesson_admin_material m on m.package_id = v_pkg;
      end if;
    end loop;

    update lugu.curriculum_lessons l set prerequisite_ids = array(
      select (v_lesson_map ->> x::text)::uuid
      from lugu.curriculum_lessons o, unnest(o.prerequisite_ids) x
      where o.id = (select (key)::uuid from jsonb_each_text(v_lesson_map) e where e.value = l.id::text)
        and v_lesson_map ? x::text)
    where l.version_id = v_new.id;
  end if;

  perform lugu.audit('admin_new_version', 'curriculum_versions', v_new.id::text,
    jsonb_build_object('curriculum_id', v_curriculum, 'version', v_new.version, 'copied_from', v_src.id));
  return v_new;
end $$;

create function lugu.admin_merge_schools(from_id uuid, into_id uuid) returns lugu.schools
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_from uuid := from_id;
  v_into uuid := into_id;
  v_admin uuid := lugu.require_admin();
  v_target lugu.schools;
  v_moved integer;
begin
  if v_from is null or v_into is null or v_from = v_into then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_target from lugu.schools s where s.id = v_into for update;
  if not found or v_target.merged_into_id is not null then
    raise exception 'LUGU_SCHOOL_NOT_FOUND' using errcode = 'P0001';
  end if;
  perform 1 from lugu.schools s where s.id = v_from for update;
  if not found then
    raise exception 'LUGU_SCHOOL_NOT_FOUND' using errcode = 'P0001';
  end if;
  update lugu.student_profiles sp set school_id = v_into where sp.school_id = v_from;
  get diagnostics v_moved = row_count;
  update lugu.schools s set merged_into_id = v_into where s.merged_into_id = v_from;
  update lugu.schools s set merged_into_id = v_into where s.id = v_from;
  perform lugu.audit('admin_merge_schools', 'schools', v_into::text,
    jsonb_build_object('from_id', v_from, 'into_id', v_into, 'students_moved', v_moved));
  return v_target;
end $$;

-- Called by the admin-students edge function with the service role, after it verified the caller is an admin.
create function lugu.next_student_code() returns text
language sql security definer set search_path = '' as $$
  select 'LUGU-' || nextval('lugu.student_code_seq')::text
$$;

revoke all on all functions in schema lugu from public;
revoke all on all functions in schema lugu from anon;
grant execute on function
  lugu.admin_assign_program(uuid, uuid, uuid),
  lugu.admin_set_progress(uuid, text, uuid, text),
  lugu.admin_set_package_status(uuid, text),
  lugu.admin_publish_version(uuid),
  lugu.admin_new_version(uuid),
  lugu.admin_merge_schools(uuid, uuid)
to authenticated;
revoke execute on function lugu.next_student_code() from authenticated;
grant execute on function lugu.next_student_code() to service_role;
