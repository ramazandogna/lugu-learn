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
