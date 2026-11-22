import { describe, expect, it } from 'vitest'

import { createLessonFlow } from '@/engine/lesson-flow'
import { testPackage } from '@/engine/testing/package'

import { initialSection, resumePoint } from './resume'

const pkg = testPackage()

describe('resume mapping', () => {
  it('maps server rows to flow input and snapshots', () => {
    const p = resumePoint([
      { section: 'vocabulary', status: 'completed', state: { v: 1, index: 3, seen: [] } },
      { section: 'vocab_quiz', status: 'in_progress', state: { v: 1 } },
      { section: 'story', status: 'not_started', state: {} },
    ])
    expect(p.completed).toEqual(['vocabulary'])
    expect(p.started).toEqual(['vocab_quiz'])
    expect(Object.keys(p.snapshots)).toEqual(['vocabulary', 'vocab_quiz'])
    expect(p.resumed).toBe(true)
  })

  it('a fresh session is not a resume', () => {
    expect(resumePoint([{ section: 'vocabulary', status: 'not_started', state: {} }]).resumed).toBe(false)
  })

  it('opens the server current section when enterable, else the next to do', () => {
    const f = createLessonFlow(pkg, { completed: ['vocabulary'], started: ['vocab_quiz'] })
    expect(initialSection(f, 'vocab_quiz')).toBe('vocab_quiz')
    // Locked (story needs the quiz first) → the first section left to do.
    expect(initialSection(f, 'homework')).toBe('vocab_quiz')
    // Already completed → move on rather than reopen it.
    expect(initialSection(f, 'vocabulary')).toBe('vocab_quiz')
    expect(initialSection(f, null)).toBe('vocab_quiz')
  })
})
