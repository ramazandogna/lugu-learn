import { describe, expect, it } from 'vitest'

import { actualSeconds, breakStatus, isBreakMinutes, isOver, remaining, startBreak, startNextSection } from './break'

const T0 = 1_700_000_000_000
const min = 60_000

describe('break', () => {
  it('counts down, then waits for an explicit start', () => {
    const b = startBreak(10, T0)
    expect(breakStatus(b, T0)).toBe('running')
    expect(remaining(b, T0)).toBe(600)
    expect(remaining(b, T0 + 1)).toBe(600)
    expect(remaining(b, T0 + 9 * min + 30_000)).toBe(30)
    expect(isOver(b, T0 + 10 * min - 1)).toBe(false)
    expect(breakStatus(b, T0 + 10 * min)).toBe('over-awaiting-start')
    expect(breakStatus(b, T0 + 60 * min)).toBe('over-awaiting-start') // never auto-advances
    expect(remaining(b, T0 + 60 * min)).toBe(0)
    const e = startNextSection(b, T0 + 12 * min)
    expect(e).toMatchObject({ endedAt: T0 + 10 * min, nextSectionStartedAt: T0 + 12 * min, earlyReturn: false })
    expect(breakStatus(e, T0 + 12 * min)).toBe('ended')
    expect(actualSeconds(e, T0 + 99 * min)).toBe(600)
  })

  it('records an early return', () => {
    const b = startBreak(15, T0)
    const e = startNextSection(b, T0 + 4 * min)
    expect(e).toMatchObject({ endedAt: T0 + 4 * min, earlyReturn: true })
    expect(actualSeconds(e, T0 + 20 * min)).toBe(240)
    expect(startNextSection(e, T0 + 5 * min)).toBe(e)
    expect(b.endedAt).toBeNull() // pure
  })

  it('0 minutes means continue now', () => {
    const b = startBreak(0, T0)
    expect(breakStatus(b, T0)).toBe('ended')
    expect(actualSeconds(b, T0 + min)).toBe(0)
  })

  it('only offers the agreed lengths', () => {
    expect([0, 10, 15, 20, 30].every(isBreakMinutes)).toBe(true)
    expect(isBreakMinutes(5)).toBe(false)
    expect(actualSeconds(startBreak(20, T0), T0 + 90_000)).toBe(90)
  })
})
