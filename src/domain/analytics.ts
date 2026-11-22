/**
 * Pure derivations for the teacher's analytics. They produce OBSERVATIONS —
 * what the numbers show, with the numbers — never judgments about the child.
 *
 * Principles (product brief §15.4, §17.1):
 * - Time alone never yields a weakness label: speed is only reported together
 *   with accuracy, and "slow" is only ever paired with "accurate".
 * - Every pattern needs a minimum sample (`SIGNAL_THRESHOLDS`); below it the
 *   result says "yeterli veri yok" instead of guessing.
 * - Sentences are neutral Turkish, state the evidence, and never name a cause.
 */

/* ── inputs (shapes of the server rows, camelCased) ───────────────────── */

export interface SectionRow {
  section: string
  startedAt: string | null
  completedAt: string | null
  activeSeconds: number
  idleSeconds: number
}

export interface AttemptRow {
  questionId: string
  section: string
  attemptNo: number
  correct: boolean
  /** Client-measured; null when unknown. */
  responseMs: number | null
  hintUsed: boolean
  /** ISO timestamp; orders attempts in time. */
  at: string
}

export interface VocabRow {
  itemId: string
  /** Server count since the last miss (mastery rule), not a lifetime total. */
  correctCount: number
  incorrectCount: number
  masteredAt: string | null
}

export interface SessionRow {
  status: 'active' | 'completed' | 'abandoned'
  startedAt: string
}

/* ── formatting ───────────────────────────────────────────────────────── */

const pct = (x: number) => `%${Math.round(x * 100)}`
/** Seconds with a Turkish decimal comma, at most one decimal: 8000 → "8", 7450 → "7,5". */
const secs = (ms: number) => String(Math.round(ms / 100) / 10).replace('.', ',')
const num = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',')

export function median(xs: readonly number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? (s[m] ?? null) : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2
}

/* ── section, question, vocabulary ────────────────────────────────────── */

/** Per section: wall-clock duration (null until completed) and the active/idle estimates. */
export function sectionTimes(rows: readonly SectionRow[]) {
  return rows.map((r) => {
    const start = r.startedAt ? Date.parse(r.startedAt) : NaN
    const end = r.completedAt ? Date.parse(r.completedAt) : NaN
    const duration = Number.isFinite(start) && Number.isFinite(end) && end >= start ? Math.round((end - start) / 1000) : null
    const tracked = r.activeSeconds + r.idleSeconds
    return {
      section: r.section,
      durationSeconds: duration,
      activeSeconds: r.activeSeconds,
      idleSeconds: r.idleSeconds,
      activeShare: tracked > 0 ? r.activeSeconds / tracked : null,
    }
  })
}

export interface QuestionStat {
  questionId: string
  section: string
  attempts: number
  correct: number
  accuracy: number
  firstTryCorrect: boolean
  medianMs: number | null
  hintRate: number
}

/** Accuracy and latency per question, hardest (lowest accuracy) first. */
export function questionStats(attempts: readonly AttemptRow[]): QuestionStat[] {
  const by = new Map<string, AttemptRow[]>()
  for (const a of attempts) by.set(a.questionId, [...(by.get(a.questionId) ?? []), a])
  return [...by.entries()]
    .map(([questionId, rows]) => {
      const sorted = [...rows].sort((a, b) => a.attemptNo - b.attemptNo)
      const correct = rows.filter((r) => r.correct).length
      return {
        questionId,
        section: sorted[0]?.section ?? '',
        attempts: rows.length,
        correct,
        accuracy: correct / rows.length,
        firstTryCorrect: sorted[0]?.correct ?? false,
        medianMs: median(rows.flatMap((r) => (r.responseMs === null ? [] : [r.responseMs]))),
        hintRate: rows.filter((r) => r.hintUsed).length / rows.length,
      }
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
}

/** Vocabulary items ranked by errors (most first); `repeatedErrors` at `repeatedErrorCount` or more misses. */
export function vocabDifficulty(rows: readonly VocabRow[], t: SignalThresholds = SIGNAL_THRESHOLDS) {
  return [...rows]
    .sort((a, b) => b.incorrectCount - a.incorrectCount || a.itemId.localeCompare(b.itemId))
    .map((r) => ({
      itemId: r.itemId,
      incorrect: r.incorrectCount,
      mastered: r.masteredAt !== null,
      repeatedErrors: r.incorrectCount >= t.repeatedErrorCount,
    }))
}

/* ── signals ──────────────────────────────────────────────────────────── */

/**
 * Thresholds for the observations. Chosen to be conservative: a pattern is
 * named only when it is clear and the sample is big enough.
 */
export const SIGNAL_THRESHOLDS = {
  /** Answers needed before any accuracy/latency pattern is named. */
  minAnswers: 10,
  /** Median response time at or above this counts as slow (only reported with high accuracy). */
  slowMedianMs: 7000,
  /** Median response time at or below this counts as fast. */
  fastMedianMs: 2500,
  /** Accuracy at or above: "largely correct". */
  highAccuracy: 0.85,
  /** Accuracy below: "low". */
  lowAccuracy: 0.6,
  /** Misses on one question or word that count as repeated. */
  repeatedErrorCount: 3,
  /** Answers needed to compare the first and second half of the period. */
  improvingMinAnswers: 20,
  /** Accuracy gain (second half − first half) that counts as improving. */
  improvingDelta: 0.15,
  /** Share of answers with a hint that counts as frequent hint use. */
  hintRate: 0.4,
  /** Overall and first-try accuracy for consistent mastery. */
  masteryAccuracy: 0.9,
  masteryFirstTry: 0.85,
  /** Primary sessions needed before abandonment is named, and how many abandoned. */
  minSessions: 3,
  abandonedSessions: 2,
}
export type SignalThresholds = typeof SIGNAL_THRESHOLDS

export type SignalKind =
  | 'slow_accurate'
  | 'fast_inaccurate'
  | 'repeated_errors'
  | 'improving'
  | 'hint_dependent'
  | 'consistent_mastery'
  | 'repeated_abandonment'

export interface Observation {
  kind: SignalKind | 'insufficient_data'
  /** What the sentence is about when data is insufficient. */
  scope?: 'answers' | 'sessions'
  evidence: Record<string, number>
  /** Question or vocabulary ids the observation refers to. */
  refs?: string[]
  /** Neutral Turkish sentence for the teacher. */
  text: string
}

export interface SignalInput {
  attempts: readonly AttemptRow[]
  vocab?: readonly VocabRow[]
  sessions?: readonly SessionRow[]
}

/**
 * Observations from multiple signals. Each one carries its evidence numbers.
 * Too little data yields an `insufficient_data` observation ("yeterli veri yok")
 * rather than a pattern.
 */
export function classifySignals(input: SignalInput, t: SignalThresholds = SIGNAL_THRESHOLDS): Observation[] {
  const out: Observation[] = []
  const attempts = [...input.attempts].sort((a, b) => a.at.localeCompare(b.at))
  const n = attempts.length

  // Repeated errors are per item, so they need no overall sample.
  const qMiss = new Map<string, number>()
  for (const a of attempts) if (!a.correct) qMiss.set(a.questionId, (qMiss.get(a.questionId) ?? 0) + 1)
  const repeated = [
    ...[...qMiss].filter(([, m]) => m >= t.repeatedErrorCount),
    ...(input.vocab ?? []).filter((v) => v.incorrectCount >= t.repeatedErrorCount).map((v) => [v.itemId, v.incorrectCount] as const),
  ]
  if (repeated.length) {
    const maxErrors = Math.max(...repeated.map(([, m]) => m))
    out.push({
      kind: 'repeated_errors',
      evidence: { items: repeated.length, maxErrors },
      refs: repeated.map(([id]) => id),
      text: `${repeated.length} soru veya kelimede tekrarlayan hata görüldü (bir öğede en fazla ${maxErrors} hata).`,
    })
  }

  if (n < t.minAnswers) {
    out.push({
      kind: 'insufficient_data',
      scope: 'answers',
      evidence: { answers: n, required: t.minAnswers },
      text: `Yanıt örüntüsü için yeterli veri yok (${n} yanıt; en az ${t.minAnswers} gerekir).`,
    })
  } else {
    const correct = attempts.filter((a) => a.correct).length
    const accuracy = correct / n
    const latencies = attempts.flatMap((a) => (a.responseMs === null ? [] : [a.responseMs]))
    const med = latencies.length >= t.minAnswers ? median(latencies) : null
    const firsts = attempts.filter((a) => a.attemptNo === 1)
    const firstTry = firsts.length ? firsts.filter((a) => a.correct).length / firsts.length : 0

    if (med !== null && med >= t.slowMedianMs && accuracy >= t.highAccuracy)
      out.push({
        kind: 'slow_accurate',
        evidence: { accuracy, medianMs: med, answers: n },
        text: `Yanıtlar yavaş ama büyük ölçüde doğru (${pct(accuracy)} doğruluk, ortanca ${secs(med)} sn).`,
      })
    if (med !== null && med <= t.fastMedianMs && accuracy < t.lowAccuracy)
      out.push({
        kind: 'fast_inaccurate',
        evidence: { accuracy, medianMs: med, answers: n },
        text: `Yanıtlar hızlı verilmiş ve doğruluk düşük (${pct(accuracy)} doğruluk, ortanca ${secs(med)} sn).`,
      })

    const hints = attempts.filter((a) => a.hintUsed).length
    if (hints / n >= t.hintRate)
      out.push({
        kind: 'hint_dependent',
        evidence: { hintRate: hints / n, hints, answers: n },
        text: `Yanıtların ${pct(hints / n)} kadarında ipucu kullanıldı (${n} yanıttan ${hints}).`,
      })

    if (accuracy >= t.masteryAccuracy && firstTry >= t.masteryFirstTry && !repeated.length)
      out.push({
        kind: 'consistent_mastery',
        evidence: { accuracy, firstTryAccuracy: firstTry, answers: n },
        text: `Yanıtlar tutarlı biçimde doğru (${pct(accuracy)} doğruluk, ilk denemede ${pct(firstTry)}).`,
      })

    if (n >= t.improvingMinAnswers) {
      const half = Math.floor(n / 2)
      const acc = (xs: AttemptRow[]) => xs.filter((a) => a.correct).length / xs.length
      const early = acc(attempts.slice(0, half))
      const late = acc(attempts.slice(n - half))
      if (late - early >= t.improvingDelta)
        out.push({
          kind: 'improving',
          evidence: { earlyAccuracy: early, lateAccuracy: late, answers: n },
          text: `Dönemin ikinci yarısında doğruluk arttı (${pct(early)} → ${pct(late)}).`,
        })
    }
  }

  const sessions = input.sessions
  if (sessions) {
    const closed = sessions.filter((s) => s.status !== 'active')
    if (closed.length < t.minSessions)
      out.push({
        kind: 'insufficient_data',
        scope: 'sessions',
        evidence: { sessions: closed.length, required: t.minSessions },
        text: `Oturum bırakma örüntüsü için yeterli veri yok (${closed.length} oturum; en az ${t.minSessions} gerekir).`,
      })
    else {
      const abandoned = closed.filter((s) => s.status === 'abandoned').length
      if (abandoned >= t.abandonedSessions)
        out.push({
          kind: 'repeated_abandonment',
          evidence: { abandoned, sessions: closed.length },
          text: `Son ${closed.length} oturumdan ${abandoned} tanesi tamamlanmadan bırakıldı.`,
        })
    }
  }
  return out
}

/* ── academic trends ──────────────────────────────────────────────────── */

/** Net = correct − incorrect × penalty (`system_settings`, default 0.25). Blanks do not count. */
export const computeNet = (correct: number, incorrect: number, wrongPenalty = 0.25) => correct - incorrect * wrongPenalty

export interface ExamPoint {
  date: string
  net: number
}

export interface TrendOptions {
  /** |change %| below this is `stable`. */
  thresholdPercent: number
  /** When the previous net is ≤ 0 a percentage is meaningless: |Δnet| below this is `stable`. */
  minNetDelta: number
}
export const TREND_DEFAULTS: TrendOptions = { thresholdPercent: 5, minNetDelta: 1 }

export interface Trend {
  series: ExamPoint[]
  latest: number | null
  previous: number | null
  average: number | null
  /** Latest vs previous, %; null when fewer than 2 points or previous ≤ 0. */
  changePercent: number | null
  /** Latest vs the average of the earlier results, %; null when that average ≤ 0. */
  vsAveragePercent: number | null
  label: 'improvement' | 'decline' | 'stable' | 'insufficient_data'
  /** Neutral, non-causal Turkish sentence. */
  text: string
}

const pctChange = (from: number, to: number) => (from > 0 ? Math.round(((to - from) / from) * 1000) / 10 : null)

/**
 * Trend of one subject's nets over time. The label compares the last two
 * results; "vs average" is reported alongside, never mixed into the label.
 * The sentence describes the change only — it never suggests a cause.
 */
export function academicTrend(points: readonly ExamPoint[], subject: string, opts: TrendOptions = TREND_DEFAULTS): Trend {
  const series = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const nets = series.map((p) => p.net)
  const latest = nets.at(-1) ?? null
  const previous = nets.length >= 2 ? (nets.at(-2) ?? null) : null
  const average = nets.length ? nets.reduce((s, x) => s + x, 0) / nets.length : null
  if (latest === null || previous === null)
    return {
      series,
      latest,
      previous,
      average,
      changePercent: null,
      vsAveragePercent: null,
      label: 'insufficient_data',
      text: `${subject} için karşılaştırma yapacak kadar sınav yok (${nets.length} sınav).`,
    }
  const earlier = nets.slice(0, -1)
  const earlierAvg = earlier.reduce((s, x) => s + x, 0) / earlier.length
  const changePercent = pctChange(previous, latest)
  const delta = latest - previous
  const moved = changePercent !== null ? Math.abs(changePercent) >= opts.thresholdPercent : Math.abs(delta) >= opts.minNetDelta
  const label = !moved ? 'stable' : delta > 0 ? 'improvement' : 'decline'
  const range = `${num(previous)} → ${num(latest)}`
  const amount = changePercent !== null ? `%${num(Math.abs(changePercent))}` : `${num(Math.abs(delta))} net`
  const text =
    label === 'stable'
      ? `${subject} neti son iki sınavda yaklaşık aynı kaldı (${range}).`
      : `${subject} neti son iki sınav arasında ${amount} ${label === 'improvement' ? 'arttı' : 'azaldı'} (${range}).`
  return { series, latest, previous, average, changePercent, vsAveragePercent: pctChange(earlierAvg, latest), label, text }
}

/** Group results by subject and compute each trend. */
export function subjectTrends(
  results: readonly (ExamPoint & { subjectId: string })[],
  subjectName: (id: string) => string,
  opts: TrendOptions = TREND_DEFAULTS,
): Map<string, Trend> {
  const by = new Map<string, ExamPoint[]>()
  for (const r of results) by.set(r.subjectId, [...(by.get(r.subjectId) ?? []), { date: r.date, net: r.net }])
  return new Map([...by].map(([id, pts]) => [id, academicTrend(pts, subjectName(id), opts)]))
}
