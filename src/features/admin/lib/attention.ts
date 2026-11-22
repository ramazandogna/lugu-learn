import { classifySignals, type AttemptRow, type SessionRow, type VocabRow } from '@/domain/analytics'
import type { AccountStatus } from '@/lib/database.types'

export interface AttentionInput {
  status: AccountStatus
  hasActiveProgram: boolean
  lastActivityAt: string | null
  sessions: readonly (SessionRow & { kind: 'primary' | 'replay' })[]
  attempts: readonly AttemptRow[]
  vocab: readonly VocabRow[]
  latestAssessmentPercent: number | null
}

export type AttentionKind = 'inactive' | 'never_started' | 'repeated_abandonment' | 'fast_inaccurate' | 'repeated_errors' | 'low_assessment'

export interface AttentionReason {
  kind: AttentionKind
  text: string
}

export const INACTIVE_DAYS = 7
export const LOW_ASSESSMENT_PERCENT = 60

const SIGNAL_KINDS = new Set<string>(['repeated_abandonment', 'fast_inaccurate', 'repeated_errors'])

/**
 * Why a student may need the teacher's attention. Only active students with an
 * active program are considered; patterns come from `classifySignals`, so the
 * same sample-size rules apply and the sentences stay observations.
 */
export function attentionReasons(input: AttentionInput, now: number = Date.now()): AttentionReason[] {
  if (input.status !== 'active' || !input.hasActiveProgram) return []
  const out: AttentionReason[] = []
  if (!input.lastActivityAt) out.push({ kind: 'never_started', text: 'Programı atanmış ama henüz hiç oturum açmadı.' })
  else {
    const days = Math.floor((now - Date.parse(input.lastActivityAt)) / 86_400_000)
    if (days >= INACTIVE_DAYS) out.push({ kind: 'inactive', text: `${days} gündür etkinlik yok.` })
  }
  const signals = classifySignals({
    attempts: input.attempts,
    vocab: input.vocab,
    sessions: input.sessions.filter((s) => s.kind === 'primary'),
  })
  for (const s of signals) if (SIGNAL_KINDS.has(s.kind)) out.push({ kind: s.kind as AttentionKind, text: s.text })
  if (input.latestAssessmentPercent !== null && input.latestAssessmentPercent < LOW_ASSESSMENT_PERCENT)
    out.push({ kind: 'low_assessment', text: `Son değerlendirme puanı %${Math.round(input.latestAssessmentPercent)}.` })
  return out
}
