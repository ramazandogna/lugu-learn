# Lugu database

Everything lives in the Postgres schema `lugu` (exposed through `api.schemas` in
`supabase/config.toml`). The contract is `docs/architecture.md` §3–4; this file documents
what the migrations actually implement.

## Migrations

| File | Contents |
| --- | --- |
| `0001_core.sql` | schema + privileges, `normalize_answer`, `fold_key`, `school_key`, `profiles`, `is_admin()`, `current_student_id()`, `require_*`, `system_settings`, `admin_audit_logs`, `schools`, `student_profiles`, `student_code_seq` |
| `0002_curriculum.sql` | curricula, versions, objectives, lessons (published-version guard), `lesson_content_packages` (immutable once published, one published per lesson), `lesson_admin_material`, `curriculum_sources` |
| `0003_learning.sql` | assignments, `program_events`, sessions, section progress, session events, breaks, attempts, mastery, assessment results, completion records, achievements, rewards; student SELECT policies |
| `0004_academic_coaching.sql` | school subjects/exams/results (net trigger), speaking sessions + notes, learning profiles, weekly reports |
| `0005_ai_admin.sql` | `ai_jobs`, `data_deletion_requests` |
| `0006_rpc_student.sql` | grading, package helpers, student RPCs |
| `0007_rpc_admin.sql` | admin RPCs, `next_student_code()` |
| `0008_storage.sql` | buckets + `storage.objects` policies (skipped without a `storage` schema) |

## Security model

- Roles come from `lugu.profiles` only. `is_admin()` = active admin; `current_student_id()` = the
  caller if they are a student. Both are `security definer stable`, `search_path = ''`.
- `anon` has no schema usage, no table grants, no function grants.
- Every function has EXECUTE revoked from `public`/`anon`; `authenticated` gets only the RPCs below
  plus the RLS helpers. Internals (`grade_response`, `student_session`, `audit`, …) are not callable.
  **Any new migration that creates functions must end with the same revoke/grant block.**
- RLS is on for every table:
  - Students SELECT their own rows in `profiles`, `student_profiles`, `program_assignments`,
    `learning_sessions`, `session_section_progress`, `session_events`, `break_sessions`,
    `question_attempts`, `vocabulary_mastery`, `assessment_results`, `lesson_completion_records`,
    `progress_rewards`, `student_achievement_records`; curriculum structure (curricula, versions,
    objectives, lessons) only for versions assigned to them; `schools` and `achievements` are
    readable by any signed-in user.
  - Students have **no** write policy anywhere; all learning writes go through RPCs.
  - Students can never read `lesson_content_packages`, `lesson_admin_material`, `curriculum_sources`,
    `ai_jobs`, `admin_audit_logs`, `program_events`, coaching, academic, profiles/reports,
    `system_settings`, `data_deletion_requests`.
  - Admins: full CRUD on admin tables; SELECT only on history (attempts, sessions, events, mastery,
    results, completion records, `program_events`, audit logs); INSERT of `manual` rewards.

## RPCs

Arguments use the names below (supabase-js named args). Payload types are in
`src/lib/database.types.ts`.

Student (caller must be an active student for writes; `student_home`/`student_learning_map` also
work while paused):

| RPC | Notes |
| --- | --- |
| `student_home()` | profile, open assignments with current lesson, XP, achievements, mastered words |
| `student_learning_map(assignment_id)` | lessons with `state` `completed`/`current`/`in_progress`/`locked`; the current lesson of an active assignment wins over an existing record |
| `student_lesson_content(lesson_id)` | `{package_id, lesson_id, revision, content}`; the open session's revision if any, else the published one; assessment `answer`/`accept`/`hint`/`explain` removed, order tokens reshuffled |
| `start_or_resume_session(lesson_id, kind='primary')` | `{session, sections}`; one active session per (student, lesson, kind) |
| `save_section_state(session_id, section, state, active_seconds_delta=0)` | delta capped at 600 s per call; state ≤ 256 KB |
| `complete_section(session_id, section)` | idempotent; order + criteria enforced |
| `record_answer(session_id, section, question_id, response, response_ms, hint_used)` | review/story/explanation/homework → `{correct, expected, attempt_no}` |
| `record_vocab_answer(session_id, item_id, direction, chosen, response_ms)` | `{correct, mastered, correct_count, expected}` |
| `submit_assessment(session_id, answers)` | once per session; `answers` = `{questionId: response}` |
| `record_session_event(session_id, kind, data)` | `idle_end` with `data.idle_seconds` adds idle time |
| `start_break(session_id, after_section, planned_minutes)` / `end_break(break_id)` | one open break per session |
| `complete_lesson(session_id)` | idempotent per session; see rules below |
| `search_schools(q)` / `add_school(name, city, district, country='Türkiye')` | dedupe by `normalized_key`; merged schools resolve to the survivor |
| `update_my_profile(first_name, last_name, display_name, grade, school_id, avatar_key)` | null = unchanged; sets `profile_completed_at` once first name, grade, school and avatar are set |
| `mark_password_changed()` | clears the caller's `must_change_password` |

Admin (each writes `admin_audit_logs`): `admin_assign_program(student_id, version_id, start_lesson_id)`,
`admin_set_progress(assignment_id, action, lesson_id, note)`, `admin_set_package_status(package_id, status)`,
`admin_publish_version(version_id)`, `admin_new_version(curriculum_id)`, `admin_merge_schools(from_id, into_id)`.
Service role only: `next_student_code()`.

### Learning rules

- Section order: review (optional, never blocks), vocabulary, vocab_quiz, story, explanation,
  homework, assessment. A section whose `completion.require*` flag is false is optional.
- Criteria: vocab_quiz — every item mastered (primary: `vocabulary_mastery.mastered_at`; replay:
  two correct since a miss within the replay's own attempts); story — every question attempted;
  homework — every group's three questions correct at least once in the session; assessment —
  submitted.
- Mastery (primary only): correct → `correct_count + 1`; miss → `incorrect_count + 1`,
  `correct_count = 0`; `mastered_at` set at 2 and never cleared.
- `complete_lesson` re-checks every required section, then `minAssessmentPercent` (> 0 requires a
  submitted assessment at or above it). Primary: one `lesson_completion_records` row per session;
  XP (`rewards.lesson_xp`, default 100) and `lessons_completed` achievements only on the student's
  first completion of that lesson; the assignment advances to the next non-archived lesson or
  becomes `completed`. Replay: only the session is closed.
- Admin progress: forward/backward/set_lesson abandon the active primary session of the lesson the
  student leaves; restart_lesson abandons the current one; archive abandons all. Nothing is deleted;
  every action writes `program_events`. A lesson the student is sent back to is taken again as a
  normal primary session.
- Packages: publishing requires `approved` and a well-formed document, and archives the previous
  published revision. Published/archived-after-publish content is immutable. Published versions
  cannot reorder/remove/add lessons or return to draft; `admin_new_version` copies objectives,
  lessons and published packages (with admin material) into a new draft.
- Academic: `net = correct − incorrect × academic.wrong_penalty` (default 0.25), set by trigger;
  `correct + incorrect + blank ≤ total`. `weekly_learning_reports.week_start` must be a Monday.

### Grading

`lugu.grade_response(question, response)` mirrors `src/domain/grading.ts`; the shared cases in
`src/domain/grading-cases.ts` run against both (`tests/db/grading.test.ts`). Choice: integer equal
to the original option index. Order: exact element-wise equality with `answer`. Text: normalised,
non-empty response equals a normalised `accept`. Normalisation: NFC → `’‘`→`'` → `İI`→`i` → lower →
collapse JS-`\s` whitespace → trim → strip trailing `.!?` → trim.

## Error codes

RPCs raise `P0001` with one of these messages (stable, for UI mapping):

| Code | Meaning |
| --- | --- |
| `LUGU_FORBIDDEN` | caller is not an (active) admin / not signed in with a profile |
| `LUGU_NOT_STUDENT` | caller is not a student |
| `LUGU_ACCOUNT_INACTIVE` | student account paused or disabled |
| `LUGU_INVALID_ARGUMENT` | bad enum value, empty name, malformed `answers`/`data` |
| `LUGU_INVALID_SECTION` | unknown section, or section that takes no answers |
| `LUGU_INVALID_PROFILE` | profile field fails validation |
| `LUGU_STATE_TOO_LARGE` | resume snapshot over 256 KB |
| `LUGU_SESSION_NOT_FOUND` / `LUGU_SESSION_NOT_ACTIVE` | not the caller's session / already completed or abandoned |
| `LUGU_ASSIGNMENT_NOT_FOUND` / `LUGU_ASSIGNMENT_NOT_ACTIVE` / `LUGU_ASSIGNMENT_ARCHIVED` | assignment state |
| `LUGU_LESSON_NOT_ASSIGNED` | lesson not in any open assignment of the student |
| `LUGU_LESSON_LOCKED` | lesson is neither current nor completed |
| `LUGU_LESSON_NOT_CURRENT` | admin moved the student away from this session's lesson |
| `LUGU_USE_REPLAY` | lesson already completed and not current: start a replay |
| `LUGU_REPLAY_NOT_AVAILABLE` | replay of a lesson that was never completed |
| `LUGU_NO_PUBLISHED_PACKAGE` | lesson has no published content |
| `LUGU_SECTION_LOCKED` | an earlier required section is not completed |
| `LUGU_SECTION_CRITERIA_NOT_MET` | section's completion criteria not met |
| `LUGU_QUESTION_NOT_FOUND` / `LUGU_ITEM_NOT_FOUND` | id not in the session's package/section |
| `LUGU_USE_SUBMIT_ASSESSMENT` / `LUGU_USE_VOCAB_ANSWER` | wrong RPC for that section |
| `LUGU_ASSESSMENT_ALREADY_SUBMITTED` | one submission per session |
| `LUGU_ASSESSMENT_BELOW_MINIMUM` | `minAssessmentPercent` not reached |
| `LUGU_LESSON_INCOMPLETE` | `complete_lesson` before all required sections (detail = section) |
| `LUGU_BREAK_ALREADY_OPEN` / `LUGU_BREAK_NOT_FOUND` | break state |
| `LUGU_SCHOOL_NOT_FOUND` | unknown or merged target school |
| `LUGU_STUDENT_NOT_FOUND` / `LUGU_CURRICULUM_NOT_FOUND` / `LUGU_VERSION_NOT_FOUND` / `LUGU_PACKAGE_NOT_FOUND` | admin targets |
| `LUGU_VERSION_NOT_PUBLISHED` / `LUGU_VERSION_EMPTY` / `LUGU_VERSION_LOCKED` | version state |
| `LUGU_LESSON_NOT_IN_PROGRAM` | lesson not in the assignment's version |
| `LUGU_ALREADY_ASSIGNED` | open assignment for that version exists |
| `LUGU_NO_NEXT_LESSON` / `LUGU_NO_PREVIOUS_LESSON` / `LUGU_NO_CURRENT_LESSON` | progress move impossible |
| `LUGU_INVALID_STATUS_TRANSITION` | package/version/assignment status change not allowed |
| `LUGU_PACKAGE_IMMUTABLE` / `LUGU_PACKAGE_INVALID` | published content edit / malformed package on publish |

## Edge functions

- `admin-students` (POST, admin JWT): `create` → `{student_id, student_code, password}` (password
  shown once); `reset-password` → `{password}`; `set-status` (`paused`/`disabled` ban in Auth,
  `active` unbans). Admin check reads `lugu.profiles` via the service role.
- `process-deletion` (POST `{request_id, confirm_student_code}`): approves if needed, deletes the
  Auth user (all student rows cascade), marks the request `completed`/`failed`, audits.
- Shared: `_shared/auth.ts` (`requireAdmin`, `serviceClient`, `audit`), `_shared/cors.ts`
  (`LUGU_ALLOWED_ORIGINS`, default `*`).

## Running locally

```sh
pnpm vitest run --project db      # PGlite: migrations, RLS, RPC flow, grading parity, seed
supabase start                    # local stack (Docker); applies migrations + seed.sql
supabase db reset                 # re-apply from scratch
supabase functions serve          # edge functions
```

### Create the first admin

No admin is seeded. With the local stack running (Studio at http://127.0.0.1:54323 → Auth → Add
user, "Auto confirm"), or on a hosted project in the dashboard, create the user, then in the SQL
editor:

```sql
insert into lugu.profiles (user_id, role) select id, 'admin' from auth.users where email = 'you@example.com';
```

### Deploy

```sh
supabase link --project-ref <ref>
supabase db push                  # applies pending migrations (never seed.sql)
supabase functions deploy admin-students process-deletion
supabase secrets set LUGU_ALLOWED_ORIGINS=https://your-app.example
```

In the dashboard: disable sign-ups and email confirmation, and add `lugu` to the exposed schemas
(API settings) — the hosted project does not read `config.toml`.

## Tests

`tests/db/harness.ts` stubs Supabase (`auth.users`, `auth.uid()/jwt()/role()`, `anon` /
`authenticated` / `service_role`), applies all migrations, and runs calls as a user with
`set local role` + `request.jwt.claims`. `tests/db/database-types.check.ts` is a compile-only check
that the types drive supabase-js.
