import { circle, ellipse, mirror, star } from './geometry'
import type { MascotPalette, MascotRig } from './types'

/** Sasha — a round blossom creature with two tall petal ears, a star-tipped tail and a tiny mic. */
export const sashaPalette: MascotPalette = {
  body: '#f47eb6',
  shade: '#d9579a',
  light: '#ffd6ea',
  accent: '#ffd25e',
  gear: '#5a2350',
  cheek: '#ff5f8f',
  ink: '#3a1838',
  white: '#ffffff',
}

/** A five-petal blossom, Sasha's hair clip. */
function flower(cx: number, cy: number): string {
  let d = ''
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    d += circle(cx + 3.6 * Math.cos(a), cy + 3.6 * Math.sin(a), 3.2)
  }
  return d
}

const ear = 'M50 46C37 32 33 14 41 8C52 9 57 27 57 44Z'
const innerEar = 'M50 40C42 30 40 19 43 14C49 16 52 27 53 38Z'

export const sashaRig: MascotRig = {
  back: [
    { d: ear, fill: 'body', outline: true },
    { d: mirror(ear), fill: 'body', outline: true },
    { d: innerEar, fill: 'light' },
    { d: mirror(innerEar), fill: 'light' },
    { d: 'M86 92C98 94 104 86 101 78', fill: 'none', stroke: 'ink', strokeWidth: 3 },
    { d: star(101, 75, 7.5), fill: 'accent', outline: true },
  ],
  body: [
    { d: 'M60 40C80 40 93 55 93 73C93 92 78 104 60 104C42 104 27 92 27 73C27 55 40 40 60 40Z', fill: 'body', outline: true },
    { d: 'M90 76C89 92 77 101 61 102C75 97 85 89 87 75Z', fill: 'shade' },
    { d: ellipse(60, 90, 17, 10), fill: 'light' },
    { d: ellipse(41, 58, 4, 6.5), fill: 'white', opacity: 0.7 },
    { d: 'M56 44C56 38 64 38 63 44C62 47 58 48 56 44Z', fill: 'shade' },
  ],
  over: [
    { d: flower(70, 44), fill: 'accent' },
    { d: circle(70, 44, 2.2), fill: 'gear' },
  ],
  front: [
    { d: 'M91 66C93 76 86 84 76 85', fill: 'none', stroke: 'gear', strokeWidth: 2.6 },
    { d: circle(74, 85, 3.6), fill: 'gear' },
  ],
  face: { x: 60, y: 70, gap: 20 },
  arms: { left: [31, 82], right: [89, 82] },
}
