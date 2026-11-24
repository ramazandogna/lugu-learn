/**
 * Time bank for `time-escape` ("Lavdan kaç"). Fixed by pedagogy: 10 s bank, +3 s per correct, cap 10 s,
 * round 60-90 s, <= 3 timed rounds a day, no penalty when time runs out. DOM-free: UI drives `tick(dtMs)`.
 */
import { reactive, readonly } from 'vue'

import { dayKey, safeStorage, type KV } from './storage'

export const TIME_BANK = { bank: 10, perCorrect: 3, cap: 10, roundSeconds: 75, comfortShare: 0.6, comfortRate: 0.5, dailyRounds: 3 } as const

/** Tier 10 (calm green) .. 1 (last second, red). 0 s still reads as tier 1. */
export const tierOf = (seconds: number): number => Math.min(10, Math.max(1, Math.ceil(seconds)))
/** Same tier as a 0-9 level (0 = last second). */
export const levelOf = (seconds: number): number => tierOf(seconds) - 1
/** Vignette alpha: tier 10 -> 0, tier 1 -> 0.55 (linear, design-bible H). */
export const vignetteAlpha = (tier: number): number => Math.round(((10 - tier) / 9) * 0.55 * 1000) / 1000
/** Vignette inner radius percent: 55 -> 45. */
export const vignetteRadius = (tier: number): number => 55 - ((10 - tier) / 9) * 10
/** Hue 130 (green) -> 5 (red) for the tier indicator; colour is never the only signal. */
export const tierHue = (tier: number): number => Math.round(5 + ((tier - 1) / 9) * 125)
/** Soft pulse only in the last 3 tiers, <= 1 Hz. */
export const softPulse = (tier: number): boolean => tier <= 3
/** Tint + single 1 Hz pulse on the very last tier. */
export const lastSecond = (seconds: number): boolean => tierOf(seconds) === 1
/** Water level of the caramel river, 0..1. */
export const riverLevel = (seconds: number): number => Math.min(1, Math.max(0, seconds / TIME_BANK.cap))

export type BankStatus = 'ready' | 'run' | 'paused' | 'end-win' | 'end-time'
export interface TimeBankState {
  status: BankStatus
  seconds: number
  tier: number
  easy: boolean
  elapsedMs: number
  corrects: number
  /** What the player sees: whole seconds left. */
  label: string
}

export function createTimeBank(opts: { easy?: boolean; roundSeconds?: number } = {}) {
  const roundMs = Math.min(90, Math.max(60, opts.roundSeconds ?? TIME_BANK.roundSeconds)) * 1000
  const state = reactive<TimeBankState>({
    status: 'ready',
    seconds: TIME_BANK.bank,
    tier: 10,
    easy: opts.easy ?? false,
    elapsedMs: 0,
    corrects: 0,
    label: `${TIME_BANK.bank} sn kaldı`,
  })
  const refresh = () => {
    state.tier = tierOf(state.seconds)
    state.label = `${Math.ceil(state.seconds)} sn kaldı`
  }
  return {
    state: readonly(state) as Readonly<TimeBankState>,
    start() {
      state.status = 'run'
      state.seconds = TIME_BANK.bank
      state.elapsedMs = 0
      state.corrects = 0
      refresh()
    },
    /** Advance time. Easy mode: the bank never drains, the round still ends at `roundMs`. */
    tick(dtMs: number) {
      if (state.status !== 'run' || dtMs <= 0) return
      state.elapsedMs += dtMs
      if (!state.easy) {
        // first 60% of the round drains at a relaxed rate
        const rate = state.elapsedMs < roundMs * TIME_BANK.comfortShare ? TIME_BANK.comfortRate : 1
        state.seconds = Math.max(0, state.seconds - (dtMs / 1000) * rate)
      }
      refresh()
      if (state.elapsedMs >= roundMs) state.status = 'end-win'
      else if (state.seconds <= 0) state.status = 'end-time'
    },
    /** Correct answer: +3 s, capped at 10 s. */
    correct() {
      if (state.status !== 'run') return
      state.corrects++
      state.seconds = Math.min(TIME_BANK.cap, state.seconds + TIME_BANK.perCorrect)
      refresh()
    },
    pause() {
      if (state.status === 'run') state.status = 'paused'
    },
    resume() {
      if (state.status === 'paused') state.status = 'run'
    },
    setEasy(v: boolean) {
      state.easy = v
      if (v) {
        state.seconds = TIME_BANK.bank
        refresh()
      }
    },
  }
}
export type TimeBank = ReturnType<typeof createTimeBank>

/** Daily cap (3 timed rounds) + "2 timeouts in a row -> suggest easy mode". Backed by localStorage, never throws. */
export function createDailyRounds(kv: KV = safeStorage(), today: () => string = dayKey) {
  const K = 'lugu-play:timed-rounds'
  const read = (): { day: string; rounds: number; timeouts: number } => {
    try {
      const v = JSON.parse(kv.getItem(K) ?? 'null') as { day?: string; rounds?: number; timeouts?: number } | null
      if (v && typeof v.rounds === 'number') return { day: v.day ?? today(), rounds: v.rounds, timeouts: v.timeouts ?? 0 }
    } catch {
      /* corrupt: start fresh */
    }
    return { day: today(), rounds: 0, timeouts: 0 }
  }
  const load = () => {
    const v = read()
    // new day: round counter resets; timeout streak survives
    return v.day === today() ? v : { day: today(), rounds: 0, timeouts: v.timeouts }
  }
  const save = (v: { day: string; rounds: number; timeouts: number }) => kv.setItem(K, JSON.stringify(v))
  return {
    roundsToday: () => load().rounds,
    /** 4th round shows the break card instead of starting. */
    canStart: () => load().rounds < TIME_BANK.dailyRounds,
    /** Call when a timed round ends. */
    recordRound(outcome: 'end-win' | 'end-time') {
      const v = load()
      v.rounds++
      v.timeouts = outcome === 'end-time' ? v.timeouts + 1 : 0
      save(v)
    },
    suggestEasy: () => load().timeouts >= 2,
  }
}
export type DailyRounds = ReturnType<typeof createDailyRounds>
