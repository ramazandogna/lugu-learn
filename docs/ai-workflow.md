# Lugu AI workflow

How Lugu turns admin-supplied curriculum material into a lesson draft, and how it drafts learner insights for the teacher. Claude is called only from Supabase Edge Functions. The browser never calls it.

## 1. Architecture

```
Admin app ──POST /ai-generate {lessonId}──▶ ai-generate (Deno adapter, index.ts)
   ▲                                         │ 1. verify caller is an active admin (user JWT → lugu.profiles)
   │ polls lugu.ai_jobs (RLS: admin)         │ 2. insert ai_jobs (service role) → 202 {jobId}
   │                                         │ 3. EdgeRuntime.waitUntil(advance one step)
   │                                         ▼
   │                         _shared/ai (runtime-agnostic core, vitest-tested)
   │                           handler.ts → lesson-pipeline.ts (step machine)
   │                             ├─ context.ts        curriculum sources, previous lessons, class aggregates
   │                             ├─ structured.ts     zod-validated structured call + 1 repair
   │                             ├─ qa.ts             deterministic QA
   │                             ├─ prompts/*.ts      one module per role
   │                             └─ store.ts ports ── supabase-store.ts (service role)
   │                                         │ checkpoint → ai_jobs.output.checkpoint
   │                                         └─ self-call {action:'continue'} for the next step
   └──────────────── lesson_content_packages (status ai_generated) + lesson_admin_material

ai-insights ── same auth/job pattern → insights/observed.ts (facts in code) → insights/pipeline.ts (one call)
ModelClient ── adapters/anthropic.ts (Anthropic SDK, Deno only); tests use a scripted fake
```

## 2. Lesson pipeline steps

| Step | Roles (prompt modules) | Output |
| --- | --- | --- |
| `plan` | Curriculum Analyst + Learning Designer | `LessonPlan` (analysis + design) |
| `content_core` | Vocabulary Specialist + Story Designer | `meta`, `vocabulary`, `story` |
| `content_practice` | Lesson Designer + Practice Designer | `explanation`, `homework` |
| `content_assessment` | Assessment Designer | `assessment`, `review` |
| (all content steps) | Content Integrator rules; code merges the parts and validates them with `LessonPackage` | full `LessonPackage` |
| `qa` | deterministic QA (code), then Educational QA | `QaReport` issues |
| `revision` | Reviser, only the sections that have blockers | replacement sections, then `qa` again (max 2 rounds) |
| `admin_material` | Teacher Guide Designer + Speaking Coach + Visual Asset Planner | `AdminLessonMaterial` with all three parts |
| `save` | — | new revision `ai_generated`, origin `ai`, plus admin material and the final QA report |

There are 6 model calls on the happy path and up to 10 with two revision rounds (plus at most one repair per call). Roles are grouped into calls to keep cost down, and each role stays a separate documented module.

## 3. Prompts

Each role is a module in `supabase/functions/_shared/ai/prompts/` with `role`, `version`, `purpose` and `instructions`, and has a matching page in [`docs/prompts/`](prompts/). The system prompts are documented in [system.md](prompts/system.md).

- Lesson roles: [curriculum-analyst](prompts/curriculum-analyst.md), [learning-designer](prompts/learning-designer.md), [vocabulary-specialist](prompts/vocabulary-specialist.md), [story-designer](prompts/story-designer.md), [lesson-designer](prompts/lesson-designer.md), [practice-designer](prompts/practice-designer.md), [assessment-designer](prompts/assessment-designer.md), [content-integrator](prompts/content-integrator.md), [educational-qa](prompts/educational-qa.md), [revision](prompts/revision.md), [speaking-coach](prompts/speaking-coach.md), [teacher-guide-designer](prompts/teacher-guide-designer.md), [visual-asset-planner](prompts/visual-asset-planner.md).
- Insight roles: [learning-profile](prompts/learning-profile.md), [weekly-report](prompts/weekly-report.md), [academic-insight](prompts/academic-insight.md).

When you change a prompt, bump its `version` and then update its page. `tests/ai/prompt-docs.test.ts` fails if a page and its module drift apart. `ai_jobs.output.promptVersions` records which prompt versions produced each draft.

## 4. Context retrieval

`supabaseLessonStore.loadLessonContext` collects:

- The curriculum (name, grade, target level) and the lesson (title, sequence, objectives from `curriculum_objectives`, where `code` is used as the objective id, estimated minutes and source notes).
- `curriculum_sources` for this lesson, for its version, and for the curriculum as a whole. Text sources become text blocks; text over 100k characters is rejected, never truncated. PDFs from Storage `curriculum-sources` become base64 `document` blocks (20 MB limit), and images become `image` blocks. A `document` source with no extracted text is rejected.
- Earlier lessons' vocabulary and grammar, taken from their published (or newest) package. The prompts use these for review and to avoid new grammar.
- Optionally, **anonymised class-level weak items**: error rates per item on earlier packages (only items with at least 5 attempts and an error rate of at least 30%). No student ids are included.

The context is rendered once per job (`buildLessonContextBlocks`), and every step opens with the same blocks.

## 5. Schemas

- Student package: `LessonPackage` (`src/domain/content.ts`). Admin material: `AdminLessonMaterial`, `TeacherGuide`, `SpeakingPlan`, `VisualPlan`, `QaReport`.
- Insights: `src/domain/insights.ts`, which defines `ObservedFacts`, `LearningProfileInterpretation`, `SpeakingPlanDraft`, `WeeklyReport`, `AcademicInsight`, `InsightsRequest` and `collectEvidenceKeys`.
- Internal to the pipeline: `LessonPlan`, `AiQaResult`, `AdminMaterialDraft` and `LessonJobState` (`lesson-pipeline.ts`).

Each call sends its zod schema as JSON Schema through `output_config.format`. `json-schema.ts` first strips the keywords structured outputs does not support (string and number bounds, array lengths, `pattern`) and closes every object. zod then checks the full schema again, including refinements, on every response.

## 6. QA and revision

**Deterministic QA** (`qa.ts`) runs before the AI reviewer:

- `LessonPackage.safeParse`: ids, answer keys, order permutations, objective and vocabulary references, assessment ≠ homework.
- Vocabulary count: major issue outside 10–20.
- The story must use at least 70% of the vocabulary phrases. Matching ignores case and punctuation, treats all possessive pronouns as equal, and ignores third-person -s/-es and has/does/goes/is. Below 70% is a blocker.
- Reading: true/false questions and four-option fill-in questions (major issue if missing, minor if the count is off).
- Homework: 6–8 groups (minor issue otherwise).
- No hints or explanations in the final assessment.
- No URLs or HTML (blocker).
- Turkish fields are present and differ from the English.

The **AI QA** checks English and Turkish correctness, age suitability, curriculum alignment, answer keys and distractor quality. Each issue is tagged with a package section.

Each blocker sends its section(s) to `revision`. The model returns only those sections, the merged package must validate, and `qa` runs again. After 2 rounds the draft is still saved, with `qaReport.passed = false`, so the admin sees the outstanding blockers. A failed revision is recorded as a major issue.

## 7. Approval workflow

The status flow is Draft → **AI Generated** → QA → Review → Approved → Published → Archived. The pipeline only ever inserts `ai_generated`. Only an admin moves a draft forward (`lugu.admin_set_package_status`), and only a `published` package reaches students. A published revision is immutable; edits create a new revision.

## 8. Jobs, timeouts and polling

Supabase Edge Functions have a wall-clock limit (150 s on the free plan, 400 s on paid plans) that also applies to `EdgeRuntime.waitUntil` work. So the lesson job is a **checkpointed step machine**:

- Each invocation runs `LUGU_AI_STEPS_PER_INVOCATION` steps (default 1), with `LUGU_AI_STEP_BUDGET_MS` as a soft budget between steps.
- After each step it writes `ai_jobs.output.checkpoint`.
- It then calls itself with `{action:'continue', jobId}`, authenticated by the service-role key in `x-lugu-internal`.

If a step is killed or the chain breaks, the job stays `running` with stage `stalled:<step>`, or simply stops updating. After 10 minutes the admin can send `{action:'resume', jobId}`, which continues from the checkpoint.

The admin UI polls `select status, stage, error, output, updated_at from lugu.ai_jobs where id = :jobId` every 3–5 s. RLS allows admins to read `ai_jobs`.

- `stage` values: `plan`, `content_core`, `content_practice`, `content_assessment`, `qa_round_<n>`, `revision_<n>`, `admin_material`, `save`, `done`.
- When the job succeeds, `output.packageId` points to the draft.

Insight jobs make a single call and run in one invocation.

## 9. Model, cost and latency

- **Model:** `claude-opus-5-5` by default (set `LUGU_AI_MODEL` to change it). Adaptive thinking is always on for this model, so depth is set with effort: `medium` for plan, admin material and insights, `high` for content, QA and revision.
- **Calls:** streaming through the official Anthropic SDK (`messages.stream().finalMessage()`). The SDK retries 429/5xx up to 3 times.
- **Fallback:** the server-side refusal fallback (`fallbacks: "default"`) is on by default. Set `LUGU_AI_FALLBACKS=off` to disable it.
- **Caching:** one prompt-cache breakpoint sits after the shared context, so later steps and revisions reuse the cached curriculum sources (a 5-minute TTL covers the self-chained steps). Cache use appears in `output.usage`.
- **Cost:** with one teacher and a few students, cost is dominated by lesson generation. Expect roughly 6–10 calls per lesson, with input repeated through the cache. Token totals are stored in `ai_jobs.input_tokens` and `output_tokens`.
- **Latency:** several minutes per lesson.

## 10. Configuration

| Secret / env | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | required; without it the functions return 503 `ai_not_configured` |
| `LUGU_AI_MODEL` | model id (default `claude-opus-5-5`) |
| `LUGU_AI_STRUCTURED_OUTPUT` | `off` = no `output_config.format` (prompt + zod only), fallback if a schema is rejected |
| `LUGU_AI_FALLBACKS` | `off` disables server-side refusal fallback |
| `LUGU_AI_STEPS_PER_INVOCATION`, `LUGU_AI_STEP_BUDGET_MS` | step chaining (defaults 1, 60000) |
| `LUGU_ALLOWED_ORIGIN` | CORS origin of the app (default `*`) |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | provided by Supabase |

## 11. Failure modes

| Failure | Behaviour |
| --- | --- |
| Invalid JSON or schema/validation errors | one repair request with the errors; second failure → job `failed` with the errors in `error` |
| Refusal or `max_tokens` | stage fails immediately |
| API 4xx | job fails |
| 429/5xx | SDK retries, then the job fails ("retry later") |
| Source too large or unreadable | job fails with an instruction for the admin |
| Wall-clock kill | job stalls; admin resumes |
| Blockers after 2 revisions | draft saved with a failing QA report |
| Weekly report already reviewed | never overwritten |
| Learner name found in an insight prompt | the call is refused (privacy guard) |

## 12. Privacy

Learners are children (10–16), so the prompts follow data minimisation:

- **Lesson pipeline:** the context contains curriculum material and anonymised class aggregates only. The `LessonContext` type has no field for learner data.
- **Insights:** the model receives computed facts, the grade, lesson content and teacher notes, and the learner is referred to as "öğrenci".
  - Names, display name, student code, school, e-mail addresses and phone numbers are scrubbed from free text (`privacy.ts`).
  - A final guard refuses to send a prompt if any name token remains.
  - No student id is sent.
- **Interpretation rules:** observed facts are computed in code, AI interpretations are kept separate, and teacher observations are stored apart and never rewritten by the AI.
  - Every AI statement must cite evidence keys that exist.
  - Wording must be a hypothesis. Personality, clinical and ability judgments are rejected.
- **Retention and training:** API inputs and outputs are not used to train models under Anthropic's commercial terms. Do not enable any data-sharing option. `ai_jobs` rows for a student are deleted together with the student (FK cascade).

## 13. Insights

- **Facts:** `computeObservedFacts` computes accuracy (overall and per section and trend), median response time, hint rate, repeated errors per item, vocabulary mastery, sessions and abandonment, idle ratio, breaks, assessment change, school exam net changes, and the speaking-note count.
- **Signals (§15.4):** `slow_accurate`, `fast_inaccurate`, `repeated_errors`, `improving`, `hint_dependent`, `consistent_mastery`, `repeated_abandonment`. They need at least 20 attempts (see `SIGNAL_THRESHOLDS`), and each lists the facts it is based on.

Actions:

- `learning_profile` upserts `student_learning_profiles.observed`, `ai_interpretation` and `generated_at`. `teacher_observations` is teacher-owned text and is only read (as `teacher.profile`).
- `speaking_plan` produces a 60-minute `SpeakingPlanDraft` for the current lesson, written to `speaking_sessions.plan` when `speakingSessionId` is given.
- `weekly_report` upserts a `draft` report in `weekly_learning_reports`.
- `academic_insight` describes exam trends, cites `exam.*` facts only, makes no causal claims, and is stored in `ai_jobs.output`.

## 14. Run and deploy

```bash
pnpm vitest run --project ai          # core tests with a scripted model (no network, no key)
supabase secrets set ANTHROPIC_API_KEY=... LUGU_AI_MODEL=claude-opus-5-5 LUGU_ALLOWED_ORIGIN=https://<app>
supabase functions deploy ai-generate
supabase functions deploy ai-insights
```

The import map is `supabase/functions/deno.json`. `@/` maps to `../../src/` so the functions share the domain schemas with the app. Check that your CLI version bundles files outside `supabase/functions`; if it does not, copy `src/domain` into `_shared/domain` at deploy time.
