/**
 * Small pure helpers for the practice sections that have no engine of their
 * own (review, explanation checks): attempts per question and a resume
 * snapshot. Grading is `domain/grading` (the server grades again).
 */
import type { Question } from '@/domain/content'
import { gradeResponse } from '@/domain/grading'

export interface Attempt {
  attempts: number
  correct: boolean
}

export interface PracticeState {
  v: 1
  index: number
  answered: Record<string, Attempt>
}

export function restorePractice(snapshot: unknown, ids: readonly string[], length: number): PracticeState {
  const s = snapshot as Partial<PracticeState> | null | undefined
  const answered: Record<string, Attempt> = {}
  if (s && typeof s === 'object' && s.answered && typeof s.answered === 'object') {
    for (const id of ids) {
      const a = s.answered[id]
      if (a && Number.isInteger(a.attempts) && a.attempts >= 0 && typeof a.correct === 'boolean') answered[id] = { attempts: a.attempts, correct: a.correct }
    }
  }
  const index = typeof s?.index === 'number' && Number.isInteger(s.index) && s.index >= 0 && s.index < Math.max(1, length) ? s.index : 0
  return { v: 1, index, answered }
}

/** Grade and count one attempt. */
export function attempt(state: PracticeState, q: Question, response: unknown): { correct: boolean; attemptNo: number } {
  const correct = gradeResponse(q, response)
  const prev = state.answered[q.id] ?? { attempts: 0, correct: false }
  const next = { attempts: prev.attempts + 1, correct: prev.correct || correct }
  state.answered = { ...state.answered, [q.id]: next }
  return { correct, attemptNo: next.attempts }
}

export const allAttempted = (state: PracticeState, ids: readonly string[]) => ids.every((id) => (state.answered[id]?.attempts ?? 0) > 0)

/** `**bold**` → segments; the only markup explanation bodies may carry. */
export function boldSegments(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((t) => (t.startsWith('**') && t.endsWith('**') && t.length > 4 ? { text: t.slice(2, -2), bold: true } : { text: t, bold: false }))
}
