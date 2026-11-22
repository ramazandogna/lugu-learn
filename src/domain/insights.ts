/**
 * Learning insights: the AI learning profile, the speaking plan draft, the weekly
 * report and academic observations.
 *
 * Every insight keeps three things apart (brief §19):
 * - **Observed** facts, computed in code from attempts, mastery, sessions,
 *   breaks, assessments, exams and speaking notes. Each fact has a stable `key`.
 * - **AI interpretation**: hypotheses written by the model. Every statement
 *   cites the `key`s of the facts (or teacher notes) it rests on, so the admin
 *   can inspect the source of each insight. Statements without evidence are
 *   rejected by the pipeline.
 * - **Teacher observations**: what the teacher wrote after speaking sessions,
 *   stored verbatim and never rewritten by the AI.
 *
 * The same schemas validate the edge function output and what the admin app
 * reads from `student_learning_profiles`, `weekly_learning_reports`,
 * `speaking_sessions.plan` and `ai_jobs.output`.
 */
import { z } from 'zod'
import { SpeakingPlan } from './content.ts'

const Text = z.string().trim().min(1)

/** `accuracy.overall`, `errors.repeated.hw-3-order`, `signal.hint_dependent`, `teacher.<note id>`. */
export const EvidenceKey = z.string().regex(/^[a-z][a-z0-9_.:-]{0,127}$/i, 'evidence key')

export const FactUnit = z.enum(['percent', 'ms', 'seconds', 'count', 'ratio', 'net', 'points', 'flag'])

/** One computed, verifiable fact about the learner. Produced by code, never by the model. */
export const ObservedFact = z.object({
  key: EvidenceKey,
  /** Short Turkish label for the admin UI. */
  label: Text,
  value: z.union([z.number(), z.string(), z.boolean()]),
  unit: FactUnit.optional(),
  /** How many records the fact is computed from. Small samples are flagged in the UI. */
  sampleSize: z.number().int().nonnegative(),
  /** Table(s) the fact is computed from, e.g. `question_attempts`. */
  source: Text,
  /** Optional context, e.g. the item a repeated error is about. */
  detail: z.string().optional(),
  /** For derived signals: the fact keys the signal is computed from. */
  basis: z.array(EvidenceKey).optional(),
})
export type ObservedFact = z.infer<typeof ObservedFact>

export const ObservedFacts = z.object({
  computedAt: z.string(),
  /** Inclusive ISO date range the facts cover. */
  window: z.object({ from: z.string().nullable(), to: z.string() }),
  facts: z.array(ObservedFact),
})
export type ObservedFacts = z.infer<typeof ObservedFacts>

export const TeacherObservation = z.object({
  /** Evidence key is `teacher.<id>`. */
  id: Text,
  at: z.string(),
  text: Text,
  speakingSessionId: z.string().optional(),
})
export type TeacherObservation = z.infer<typeof TeacherObservation>

export const Confidence = z.enum(['low', 'medium', 'high'])

/** An AI statement that must cite at least one observed fact or teacher note. */
export const EvidencedStatement = z.object({
  /** Turkish, worded as an observation or hypothesis ("…görünüyor", "…olabilir"). */
  text: Text,
  evidence: z.array(EvidenceKey).min(1),
  confidence: Confidence,
})
export type EvidencedStatement = z.infer<typeof EvidencedStatement>

export const PROFILE_STATEMENT_KINDS = [
  'strength',
  'weakness',
  'repeated_error',
  'mastered_skill',
  'unmastered_skill',
  'learning_preference',
  'trend',
  'next_step',
] as const
export const ProfileStatementKind = z.enum(PROFILE_STATEMENT_KINDS)

export const ProfileStatement = EvidencedStatement.extend({ kind: ProfileStatementKind })
export type ProfileStatement = z.infer<typeof ProfileStatement>

/** `student_learning_profiles.ai_interpretation`. */
export const LearningProfileInterpretation = z.object({
  /** Two or three Turkish sentences for the teacher. */
  summary: Text,
  statements: z.array(ProfileStatement),
  /** Things the data cannot answer yet; prompts for the teacher, not claims. */
  openQuestions: z.array(Text).default([]),
})
export type LearningProfileInterpretation = z.infer<typeof LearningProfileInterpretation>

/**
 * The `student_learning_profiles` row as the admin app reads it. The AI job
 * writes `observed`, `ai_interpretation` and `generated_at` only;
 * `teacher_observations` is the teacher's own free text and is never
 * overwritten (it is read as evidence key `teacher.profile`).
 */
export const LearningProfile = z.object({
  observed: ObservedFacts,
  aiInterpretation: LearningProfileInterpretation.nullable(),
  teacherObservations: z.string().nullable(),
  generatedAt: z.string().nullable(),
})
export type LearningProfile = z.infer<typeof LearningProfile>

/** `speaking_sessions.plan`: the 60-minute plan plus why it focuses where it does. */
export const SpeakingPlanDraft = z.object({
  plan: SpeakingPlan,
  /** Recurring errors and goals the plan targets, each with evidence. */
  focus: z.array(EvidencedStatement).max(6),
})
export type SpeakingPlanDraft = z.infer<typeof SpeakingPlanDraft>

/** `weekly_learning_reports.content`. AI-drafted, teacher-reviewed. */
export const WeeklyReport = z.object({
  weekStart: z.string(),
  /** Turkish, for the teacher. */
  summary: Text,
  highlights: z.array(EvidencedStatement),
  concerns: z.array(EvidencedStatement),
  nextSteps: z.array(EvidencedStatement),
})
export type WeeklyReport = z.infer<typeof WeeklyReport>

export const ACADEMIC_INSIGHT_KINDS = [
  'improvement',
  'decline',
  'potential_weakness',
  'study_recommendation',
  'coaching_question',
] as const
export const AcademicInsightKind = z.enum(ACADEMIC_INSIGHT_KINDS)

/** Stored in `ai_jobs.output`; trends only, never causal claims. */
export const AcademicInsight = z.object({
  summary: Text,
  observations: z.array(EvidencedStatement.extend({ kind: AcademicInsightKind })),
})
export type AcademicInsight = z.infer<typeof AcademicInsight>

export const INSIGHT_KINDS = ['learning_profile', 'speaking_plan', 'weekly_report', 'academic_insight'] as const
export const InsightKind = z.enum(INSIGHT_KINDS)
export type InsightKind = z.infer<typeof InsightKind>

/** Request body of the `ai-insights` edge function. */
export const InsightsRequest = z.discriminatedUnion('action', [
  z.object({ action: z.literal('learning_profile'), studentId: z.string().uuid() }),
  z.object({
    action: z.literal('speaking_plan'),
    studentId: z.string().uuid(),
    /** When given, the plan is written to `speaking_sessions.plan`. */
    speakingSessionId: z.string().uuid().optional(),
  }),
  z.object({
    action: z.literal('weekly_report'),
    studentId: z.string().uuid(),
    /** Monday of the week, `YYYY-MM-DD`. */
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  z.object({ action: z.literal('academic_insight'), studentId: z.string().uuid() }),
])
export type InsightsRequest = z.infer<typeof InsightsRequest>

/** Every `evidence` key found anywhere in an insight output. */
export function collectEvidenceKeys(value: unknown): string[] {
  const out: string[] = []
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') {
      for (const [k, child] of Object.entries(v)) {
        if (k === 'evidence' && Array.isArray(child)) child.forEach((e) => typeof e === 'string' && out.push(e))
        else walk(child)
      }
    }
  }
  walk(value)
  return out
}
