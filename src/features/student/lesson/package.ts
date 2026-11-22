/**
 * The lesson package as the student client receives it from
 * `student_lesson_content`: a published `LessonPackage` whose assessment
 * questions have no keys, hints or explanations. The package was validated
 * when it was published, so this only checks the shape the player relies on
 * and fails loudly (an error screen) rather than rendering half a lesson.
 */
import type { AssessmentInput, AssessmentQuestionInput } from '@/engine/assessment'
import type { LessonPackage } from '@/domain/content'
import type { Json } from '@/lib/database.types'

export type StudentPackage = Omit<LessonPackage, 'assessment'> & { assessment: AssessmentInput }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isArr = (v: unknown): v is unknown[] => Array.isArray(v)

const DEFAULT_COMPLETION: LessonPackage['completion'] = {
  requireVocabMastery: true,
  requireStory: true,
  requireHomework: true,
  requireAssessment: true,
  minAssessmentPercent: 0,
}

function assessmentQuestion(q: unknown): AssessmentQuestionInput {
  if (!isObj(q) || typeof q.id !== 'string' || typeof q.prompt !== 'string') throw new Error('assessment question')
  if (q.type === 'choice' && isArr(q.options)) return { id: q.id, type: 'choice', prompt: q.prompt, options: q.options.map(String) }
  if (q.type === 'order' && isArr(q.tokens)) return { id: q.id, type: 'order', prompt: q.prompt, tokens: q.tokens.map(String) }
  if (q.type === 'text') return { id: q.id, type: 'text', prompt: q.prompt }
  throw new Error(`assessment question ${q.id}`)
}

/** Throws when the document is not a lesson package. */
export function parseStudentPackage(content: Json): StudentPackage {
  if (!isObj(content)) throw new Error('package')
  const { meta, vocabulary, story, explanation, homework, assessment } = content
  if (!isObj(meta) || !isArr(vocabulary) || !isObj(story) || !isArr(story.scenes) || !isArr(story.questions)) throw new Error('package body')
  if (!isObj(explanation) || !isArr(explanation.steps) || !isObj(homework) || !isArr(homework.groups)) throw new Error('package practice')
  if (!isObj(assessment) || !isArr(assessment.quiz) || !isObj(assessment.reading) || !isArr(assessment.reading.questions)) throw new Error('package assessment')
  const reading = assessment.reading
  const readingQuestions = reading.questions
  if (!isArr(readingQuestions)) throw new Error('package reading')
  const review = isObj(content.review) && isArr(content.review.questions) ? content.review : { questions: [] }
  const completion = isObj(content.completion) ? { ...DEFAULT_COMPLETION, ...content.completion } : DEFAULT_COMPLETION
  const steps = explanation.steps.map((s) => (isObj(s) && !isArr(s.examples) ? { ...s, examples: [] } : s))
  // Trusted beyond this point: the server validated the full schema on publish.
  const base = { ...content, review, completion, explanation: { steps } } as unknown as Omit<LessonPackage, 'assessment'>
  return {
    ...base,
    assessment: {
      quiz: assessment.quiz.map(assessmentQuestion),
      reading: {
        title: String(reading.title ?? ''),
        paragraphs: isArr(reading.paragraphs) ? reading.paragraphs.map(String) : [],
        questions: readingQuestions.map(assessmentQuestion),
      },
    },
  }
}
