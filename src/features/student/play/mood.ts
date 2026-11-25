import { inject, readonly, ref, type InjectionKey } from 'vue'

import type { MascotMood } from '@/design'

/**
 * Piko's reactions during a lesson (wow-pass C4). Templates report what
 * happened (`answered`, `hinted`); the bus decides if Piko shows it: at most
 * one reaction per 4 s, a cheer on one correct answer in three, a "wow" on a
 * run of five, a soft "oops" on a miss (never a shake, never a number).
 * It also counts the lesson's best run of correct answers for the finale.
 */
export type PikoMood = MascotMood

export interface MoodBus {
  mood: Readonly<{ value: PikoMood }>
  /** A question was answered (any template). */
  answered(correct: boolean): void
  /** A hint was opened: Piko points. */
  hinted(): void
  /** The learner is stuck (8 s with no input on an open question) or came back. */
  stuck(on: boolean): void
  /** The learner is on a break. */
  resting(on: boolean): void
  /** Longest run of correct answers so far. */
  best(): number
  /** Correct answers so far. */
  correct(): number
}

const GAP_MS = 4000

export function createMoodBus(now: () => number = Date.now): MoodBus {
  const mood = ref<PikoMood>('idle')
  let lastAt = -Infinity
  let run = 0
  let bestRun = 0
  let right = 0
  let base: PikoMood = 'idle'
  let timer: ReturnType<typeof setTimeout> | undefined

  function show(m: PikoMood, hold: number) {
    clearTimeout(timer)
    lastAt = now()
    mood.value = m
    timer = setTimeout(() => (mood.value = base), hold)
  }
  function setBase(m: PikoMood) {
    base = m
    if (!timer || mood.value === 'idle' || mood.value === 'think' || mood.value === 'sleepy') mood.value = m
  }

  return {
    mood: readonly(mood),
    answered(correct) {
      if (correct) {
        run++
        right++
        bestRun = Math.max(bestRun, run)
      } else run = 0
      if (now() - lastAt < GAP_MS) return
      if (!correct) show('oops-soft', 1400)
      else if (run > 0 && run % 5 === 0) show('wow', 1600)
      else if (right % 3 === 0) show('cheer', 1200)
    },
    hinted() {
      if (now() - lastAt >= GAP_MS) show('point', 1600)
    },
    stuck: (on) => setBase(on ? 'think' : 'idle'),
    resting: (on) => setBase(on ? 'sleepy' : 'idle'),
    best: () => bestRun,
    correct: () => right,
  }
}

export const MOOD_BUS: InjectionKey<MoodBus> = Symbol('lesson-mood')

const silent: MoodBus = {
  mood: { value: 'idle' },
  answered() {},
  hinted() {},
  stuck() {},
  resting() {},
  best: () => 0,
  correct: () => 0,
}

/** The lesson's bus, or a silent one outside a lesson (gallery, tests). */
export const useMoodBus = (): MoodBus => inject(MOOD_BUS, silent)
