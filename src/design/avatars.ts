/**
 * Student avatars: original animal explorers, composed from a small set of
 * parts (ears, marking, accessory) so every one shares the mascots' outline
 * and shading language. Keys are stable — they are stored on the profile —
 * so a key is never renamed or reused; retire one by leaving it out of
 * `AVATAR_KEYS` only after migrating the profiles that use it.
 */
import { circle, ellipse, mirror, spikes, star } from './mascots/geometry'

export const AVATAR_KEYS = [
  'fox-scout',
  'cat-comet',
  'owl-reader',
  'bear-hiker',
  'bunny-dj',
  'panda-coder',
  'whale-dreamer',
  'turtle-sage',
  'dragon-spark',
  'penguin-pilot',
  'hedgehog-artist',
  'koala-chef',
  'tiger-runner',
  'raccoon-detective',
] as const
export type AvatarKey = (typeof AVATAR_KEYS)[number]

type Ears = 'pointy' | 'round' | 'big-round' | 'long' | 'tuft' | 'horns' | 'spiky' | 'spout' | 'none'
type Marking = 'cheeks' | 'patches' | 'face' | 'stripes' | 'band' | 'muzzle' | 'spots' | 'none'
type Accessory =
  | 'scarf' | 'star' | 'glasses' | 'beanie' | 'headphones' | 'cap'
  | 'leaf' | 'bandana' | 'goggles' | 'beret' | 'chef' | 'headband' | 'magnifier'

export interface AvatarDef {
  key: AvatarKey
  /** Turkish display name, also the accessible name. */
  label: string
  bg: string
  fur: string
  /** Darker fur: ears, markings. */
  shade: string
  /** Lighter fur: faces, bellies. */
  light: string
  accent: string
  ears: Ears
  marking: Marking
  accessory: Accessory
}

const def = (key: AvatarKey, label: string, bg: string, fur: string, shade: string, light: string, accent: string, ears: Ears, marking: Marking, accessory: Accessory): AvatarDef =>
  ({ key, label, bg, fur, shade, light, accent, ears, marking, accessory })

export const AVATARS: Record<AvatarKey, AvatarDef> = {
  'fox-scout': def('fox-scout', 'Kaşif Tilki', '#ffe3cf', '#f08a3c', '#c8611c', '#fff6ec', '#2f9e78', 'pointy', 'cheeks', 'scarf'),
  'cat-comet': def('cat-comet', 'Kuyruklu Yıldız Kedi', '#e7e3fb', '#9a94c9', '#6f68a6', '#f3f1ff', '#f6b92b', 'pointy', 'stripes', 'star'),
  'owl-reader': def('owl-reader', 'Kitapsever Baykuş', '#f3e6d6', '#a0764f', '#7a5534', '#f4e3cc', '#43399e', 'tuft', 'face', 'glasses'),
  'bear-hiker': def('bear-hiker', 'Yürüyüşçü Ayı', '#dff0e3', '#a8724a', '#7f5232', '#e9c9a8', '#d2483a', 'round', 'muzzle', 'beanie'),
  'bunny-dj': def('bunny-dj', 'DJ Tavşan', '#fde3ef', '#f7f2f6', '#e6c8d6', '#ffffff', '#b42a6f', 'long', 'cheeks', 'headphones'),
  'panda-coder': def('panda-coder', 'Kodcu Panda', '#e0f2ee', '#f7f7f4', '#2b2a35', '#ffffff', '#0b6e94', 'round', 'patches', 'cap'),
  'whale-dreamer': def('whale-dreamer', 'Hayalci Balina', '#dcefff', '#5b9be0', '#3f78bd', '#d7ecff', '#f6b92b', 'spout', 'spots', 'star'),
  'turtle-sage': def('turtle-sage', 'Bilge Kaplumbağa', '#e8f4d8', '#7cbf6a', '#4f9a48', '#d9f0c6', '#3f8f3a', 'none', 'spots', 'leaf'),
  'dragon-spark': def('dragon-spark', 'Kıvılcım Ejder', '#d8f3ef', '#3cb8a4', '#23907f', '#c9f2ea', '#e2553b', 'horns', 'cheeks', 'bandana'),
  'penguin-pilot': def('penguin-pilot', 'Pilot Penguen', '#e2ecf7', '#2f3550', '#1d2236', '#ffffff', '#f08a3c', 'none', 'face', 'goggles'),
  'hedgehog-artist': def('hedgehog-artist', 'Ressam Kirpi', '#fbeedd', '#c79a6e', '#8a6240', '#f4dcc0', '#c0307a', 'spiky', 'muzzle', 'beret'),
  'koala-chef': def('koala-chef', 'Şef Koala', '#eceaf3', '#a9a8b8', '#7d7b8f', '#e6e5ee', '#ffffff', 'big-round', 'muzzle', 'chef'),
  'tiger-runner': def('tiger-runner', 'Koşucu Kaplan', '#fff0d2', '#f39a2e', '#3a2a1a', '#fff3e0', '#2f9e78', 'round', 'stripes', 'headband'),
  'raccoon-detective': def('raccoon-detective', 'Dedektif Rakun', '#e6e8ee', '#8e93a3', '#3d4152', '#eef0f4', '#8a5a24', 'round', 'band', 'magnifier'),
}

export interface AvatarShape {
  d: string
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

const INK = '#251d3a'
const C = 32
const m = (d: string) => mirror(d, C)
const outlined = (d: string, fill: string): AvatarShape => ({ d, fill, stroke: INK, strokeWidth: 2 })
const stroked = (d: string, stroke: string, strokeWidth = 2): AvatarShape => ({ d, fill: 'none', stroke, strokeWidth })

function ears(a: AvatarDef): AvatarShape[] {
  switch (a.ears) {
    case 'pointy':
      return [outlined('M18 31L16 12L30 22Z', a.fur), outlined(m('M18 31L16 12L30 22Z'), a.fur), { d: 'M19 26L18 17L25 22Z', fill: a.shade }, { d: m('M19 26L18 17L25 22Z'), fill: a.shade }]
    case 'round':
      return [outlined(circle(18, 22, 6), a.fur), outlined(circle(46, 22, 6), a.fur), { d: circle(18, 22, 3), fill: a.shade }, { d: circle(46, 22, 3), fill: a.shade }]
    case 'big-round':
      return [outlined(circle(15, 27, 9), a.fur), outlined(circle(49, 27, 9), a.fur), { d: circle(15, 27, 5), fill: a.light }, { d: circle(49, 27, 5), fill: a.light }]
    case 'long':
      return [outlined(ellipse(25, 12, 4.5, 11), a.fur), outlined(ellipse(39, 12, 4.5, 11), a.fur), { d: ellipse(25, 13, 2, 7), fill: '#ffc7dc' }, { d: ellipse(39, 13, 2, 7), fill: '#ffc7dc' }]
    case 'tuft':
      return [outlined('M18 28L13 14L27 22Z', a.shade), outlined(m('M18 28L13 14L27 22Z'), a.shade)]
    case 'horns':
      return [outlined('M23 23C20 15 22 10 25 9C25 14 27 18 29 21Z', a.light), outlined(m('M23 23C20 15 22 10 25 9C25 14 27 18 29 21Z'), a.light)]
    case 'spiky':
      return [outlined(spikes(C, 35, 25, 17, 15), a.shade)]
    case 'spout':
      return [stroked('M32 20C32 13 28 10 24 11', '#7cc4ff', 2.4), stroked('M32 20C32 13 36 10 40 11', '#7cc4ff', 2.4), { d: circle(23, 13, 1.6), fill: '#7cc4ff' }, { d: circle(41, 13, 1.6), fill: '#7cc4ff' }]
    case 'none':
      return []
  }
}

function marking(a: AvatarDef): AvatarShape[] {
  switch (a.marking) {
    case 'cheeks':
      return [{ d: 'M15 38C20 46 26 50 32 50C38 50 44 46 49 38C44 42 38 43 32 40C26 43 20 42 15 38Z', fill: a.light }]
    case 'patches':
      return [{ d: ellipse(25, 35, 5, 6), fill: a.shade }, { d: ellipse(39, 35, 5, 6), fill: a.shade }]
    case 'face':
      return [{ d: 'M32 26C38 22 46 28 45 37C44 46 38 50 32 50C26 50 20 46 19 37C18 28 26 22 32 26Z', fill: a.light }]
    case 'stripes':
      return [stroked('M32 20V25', a.shade, 2.4), stroked('M25.5 21.5L27 25.5', a.shade, 2.4), stroked('M38.5 21.5L37 25.5', a.shade, 2.4)]
    case 'band':
      return [{ d: 'M15 34C21 29 43 29 49 34C46 39 18 39 15 34Z', fill: a.shade }]
    case 'muzzle':
      return [{ d: ellipse(32, 42, 7.5, 5.5), fill: a.light }]
    case 'spots':
      return [{ d: circle(24, 26, 2), fill: a.light }, { d: circle(29, 23, 1.4), fill: a.light }, { d: circle(42, 25, 1.8), fill: a.light }]
    case 'none':
      return []
  }
}

function face(a: AvatarDef): AvatarShape[] {
  const eye = a.marking === 'patches' || a.marking === 'band' ? '#ffffff' : INK
  const shine = eye === INK ? '#ffffff' : INK
  return [
    { d: circle(26, 35, 2.4), fill: eye },
    { d: circle(38, 35, 2.4), fill: eye },
    { d: circle(26.8, 34.2, 0.8), fill: shine },
    { d: circle(38.8, 34.2, 0.8), fill: shine },
    { d: ellipse(21.5, 41, 2.6, 1.5), fill: '#ff8fa3', opacity: 0.55 },
    { d: ellipse(42.5, 41, 2.6, 1.5), fill: '#ff8fa3', opacity: 0.55 },
    { d: 'M30.2 39.6Q32 38.6 33.8 39.6Q32 41.8 30.2 39.6Z', fill: INK },
    stroked('M29 43Q32 45.6 35 43', INK, 1.6),
  ]
}

function accessory(a: AvatarDef): AvatarShape[] {
  const c = a.accent
  switch (a.accessory) {
    case 'scarf':
      return [outlined('M18 50C26 55 38 55 46 50L46 55C38 59 26 59 18 55Z', c), outlined('M40 55L43 63L48 61L45 54Z', c)]
    case 'star':
      return [outlined(star(47, 18, 6), c)]
    case 'glasses':
      return [stroked(circle(26, 35, 5), INK, 1.8), stroked(circle(38, 35, 5), INK, 1.8), stroked('M31 35Q32 34 33 35', INK, 1.8)]
    case 'beanie':
      return [outlined('M15 30C15 15 49 15 49 30Z', c), outlined('M14 27L50 27L50 32L14 32Z', a.light), outlined(circle(32, 14, 3.4), a.light)]
    case 'headphones':
      return [stroked('M14 36C14 16 50 16 50 36', INK, 5), stroked('M14 36C14 16 50 16 50 36', c, 2.6), outlined(ellipse(14, 37, 4, 6.5), c), outlined(ellipse(50, 37, 4, 6.5), c)]
    case 'cap':
      return [outlined('M16 28C16 15 48 15 48 28Z', c), outlined('M30 27C38 24 51 25 57 29C51 32 38 31 30 29Z', c), { d: circle(32, 17, 1.6), fill: '#ffffff' }]
    case 'leaf':
      return [outlined('M32 20C30 12 36 7 43 8C43 15 38 20 32 20Z', c), stroked('M33 19L40 11', '#ffffff', 1.2)]
    case 'bandana':
      return [outlined('M15 29C22 23 42 23 49 29L49 32C42 27 22 27 15 32Z', c), outlined('M48 29L56 25L55 34Z', c)]
    case 'goggles':
      return [stroked('M14 27L50 27', INK, 3), outlined(circle(25, 26, 5), '#bfe6ff'), outlined(circle(39, 26, 5), '#bfe6ff'), stroked(circle(25, 26, 5), c, 1.4), stroked(circle(39, 26, 5), c, 1.4)]
    case 'beret':
      return [outlined('M13 27C13 17 47 13 51 24C47 29 22 30 13 27Z', c), stroked('M35 15.5L36 11.5', INK, 2)]
    case 'chef':
      return [outlined('M20 26L44 26L44 21C50 19 50 10 44 10C42 5 35 5 33 8C29 5 22 6 21 11C14 11 14 20 20 21Z', c), stroked('M21 22L43 22', '#d9d6e4', 1.5)]
    case 'headband':
      return [outlined('M15 28C22 23 42 23 49 28L49 32C42 27 22 27 15 32Z', c), stroked('M18 28C24 25 40 25 46 28', '#ffffff', 1.2)]
    case 'magnifier':
      return [stroked('M50 52L57 60', INK, 4), outlined(circle(46, 47, 6), '#d7efff'), stroked(circle(46, 47, 6), c, 1.6)]
  }
}

/** The parts of an avatar in paint order, in a 64×64 box. Shoulders are clipped to the circle by the renderer. */
export function avatarShapes(a: AvatarDef): { shoulders: AvatarShape[]; head: AvatarShape[] } {
  const shell = a.key === 'turtle-sage'
  return {
    shoulders: [
      outlined('M8 66C10 53 20 48 32 48C44 48 54 53 56 66Z', shell ? '#8a6a3a' : a.shade),
      ...(shell ? [stroked('M20 66L24 56L32 53L40 56L44 66M24 56L14 58M40 56L50 58M32 53V49', '#c9a46a', 1.6)] : []),
    ],
    head: [...ears(a), outlined(circle(C, 36, 17), a.fur), ...marking(a), ...face(a), ...accessory(a)],
  }
}
