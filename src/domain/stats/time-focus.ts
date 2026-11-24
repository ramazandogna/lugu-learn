/**
 * Zaman ve odak (spec bölüm 5, tm_*). Süre alanları saniye; çıktılar dakika/saniye/ms
 * birimine göre spec'teki gibi. Odak olayları sessionId ile oturuma bağlanır.
 */
import type { SessionEventRow, StatBreakdownItem, StatParams, StatResult, StatsInput } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { groupBy, mean, median, pairwise, quantile, safeDiv, sumOf } from './math.ts'
import { localHour } from './windows.ts'
import { attemptsOf, cnt, correctRate, nodata, num, sessionIdsOf, sessionsOf } from './series.ts'

/* ── oturumlar ─────────────────────────────────────────────────────── */

export function tmActiveMinutes(input: StatsInput, p: StatParams): StatResult {
  const s = sessionsOf(input, p.lessonId)
  return num(sumOf(s, x => x.activeSeconds) / 60, s.length, 'insufficient')
}

export function tmSessionCount(input: StatsInput, p: StatParams): StatResult {
  return cnt(sessionsOf(input, p.lessonId).length)
}

export function tmSessionActiveAvg(input: StatsInput): StatResult {
  const active = input.sessions.map(s => s.activeSeconds)
  if (active.length < T.MIN_SESSIONS) return num(null, active.length)
  const m = mean(active)
  return num(m === null ? null : m / 60, active.length)
}

export function tmSessionActiveMedian(input: StatsInput): StatResult {
  const active = input.sessions.map(s => s.activeSeconds)
  if (active.length < T.MIN_SESSIONS) return num(null, active.length)
  const m = median(active)
  return num(m === null ? null : m / 60, active.length)
}

/** Yalnız tamamlanmış oturumlar: duvar saati süresi (dk). */
export function tmSessionWallAvg(input: StatsInput): StatResult {
  const mins: number[] = []
  for (const s of input.sessions) {
    if (s.completedAt === null) continue
    mins.push((Date.parse(s.completedAt) - Date.parse(s.startedAt)) / 60_000)
  }
  if (mins.length < T.MIN_SESSIONS) return num(null, mins.length)
  return num(mean(mins), mins.length)
}

export function tmCompletionRate(input: StatsInput): StatResult {
  const done = input.sessions.filter(s => s.status === 'completed').length
  const quit = input.sessions.filter(s => s.status === 'abandoned').length
  const den = done + quit
  if (den < T.MIN_SESSIONS) return num(null, den)
  return num(safeDiv(done, den), den, 'zero_denominator')
}

export function tmAbandonRate(input: StatsInput): StatResult {
  const done = input.sessions.filter(s => s.status === 'completed').length
  const quit = input.sessions.filter(s => s.status === 'abandoned').length
  const den = done + quit
  if (den < T.MIN_SESSIONS) return num(null, den)
  return num(safeDiv(quit, den), den, 'zero_denominator')
}

export function tmIdleShare(input: StatsInput): StatResult {
  const idle = sumOf(input.sessions, s => s.idleSeconds)
  const total = sumOf(input.sessions, s => s.activeSeconds + s.idleSeconds)
  return num(safeDiv(idle, total), input.sessions.length, 'zero_denominator')
}

export function tmBreakShare(input: StatsInput): StatResult {
  const brk = sumOf(input.sessions, s => s.breakSeconds)
  const total = sumOf(input.sessions, s => s.activeSeconds + s.breakSeconds)
  return num(safeDiv(brk, total), input.sessions.length, 'zero_denominator')
}

/* ── odak ──────────────────────────────────────────────────────────── */

/**
 * Gizli kalma: visibility_hidden -> sıradaki visibility_visible farkı (sn).
 * Eşleşmeyen hidden olayları 0 sn sayılır ve unmatched'e eklenir.
 */
function hiddenStats(input: StatsInput, ids?: ReadonlySet<string>): { seconds: number; matched: number; unmatched: number; hidden: number } {
  let seconds = 0
  let matched = 0
  let unmatched = 0
  let hidden = 0
  const bySession = groupBy(input.events, e => e.sessionId)
  for (const [sessionId, evs] of bySession) {
    if (ids && !ids.has(sessionId)) continue
    const sorted = [...evs].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    let pending: number | null = null
    for (const e of sorted) {
      if (e.kind === 'visibility_hidden') {
        hidden++
        if (pending !== null) unmatched++
        pending = Date.parse(e.at)
      } else if (e.kind === 'visibility_visible' && pending !== null) {
        seconds += (Date.parse(e.at) - pending) / 1000
        matched++
        pending = null
      }
    }
    if (pending !== null) unmatched++
  }
  return { seconds, matched, unmatched, hidden }
}

function countKind(events: readonly SessionEventRow[], kind: SessionEventRow['kind'], ids?: ReadonlySet<string>): number {
  return events.filter(e => e.kind === kind && (ids === undefined || ids.has(e.sessionId))).length
}

export function tmFocusLossCount(input: StatsInput, p: StatParams): StatResult {
  return cnt(countKind(input.events, 'visibility_hidden', sessionIdsOf(input, p.lessonId)))
}

export function tmFocusLossPerHour(input: StatsInput): StatResult {
  const activeSum = sumOf(input.sessions, s => s.activeSeconds)
  if (activeSum < T.FOCUS_MIN_ACTIVE_SECONDS) return num(null, input.sessions.length)
  const hidden = countKind(input.events, 'visibility_hidden')
  return num(safeDiv(hidden, activeSum / 3600), input.sessions.length, 'zero_denominator')
}

export function tmHiddenSeconds(input: StatsInput): StatResult {
  const st = hiddenStats(input)
  return num(st.seconds, st.matched, 'insufficient', {
    breakdown: [{ key: 'unmatched', value: st.unmatched, n: st.unmatched }],
  })
}

export function tmHiddenShare(input: StatsInput): StatResult {
  const st = hiddenStats(input)
  const total = sumOf(input.sessions, s => s.activeSeconds + s.idleSeconds)
  return num(safeDiv(st.seconds, total), input.sessions.length, 'zero_denominator')
}

export function tmFullscreenExits(input: StatsInput): StatResult {
  return cnt(countKind(input.events, 'fullscreen_exit'))
}

/** Oturum sınırları (started, hidden..., last_seen) arasındaki en büyük fark (sn). */
export function tmLongestFocusRun(input: StatsInput): StatResult {
  if (input.sessions.length === 0) return nodata()
  const hiddenBySession = groupBy(
    input.events.filter(e => e.kind === 'visibility_hidden'),
    e => e.sessionId,
  )
  let best = 0
  for (const s of input.sessions) {
    const hidden = (hiddenBySession.get(s.id) ?? []).map(e => Date.parse(e.at))
    const points = [Date.parse(s.startedAt), ...hidden, Date.parse(s.lastSeenAt)].sort((a, b) => a - b)
    for (const [a, b] of pairwise(points)) best = Math.max(best, (b - a) / 1000)
  }
  return num(best, input.sessions.length)
}

/* ── cevap süreleri ────────────────────────────────────────────────── */

export function tmResponseMsMedian(input: StatsInput, p: StatParams): StatResult {
  const ms = attemptsOf(input, p.lessonId).map(a => a.responseMs).filter((v): v is number => v !== null)
  if (ms.length < T.MIN_ATTEMPTS) return num(null, ms.length)
  return num(median(ms), ms.length)
}

export function tmResponseMsP90(input: StatsInput): StatResult {
  const ms = input.attempts.map(a => a.responseMs).filter((v): v is number => v !== null)
  if (ms.length < T.MIN_ATTEMPTS) return num(null, ms.length)
  return num(quantile(ms, 0.9), ms.length)
}

/** Yavaş ama doğru: medyan >= 7000 ms ve doğruluk >= 0.85 -> 1. */
export function tmSlowAccurateFlag(input: StatsInput): StatResult {
  const atts = input.attempts
  if (atts.length < T.MIN_ATTEMPTS) return num(null, atts.length)
  const med = median(atts.map(a => a.responseMs).filter((v): v is number => v !== null))
  const acc = correctRate(atts)
  if (med === null || acc === null) return num(null, atts.length)
  return num(med >= T.SLOW_MEDIAN_MS && acc >= T.HIGH_ACCURACY ? 1 : 0, atts.length)
}

/** Yanlış - doğru cevap süresi (medyan farkı, ms). İki grupta da n >= 5 gerekir. */
export function tmWrongVsRightMs(input: StatsInput): StatResult {
  const timed = input.attempts.filter((a): a is typeof a & { responseMs: number } => a.responseMs !== null)
  const wrong = timed.filter(a => !a.correct).map(a => a.responseMs)
  const right = timed.filter(a => a.correct).map(a => a.responseMs)
  const n = wrong.length + right.length
  if (wrong.length < T.MIN_TIMED_GROUP || right.length < T.MIN_TIMED_GROUP) return num(null, n)
  const mw = median(wrong)
  const mr = median(right)
  return num(mw === null || mr === null ? null : mw - mr, n)
}

/* ── zaman düzeni ──────────────────────────────────────────────────── */

/** En çok çalışılan saat (yerel). Breakdown 0-23 oturum sayıları. */
export function tmPeakHour(input: StatsInput): StatResult {
  const count = input.sessions.length
  if (count < T.MIN_SESSIONS) return num(null, count)
  const counts: number[] = Array.from({ length: 24 }, () => 0)
  for (const s of input.sessions) {
    const h = localHour(s.startedAt)
    counts[h] = (counts[h] ?? 0) + 1
  }
  let peak = 0
  counts.forEach((c, h) => {
    if (c > (counts[peak] ?? 0)) peak = h
  })
  const breakdown: StatBreakdownItem[] = counts.map((c, h) => ({ key: String(h), value: c, n: c }))
  return num(peak, count, 'insufficient', { breakdown })
}

/** Bölüm süre payı; value = en büyük pay. */
export function tmSectionTimeShare(input: StatsInput, p: StatParams): StatResult {
  const ids = sessionIdsOf(input, p.lessonId)
  const secs = input.sections.filter(x => ids.has(x.sessionId))
  const total = sumOf(secs, x => x.activeSeconds)
  if (total <= 0) return num(null, secs.length, 'zero_denominator')
  const items: StatBreakdownItem[] = [...groupBy(secs, x => x.section).entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rows]) => ({ key, value: sumOf(rows, x => x.activeSeconds) / total, n: rows.length }))
  const top = items.reduce((m, i) => Math.max(m, i.value ?? 0), 0)
  return num(top, secs.length, 'zero_denominator', { breakdown: items })
}

export function tmBreakEarlyReturnRate(input: StatsInput): StatResult {
  const ended = input.breaks.filter(b => b.endedAt !== null)
  if (ended.length < T.MIN_SESSIONS) return num(null, ended.length)
  const early = ended.filter(b => b.earlyReturn === true).length
  return num(safeDiv(early, ended.length), ended.length, 'zero_denominator')
}
