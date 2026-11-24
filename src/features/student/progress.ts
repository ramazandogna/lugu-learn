/*
 * The learner's own progress, derived from sessions they already have
 * (no new table). Pure, so it runs without the server. Rules follow
 * .team/play/pedagog.md items 1a, 8, 9: a "day" is 04:00-04:00, a day counts
 * with a completed session or >= 2 minutes of work, Sat+Sun are one slot, two
 * freezes a week (pool <= 3) apply by themselves, a broken chain costs nothing
 * and the record stays, comparisons are only with the learner's own past.
 */
export interface ProgressSession {
  started_at: string
  completed_at: string | null
  status: 'active' | 'completed' | 'abandoned'
  active_seconds: number
}

const DAY = 86_400_000
const SHIFT = 4 * 3_600_000
export const MIN_COUNTING_SECONDS = 120
export const FREEZES_PER_WEEK = 2
export const FREEZE_CAP = 3

/** Local calendar day of an instant, with the 04:00 rollover. `YYYY-MM-DD`. */
export function dayOf(t: Date | string | number): string {
  const d = new Date(new Date(t).getTime() - SHIFT)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const parse = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y!, m! - 1, d!, 12)
}
const addDays = (k: string, n: number) => dayOf(new Date(parse(k).getTime() + n * DAY + SHIFT))
/** Days since Monday: 0..6. */
const weekday = (k: string) => (parse(k).getDay() + 6) % 7
/** Monday of the week of `k`. */
export const weekStart = (k: string) => addDays(k, -weekday(k))
/** Sat+Sun share one slot, keyed by the Saturday. */
const slotOf = (k: string) => (weekday(k) === 6 ? addDays(k, -1) : k)

const counts = (s: ProgressSession) => s.status === 'completed' || s.completed_at !== null || s.active_seconds >= MIN_COUNTING_SECONDS

/** Days (04:00 rule) that count towards the chain. */
export function activeDays(sessions: readonly ProgressSession[]): Set<string> {
  return new Set(sessions.filter(counts).map((s) => dayOf(s.started_at)))
}

export type StreakMood = 'new' | 'running' | 'back'

export interface Streak {
  /** Days in the chain right now (a weekend counts once). */
  current: number
  /** Longest chain ever. Never goes down. */
  best: number
  /** Freezes left in the pool (0..3). */
  freezes: number
  /** A freeze was used for the latest missed slot and the chain still holds. */
  frozen: boolean
  /** Today already counted. */
  today: boolean
  /** new = nothing yet, running = chain alive, back = chain broke earlier, starting again. */
  mood: StreakMood
  /** Last 7 calendar days, oldest first: worked / frozen / empty. */
  week: { day: string; state: 'done' | 'frozen' | 'empty' | 'today' }[]
}

export function streakOf(sessions: readonly ProgressSession[], now: Date = new Date()): Streak {
  const active = activeDays(sessions)
  const today = dayOf(now)
  const first = [...active].sort()[0]
  const week: Streak['week'] = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((day) => ({
    day,
    state: active.has(day) ? 'done' : day === today ? 'today' : 'empty',
  }))
  if (!first) return { current: 0, best: 0, freezes: FREEZES_PER_WEEK, frozen: false, today: false, mood: 'new', week }

  const activeSlots = new Set([...active].map(slotOf))
  const todaySlot = slotOf(today)
  let current = 0
  let best = 0
  let pool = FREEZES_PER_WEEK
  let lastWeek = ''
  let frozen = false
  let broke = false
  const frozenDays = new Set<string>()
  for (let day = slotOf(first); day <= todaySlot; day = slotOf(addDays(day, weekday(day) === 5 ? 2 : 1))) {
    const wk = weekStart(day)
    if (wk !== lastWeek) {
      if (lastWeek) pool = Math.min(FREEZE_CAP, pool + FREEZES_PER_WEEK)
      lastWeek = wk
    }
    if (activeSlots.has(day)) {
      current += 1
      best = Math.max(best, current)
      frozen = false
    } else if (day !== todaySlot) {
      if (pool > 0) {
        pool -= 1
        frozen = true
        frozenDays.add(day)
      } else {
        current = 0
        frozen = false
        broke = true
      }
    }
  }
  const doneToday = activeSlots.has(todaySlot)
  for (const w of week) if (w.state === 'empty' && frozenDays.has(slotOf(w.day))) w.state = 'frozen'
  const mood: StreakMood = current === 0 ? (broke || best > 0 ? 'back' : 'new') : current === 1 && broke && doneToday ? 'back' : 'running'
  return { current, best, freezes: pool, frozen, today: doneToday, mood, week }
}

export interface WeekStats {
  minutes: number
  sessions: number
  lessons: number
  days: number
}

const statsFor = (sessions: readonly ProgressSession[], from: string, to: string): WeekStats => {
  const inside = sessions.filter((s) => {
    const d = dayOf(s.started_at)
    return d >= from && d < to
  })
  return {
    minutes: Math.round(inside.reduce((n, s) => n + s.active_seconds, 0) / 60),
    sessions: inside.length,
    lessons: inside.filter((s) => s.status === 'completed').length,
    days: new Set(inside.filter(counts).map((s) => dayOf(s.started_at))).size,
  }
}

export interface WeeklyCompare {
  thisWeek: WeekStats
  lastWeek: WeekStats
  /** Pedagog rule: the comparison only appears with >= 3 sessions in total. */
  enough: boolean
}

export function weeklyCompare(sessions: readonly ProgressSession[], now: Date = new Date()): WeeklyCompare {
  const start = weekStart(dayOf(now))
  const prev = addDays(start, -7)
  const next = addDays(start, 7)
  return { thisWeek: statsFor(sessions, start, next), lastWeek: statsFor(sessions, prev, start), enough: sessions.length >= 3 }
}

/** 20 levels; each step is a little longer than the one before; a level is never lost. */
export const MAX_LEVEL = 20
const step = (level: number) => 100 + 20 * (level - 1)

export function levelOf(xp: number): { level: number; into: number; need: number; max: boolean } {
  let level = 1
  let left = Math.max(0, xp)
  while (level < MAX_LEVEL && left >= step(level)) {
    left -= step(level)
    level += 1
  }
  return level >= MAX_LEVEL ? { level, into: 1, need: 1, max: true } : { level, into: left, need: step(level), max: false }
}
