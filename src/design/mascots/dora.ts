import { circle, ellipse, mirror, star } from './geometry'
import type { MascotPalette, MascotRig } from './types'

/** Dora — a tall dreamy owl-moth in a floppy night cap with a star pom, cape wings and a moon pendant. */
export const doraPalette: MascotPalette = {
  body: '#a77be8',
  shade: '#8256c9',
  light: '#e9ddff',
  accent: '#ffd56b',
  gear: '#4b2f86',
  cheek: '#ff9ccf',
  ink: '#2a1c4a',
  white: '#ffffff',
}

const wing = 'M35 62C19 64 13 82 22 97C27 90 32 86 37 84Z'

export const doraRig: MascotRig = {
  back: [
    { d: wing, fill: 'gear', outline: true },
    { d: mirror(wing), fill: 'gear', outline: true },
  ],
  body: [
    { d: 'M60 36C78 36 89 53 89 74C89 94 77 106 60 106C43 106 31 94 31 74C31 53 42 36 60 36Z', fill: 'body', outline: true },
    { d: 'M86 78C85 95 75 103 61 104C74 99 82 91 83 77Z', fill: 'shade' },
    { d: ellipse(44, 52, 3.6, 6), fill: 'white', opacity: 0.6 },
  ],
  front: [
    { d: 'M60 52C70 45 84 51 82 65C80 79 69 84 60 84C51 84 40 79 38 65C36 51 50 45 60 52Z', fill: 'light' },
    { d: 'M64 91C60 95 54 94 53 89C52 85 55 82 58 81C55 85 58 91 64 91Z', fill: 'accent', outline: true },
  ],
  over: [
    { d: mirror('M34 50C35 30 49 15 66 11C81 8 94 16 99 29C89 23 79 23 73 27C80 34 84 42 86 50C70 44 50 44 34 50Z'), fill: 'gear', outline: true },
    { d: 'M33 50C50 43 70 43 87 50C88 56 32 56 33 50Z', fill: 'light', outline: true },
    { d: mirror('M62 24C57 27 51 25 51 20C51 16 54 13 57 13C54 17 57 23 62 24Z'), fill: 'accent' },
    { d: star(21, 32, 7), fill: 'accent', outline: true },
    { d: circle(76, 34, 1.4), fill: 'light' },
    { d: circle(45, 18, 1.2), fill: 'light' },
  ],
  face: { x: 60, y: 66, gap: 20, scale: 1.15 },
  arms: { left: [34, 84], right: [86, 84] },
}
