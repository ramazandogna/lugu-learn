/*
 * Lugu sound: Web Audio synthesis, no files (design-bible E). One AudioContext,
 * created and resumed only after a user gesture. Quiet by default, one switch
 * mutes it, the choice lives in localStorage. Sound never carries information
 * alone, and prefers-reduced-motion does not silence it (separate axis).
 */
import { ref, readonly } from 'vue'

export type SoundName =
  | 'tik'
  | 'muhur'
  | 'dogru'
  | 'yanlis-yumusak'
  | 'pop'
  | 'whoosh'
  | 'kutlama-kucuk'
  | 'kutlama-buyuk'
  | 'seri-pof'
  | 'piko'
  | 'lav-tik'
  | 'hover-basis'

const KEY = 'lugu.sound.muted'
const MASTER = 0.5
/** Default is quiet: sfx channel below full, music off. */
const SFX_LEVEL = 0.6

function readMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

const mutedRef = ref(readMuted())
export const soundMuted = readonly(mutedRef)

let ctx: AudioContext | undefined
let master: GainNode | undefined
let sfx: GainNode | undefined
/** Opt-in extras, off by default. */
const optional = { 'lav-tik': false, 'hover-basis': false }

export function setSoundMuted(m: boolean) {
  mutedRef.value = m
  try {
    localStorage.setItem(KEY, m ? '1' : '0')
  } catch {
    /* storage blocked: the switch still works for this visit */
  }
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : MASTER, ctx.currentTime, 0.01)
}

export function toggleSoundMuted() {
  setSoundMuted(!mutedRef.value)
}

export function enableOptionalSound(name: 'lav-tik' | 'hover-basis', on: boolean) {
  optional[name] = on
}

/** A real tap/key has happened: the only time an AudioContext may be opened. */
let unlocked = false
function userHasActed(): boolean {
  return unlocked || (typeof navigator !== 'undefined' && !!navigator.userActivation?.hasBeenActive)
}

function ensure(): AudioContext | undefined {
  if (ctx) return ctx
  if (typeof window === 'undefined' || !userHasActed()) return undefined
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return undefined
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = mutedRef.value ? 0 : MASTER
  sfx = ctx.createGain()
  sfx.gain.value = SFX_LEVEL
  sfx.connect(master)
  master.connect(ctx.destination)
  return ctx
}

/** Call from the first real tap/key; before that no AudioContext exists. */
let armed = false
export function armSound() {
  if (armed || typeof window === 'undefined') return
  armed = true
  const unlock = () => {
    unlocked = true
    const c = ensure()
    if (c?.state === 'suspended') void c.resume()
    for (const e of ['pointerdown', 'keydown', 'touchend'] as const) window.removeEventListener(e, unlock)
  }
  for (const e of ['pointerdown', 'keydown', 'touchend'] as const) window.addEventListener(e, unlock, { passive: true })
}

/** One envelope-shaped oscillator note; ends with an exponential ramp (no clicks). */
function tone(c: AudioContext, o: {
  type: OscillatorType
  f0: number
  f1?: number
  at: number
  dur: number
  gain: number
  filter?: { type: BiquadFilterType; freq: number }
  vibrato?: number
}) {
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type
  osc.frequency.setValueAtTime(o.f0, o.at)
  if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, o.at + o.dur)
  g.gain.setValueAtTime(o.gain, o.at)
  g.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur)
  let node: AudioNode = osc
  if (o.filter) {
    const f = c.createBiquadFilter()
    f.type = o.filter.type
    f.frequency.value = o.filter.freq
    node.connect(f)
    node = f
  }
  node.connect(g)
  g.connect(sfx!)
  if (o.vibrato) {
    const lfo = c.createOscillator()
    const lg = c.createGain()
    lfo.frequency.value = o.vibrato
    lg.gain.value = 8
    lfo.connect(lg)
    lg.connect(osc.frequency)
    lfo.start(o.at)
    lfo.stop(o.at + o.dur + 0.02)
  }
  osc.start(o.at)
  osc.stop(o.at + o.dur + 0.02)
}

function noise(c: AudioContext, o: { at: number; dur: number; gain: number; filter: BiquadFilterType; f0: number; f1?: number }) {
  const len = Math.max(1, Math.floor(c.sampleRate * o.dur))
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = o.filter
  f.frequency.setValueAtTime(o.f0, o.at)
  if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, o.at + o.dur)
  const g = c.createGain()
  g.gain.setValueAtTime(o.gain, o.at)
  g.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur)
  src.connect(f)
  f.connect(g)
  g.connect(sfx!)
  src.start(o.at)
  src.stop(o.at + o.dur + 0.02)
}

const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5 }

const RECIPES: Record<SoundName, (c: AudioContext, t: number) => void> = {
  tik: (c, t) => tone(c, { type: 'square', f0: 880, f1: 440, at: t, dur: 0.06, gain: 0.15 }),
  muhur: (c, t) => {
    tone(c, { type: 'sine', f0: 140, f1: 70, at: t, dur: 0.12, gain: 0.2 })
    noise(c, { at: t, dur: 0.04, gain: 0.2, filter: 'lowpass', f0: 1200 })
  },
  dogru: (c, t) => [523, 659, 784].forEach((f, i) => tone(c, { type: 'triangle', f0: f, at: t + i * 0.07, dur: 0.07, gain: 0.12 })),
  'yanlis-yumusak': (c, t) => tone(c, { type: 'sine', f0: 330, f1: 262, at: t, dur: 0.2, gain: 0.1, filter: { type: 'lowpass', freq: 900 } }),
  pop: (c, t) => tone(c, { type: 'sine', f0: 600, f1: 1200, at: t, dur: 0.08, gain: 0.15 }),
  whoosh: (c, t) => noise(c, { at: t, dur: 0.2, gain: 0.1, filter: 'bandpass', f0: 400, f1: 2000 }),
  'kutlama-kucuk': (c, t) =>
    [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5].forEach((f, i) => tone(c, { type: 'triangle', f0: f, at: t + i * 0.06, dur: 0.06, gain: 0.12 })),
  'kutlama-buyuk': (c, t) => {
    ;[NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => {
      tone(c, { type: 'sine', f0: f, at: t + i * 0.12, dur: 0.14, gain: 0.12 })
      tone(c, { type: 'triangle', f0: f, at: t + i * 0.12, dur: 0.14, gain: 0.08 })
    })
    noise(c, { at: t + 0.48, dur: 0.08, gain: 0.06, filter: 'highpass', f0: 6000 })
  },
  'seri-pof': (c, t) => tone(c, { type: 'sine', f0: 300, f1: 150, at: t, dur: 0.12, gain: 0.08, filter: { type: 'lowpass', freq: 600 } }),
  piko: (c, t) => tone(c, { type: 'sine', f0: 392, f1: 330, at: t, dur: 0.18, gain: 0.1, vibrato: 6 }),
  'lav-tik': (c, t) => tone(c, { type: 'square', f0: 220, at: t, dur: 0.03, gain: 0.05 }),
  'hover-basis': (c, t) => tone(c, { type: 'sine', f0: 1000, at: t, dur: 0.02, gain: 0.06 }),
}

/** Play one effect. No-op when muted, before the first gesture, or without Web Audio. */
export function playSound(name: SoundName) {
  if (mutedRef.value) return
  if (name in optional && !optional[name as keyof typeof optional]) return
  const c = ctx ?? ensure()
  if (!c || !sfx) return
  if (c.state === 'suspended') void c.resume()
  try {
    RECIPES[name](c, c.currentTime + 0.005)
  } catch {
    /* a failed sound is never an error for the learner */
  }
}
