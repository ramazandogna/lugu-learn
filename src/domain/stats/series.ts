/**
 * Ortak seriler ve sonuç yardımcıları (spec 11, series.ts). Grup dosyaları birbirini
 * import etmez; ortak ihtiyaç buraya taşınır.
 */
import type {
  AttemptRow,
  ExamResultRow,
  ExamRow,
  IsoTs,
  LessonRow,
  NullReason,
  SessionRow,
  StatBreakdownItem,
  StatParams,
  StatPoint,
  StatResult,
  StatsInput,
} from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { groupBy, mean, safeDiv, sd, slope, sumOf } from './math.ts'
import { lastN } from './windows.ts'

/* ── sonuç kurucuları ───────────────────────────────────────────────── */

/** value null ise reason zorunlu; değilse reason yazılmaz. */
export function num(
  value: number | null,
  n: number,
  reason: NullReason = 'insufficient',
  extra?: { series?: StatPoint[]; breakdown?: StatBreakdownItem[] },
): StatResult {
  if (value === null || !Number.isFinite(value)) return { value: null, n, reason, ...extra }
  return { value, n, ...extra }
}

/** Sayma statı: boş veri geçerli sıfırdır. */
export function cnt(n: number, extra?: { breakdown?: StatBreakdownItem[] }): StatResult {
  return { value: n, n, ...extra }
}

export function na(): StatResult {
  return { value: null, n: 0, reason: 'not_applicable' }
}

export function nodata(): StatResult {
  return { value: null, n: 0, reason: 'no_data' }
}

/** Liste boşsa no_data; değilse value + breakdown. */
export function withList(items: StatBreakdownItem[], value: number | null, n: number, reason: NullReason = 'insufficient'): StatResult {
  if (items.length === 0) return nodata()
  return num(value, n, reason, { breakdown: items })
}

/* ── metrik ve param ───────────────────────────────────────────────── */

export type MetricKey = 'pct' | 'net'

export function metricOf(p: StatParams): MetricKey {
  return p.metric ?? 'pct'
}

export function floorOf(metric: MetricKey): number {
  return metric === 'net' ? T.SD_FLOOR_NET : T.SD_FLOOR_PCT
}

/** window "lastN" ve n verilmişse son n; aksi halde hepsi. */
export function paramLastN<X>(xs: readonly X[], p: StatParams): X[] {
  return p.window === 'lastN' && p.n !== undefined ? lastN(xs, p.n) : [...xs]
}

/** N. nokta ve ondan önceki en fazla `size` nokta. nth yoksa son nokta. */
export function nthAndRef(
  xs: readonly number[],
  nth: number | undefined,
  size: number,
): { x: number; ref: number[]; idx: number } | null {
  const idx = nth === undefined ? xs.length - 1 : nth - 1
  const x = xs[idx]
  if (x === undefined) return null
  return { x, ref: xs.slice(Math.max(0, idx - size), idx), idx }
}

/**
 * Tek nokta + referans kalıbı: referans minRef'ten azsa insufficient.
 * ex_delta_nth_*, ex_pctchange_*, ex_z_nth_*, ls_assessment_z_* bu kalıbı kullanır.
 */
export function nthStat(
  xs: readonly number[],
  p: StatParams,
  size: number,
  minRef: number,
  f: (x: number, ref: number[]) => number | null,
): StatResult {
  const r = nthAndRef(xs, p.nth, size)
  if (r === null || r.ref.length < minRef) return num(null, r?.ref.length ?? 0)
  return num(f(r.x, r.ref), r.ref.length)
}

export function meanOfLast(xs: readonly number[], k: number): StatResult {
  const w = lastN(xs, k)
  return w.length < T.MIN_AVG ? num(null, w.length) : num(mean(w), w.length)
}

export function slopeOfLast(xs: readonly number[], k: number): StatResult {
  const w = lastN(xs, k)
  return w.length < T.MIN_SLOPE ? num(null, w.length) : num(slope(w), w.length)
}

/* ── ex serisi (spec 2) ────────────────────────────────────────────── */

export interface ExamPoint {
  examId: string
  date: string
  createdAt: IsoTs
  kind: ExamRow['kind']
  net: number
  total: number | null
  correct: number
  incorrect: number
  blank: number
  /** total>0 ? net/total*100 : null */
  pct: number | null
}

/**
 * SERI(subjectId): sınav başına bir nokta, tarih artan, eşitlikte createdAt.
 * subjectId null = tüm derslerin toplamı (bir ders total'ı null ise toplam null).
 */
export function examSeries(input: StatsInput, subjectId: string | null): ExamPoint[] {
  const exams = new Map<string, ExamRow>()
  for (const e of input.exams) exams.set(e.examId, e)
  const rowsByExam = groupBy(
    input.results.filter(r => subjectId === null || r.subjectId === subjectId),
    r => r.examId,
  )
  const points: ExamPoint[] = []
  for (const [examId, rows] of rowsByExam) {
    const exam = exams.get(examId)
    if (!exam) continue
    const total = rows.reduce<number | null>((acc, r) => (acc === null || r.total === null ? null : acc + r.total), 0)
    const net = sumOf(rows, r => r.net)
    points.push({
      examId,
      date: exam.date,
      createdAt: exam.createdAt,
      kind: exam.kind,
      net,
      total,
      correct: sumOf(rows, r => r.correct),
      incorrect: sumOf(rows, r => r.incorrect),
      blank: sumOf(rows, r => r.blank),
      pct: total !== null && total > 0 ? (net / total) * 100 : null,
    })
  }
  return points.sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.examId.localeCompare(b.examId),
  )
}

/** Seçilen metrik değerleri; null noktalar atılır. */
export function valuesOf(points: readonly ExamPoint[], metric: MetricKey): number[] {
  const out: number[] = []
  for (const p of points) {
    const v = metric === 'net' ? p.net : p.pct
    if (v !== null) out.push(v)
  }
  return out
}

/** Denemeler için sonuç satırları (ders filtreli, lastN penceresi uygulanmış). */
export function resultsFor(input: StatsInput, p: StatParams): ExamResultRow[] {
  const sid = p.subjectId ?? null
  const ids = new Set(paramLastN(examSeries(input, sid), p).map(x => x.examId))
  return input.results.filter(r => ids.has(r.examId) && (sid === null || r.subjectId === sid))
}

/* ── ayrık düşüş kuralları (spec 2: ex_decline_*, ls_lesson_decline_flag) ── */

export interface Decline {
  slope: number | null
  slopeN: number
  /** A: son 3 nokta eğimi < eşik. */
  slopeFlag: boolean | null
  /** B: son nokta < önceki 5 ort - K*max(sd, floor). */
  sdFlag: boolean | null
  /** Önceki 5 ort - son. */
  magnitude: number | null
  /** Son 6 pencere boyu. */
  windowN: number
}

/** values metrik birimindedir (pct için puan, net için net). */
export function declineRules(values: readonly number[], metric: MetricKey): Decline {
  const slopeThr = metric === 'net' ? T.DECLINE_SLOPE_NET : T.DECLINE_SLOPE_PCT
  const floor = floorOf(metric)
  const a = lastN(values, T.DECLINE_LAST_N)
  const sl = a.length >= T.MIN_SLOPE ? slope(a) : null
  const w = lastN(values, T.DECLINE_WINDOW)
  const last = w.at(-1)
  const ref = w.slice(0, -1)
  const m = mean(ref)
  const s = sd(ref)
  let sdFlag: boolean | null = null
  let magnitude: number | null = null
  if (last !== undefined && ref.length >= T.MIN_REF_Z && m !== null && s !== null) {
    sdFlag = last < m - T.DECLINE_SD_K * Math.max(s, floor)
    magnitude = m - last
  }
  return {
    slope: sl,
    slopeN: a.length,
    slopeFlag: sl === null ? null : sl < slopeThr,
    sdFlag,
    magnitude,
    windowN: w.length,
  }
}

/** Şiddet: 0 sorun yok, 1 uyarı, 2 belirgin düşüş. İki kural da null ise null. */
export function severity(d: Decline): number | null {
  if (d.slopeFlag === null && d.sdFlag === null) return null
  return (d.slopeFlag ? 1 : 0) + (d.sdFlag ? 1 : 0)
}

export function flagBit(f: boolean | null): number | null {
  return f === null ? null : f ? 1 : 0
}

/* ── ders / oturum / cevap ilişkileri (spec 3) ─────────────────────── */

export function sessionsOf(input: StatsInput, lessonId: string | null | undefined): SessionRow[] {
  return lessonId == null ? [...input.sessions] : input.sessions.filter(s => s.lessonId === lessonId)
}

export function sessionIdsOf(input: StatsInput, lessonId: string | null | undefined): Set<string> {
  return new Set(sessionsOf(input, lessonId).map(s => s.id))
}

export function sessionLessonMap(input: StatsInput): Map<string, string> {
  return new Map<string, string>(input.sessions.map(s => [s.id, s.lessonId] as const))
}

/** Cevaplar; lessonId verilmişse oturumun dersine göre süzülür. */
export function attemptsOf(input: StatsInput, lessonId: string | null | undefined): AttemptRow[] {
  if (lessonId == null) return [...input.attempts]
  const map = sessionLessonMap(input)
  return input.attempts.filter(a => map.get(a.sessionId) === lessonId)
}

/** Doğru oranı; payda 0 -> null. */
export function correctRate(atts: readonly AttemptRow[]): number | null {
  return safeDiv(atts.filter(a => a.correct).length, atts.length)
}

/** Oran statı: n<minN -> insufficient, değilse doğru/yanlış oranı (pred). */
export function rateStat(atts: readonly AttemptRow[], pred: (a: AttemptRow) => boolean, minN: number): StatResult {
  if (atts.length < minN) return num(null, atts.length)
  return num(safeDiv(atts.filter(pred).length, atts.length), atts.length, 'zero_denominator')
}

export function attemptsBySession(input: StatsInput): Map<string, AttemptRow[]> {
  return groupBy(input.attempts, a => a.sessionId)
}

/** Ders sırası (müfredat), id tekil; sequence artan. */
export function orderedLessons(input: StatsInput): LessonRow[] {
  const byId = new Map<string, LessonRow>()
  for (const l of input.lessons) if (!byId.has(l.id)) byId.set(l.id, l)
  return [...byId.values()].sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id))
}

/** Dersin gelişim eğrisi: oturum başına doğruluk (startedAt artan). Cevapsız oturum atılır. */
export function lessonCurve(input: StatsInput, lessonId: string): StatPoint[] {
  const bySession = attemptsBySession(input)
  const out: StatPoint[] = []
  const list = sessionsOf(input, lessonId).sort(
    (a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id),
  )
  for (const s of list) {
    const atts = bySession.get(s.id)
    if (!atts) continue
    const y = correctRate(atts)
    if (y === null) continue
    out.push({ x: s.startedAt, y })
  }
  return out
}

/** Her ders için ilk primary oturumun doğruluğu (ratio). Oturum cevapsızsa null. */
export function firstPrimaryAccuracy(input: StatsInput): Map<string, number | null> {
  const bySession = attemptsBySession(input)
  const primaries = input.sessions
    .filter(s => s.kind === 'primary')
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id))
  const m = new Map<string, number | null>()
  for (const s of primaries) {
    if (m.has(s.lessonId)) continue
    m.set(s.lessonId, correctRate(bySession.get(s.id) ?? []))
  }
  return m
}
