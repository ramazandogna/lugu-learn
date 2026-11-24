/**
 * Konuşma (spec bölüm 8, sp_*). Admin'in planladığı birebir görüşmeler. Skor yok:
 * hacim, düzen ve not kapsaması.
 */
import type { SpeakingRow, StatParams, StatResult, StatsInput } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { mean, safeDiv } from './math.ts'
import { dayKey, diffDays, inRangeTs, latestTs, rangeDays, resolveRange } from './windows.ts'
import { cnt, na, nodata, num } from './series.ts'

const isEnded = (s: SpeakingRow): boolean => s.status === 'ended'

function inRangeOpt(ts: string | null, r: ReturnType<typeof resolveRange>): boolean {
  return ts !== null && inRangeTs(ts, r)
}

export function spCount(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(
    input.speaking.filter(
      s => isEnded(s) && (p.lessonId == null || s.lessonId === p.lessonId) && inRangeOpt(s.endedAt, r),
    ).length,
  )
}

/** Planlananların (plannedAt pencerede) gerçekleşme oranı. */
export function spCompletionRate(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const rows = input.speaking.filter(s => inRangeOpt(s.plannedAt, r) && (s.status === 'ended' || s.status === 'cancelled'))
  const ended = rows.filter(isEnded).length
  return num(safeDiv(ended, rows.length), rows.length, 'zero_denominator')
}

export function spCancelRate(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const planned = input.speaking.filter(s => inRangeOpt(s.plannedAt, r))
  const cancelled = planned.filter(s => s.status === 'cancelled').length
  return num(safeDiv(cancelled, planned.length), planned.length, 'zero_denominator')
}

export function spAvgMinutes(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const mins: number[] = []
  for (const s of input.speaking) {
    if (!isEnded(s) || s.startedAt === null || s.endedAt === null || !inRangeTs(s.endedAt, r)) continue
    mins.push((Date.parse(s.endedAt) - Date.parse(s.startedAt)) / 60_000)
  }
  if (mins.length < T.MIN_AVG) return num(null, mins.length)
  return num(mean(mins), mins.length)
}

export function spPerWeek(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  if (r === null) return na()
  const days = rangeDays(r)
  const count = input.speaking.filter(s => isEnded(s) && inRangeOpt(s.endedAt, r)).length
  if (days < T.WEEK_MIN_DAYS) return num(null, count)
  return num(count / (days / 7), count)
}

export function spDaysSinceLast(input: StatsInput, p: StatParams): StatResult {
  const last = latestTs(input.speaking.filter(isEnded).flatMap(s => (s.endedAt === null ? [] : [s.endedAt])))
  if (last === null) return nodata()
  return num(diffDays(dayKey(last), dayKey(p.now)), 1)
}

/** Biten konuşmaların kaçında en az bir not var. */
export function spNoteCoverage(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const ended = input.speaking.filter(s => isEnded(s) && inRangeOpt(s.endedAt, r))
  const noted = new Set(input.speakingNotes.map(n => n.speakingSessionId))
  const covered = ended.filter(s => noted.has(s.id)).length
  return num(safeDiv(covered, ended.length), ended.length, 'zero_denominator')
}

/** Her konuşmanın son notundaki açık takipler (dolu ve boş olmayan). */
export function spOpenFollowups(input: StatsInput): StatResult {
  const latest = new Map(input.speakingNotes.map(n => [n.speakingSessionId, n] as const))
  const open = [...latest.values()].filter(n => n.followUp !== null && n.followUp.trim() !== '').length
  return cnt(open)
}
