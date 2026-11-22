import { describe, expect, it } from 'vitest'

import { CHARACTER_KEYS } from '@/domain/content'

import { AVATARS, AVATAR_KEYS, avatarShapes } from './avatars'
import { currentNodeId, mapPoints, orderNodes, pathThrough, walkedCount, type MapNode } from './map-layout'
import { EXPRESSIONS, MASCOT_RIGS, drawExpression } from './mascots'

const node = (sequence: number, state: MapNode['state']): MapNode => ({ id: `n${sequence}`, title: `L${sequence}`, sequence, state })

describe('learning map layout', () => {
  const nodes = [node(1, 'completed'), node(2, 'completed'), node(3, 'in_progress'), node(4, 'locked')]

  it('points the learner at the lesson in progress, else the first available one', () => {
    expect(currentNodeId(nodes)).toBe('n3')
    expect(currentNodeId([node(1, 'completed'), node(2, 'available'), node(3, 'available')])).toBe('n2')
    expect(currentNodeId([node(1, 'completed')])).toBeUndefined()
  })

  it('orders by sequence, not by array position', () => {
    expect(orderNodes([node(3, 'locked'), node(1, 'completed'), node(2, 'available')]).map((n) => n.sequence)).toEqual([1, 2, 3])
  })

  it('walks the trail up to the current node, or through the last completed one', () => {
    expect(walkedCount(nodes)).toBe(3)
    expect(walkedCount([node(1, 'completed'), node(2, 'completed')])).toBe(2)
    expect(walkedCount([node(1, 'locked')])).toBe(0)
  })

  it('winds: nodes swing to both sides and stay inside the width', () => {
    const pts = mapPoints(12, { amplitude: 30, rowHeight: 150 })
    expect(Math.min(...pts.map((p) => p.x))).toBeLessThan(40)
    expect(Math.max(...pts.map((p) => p.x))).toBeGreaterThan(60)
    expect(pts.every((p) => p.x >= 15 && p.x <= 85)).toBe(true)
    expect(pathThrough(pts)).toMatch(/^M50\.00 72C/)
    expect(pathThrough([])).toBe('')
  })
})

describe('mascots', () => {
  it.each(CHARACTER_KEYS)('%s draws every expression with a face, two arms and finite coordinates', (key) => {
    for (const e of EXPRESSIONS) {
      const layers = drawExpression(MASCOT_RIGS[key], e)
      expect(layers.eyes.length).toBeGreaterThan(0)
      expect(layers.arms).toHaveLength(4)
      for (const s of [...layers.eyes, ...layers.face, ...layers.arms, ...layers.extras]) expect(s.d).not.toMatch(/NaN|undefined/)
    }
  })
})

describe('avatars', () => {
  it('offers at least twelve, with stable kebab-case keys and Turkish names', () => {
    expect(AVATAR_KEYS.length).toBeGreaterThanOrEqual(12)
    for (const key of AVATAR_KEYS) {
      expect(key).toMatch(/^[a-z]+-[a-z]+$/)
      expect(AVATARS[key].key).toBe(key)
      expect(AVATARS[key].label.length).toBeGreaterThan(2)
    }
  })

  it('every avatar is visually distinct (no two share ears, marking and accessory)', () => {
    const signatures = AVATAR_KEYS.map((k) => `${AVATARS[k].ears}/${AVATARS[k].marking}/${AVATARS[k].accessory}/${AVATARS[k].fur}`)
    expect(new Set(signatures).size).toBe(AVATAR_KEYS.length)
    for (const k of AVATAR_KEYS) expect(avatarShapes(AVATARS[k]).head.every((s) => !/NaN/.test(s.d))).toBe(true)
  })
})
