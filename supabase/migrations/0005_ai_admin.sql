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
