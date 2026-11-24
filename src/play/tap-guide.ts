/**
 * `tap-guide` logic: "Bana tıkla" hint guides and the tap / don't-tap round.
 * No score penalty anywhere; wrong taps only produce a short, kind feedback.
 */
import { reactive, readonly } from 'vue'

import type { TapGuideSlots } from '@/domain/content'

export const HINT_WAIT_MS = 8000
export const PULSE_PERIOD_MS = 1200
export const PULSE_CYCLES = 3
export const MAX_HINTS_PER_LESSON = 3
export const WRONG_ANIM_LIMIT = 3

/** Sign pulses 3 cycles (1.2 s each), then rests in a dim "still here" state. */
export const pulsePhase = (shownMs: number): 'pulsing' | 'resting' => (shownMs < PULSE_PERIOD_MS * PULSE_CYCLES ? 'pulsing' : 'resting')

/** Per-lesson hint allowance, shared by all guides of the lesson. */
export function createHintBudget(total: number = MAX_HINTS_PER_LESSON) {
  const s = reactive({ total, used: 0 })
  return {
    state: readonly(s),
    left: () => Math.max(0, s.total - s.used),
    spend(): boolean {
      if (s.used >= s.total) return false
      s.used++
      return true
    },
  }
}
export type HintBudget = ReturnType<typeof createHintBudget>

export type GuideStage = 'idle' | 'hint-offered' | 'fine' | 'big' | 'resolved'

/** One guide: idle -> (8 s) hint-offered -> fine -> big -> resolved. Offering is free; opening `fine` spends one hint. */
export function createGuide(budget: HintBudget, waitMs = HINT_WAIT_MS) {
  const s = reactive({ stage: 'idle' as GuideStage, idleMs: 0, usedHint: false })
  return {
    state: readonly(s),
    /** Call from a timer. Offer appears only after `waitMs` without interaction. */
    tick(dtMs: number) {
      if (s.stage !== 'idle') return
      s.idleMs += dtMs
      if (s.idleMs >= waitMs) s.stage = 'hint-offered'
    },
    /** Learner asked for a hint. Returns false when the lesson allowance is empty. */
    askHint(): boolean {
      if (s.stage === 'hint-offered' || s.stage === 'idle') {
        if (!budget.spend()) return false
        s.stage = 'fine'
        s.usedHint = true
        return true
      }
      if (s.stage === 'fine') {
        s.stage = 'big'
        return true
      }
      return s.stage === 'big'
    },
    touch() {
      if (s.stage === 'idle') s.idleMs = 0
    },
    /** Solved. Small star only without any hint. */
    resolve(): { star: boolean } {
      s.stage = 'resolved'
      return { star: !s.usedHint }
    },
  }
}
export type Guide = ReturnType<typeof createGuide>

type GoNoGo = NonNullable<TapGuideSlots['goNoGo']>
type GoItem = GoNoGo['warmup'][number]

export type GoPhase = 'warmup' | 'round' | 'done'
export type GoFeedback =
  | { kind: 'good'; item: GoItem }
  | { kind: 'wrong-tap'; item: GoItem; why: string; anim: boolean }
  | { kind: 'missed'; item: GoItem; why: string }
  | { kind: 'ok-skip'; item: GoItem }

/**
 * Tap / don't-tap round. Warm-up is untimed (UI never calls `pass()` there). `tap()` = learner tapped the
 * current item; `pass()` = item left the belt untouched. `feedback` is kind, never scored negatively.
 */
export function createGoNoGo(slots: GoNoGo) {
  const s = reactive({
    phase: 'warmup' as GoPhase,
    index: 0,
    correct: 0,
    wrongTaps: 0,
    missed: 0,
    roundCorrect: 0,
    feedback: null as GoFeedback | null,
  })
  const list = () => (s.phase === 'warmup' ? slots.warmup : slots.round)
  const current = (): GoItem | undefined => (s.phase === 'done' ? undefined : list()[s.index])
  const advance = () => {
    s.index++
    if (s.index >= list().length) {
      if (s.phase === 'warmup') {
        s.phase = 'round'
        s.index = 0
      } else s.phase = 'done'
    }
  }
  const settle = (tapped: boolean) => {
    const item = current()
    if (!item) return
    if (tapped === item.tap) {
      s.feedback = tapped ? { kind: 'good', item } : { kind: 'ok-skip', item }
      s.correct++
      if (s.phase === 'round') s.roundCorrect++
    } else if (tapped) {
      s.wrongTaps++
      s.feedback = { kind: 'wrong-tap', item, why: item.why, anim: s.wrongTaps <= WRONG_ANIM_LIMIT }
    } else {
      s.missed++
      s.feedback = { kind: 'missed', item, why: item.why }
    }
    advance()
  }
  return {
    state: readonly(s),
    current,
    tap: () => settle(true),
    pass: () => settle(false),
    /** "yeni öğrenilen: n" for the summary. */
    summary: () => ({ learned: s.roundCorrect, total: slots.round.length, wrongTaps: s.wrongTaps, missed: s.missed }),
  }
}
export type GoNoGoRound = ReturnType<typeof createGoNoGo>

/** Does a free-text item match `tapIf` (e.g. `he|she|it`)? Case-insensitive whole-token match. */
export const matchesRule = (text: string, tapIf: string): boolean =>
  tapIf.split('|').some((t) => t.trim().toLowerCase() === text.trim().toLowerCase())
