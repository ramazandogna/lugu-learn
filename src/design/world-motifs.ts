/**
 * The scenery behind each character's world, drawn in theme colours at low
 * strength so text laid over it keeps its contrast (ink stays ≥ 10:1 over
 * every motif). Three pieces: a corner ornament (160×160, top end), a ground
 * band (400×100, bottom, stretched — so only hills, never circles) and a low
 * ornament (160×100, bottom start, never stretched). Fills are CSS colours so dark mode and the active
 * character theme flow through.
 */
import type { Motif } from './characters'
import { circle, ellipse, sparkle, star } from './mascots/geometry'

export interface MotifShape {
  d: string
  fill: string
  opacity?: number
  /** Drifts slowly when the background is animated. */
  drift?: boolean
}

const P = 'var(--color-primary)'
const A = 'var(--color-accent)'
const S = 'var(--color-star)'
const W = 'var(--color-surface)'

function flower(cx: number, cy: number, r: number): string {
  let d = ''
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    d += circle(cx + r * Math.cos(a), cy + r * Math.sin(a), r * 0.9)
  }
  return d
}

function rays(cx: number, cy: number, r0: number, r1: number, count: number): string {
  let d = ''
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2
    const b = a + 0.12
    const p = (t: number, r: number) => `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`
    d += `M${p(a, r0)}L${p(a + 0.06, r1)}L${p(b, r0)}Z`
  }
  return d
}

const cloud = (x: number, y: number, s: number) =>
  ellipse(x, y, 22 * s, 9 * s) + circle(x - 8 * s, y - 6 * s, 9 * s) + circle(x + 6 * s, y - 9 * s, 11 * s)

export const MOTIFS: Record<Motif, { corner: MotifShape[]; ground: MotifShape[]; low: MotifShape[] }> = {
  ocean: {
    corner: [
      { d: circle(118, 46, 30), fill: A, opacity: 0.22 },
      { d: circle(60, 30, 6), fill: P, opacity: 0.18, drift: true },
      { d: circle(84, 70, 4), fill: P, opacity: 0.2, drift: true },
      { d: circle(40, 62, 3), fill: P, opacity: 0.2 },
      { d: cloud(110, 110, 0.9), fill: W, opacity: 0.8, drift: true },
    ],
    ground: [
      { d: 'M0 52C40 38 80 66 130 52C180 38 220 64 270 52C320 40 360 60 400 50V100H0Z', fill: A, opacity: 0.3 },
      { d: 'M0 70C50 58 90 82 140 70C190 58 240 82 290 70C340 60 370 76 400 70V100H0Z', fill: P, opacity: 0.16 },
    ],
    low: [{ d: circle(30, 50, 4) + circle(44, 36, 2.5) + circle(22, 28, 2), fill: P, opacity: 0.22, drift: true }],
  },
  blossom: {
    corner: [
      { d: flower(116, 44, 10), fill: A, opacity: 0.35 },
      { d: circle(116, 44, 5), fill: S, opacity: 0.5 },
      { d: flower(70, 24, 6), fill: P, opacity: 0.18, drift: true },
      { d: flower(140, 100, 7), fill: P, opacity: 0.16 },
      { d: sparkle(56, 70, 6), fill: S, opacity: 0.6 },
    ],
    ground: [
      { d: 'M0 60C60 40 120 70 200 58C280 46 340 66 400 56V100H0Z', fill: A, opacity: 0.26 },
    ],
    low: [{ d: flower(30, 70, 7) + flower(70, 82, 5) + flower(118, 74, 6), fill: P, opacity: 0.22 }],
  },
  sunshine: {
    corner: [
      { d: rays(112, 48, 30, 52, 14), fill: S, opacity: 0.4 },
      { d: circle(112, 48, 24), fill: S, opacity: 0.55 },
      { d: cloud(64, 84, 0.8), fill: W, opacity: 0.85, drift: true },
    ],
    ground: [
      { d: 'M0 62C70 30 150 60 220 50C300 38 350 58 400 48V100H0Z', fill: A, opacity: 0.32 },
      { d: 'M0 78C90 60 170 86 260 74C330 66 370 78 400 74V100H0Z', fill: P, opacity: 0.14 },
    ],
    low: [{ d: sparkle(36, 40, 6) + sparkle(70, 58, 4), fill: S, opacity: 0.6 }],
  },
  dream: {
    corner: [
      { d: 'M128 22C110 22 96 36 96 54C96 72 110 86 128 86C116 80 108 68 108 54C108 40 116 28 128 22Z', fill: S, opacity: 0.55 },
      { d: star(70, 30, 6), fill: S, opacity: 0.55 },
      { d: sparkle(52, 64, 5), fill: P, opacity: 0.28, drift: true },
      { d: sparkle(142, 108, 4), fill: P, opacity: 0.3 },
      { d: circle(84, 98, 2), fill: S, opacity: 0.7 },
    ],
    ground: [
      { d: 'M0 80C80 70 160 88 240 80C310 74 360 84 400 80V100H0Z', fill: A, opacity: 0.22 },
    ],
    low: [{ d: cloud(50, 70, 1.2) + cloud(122, 80, 0.9), fill: W, opacity: 0.75, drift: true }],
  },
  courage: {
    corner: [
      { d: circle(116, 46, 22), fill: S, opacity: 0.45 },
      { d: sparkle(60, 30, 5), fill: A, opacity: 0.5 },
      { d: cloud(70, 76, 0.7), fill: W, opacity: 0.85, drift: true },
    ],
    ground: [
      { d: 'M0 100L70 40L110 70L170 18L230 72L270 46L330 84L370 58L400 76V100Z', fill: P, opacity: 0.14 },
      { d: 'M0 82C80 70 150 92 230 82C300 74 360 88 400 82V100H0Z', fill: A, opacity: 0.28 },
    ],
    low: [{ d: 'M40 70L40 30M40 30L66 38L40 46Z', fill: A, opacity: 0.55 }, { d: 'M38 70L38 30L42 30L42 70Z', fill: P, opacity: 0.35 }],
  },
}
