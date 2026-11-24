/**
 * `fill-workshop` slot/chip state. Tap chip -> tap slot (drag is just a different way to call `place`).
 * Grading stays with `gradeResponse`; the server score is unchanged.
 */
import { reactive, readonly } from 'vue'

import type { Question } from '@/domain/content'
import { gradeResponse } from '@/domain/grading'

export const SNAP_HIGHLIGHT_PX = 24 // soft highlight only, no magnet
export const RETURN_FADE_MS = 300
export const MAX_BLANKS = 3
export const MAX_POOL_CHIPS = 8

export interface Chip {
  /** Index in the original token/option list: stable even with duplicate texts. */
  id: number
  text: string
}

export type WorkshopPhase = 'idle' | 'placing' | 'placed' | 'correct' | 'retry'

export function createFillWorkshop(question: Question) {
  if (question.type === 'text') throw new Error('fill-workshop: text questions use the text input renderer')
  const texts = question.type === 'order' ? question.tokens : question.options
  const slotCount = question.type === 'order' ? question.answer.length : 1
  const s = reactive({
    chips: texts.map((text, id) => ({ id, text })) as Chip[],
    /** slot index -> chip id (or null) */
    slots: Array.from({ length: slotCount }, () => null as number | null),
    selected: null as number | null,
    phase: 'idle' as WorkshopPhase,
    wrongCount: 0,
    /** Chips that just bounced back (UI fades them for RETURN_FADE_MS). */
    returned: [] as number[],
  })
  const placedIds = () => new Set(s.slots.filter((x): x is number => x !== null))
  const textOf = (id: number) => s.chips.find((c) => c.id === id)?.text ?? ''
  const full = () => s.slots.every((x) => x !== null)

  const api = {
    state: readonly(s),
    pool: (): Chip[] => s.chips.filter((c) => !placedIds().has(c.id)),
    isFull: full,
    select(id: number | null) {
      s.selected = id
      if (id !== null) s.phase = 'placing'
    },
    /** Put chip (selected one by default) into a slot; a filled slot sends its old chip back. */
    place(slot: number, chipId: number | null = s.selected): boolean {
      if (chipId === null || slot < 0 || slot >= s.slots.length || placedIds().has(chipId)) return false
      s.slots[slot] = chipId
      s.selected = null
      s.phase = 'placed'
      return true
    },
    /** Tap a filled slot to take the chip back. */
    remove(slot: number) {
      if (s.slots[slot] !== null) {
        s.slots[slot] = null
        s.phase = 'idle'
      }
    },
    /** Response in the shape `gradeResponse` expects: order -> token texts; choice -> original option index. */
    response(): string[] | number | null {
      if (!full()) return null
      if (question.type === 'order') return s.slots.map((id) => textOf(id as number))
      return s.slots[0] as number
    },
    /** Check the sentence. Wrong: chips return to the pool, one-line reason from `explain`. */
    check(): { correct: boolean; why: string | undefined } {
      const r = api.response()
      if (r === null) return { correct: false, why: undefined }
      const correct = gradeResponse(question, r)
      if (correct) {
        s.phase = 'correct'
        return { correct, why: undefined }
      }
      s.wrongCount++
      s.returned = s.slots.filter((x): x is number => x !== null)
      s.slots.fill(null)
      s.phase = 'retry'
      return { correct, why: question.explain }
    },
  }
  return api
}
export type FillWorkshop = ReturnType<typeof createFillWorkshop>
