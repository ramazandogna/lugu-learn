import { describe, expect, it } from 'vitest'

import type { StudentLearningMap } from '@/lib/database.types'

import { lessonRoute, lockedReason, toMapNodes, upcoming } from './map'

const lesson = (id: string, sequence: number, state: StudentLearningMap['lessons'][number]['state'], teacher_locked = false) => ({
  id,
  sequence,
  title: id,
  estimated_minutes: 30,
  state,
  teacher_locked,
  replay_available: state === 'completed',
  completed_at: null,
  tagline: null,
  character: null,
})
const map: StudentLearningMap = {
  assignment: { id: 'a', status: 'active', current_lesson_id: 'l2', curriculum_name: 'K', selection: false },
  lessons: [lesson('l1', 1, 'completed'), lesson('l2', 2, 'current'), lesson('l3', 3, 'locked'), lesson('l4', 4, 'locked'), lesson('l5', 5, 'locked')],
}

describe('learning map mapping', () => {
  it('maps server states to node states', () => {
    expect(toMapNodes(map.lessons).map((n) => n.state)).toEqual(['completed', 'available', 'locked', 'locked', 'locked'])
  })
  it('routes completed lessons to replay and locked to nowhere', () => {
    expect(lessonRoute(map.lessons[0]!)).toBe('/ders/l1/tekrar')
    expect(lessonRoute(map.lessons[1]!)).toBe('/ders/l2')
    expect(lessonRoute(map.lessons[2]!)).toBeNull()
  })
  it('explains a lock kindly', () => {
    expect(lockedReason(map.lessons[2]!, map)).toMatch(/şu anki dersini bitirince/)
    expect(lockedReason(map.lessons[4]!, map)).toMatch(/3 ders sonra/)
    expect(lockedReason(map.lessons[2]!, { ...map, assignment: { ...map.assignment, status: 'paused' } })).toMatch(/duraklatıldı/)
  })
  it('asks the teacher for a lesson they did not open, and counts only open stops ahead', () => {
    const sel: StudentLearningMap = {
      ...map,
      assignment: { ...map.assignment, selection: true },
      lessons: [lesson('l1', 1, 'completed'), lesson('l2', 2, 'current'), lesson('l3', 3, 'locked', true), lesson('l4', 4, 'locked'), lesson('l5', 5, 'locked', true)],
    }
    expect(lockedReason(sel.lessons[2]!, sel)).toMatch(/Öğretmeninden/)
    expect(lockedReason(sel.lessons[3]!, sel)).toMatch(/şu anki dersini bitirince/)
  })
  it('lists upcoming lessons after the current one', () => {
    expect(upcoming(map, 2).map((l) => l.id)).toEqual(['l3', 'l4'])
  })
})
