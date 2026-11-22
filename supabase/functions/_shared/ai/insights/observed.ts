/**
 * Observed facts, computed in code. The model never computes numbers: it
 * interprets these facts and cites their keys. Classification signals follow
 * brief §15.4 (slow but accurate, fast but inaccurate, repeated errors,
 * improvement, hint dependency, consistent mastery, repeated abandonment) and
 * are emitted only when the sample is large enough to support them.
 */
import type { ObservedFact, ObservedFacts, TeacherObservation } from '@/domain/insights.ts'
import type { PersonalNames } from '../privacy.ts'

export interface AttemptRow {
  questionId: string
  packageId: string
  section: string
  correct: boolean
  responseMs: number | null
  hintUsed: boolean
  createdAt: string
}
export interface MasteryRow {
  itemId: string
  packageId: string
  correctCount: number
  incorrectCount: number
  masteredAt: string | null
}
export interface SessionRow {
  id: string
  kind: 'primary' | 'replay'
  status: 'active' | 'completed' | 'abandoned'
  activeSeconds: number
  idleSeconds: number
  breakSeconds: number
  startedAt: string
}
export interface BreakRow {
  plannedMinutes: number
  earlyReturn: boolean
}
export interface AssessmentRow {
  percent: number
  quizPercent: number | null
  readingPercent: number | null
  createdAt: string
}
export interface ExamResultRow {
  examId: string
  examDate: string
  subject: string
  net: number
}
export interface SpeakingNoteRow {
  id: string
  at: string
  text: string
  speakingSessionId?: string
}

/**
 * Everything the insight pipeline may read about one learner. `names` exists
 * only so free text can be scrubbed; it is never rendered into a prompt.
 */
export interface LearnerSnapshot {
  studentId: string
  names: PersonalNames
  grade: string | null
  attempts: AttemptRow[]
  mastery: MasteryRow[]
  sessions: SessionRow[]
  breaks: BreakRow[]
  assessments: AssessmentRow[]
  exams: ExamResultRow[]
  speakingNotes: SpeakingNoteRow[]
  /** `question/item id → short label` (prompt text or vocabulary phrase) from lesson packages. */
  itemLabels: Record<string, string>
}

/** Thresholds for signals. Documented in docs/ai-workflow.md §Insights. */
export const SIGNAL_THRESHOLDS = {
  minAttempts: 20,
  slowMs: 9_000,
  fastMs: 3_000,
  accurate: 80,
  inaccurate: 60,
  hintRate: 40,
  improvementPoints: 10,
  repeatedErrorMin: 2,
  repeatedErrorItems: 3,
  masteryRatio: 0.9,
  minMasteryItems: 10,
  abandonedMin: 2,
  abandonedRatio: 0.3,
} as const

const pct = (num: number, den: number) => (den ? Math.round((num / den) * 1000) / 10 : 0)
function median(xs: number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? (s[m] as number) : Math.round(((s[m - 1] as number) + (s[m] as number)) / 2)
}

const slug = (s: string) =>
  s
    .toLocaleLowerCase('tr')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'x'

/** Computes the learner's observed facts. Pure; `now` is injected for tests. */
export function computeObservedFacts(s: LearnerSnapshot, now: Date): ObservedFacts {
  const facts: ObservedFact[] = []
  const add = (f: ObservedFact) => facts.push(f)
  const T = SIGNAL_THRESHOLDS

  const attempts = [...s.attempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const n = attempts.length
  const correct = attempts.filter((a) => a.correct).length
  add({ key: 'attempts.total', label: 'Toplam cevap', value: n, unit: 'count', sampleSize: n, source: 'question_attempts' })
  const accuracy = pct(correct, n)
  if (n) add({ key: 'accuracy.overall', label: 'Genel doğruluk', value: accuracy, unit: 'percent', sampleSize: n, source: 'question_attempts' })

  const bySection = new Map<string, { n: number; c: number }>()
  for (const a of attempts) {
    const e = bySection.get(a.section) ?? { n: 0, c: 0 }
    e.n += 1
    if (a.correct) e.c += 1
    bySection.set(a.section, e)
  }
  for (const [sec, e] of [...bySection].sort(([a], [b]) => a.localeCompare(b)))
    add({ key: `accuracy.section.${sec}`, label: `Doğruluk: ${sec}`, value: pct(e.c, e.n), unit: 'percent', sampleSize: e.n, source: 'question_attempts' })

  const times = attempts.flatMap((a) => (a.responseMs != null && a.responseMs > 0 ? [a.responseMs] : []))
  const med = median(times)
  if (med != null) add({ key: 'response.median_ms', label: 'Ortanca cevap süresi', value: med, unit: 'ms', sampleSize: times.length, source: 'question_attempts' })

  const hints = attempts.filter((a) => a.hintUsed).length
  const hintRate = pct(hints, n)
  if (n) add({ key: 'hints.rate', label: 'İpucu kullanım oranı', value: hintRate, unit: 'percent', sampleSize: n, source: 'question_attempts' })

  // Repeated errors: the same question answered wrong at least twice.
  const wrong = new Map<string, number>()
  for (const a of attempts) if (!a.correct) wrong.set(a.questionId, (wrong.get(a.questionId) ?? 0) + 1)
  const repeated = [...wrong].filter(([, c]) => c >= T.repeatedErrorMin).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  for (const [qid, count] of repeated.slice(0, 10))
    add({
      key: `errors.repeated.${qid}`,
      label: 'Tekrarlayan hata',
      value: count,
      unit: 'count',
      sampleSize: attempts.filter((a) => a.questionId === qid).length,
      source: 'question_attempts',
      detail: s.itemLabels[qid] ?? qid,
    })

  // Improvement: accuracy in the second half of attempts vs the first half.
  let trend: number | null = null
  if (n >= T.minAttempts) {
    const half = Math.floor(n / 2)
    const first = attempts.slice(0, half)
    const second = attempts.slice(half)
    trend = Math.round((pct(second.filter((a) => a.correct).length, second.length) - pct(first.filter((a) => a.correct).length, first.length)) * 10) / 10
    add({ key: 'accuracy.trend', label: 'Doğruluk değişimi (ikinci yarı − ilk yarı)', value: trend, unit: 'points', sampleSize: n, source: 'question_attempts' })
  }

  const items = s.mastery.length
  const mastered = s.mastery.filter((m) => m.masteredAt).length
  if (items) {
    add({ key: 'vocab.mastered', label: 'Ustalaşılan kelime', value: mastered, unit: 'count', sampleSize: items, source: 'vocabulary_mastery' })
    add({ key: 'vocab.unmastered', label: 'Henüz ustalaşılmayan kelime', value: items - mastered, unit: 'count', sampleSize: items, source: 'vocabulary_mastery' })
  }
  const hardVocab = s.mastery
    .filter((m) => m.incorrectCount >= 2)
    .sort((a, b) => b.incorrectCount - a.incorrectCount || a.itemId.localeCompare(b.itemId))
    .slice(0, 8)
  for (const m of hardVocab)
    add({
      key: `vocab.difficult.${m.itemId}`,
      label: 'Zorlanılan kelime',
      value: m.incorrectCount,
      unit: 'count',
      sampleSize: m.correctCount + m.incorrectCount,
      source: 'vocabulary_mastery',
      detail: s.itemLabels[m.itemId] ?? m.itemId,
    })

  const primary = s.sessions.filter((x) => x.kind === 'primary')
  const abandoned = primary.filter((x) => x.status === 'abandoned').length
  if (s.sessions.length) {
    add({ key: 'sessions.total', label: 'Ders oturumu', value: s.sessions.length, unit: 'count', sampleSize: s.sessions.length, source: 'learning_sessions' })
    add({ key: 'sessions.completed', label: 'Tamamlanan oturum', value: s.sessions.filter((x) => x.status === 'completed').length, unit: 'count', sampleSize: s.sessions.length, source: 'learning_sessions' })
    add({ key: 'sessions.abandoned', label: 'Yarıda bırakılan oturum', value: abandoned, unit: 'count', sampleSize: primary.length, source: 'learning_sessions' })
    const active = s.sessions.reduce((t, x) => t + x.activeSeconds, 0)
    const idle = s.sessions.reduce((t, x) => t + x.idleSeconds, 0)
    add({ key: 'sessions.active_seconds', label: 'Aktif çalışma süresi', value: active, unit: 'seconds', sampleSize: s.sessions.length, source: 'learning_sessions' })
    if (active + idle > 0)
      add({ key: 'sessions.idle_ratio', label: 'Boşta kalma oranı', value: Math.round((idle / (active + idle)) * 100) / 100, unit: 'ratio', sampleSize: s.sessions.length, source: 'learning_sessions' })
  }
  if (s.breaks.length) {
    add({ key: 'breaks.count', label: 'Mola sayısı', value: s.breaks.length, unit: 'count', sampleSize: s.breaks.length, source: 'break_sessions' })
    add({ key: 'breaks.early_return', label: 'Moladan erken dönüş', value: s.breaks.filter((b) => b.earlyReturn).length, unit: 'count', sampleSize: s.breaks.length, source: 'break_sessions' })
  }

  const assessments = [...s.assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const lastA = assessments.at(-1)
  if (lastA) add({ key: 'assessment.latest_percent', label: 'Son değerlendirme', value: lastA.percent, unit: 'percent', sampleSize: 1, source: 'assessment_results' })
  if (assessments.length >= 2)
    add({
      key: 'assessment.change',
      label: 'Değerlendirme değişimi (son − ilk)',
      value: Math.round(((lastA?.percent ?? 0) - (assessments[0]?.percent ?? 0)) * 10) / 10,
      unit: 'points',
      sampleSize: assessments.length,
      source: 'assessment_results',
    })

  // School exams: per subject, the change over the last three exams; overall total net.
  const bySubject = new Map<string, ExamResultRow[]>()
  for (const r of s.exams) bySubject.set(r.subject, [...(bySubject.get(r.subject) ?? []), r])
  for (const [subject, rows] of [...bySubject].sort(([a], [b]) => a.localeCompare(b))) {
    const sorted = rows.sort((a, b) => a.examDate.localeCompare(b.examDate)).slice(-3)
    const last = sorted.at(-1)
    if (!last) continue
    const key = slug(subject)
    add({ key: `exam.${key}.latest_net`, label: `${subject} son net`, value: last.net, unit: 'net', sampleSize: rows.length, source: 'school_exam_results' })
    if (sorted.length >= 2)
      add({
        key: `exam.${key}.net_change`,
        label: `${subject} net değişimi (son ${sorted.length} sınav)`,
        value: Math.round((last.net - (sorted[0]?.net ?? 0)) * 100) / 100,
        unit: 'net',
        sampleSize: sorted.length,
        source: 'school_exam_results',
        detail: sorted.map((r) => `${r.examDate}: ${r.net}`).join(', '),
      })
  }
  const totals = new Map<string, { date: string; net: number }>()
  for (const r of s.exams) {
    const t = totals.get(r.examId) ?? { date: r.examDate, net: 0 }
    t.net += r.net
    totals.set(r.examId, t)
  }
  const totalSeries = [...totals.values()].sort((a, b) => a.date.localeCompare(b.date))
  if (totalSeries.length >= 2) {
    const last = totalSeries.at(-1)?.net ?? 0
    const prev = totalSeries.at(-2)?.net ?? 0
    add({ key: 'exam.total.last_change', label: 'Genel net değişimi (son iki sınav)', value: Math.round((last - prev) * 100) / 100, unit: 'net', sampleSize: totalSeries.length, source: 'school_exam_results' })
  }

  if (s.speakingNotes.length)
    add({ key: 'speaking.notes', label: 'Konuşma dersi notu', value: s.speakingNotes.length, unit: 'count', sampleSize: s.speakingNotes.length, source: 'speaking_session_notes' })

  // Signals (§15.4). Each lists its basis; none is emitted on a small sample.
  const signal = (key: string, label: string, basis: string[], sampleSize: number) =>
    add({ key: `signal.${key}`, label, value: true, unit: 'flag', sampleSize, source: 'derived', basis })
  if (n >= T.minAttempts && med != null) {
    if (med >= T.slowMs && accuracy >= T.accurate) signal('slow_accurate', 'Yavaş ama doğru', ['response.median_ms', 'accuracy.overall'], n)
    if (med <= T.fastMs && accuracy < T.inaccurate) signal('fast_inaccurate', 'Hızlı ama hatalı', ['response.median_ms', 'accuracy.overall'], n)
  }
  if (repeated.length >= T.repeatedErrorItems)
    signal('repeated_errors', 'Tekrarlayan hatalar', repeated.slice(0, 10).map(([q]) => `errors.repeated.${q}`), n)
  if (trend != null && trend >= T.improvementPoints) signal('improving', 'Gelişme', ['accuracy.trend'], n)
  if (n >= T.minAttempts && hintRate >= T.hintRate) signal('hint_dependent', 'Yüksek ipucu kullanımı', ['hints.rate'], n)
  if (items >= T.minMasteryItems && mastered / items >= T.masteryRatio && n >= T.minAttempts && accuracy >= 85)
    signal('consistent_mastery', 'İstikrarlı ustalaşma', ['vocab.mastered', 'accuracy.overall'], items)
  if (abandoned >= T.abandonedMin && primary.length && abandoned / primary.length >= T.abandonedRatio)
    signal('repeated_abandonment', 'Tekrarlanan yarıda bırakma', ['sessions.abandoned'], primary.length)

  const dates = [...s.attempts.map((a) => a.createdAt), ...s.sessions.map((x) => x.startedAt)].sort()
  return { computedAt: now.toISOString(), window: { from: dates[0] ?? null, to: now.toISOString() }, facts }
}

/** Teacher notes as stored (verbatim, unscrubbed: they are the teacher's own record). */
export function teacherObservations(s: LearnerSnapshot): TeacherObservation[] {
  return s.speakingNotes.map((n) => ({ id: n.id, at: n.at, text: n.text, ...(n.speakingSessionId ? { speakingSessionId: n.speakingSessionId } : {}) }))
}

/** Evidence keys the model may cite: every fact key and `teacher.<note id>`. */
export function allowedEvidenceKeys(observed: ObservedFacts, notes: readonly TeacherObservation[]): Set<string> {
  return new Set([...observed.facts.map((f) => f.key), ...notes.map((n) => `teacher.${n.id}`)])
}
