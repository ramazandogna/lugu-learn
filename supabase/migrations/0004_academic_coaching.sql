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
