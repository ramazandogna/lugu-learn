-- 0011 subjects & student tasks: admin-managed subjects (short name/color, safe remove), exam-result topics, student tasks.

-- ───────────────────────── subjects ─────────────────────────

alter table lugu.school_subjects
  add column short_name text check (short_name is null or (btrim(short_name) <> '' and length(short_name) <= 20)),
  add column color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$');

-- ───────────────────────── exam result topics ─────────────────────────

create table lugu.school_exam_result_topics (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references lugu.school_exam_results (id) on delete cascade,
  topic text not null check (btrim(topic) <> '' and length(topic) <= 120),
  correct integer not null default 0 check (correct >= 0),
  incorrect integer not null default 0 check (incorrect >= 0),
  blank integer not null default 0 check (blank >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_exam_result_topics_key unique (result_id, topic)
);
create trigger school_exam_result_topics_updated_at before update on lugu.school_exam_result_topics
  for each row execute function lugu.set_updated_at();

-- ───────────────────────── student tasks ─────────────────────────

create table lugu.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  subject_id uuid references lugu.school_subjects (id) on delete set null,
  lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  title text not null check (btrim(title) <> '' and length(title) <= 200),
  description text check (length(description) <= 4000),
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  completed_at timestamptz,
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_tasks_completed_at check ((status = 'done') = (completed_at is not null))
);
create index student_tasks_student_idx on lugu.student_tasks (student_id, status, due_date);
create index student_tasks_subject_idx on lugu.student_tasks (subject_id);
create index student_tasks_lesson_idx on lugu.student_tasks (lesson_id);
create trigger student_tasks_updated_at before update on lugu.student_tasks
  for each row execute function lugu.set_updated_at();

-- ───────────────────────── RLS ─────────────────────────

alter table lugu.school_exam_result_topics enable row level security;
alter table lugu.student_tasks enable row level security;

create policy school_exam_result_topics_admin on lugu.school_exam_result_topics for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

-- Students read only their own tasks; no student write policy (status changes go through student_set_task_status).
create policy student_tasks_select on lugu.student_tasks for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());
create policy student_tasks_admin_write on lugu.student_tasks for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

grant select, insert, update, delete on lugu.school_exam_result_topics, lugu.student_tasks to authenticated;

-- ───────────────────────── admin RPCs ─────────────────────────

-- Add or edit a subject. p_subject_id null = create. Returns the row.
create function lugu.admin_upsert_subject(
  p_subject_id uuid, p_name text, p_short_name text default null, p_color text default null,
  p_sort integer default 0, p_active boolean default true)
returns lugu.school_subjects
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := btrim(p_name);
  v_admin uuid := lugu.require_admin();
  v_row lugu.school_subjects;
begin
  if v_name is null or v_name = '' or length(v_name) > 100 then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  if p_subject_id is null then
    insert into lugu.school_subjects (name, short_name, color, sort, active)
    values (v_name, p_short_name, p_color, coalesce(p_sort, 0), coalesce(p_active, true))
    returning * into v_row;
  else
    update lugu.school_subjects s
       set name = v_name, short_name = p_short_name, color = p_color,
           sort = coalesce(p_sort, s.sort), active = coalesce(p_active, s.active)
     where s.id = p_subject_id
    returning * into v_row;
    if not found then
      raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;
  perform lugu.audit('admin_upsert_subject', 'school_subjects', v_row.id::text,
    jsonb_build_object('name', v_row.name, 'active', v_row.active));
  return v_row;
end $$;
-- Duplicate name -> unique_violation (23505).

-- Remove a subject: hard delete when it has no exam results, otherwise archive (active = false). Returns 'deleted' | 'archived'.
create function lugu.admin_remove_subject(p_subject_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_admin uuid := lugu.require_admin();
  v_result text;
begin
  perform 1 from lugu.school_subjects s where s.id = p_subject_id for update;
  if not found then
    raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if exists (select 1 from lugu.school_exam_results r where r.subject_id = p_subject_id) then
    update lugu.school_subjects s set active = false where s.id = p_subject_id;
    v_result := 'archived';
  else
    delete from lugu.school_subjects s where s.id = p_subject_id;
    v_result := 'deleted';
  end if;
  perform lugu.audit('admin_remove_subject', 'school_subjects', p_subject_id::text, jsonb_build_object('result', v_result));
  return v_result;
end $$;

-- Assign a task to a student. Returns the row.
create function lugu.admin_assign_task(
  p_student_id uuid, p_title text, p_description text default null, p_due_date date default null,
  p_subject_id uuid default null, p_lesson_id uuid default null)
returns lugu.student_tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_admin uuid := lugu.require_admin();
  v_row lugu.student_tasks;
begin
  if btrim(coalesce(p_title, '')) = '' then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  perform 1 from lugu.student_profiles sp where sp.user_id = p_student_id;
  if not found then
    raise exception 'LUGU_STUDENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_subject_id is not null and not exists (select 1 from lugu.school_subjects s where s.id = p_subject_id) then
    raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_lesson_id is not null and not exists (select 1 from lugu.curriculum_lessons l where l.id = p_lesson_id) then
    raise exception 'LUGU_LESSON_NOT_IN_PROGRAM' using errcode = 'P0001';
  end if;
  insert into lugu.student_tasks (student_id, subject_id, lesson_id, title, description, due_date, assigned_by)
  values (p_student_id, p_subject_id, p_lesson_id, btrim(p_title), p_description, p_due_date, v_admin)
  returning * into v_row;
  perform lugu.audit('admin_assign_task', 'student_tasks', v_row.id::text,
    jsonb_build_object('student_id', p_student_id, 'title', v_row.title, 'due_date', v_row.due_date));
  return v_row;
end $$;

-- Edit a task or change its status as admin. null argument = unchanged. status 'done' sets completed_at, any other clears it.
create function lugu.admin_update_task(
  p_task_id uuid, p_title text default null, p_description text default null, p_due_date date default null,
  p_subject_id uuid default null, p_lesson_id uuid default null, p_status text default null)
returns lugu.student_tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_admin uuid := lugu.require_admin();
  v_row lugu.student_tasks;
begin
  if p_status is not null and p_status not in ('open', 'in_progress', 'done', 'cancelled') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  if p_subject_id is not null and not exists (select 1 from lugu.school_subjects s where s.id = p_subject_id) then
    raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_lesson_id is not null and not exists (select 1 from lugu.curriculum_lessons l where l.id = p_lesson_id) then
    raise exception 'LUGU_LESSON_NOT_IN_PROGRAM' using errcode = 'P0001';
  end if;
  update lugu.student_tasks t set
    title = coalesce(nullif(btrim(p_title), ''), t.title),
    description = coalesce(p_description, t.description),
    due_date = coalesce(p_due_date, t.due_date),
    subject_id = coalesce(p_subject_id, t.subject_id),
    lesson_id = coalesce(p_lesson_id, t.lesson_id),
    status = coalesce(p_status, t.status),
    completed_at = case when coalesce(p_status, t.status) = 'done' then coalesce(t.completed_at, now()) else null end
  where t.id = p_task_id
  returning * into v_row;
  if not found then
    raise exception 'LUGU_TASK_NOT_FOUND' using errcode = 'P0001';
  end if;
  perform lugu.audit('admin_update_task', 'student_tasks', p_task_id::text, jsonb_build_object('status', v_row.status));
  return v_row;
end $$;

-- Admin deletes a task (mistaken assignment). History-preserving alternative is status 'cancelled'.
create function lugu.admin_delete_task(p_task_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_admin uuid := lugu.require_admin();
begin
  delete from lugu.student_tasks t where t.id = p_task_id;
  if not found then
    raise exception 'LUGU_TASK_NOT_FOUND' using errcode = 'P0001';
  end if;
  perform lugu.audit('admin_delete_task', 'student_tasks', p_task_id::text, '{}'::jsonb);
end $$;

-- ───────────────────────── student RPCs ─────────────────────────

-- The caller's tasks (not cancelled); includes subject name and lesson title (never source_notes).
create function lugu.student_tasks() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', t.id, 'title', t.title, 'description', t.description, 'due_date', t.due_date,
      'status', t.status, 'completed_at', t.completed_at,
      'subject', s.name, 'lesson', l.title) order by t.due_date nulls last, t.created_at), '[]'::jsonb)
  from lugu.student_tasks t
  left join lugu.school_subjects s on s.id = t.subject_id
  left join lugu.curriculum_lessons l on l.id = t.lesson_id
  where lugu.current_student_id() is not null and t.student_id = auth.uid() and t.status <> 'cancelled'
$$;

-- The student marks their own task open/in_progress/done. cancelled is admin-only.
create function lugu.student_set_task_status(p_task_id uuid, p_status text) returns lugu.student_tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid := lugu.require_active_student();
  v_row lugu.student_tasks;
begin
  if p_status is null or p_status not in ('open', 'in_progress', 'done') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_row from lugu.student_tasks t where t.id = p_task_id and t.student_id = v_student for update;
  if not found then
    raise exception 'LUGU_TASK_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_row.status = 'cancelled' then
    raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  update lugu.student_tasks t set
    status = p_status,
    completed_at = case when p_status = 'done' then coalesce(t.completed_at, now()) else null end
  where t.id = p_task_id
  returning * into v_row;
  return v_row;
end $$;

-- ───────────────────────── grants ─────────────────────────

revoke all on all functions in schema lugu from public;
revoke all on all functions in schema lugu from anon;
grant execute on function
  lugu.admin_upsert_subject(uuid, text, text, text, integer, boolean),
  lugu.admin_remove_subject(uuid),
  lugu.admin_assign_task(uuid, text, text, date, uuid, uuid),
  lugu.admin_update_task(uuid, text, text, date, uuid, uuid, text),
  lugu.admin_delete_task(uuid),
  lugu.student_tasks(),
  lugu.student_set_task_status(uuid, text)
to authenticated;
