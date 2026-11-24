/**
 * In-quiz run streak ("Karamel Akışı"). Not the daily streak.
 * Wrong answer: shield absorbs it, else the streak halves (never resets to 0 by itself).
 * Multiplier caps at x3 (x2 at 5, x3 at 10). Shield returns on every 5th correct in a row.
 */
import { reactive, readonly } from 'vue'

export const MULTIPLIER_CAP = 3
export const SHIELD_EVERY = 5

export const multiplierFor = (streak: number): 1 | 2 | 3 => (streak >= 10 ? 3 : streak >= 5 ? 2 : 1)

export type StreakEvent = 'up' | 'milestone' | 'shield-used' | 'halved' | 'none'

export interface RunStreakState {
  streak: number
  best: number
  multiplier: 1 | 2 | 3
  shield: boolean
}

export function createRunStreak(opts: { shield?: boolean } = {}) {
  const useShield = opts.shield ?? false
  const state = reactive<RunStreakState>({ streak: 0, best: 0, multiplier: 1, shield: useShield })
  const sync = () => {
    state.multiplier = multiplierFor(state.streak)
    if (state.streak > state.best) state.best = state.streak
  }
  return {
    state: readonly(state) as Readonly<RunStreakState>,
    correct(): StreakEvent {
      state.streak++
      sync()
      if (useShield && state.streak % SHIELD_EVERY === 0) {
        state.shield = true
        return 'milestone'
      }
      return state.streak % SHIELD_EVERY === 0 ? 'milestone' : 'up'
    },
    wrong(): StreakEvent {
      if (state.shield) {
        state.shield = false
        return 'shield-used'
      }
      if (state.streak === 0) return 'none'
      state.streak = Math.floor(state.streak / 2)
      sync()
      return 'halved'
    },
    reset() {
      state.streak = 0
      state.best = 0
      state.multiplier = 1
      state.shield = useShield
    },
  }
}
export type RunStreak = ReturnType<typeof createRunStreak>
