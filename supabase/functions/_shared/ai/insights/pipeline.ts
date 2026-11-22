/**
 * `ai-insights` actions. Each action: load the learner snapshot → compute
 * observed facts in code → one structured model call whose statements must
 * cite existing evidence keys → store. See `docs/ai-workflow.md` §Insights.
 */
import type { z } from 'zod'
import type { LessonPackage, AdminLessonMaterial } from '@/domain/content.ts'
import {
  AcademicInsight,
  LearningProfileInterpretation,
  SpeakingPlanDraft,
  WeeklyReport,
  collectEvidenceKeys,
  type InsightsRequest,
  type ObservedFacts,
  type TeacherObservation,
} from '@/domain/insights.ts'
import { UsageMeter, type Effort, type ModelClient } from '../model.ts'
import { containsPersonalName, scrubText, type PersonalNames } from '../privacy.ts'
import { INSIGHTS_SYSTEM, academicInsight, learningProfile, promptVersions, section, speakingCoach, weeklyReport } from '../prompts/index.ts'
import { StageError, callStructured } from '../structured.ts'
import type { InsightsStore, JobStore, LearnerContextLoad } from '../store.ts'
import { allowedEvidenceKeys, computeObservedFacts, teacherObservations, type LearnerSnapshot } from './observed.ts'

/** Words that would turn an observation into a personality or clinical judgment (TR + EN). */
const FORBIDDEN_JUDGMENTS = [
  'tembel',
  'lazy',
  'dikkat eksikliği',
  'dehb',
  'adhd',
  'disleksi',
  'dyslexi',
  'kaygı bozukluğu',
  'anxiety disorder',
  'depresyon',
  'depress',
  'zeka',
  'zekâ',
  'iq',
  'yeteneksiz',
  'aptal',
  'stupid',
  'kişilik özelli',
  'personality trait',
  'motivasyonsuz',
  'unmotivated',
]

/**
 * The model's interpretive prose: statement texts (objects carrying
 * `evidence`), summaries and open questions. Lesson language such as a
 * listening script is not scanned.
 */
function interpretiveText(value: unknown): string {
  const out: string[] = []
  const walk = (v: unknown, key: string): void => {
    if (typeof v === 'string') {
      if (key === 'summary' || key === 'openQuestions') out.push(v)
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key))
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if (Array.isArray(o.evidence) && typeof o.text === 'string') out.push(o.text)
      for (const [k, child] of Object.entries(o)) walk(child, k)
    }
  }
  walk(value, '')
  return out.join('\n')
}

/** Validation errors for unknown evidence keys and judgment wording. Exported for tests. */
export function checkInsightOutput(output: unknown, allowed: ReadonlySet<string>): string[] {
  const errors: string[] = []
  for (const key of collectEvidenceKeys(output))
    if (!allowed.has(key)) errors.push(`unknown evidence key "${key}": cite only keys from <observed_facts> or <teacher_notes>`)
  const text = interpretiveText(output).toLocaleLowerCase('tr')
  for (const w of FORBIDDEN_JUDGMENTS)
    if (new RegExp(`(?<![\\p{L}])${w}${w.length <= 3 ? '(?![\\p{L}])' : ''}`, 'u').test(text))
      errors.push(`"${w}": do not make personality, clinical or ability judgments; describe the observed behaviour`)
  return errors
}

export interface InsightPromptInput {
  observed: ObservedFacts
  notes: readonly TeacherObservation[]
  names: PersonalNames
  grade: string | null
  currentLesson: LearnerContextLoad['currentLesson']
  extra?: Record<string, unknown>
}

function lessonSummary(pkg: LessonPackage, admin: AdminLessonMaterial | null) {
  return {
    title: pkg.meta.title,
    level: pkg.meta.level,
    objectives: pkg.meta.objectives.map((o) => o.text),
    grammar: pkg.meta.grammar,
    vocabulary: pkg.vocabulary.map((v) => v.en),
    homeworkSentences: pkg.homework.groups.map((g) => g.order.answer.join(' ')),
    teacherGuide: admin
      ? { expectedDifficulties: admin.teacherGuide.expectedDifficulties, commonErrors: admin.teacherGuide.commonErrors }
      : null,
  }
}

/**
 * Renders the learner part of an insights prompt. Only facts, scrubbed teacher
 * notes, grade and lesson content are included — never names, codes or
 * contact data. A final guard throws if a name token survived.
 */
export function buildInsightContext(input: InsightPromptInput): string {
  const notes = input.notes.map((n) => ({ key: `teacher.${n.id}`, at: n.at, text: scrubText(n.text, input.names) }))
  const parts = [
    section('learner', JSON.stringify({ learner: 'öğrenci', grade: input.grade })),
    section('observed_facts', JSON.stringify(input.observed.facts, null, 2)),
    section('teacher_notes', JSON.stringify(notes, null, 2)),
  ]
  if (input.currentLesson)
    parts.push(section('current_lesson', JSON.stringify(lessonSummary(input.currentLesson.content, input.currentLesson.admin), null, 2)))
  if (input.extra) parts.push(section('request', JSON.stringify(input.extra)))
  const text = parts.join('\n\n')
  if (containsPersonalName(text, input.names)) throw new StageError('privacy', 'learner name found in prompt context; refusing to send')
  return text
}

export interface InsightsDeps {
  model: ModelClient
  jobs: JobStore
  store: InsightsStore
  now?: () => Date
  effort?: Effort
}

export type InsightsResult = { status: 'succeeded'; output: unknown } | { status: 'failed'; error: string }

async function generate<T>(
  deps: InsightsDeps,
  usage: UsageMeter,
  stage: string,
  instructions: string,
  context: string,
  schema: z.ZodType<T>,
  allowed: ReadonlySet<string>,
): Promise<T> {
  return callStructured(
    deps.model,
    {
      stage,
      system: INSIGHTS_SYSTEM,
      context: [{ type: 'text', text: context }],
      instruction: section('task', instructions),
      schema,
      maxTokens: 16_000,
      effort: deps.effort ?? 'medium',
      validate: (v) => checkInsightOutput(v, allowed),
    },
    usage,
  )
}

/** Monday 00:00 UTC of `weekStart` → ISO; the window for a weekly report. */
function weekWindow(weekStart: string): { since: string; until: string } {
  const since = new Date(`${weekStart}T00:00:00.000Z`)
  const until = new Date(since.getTime() + 7 * 24 * 3600 * 1000)
  return { since: since.toISOString(), until: until.toISOString() }
}

function filterSnapshotUntil(s: LearnerSnapshot, until: string): LearnerSnapshot {
  return {
    ...s,
    attempts: s.attempts.filter((a) => a.createdAt < until),
    sessions: s.sessions.filter((x) => x.startedAt < until),
    assessments: s.assessments.filter((a) => a.createdAt < until),
    speakingNotes: s.speakingNotes.filter((n) => n.at < until),
  }
}

/**
 * Runs one insights job. Never throws: failures are written to `ai_jobs`.
 *
 * @param deps   model client and stores
 * @param jobId  an existing `ai_jobs` row of the request's kind
 * @param req    validated request body
 */
export async function runInsightsJob(deps: InsightsDeps, jobId: string, req: InsightsRequest): Promise<InsightsResult> {
  const usage = new UsageMeter()
  const now = (deps.now ?? (() => new Date()))()
  try {
    await deps.jobs.update(jobId, { status: 'running', stage: 'loading_data' })
    const window = req.action === 'weekly_report' ? weekWindow(req.weekStart) : null
    const loaded = await deps.store.loadLearner(req.studentId, window?.since ?? null)
    const snapshot = window ? filterSnapshotUntil(loaded.snapshot, window.until) : loaded.snapshot
    const observed = computeObservedFacts(snapshot, now)
    const notes = teacherObservations(snapshot)
    const allowed = allowedEvidenceKeys(observed, notes)
    const base: InsightPromptInput = { observed, notes, names: snapshot.names, grade: snapshot.grade, currentLesson: loaded.currentLesson }
    await deps.jobs.update(jobId, { stage: 'generating' })

    let output: unknown
    let extraOutput: Record<string, unknown> = {}
    switch (req.action) {
      case 'learning_profile': {
        const ai = await generate(deps, usage, 'learning_profile', learningProfile.instructions, buildInsightContext(base), LearningProfileInterpretation, allowed)
        await deps.jobs.update(jobId, { stage: 'saving' })
        await deps.store.saveLearningProfile({
          studentId: req.studentId,
          jobId,
          observed,
          aiInterpretation: ai,
          generatedAt: now.toISOString(),
        })
        output = { observed, aiInterpretation: ai, teacherNotes: notes }
        break
      }
      case 'speaking_plan': {
        if (!loaded.currentLesson) throw new StageError('speaking_plan', 'the student has no current lesson with a package')
        const instructions = [
          speakingCoach.instructions,
          'Also return focus: up to 6 recurring errors or goals this session targets, each with evidence keys. Base weaknessReinforcement on them; when there is no evidence, use the teacher guide\'s expected difficulties and leave focus short.',
        ].join('\n\n')
        const draft = await generate(deps, usage, 'speaking_plan', instructions, buildInsightContext(base), SpeakingPlanDraft, allowed)
        if (req.speakingSessionId) {
          await deps.jobs.update(jobId, { stage: 'saving' })
          await deps.store.saveSpeakingPlan({ studentId: req.studentId, speakingSessionId: req.speakingSessionId, plan: draft, jobId })
        }
        output = draft
        break
      }
      case 'weekly_report': {
        const report = await generate(
          deps,
          usage,
          'weekly_report',
          weeklyReport.instructions,
          buildInsightContext({ ...base, extra: { weekStart: req.weekStart } }),
          WeeklyReport,
          allowed,
        )
        const content = { ...report, weekStart: req.weekStart }
        await deps.jobs.update(jobId, { stage: 'saving' })
        const saved = await deps.store.saveWeeklyReport({ studentId: req.studentId, weekStart: req.weekStart, content, jobId })
        output = content
        extraOutput = { reportId: saved.id }
        break
      }
      case 'academic_insight': {
        const academicFacts = { ...observed, facts: observed.facts.filter((f) => f.key.startsWith('exam.')) }
        if (!academicFacts.facts.length) throw new StageError('academic_insight', 'no school exam results recorded for this student')
        const academicAllowed = new Set(academicFacts.facts.map((f) => f.key))
        output = await generate(
          deps,
          usage,
          'academic_insight',
          academicInsight.instructions,
          buildInsightContext({ ...base, observed: academicFacts, notes: [], currentLesson: null }),
          AcademicInsight,
          academicAllowed,
        )
        break
      }
    }

    await deps.jobs.update(jobId, {
      status: 'succeeded',
      stage: 'done',
      model: deps.model.model,
      inputTokens: usage.totalInputTokens,
      outputTokens: usage.outputTokens,
      output: { result: output, observed, promptVersions: promptVersions(), ...extraOutput },
    })
    return { status: 'succeeded', output }
  } catch (e) {
    const error =
      e instanceof StageError ? [e.message, ...e.details.slice(0, 20).map((d) => `- ${d}`)].join('\n') : e instanceof Error ? e.message : String(e)
    await deps.jobs.update(jobId, {
      status: 'failed',
      error,
      model: deps.model.model,
      inputTokens: usage.totalInputTokens,
      outputTokens: usage.outputTokens,
    })
    return { status: 'failed', error }
  }
}
