import { circle, ellipse, star } from './geometry'
import type { MascotPalette, MascotRig } from './types'

/** Momo — a sun-gold round explorer under a wide-brimmed hat, with a satchel strap. */
export const momoPalette: MascotPalette = {
  body: '#f6c431',
  shade: '#dba11a',
  light: '#fff0b8',
  accent: '#e2553b',
  gear: '#8a5a24',
  cheek: '#ff9a7a',
  ink: '#3b2a10',
  white: '#ffffff',
}

export const momoRig: MascotRig = {
  back: [
    { d: circle(32, 56, 8), fill: 'body', outline: true },
    { d: circle(88, 56, 8), fill: 'body', outline: true },
  ],
  body: [
    { d: 'M60 44C82 44 95 58 95 76C95 94 80 104 60 104C40 104 25 94 25 76C25 58 38 44 60 44Z', fill: 'body', outline: true },
    { d: 'M92 79C91 94 78 102 62 102C76 98 86 90 89 78Z', fill: 'shade' },
    { d: ellipse(60, 91, 17, 9.5), fill: 'light' },
    { d: ellipse(37, 64, 4, 6), fill: 'white', opacity: 0.6 },
  ],
  front: [
    { d: 'M28 82C44 88 62 96 74 103', fill: 'none', stroke: 'ink', strokeWidth: 8 },
    { d: 'M28 82C44 88 62 96 74 103', fill: 'none', stroke: 'gear', strokeWidth: 4.5 },
  ],
  over: [
    { d: 'M38 46C37 26 83 26 82 46Z', fill: 'gear', outline: true },
    { d: 'M39 39L81 39L82 45L38 45Z', fill: 'accent' },
    { d: 'M16 48C16 41 104 41 104 48C104 54 16 54 16 48Z', fill: 'gear', outline: true },
    { d: 'M24 47C40 44 80 44 96 47', fill: 'none', stroke: 'light', strokeWidth: 1.6, opacity: 0.6 },
    { d: star(70, 35, 4.2), fill: 'light' },
  ],
  face: { x: 60, y: 72, gap: 21 },
  arms: { left: [29, 84], right: [91, 84] },
}
