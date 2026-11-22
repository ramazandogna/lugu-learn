/** Test-only fixtures. Not imported by app code. */
import { testPackage } from '@/engine/testing/package'
import type { Json } from '@/lib/database.types'

/** What `student_lesson_content` sends: assessment keys stripped. */
export function strippedContent(): Json {
  const pkg = testPackage()
  const strip = (q: Record<string, unknown>) => {
    const { answer: _a, accept: _b, hint: _c, explain: _d, ...rest } = q
    return rest
  }
  return JSON.parse(
    JSON.stringify({
      ...pkg,
      assessment: {
        quiz: pkg.assessment.quiz.map((q) => strip(q)),
        reading: { ...pkg.assessment.reading, questions: pkg.assessment.reading.questions.map((q) => strip(q)) },
      },
    }),
  ) as Json
}

