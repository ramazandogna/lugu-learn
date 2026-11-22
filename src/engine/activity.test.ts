import { describe, expect, it } from 'vitest'

import { createActivity, flush, isIdle, record, tick, totals } from './activity'

const T0 = 1_700_000_000_000
const s_ = 1000

describe('activity tracker', () => {
  it('counts active time, then idle after 60 s without input', () => {
    const a = createActivity(T0)
    record(a, { type: 'input', at: T0 + 30 * s_ })
    expect(isIdle(a, T0 + 89 * s_)).toBe(false)
    expect(isIdle(a, T0 + 90 * s_)).toBe(true)
    expect(totals(a, T0 + 120 * s_)).toEqual({ activeSeconds: 90, idleSeconds: 30, breakSeconds: 0, hiddenSeconds: 0, interruptions: 0 })
  })

  it('separates hidden time and counts interruptions', () => {
    const a = createActivity(T0)
    record(a, { type: 'hidden', at: T0 + 10 * s_ })
    record(a, { type: 'hidden', at: T0 + 12 * s_ }) // duplicate: one interruption
    record(a, { type: 'visible', at: T0 + 40 * s_ })
    expect(totals(a, T0 + 50 * s_)).toEqual({ activeSeconds: 20, idleSeconds: 0, breakSeconds: 0, hiddenSeconds: 30, interruptions: 1 })
  })

  it('break time is its own bucket and hiding during a break is not an interruption', () => {
    const a = createActivity(T0)
    record(a, { type: 'break_start', at: T0 + 5 * s_ })
    record(a, { type: 'hidden', at: T0 + 10 * s_ })
    record(a, { type: 'visible', at: T0 + 300 * s_ })
    record(a, { type: 'break_end', at: T0 + 605 * s_ })
    expect(totals(a, T0 + 615 * s_)).toEqual({ activeSeconds: 15, idleSeconds: 0, breakSeconds: 600, hiddenSeconds: 0, interruptions: 0 })
  })

  it('uses a configurable idle threshold', () => {
    const a = createActivity(T0, { idleAfterMs: 10 * s_ })
    expect(totals(a, T0 + 25 * s_)).toMatchObject({ activeSeconds: 10, idleSeconds: 15 })
  })

  it('flushes whole-second deltas on schedule without drift', () => {
    const a = createActivity(T0, { flushEveryMs: 15 * s_ })
    expect(tick(a, T0 + 10_500)).toBeNull()
    const d1 = tick(a, T0 + 15_500)
    expect(d1).toMatchObject({ activeSeconds: 15 })
    expect(tick(a, T0 + 20_000)).toBeNull()
    const d2 = tick(a, T0 + 31_000)
    expect(d2).toMatchObject({ activeSeconds: 16 })
    expect((d1?.activeSeconds ?? 0) + (d2?.activeSeconds ?? 0)).toBe(totals(a, T0 + 31_000).activeSeconds)
    expect(flush(a, T0 + 31_000)).toEqual({ activeSeconds: 0, idleSeconds: 0, breakSeconds: 0, hiddenSeconds: 0, interruptions: 0 })
  })

  it('ignores time going backwards', () => {
    const a = createActivity(T0)
    record(a, { type: 'input', at: T0 + 10 * s_ })
    record(a, { type: 'input', at: T0 + 5 * s_ })
    expect(totals(a, T0 + 10 * s_).activeSeconds).toBe(10)
  })
})
