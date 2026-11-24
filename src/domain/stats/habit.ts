/**
 * Streak ve alışkanlık (spec bölüm 6, st_*). G = aktif günler kümesi (attempt veya done).
 * Streak = ardışık aktif gün. Bugün aktif değilse dünün streak'i korunur.
 */
import type { StatParams, StatResult, StatsInput } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { mean, pairwise, sd, clamp, safeDiv } from './math.ts'
import {
  activeDaySet,
  addDays,
  diffDays,
  dayKey,
  fullWeeks,
  rangeDays,
  resolveRange,
  weekday,
} from './windows.ts'
import { cnt, na, nodata, num } from './series.ts'

/** Güncel streak: bugün (veya bugün aktif değilse dün) geriye ardışık aktif günler. */
function currentStreak(active: ReadonlySet<string>, today: string): number {
  let d = active.has(today) ? today : addDays(today, -1)
  let c = 0
  while (active.has(d)) {
    c++
    d = addDays(d, -1)
  }
  return c
}

function longestRun(days: readonly string[]): number {
  let best = 0
  let run = 0
  let prev: string | undefined
  for (const d of days) {
    run = prev !== undefined && diffDays(prev, d) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}

/** [from, to] içinde G'deki gün sayısı (iki uç dahil). */
function countBetween(active: ReadonlySet<string>, from: string, to: string): number {
  let c = 0
  for (let d = from; d <= to; d = addDays(d, 1)) if (active.has(d)) c++
  return c
}

export function stActiveDays(input: StatsInput): StatResult {
  return cnt(activeDaySet(input).size)
}

export function stActiveRatio(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  if (r === null) return na()
  const count = activeDaySet(input).size
  return num(safeDiv(count, rangeDays(r)), count, 'zero_denominator')
}

export function stCurrentStreak(input: StatsInput, p: StatParams): StatResult {
  return cnt(currentStreak(activeDaySet(input), dayKey(p.now)))
}

export function stLongestStreak(input: StatsInput): StatResult {
  return cnt(longestRun([...activeDaySet(input)].sort()))
}

export function stStreakHealth(input: StatsInput, p: StatParams): StatResult {
  const active = activeDaySet(input)
  const longest = longestRun([...active].sort())
  return num(safeDiv(currentStreak(active, dayKey(p.now)), longest), active.size, 'zero_denominator')
}

/** Ardışık iki aktif gün arası fark >= LONG_GAP_DAYS+1 olan sayısı. */
export function stStreakBreaks(input: StatsInput): StatResult {
  const days = [...activeDaySet(input)].sort()
  return cnt(pairwise(days).filter(([a, b]) => diffDays(a, b) >= T.LONG_GAP_DAYS + 1).length)
}

export function stDaysSinceActive(input: StatsInput, p: StatParams): StatResult {
  const days = [...activeDaySet(input)].sort()
  const last = days.at(-1)
  if (last === undefined) return nodata()
  return num(diffDays(last, dayKey(p.now)), days.length)
}

export function stAtRiskFlag(input: StatsInput, p: StatParams): StatResult {
  const active = activeDaySet(input)
  const today = dayKey(p.now)
  const risk = currentStreak(active, today) >= T.AT_RISK_STREAK && !active.has(today)
  return cnt(risk ? 1 : 0)
}

/** Ardışık aktif günler arası en büyük boşluk (fark - 1). */
export function stLongestGap(input: StatsInput): StatResult {
  const days = [...activeDaySet(input)].sort()
  if (days.length < T.MIN_AVG) return num(null, days.length)
  const gaps = pairwise(days).map(([a, b]) => diffDays(a, b) - 1)
  return num(Math.max(...gaps), days.length)
}

/** Tam haftalardaki ortalama aktif gün. */
export function stWeeklyDaysAvg(input: StatsInput, p: StatParams): StatResult {
  const active = activeDaySet(input)
  const weeks = fullWeeks(resolveRange(p), active, p.now)
  if (weeks.length < T.MIN_FULL_WEEKS) return num(null, weeks.length)
  const counts = weeks.map(w => countBetween(active, w, addDays(w, 6)))
  return num(mean(counts), weeks.length)
}

/** Haftalık düzenlilik: 1 - sd/ort, [0,1]'e kırpılmış. */
export function stConsistency(input: StatsInput, p: StatParams): StatResult {
  const active = activeDaySet(input)
  const weeks = fullWeeks(resolveRange(p), active, p.now)
  if (weeks.length < T.MIN_FULL_WEEKS_CONSISTENCY) return num(null, weeks.length)
  const counts = weeks.map(w => countBetween(active, w, addDays(w, 6)))
  const m = mean(counts)
  const s = sd(counts)
  if (m === null || s === null) return num(null, weeks.length)
  if (m === 0) return num(null, weeks.length, 'zero_denominator')
  return num(clamp(1 - s / m, 0, 1), weeks.length)
}

/** Aktif günlerin hangi kısmı Cumartesi/Pazar. */
export function stWeekendShare(input: StatsInput): StatResult {
  const days = [...activeDaySet(input)]
  if (days.length === 0) return num(null, 0, 'zero_denominator')
  const weekend = days.filter(d => weekday(d) >= 6).length
  return num(safeDiv(weekend, days.length), days.length, 'zero_denominator')
}

/** Son 7 gün aktif gün - önceki 7 gün aktif gün (14 gün sabit). */
export function stMomentum(input: StatsInput, p: StatParams): StatResult {
  const active = activeDaySet(input)
  const today = dayKey(p.now)
  const span = T.MOMENTUM_DAYS
  const last = countBetween(active, addDays(today, -(span - 1)), today)
  const prev = countBetween(active, addDays(today, -(2 * span - 1)), addDays(today, -span))
  return { value: last - prev, n: last + prev }
}
