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
