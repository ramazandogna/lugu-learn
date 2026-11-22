import { circle, ellipse, mirror } from './geometry'
import type { MascotPalette, MascotRig } from './types'

/** Piko — a sea-sky droplet with a curled idea-antenna, side fins and round glasses. */
export const pikoPalette: MascotPalette = {
  body: '#4cc3e6',
  shade: '#2a9cc4',
  light: '#c9f0fb',
  accent: '#ffe27a',
  gear: '#1d2a4a',
  cheek: '#ff9fb4',
  ink: '#1d2a4a',
  white: '#ffffff',
}

const fin = 'M31 60C19 53 13 64 21 73C25 71 28 68 31 66Z'

export const pikoRig: MascotRig = {
  back: [
    { d: fin, fill: 'shade', outline: true },
    { d: mirror(fin), fill: 'shade', outline: true },
    { d: 'M60 24C59 14 66 7 73 10C78 12 78 18 74 20', fill: 'none', stroke: 'ink', strokeWidth: 3 },
    { d: circle(74, 13, 5.5), fill: 'accent', outline: true },
  ],
  body: [
    { d: 'M60 22C73 36 92 50 92 73C92 93 78 104 60 104C42 104 28 93 28 73C28 50 47 36 60 22Z', fill: 'body', outline: true },
    { d: 'M89 76C88 92 77 101 61 102C75 97 84 89 86 75Z', fill: 'shade' },
    { d: ellipse(60, 89, 17, 11), fill: 'light' },
    { d: ellipse(43, 54, 4, 7), fill: 'white', opacity: 0.7 },
  ],
  front: [],
  over: [
    { d: circle(51, 68, 8.5), fill: 'none', stroke: 'ink', strokeWidth: 2.6 },
    { d: circle(69, 68, 8.5), fill: 'none', stroke: 'ink', strokeWidth: 2.6 },
    { d: 'M59.5 67Q60 65.5 60.5 67', fill: 'none', stroke: 'ink', strokeWidth: 2.6 },
  ],
  face: { x: 60, y: 68, gap: 18 },
  arms: { left: [32, 82], right: [88, 82] },
}
