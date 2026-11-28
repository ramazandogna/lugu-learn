/**
 * Time bank for `time-escape` ("Lavdan kaç"): a record run. 10 s bank, a shrinking bonus per right answer
 * (3 s down to 1.5 s, cap 10 s) and a clock that drains faster with every answer; up to 10 runs a day, no
 * penalty when time runs out. Easy mode keeps the old calm round (no drain, ends at 60-90 s). DOM-free.
 */
import { reactive, readonly } from 'vue'

import { dayKey, safeStorage, type KV } from './storage'

export const TIME_BANK = { bank: 10, perCorrect: 3, cap: 10, roundSeconds: 75, dailyRounds: 10 } as const

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

/*
 * Tuned (simulated) so a player answering every ~3 s lasts ~22 answers / ~70 s, a quick one (~2 s)
 * ~39 answers / ~80 s, a slow one (~4 s) ~13 answers / ~55 s: every answer makes the next one harder.
 */
/** Seconds of clock lost per real second: 0.6x at the start, +0.02x per right answer, +0.2x per minute played. */
export const drainRate = (corrects: number, elapsedMs: number): number => 0.6 + corrects * 0.02 + elapsedMs / 300_000
/** Seconds won for the n-th right answer: 3 s, shrinking by 0.02 s per answer, never below 1.5 s. */
export const bonusFor = (n: number): number => Math.max(1.5, TIME_BANK.perCorrect - (n - 1) * 0.02)

/** Best record-run score (right answers), kept on this device. */
export function createRecord(kv: KV = safeStorage(), key = 'lugu.timeEscape.best') {
  const read = () => Number(kv.getItem(key) ?? 0) || 0
  return {
    best: read,
    /** Stores `score` when it beats the record; returns true on a new record. */
    submit(score: number): boolean {
      if (score <= read()) return false
      kv.setItem(key, String(score))
      return true
    },
  }
}

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
    /**
     * Advance time. Normal mode is a record run: no round end, the clock drains faster with every right
     * answer and with time played (`drainRate`), so an average player is pushed out in about 1-2 minutes. Easy mode: the bank never drains, the round ends at `roundMs`.
     */
    tick(dtMs: number) {
      if (state.status !== 'run' || dtMs <= 0) return
      state.elapsedMs += dtMs
      if (!state.easy) state.seconds = Math.max(0, state.seconds - (dtMs / 1000) * drainRate(state.corrects, state.elapsedMs))
      refresh()
      if (state.easy && state.elapsedMs >= roundMs) state.status = 'end-win'
      else if (state.seconds <= 0) state.status = 'end-time'
    },
    /** Correct answer: a shrinking bonus (`bonusFor`), capped at 10 s. */
    correct() {
      if (state.status !== 'run') return
      state.corrects++
      state.seconds = Math.min(TIME_BANK.cap, state.seconds + bonusFor(state.corrects))
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
