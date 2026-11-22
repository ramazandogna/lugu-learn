import { describe, expect, it } from 'vitest'

import { parseStudentPackage } from './package'
import { strippedContent } from './testing'

describe('parseStudentPackage', () => {
  it('accepts a stripped package and keeps assessment views keyless', () => {
    const p = parseStudentPackage(strippedContent())
    expect(p.vocabulary.length).toBeGreaterThan(0)
    expect(p.assessment.quiz.length).toBeGreaterThan(0)
    expect(p.assessment.quiz.every((q) => !('answer' in q))).toBe(true)
    expect(p.completion.requireVocabMastery).toBe(true)
  })
  it('rejects something that is not a package', () => {
    expect(() => parseStudentPackage({ meta: {} })).toThrow()
    expect(() => parseStudentPackage(null)).toThrow()
  })
})
