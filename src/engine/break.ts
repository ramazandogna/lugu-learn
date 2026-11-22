/**
 * A break between sections.
 *
 * Rules:
 * - Planned length is one of 0 (continue now), 10, 15, 20, 30 minutes.
 * - While `running` the student may return early.
 * - When the planned time is over the break is `over-awaiting-start`: the next
 *   section NEVER opens by itself; the student must press start.
 * - `ended` once the student pressed start (or chose 0 minutes). `endedAt` is
 *   when the break itself ended (the early return, or the planned end);
 *   `nextSectionStartedAt` is the start press. Both go to `end_break`.
 *
 * Pure: every function takes `now` (epoch ms) from an injected clock.
 */
export const BREAK_OPTIONS = [0, 10, 15, 20, 30] as const
export type BreakMinutes = (typeof BREAK_OPTIONS)[number]

export type BreakStatus = 'running' | 'over-awaiting-start' | 'ended'

export interface BreakState {
  plannedMinutes: BreakMinutes
  startedAt: number
  endedAt: number | null
  nextSectionStartedAt: number | null
  earlyReturn: boolean
}

export const isBreakMinutes = (n: number): n is BreakMinutes => (BREAK_OPTIONS as readonly number[]).includes(n)

const plannedEnd = (b: BreakState) => b.startedAt + b.plannedMinutes * 60_000

/** Start a break. 0 minutes ends immediately: "continue now" is itself the explicit start. */
export function startBreak(plannedMinutes: BreakMinutes, now: number): BreakState {
  const b: BreakState = { plannedMinutes, startedAt: now, endedAt: null, nextSectionStartedAt: null, earlyReturn: false }
  if (plannedMinutes === 0) {
    b.endedAt = now
    b.nextSectionStartedAt = now
  }
  return b
}

export function breakStatus(b: BreakState, now: number): BreakStatus {
  if (b.nextSectionStartedAt !== null) return 'ended'
  return now >= plannedEnd(b) ? 'over-awaiting-start' : 'running'
}

/** Whole seconds left on the countdown (0 once over). */
export const remaining = (b: BreakState, now: number) =>
  b.nextSectionStartedAt !== null ? 0 : Math.max(0, Math.ceil((plannedEnd(b) - now) / 1000))

/** The planned time has passed (or the break has ended). */
export const isOver = (b: BreakState, now: number) => breakStatus(b, now) !== 'running'

/**
 * The student pressed start (early return while running, or after the break
 * is over). Returns the ended break; an already ended break is returned unchanged.
 */
export function startNextSection(b: BreakState, now: number): BreakState {
  const status = breakStatus(b, now)
  if (status === 'ended') return b
  const early = status === 'running'
  return { ...b, endedAt: early ? now : plannedEnd(b), nextSectionStartedAt: now, earlyReturn: early }
}

/** Actual break length in seconds (start → `endedAt`, or → now while running). */
export const actualSeconds = (b: BreakState, now: number) =>
  Math.max(0, Math.round(((b.endedAt ?? Math.min(now, plannedEnd(b))) - b.startedAt) / 1000))
