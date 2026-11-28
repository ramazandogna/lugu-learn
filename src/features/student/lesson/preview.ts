/**
 * Admin preview: the real lesson player on a published package, with every
 * server write replaced by local grading. Nothing is stored, no XP or mastery
 * is recorded. Used by `features/admin/content/LessonPreviewView.vue`.
 *
 * The functions mirror the student API names `useLessonSession` calls, so the
 * session composable runs unchanged on top of them.
 */
import type { LessonPackage, Question } from '@/domain/content'
import { gradeResponse, gradeVocab, vocabTarget, type VocabDirection } from '@/domain/grading'
import type { AnswerResult, AssessmentScore, Json, LessonCompletion, SessionPayload, Tables, VocabAnswerResult } from '@/lib/database.types'

import type { LessonBackend } from './useLessonSession'

export const PREVIEW_SESSION_PREFIX = 'preview-'

const allQuestions = (pkg: LessonPackage): Question[] => [
  ...pkg.review.questions,
  ...pkg.story.questions,
  ...pkg.explanation.steps.flatMap((s) => (s.check ? [s.check] : [])),
  ...pkg.homework.groups.flatMap((g) => [g.complete, g.order, g.meaning]),
  ...pkg.assessment.quiz,
  ...pkg.assessment.reading.questions,
]

const expectedOf = (q: Question): Json => (q.type === 'text' ? (q.accept[0] ?? '') : q.answer)

export function createPreviewBackend(lessonId: string, packageId: string, pkg: LessonPackage): LessonBackend {
  const questions = new Map(allQuestions(pkg).map((q) => [q.id, q]))
  const vocab = new Map(pkg.vocabulary.map((v) => [v.id, v]))
  const attempts = new Map<string, number>()
  /** Correct answers since the last miss, per word: mastery = 2 (same rule as the server). */
  const streak = new Map<string, number>()
  const now = new Date().toISOString()
  const session: Tables<'learning_sessions'> = {
    id: `${PREVIEW_SESSION_PREFIX}${crypto.randomUUID()}`,
    assignment_id: 'preview',
    lesson_id: lessonId,
    package_id: packageId,
    student_id: 'preview',
    kind: 'primary',
    status: 'active',
    current_section: null,
    active_seconds: 0,
    break_seconds: 0,
    idle_seconds: 0,
    started_at: now,
    last_seen_at: now,
    created_at: now,
    updated_at: now,
    completed_at: null,
  }
  let assessmentPercent = 0

  return {
    getLessonContent: async () => ({ package_id: packageId, lesson_id: lessonId, revision: 0, content: pkg as unknown as Json }),
    getMasteredItems: async () => [],
    startOrResumeSession: async (): Promise<SessionPayload> => ({ session, sections: [] }),
    getOpenBreaks: async () => [],
    endBreak: async () => undefined as never,
    recordSessionEvent: async () => undefined,
    saveSectionState: async () => undefined,
    completeSection: async () => undefined as never,
    recordAnswer: async (a): Promise<AnswerResult> => {
      const q = questions.get(a.questionId)
      const n = (attempts.get(a.questionId) ?? 0) + 1
      attempts.set(a.questionId, n)
      // Review words built at runtime are not in the package: treat them as correct.
      return { correct: q ? gradeResponse(q, a.response) : true, expected: q ? expectedOf(q) : null, attempt_no: n }
    },
    recordVocabAnswer: async (a): Promise<VocabAnswerResult> => {
      const item = vocab.get(a.itemId)
      if (!item) return { correct: false, mastered: false, correct_count: 0, expected: '' }
      const correct = gradeVocab(item, a.direction as VocabDirection, a.chosen)
      const count = correct ? (streak.get(a.itemId) ?? 0) + 1 : 0
      streak.set(a.itemId, count)
      return { correct, mastered: count >= 2, correct_count: count, expected: vocabTarget(item, a.direction as VocabDirection) }
    },
    submitAssessment: async (_id, answers): Promise<AssessmentScore> => {
      const part = (qs: Question[], name: 'quiz' | 'reading') => qs.map((q) => ({ question_id: q.id, part: name, correct: gradeResponse(q, answers[q.id]) }))
      const results = [...part(pkg.assessment.quiz, 'quiz'), ...part(pkg.assessment.reading.questions, 'reading')]
      const pct = (rs: typeof results) => (rs.length ? Math.round((100 * rs.filter((r) => r.correct).length) / rs.length) : 0)
      const quiz = results.filter((r) => r.part === 'quiz')
      const reading = results.filter((r) => r.part === 'reading')
      assessmentPercent = pct(results)
      return {
        quiz_correct: quiz.filter((r) => r.correct).length,
        quiz_total: quiz.length,
        reading_correct: reading.filter((r) => r.correct).length,
        reading_total: reading.length,
        quiz_percent: pct(quiz),
        reading_percent: pct(reading),
        percent: assessmentPercent,
        results,
      }
    },
    completeLesson: async (): Promise<LessonCompletion> => ({
      completed: true,
      already_completed: false,
      kind: 'primary',
      xp_awarded: 0,
      achievements: [],
      next_lesson_id: null,
      assignment_status: 'active',
      stars: assessmentPercent >= 90 ? 3 : assessmentPercent >= 70 ? 2 : 1,
    }),
  }
}
