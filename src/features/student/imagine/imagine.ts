/*
 * Hayal kur: logic. A closed pool of chips, a ready sentence frame, nothing to
 * get wrong. Chips come from the package's `play.extras` imagine slots, else
 * from the lesson's own vocabulary. Cards are kept on this device only.
 */
import { resolveExtras } from '@/play/resolve-play'
import { safeStorage } from '@/play/storage'
import type { ImagineSlots, LessonPackage } from '@/domain/content'

export type Chip = ImagineSlots['chips'][number]

export const BODIES = [
  { key: 'round', label: 'Yuvarlak' },
  { key: 'tall', label: 'Uzun' },
  { key: 'blob', label: 'Pofuduk' },
  { key: 'square', label: 'Köşeli' },
] as const
export const COLORS = [
  { key: 'primary', label: 'Mor', css: 'var(--color-primary-fill)' },
  { key: 'accent', label: 'Turuncu', css: 'var(--color-accent)' },
  { key: 'star', label: 'Sarı', css: 'var(--color-star)' },
  { key: 'positive', label: 'Yeşil', css: 'var(--color-positive)' },
] as const
export const EXTRAS = [
  { key: 'none', label: 'Sade' },
  { key: 'horns', label: 'Boynuz' },
  { key: 'antenna', label: 'Anten' },
  { key: 'wings', label: 'Kanat' },
] as const
export const DEFAULT_BACKGROUNDS = ['Uzay', 'Orman', 'Şeker dükkânı'] as const

export type BodyKey = (typeof BODIES)[number]['key']
export type ColorKey = (typeof COLORS)[number]['key']
export type ExtraKey = (typeof EXTRAS)[number]['key']

export interface Creature {
  body: BodyKey
  color: ColorKey
  eyes: 1 | 2 | 3
  extra: ExtraKey
}

export type CardArt = { kind: 'character'; creature: Creature } | { kind: 'scene'; bg: number; items: string[] }

export interface ImagineCard {
  id: string
  lessonId: string
  title: string
  sentence: string
  art: CardArt
  createdAt: string
}

export interface Studio {
  frame: string
  sceneFrame: string
  chips: Chip[]
  backgrounds: string[]
  collection: string
  /** Pretty name for the lesson, shown as the studio's subtitle. */
  lessonTitle: string
  authored: boolean
}

const BLANK = '___'
export const SCENE_FRAME = 'There is ___ here.'
const DEFAULT_FRAME = "My monster's words today: ___, ___."

export const blanksOf = (frame: string) => Math.min(3, frame.split(BLANK).length - 1)

/** The frame always has 1..3 blanks. */
export function normalFrame(frame: string): string {
  const n = frame.split(BLANK).length - 1
  if (n === 0) return `${frame.replace(/\.$/, '')} ${BLANK}.`
  return frame
}

export function fillFrame(frame: string, picks: readonly string[], open = BLANK): string {
  let i = 0
  return normalFrame(frame).replace(/___/g, () => picks[i++] ?? open)
}

/** Imagine slots from the package, else derived from the lesson's vocabulary (no kinds known: all are words to play with). */
export function studioFrom(pkg: Pick<LessonPackage, 'meta' | 'play' | 'vocabulary'>): Studio {
  const authored = resolveExtras(pkg).find((e) => e.template === 'imagine')?.slots
  const lessonTitle = pkg.meta.title
  if (authored) {
    return {
      frame: normalFrame(authored.frame),
      sceneFrame: SCENE_FRAME,
      chips: authored.chips,
      backgrounds: DEFAULT_BACKGROUNDS.map((d, i) => authored.backgrounds?.[i]?.label ?? d),
      collection: authored.collection.title,
      lessonTitle,
      authored: true,
    }
  }
  const chips: Chip[] = pkg.vocabulary.slice(0, 8).map((v) => ({ id: v.id, en: v.en, tr: v.tr, kind: 'noun' as const }))
  return {
    frame: DEFAULT_FRAME,
    sceneFrame: SCENE_FRAME,
    chips,
    backgrounds: [...DEFAULT_BACKGROUNDS],
    collection: 'Hayal koleksiyonum',
    lessonTitle,
    authored: false,
  }
}

/** True when the picks are not in the pool's own order: Piko finds it funny, never wrong. */
export function isSilly(picks: readonly string[], chips: readonly Chip[]): boolean {
  const idx = picks.map((p) => chips.findIndex((c) => c.en === p))
  return idx.some((v, i) => i > 0 && v < (idx[i - 1] ?? -1))
}

const KEY = 'lugu.imagine.cards.v1'
const CAP = 24

export function loadCards(lessonId?: string): ImagineCard[] {
  try {
    const raw: unknown = JSON.parse(safeStorage().getItem(KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    const ok = raw.filter(
      (c): c is ImagineCard => typeof c === 'object' && c !== null && typeof (c as ImagineCard).id === 'string' && typeof (c as ImagineCard).sentence === 'string' && typeof (c as ImagineCard).art === 'object',
    )
    return lessonId ? ok.filter((c) => c.lessonId === lessonId) : ok
  } catch {
    return []
  }
}

export function saveCard(card: ImagineCard): ImagineCard[] {
  const all = [card, ...loadCards().filter((c) => c.id !== card.id)].slice(0, CAP)
  safeStorage().setItem(KEY, JSON.stringify(all))
  return all
}
