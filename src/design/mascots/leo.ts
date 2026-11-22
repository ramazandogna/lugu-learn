import { circle, ellipse, spikes, star } from './geometry'
import type { MascotPalette, MascotRig } from './types'

/** Leo — a brave little sun-maned creature with a bandana and a star badge. */
export const leoPalette: MascotPalette = {
  body: '#ff9d45',
  shade: '#e3772a',
  light: '#ffe2c2',
  accent: '#ffd25e',
  gear: '#c8402f',
  cheek: '#ff6f61',
  ink: '#3a1e10',
  white: '#ffffff',
}

export const leoRig: MascotRig = {
  back: [
    { d: spikes(60, 62, 43, 31, 11), fill: 'shade', outline: true },
    { d: 'M38 86C36 104 84 104 82 86Z', fill: 'body', outline: true },
  ],
  body: [
    { d: circle(60, 62, 28), fill: 'body', outline: true },
    { d: circle(42, 38, 6), fill: 'body', outline: true },
    { d: circle(78, 38, 6), fill: 'body', outline: true },
    { d: 'M85 66C83 81 73 89 60 90C72 85 80 77 81 64Z', fill: 'shade' },
    { d: ellipse(60, 75, 12, 8), fill: 'light' },
    { d: ellipse(45, 50, 3.6, 5.5), fill: 'white', opacity: 0.6 },
  ],
  front: [
    { d: 'M40 87C52 92 68 92 80 87L60 101Z', fill: 'gear', outline: true },
    { d: star(60, 93, 4.6), fill: 'accent' },
  ],
  face: { x: 60, y: 60, gap: 18 },
  arms: { left: [40, 92], right: [80, 92] },
}
