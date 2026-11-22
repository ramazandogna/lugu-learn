import { readFileSync } from 'node:fs'

import { checkStyling } from 'rei-kit/check'
import { describe, expect, it } from 'vitest'

import { CHARACTER_KEYS } from '@/domain/content'

import { CHARACTERS } from './characters'
import { contrast } from './contrast'

const css = readFileSync('src/assets/main.css', 'utf8')

/** Every `--color-<name>: #hex` inside the first rule matching `selector`. */
function block(selector: RegExp): Map<string, string> {
  const start = css.search(selector)
  if (start < 0) throw new Error(`no rule ${selector}`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return new Map([...body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k as string, v as string]))
}

const day = block(/@theme\s*\{/)
const night = block(/^\.dark\s*\{/m)
const admin = block(/^\[data-area='admin'\]\s*\{/m)
const adminNight = new Map([...night, ...block(/^\.dark \[data-area='admin'\]/m)])

const AA = 4.5

describe('main.css', () => {
  it('is wired to rei-kit, and every filled role is readable by day and by night', () => {
    expect(
      checkStyling({ css, tokens: readFileSync('node_modules/rei-kit/dist/tokens.css', 'utf8') }),
    ).toEqual([])
  })

  it.each([
    ['day', day],
    ['night', night],
  ] as const)('keeps body text and links at AA (%s)', (_, roles) => {
    const get = (k: string) => roles.get(k) ?? day.get(k) ?? ''
    for (const ground of ['canvas', 'surface', 'muted']) {
      expect(contrast(get('ink'), get(ground))).toBeGreaterThanOrEqual(AA)
      expect(contrast(get('ink-soft'), get(ground))).toBeGreaterThanOrEqual(AA)
    }
    for (const ground of ['canvas', 'surface']) expect(contrast(get('primary'), get(ground))).toBeGreaterThanOrEqual(AA)
    expect(contrast(get('ink'), get('wash'))).toBeGreaterThanOrEqual(AA)
  })

  it.each([
    ['day', new Map([...day, ...admin])],
    ['night', adminNight],
  ] as const)('keeps the admin area at AA (%s)', (_, roles) => {
    const get = (k: string) => roles.get(k) ?? ''
    for (const ground of ['canvas', 'surface', 'muted', 'wash']) {
      expect(contrast(get('ink'), get(ground))).toBeGreaterThanOrEqual(AA)
      expect(contrast(get('ink-soft'), get(ground))).toBeGreaterThanOrEqual(AA)
    }
    expect(contrast(get('primary'), get('canvas'))).toBeGreaterThanOrEqual(AA)
  })
})

describe('character themes', () => {
  it.each(CHARACTER_KEYS)('%s: text on its fills and its primary as text are AA, day and night', (key) => {
    const t = CHARACTERS[key].theme
    const canvas = day.get('canvas') ?? ''
    const surface = day.get('surface') ?? ''
    const nightCanvas = night.get('canvas') ?? ''
    const nightSurface = night.get('surface') ?? ''

    expect(contrast(t.primary, t.onPrimary)).toBeGreaterThanOrEqual(AA)
    expect(contrast(t.accent, t.onAccent)).toBeGreaterThanOrEqual(AA)
    expect(contrast(t.primaryNight, t.onPrimaryNight)).toBeGreaterThanOrEqual(AA)
    expect(contrast(t.accentNight, t.onAccentNight)).toBeGreaterThanOrEqual(AA)

    // primary is also link text and the focus ring
    for (const ground of [canvas, surface, t.wash]) expect(contrast(t.primary, ground)).toBeGreaterThanOrEqual(AA)
    for (const ground of [nightCanvas, nightSurface, t.washNight]) expect(contrast(t.primaryNight, ground)).toBeGreaterThanOrEqual(AA)

    // ink stays readable on the wash a character lays behind text
    expect(contrast(day.get('ink') ?? '', t.wash)).toBeGreaterThanOrEqual(AA)
    expect(contrast(night.get('ink') ?? '', t.washNight)).toBeGreaterThanOrEqual(AA)
  })

  it('every character has the core expressions and at least three catchphrases', () => {
    for (const key of CHARACTER_KEYS) {
      const c = CHARACTERS[key]
      expect(c.expressions).toEqual(expect.arrayContaining(['happy', 'thinking', 'celebrating', 'encouraging', 'resting']))
      expect(c.catchphrases.length).toBeGreaterThanOrEqual(3)
    }
  })
})
