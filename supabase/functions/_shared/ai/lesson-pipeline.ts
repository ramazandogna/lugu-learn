/**
 * The lesson content pipeline: curriculum intake → validated LessonPackage
 * draft + admin material + QA report. See `docs/ai-workflow.md`.
 *
 * It is a checkpointed step machine so that every step fits one edge-function
 * invocation (Supabase wall-clock limits); the state after each step is stored
 * in `ai_jobs.output.checkpoint` and the next invocation continues from it.
 *
 * Steps (each model step is one structured call, validated by zod, one repair):
 *   plan                Curriculum Analyst + Learning Designer
 *   content_core        Vocabulary Specialist + Story Designer        → meta, vocabulary, story
 *   content_practice    Lesson Designer + Practice Designer          → explanation, homework
 *   content_assessment  Assessment Designer                          → assessment, review
 *                       (Content Integrator rules apply to all three; the merge is validated in code)
 *   qa                  deterministic QA (code) + Educational QA
 *   revision            Reviser: only the sections with blockers; back to qa (max 2 rounds)
 *   admin_material      Teacher Guide Designer + Speaking Coach + Visual Asset Planner
 *   save                insert `ai_generated` revision + admin material. Never publishes.
 */
import { z } from 'zod'
import { AdminLessonMaterial, CharacterKey, LessonPackage, QaReport, SECTION_KEYS, SpeakingPlan, TeacherGuide, VisualPlan } from '@/domain/content.ts'
import { buildLessonContextBlocks } from './context.ts'
import type { ContextBlock, Effort, ModelClient } from './model.ts'
import { UsageMeter } from './model.ts'
import { LESSON_STAGES, LESSON_SYSTEM, combine, contentIntegrator, promptVersions, section } from './prompts/index.ts'
import { deterministicQa, hasBlocker, isPackageSection, PACKAGE_SECTIONS, type PackageSection, type QaIssue } from './qa.ts'
import { StageError, callStructured } from './structured.ts'
import type { JobStore, LessonStore } from './store.ts'

const Text = z.string().trim().min(1)
const Slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/)

/** Output of the `plan` step. Kept in `ai_jobs.output.plan` for the admin. */
export const LessonPlan = z.object({
  analysis: z.object({
    level: Text,
    objectives: z.array(z.object({ id: Slug, text: Text })).min(1).max(6),
    grammar: z.array(Text),
    vocabularyCandidates: z.array(Text).min(10),
    prerequisites: z.array(Text),
    scope: Text,
    outOfScope: z.array(Text),
    skills: z.array(Text),
    notes: z.string().optional(),
  }),
  design: z.object({
    theme: Text,
    setting: Text,
    character: CharacterKey,
    strategy: Text,
    cognitiveLoad: Text,
    estimatedMinutes: z.number().int().min(5).max(180),
    sections: z.array(z.object({ key: z.enum(SECTION_KEYS), minutes: z.number().int().min(1).max(60), focus: Text })),
    reviewFocus: z.array(Text),
  }),
})
export type LessonPlan = z.infer<typeof LessonPlan>

const QaFinding = z.object({
  severity: z.enum(['blocker', 'major', 'minor']),
  section: z.enum([...PACKAGE_SECTIONS, 'general']),
  message: Text,
  suggestion: z.string().optional(),
})
/** Output of the AI part of the `qa` step. */
export const AiQaResult = z.object({ issues: z.array(QaFinding) })

/** Output of `admin_material`: AdminLessonMaterial with every part required. */
export const AdminMaterialDraft = z.object({ teacherGuide: TeacherGuide, speakingPlan: SpeakingPlan, visualPlan: VisualPlan })

const S = LessonPackage.shape
const CorePart = z.object({ meta: S.meta, vocabulary: S.vocabulary, story: S.story })
const PracticePart = z.object({ explanation: S.explanation, homework: S.homework })
const AssessmentPart = z.object({ assessment: S.assessment, review: S.review })

export const LESSON_STEPS = [
  'plan',
  'content_core',
  'content_practice',
  'content_assessment',
  'qa',
  'revision',
  'admin_material',
  'save',
] as const
export type LessonStep = (typeof LESSON_STEPS)[number]

const QaIssueSchema = QaReport.shape.issues.element

/** The checkpoint stored in `ai_jobs.output.checkpoint` between invocations. */
export const LessonJobState = z.object({
  step: z.enum(LESSON_STEPS),
  plan: LessonPlan.optional(),
  core: CorePart.optional(),
  practice: PracticePart.optional(),
  pkg: LessonPackage.optional(),
  issues: z.array(QaIssueSchema).default([]),
  rounds: z.number().int().nonnegative().default(0),
  admin: AdminMaterialDraft.optional(),
  usage: z
    .object({ inputTokens: z.number(), outputTokens: z.number(), cacheReadInputTokens: z.number(), cacheCreationInputTokens: z.number(), calls: z.number() })
    .default({ inputTokens: 0, outputTokens: 0, cacheReadInputTokens: 0, cacheCreationInputTokens: 0, calls: 0 }),
})
export type LessonJobState = z.infer<typeof LessonJobState>

export interface PipelineOptions {
  /** Revision rounds after the first QA. The brief caps this at 2. */
  maxRevisionRounds: number
  effort: Record<'plan' | 'content' | 'qa' | 'revision' | 'admin', Effort>
  maxTokens: Record<'plan' | 'content' | 'qa' | 'revision' | 'admin', number>
}

export const DEFAULT_PIPELINE_OPTIONS: PipelineOptions = {
  maxRevisionRounds: 2,
  effort: { plan: 'medium', content: 'high', qa: 'high', revision: 'high', admin: 'medium' },
  maxTokens: { plan: 16_000, content: 32_000, qa: 16_000, revision: 48_000, admin: 32_000 },
}

export const LessonJobInput = z.object({
  lessonId: z.string().uuid(),
  instructions: z.string().max(4000).nullish(),
  /** Use anonymised class-level weak items for the review section. */
  includeClassWeakItems: z.boolean().default(true),
})
export type LessonJobInput = z.infer<typeof LessonJobInput>

export interface LessonPipelineDeps {
  model: ModelClient
  jobs: JobStore
  lessons: LessonStore
  options?: Partial<PipelineOptions>
  now?: () => Date
}

export type LessonJobResult =
  | { status: 'succeeded'; packageId: string; revision: number; qaReport: QaReport; revisionRounds: number }
  | { status: 'failed'; error: string }
  /** Stopped between steps because the invocation's budget is used up; continue with the same job id. */
  | { status: 'paused'; step: LessonStep }

const json = (v: unknown) => JSON.stringify(v, null, 2)

/** Sum of speaking-plan block minutes (target ≈ 60). */
export function speakingPlanMinutes(p: SpeakingPlan): number {
  return [p.warmUp, p.vocabulary, p.grammar, p.rolePlay, p.listening, p.weaknessReinforcement, p.freeSpeaking].reduce(
    (n, b) => n + b.minutes,
    0,
  )
}

/** Merges replacement sections into a package; the result is validated by the caller. */
export function mergeSections(pkg: LessonPackage, patch: Record<string, unknown>): unknown {
  const out: Record<string, unknown> = { ...pkg }
  for (const [k, v] of Object.entries(patch)) if (isPackageSection(k)) out[k] = v
  return out
}

function revisionSchema(sections: readonly PackageSection[]): z.ZodType<Record<string, unknown>> {
  const shape: Record<string, z.ZodType> = {}
  for (const s of sections) shape[s] = S[s]
  return z.object(shape)
}

/** Ids already used and references a later content part may point to. */
function partRefs(core: z.infer<typeof CorePart>, practice?: z.infer<typeof PracticePart>) {
  const ids = new Set<string>([...core.vocabulary.map((v) => v.id), ...core.story.questions.map((q) => q.id)])
  if (practice)
    for (const s of practice.explanation.steps) if (s.check) ids.add(s.check.id)
  if (practice) for (const g of practice.homework.groups) for (const q of [g.complete, g.order, g.meaning]) ids.add(q.id)
  return { ids, objectives: new Set(core.meta.objectives.map((o) => o.id)), vocab: new Set(core.vocabulary.map((v) => v.id)) }
}

function questionRefErrors(
  questions: { id: string; objectiveId?: string; vocabId?: string }[],
  refs: ReturnType<typeof partRefs>,
): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const q of questions) {
    if (refs.ids.has(q.id) || seen.has(q.id)) errors.push(`${q.id}: id already used in the package`)
    seen.add(q.id)
    if (q.objectiveId && !refs.objectives.has(q.objectiveId)) errors.push(`${q.id}: unknown objectiveId ${q.objectiveId}`)
    if (q.vocabId && !refs.vocab.has(q.vocabId)) errors.push(`${q.id}: unknown vocabId ${q.vocabId}`)
  }
  return errors
}

const RULES = section('package_rules', contentIntegrator.instructions)

class LessonPipeline {
  private usage = new UsageMeter()
  private readonly opts: PipelineOptions
  private context: ContextBlock[] = []

  constructor(
    private readonly deps: LessonPipelineDeps,
    private readonly jobId: string,
  ) {
    this.opts = {
      ...DEFAULT_PIPELINE_OPTIONS,
      ...deps.options,
      effort: { ...DEFAULT_PIPELINE_OPTIONS.effort, ...deps.options?.effort },
      maxTokens: { ...DEFAULT_PIPELINE_OPTIONS.maxTokens, ...deps.options?.maxTokens },
    }
  }

  private now() {
    return (this.deps.now ?? (() => new Date()))().toISOString()
  }

  private call<T>(stage: string, instruction: string, schema: z.ZodType<T>, kind: keyof PipelineOptions['effort'], validate?: (v: T) => string[]) {
    return callStructured(
      this.deps.model,
      {
        stage,
        system: LESSON_SYSTEM,
        context: this.context,
        instruction,
        schema,
        maxTokens: this.opts.maxTokens[kind],
        effort: this.opts.effort[kind],
        ...(validate ? { validate } : {}),
      },
      this.usage,
    )
  }

  /** Runs one step and returns the next state. */
  private async step(st: LessonJobState, input: LessonJobInput): Promise<LessonJobState | { done: LessonJobResult }> {
    switch (st.step) {
      case 'plan': {
        const plan = await this.call(
          'plan',
          [section('task', combine(LESSON_STAGES.plan)), 'Return { analysis, design } for this one lesson.'].join('\n\n'),
          LessonPlan,
          'plan',
        )
        return { ...st, step: 'content_core', plan }
      }
      case 'content_core': {
        const plan = need(st.plan, 'plan')
        const core = await this.call(
          'content_core',
          [
            section('lesson_plan', json(plan)),
            section('task', combine(LESSON_STAGES.content_core)),
            RULES,
            'Write meta (title, tagline, theme, character, level, estimatedMinutes, objectives from the plan, grammar), vocabulary and story. Return { meta, vocabulary, story }.',
          ].join('\n\n'),
          CorePart,
          'content',
          (c) => {
            const refs = partRefs({ ...c, story: { ...c.story, questions: [] } })
            const errors = questionRefErrors(c.story.questions, refs)
            const vocabIds = c.vocabulary.map((v) => v.id)
            if (new Set(vocabIds).size !== vocabIds.length) errors.push('vocabulary: duplicate ids')
            return errors
          },
        )
        return { ...st, step: 'content_practice', core }
      }
      case 'content_practice': {
        const core = need(st.core, 'core')
        const refs = partRefs(core)
        const practice = await this.call(
          'content_practice',
          [
            section('lesson_plan', json(need(st.plan, 'plan'))),
            section('package_so_far', json(core)),
            section('task', combine(LESSON_STAGES.content_practice)),
            RULES,
            'Return { explanation, homework }.',
          ].join('\n\n'),
          PracticePart,
          'content',
          (p) => {
            const qs = [
              ...p.explanation.steps.flatMap((s) => (s.check ? [s.check] : [])),
              ...p.homework.groups.flatMap((g) => [g.complete, g.order, g.meaning]),
            ]
            const errors = questionRefErrors(qs, refs)
            for (const g of p.homework.groups) if (!refs.objectives.has(g.objectiveId)) errors.push(`${g.id}: unknown objectiveId ${g.objectiveId}`)
            return errors
          },
        )
        return { ...st, step: 'content_assessment', practice }
      }
      case 'content_assessment': {
        const core = need(st.core, 'core')
        const practice = need(st.practice, 'practice')
        const holder: { pkg?: LessonPackage } = {}
        await this.call(
          'content_assessment',
          [
            section('lesson_plan', json(need(st.plan, 'plan'))),
            section('package_so_far', json({ ...core, ...practice })),
            section('task', combine(LESSON_STAGES.content_assessment)),
            RULES,
            'Return { assessment, review }.',
          ].join('\n\n'),
          AssessmentPart,
          'content',
          (a) => {
            // Content Integrator: the merged package must satisfy the full schema.
            const res = LessonPackage.safeParse({ schemaVersion: 1, ...core, ...practice, ...a })
            if (!res.success) return res.error.issues.map((i) => `${i.path.join('.') || '(package)'}: ${i.message}`)
            holder.pkg = res.data
            return []
          },
        )
        return { ...st, step: 'qa', pkg: need(holder.pkg, 'package') }
      }
      case 'qa': {
        const det = deterministicQa(need(st.pkg, 'package'))
        const pkg = det.pkg ?? need(st.pkg, 'package')
        const ai = await this.call(
          `qa_round_${st.rounds}`,
          [
            section('package', json(pkg)),
            section('deterministic_findings', json(det.issues)),
            section('task', combine(LESSON_STAGES.qa)),
            'Return { issues }.',
          ].join('\n\n'),
          AiQaResult,
          'qa',
        )
        const issues: QaIssue[] = [
          ...det.issues,
          ...ai.issues.map((i) => ({
            severity: i.severity,
            area: i.section,
            message: `ai: ${i.message}${i.suggestion ? ` → ${i.suggestion}` : ''}`,
          })),
        ]
        const revisable = blockerSections(issues)
        const next: LessonStep = hasBlocker(issues) && st.rounds < this.opts.maxRevisionRounds && revisable.length ? 'revision' : 'admin_material'
        return { ...st, step: next, pkg, issues }
      }
      case 'revision': {
        const pkg = need(st.pkg, 'package')
        const sections = blockerSections(st.issues)
        const round = st.rounds + 1
        const holder: { pkg?: LessonPackage } = {}
        try {
          await this.call(
            `revision_${round}`,
            [
              section('package', json(pkg)),
              section('qa_issues', json(st.issues.filter((i) => sections.some((s) => s === i.area)))),
              section('sections_to_replace', sections.join(', ')),
              section('task', combine(LESSON_STAGES.revision)),
              `Return an object with exactly these keys: ${sections.join(', ')}.`,
            ].join('\n\n'),
            revisionSchema(sections),
            'revision',
            (patch) => {
              const res = LessonPackage.safeParse(mergeSections(pkg, patch))
              if (!res.success) return res.error.issues.map((i) => `${i.path.join('.') || '(package)'}: ${i.message}`)
              holder.pkg = res.data
              return []
            },
          )
        } catch (e) {
          if (!(e instanceof StageError)) throw e
          const issues: QaIssue[] = [...st.issues, { severity: 'major', area: 'general', message: `revision ${round} failed: ${e.message}` }]
          return { ...st, step: 'admin_material', rounds: round, issues }
        }
        return { ...st, step: 'qa', rounds: round, pkg: need(holder.pkg, 'revised package') }
      }
      case 'admin_material': {
        const pkg = need(st.pkg, 'package')
        const sceneIds = new Set(pkg.story.scenes.map((s) => s.id))
        const admin = await this.call(
          'admin_material',
          [
            section('lesson_plan', json(need(st.plan, 'plan'))),
            section('package', json(pkg)),
            section('task', combine(LESSON_STAGES.admin_material)),
            'Return { teacherGuide, speakingPlan, visualPlan }.',
          ].join('\n\n'),
          AdminMaterialDraft,
          'admin',
          (m) => {
            const errors: string[] = []
            const minutes = speakingPlanMinutes(m.speakingPlan)
            if (minutes < 50 || minutes > 70) errors.push(`speakingPlan blocks sum to ${minutes} minutes; plan about 60`)
            for (const s of m.visualPlan.scenes) if (!sceneIds.has(s.sceneId)) errors.push(`visualPlan: unknown sceneId ${s.sceneId}`)
            return errors
          },
        )
        return { ...st, step: 'save', admin }
      }
      case 'save': {
        const pkg = need(st.pkg, 'package')
        const admin: AdminLessonMaterial = need(st.admin, 'admin material')
        const qaReport: QaReport = { passed: !hasBlocker(st.issues), issues: st.issues, checkedAt: this.now() }
        const saved = await this.deps.lessons.saveDraft({ lessonId: input.lessonId, jobId: this.jobId, content: pkg, admin, qaReport })
        await this.deps.jobs.update(this.jobId, {
          status: 'succeeded',
          stage: 'done',
          packageId: saved.packageId,
          error: null,
          model: this.deps.model.model,
          inputTokens: this.usage.totalInputTokens,
          outputTokens: this.usage.outputTokens,
          output: {
            packageId: saved.packageId,
            revision: saved.revision,
            qaPassed: qaReport.passed,
            revisionRounds: st.rounds,
            issueCounts: countBySeverity(st.issues),
            plan: st.plan,
            promptVersions: promptVersions(),
            usage: snapshotUsage(this.usage),
          },
        })
        return { done: { status: 'succeeded', packageId: saved.packageId, revision: saved.revision, qaReport, revisionRounds: st.rounds } }
      }
    }
  }

  async advance(input: LessonJobInput, limits: AdvanceLimits): Promise<LessonJobResult> {
    const job = await this.deps.jobs.get(this.jobId)
    if (!job) throw new Error(`ai_job ${this.jobId} not found`)
    if (job.status === 'succeeded' || job.status === 'failed') throw new Error(`ai_job ${this.jobId} is already ${job.status}`)
    const saved = (job.output as { checkpoint?: unknown } | null)?.checkpoint
    let st: LessonJobState = saved ? LessonJobState.parse(saved) : LessonJobState.parse({ step: 'plan' })
    this.usage = Object.assign(new UsageMeter(), st.usage)

    await this.deps.jobs.update(this.jobId, { status: 'running', stage: `loading_context:${st.step}` })
    const ctx = await this.deps.lessons.loadLessonContext(input.lessonId, {
      includeClassWeakItems: input.includeClassWeakItems,
      adminInstructions: input.instructions ?? null,
    })
    this.context = buildLessonContextBlocks(ctx)

    const started = limits.clock()
    let steps = 0
    for (;;) {
      await this.deps.jobs.update(this.jobId, { status: 'running', stage: stageLabel(st) })
      const next = await this.step(st, input)
      if ('done' in next) return next.done
      st = { ...next, usage: snapshotUsage(this.usage) }
      steps += 1
      await this.deps.jobs.update(this.jobId, {
        stage: stageLabel(st),
        output: { checkpoint: st },
        model: this.deps.model.model,
        inputTokens: this.usage.totalInputTokens,
        outputTokens: this.usage.outputTokens,
      })
      if (steps >= limits.maxSteps || limits.clock() - started >= limits.budgetMs) return { status: 'paused', step: st.step }
    }
  }

  async fail(error: unknown): Promise<LessonJobResult> {
    const message =
      error instanceof StageError
        ? [error.message, ...error.details.slice(0, 20).map((d) => `- ${d}`)].join('\n')
        : error instanceof Error
          ? error.message
          : String(error)
    await this.deps.jobs.update(this.jobId, {
      status: 'failed',
      error: message,
      model: this.deps.model.model,
      inputTokens: this.usage.totalInputTokens,
      outputTokens: this.usage.outputTokens,
    })
    return { status: 'failed', error: message }
  }
}

function need<T>(v: T | undefined, what: string): T {
  if (v === undefined) throw new Error(`pipeline state is missing ${what}`)
  return v
}

function blockerSections(issues: readonly QaIssue[]): PackageSection[] {
  return [...new Set(issues.filter((i) => i.severity === 'blocker').map((i) => i.area).filter(isPackageSection))]
}

function stageLabel(st: LessonJobState): string {
  return st.step === 'qa' ? `qa_round_${st.rounds}` : st.step === 'revision' ? `revision_${st.rounds + 1}` : st.step
}

function snapshotUsage(u: UsageMeter) {
  return {
    inputTokens: u.inputTokens,
    outputTokens: u.outputTokens,
    cacheReadInputTokens: u.cacheReadInputTokens,
    cacheCreationInputTokens: u.cacheCreationInputTokens,
    calls: u.calls,
  }
}

function countBySeverity(issues: readonly QaIssue[]) {
  return {
    blocker: issues.filter((i) => i.severity === 'blocker').length,
    major: issues.filter((i) => i.severity === 'major').length,
    minor: issues.filter((i) => i.severity === 'minor').length,
  }
}

export interface AdvanceLimits {
  /** Stop after this many steps (the edge adapter uses 1 by default). */
  maxSteps: number
  /** Stop between steps once this much time has passed since the invocation began. */
  budgetMs: number
  clock: () => number
}

/**
 * Advances one `lesson_package` job from its checkpoint until it finishes,
 * fails, or `limits` are reached (`paused`: call again with the same job id).
 * Never throws: failures are written to `ai_jobs` and returned.
 *
 * @param deps   model client and stores (injected; no runtime globals)
 * @param jobId  an existing `ai_jobs` row of kind `lesson_package`
 * @param input  the validated request body stored in `ai_jobs.input`
 */
export async function advanceLessonJob(
  deps: LessonPipelineDeps,
  jobId: string,
  input: LessonJobInput,
  limits: AdvanceLimits,
): Promise<LessonJobResult> {
  const pipeline = new LessonPipeline(deps, jobId)
  try {
    return await pipeline.advance(input, limits)
  } catch (e) {
    return pipeline.fail(e)
  }
}

/** Runs a job to completion in one process (tests, local scripts). */
export function runLessonJob(deps: LessonPipelineDeps, jobId: string, input: LessonJobInput): Promise<LessonJobResult> {
  return advanceLessonJob(deps, jobId, input, { maxSteps: Number.POSITIVE_INFINITY, budgetMs: Number.POSITIVE_INFINITY, clock: () => 0 })
}
