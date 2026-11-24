/**
 * Ders / konu ilerlemesi (spec bölüm 3, ls_*). Param lessonId (null/undefined = hepsi).
 * Hata yoğunluğu = yanlış / toplam cevap.
 */
import type { AttemptRow, StatBreakdownItem, StatParams, StatResult, StatsInput } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { descNullLast, groupBy, mean, safeDiv, sumOf, z } from './math.ts'
import { dayKey, diffDays, inRangeTs, latestTs, rangeDays, resolveRange } from './windows.ts'
import {
  attemptsOf,
  cnt,
  declineRules,
  firstPrimaryAccuracy,
  floorOf,
  lessonCurve,
  meanOfLast,
  na,
  nodata,
  nthStat,
  num,
  orderedLessons,
  paramLastN,
  rateStat,
  resultsFor,
  severity,
  sessionLessonMap,
  slopeOfLast,
  withList,
} from './series.ts'

/* ── yardımcılar ───────────────────────────────────────────────────── */

function activeAssignment(input: StatsInput) {
  return input.assignments.find(a => a.status === 'active')
}

function starsOf(percent: number): number {
  if (percent >= T.STAR_3_MIN) return 3
  if (percent >= T.STAR_2_MIN) return 2
  return 1
}

/** Bölüm bazında doğru/yanlış sayıları -> oran listesi (n<MIN_ATTEMPTS_ITEM -> value null). */
function sectionItems(atts: readonly AttemptRow[]): StatBreakdownItem[] {
  const groups = groupBy(atts, a => a.section)
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rows]) => ({
      key,
      value: rows.length >= T.MIN_ATTEMPTS_ITEM ? safeDiv(rows.filter(r => !r.correct).length, rows.length) : null,
      n: rows.length,
    }))
}

/* ── ilerleme ──────────────────────────────────────────────────────── */

export function lsCompletedCount(input: StatsInput, _p: StatParams): StatResult {
  return cnt(new Set(input.completions.map(c => c.lessonId)).size)
}

/** Aktif program: versiyondaki arşivlenmemiş derslerin yüzde kaçı bitti. */
export function lsProgressPct(input: StatsInput, _p: StatParams): StatResult {
  const a = activeAssignment(input)
  if (a === undefined) return na()
  const ids = new Set(input.lessons.filter(l => l.versionId === a.versionId && l.status !== 'archived').map(l => l.id))
  const done = new Set(input.completions.map(c => c.lessonId).filter(id => ids.has(id)))
  const r = safeDiv(done.size, ids.size)
  return num(r === null ? null : r * 100, ids.size, 'zero_denominator')
}

export function lsCompletionsPerWeek(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  if (r === null) return na()
  const days = rangeDays(r)
  if (days < T.WEEK_MIN_DAYS) return num(null, input.completions.length)
  return num(input.completions.length / (days / 7), input.completions.length)
}

export function lsAvgDaysPerLesson(input: StatsInput, _p: StatParams): StatResult {
  const days = input.completions.map(c => dayKey(c.completedAt)).sort()
  if (days.length < T.MIN_AVG) return num(null, days.length)
  const gaps: number[] = []
  for (let i = 1; i < days.length; i++) {
    const a = days[i - 1]
    const b = days[i]
    if (a !== undefined && b !== undefined) gaps.push(diffDays(a, b))
  }
  return num(mean(gaps), days.length)
}

export function lsStallDays(input: StatsInput, p: StatParams): StatResult {
  const a = activeAssignment(input)
  if (a === undefined) return na()
  const last = latestTs([...input.completions.map(c => c.completedAt), a.createdAt])
  if (last === null) return na()
  return num(diffDays(dayKey(last), dayKey(p.now)), input.completions.length)
}

export function lsBackwardMoves(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(input.programEvents.filter(e => e.kind === 'backward' && inRangeTs(e.createdAt, r)).length)
}

export function lsRestartCount(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(input.programEvents.filter(e => e.kind === 'restart_lesson' && inRangeTs(e.createdAt, r)).length)
}

/* ── cevap doğruluğu ───────────────────────────────────────────────── */

export function lsAccuracy(input: StatsInput, p: StatParams): StatResult {
  return rateStat(attemptsOf(input, p.lessonId), a => a.correct, T.MIN_ATTEMPTS)
}

export function lsFirstTryAccuracy(input: StatsInput, p: StatParams): StatResult {
  const first = attemptsOf(input, p.lessonId).filter(a => a.attemptNo === 1)
  return rateStat(first, a => a.correct, T.MIN_ATTEMPTS)
}

export function lsHintRate(input: StatsInput, p: StatParams): StatResult {
  return rateStat(attemptsOf(input, p.lessonId), a => a.hintUsed, T.MIN_ATTEMPTS)
}

export function lsAttemptsPerQuestion(input: StatsInput, p: StatParams): StatResult {
  const counts = [...groupBy(attemptsOf(input, p.lessonId), a => a.questionId).values()].map(rows => rows.length)
  return num(mean(counts), counts.length, 'zero_denominator')
}

export function lsSectionErrorDensity(input: StatsInput, p: StatParams): StatResult {
  const atts = attemptsOf(input, p.lessonId)
  const items = sectionItems(atts)
  const wrong = atts.filter(a => !a.correct).length
  return withList(items, safeDiv(wrong, atts.length), atts.length, 'zero_denominator')
}

/** En zor bölüm: breakdown'ın ilki (argmax), value = oranı, key = section. */
export function lsHardestSection(input: StatsInput, p: StatParams): StatResult {
  const atts = attemptsOf(input, p.lessonId)
  const eligible = sectionItems(atts)
    .filter(i => i.value !== null && i.n >= T.MIN_ATTEMPTS)
    .sort((a, b) => descNullLast(a.value, b.value) || a.key.localeCompare(b.key))
  const top = eligible[0]
  if (top === undefined) return num(null, atts.length)
  return num(top.value, top.n, 'insufficient', { breakdown: eligible })
}

/** Soru hata yoğunluğu: en kötü k soru (oran azalan). */
export function lsQuestionErrorDensity(input: StatsInput, p: StatParams): StatResult {
  const k = p.k ?? T.TOP_K
  const items: StatBreakdownItem[] = [...groupBy(attemptsOf(input, p.lessonId), a => a.questionId).entries()]
    .map(([key, rows]) => ({
      key,
      value: safeDiv(rows.filter(r => !r.correct).length, rows.length),
      n: rows.length,
    }))
    .filter(i => i.n >= T.MIN_ATTEMPTS_ITEM)
    .sort((a, b) => descNullLast(a.value, b.value) || a.key.localeCompare(b.key))
  const top = items.slice(0, k)
  const first = top[0]
  if (first === undefined) return num(null, items.length)
  return num(first.value, items.length, 'insufficient', { breakdown: top })
}

/** Ders (konu) hata yoğunluğu; breakdown müfredat sırasıyla. value = genel oran. */
export function lsLessonErrorDensity(input: StatsInput, _p: StatParams): StatResult {
  const map = sessionLessonMap(input)
  const rows: { lessonId: string; correct: boolean }[] = []
  for (const a of input.attempts) {
    const lessonId = map.get(a.sessionId)
    if (lessonId !== undefined) rows.push({ lessonId, correct: a.correct })
  }
  const seq = new Map(orderedLessons(input).map(l => [l.id, l.sequence] as const))
  const items: StatBreakdownItem[] = [...groupBy(rows, r => r.lessonId).entries()]
    .map(([key, rs]) => ({
      key,
      value: rs.length >= T.MIN_ATTEMPTS ? safeDiv(rs.filter(r => !r.correct).length, rs.length) : null,
      n: rs.length,
    }))
    .sort((a, b) => (seq.get(a.key) ?? Infinity) - (seq.get(b.key) ?? Infinity) || a.key.localeCompare(b.key))
  const wrong = rows.filter(r => !r.correct).length
  return withList(items, safeDiv(wrong, rows.length), rows.length, 'zero_denominator')
}

/** Deneme konu hata yoğunluğu (0011 tablosu). Konu n<5 soru -> null. */
export function lsTopicErrorDensityExam(input: StatsInput, p: StatParams): StatResult {
  const keys = new Set(resultsFor(input, p).map(r => `${r.examId}:${r.subjectId}`))
  const topics = input.topics.filter(t => keys.has(t.resultKey) && (p.subjectId == null || t.subjectId === p.subjectId))
  const items: StatBreakdownItem[] = [...groupBy(topics, t => t.topic).entries()]
    .map(([key, rows]) => {
      const wrong = sumOf(rows, r => r.incorrect)
      const q = sumOf(rows, r => r.correct + r.incorrect + r.blank)
      return { key, value: q >= T.MIN_QUESTIONS_TOPIC ? safeDiv(wrong, q) : null, n: q }
    })
    .sort((a, b) => descNullLast(a.value, b.value) || a.key.localeCompare(b.key))
  const totalQ = sumOf(topics, r => r.correct + r.incorrect + r.blank)
  const totalWrong = sumOf(topics, r => r.incorrect)
  return withList(items, safeDiv(totalWrong, totalQ), totalQ, 'zero_denominator')
}

/* ── değerlendirme (ders sonu sınavı) ──────────────────────────────── */

function assessmentsSorted(input: StatsInput): { percent: number; submittedAt: string; lessonId: string }[] {
  return [...input.assessments].sort(
    (a, b) => a.submittedAt.localeCompare(b.submittedAt) || a.sessionId.localeCompare(b.sessionId),
  )
}

export function lsAssessmentLast(input: StatsInput, _p: StatParams): StatResult {
  const list = assessmentsSorted(input)
  const last = list.at(-1)
  return last === undefined ? nodata() : num(last.percent, list.length)
}

export function lsAssessmentAvgLastn(input: StatsInput, p: StatParams): StatResult {
  return meanOfLast(assessmentsSorted(input).map(a => a.percent), p.n ?? 0)
}

export function lsAssessmentSlopeLastn(input: StatsInput, p: StatParams): StatResult {
  return slopeOfLast(assessmentsSorted(input).map(a => a.percent), p.n ?? 0)
}

export function lsAssessmentZNthPrev5(input: StatsInput, p: StatParams): StatResult {
  const floor = floorOf('pct')
  return nthStat(assessmentsSorted(input).map(a => a.percent), p, T.REF_NEAR, T.MIN_REF_Z, (x, ref) =>
    z(x, ref, floor),
  )
}

/** Her ders için ilk primary tamamlamanın değerlendirme yıldızı; ortalama. */
export function lsStarsAvg(input: StatsInput, p: StatParams): StatResult {
  const sessions = new Map(input.sessions.map(s => [s.id, s] as const))
  const percentBySession = new Map(input.assessments.map(a => [a.sessionId, a.percent] as const))
  const seen = new Set<string>()
  const items: { x: string; stars: number }[] = []
  const sorted = [...input.completions].sort((a, b) => a.completedAt.localeCompare(b.completedAt))
  for (const c of sorted) {
    if (seen.has(c.lessonId)) continue
    if (sessions.get(c.sessionId)?.kind !== 'primary') continue
    seen.add(c.lessonId)
    const pct = percentBySession.get(c.sessionId)
    if (pct === undefined) continue
    items.push({ x: c.completedAt, stars: starsOf(pct) })
  }
  const stars = paramLastN(items, p).map(i => i.stars)
  if (stars.length < T.MIN_AVG) return num(null, stars.length)
  return num(mean(stars), stars.length)
}

/* ── lessonId zorunlu: gelişim eğrisi ──────────────────────────────── */

export function lsLessonCurveSeries(input: StatsInput, p: StatParams): StatResult {
  if (p.lessonId == null) return na()
  const curve = lessonCurve(input, p.lessonId)
  const last = curve.at(-1)
  return num(last === undefined ? null : last.y, curve.length, 'insufficient', { series: curve })
}

export function lsLessonCurveSlope(input: StatsInput, p: StatParams): StatResult {
  if (p.lessonId == null) return na()
  const ys = lessonCurve(input, p.lessonId).map(pt => pt.y)
  return slopeOfLast(ys, ys.length)
}

export function lsLessonCurveDelta(input: StatsInput, p: StatParams): StatResult {
  if (p.lessonId == null) return na()
  const curve = lessonCurve(input, p.lessonId)
  const first = curve[0]
  const last = curve.at(-1)
  if (curve.length < T.MIN_AVG || first === undefined || last === undefined) return num(null, curve.length)
  return num((last.y - first.y) * 100, curve.length)
}

export function lsLessonAttemptsToTarget(input: StatsInput, p: StatParams): StatResult {
  if (p.lessonId == null) return na()
  const curve = lessonCurve(input, p.lessonId)
  const idx = curve.findIndex(pt => pt.y >= T.TARGET_ACC)
  if (idx < 0) return num(null, curve.length, 'not_applicable')
  return num(idx + 1, curve.length)
}

export function lsLessonAssessmentCurve(input: StatsInput, p: StatParams): StatResult {
  if (p.lessonId == null) return na()
  const lessonId = p.lessonId
  const list = assessmentsSorted(input).filter(a => a.lessonId === lessonId)
  const last = list.at(-1)
  if (last === undefined) return nodata()
  const series = list.map(a => ({ x: a.submittedAt, y: a.percent }))
  return num(last.percent, list.length, 'insufficient', { series })
}

/** Bu ders, sequence sıralı diğer derslere göre (ilk primary doğruluğu, pct). */
export function lsLessonComparePrev5(input: StatsInput, p: StatParams): StatResult {
  if (p.lessonId == null) return na()
  const ordered = orderedLessons(input)
  const acc = firstPrimaryAccuracy(input)
  const vals = ordered.map(l => {
    const r = acc.get(l.id)
    return r === undefined || r === null ? null : r * 100
  })
  const idx = ordered.findIndex(l => l.id === p.lessonId)
  const cur = idx < 0 ? null : (vals[idx] ?? null)
  if (cur === null) return num(null, 0)
  const ref = vals.slice(Math.max(0, idx - T.REF_NEAR), idx).filter((v): v is number => v !== null)
  if (ref.length < T.MIN_REF_Z) return num(null, ref.length)
  const m = mean(ref)
  if (m === null) return num(null, ref.length)
  return num(cur - m, ref.length, 'insufficient', {
    breakdown: [
      { key: 'delta', value: cur - m, n: ref.length },
      { key: 'z', value: z(cur, ref, floorOf('pct')), n: ref.length },
    ],
  })
}

/** Ders serisi (sequence sıralı, pct) üzerinde düşüş kuralları. */
export function lsLessonDeclineFlag(input: StatsInput, _p: StatParams): StatResult {
  const acc = firstPrimaryAccuracy(input)
  const vals: number[] = []
  for (const l of orderedLessons(input)) {
    const r = acc.get(l.id)
    if (r !== undefined && r !== null) vals.push(r * 100)
  }
  const d = declineRules(vals, 'pct')
  return num(severity(d), d.windowN)
}
