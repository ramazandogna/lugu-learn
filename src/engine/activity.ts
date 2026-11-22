/**
 * Activity tracker: turns page events into time estimates for the teacher.
 * Pure (no DOM): the caller feeds events and the current time from an
 * injected clock, and sends the returned deltas to `save_section_state`.
 *
 * Time between two observations is attributed to exactly one bucket:
 * - `break`  while a break is running (until the student presses start);
 * - `hidden` while the tab is hidden (away from the lesson);
 * - `active` while visible and within `idleAfterMs` (default 60 s) of the
 *   last input; `idle` for the rest of a visible stretch.
 * Becoming visible and ending a break count as input (the student is back).
 * An interruption is a visible → hidden change outside a break.
 *
 * These are estimates, not surveillance: the browser cannot see another
 * device or screen, and nothing here should be read as a judgment.
 */
export type ActivityEventType = 'visible' | 'hidden' | 'input' | 'break_start' | 'break_end'
export interface ActivityEvent {
  type: ActivityEventType
  /** Epoch ms. Events earlier than the last observation are applied at that time. */
  at: number
}

export interface ActivityConfig {
  idleAfterMs: number
  flushEveryMs: number
}
export const DEFAULT_ACTIVITY_CONFIG: ActivityConfig = { idleAfterMs: 60_000, flushEveryMs: 15_000 }

interface Buckets {
  active: number
  idle: number
  break: number
  hidden: number
}

export interface ActivityState {
  config: ActivityConfig
  at: number
  visible: boolean
  onBreak: boolean
  lastInputAt: number
  /** Accumulated milliseconds per bucket. */
  ms: Buckets
  interruptions: number
  /** What has already been flushed (seconds, interruptions). */
  flushed: Buckets & { interruptions: number }
  lastFlushAt: number
}

/** Seconds and counts since the previous flush. */
export interface ActivityDelta {
  activeSeconds: number
  idleSeconds: number
  breakSeconds: number
  hiddenSeconds: number
  interruptions: number
}

export function createActivity(now: number, config: Partial<ActivityConfig> = {}, visible = true): ActivityState {
  return {
    config: { ...DEFAULT_ACTIVITY_CONFIG, ...config },
    at: now,
    visible,
    onBreak: false,
    lastInputAt: now,
    ms: { active: 0, idle: 0, break: 0, hidden: 0 },
    interruptions: 0,
    flushed: { active: 0, idle: 0, break: 0, hidden: 0, interruptions: 0 },
    lastFlushAt: now,
  }
}

/** Attribute the time since the last observation up to `now`. */
export function advance(s: ActivityState, now: number) {
  const dt = now - s.at
  if (dt <= 0) return
  if (s.onBreak) s.ms.break += dt
  else if (!s.visible) s.ms.hidden += dt
  else {
    const active = Math.min(dt, Math.max(0, s.lastInputAt + s.config.idleAfterMs - s.at))
    s.ms.active += active
    s.ms.idle += dt - active
  }
  s.at = now
}

/** Apply one event (after attributing the time before it). */
export function record(s: ActivityState, e: ActivityEvent) {
  advance(s, e.at)
  const at = Math.max(e.at, s.at)
  switch (e.type) {
    case 'hidden':
      if (s.visible && !s.onBreak) s.interruptions++
      s.visible = false
      break
    case 'visible':
      s.visible = true
      s.lastInputAt = at
      break
    case 'input':
      s.lastInputAt = at
      break
    case 'break_start':
      s.onBreak = true
      break
    case 'break_end':
      s.onBreak = false
      s.lastInputAt = at
      break
  }
}

/** Visible, not on a break, and no input for `idleAfterMs`: show a gentle reminder / log `idle_start`. */
export const isIdle = (s: ActivityState, now: number) => s.visible && !s.onBreak && now - s.lastInputAt >= s.config.idleAfterMs

/** Totals so far, in whole seconds. */
export function totals(s: ActivityState, now: number): ActivityDelta {
  advance(s, now)
  return {
    activeSeconds: Math.floor(s.ms.active / 1000),
    idleSeconds: Math.floor(s.ms.idle / 1000),
    breakSeconds: Math.floor(s.ms.break / 1000),
    hiddenSeconds: Math.floor(s.ms.hidden / 1000),
    interruptions: s.interruptions,
  }
}

/**
 * Take what has not been flushed yet. Whole seconds only; the remainder stays
 * for the next flush, so the sum of all deltas equals the totals (no drift).
 */
export function flush(s: ActivityState, now: number): ActivityDelta {
  const t = totals(s, now)
  const d: ActivityDelta = {
    activeSeconds: t.activeSeconds - s.flushed.active,
    idleSeconds: t.idleSeconds - s.flushed.idle,
    breakSeconds: t.breakSeconds - s.flushed.break,
    hiddenSeconds: t.hiddenSeconds - s.flushed.hidden,
    interruptions: t.interruptions - s.flushed.interruptions,
  }
  s.flushed = { active: t.activeSeconds, idle: t.idleSeconds, break: t.breakSeconds, hidden: t.hiddenSeconds, interruptions: t.interruptions }
  s.lastFlushAt = now
  return d
}

/** Call on a timer: returns a delta every `flushEveryMs`, otherwise null. */
export const tick = (s: ActivityState, now: number): ActivityDelta | null =>
  now - s.lastFlushAt >= s.config.flushEveryMs ? flush(s, now) : (advance(s, now), null)
