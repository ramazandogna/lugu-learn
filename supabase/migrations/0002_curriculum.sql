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
