import { describe, expect, it } from 'vitest'

import type { Question } from '@/domain/content'

import { allAttempted, attempt, boldSegments, restorePractice } from './practice'

const q: Question = { id: 'c1', type: 'choice', prompt: 'Pick', options: ['a', 'b'], answer: 1 }

describe('practice helpers', () => {
  it('counts attempts and remembers a correct answer', () => {
    const s = restorePractice(undefined, ['c1'], 1)
    expect(attempt(s, q, 0)).toEqual({ correct: false, attemptNo: 1 })
    expect(attempt(s, q, 1)).toEqual({ correct: true, attemptNo: 2 })
    expect(s.answered.c1).toEqual({ attempts: 2, correct: true })
    expect(allAttempted(s, ['c1'])).toBe(true)
  })
  it('restores only known, well-formed entries', () => {
    const s = restorePractice({ index: 9, answered: { c1: { attempts: 1, correct: true }, x: { attempts: 1, correct: true }, c2: { attempts: -1, correct: true } } }, ['c1', 'c2'], 2)
    expect(s.index).toBe(0)
    expect(Object.keys(s.answered)).toEqual(['c1'])
  })
  it('splits **bold** only', () => {
    expect(boldSegments('I **am** here')).toEqual([
      { text: 'I ', bold: false },
      { text: 'am', bold: true },
      { text: ' here', bold: false },
    ])
  })
})
