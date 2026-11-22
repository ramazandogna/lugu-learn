# Lugu architecture

This is the contract every part of Lugu is built against. Change it before you
change the code that depends on it.

## 1. System shape

```
Browser (Vue 3 SPA, Vercel)
  ├── student app  /            playful, mobile/tablet first
  └── admin app    /admin       professional, desktop first
        │  supabase-js (anon key + user JWT)
        ▼
Supabase
  ├── Auth         email/password; public sign-up disabled
  ├── Postgres     schema `lugu`; RLS on every table; writes that change
  │                learning state go through SECURITY DEFINER RPCs
  ├── Storage      bucket `curriculum-sources` (admin only), `lesson-assets` (public read of published assets)
  └── Edge fns     admin-students, ai-generate, ai-insights, process-deletion
        │  service role (server only), ANTHROPIC_API_KEY (server only)
        ▼
Claude API         content pipeline and insights; never called from the browser
```

No other service receives student data.

## 2. Key decisions

1. **Roles live in the database, not the JWT.** `lugu.profiles.role`
   (`admin` | `student`) is read by `lugu.is_admin()` / `lugu.current_student_id()`
   (SECURITY DEFINER, `stable`). The frontend reads the role only to choose
   a layout; every permission is enforced by RLS or by the RPC.
2. **Students sign in with a student code.** The admin creates `LUGU-1042`
   via the `admin-students` edge function, which creates the Auth user with
   the synthetic email `lugu-1042@students.lugu.invalid` (the `.invalid` TLD
   can never be a real mailbox) and a temporary password. The login form
   maps the code to that email. `must_change_password` forces a change on
   first sign-in.
3. **Lesson content is one validated document per revision.** A
   `lesson_content_packages` row holds the student-visible package
   (`src/domain/content.ts`, `LessonPackage`) as `jsonb`; a published
   revision is immutable (trigger). Editing creates a new revision. All
   attempts reference `package_id` + the item id inside it, so history never
   changes meaning. This replaces separate vocabulary/question/story tables:
   they would duplicate the document without adding a query we need.
   Teacher guide, speaking plan, visual plan and QA report are stored in
   `lesson_admin_material`, which students cannot read at all.
4. **The server grades.** `lugu.record_answer()` looks the question up in the
   package, grades it with `lugu.grade_response()`, writes the attempt and
   updates mastery in one transaction. The client grades too, only for
   instant feedback. Students receive the package through
   `lugu.student_lesson_content()`, which removes the final assessment's
   answer keys; assessment answers are graded on `submit_assessment()`.
5. **Lesson access is derived, not stored.** From the assignment's
   `current_lesson_id`, the lesson sequence and `lesson_completion_records`:
   `completed` (record exists) → replay available; `current` → available or
   in progress (an active primary session exists); later → locked. There is
   no `lesson_access_states` table to contradict the records.
6. **Sessions are server-side.** `learning_sessions` + `session_section_progress`
   (with a `state jsonb` resume snapshot of the client engine) +
   `session_events`. Closing the tab loses nothing: the student resumes from
   the last saved section state.
7. **Replay never touches the original.** A replay is a `learning_sessions`
   row with `kind = 'replay'`. Its attempts are recorded; it does not update
   `vocabulary_mastery`, completion records or the assignment.
8. **Admin progress changes are events.** Move forward/back, restart, pause,
   resume, archive, reassign go through `lugu.admin_set_progress()` etc.,
   which write `program_events` and `admin_audit_logs`. Nothing is deleted.
9. **Gamification is an append-only ledger.** `progress_rewards.amount > 0`
   (check constraint); XP is a sum. No streak penalties, no leaderboards.
10. **AI output is a draft.** The pipeline writes a package with
    `status = 'ai_generated'`; only an admin moves it through
    `qa → review → approved → published`. Only `published` reaches students.

## 3. Data model (schema `lugu`)

| Area | Table | Notes |
| --- | --- | --- |
| Identity | `profiles` | `user_id` PK → `auth.users`, `role`, `status` (`active`/`paused`/`disabled`), `must_change_password` |
| Student | `student_profiles` | `user_id` PK, `student_code` unique (`LUGU-1042`), names, `display_name`, `grade`, `school_id`, `avatar_key`, `profile_completed_at` |
| | `schools` | `name`, `city`, `district`, `country`, `normalized_key` unique (name+city+district+country, Turkish-aware lowercase, no punctuation), `merged_into_id` |
| Curriculum | `curricula` | `name`, `description`, `grade`, `target_level`, `kind`, `status` |
| | `curriculum_versions` | `(curriculum_id, version)` unique, `status` `draft`/`published`/`archived`; a published version's lessons cannot change order or be removed |
| | `curriculum_objectives` | per version |
| | `curriculum_lessons` | `version_id`, `sequence` (unique per version, deferrable), `title`, `objective_ids`, `prerequisite_ids`, `estimated_minutes`, `status`, `source_notes` |
| Content | `lesson_content_packages` | `lesson_id`, `revision`, `status` (`draft`,`ai_generated`,`qa`,`review`,`approved`,`published`,`archived`), `content jsonb`, `origin` (`ai`/`manual`), at most one `published` per lesson |
| | `lesson_admin_material` | `package_id` PK, `teacher_guide`, `speaking_plan`, `visual_plan`, `qa_report` (jsonb) — admin only |
| | `curriculum_sources` | uploaded PDFs/images/text for intake, Storage path, extracted text |
| Program | `program_assignments` | `student_id`, `curriculum_version_id`, `start_lesson_id`, `current_lesson_id`, `status` (`active`/`paused`/`archived`/`completed`), `assigned_by` |
| | `program_events` | append-only: `kind`, `from_lesson_id`, `to_lesson_id`, `actor`, `note` |
| Learning | `learning_sessions` | `kind` `primary`/`replay`, `status` `active`/`completed`/`abandoned`, `current_section`, `active_seconds`, `idle_seconds`, `break_seconds`, `last_seen_at` |
| | `session_section_progress` | `(session_id, section)` unique, `status`, `state jsonb`, counters, durations |
| | `session_events` | `kind` (`visibility_hidden`, `visibility_visible`, `fullscreen_exit`, `leave_warning`, `interrupted`, `resumed`, `idle_start`, `idle_end`), `at`, `data` |
| | `break_sessions` | `planned_minutes` (0/10/15/20/30), `started_at`, `ended_at`, `early_return`, `next_section_started_at` |
| | `question_attempts` | `session_id`, `student_id`, `package_id`, `section`, `question_id`, `attempt_no`, `response jsonb`, `correct`, `response_ms`, `hint_used` |
| | `vocabulary_mastery` | PK `(student_id, package_id, item_id)`: `correct_count`, `incorrect_count`, `mastered_at`, `last_attempt_at` |
| | `assessment_results` | per session: `quiz_percent`, `reading_percent`, `percent`, answers |
| | `lesson_completion_records` | `(assignment_id, lesson_id)` unique; `session_id`, `completed_at`, `summary jsonb` |
| Academic | `school_subjects`, `school_exams`, `school_exam_results` | net = correct − incorrect × `wrong_penalty` from `system_settings` (default 0.25) |
| Coaching | `speaking_sessions`, `speaking_session_notes` | planned/started/ended, plan jsonb, observations, goals, follow-up |
| | `student_learning_profiles` | `observed` (computed facts), `ai_interpretation` (hypotheses with source refs), `teacher_observations`, `generated_at` |
| | `weekly_learning_reports` | AI-drafted, admin-reviewed |
| AI | `ai_jobs` | `kind`, `status`, `input`, `output`, `error`, `model`, token counts |
| Gamification | `achievements`, `student_achievement_records`, `progress_rewards` | rewards append-only, positive |
| Admin | `admin_audit_logs`, `system_settings`, `data_deletion_requests` | |

## 4. RPC contract (all `lugu.*`, SECURITY DEFINER, `search_path = ''`)

Student:
- `student_home()` → profile, assignments with current lesson, counts, XP.
- `student_learning_map(assignment_id)` → lessons with derived state.
- `student_lesson_content(lesson_id)` → published package, assessment keys removed.
- `start_or_resume_session(lesson_id, kind)` → session row + section progress.
- `save_section_state(session_id, section, state, active_seconds_delta)`
- `complete_section(session_id, section)` → validates mastery/criteria for that section.
- `record_answer(session_id, section, question_id, response, response_ms, hint_used)` → `{correct, expected}`.
- `record_vocab_answer(session_id, item_id, direction, chosen, response_ms)` → `{correct, mastered, correct_count}`.
- `submit_assessment(session_id, answers)` → score.
- `record_session_event(session_id, kind, data)`
- `start_break(session_id, after_section, planned_minutes)` / `end_break(break_id)`.
- `complete_lesson(session_id)` → checks `completion` rules server-side, writes the record, rewards, advances the assignment.
- `search_schools(q)` / `add_school(name, city, district)` (dedupe by `normalized_key`).
- `update_my_profile(...)` only the permitted fields.

Admin (each checks `is_admin()` and writes `admin_audit_logs`):
- `admin_assign_program(student_id, version_id, start_lesson_id)`
- `admin_set_progress(assignment_id, action, lesson_id, note)` with action
  `forward` | `backward` | `set_lesson` | `restart_lesson` | `pause` | `resume` | `archive`
- `admin_set_package_status(package_id, status)`; publishing archives the previous published revision.
- `admin_publish_version(version_id)`, `admin_new_version(curriculum_id)` (copies lessons).
- `admin_merge_schools(from_id, into_id)`
- Plain CRUD on admin tables is via RLS (`is_admin()`), not RPC.

Edge functions (Deno, `supabase/functions/*`):
- `admin-students`: `create` (generates the next `LUGU-####` code and a temporary password, returns it once), `reset-password`, `set-status` (also bans/unbans in Auth).
- `ai-generate`: curriculum intake → package draft, admin material, QA report. Documented in `docs/ai-workflow.md`.
- `ai-insights`: learning profile, speaking plan, weekly report, academic observations.
- `process-deletion`: carries out an approved deletion request.

## 5. Frontend layout

```
src/
  main.ts  App.vue  router.ts           guards: auth, role, must_change_password, profile completion
  assets/main.css                       Tailwind + rei-kit preset + Lugu tokens
  design/                               Lugu visual layer on top of rei-kit (owner: design)
    tokens.css  characters.ts  avatars.ts
    components/                         LuguMascot, CharacterBubble, Sparkles, WorldBackground, …
  domain/                               framework-free types and rules (owner: lead / learning)
    content.ts  grading.ts  progression.ts  analytics.ts
  engine/                               ported quiz engine and session flow (owner: learning)
    mastery.ts  exam.ts  lesson-flow.ts  break.ts
  lib/
    supabase.ts  database.types.ts  auth.ts
    api/<area>.ts                       typed wrappers over tables/RPCs, the only place that calls supabase
  features/
    auth/      login, change password
    student/   home, map, lesson player and its sections, profile, achievements
    admin/     dashboard, students, curricula, content editor, analytics, academic, coaching, settings
supabase/
  config.toml  migrations/  seed.sql (demo data, clearly marked)  functions/
tests/db/                               PGlite: migrations + RLS + RPC tests
```

## 6. Quiz engine

`src/engine/mastery.ts` and `exam.ts` are taken from the existing
nihongo quiz engine without behavioural change, with their tests. Mastery:
an item is mastered after **two correct answers since its last miss**; a
miss resets the item's count, requeues it two places later, and from the
second miss of the same question it is shown with two options. Lugu adds
only the server write per answer and the resume snapshot. The vocabulary
quiz builds its questions from the package's vocabulary (EN→TR and TR→EN,
distractors from other items).
