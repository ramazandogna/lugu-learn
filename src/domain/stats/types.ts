/**
 * Girdi tipleri (spec 11.1). Tüm tarihler string: IsoTs (ISO zaman) veya DayKey
 * (Europe/Istanbul yerel gün, YYYY-MM-DD). Bu dosyada değer yok, yalnız tipler.
 */
import type { StatId } from './registry.ts'

export type IsoTs = string
export type DayKey = string

export interface ExamRow {
  examId: string
  date: DayKey
  kind: 'school' | 'mock' | 'lgs' | 'other'
  createdAt: IsoTs
}

export interface ExamResultRow {
  examId: string
  subjectId: string
  total: number | null
  correct: number
  incorrect: number
  blank: number
  net: number
}

export interface ExamTopicRow {
  /** examId:subjectId */
  resultKey: string
  subjectId: string
  topic: string
  correct: number
  incorrect: number
  blank: number
}

export interface SubjectRow {
  id: string
  name: string
  sort: number
  active: boolean
}

export type Section = 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'

export interface LessonRow {
  id: string
  sequence: number
  title: string
  status: 'draft' | 'ready' | 'archived'
  versionId: string
}

export interface SessionRow {
  id: string
  assignmentId: string
  lessonId: string
  kind: 'primary' | 'replay'
  status: 'active' | 'completed' | 'abandoned'
  activeSeconds: number
  idleSeconds: number
  breakSeconds: number
  startedAt: IsoTs
  lastSeenAt: IsoTs
  completedAt: IsoTs | null
}

export interface SectionProgressRow {
  sessionId: string
  section: Section
  status: 'not_started' | 'in_progress' | 'completed'
  attemptsCount: number
  correctCount: number
  activeSeconds: number
}

export interface AttemptRow {
  sessionId: string
  section: Exclude<Section, 'vocabulary'>
  questionId: string
  attemptNo: number
  correct: boolean
  responseMs: number | null
  hintUsed: boolean
  at: IsoTs
}

export interface SessionEventRow {
  sessionId: string
  at: IsoTs
  kind:
    | 'visibility_hidden'
    | 'visibility_visible'
    | 'fullscreen_exit'
    | 'leave_warning'
    | 'interrupted'
    | 'resumed'
    | 'idle_start'
    | 'idle_end'
}

export interface BreakRow {
  sessionId: string
  startedAt: IsoTs
  endedAt: IsoTs | null
  plannedMinutes: number
  earlyReturn: boolean | null
}

export interface VocabRow {
  packageId: string
  itemId: string
  lessonId: string | null
  correctCount: number
  incorrectCount: number
  createdAt: IsoTs
  masteredAt: IsoTs | null
  lastAttemptAt: IsoTs | null
}

export interface AssessmentRow {
  sessionId: string
  lessonId: string
  percent: number
  submittedAt: IsoTs
}

export interface CompletionRow {
  lessonId: string
  sessionId: string
  completedAt: IsoTs
}

export interface AssignmentRow {
  id: string
  versionId: string
  status: 'active' | 'paused' | 'archived' | 'completed'
  createdAt: IsoTs
}

export interface ProgramEventRow {
  assignmentId: string
  kind: string
  createdAt: IsoTs
}

export interface RewardRow {
  amount: number
  reason: string
  createdAt: IsoTs
}

export interface SpeakingRow {
  id: string
  lessonId: string | null
  status: 'planned' | 'started' | 'ended' | 'cancelled'
  plannedAt: IsoTs | null
  startedAt: IsoTs | null
  endedAt: IsoTs | null
}

export interface SpeakingNoteRow {
  speakingSessionId: string
  followUp: string | null
}

export interface TaskRow {
  id: string
  subjectId: string | null
  lessonId: string | null
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  dueDate: DayKey | null
  createdAt: IsoTs
  completedAt: IsoTs | null
}

/** Bir öğrencinin tüm ham verisi. Alanlar boş dizi olabilir; fonksiyon boş diziyi null/0 olarak ele alır. */
export interface StatsInput {
  exams: ExamRow[]
  results: ExamResultRow[]
  topics: ExamTopicRow[]
  subjects: SubjectRow[]
  lessons: LessonRow[]
  assignments: AssignmentRow[]
  programEvents: ProgramEventRow[]
  sessions: SessionRow[]
  sections: SectionProgressRow[]
  attempts: AttemptRow[]
  events: SessionEventRow[]
  breaks: BreakRow[]
  vocab: VocabRow[]
  assessments: AssessmentRow[]
  completions: CompletionRow[]
  rewards: RewardRow[]
  speaking: SpeakingRow[]
  speakingNotes: SpeakingNoteRow[]
  tasks: TaskRow[]
  /** Ayar academic.wrong_penalty; yalnız net'i yeniden hesaplamak gerekirse (normalde result.net kullan). */
  wrongPenalty?: number
}

export type WindowKind = 'none' | 'lastN' | 'days' | 'range' | 'period'
export type PeriodUnit = 'day' | 'week' | 'month' | 'range'

export interface StatParams {
  /** Zorunlu. Kodda Date.now() yok. */
  now: IsoTs
  /** Tanımsızsa tüm veri (none). */
  window?: WindowKind
  /** lastN (param) için. */
  n?: number
  /** days için. */
  days?: number
  /** range için. */
  from?: DayKey
  to?: DayKey
  periodUnit?: PeriodUnit
  /** N. deneme, 1-tabanlı; tanımsızsa son. */
  nth?: number
  /** ex ailesi; null = toplam. */
  subjectId?: string | null
  /** lesson/mastery/time ailesi; null = hepsi. */
  lessonId?: string | null
  metric?: 'pct' | 'net'
  /** Top-k listeler, varsayılan TOP_K. */
  k?: number
  /** Yalnız pc_generic, pc_z_vs_prev4. */
  statId?: StatId
}

export type NullReason = 'insufficient' | 'no_data' | 'zero_denominator' | 'not_applicable'

export interface StatPoint {
  x: string
  y: number
}

export interface StatBreakdownItem {
  key: string
  label?: string
  value: number | null
  n: number
  extra?: number | null
}

/** Her stat bunu döner (spec 1, "Sonuç sözleşmesi"). */
export interface StatResult {
  value: number | null
  n: number
  /** value null iken zorunlu. */
  reason?: NullReason
  series?: StatPoint[]
  breakdown?: StatBreakdownItem[]
}
