import { describe, expect, it } from 'vitest'

import { duration, historyRows } from './history'

describe('history', () => {
  it('attaches only real breaks to their session', () => {
    const rows = historyRows(
      [{ id: 's1', kind: 'primary', status: 'completed', started_at: '', completed_at: null, active_seconds: 600, break_seconds: 300, lesson_id: 'l', curriculum_lessons: { title: 'Hello', sequence: 1 } }],
      [
        { id: 'b1', session_id: 's1', planned_minutes: 10, started_at: '', ended_at: null, early_return: null },
        { id: 'b0', session_id: 's1', planned_minutes: 0, started_at: '', ended_at: null, early_return: null },
      ],
    )
    expect(rows[0]!.title).toBe('Ders 1 · Hello')
    expect(rows[0]!.breaks.map((b) => b.id)).toEqual(['b1'])
  })
  it('formats durations', () => {
    expect(duration(20)).toBe("1 dk'dan az")
    expect(duration(12 * 60)).toBe('12 dk')
    expect(duration(65 * 60)).toBe('1 sa 5 dk')
  })
})
