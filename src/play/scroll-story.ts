/** `scroll-story` logic: pinned scene index, advance rule (swipe or correct gate answer), input -> step helper. */
import { reactive, readonly } from 'vue'

export interface StoryStepGate {
  /** Question id that must be answered correctly to pass. Absent = free step. */
  gate?: string | undefined
}

export type StoryPhase = 'step' | 'done'

export function createScrollStory(steps: readonly StoryStepGate[]) {
  const s = reactive({
    index: 0,
    phase: 'step' as StoryPhase,
    solved: [] as number[],
    gateWrong: {} as Record<number, number>,
  })
  const last = () => steps.length - 1
  const gateOpen = (i: number) => !steps[i]?.gate || s.solved.includes(i)
  const api = {
    state: readonly(s),
    /** Every step is visited at the learner's own pace; no auto-advance. */
    canAdvance: () => s.phase === 'step' && gateOpen(s.index),
    next(): boolean {
      if (!api.canAdvance()) return false
      if (s.index >= last()) {
        s.phase = 'done'
        return true
      }
      s.index++
      return true
    },
    prev(): boolean {
      if (s.phase === 'done') {
        s.phase = 'step'
        return true
      }
      if (s.index === 0) return false
      s.index--
      return true
    },
    /** Gate answered. Right opens the step. 3rd wrong explains and lets it pass (progress never locks). */
    answerGate(correct: boolean): 'open' | 'retry' | 'hint' | 'explain-and-pass' {
      const i = s.index
      if (correct) {
        if (!s.solved.includes(i)) s.solved.push(i)
        return 'open'
      }
      const n = (s.gateWrong[i] = (s.gateWrong[i] ?? 0) + 1)
      if (n >= 3) {
        if (!s.solved.includes(i)) s.solved.push(i)
        return 'explain-and-pass'
      }
      return n === 2 ? 'hint' : 'retry'
    },
    progress: () => (steps.length === 0 ? 1 : (s.phase === 'done' ? steps.length : s.index) / steps.length),
  }
  return api
}
export type ScrollStory = ReturnType<typeof createScrollStory>

export type StepDir = 'next' | 'prev'

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'])
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])

/**
 * Turns keyboard / wheel / touch / tap input into discrete steps, with a debounce so one trackpad
 * flick or held key moves exactly one step. Pure: pass `now` in tests.
 */
export function createStepInput(onStep: (dir: StepDir) => void, opts: { debounceMs?: number; wheelThreshold?: number; swipePx?: number; now?: () => number } = {}) {
  const debounceMs = opts.debounceMs ?? 350
  const wheelThreshold = opts.wheelThreshold ?? 30
  const swipePx = opts.swipePx ?? 40
  const now = opts.now ?? (() => Date.now())
  let lastAt = -Infinity
  let touch: { x: number; y: number } | null = null
  const fire = (dir: StepDir) => {
    const t = now()
    if (t - lastAt < debounceMs) return false
    lastAt = t
    onStep(dir)
    return true
  }
  return {
    /** Returns true when the key was a step key (caller may preventDefault). */
    key(key: string): boolean {
      const dir: StepDir | null = NEXT_KEYS.has(key) ? 'next' : PREV_KEYS.has(key) ? 'prev' : null
      if (!dir) return false
      fire(dir)
      return true
    },
    wheel(deltaY: number): boolean {
      if (Math.abs(deltaY) < wheelThreshold) return false
      return fire(deltaY > 0 ? 'next' : 'prev')
    },
    touchStart(x: number, y: number) {
      touch = { x, y }
    },
    touchEnd(x: number, y: number): boolean {
      if (!touch) return false
      const dx = x - touch.x
      const dy = y - touch.y
      touch = null
      const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx
      if (Math.abs(d) < swipePx) return false
      return fire(d < 0 ? 'next' : 'prev')
    },
    /** Plain tap / forward button. */
    tap: () => fire('next'),
  }
}
export type StepInput = ReturnType<typeof createStepInput>
