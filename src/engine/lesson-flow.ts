/**
 * The section state machine of one lesson session, for the UI. The server
 * (`complete_section`, `complete_lesson`) re-checks every rule; this module
 * only decides what the player may show.
 *
 * Rules:
 * - Sections run in `SECTION_KEYS` order. `review` is present only when the
 *   package has review questions or the runtime supplies review items, and it
 *   is never mandatory (it may be skipped).
 * - `vocabulary` and `explanation` are always mandatory; `vocab_quiz`,
 *   `story`, `homework`, `assessment` are mandatory when their completion rule
 *   is on.
 * - A section is `locked` while any mandatory section before it is not
 *   completed: a mandatory section can never be skipped. Completed sections
 *   can always be re-entered.
 * - A break is offered after completing a section when another section
 *   follows; never inside the final assessment (it is a single section).
 */
import type { LessonPackage, SectionKey } from '@/domain/content'
import { SECTION_KEYS } from '@/domain/content'

export type SectionStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface LessonFlow {
  /** Present sections, in order. */
  sections: SectionKey[]
  mandatory: Set<SectionKey>
  started: Set<SectionKey>
  completed: Set<SectionKey>
  /** Optional sections the student chose to skip (still enterable). */
  skipped: Set<SectionKey>
  current: SectionKey | null
}

type Rules = LessonPackage['completion']

export interface FlowInit {
  /** Weak items from earlier lessons the runtime adds to the review. */
  runtimeReviewCount?: number
  /** Resume from the server's `session_section_progress`. */
  started?: readonly SectionKey[]
  completed?: readonly SectionKey[]
}

/** Which sections a package has and which are mandatory. */
export function createLessonFlow(pkg: Pick<LessonPackage, 'review' | 'completion'>, init: FlowInit = {}): LessonFlow {
  const hasReview = pkg.review.questions.length > 0 || (init.runtimeReviewCount ?? 0) > 0
  const sections = SECTION_KEYS.filter((k) => k !== 'review' || hasReview)
  const r = pkg.completion
  const required: Record<SectionKey, boolean> = {
    review: false,
    vocabulary: true,
    vocab_quiz: r.requireVocabMastery,
    story: r.requireStory,
    explanation: true,
    homework: r.requireHomework,
    assessment: r.requireAssessment || r.minAssessmentPercent > 0,
  }
  const present = (k: SectionKey) => sections.includes(k)
  return {
    sections,
    mandatory: new Set(sections.filter((k) => required[k])),
    started: new Set((init.started ?? []).filter(present)),
    completed: new Set((init.completed ?? []).filter(present)),
    skipped: new Set(),
    current: null,
  }
}

/** Status of one section; absent sections are `locked`. */
export function sectionStatus(f: LessonFlow, k: SectionKey): SectionStatus {
  const i = f.sections.indexOf(k)
  if (i < 0) return 'locked'
  if (f.completed.has(k)) return 'completed'
  const blocked = f.sections.slice(0, i).some((p) => f.mandatory.has(p) && !f.completed.has(p))
  if (blocked) return 'locked'
  return f.started.has(k) ? 'in_progress' : 'available'
}

/** Every present section with its status, for the progress bar. */
export const sectionStatuses = (f: LessonFlow) => f.sections.map((k) => ({ section: k, status: sectionStatus(f, k), mandatory: f.mandatory.has(k) }))

/** Present and not locked: completed sections can be revisited, later mandatory ones cannot be skipped to. */
export const canEnter = (f: LessonFlow, k: SectionKey) => f.sections.includes(k) && sectionStatus(f, k) !== 'locked'

/** Open a section. False (no change) when it cannot be entered. */
export function enter(f: LessonFlow, k: SectionKey): boolean {
  if (!canEnter(f, k)) return false
  f.current = k
  if (!f.completed.has(k)) f.started.add(k)
  return true
}

/** Mark a section completed. False when it is locked or absent. */
export function complete(f: LessonFlow, k: SectionKey): boolean {
  if (!canEnter(f, k)) return false
  f.completed.add(k)
  f.started.delete(k)
  return true
}

/** Skip an optional section (review). Mandatory sections cannot be skipped. */
export function skip(f: LessonFlow, k: SectionKey): boolean {
  if (!f.sections.includes(k) || f.mandatory.has(k) || f.completed.has(k)) return false
  f.skipped.add(k)
  f.started.delete(k)
  if (f.current === k) f.current = null
  return true
}

/** The first present section neither completed nor skipped; null when all are done. */
export const nextSection = (f: LessonFlow): SectionKey | null =>
  f.sections.find((k) => !f.completed.has(k) && !f.skipped.has(k)) ?? null

/**
 * Whether to offer a break after `k`: it is completed and another section is
 * still to do. Never after the last section, never inside the assessment.
 */
export const offersBreakAfter = (f: LessonFlow, k: SectionKey) => f.completed.has(k) && k !== 'assessment' && nextSection(f) !== null

/** What the session has achieved, as the server's records describe it. */
export interface CompletionRecords {
  /** Every vocabulary item mastered (server `vocabulary_mastery`). */
  vocabMastered: boolean
  storyCompleted: boolean
  homeworkCompleted: boolean
  assessmentSubmitted: boolean
  /** The server-graded assessment percent; null before submission. */
  assessmentPercent: number | null
}

export type CompletionGap = 'vocab_mastery' | 'story' | 'homework' | 'assessment' | 'assessment_percent'

/**
 * Mirrors `CompletionRules` (the server's `complete_lesson` is authoritative).
 * Item mastery is the primary requirement and is never replaced by a high
 * percentage; `minAssessmentPercent > 0` additionally requires a submitted
 * assessment at or above it.
 */
export function isLessonComplete(rules: Rules, rec: CompletionRecords): { complete: boolean; missing: CompletionGap[] } {
  const missing: CompletionGap[] = []
  if (rules.requireVocabMastery && !rec.vocabMastered) missing.push('vocab_mastery')
  if (rules.requireStory && !rec.storyCompleted) missing.push('story')
  if (rules.requireHomework && !rec.homeworkCompleted) missing.push('homework')
  if ((rules.requireAssessment || rules.minAssessmentPercent > 0) && !rec.assessmentSubmitted) missing.push('assessment')
  else if (rules.minAssessmentPercent > 0 && (rec.assessmentPercent ?? 0) < rules.minAssessmentPercent) missing.push('assessment_percent')
  return { complete: missing.length === 0, missing }
}
