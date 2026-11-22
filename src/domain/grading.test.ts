import { describe, expect, it } from 'vitest'

import { gradeCases, normalizeCases, vocabCases } from './grading-cases'
import { gradeResponse, gradeVocab, normalizeAnswer } from './grading'

describe('normalizeAnswer', () => {
  it.each(normalizeCases)('$input → $expected', ({ input, expected }) => {
    expect(normalizeAnswer(input)).toBe(expected)
  })
})

describe('gradeResponse', () => {
  it.each(gradeCases)('$name', ({ question, response, correct }) => {
    expect(gradeResponse(question, response)).toBe(correct)
  })
})

describe('gradeVocab', () => {
  it.each(vocabCases)('$name', ({ item, direction, chosen, correct }) => {
    expect(gradeVocab(item, direction, chosen)).toBe(correct)
  })
})
