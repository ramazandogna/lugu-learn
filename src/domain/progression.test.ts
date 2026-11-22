import { describe, expect, it } from 'vitest'

import { deriveLessonStates, sessionKindFor, type ProgressionInput } from './progression'

const lessons = [
  { id: 'l3', sequence: 3 },
  { id: 'l1', sequence: 1 },
  { id: 'l2', sequence: 2 },
  { id: 'l4', sequence: 4 },
]
const base: ProgressionInput = {
  lessons,
  currentLessonId: 'l2',
  completedLessonIds: ['l1'],
  activePrimaryLessonIds: [],
  assignmentStatus: 'active',
}
const states = (i: ProgressionInput) => deriveLessonStates(i).map((l) => `${l.id}:${l.state}`)

describe('lesson progression', () => {
  it('completed → current → locked, in sequence order', () => {
    expect(states(base)).toEqual(['l1:completed', 'l2:available', 'l3:locked', 'l4:locked'])
    expect(deriveLessonStates(base)[0]?.replayable).toBe(true)
    expect(deriveLessonStates(base)[1]?.replayable).toBe(false)
  })

  it('an active primary session marks the current lesson in progress', () => {
    expect(states({ ...base, activePrimaryLessonIds: ['l2', 'l3'] })).toEqual(['l1:completed', 'l2:in_progress', 'l3:locked', 'l4:locked'])
  })

  it('paused: nothing new opens, completed lessons stay replayable', () => {
    expect(states({ ...base, assignmentStatus: 'paused', activePrimaryLessonIds: ['l2'] })).toEqual([
      'l1:completed',
      'l2:locked',
      'l3:locked',
      'l4:locked',
    ])
  })

  it('a lesson the admin moved past without a record stays locked', () => {
    expect(states({ ...base, currentLessonId: 'l4' })).toEqual(['l1:completed', 'l2:locked', 'l3:locked', 'l4:available'])
  })

  it('a completed lesson made current again (moved back / restarted) is taken again', () => {
    expect(states({ ...base, currentLessonId: 'l1' })).toEqual(['l1:available', 'l2:locked', 'l3:locked', 'l4:locked'])
  })

  it('a completed assignment has no current lesson', () => {
    expect(states({ ...base, currentLessonId: null, completedLessonIds: ['l1', 'l2', 'l3', 'l4'], assignmentStatus: 'completed' })).toEqual([
      'l1:completed',
      'l2:completed',
      'l3:completed',
      'l4:completed',
    ])
  })

  it('maps states to the session kind', () => {
    expect(sessionKindFor('completed')).toBe('replay')
    expect(sessionKindFor('available')).toBe('primary')
    expect(sessionKindFor('in_progress')).toBe('primary')
    expect(sessionKindFor('locked')).toBeNull()
  })
})
