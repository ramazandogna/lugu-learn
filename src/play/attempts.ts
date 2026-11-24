/**
 * Attempt history and comparison for the quiz result screen, derived from existing `question_attempts` rows
 * (no new table). One "run" = all attempts of one learning session in one section of one package.
 * Accuracy ("isabet") counts the FIRST try of each question so retries do not hide or inflate the result.
 */

/** The subset of `question_attempts` the maths needs. */
export interface AttemptRow {
  session_id: string
  package_id: string
  section: string
  question_id: string
  attempt_no: number
  correct: boolean
  response_ms: number | null
  hint_used: boolean
  created_at: string
}

export interface Run {
  sessionId: string
  packageId: string
  section: string
  /** ISO time of the first attempt. */
  at: string
  /** Distinct questions answered. */
  questions: number
  /** Questions right on the first try. */
  firstTryCorrect: number
  /** Question ids missed on the first try. */
  missed: string[]
  /** Isabet %, 0-100. */
  accuracy: number
  /** Longest run of consecutive correct first tries, in answer order. */
  bestStreak: number
  /** Median first-try response time in ms, null when unknown. */
  medianMs: number | null
  hintsUsed: number
}

const median = (xs: number[]): number | null => {
  if (xs.length === 0) return null
  const a = [...xs].sort((x, y) => x - y)
  const m = a.length >> 1
  return a.length % 2 ? (a[m] as number) : Math.round(((a[m - 1] as number) + (a[m] as number)) / 2)
}

/** Build one run from rows of a single session+section. */
export function buildRun(rows: readonly AttemptRow[]): Run | null {
  const first = rows
    .filter((r) => r.attempt_no === 1)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const head = first[0]
  if (!head) return null
  let streak = 0
  let best = 0
  for (const r of first) {
    streak = r.correct ? streak + 1 : 0
    if (streak > best) best = streak
  }
  const ok = first.filter((r) => r.correct).length
  const ms = first.flatMap((r) => (r.response_ms === null ? [] : [r.response_ms]))
  return {
    sessionId: head.session_id,
    packageId: head.package_id,
    section: head.section,
    at: head.created_at,
    questions: first.length,
    firstTryCorrect: ok,
    missed: first.filter((r) => !r.correct).map((r) => r.question_id),
    accuracy: Math.round((ok / first.length) * 100),
    bestStreak: best,
    medianMs: median(ms),
    hintsUsed: rows.filter((r) => r.hint_used).length,
  }
}

/** Group raw rows into runs, newest first. Filter by `section` (e.g. 'vocab_quiz') and optionally package. */
export function buildRuns(rows: readonly AttemptRow[], filter: { section?: string; packageId?: string } = {}): Run[] {
  const groups = new Map<string, AttemptRow[]>()
  for (const r of rows) {
    if (filter.section && r.section !== filter.section) continue
    if (filter.packageId && r.package_id !== filter.packageId) continue
    const k = `${r.session_id}|${r.section}`
    const g = groups.get(k)
    if (g) g.push(r)
    else groups.set(k, [r])
  }
  return [...groups.values()]
    .flatMap((g) => {
      const run = buildRun(g)
      return run ? [run] : []
    })
    .sort((a, b) => b.at.localeCompare(a.at))
}

export const HISTORY_SHOWN = 5

/** Last 5 runs, newest first. */
export const recentRuns = (runs: readonly Run[], n = HISTORY_SHOWN): Run[] => runs.slice(0, n)

export type Trend = 'up' | 'down' | 'same'
export interface RunComparison {
  /** Accuracy points vs the previous run; null when there is none. */
  delta: number | null
  trend: Trend | null
  /** Missed before, right now. */
  fixed: string[]
  /** Missed in both. */
  stillMissed: string[]
  /** Missed now, not before. */
  newlyMissed: string[]
  /** Speed change in ms (negative = faster); null when either side lacks timing. */
  speedDeltaMs: number | null
  bestStreakDelta: number | null
  /** Current run beats every earlier run's best streak. */
  isBestStreak: boolean
}

/** Compare `current` with `previous` (the run before it, if any) and the full older history for records. */
export function compareRuns(current: Run, previous: Run | undefined, older: readonly Run[] = []): RunComparison {
  const prevMissed = new Set(previous?.missed ?? [])
  const nowMissed = new Set(current.missed)
  const delta = previous ? current.accuracy - previous.accuracy : null
  const earlierBest = Math.max(0, ...(previous ? [previous] : []).concat(older).map((r) => r.bestStreak))
  return {
    delta,
    trend: delta === null ? null : delta > 0 ? 'up' : delta < 0 ? 'down' : 'same',
    fixed: previous ? previous.missed.filter((q) => !nowMissed.has(q)) : [],
    stillMissed: previous ? current.missed.filter((q) => prevMissed.has(q)) : [],
    newlyMissed: previous ? current.missed.filter((q) => !prevMissed.has(q)) : [],
    speedDeltaMs: previous && previous.medianMs !== null && current.medianMs !== null ? current.medianMs - previous.medianMs : null,
    bestStreakDelta: previous ? current.bestStreak - previous.bestStreak : null,
    isBestStreak: current.bestStreak > 0 && current.bestStreak > earlierBest,
  }
}

/** Questions missed most often across runs (first-try misses), most first. */
export function mostMissed(runs: readonly Run[], limit = 5): { questionId: string; misses: number }[] {
  const n = new Map<string, number>()
  for (const r of runs) for (const q of r.missed) n.set(q, (n.get(q) ?? 0) + 1)
  return [...n.entries()]
    .map(([questionId, misses]) => ({ questionId, misses }))
    .sort((a, b) => b.misses - a.misses || a.questionId.localeCompare(b.questionId))
    .slice(0, limit)
}

/** Personal best streak across runs (the only record shown; no comparison with others). */
export const bestStreakEver = (runs: readonly Run[]): number => Math.max(0, ...runs.map((r) => r.bestStreak))
