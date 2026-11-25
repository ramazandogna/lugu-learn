-- 0001 core: schema, privileges, shared helpers, identity, schools, settings, audit log.

create schema if not exists lugu;

-- Only signed-in users reach the schema; anon gets nothing at all.
revoke all on schema lugu from public;
grant usage on schema lugu to authenticated, service_role;

-- Per-schema default privileges cannot revoke the global EXECUTE-to-PUBLIC default, so every RPC
-- migration ends with an explicit `revoke ... from public, anon` and grants what the app may call.
alter default privileges in schema lugu grant all on tables to service_role;
alter default privileges in schema lugu grant all on sequences to service_role;
alter default privileges in schema lugu grant execute on functions to service_role;

-- ───────────────────────── shared helpers ─────────────────────────

create function lugu.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Answer normalisation. Mirrors normalizeAnswer() in src/domain/grading.ts step for step; the shared cases in
-- src/domain/grading-cases.ts are run against both. İ/I are mapped before lower() because lower('İ') is not 'i'
-- in every locale (JS gives 'i̇'). Whitespace is the JS \s class, which includes NBSP and other Unicode spaces.
create function lugu.normalize_answer(s text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select btrim(
    regexp_replace(
      btrim(regexp_replace(
        lower(translate(normalize(coalesce(s, ''), nfc), '’‘İI', '''''ii')),
        '[\s\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+', ' ', 'g')),
      '[.!?]+$', ''))
$$;

-- Search/dedupe key: Turkish letters folded to ASCII so "30 Agustos" matches "30 Ağustos".
create function lugu.fold_key(s text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select btrim(regexp_replace(
    regexp_replace(
      translate(lower(translate(normalize(coalesce(s, ''), nfc), 'İI', 'ii')), 'şğüöçıâîû', 'sguociaiu'),
      '[[:punct:]’‘]', '', 'g'),
    '\s+', ' ', 'g'))
$$;

create function lugu.school_key(p_name text, p_city text, p_district text, p_country text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select lugu.fold_key(p_name) || '|' || lugu.fold_key(p_city) || '|' || lugu.fold_key(p_district) || '|' || lugu.fold_key(p_country)
$$;

-- ───────────────────────── identity ─────────────────────────

create table lugu.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'student')),
  status text not null default 'active' check (status in ('active', 'paused', 'disabled')),
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on lugu.profiles
  for each row execute function lugu.set_updated_at();

create function lugu.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from lugu.profiles p
    where p.user_id = auth.uid() and p.role = 'admin' and p.status = 'active'
  )
$$;

-- Returns the caller's user id when the caller is a student (any status); null otherwise.
create function lugu.current_student_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.user_id from lugu.profiles p
  where p.user_id = auth.uid() and p.role = 'student'
$$;

-- For write RPCs: the caller must be an active student.
create function lugu.require_active_student() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare
  v_status text;
begin
  select p.status into v_status from lugu.profiles p
  where p.user_id = auth.uid() and p.role = 'student';
  if v_status is null then
    raise exception 'LUGU_NOT_STUDENT' using errcode = 'P0001';
  end if;
  if v_status <> 'active' then
    raise exception 'LUGU_ACCOUNT_INACTIVE' using errcode = 'P0001';
  end if;
  return auth.uid();
end $$;

create function lugu.require_admin() returns uuid
language plpgsql stable security definer set search_path = '' as $$
begin
  if not lugu.is_admin() then
    raise exception 'LUGU_FORBIDDEN' using errcode = 'P0001';
  end if;
  return auth.uid();
end $$;

-- ───────────────────────── settings & audit ─────────────────────────

create table lugu.system_settings (
  key text primary key check (key ~ '^[a-z0-9_.]+$'),
  value jsonb not null,
  description text,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
create trigger system_settings_updated_at before update on lugu.system_settings
  for each row execute function lugu.set_updated_at();

insert into lugu.system_settings (key, value, description) values
  ('academic.wrong_penalty', '0.25', 'Net = doğru − yanlış × bu değer'),
  ('rewards.lesson_xp', '100', 'XP granted for completing a lesson for the first time');

create function lugu.setting_numeric(p_key text, p_default numeric) returns numeric
language sql stable security definer set search_path = '' as $$
  select coalesce((select (s.value #>> '{}')::numeric from lugu.system_settings s where s.key = p_key), p_default)
$$;

create table lugu.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action <> ''),
  target_table text,
  target_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_logs_created_at_idx on lugu.admin_audit_logs (created_at desc);
create index admin_audit_logs_actor_idx on lugu.admin_audit_logs (actor_id);
create index admin_audit_logs_target_idx on lugu.admin_audit_logs (target_table, target_id);

create function lugu.audit(p_action text, p_table text, p_target text, p_data jsonb default '{}'::jsonb) returns void
language sql security definer set search_path = '' as $$
  insert into lugu.admin_audit_logs (actor_id, action, target_table, target_id, data)
  values (auth.uid(), p_action, p_table, p_target, coalesce(p_data, '{}'::jsonb))
$$;

-- ───────────────────────── schools & student profiles ─────────────────────────

create table lugu.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and length(name) <= 200),
  city text not null check (btrim(city) <> '' and length(city) <= 100),
  district text check (length(district) <= 100),
  country text not null default 'Türkiye' check (btrim(country) <> ''),
  normalized_key text not null generated always as (lugu.school_key(name, city, district, country)) stored,
  merged_into_id uuid references lugu.schools (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_normalized_key_key unique (normalized_key),
  constraint schools_not_merged_into_self check (merged_into_id is null or merged_into_id <> id)
);
create index schools_merged_into_idx on lugu.schools (merged_into_id);
create trigger schools_updated_at before update on lugu.schools
  for each row execute function lugu.set_updated_at();

create sequence lugu.student_code_seq start with 1001;

create table lugu.student_profiles (
  user_id uuid primary key references lugu.profiles (user_id) on delete cascade,
  student_code text not null check (student_code ~ '^LUGU-[0-9]{4,}$'),
  first_name text check (length(first_name) between 1 and 60),
  last_name text check (length(last_name) between 1 and 60),
  display_name text check (length(display_name) between 1 and 40),
  grade smallint check (grade between 1 and 12),
  school_id uuid references lugu.schools (id) on delete set null,
  avatar_key text check (avatar_key ~ '^[a-z0-9-]{1,40}$'),
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profiles_student_code_key unique (student_code)
);
create index student_profiles_school_idx on lugu.student_profiles (school_id);
create trigger student_profiles_updated_at before update on lugu.student_profiles
  for each row execute function lugu.set_updated_at();

-- ───────────────────────── RLS ─────────────────────────

alter table lugu.profiles enable row level security;
alter table lugu.student_profiles enable row level security;
alter table lugu.schools enable row level security;
alter table lugu.system_settings enable row level security;
alter table lugu.admin_audit_logs enable row level security;

create policy profiles_select_own on lugu.profiles for select to authenticated
  using (user_id = auth.uid() or lugu.is_admin());
create policy profiles_admin_write on lugu.profiles for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

create policy student_profiles_select_own on lugu.student_profiles for select to authenticated
  using (user_id = auth.uid() or lugu.is_admin());
create policy student_profiles_admin_write on lugu.student_profiles for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

-- School names are not personal data; any signed-in user may read them.
create policy schools_select on lugu.schools for select to authenticated using (true);
create policy schools_admin_write on lugu.schools for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

create policy system_settings_admin on lugu.system_settings for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

create policy admin_audit_logs_admin_select on lugu.admin_audit_logs for select to authenticated
  using (lugu.is_admin());

grant select, insert, update, delete on lugu.profiles, lugu.student_profiles, lugu.schools, lugu.system_settings to authenticated;
grant select on lugu.admin_audit_logs to authenticated;

grant execute on function lugu.is_admin(), lugu.current_student_id() to authenticated;
-- 0002 curriculum: curricula, versions, objectives, lessons, content packages, admin material, sources.

create table lugu.curricula (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and length(name) <= 200),
  description text,
  grade smallint check (grade between 1 and 12),
  target_level text check (length(target_level) <= 20),
  kind text not null default 'standard' check (kind in ('standard', 'exam_prep', 'remedial', 'custom')),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger curricula_updated_at before update on lugu.curricula
  for each row execute function lugu.set_updated_at();

create table lugu.curriculum_versions (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references lugu.curricula (id) on delete cascade,
  version integer not null check (version >= 1),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  notes text,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_versions_curriculum_version_key unique (curriculum_id, version),
  constraint curriculum_versions_published_at check (status <> 'published' or published_at is not null)
);
create trigger curriculum_versions_updated_at before update on lugu.curriculum_versions
  for each row execute function lugu.set_updated_at();

create table lugu.curriculum_objectives (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references lugu.curriculum_versions (id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  text text not null check (btrim(text) <> ''),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_objectives_version_code_key unique (version_id, code)
);
create trigger curriculum_objectives_updated_at before update on lugu.curriculum_objectives
  for each row execute function lugu.set_updated_at();

create table lugu.curriculum_lessons (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references lugu.curriculum_versions (id) on delete cascade,
  sequence integer not null check (sequence >= 1),
  title text not null check (btrim(title) <> '' and length(title) <= 200),
  objective_ids uuid[] not null default '{}',
  prerequisite_ids uuid[] not null default '{}',
  estimated_minutes integer not null default 45 check (estimated_minutes between 5 and 240),
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  source_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Deferrable so an admin can swap two sequences inside one transaction.
  constraint curriculum_lessons_version_sequence_key unique (version_id, sequence) deferrable initially immediate
);
create trigger curriculum_lessons_updated_at before update on lugu.curriculum_lessons
  for each row execute function lugu.set_updated_at();

-- Assignments point at a published version's lesson order; changing it would silently move students.
create function lugu.guard_published_lessons() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_status text;
begin
  select v.status into v_status from lugu.curriculum_versions v
  where v.id = coalesce(old.version_id, new.version_id);
  -- A null status means the version itself is being deleted (cascade), which its own guard already allowed.
  if v_status is not null and v_status <> 'draft' then
    if tg_op = 'DELETE' or tg_op = 'INSERT' then
      raise exception 'LUGU_VERSION_LOCKED' using errcode = 'P0001';
    end if;
    if new.sequence <> old.sequence or new.version_id <> old.version_id then
      raise exception 'LUGU_VERSION_LOCKED' using errcode = 'P0001';
    end if;
  end if;
  return coalesce(new, old);
end $$;
create trigger curriculum_lessons_guard before insert or update or delete on lugu.curriculum_lessons
  for each row execute function lugu.guard_published_lessons();

-- Deleting a version (or curriculum) cascades into its lessons, and moving it back to draft would unlock
-- them; both are blocked once published.
create function lugu.guard_published_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'LUGU_VERSION_LOCKED' using errcode = 'P0001';
    end if;
    return old;
  end if;
  if old.status <> 'draft' and new.status = 'draft' then
    raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;
create trigger curriculum_versions_guard before update or delete on lugu.curriculum_versions
  for each row execute function lugu.guard_published_version();

create table lugu.lesson_content_packages (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lugu.curriculum_lessons (id) on delete cascade,
  revision integer not null check (revision >= 1),
  status text not null default 'draft'
    check (status in ('draft', 'ai_generated', 'qa', 'review', 'approved', 'published', 'archived')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  origin text not null default 'manual' check (origin in ('ai', 'manual')),
  ai_job_id uuid,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_content_packages_lesson_revision_key unique (lesson_id, revision)
);
create unique index lesson_content_packages_one_published on lugu.lesson_content_packages (lesson_id)
  where status = 'published';
create index lesson_content_packages_status_idx on lugu.lesson_content_packages (status);
create trigger lesson_content_packages_updated_at before update on lugu.lesson_content_packages
  for each row execute function lugu.set_updated_at();

create function lugu.package_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.revision is null then
      select coalesce(max(p.revision), 0) + 1 into new.revision
      from lugu.lesson_content_packages p where p.lesson_id = new.lesson_id;
    end if;
    if new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
    return new;
  end if;
  -- Attempts reference (package_id, item id): once a revision has been published its meaning is fixed.
  if old.status in ('published', 'archived') and old.published_at is not null then
    if new.content is distinct from old.content or new.lesson_id <> old.lesson_id or new.revision <> old.revision then
      raise exception 'LUGU_PACKAGE_IMMUTABLE' using errcode = 'P0001';
    end if;
    if old.status = 'published' and new.status not in ('published', 'archived') then
      raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
    end if;
    if old.status = 'archived' and new.status <> 'archived' then
      raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
    end if;
  end if;
  if new.status = 'published' and old.status <> 'published' then
    new.published_at := now();
  end if;
  return new;
end $$;
create trigger lesson_content_packages_before_write before insert or update on lugu.lesson_content_packages
  for each row execute function lugu.package_before_write();

create table lugu.lesson_admin_material (
  package_id uuid primary key references lugu.lesson_content_packages (id) on delete cascade,
  teacher_guide jsonb,
  speaking_plan jsonb,
  visual_plan jsonb,
  qa_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger lesson_admin_material_updated_at before update on lugu.lesson_admin_material
  for each row execute function lugu.set_updated_at();

create table lugu.curriculum_sources (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references lugu.curricula (id) on delete cascade,
  version_id uuid references lugu.curriculum_versions (id) on delete set null,
  lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  kind text not null check (kind in ('text', 'pdf', 'image', 'document')),
  title text not null check (btrim(title) <> ''),
  storage_path text,
  text_content text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint curriculum_sources_has_body check (storage_path is not null or text_content is not null)
);
create index curriculum_sources_curriculum_idx on lugu.curriculum_sources (curriculum_id);
create index curriculum_sources_version_idx on lugu.curriculum_sources (version_id);
create index curriculum_sources_lesson_idx on lugu.curriculum_sources (lesson_id);

-- ───────────────────────── RLS ─────────────────────────

alter table lugu.curricula enable row level security;
alter table lugu.curriculum_versions enable row level security;
alter table lugu.curriculum_objectives enable row level security;
alter table lugu.curriculum_lessons enable row level security;
alter table lugu.lesson_content_packages enable row level security;
alter table lugu.lesson_admin_material enable row level security;
alter table lugu.curriculum_sources enable row level security;

create policy curricula_admin on lugu.curricula for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy curriculum_versions_admin on lugu.curriculum_versions for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy curriculum_objectives_admin on lugu.curriculum_objectives for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy curriculum_lessons_admin on lugu.curriculum_lessons for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy lesson_content_packages_admin on lugu.lesson_content_packages for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy lesson_admin_material_admin on lugu.lesson_admin_material for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy curriculum_sources_admin on lugu.curriculum_sources for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

grant select, insert, update, delete on
  lugu.curricula, lugu.curriculum_versions, lugu.curriculum_objectives, lugu.curriculum_lessons,
  lugu.lesson_content_packages, lugu.lesson_admin_material, lugu.curriculum_sources
to authenticated;
-- 0003 learning: assignments, program events, sessions, attempts, mastery, completion, gamification.

create table lugu.program_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  curriculum_version_id uuid not null references lugu.curriculum_versions (id) on delete restrict,
  start_lesson_id uuid not null references lugu.curriculum_lessons (id) on delete restrict,
  -- Null only once every lesson is completed (status = 'completed').
  current_lesson_id uuid references lugu.curriculum_lessons (id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'paused', 'archived', 'completed')),
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_assignments_current_lesson check (status = 'completed' or current_lesson_id is not null)
);
create unique index program_assignments_one_open on lugu.program_assignments (student_id, curriculum_version_id)
  where status in ('active', 'paused');
create index program_assignments_student_idx on lugu.program_assignments (student_id);
create index program_assignments_version_idx on lugu.program_assignments (curriculum_version_id);
create index program_assignments_current_lesson_idx on lugu.program_assignments (current_lesson_id);
create index program_assignments_start_lesson_idx on lugu.program_assignments (start_lesson_id);
create trigger program_assignments_updated_at before update on lugu.program_assignments
  for each row execute function lugu.set_updated_at();

create table lugu.program_events (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references lugu.program_assignments (id) on delete cascade,
  kind text not null check (kind in (
    'assigned', 'forward', 'backward', 'set_lesson', 'restart_lesson', 'pause', 'resume', 'archive',
    'lesson_completed', 'program_completed')),
  from_lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  to_lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  actor_id uuid references auth.users (id) on delete set null,
  note text check (length(note) <= 2000),
  created_at timestamptz not null default now()
);
create index program_events_assignment_idx on lugu.program_events (assignment_id, created_at);
create index program_events_from_lesson_idx on lugu.program_events (from_lesson_id);
create index program_events_to_lesson_idx on lugu.program_events (to_lesson_id);
create index program_events_actor_idx on lugu.program_events (actor_id);

create table lugu.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  assignment_id uuid not null references lugu.program_assignments (id) on delete cascade,
  lesson_id uuid not null references lugu.curriculum_lessons (id) on delete restrict,
  package_id uuid not null references lugu.lesson_content_packages (id) on delete restrict,
  kind text not null check (kind in ('primary', 'replay')),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  current_section text check (current_section in
    ('review', 'vocabulary', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment')),
  active_seconds integer not null default 0 check (active_seconds >= 0),
  idle_seconds integer not null default 0 check (idle_seconds >= 0),
  break_seconds integer not null default 0 check (break_seconds >= 0),
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_sessions_completed_at check (status <> 'completed' or completed_at is not null)
);
-- One active session of each kind per (student, lesson): resuming must find exactly one.
create unique index learning_sessions_one_active on lugu.learning_sessions (student_id, lesson_id, kind)
  where status = 'active';
create index learning_sessions_student_idx on lugu.learning_sessions (student_id, started_at desc);
create index learning_sessions_assignment_idx on lugu.learning_sessions (assignment_id);
create index learning_sessions_lesson_idx on lugu.learning_sessions (lesson_id);
create index learning_sessions_package_idx on lugu.learning_sessions (package_id);
create trigger learning_sessions_updated_at before update on lugu.learning_sessions
  for each row execute function lugu.set_updated_at();

create table lugu.session_section_progress (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references lugu.learning_sessions (id) on delete cascade,
  section text not null check (section in
    ('review', 'vocabulary', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment')),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  state jsonb not null default '{}'::jsonb,
  attempts_count integer not null default 0 check (attempts_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  active_seconds integer not null default 0 check (active_seconds >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_section_progress_session_section_key unique (session_id, section)
);
create trigger session_section_progress_updated_at before update on lugu.session_section_progress
  for each row execute function lugu.set_updated_at();

create table lugu.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references lugu.learning_sessions (id) on delete cascade,
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  kind text not null check (kind in (
    'visibility_hidden', 'visibility_visible', 'fullscreen_exit', 'leave_warning',
    'interrupted', 'resumed', 'idle_start', 'idle_end')),
  at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb
);
create index session_events_session_idx on lugu.session_events (session_id, at);
create index session_events_student_idx on lugu.session_events (student_id);

create table lugu.break_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references lugu.learning_sessions (id) on delete cascade,
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  after_section text not null check (after_section in
    ('review', 'vocabulary', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment')),
  planned_minutes smallint not null check (planned_minutes in (0, 10, 15, 20, 30)),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  early_return boolean,
  next_section_started_at timestamptz,
  created_at timestamptz not null default now(),
  constraint break_sessions_ended_after_start check (ended_at is null or ended_at >= started_at)
);
create unique index break_sessions_one_open on lugu.break_sessions (session_id) where ended_at is null;
create index break_sessions_session_idx on lugu.break_sessions (session_id);
create index break_sessions_student_idx on lugu.break_sessions (student_id);

create table lugu.question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references lugu.learning_sessions (id) on delete cascade,
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  package_id uuid not null references lugu.lesson_content_packages (id) on delete restrict,
  section text not null check (section in
    ('review', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment')),
  -- Question id inside the package; for vocab_quiz the vocabulary item id.
  question_id text not null check (question_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  attempt_no integer not null check (attempt_no >= 1),
  response jsonb not null,
  correct boolean not null,
  response_ms integer check (response_ms between 0 and 3600000),
  hint_used boolean not null default false,
  created_at timestamptz not null default clock_timestamp()
);
create index question_attempts_session_idx on lugu.question_attempts (session_id, section, question_id, created_at);
create index question_attempts_student_idx on lugu.question_attempts (student_id, created_at desc);
create index question_attempts_package_idx on lugu.question_attempts (package_id, question_id);

create table lugu.vocabulary_mastery (
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  package_id uuid not null references lugu.lesson_content_packages (id) on delete restrict,
  item_id text not null check (item_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  correct_count integer not null default 0 check (correct_count >= 0),
  incorrect_count integer not null default 0 check (incorrect_count >= 0),
  mastered_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, package_id, item_id)
);
create index vocabulary_mastery_package_idx on lugu.vocabulary_mastery (package_id);
create trigger vocabulary_mastery_updated_at before update on lugu.vocabulary_mastery
  for each row execute function lugu.set_updated_at();

create table lugu.assessment_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references lugu.learning_sessions (id) on delete cascade,
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  package_id uuid not null references lugu.lesson_content_packages (id) on delete restrict,
  quiz_correct integer not null check (quiz_correct >= 0),
  quiz_total integer not null check (quiz_total >= quiz_correct),
  reading_correct integer not null check (reading_correct >= 0),
  reading_total integer not null check (reading_total >= reading_correct),
  quiz_percent numeric(5, 2) not null check (quiz_percent between 0 and 100),
  reading_percent numeric(5, 2) not null check (reading_percent between 0 and 100),
  percent numeric(5, 2) not null check (percent between 0 and 100),
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  constraint assessment_results_session_key unique (session_id)
);
create index assessment_results_student_idx on lugu.assessment_results (student_id);
create index assessment_results_package_idx on lugu.assessment_results (package_id);

create table lugu.lesson_completion_records (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references lugu.program_assignments (id) on delete cascade,
  lesson_id uuid not null references lugu.curriculum_lessons (id) on delete restrict,
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  -- One record per completed primary session: a lesson the admin sends the student back to can be completed again.
  session_id uuid not null references lugu.learning_sessions (id) on delete cascade,
  package_id uuid not null references lugu.lesson_content_packages (id) on delete restrict,
  completed_at timestamptz not null default now(),
  summary jsonb not null default '{}'::jsonb,
  constraint lesson_completion_records_session_key unique (session_id)
);
create index lesson_completion_records_student_idx on lugu.lesson_completion_records (student_id, completed_at desc);
create index lesson_completion_records_assignment_lesson_idx on lugu.lesson_completion_records (assignment_id, lesson_id);
create index lesson_completion_records_lesson_idx on lugu.lesson_completion_records (lesson_id);
create index lesson_completion_records_package_idx on lugu.lesson_completion_records (package_id);

create table lugu.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null check (key ~ '^[a-z0-9_]{1,64}$'),
  title text not null check (btrim(title) <> ''),
  description text,
  icon text,
  kind text not null default 'manual' check (kind in ('lessons_completed', 'manual')),
  threshold integer check (threshold >= 1),
  xp integer not null default 0 check (xp >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint achievements_key_key unique (key),
  constraint achievements_threshold check (kind = 'manual' or threshold is not null)
);
create trigger achievements_updated_at before update on lugu.achievements
  for each row execute function lugu.set_updated_at();

insert into lugu.achievements (key, title, description, icon, kind, threshold, xp) values
  ('first_lesson', 'İlk adım', 'İlk dersini tamamladın.', 'star', 'lessons_completed', 1, 20),
  ('five_lessons', 'Beş ders', 'Beş dersi tamamladın.', 'trophy', 'lessons_completed', 5, 50);

create table lugu.student_achievement_records (
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  achievement_id uuid not null references lugu.achievements (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_by uuid references auth.users (id) on delete set null,
  primary key (student_id, achievement_id)
);
create index student_achievement_records_achievement_idx on lugu.student_achievement_records (achievement_id);

create table lugu.progress_rewards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  amount integer not null check (amount > 0),
  reason text not null check (reason in ('lesson_completed', 'achievement', 'manual')),
  lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  session_id uuid references lugu.learning_sessions (id) on delete set null,
  achievement_id uuid references lugu.achievements (id) on delete set null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index progress_rewards_student_idx on lugu.progress_rewards (student_id, created_at desc);
create index progress_rewards_lesson_idx on lugu.progress_rewards (lesson_id);
create index progress_rewards_session_idx on lugu.progress_rewards (session_id);
create index progress_rewards_achievement_idx on lugu.progress_rewards (achievement_id);

-- ───────────────────────── RLS ─────────────────────────

-- Policy helper: a student may read curriculum structure only for versions assigned to them.
create function lugu.student_has_version(p_version_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from lugu.program_assignments a
    where a.curriculum_version_id = p_version_id and a.student_id = auth.uid()
  )
$$;
grant execute on function lugu.student_has_version(uuid) to authenticated;

alter table lugu.program_assignments enable row level security;
alter table lugu.program_events enable row level security;
alter table lugu.learning_sessions enable row level security;
alter table lugu.session_section_progress enable row level security;
alter table lugu.session_events enable row level security;
alter table lugu.break_sessions enable row level security;
alter table lugu.question_attempts enable row level security;
alter table lugu.vocabulary_mastery enable row level security;
alter table lugu.assessment_results enable row level security;
alter table lugu.lesson_completion_records enable row level security;
alter table lugu.achievements enable row level security;
alter table lugu.student_achievement_records enable row level security;
alter table lugu.progress_rewards enable row level security;

-- Students read their own learning rows; every write goes through lugu.* RPCs (no write policies).
create policy program_assignments_select on lugu.program_assignments for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());
create policy program_assignments_admin_write on lugu.program_assignments for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

create policy program_events_admin_select on lugu.program_events for select to authenticated
  using (lugu.is_admin());

create policy learning_sessions_select on lugu.learning_sessions for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy session_section_progress_select on lugu.session_section_progress for select to authenticated
  using (lugu.is_admin() or exists (
    select 1 from lugu.learning_sessions s where s.id = session_section_progress.session_id and s.student_id = auth.uid()));

create policy session_events_select on lugu.session_events for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy break_sessions_select on lugu.break_sessions for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy question_attempts_select on lugu.question_attempts for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy vocabulary_mastery_select on lugu.vocabulary_mastery for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy assessment_results_select on lugu.assessment_results for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy lesson_completion_records_select on lugu.lesson_completion_records for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());

create policy achievements_select on lugu.achievements for select to authenticated using (true);
create policy achievements_admin_write on lugu.achievements for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

create policy student_achievement_records_select on lugu.student_achievement_records for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());
create policy student_achievement_records_admin_insert on lugu.student_achievement_records for insert to authenticated
  with check (lugu.is_admin());
create policy student_achievement_records_admin_delete on lugu.student_achievement_records for delete to authenticated
  using (lugu.is_admin());

create policy progress_rewards_select on lugu.progress_rewards for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());
create policy progress_rewards_admin_insert on lugu.progress_rewards for insert to authenticated
  with check (lugu.is_admin() and reason = 'manual');

-- Curriculum structure, readable by the students it is assigned to (packages stay admin-only).
create policy curricula_student_select on lugu.curricula for select to authenticated
  using (exists (
    select 1 from lugu.curriculum_versions v where v.curriculum_id = curricula.id and lugu.student_has_version(v.id)));
create policy curriculum_versions_student_select on lugu.curriculum_versions for select to authenticated
  using (lugu.student_has_version(id));
create policy curriculum_objectives_student_select on lugu.curriculum_objectives for select to authenticated
  using (lugu.student_has_version(version_id));
create policy curriculum_lessons_student_select on lugu.curriculum_lessons for select to authenticated
  using (lugu.student_has_version(version_id));

grant select, insert, update, delete on lugu.program_assignments, lugu.achievements to authenticated;
grant select, insert, delete on lugu.student_achievement_records to authenticated;
grant select, insert on lugu.progress_rewards to authenticated;
grant select on
  lugu.program_events, lugu.learning_sessions, lugu.session_section_progress, lugu.session_events,
  lugu.break_sessions, lugu.question_attempts, lugu.vocabulary_mastery, lugu.assessment_results,
  lugu.lesson_completion_records
to authenticated;
-- 0004 academic & coaching: school exams with net calculation, speaking sessions, learning profiles, weekly reports.

create table lugu.school_subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and length(name) <= 100),
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_subjects_name_key unique (name)
);
create trigger school_subjects_updated_at before update on lugu.school_subjects
  for each row execute function lugu.set_updated_at();

insert into lugu.school_subjects (name, sort) values
  ('Türkçe', 1), ('Matematik', 2), ('Fen Bilimleri', 3), ('T.C. İnkılap Tarihi ve Atatürkçülük', 4),
  ('Sosyal Bilgiler', 5), ('Din Kültürü ve Ahlak Bilgisi', 6), ('İngilizce', 7);

create table lugu.school_exams (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  title text not null check (btrim(title) <> '' and length(title) <= 200),
  kind text not null default 'school' check (kind in ('school', 'mock', 'lgs', 'other')),
  exam_date date not null,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index school_exams_student_idx on lugu.school_exams (student_id, exam_date desc);
create trigger school_exams_updated_at before update on lugu.school_exams
  for each row execute function lugu.set_updated_at();

create table lugu.school_exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references lugu.school_exams (id) on delete cascade,
  subject_id uuid not null references lugu.school_subjects (id) on delete restrict,
  total integer check (total >= 0),
  correct integer not null default 0 check (correct >= 0),
  incorrect integer not null default 0 check (incorrect >= 0),
  blank integer not null default 0 check (blank >= 0),
  -- Set by trigger from system_settings so the penalty in force at entry time is kept.
  net numeric(7, 2) not null default 0,
  score numeric(6, 2) check (score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_exam_results_exam_subject_key unique (exam_id, subject_id),
  constraint school_exam_results_counts check (total is null or correct + incorrect + blank <= total)
);
create index school_exam_results_subject_idx on lugu.school_exam_results (subject_id);
create trigger school_exam_results_updated_at before update on lugu.school_exam_results
  for each row execute function lugu.set_updated_at();

create function lugu.compute_exam_net() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.net := round(new.correct - new.incorrect * lugu.setting_numeric('academic.wrong_penalty', 0.25), 2);
  return new;
end $$;
create trigger school_exam_results_net before insert or update of correct, incorrect on lugu.school_exam_results
  for each row execute function lugu.compute_exam_net();

create table lugu.speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  status text not null default 'planned' check (status in ('planned', 'started', 'ended', 'cancelled')),
  planned_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  plan jsonb,
  ai_job_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint speaking_sessions_times check (ended_at is null or started_at is null or ended_at >= started_at)
);
create index speaking_sessions_student_idx on lugu.speaking_sessions (student_id, planned_at desc);
create index speaking_sessions_lesson_idx on lugu.speaking_sessions (lesson_id);
create trigger speaking_sessions_updated_at before update on lugu.speaking_sessions
  for each row execute function lugu.set_updated_at();

create table lugu.speaking_session_notes (
  id uuid primary key default gen_random_uuid(),
  speaking_session_id uuid not null references lugu.speaking_sessions (id) on delete cascade,
  observations text,
  strengths text,
  goals text,
  follow_up text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index speaking_session_notes_session_idx on lugu.speaking_session_notes (speaking_session_id);
create trigger speaking_session_notes_updated_at before update on lugu.speaking_session_notes
  for each row execute function lugu.set_updated_at();

create table lugu.student_learning_profiles (
  student_id uuid primary key references lugu.student_profiles (user_id) on delete cascade,
  observed jsonb not null default '{}'::jsonb,
  ai_interpretation jsonb,
  teacher_observations text,
  generated_at timestamptz,
  ai_job_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger student_learning_profiles_updated_at before update on lugu.student_learning_profiles
  for each row execute function lugu.set_updated_at();

create table lugu.weekly_learning_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'reviewed')),
  ai_job_id uuid,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_learning_reports_student_week_key unique (student_id, week_start)
);
create trigger weekly_learning_reports_updated_at before update on lugu.weekly_learning_reports
  for each row execute function lugu.set_updated_at();

-- ───────────────────────── RLS: admin only ─────────────────────────

alter table lugu.school_subjects enable row level security;
alter table lugu.school_exams enable row level security;
alter table lugu.school_exam_results enable row level security;
alter table lugu.speaking_sessions enable row level security;
alter table lugu.speaking_session_notes enable row level security;
alter table lugu.student_learning_profiles enable row level security;
alter table lugu.weekly_learning_reports enable row level security;

create policy school_subjects_admin on lugu.school_subjects for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy school_exams_admin on lugu.school_exams for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy school_exam_results_admin on lugu.school_exam_results for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy speaking_sessions_admin on lugu.speaking_sessions for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy speaking_session_notes_admin on lugu.speaking_session_notes for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy student_learning_profiles_admin on lugu.student_learning_profiles for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy weekly_learning_reports_admin on lugu.weekly_learning_reports for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

grant select, insert, update, delete on
  lugu.school_subjects, lugu.school_exams, lugu.school_exam_results, lugu.speaking_sessions,
  lugu.speaking_session_notes, lugu.student_learning_profiles, lugu.weekly_learning_reports
to authenticated;
-- 0005 AI jobs and data deletion requests.

create table lugu.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in
    ('lesson_package', 'learning_profile', 'speaking_plan', 'weekly_report', 'academic_insight')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  stage text,
  lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  package_id uuid references lugu.lesson_content_packages (id) on delete set null,
  -- Student-scoped jobs carry student data in input/output, so they go with the student.
  student_id uuid references lugu.student_profiles (user_id) on delete cascade,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  model text,
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_jobs_status_idx on lugu.ai_jobs (status, created_at desc);
create index ai_jobs_lesson_idx on lugu.ai_jobs (lesson_id);
create index ai_jobs_package_idx on lugu.ai_jobs (package_id);
create index ai_jobs_student_idx on lugu.ai_jobs (student_id);
create index ai_jobs_created_by_idx on lugu.ai_jobs (created_by);
create trigger ai_jobs_updated_at before update on lugu.ai_jobs
  for each row execute function lugu.set_updated_at();

alter table lugu.lesson_content_packages
  add constraint lesson_content_packages_ai_job_fkey foreign key (ai_job_id) references lugu.ai_jobs (id) on delete set null;
alter table lugu.speaking_sessions
  add constraint speaking_sessions_ai_job_fkey foreign key (ai_job_id) references lugu.ai_jobs (id) on delete set null;
alter table lugu.student_learning_profiles
  add constraint student_learning_profiles_ai_job_fkey foreign key (ai_job_id) references lugu.ai_jobs (id) on delete set null;
alter table lugu.weekly_learning_reports
  add constraint weekly_learning_reports_ai_job_fkey foreign key (ai_job_id) references lugu.ai_jobs (id) on delete set null;
create index lesson_content_packages_ai_job_idx on lugu.lesson_content_packages (ai_job_id);
create index speaking_sessions_ai_job_idx on lugu.speaking_sessions (ai_job_id);
create index student_learning_profiles_ai_job_idx on lugu.student_learning_profiles (ai_job_id);
create index weekly_learning_reports_ai_job_idx on lugu.weekly_learning_reports (ai_job_id);

-- No FK to the student on purpose: the request must outlive the account it deletes.
create table lugu.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  student_code text,
  reason text,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected', 'completed', 'failed')),
  requested_by uuid references auth.users (id) on delete set null,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint data_deletion_requests_approval check (status in ('requested', 'rejected') or approved_at is not null)
);
create unique index data_deletion_requests_one_open on lugu.data_deletion_requests (student_id)
  where status in ('requested', 'approved');
create index data_deletion_requests_status_idx on lugu.data_deletion_requests (status);
create trigger data_deletion_requests_updated_at before update on lugu.data_deletion_requests
  for each row execute function lugu.set_updated_at();

alter table lugu.ai_jobs enable row level security;
alter table lugu.data_deletion_requests enable row level security;

create policy ai_jobs_admin on lugu.ai_jobs for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());
create policy data_deletion_requests_admin on lugu.data_deletion_requests for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

grant select, insert, update, delete on lugu.ai_jobs, lugu.data_deletion_requests to authenticated;
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
-- 0008 storage buckets and object policies. Skipped where the storage schema does not exist (PGlite tests).

do $migration$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema not found; skipping bucket setup';
    return;
  end if;

  insert into storage.buckets (id, name, public) values
    ('curriculum-sources', 'curriculum-sources', false),
    ('lesson-assets', 'lesson-assets', true)
  on conflict (id) do update set public = excluded.public;

  execute $p$
    create policy "curriculum-sources admin all" on storage.objects for all to authenticated
      using (bucket_id = 'curriculum-sources' and lugu.is_admin())
      with check (bucket_id = 'curriculum-sources' and lugu.is_admin())
  $p$;
  execute $p$
    create policy "lesson-assets public read" on storage.objects for select to anon, authenticated
      using (bucket_id = 'lesson-assets')
  $p$;
  execute $p$
    create policy "lesson-assets admin insert" on storage.objects for insert to authenticated
      with check (bucket_id = 'lesson-assets' and lugu.is_admin())
  $p$;
  execute $p$
    create policy "lesson-assets admin update" on storage.objects for update to authenticated
      using (bucket_id = 'lesson-assets' and lugu.is_admin())
      with check (bucket_id = 'lesson-assets' and lugu.is_admin())
  $p$;
  execute $p$
    create policy "lesson-assets admin delete" on storage.objects for delete to authenticated
      using (bucket_id = 'lesson-assets' and lugu.is_admin())
  $p$;
end
$migration$;
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
