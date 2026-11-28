/*
 * Deterministic reading rules for the teacher (docs/design/admin-redesign.md §3).
 * Pure functions; no AI. Thresholds live here and nowhere else.
 */
import { AlertTriangle, CheckCircle2, Minus, XCircle } from 'lucide-vue-next'

export type Level = 'iyi' | 'dikkat' | 'zayif' | 'yok'
export type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'neutral'

export const LEVEL_TONE: Record<Level, Tone> = { iyi: 'success', dikkat: 'warning', zayif: 'danger', yok: 'neutral' }
export const LEVEL_ICON_NAME: Record<Level, string> = { iyi: 'check-circle', dikkat: 'alert-triangle', zayif: 'x-circle', yok: 'minus' }
export const LEVEL_ICON = { iyi: CheckCircle2, dikkat: AlertTriangle, zayif: XCircle, yok: Minus } as const
export const LEVEL_TEXT_CLASS: Record<Level, string> = { iyi: 'text-positive', dikkat: 'text-warning-ink', zayif: 'text-negative', yok: 'text-ink-soft' }
const LEVEL_WORD: Record<Level, string> = { iyi: 'iyi', dikkat: 'dikkat', zayif: 'zayıf', yok: '—' }

export interface Indicator {
  level: Level
  /** Short word shown next to the value: iyi / dikkat / zayıf / yetersiz veri / — */
  label: string
  /** The measured value, formatted ("85", "%78", "1,1x"), or "—". */
  value: string
}

const make = (level: Level, value: string, label?: string): Indicator => ({ level, value, label: label ?? LEVEL_WORD[level] })
const byThreshold = (x: number): Level => (x >= 80 ? 'iyi' : x >= 60 ? 'dikkat' : 'zayif')
const dec = (x: number) => String(Math.round(x * 10) / 10).replace('.', ',')

/** Assessment percent: >=80 iyi, 60-79 dikkat, <60 zayif. */
export function scoreLevel(percent: number | null | undefined): Indicator {
  if (percent === null || percent === undefined) return make('yok', '—')
  return make(byThreshold(percent), String(Math.round(percent)))
}

export const MIN_FIRST_TRY = 5

/** First-try accuracy over attempts with attempt_no = 1; fewer than 5 -> "yetersiz veri". */
export function accuracyLevel(attempts: readonly { attemptNo: number; correct: boolean }[]): Indicator {
  const first = attempts.filter((a) => a.attemptNo === 1)
  if (first.length < MIN_FIRST_TRY) return make('yok', '—', 'yetersiz veri')
  const pct = (first.filter((a) => a.correct).length / first.length) * 100
  return make(byThreshold(pct), `%${Math.round(pct)}`)
}

export interface TimeIndicator extends Indicator {
  ratio: number | null
  /** Ratio under 0.5: finished much faster than planned. */
  fast: boolean
}

/** active seconds / (estimated minutes * 60): 0.5-1.5 iyi; 1.5-2.5 or 0.3-0.5 dikkat; beyond zayif. */
export function timeLevel(activeSec: number | null | undefined, estMin: number | null | undefined): TimeIndicator {
  if (activeSec === null || activeSec === undefined || !estMin || estMin <= 0) return { ...make('yok', '—'), ratio: null, fast: false }
  const r = activeSec / (estMin * 60)
  const level: Level = r >= 0.5 && r <= 1.5 ? 'iyi' : (r > 1.5 && r <= 2.5) || (r >= 0.3 && r < 0.5) ? 'dikkat' : 'zayif'
  return { ...make(level, `${dec(r)}x`), ratio: r, fast: r < 0.5 }
}

/** Share of attempts that used a hint: <=15% iyi, 16-35 dikkat, >35 zayif. */
export function hintLevel(attempts: readonly { hintUsed: boolean }[]): Indicator {
  if (!attempts.length) return make('yok', '—')
  const pct = Math.round((attempts.filter((a) => a.hintUsed).length / attempts.length) * 100)
  return make(pct <= 15 ? 'iyi' : pct <= 35 ? 'dikkat' : 'zayif', `%${pct}`)
}

export interface AttemptSnapshot {
  percent: number | null
  activeSec: number | null
}
export interface Comparison {
  kind: 'first' | 'same' | 'up' | 'down'
  deltaPercent: number | null
  /** Set only when time changed by more than 20%. */
  timeNote: string | null
  text: string
}

/** Previous attempt of the same lesson vs the last one. |dPuan| < 3 is "aynı". */
export function compareAttempts(prev: AttemptSnapshot | null, last: AttemptSnapshot): Comparison {
  if (!prev) return { kind: 'first', deltaPercent: null, timeNote: null, text: 'İlk deneme' }
  let kind: Comparison['kind'] = 'same'
  let delta: number | null = null
  if (prev.percent !== null && last.percent !== null) {
    delta = Math.round(last.percent - prev.percent)
    kind = Math.abs(last.percent - prev.percent) < 3 ? 'same' : delta > 0 ? 'up' : 'down'
  }
  let timeNote: string | null = null
  if (prev.activeSec && last.activeSec !== null) {
    const change = (last.activeSec - prev.activeSec) / prev.activeSec
    if (Math.abs(change) > 0.2) timeNote = `süre %${Math.round(Math.abs(change) * 100)} ${change > 0 ? 'uzadı' : 'kısaldı'}`
  }
  const head = delta === null ? 'Önceki denemeyle karşılaştırılamadı' : kind === 'same' ? 'Önceki denemeyle aynı' : `Önceki denemeye göre ${kind === 'up' ? '↑' : '↓'}${Math.abs(delta)} puan`
  return { kind, deltaPercent: delta, timeNote, text: timeNote ? `${head} · ${timeNote}` : head }
}

export interface StruggleInput {
  attempts: readonly { section: string; attemptNo: number; correct: boolean }[]
  vocab: readonly { label: string; incorrectCount: number; mastered: boolean }[]
}
export interface Struggles {
  /** Section key with the lowest first-try accuracy, only when under 70%. */
  section: string | null
  sectionPercent: number | null
  /** Up to 3 unlearned words missed at least twice. */
  words: string[]
}

export function struggles(input: StruggleInput): Struggles {
  const bySection = new Map<string, { n: number; ok: number }>()
  for (const a of input.attempts) {
    if (a.attemptNo !== 1) continue
    const s = bySection.get(a.section) ?? { n: 0, ok: 0 }
    s.n++
    if (a.correct) s.ok++
    bySection.set(a.section, s)
  }
  let section: string | null = null
  let worst = 70
  for (const [key, s] of bySection) {
    const p = (s.ok / s.n) * 100
    if (p < worst) {
      worst = p
      section = key
    }
  }
  const words = input.vocab
    .filter((v) => v.incorrectCount >= 2 && !v.mastered)
    .sort((a, b) => b.incorrectCount - a.incorrectCount)
    .slice(0, 3)
    .map((v) => v.label)
  return { section, sectionPercent: section ? Math.round(worst) : null, words }
}

export interface Learned {
  words: string[]
  targets: string[]
  objectives: string[]
}
/** What was learned: mastered words + met speaking targets + the lesson's objectives. */
export function learned(input: { masteredWords: readonly string[]; metTargets: readonly string[]; objectives: readonly string[] }): Learned {
  return { words: [...input.masteredWords], targets: [...input.metTargets], objectives: [...input.objectives] }
}

export interface SentenceInput {
  percent: number | null
  hint: Indicator
  time: TimeIndicator
  comparison: Comparison
  sectionName: string | null
  words: readonly string[]
}

/** First matching rule wins. */
export function teacherSentence(i: SentenceInput): string {
  if (i.percent !== null && i.percent < 60) {
    const focus = [i.sectionName, i.words.length ? i.words.join(', ') : null].filter(Boolean)
    return focus.length === 2
      ? `Dersi tekrar edin; en çok ${focus[0]} ve ${focus[1]} üzerinde durun.`
      : focus.length === 1
        ? `Dersi tekrar edin; en çok ${focus[0]} üzerinde durun.`
        : 'Dersi tekrar edin.'
  }
  if (i.hint.level === 'zayif') return 'İpucuna bağımlı; ipucu olmadan kısa tekrar verin.'
  if (i.time.level === 'zayif' && i.time.fast) return 'Çok hızlı geçti; dikkatle tekrar önerilir.'
  if (i.percent !== null && i.percent >= 80 && (i.comparison.deltaPercent === null || i.comparison.deltaPercent >= 0)) return 'Konu oturdu; sonraki derse geçebilir.'
  return 'Kısa bir tekrar yeterli.'
}

/* ── this week ──────────────────────────────────────────────────────── */

export interface WeekInput {
  sessions: readonly { startedAt: string; activeSeconds: number }[]
  completions: readonly { completedAt: string }[]
  assessments: readonly { submittedAt: string; percent: number }[]
}
export interface WeekSummary {
  level: Level
  label: string
  days: number
  minutes: number
  lessons: number
  avg: number | null
  /** Average minus last week's average; null when either is missing. */
  delta: number | null
  line: string
}

const DAY = 86_400_000
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('sv-SE')

export function weekSummary(data: WeekInput, now: number = Date.now()): WeekSummary {
  const from = now - 7 * DAY
  const prevFrom = now - 14 * DAY
  const inWeek = (iso: string) => Date.parse(iso) > from && Date.parse(iso) <= now
  const sessions = data.sessions.filter((s) => inWeek(s.startedAt))
  const days = new Set(sessions.map((s) => dayKey(s.startedAt))).size
  const minutes = Math.round(sessions.reduce((n, s) => n + s.activeSeconds, 0) / 60)
  const lessons = data.completions.filter((c) => inWeek(c.completedAt)).length
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const avg = mean(data.assessments.filter((a) => inWeek(a.submittedAt)).map((a) => a.percent))
  const prevAvg = mean(data.assessments.filter((a) => Date.parse(a.submittedAt) > prevFrom && Date.parse(a.submittedAt) <= from).map((a) => a.percent))
  const delta = avg !== null && prevAvg !== null ? Math.round(avg - prevAvg) : null
  let level: Level
  let label: string
  if (days === 0) [level, label] = ['zayif', 'Bu hafta çalışmadı']
  else if (days < 3) [level, label] = ['dikkat', 'Düzensiz']
  else if (avg !== null && avg < 70) [level, label] = ['dikkat', 'Puanlar düşük']
  else [level, label] = ['iyi', 'İyi gidiyor']
  const arrow = delta === null ? '' : delta === 0 ? ' (=)' : ` (${delta > 0 ? '↑' : '↓'}${Math.abs(delta)})`
  const line = `${days} gün · ${minutes} dk · ${lessons} ders · Ort. ${avg === null ? '—' : Math.round(avg)}${arrow}`
  return { level, label, days, minutes, lessons, avg, delta, line }
}

/* ── who needs attention ────────────────────────────────────────────── */

export type AttentionKind = 'inactive' | 'low_score' | 'dropping' | 'low_first_try' | 'abandoned'

export const ATTENTION_LABEL: Record<AttentionKind, string> = {
  inactive: '7+ gün çalışmadı',
  low_score: 'Puan düşük',
  dropping: 'Art arda iki düşüş',
  low_first_try: 'İlk deneme doğruluğu düşük',
  abandoned: 'Yarım bırakılan oturum',
}

export interface AttentionInput {
  hasProgram: boolean
  lastActivityAt: string | null
  sessions: readonly { status: string }[]
  /** Any order. */
  assessments: readonly { submittedAt: string; percent: number }[]
  /** Any order. */
  attempts: readonly { attemptNo: number; correct: boolean; at: string }[]
}
export interface AttentionReason {
  kind: AttentionKind
  label: string
}

/** Any one rule is enough. Only students with a program are considered. */
export function attentionReasons(i: AttentionInput, now: number = Date.now()): AttentionReason[] {
  if (!i.hasProgram) return []
  const out: AttentionKind[] = []
  if (!i.lastActivityAt || now - Date.parse(i.lastActivityAt) >= 7 * DAY) out.push('inactive')
  const scores = [...i.assessments].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).map((a) => a.percent)
  const last2 = scores.slice(-2)
  if (last2.length === 2 && (last2[0]! + last2[1]!) / 2 < 60) out.push('low_score')
  const last3 = scores.slice(-3)
  if (last3.length === 3 && last3[1]! - last3[0]! <= -10 && last3[2]! - last3[1]! <= -10) out.push('dropping')
  const recent = [...i.attempts].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20).filter((a) => a.attemptNo === 1)
  if (recent.length >= MIN_FIRST_TRY && recent.filter((a) => a.correct).length / recent.length < 0.6) out.push('low_first_try')
  if (i.sessions.filter((s) => s.status === 'abandoned').length >= 2) out.push('abandoned')
  return out.map((kind) => ({ kind, label: ATTENTION_LABEL[kind] }))
}
