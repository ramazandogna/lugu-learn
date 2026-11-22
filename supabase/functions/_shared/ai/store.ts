/**
 * Persistence ports. The pipeline depends on these interfaces only; the
 * Supabase implementation is `supabase-store.ts`, tests use in-memory fakes.
 */
import type { AdminLessonMaterial, LessonPackage, QaReport } from '@/domain/content.ts'
import type { LearningProfileInterpretation, ObservedFacts } from '@/domain/insights.ts'
import type { LessonContext } from './context.ts'
import type { LearnerSnapshot } from './insights/observed.ts'

export type AiJobKind = 'lesson_package' | 'learning_profile' | 'speaking_plan' | 'weekly_report' | 'academic_insight'
export type AiJobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface AiJobPatch {
  status?: AiJobStatus
  stage?: string
  output?: unknown
  error?: string | null
  model?: string
  inputTokens?: number
  outputTokens?: number
  packageId?: string
}

export interface NewAiJob {
  kind: AiJobKind
  createdBy: string
  input: unknown
  lessonId?: string
  studentId?: string
}

export interface AiJobRow {
  id: string
  kind: AiJobKind
  status: AiJobStatus
  stage: string | null
  input: unknown
  output: unknown
  updatedAt: string
}

export interface JobStore {
  create(job: NewAiJob): Promise<{ id: string }>
  get(id: string): Promise<AiJobRow | null>
  /**
   * Compare-and-set claim: succeeds only if the job is still queued/running and
   * `updated_at` equals `expectedUpdatedAt` (bumps it). Prevents two invocations
   * from running the same step.
   */
  claim(id: string, expectedUpdatedAt: string, stage: string): Promise<boolean>
  update(id: string, patch: AiJobPatch): Promise<void>
}

export interface LessonDraft {
  lessonId: string
  jobId: string
  content: LessonPackage
  admin: AdminLessonMaterial
  qaReport: QaReport
}

export interface LessonStore {
  loadLessonContext(lessonId: string, opts: { includeClassWeakItems: boolean; adminInstructions: string | null }): Promise<LessonContext>
  /** Inserts the next revision with `status = 'ai_generated'`, `origin = 'ai'` and its admin material. Never publishes. */
  saveDraft(draft: LessonDraft): Promise<{ packageId: string; revision: number }>
}

export interface LearnerContextLoad {
  snapshot: LearnerSnapshot
  /** The learner's current lesson package and its teacher guide, when assigned. */
  currentLesson: { packageId: string; content: LessonPackage; admin: AdminLessonMaterial | null } | null
}

export interface InsightsStore {
  /** `since`: only learning records at or after this ISO time (weekly report); `null` for all. */
  loadLearner(studentId: string, since: string | null): Promise<LearnerContextLoad>
  saveLearningProfile(row: {
    studentId: string
    jobId: string
    observed: ObservedFacts
    aiInterpretation: LearningProfileInterpretation
    generatedAt: string
  }): Promise<void>
  /** Writes `speaking_sessions.plan` of one of this student's sessions. */
  saveSpeakingPlan(row: { studentId: string; speakingSessionId: string; plan: unknown; jobId: string }): Promise<void>
  /** Upserts the week's draft; must refuse to overwrite a report the teacher already reviewed. */
  saveWeeklyReport(row: { studentId: string; weekStart: string; content: unknown; jobId: string }): Promise<{ id: string }>
}
