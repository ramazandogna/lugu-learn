/**
 * Akademik denemeler (spec bölüm 2, ex_*). Girdi zaman penceresiyle zaten süzülmüş gelir
 * (registry.runStat scopeInput uygular). Ders param: subjectId (null/undefined = toplam).
 */
import type { ExamResultRow, StatBreakdownItem, StatParams, StatResult, StatsInput } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { consecutive, descNullLast, mean, nonNull, pctChange, safeDiv, sd, sumOf, z } from './math.ts'
import { dayKey, diffDays, lastN } from './windows.ts'
import {
  cnt,
  declineRules,
  examSeries,
  flagBit,
  floorOf,
  meanOfLast,
  metricOf,
  nodata,
  nthStat,
  num,
  paramLastN,
  resultsFor,
  severity,
  slopeOfLast,
  valuesOf,
} from './series.ts'

/* ── yardımcılar ───────────────────────────────────────────────────── */

function valsOf(input: StatsInput, p: StatParams): number[] {
  return valuesOf(examSeries(input, p.subjectId ?? null), metricOf(p))
}

/** Pencereli son değer serisi (window=lastN/n). */
function windowedVals(input: StatsInput, p: StatParams): number[] {
  return paramLastN(valsOf(input, p), p)
}

/** Dersler: aktif dersler için son 5 pct ortalaması, ortalamaya göre büyükten küçüğe. */
function rankedSubjects(input: StatsInput): StatBreakdownItem[] {
  const items: StatBreakdownItem[] = []
  for (const s of input.subjects) {
    if (!s.active) continue
    const w = lastN(valuesOf(examSeries(input, s.id), 'pct'), T.LAST_SHORT)
    if (w.length < T.MIN_AVG) continue
    items.push({ key: s.id, value: mean(w), n: w.length })
  }
  return items.sort((a, b) => descNullLast(a.value, b.value) || a.key.localeCompare(b.key))
}

function dOf(r: ExamResultRow): number {
  return r.total ?? r.correct + r.incorrect + r.blank
}

function rowsRate(p: StatParams, input: StatsInput, numer: (r: ExamResultRow) => number): StatResult {
  const rows = resultsFor(input, p)
  return num(safeDiv(sumOf(rows, numer), sumOf(rows, dOf)), rows.length, 'zero_denominator')
}

/* ── seri / son değerler ───────────────────────────────────────────── */

export function exCount(input: StatsInput, p: StatParams): StatResult {
  return cnt(paramLastN(examSeries(input, p.subjectId ?? null), p).length)
}

export function exLastNet(input: StatsInput, p: StatParams): StatResult {
  const s = examSeries(input, p.subjectId ?? null)
  const last = s.at(-1)
  return last === undefined ? nodata() : num(last.net, s.length)
}

export function exLastPct(input: StatsInput, p: StatParams): StatResult {
  const s = examSeries(input, p.subjectId ?? null)
  const last = s.at(-1)
  return last === undefined ? nodata() : num(last.pct, s.length, 'zero_denominator')
}

export function exAvgLast5(input: StatsInput, p: StatParams): StatResult {
  return meanOfLast(valsOf(input, p), T.LAST_SHORT)
}

export function exAvgLast10(input: StatsInput, p: StatParams): StatResult {
  return meanOfLast(valsOf(input, p), T.LAST_LONG)
}

export function exAvgLastn(input: StatsInput, p: StatParams): StatResult {
  return meanOfLast(valsOf(input, p), p.n ?? 0)
}

export function exAvgAll(input: StatsInput, p: StatParams): StatResult {
  const v = valsOf(input, p)
  return meanOfLast(v, v.length)
}

export function exSlopeLast5(input: StatsInput, p: StatParams): StatResult {
  return slopeOfLast(valsOf(input, p), T.LAST_SHORT)
}

export function exSlopeLast10(input: StatsInput, p: StatParams): StatResult {
  return slopeOfLast(valsOf(input, p), T.LAST_LONG)
}

export function exSlopeLastn(input: StatsInput, p: StatParams): StatResult {
  return slopeOfLast(valsOf(input, p), p.n ?? 0)
}

export function exSlopeAll(input: StatsInput, p: StatParams): StatResult {
  const v = valsOf(input, p)
  return slopeOfLast(v, v.length)
}

export function exSdLastn(input: StatsInput, p: StatParams): StatResult {
  const w = lastN(valsOf(input, p), p.n ?? 0)
  return w.length < T.MIN_SLOPE ? num(null, w.length) : num(sd(w), w.length)
}

export function exCvLastn(input: StatsInput, p: StatParams): StatResult {
  const w = lastN(valsOf(input, p), p.n ?? 0)
  if (w.length < T.MIN_SLOPE) return num(null, w.length)
  const m = mean(w)
  const s = sd(w)
  if (m === null || s === null || m <= 0) return num(null, w.length, 'zero_denominator')
  return num(safeDiv(s, m), w.length, 'zero_denominator')
}

export function exBest(input: StatsInput, p: StatParams): StatResult {
  const v = windowedVals(input, p)
  return v.length === 0 ? nodata() : num(v.reduce((a, b) => Math.max(a, b)), v.length)
}

export function exWorst(input: StatsInput, p: StatParams): StatResult {
  const v = windowedVals(input, p)
  return v.length === 0 ? nodata() : num(v.reduce((a, b) => Math.min(a, b)), v.length)
}

export function exRangeLastn(input: StatsInput, p: StatParams): StatResult {
  const w = lastN(valsOf(input, p), p.n ?? 0)
  if (w.length < T.MIN_AVG) return num(null, w.length)
  return num(Math.max(...w) - Math.min(...w), w.length)
}

export function exDeltaLastPrev(input: StatsInput, p: StatParams): StatResult {
  const v = valsOf(input, p)
  const last = v.at(-1)
  const prev = v.at(-2)
  if (v.length < T.MIN_AVG || last === undefined || prev === undefined) return num(null, v.length)
  return num(last - prev, v.length)
}

/* ── N. deneme karşılaştırmaları ───────────────────────────────────── */

export function exDeltaNthPrev5(input: StatsInput, p: StatParams): StatResult {
  return nthStat(valsOf(input, p), p, T.REF_NEAR, T.MIN_REF_Z, (x, ref) => {
    const m = mean(ref)
    return m === null ? null : x - m
  })
}

export function exDeltaNthPrev10(input: StatsInput, p: StatParams): StatResult {
  return nthStat(valsOf(input, p), p, T.REF_FAR, T.MIN_REF_10, (x, ref) => {
    const m = mean(ref)
    return m === null ? null : x - m
  })
}

export function exPctchangeNthPrev5(input: StatsInput, p: StatParams): StatResult {
  return nthStat(valsOf(input, p), p, T.REF_NEAR, T.MIN_REF_Z, (x, ref) => pctChange(mean(ref), x))
}

export function exZNthPrev5(input: StatsInput, p: StatParams): StatResult {
  const floor = floorOf(metricOf(p))
  return nthStat(valsOf(input, p), p, T.REF_NEAR, T.MIN_REF_Z, (x, ref) => z(x, ref, floor))
}

export function exZNthPrev10(input: StatsInput, p: StatParams): StatResult {
  const floor = floorOf(metricOf(p))
  return nthStat(valsOf(input, p), p, T.REF_FAR, T.MIN_REF_10, (x, ref) => z(x, ref, floor))
}

/* ── düşüş kuralları ───────────────────────────────────────────────── */

export function exDeclineSlope3(input: StatsInput, p: StatParams): StatResult {
  const d = declineRules(valsOf(input, p), metricOf(p))
  return num(d.slope, d.slopeN, 'insufficient', {
    breakdown: [{ key: 'flag', value: flagBit(d.slopeFlag), n: d.slopeN }],
  })
}

export function exDeclineSd(input: StatsInput, p: StatParams): StatResult {
  const d = declineRules(valsOf(input, p), metricOf(p))
  return num(flagBit(d.sdFlag), d.windowN)
}

export function exDeclineFlag(input: StatsInput, p: StatParams): StatResult {
  const d = declineRules(valsOf(input, p), metricOf(p))
  return num(severity(d), d.windowN)
}

export function exDeclineMagnitude(input: StatsInput, p: StatParams): StatResult {
  const d = declineRules(valsOf(input, p), metricOf(p))
  return num(d.magnitude, d.windowN)
}

/** Her aktif ders için düşüş işareti; yetersiz dersler listede value=null, sayıya girmez. */
export function exDeclineSubjects(input: StatsInput, p: StatParams): StatResult {
  const metric = metricOf(p)
  const items: StatBreakdownItem[] = []
  for (const s of input.subjects) {
    if (!s.active) continue
    const d = declineRules(valuesOf(examSeries(input, s.id), metric), metric)
    items.push({ key: s.id, value: severity(d), n: d.windowN, extra: d.magnitude })
  }
  items.sort(
    (a, b) =>
      descNullLast(a.value, b.value) || descNullLast(a.extra, b.extra) || a.key.localeCompare(b.key),
  )
  if (items.length === 0) return nodata()
  const scored = items.filter(i => i.value !== null)
  if (scored.length === 0) return num(null, 0, 'insufficient', { breakdown: items })
  const flagged = scored.filter(i => (i.value ?? 0) >= 1).length
  return num(flagged, scored.length, 'insufficient', { breakdown: items })
}

export function exConsecDeclines(input: StatsInput, p: StatParams): StatResult {
  const v = valsOf(input, p)
  if (v.length < T.MIN_AVG) return cnt(0)
  return cnt(consecutive(v, (later, earlier) => later < earlier))
}

export function exConsecGains(input: StatsInput, p: StatParams): StatResult {
  const v = valsOf(input, p)
  if (v.length < T.MIN_AVG) return cnt(0)
  return cnt(consecutive(v, (later, earlier) => later > earlier))
}

/* ── sınav oranları (sonuç satırları) ──────────────────────────────── */

export function exCorrectRate(input: StatsInput, p: StatParams): StatResult {
  return rowsRate(p, input, r => r.correct)
}

export function exWrongRate(input: StatsInput, p: StatParams): StatResult {
  return rowsRate(p, input, r => r.incorrect)
}

export function exBlankRate(input: StatsInput, p: StatParams): StatResult {
  return rowsRate(p, input, r => r.blank)
}

export function exBlankVsWrong(input: StatsInput, p: StatParams): StatResult {
  const rows = resultsFor(input, p)
  const blank = sumOf(rows, r => r.blank)
  const wrong = sumOf(rows, r => r.incorrect)
  return num(safeDiv(blank, blank + wrong), rows.length, 'zero_denominator')
}

export function exPenaltyLoss(input: StatsInput, p: StatParams): StatResult {
  const rows = resultsFor(input, p)
  return num(sumOf(rows, r => r.correct - r.net), rows.length, 'insufficient')
}

/** LGS/deneme ortamı (lgs, mock) ile okul sınavı pct ortalamaları farkı. */
export function exKindGap(input: StatsInput, p: StatParams): StatResult {
  const s = examSeries(input, p.subjectId ?? null)
  const mockPct = s.filter(x => x.kind === 'lgs' || x.kind === 'mock').map(x => x.pct).filter(nonNull)
  const schoolPct = s.filter(x => x.kind === 'school').map(x => x.pct).filter(nonNull)
  const n = mockPct.length + schoolPct.length
  if (mockPct.length < T.MIN_AVG || schoolPct.length < T.MIN_AVG) return num(null, n)
  const a = mean(mockPct)
  const b = mean(schoolPct)
  return num(a === null || b === null ? null : a - b, n)
}

/** Son denemenin tüm derslerinin toplam neti (ders parametresi yok sayılır). */
export function exTotalNetLast(input: StatsInput, _p: StatParams): StatResult {
  const s = examSeries(input, null)
  const last = s.at(-1)
  return last === undefined ? nodata() : num(last.net, s.length)
}

/** Ders sırası: value = verilen dersin sırası (1 = en iyi). breakdown tüm sıra. */
export function exSubjectRank(input: StatsInput, p: StatParams): StatResult {
  const ranked = rankedSubjects(input)
  if (ranked.length === 0) return nodata()
  const idx = ranked.findIndex(i => i.key === p.subjectId)
  return num(idx < 0 ? null : idx + 1, ranked.length, 'insufficient', { breakdown: ranked })
}

/** En zayıf ders: breakdown'ın sonu; value = o dersin pct ortalaması, key = subjectId. */
export function exWeakestSubject(input: StatsInput, _p: StatParams): StatResult {
  const ranked = rankedSubjects(input)
  const weakest = ranked.at(-1)
  if (weakest === undefined) return nodata()
  return num(weakest.value, weakest.n, 'insufficient', { breakdown: ranked })
}

/* ── zaman ─────────────────────────────────────────────────────────── */

export function exExamIntervalDays(input: StatsInput, _p: StatParams): StatResult {
  const dates = input.exams.map(e => e.date).sort()
  if (dates.length < T.MIN_AVG) return num(null, dates.length)
  const gaps: number[] = []
  for (let i = 1; i < dates.length; i++) {
    const a = dates[i - 1]
    const b = dates[i]
    if (a !== undefined && b !== undefined) gaps.push(diffDays(a, b))
  }
  return num(mean(gaps), dates.length)
}

export function exDaysSinceLast(input: StatsInput, p: StatParams): StatResult {
  const dates = input.exams.map(e => e.date).sort()
  const last = dates.at(-1)
  if (last === undefined) return nodata()
  return num(diffDays(last, dayKey(p.now)), dates.length)
}

