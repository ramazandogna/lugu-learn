import { describe, expect, it } from 'vitest'

import { isComplete, matchesTokens, move, newOrderState, orderResponse, place, unplace } from './order'

const seq = (...v: number[]) => {
  let i = 0
  return () => v[i++ % v.length] ?? 0
}

describe('order state', () => {
  it('gives duplicate words distinct instance ids', () => {
    const s = newOrderState(['the', 'cat', 'the', 'dog'], seq(0.3))
    const ids = s.pool.map((t) => t.id)
    expect(new Set(ids).size).toBe(4)
    expect(s.pool.filter((t) => t.text === 'the')).toHaveLength(2)
    expect(s.placed).toEqual([])
  })

  it('never starts on the solution when avoidable', () => {
    // rng 0.99 keeps the identity permutation in Fisher-Yates
    const tokens = ['I', 'go', 'home']
    const s = newOrderState(tokens, seq(0.99), tokens)
    expect(orderResponse({ pool: [], placed: s.pool })).not.toEqual(tokens)
  })

  it('place, unplace and move are pure and keep every token', () => {
    const s0 = newOrderState(['a', 'b', 'c'], seq(0.99))
    const s1 = place(s0, 0)
    expect(s0.placed).toEqual([])
    expect(s1.placed.map((t) => t.text)).toEqual(['a'])
    const s2 = place(place(s1, 0), 0)
    expect(isComplete(s2)).toBe(true)
    expect(orderResponse(s2)).toEqual(['a', 'b', 'c'])
    const s3 = move(s2, 0, 2)
    expect(orderResponse(s3)).toEqual(['b', 'c', 'a'])
    const s4 = unplace(s3, 1)
    expect(orderResponse(s4)).toEqual(['b', 'a'])
    expect(s4.pool.map((t) => t.text)).toEqual(['c'])
    expect(isComplete(s4)).toBe(false)
  })

  it('places the right duplicate instance', () => {
    const s = newOrderState(['the', 'the'], seq(0.99))
    const placed = place(s, 1)
    expect(placed.placed[0]?.id).toBe(s.pool[1]?.id)
    expect(placed.pool[0]?.id).toBe(s.pool[0]?.id)
  })

  it('ignores invalid indices', () => {
    const s = newOrderState(['a', 'b'], seq(0))
    expect(place(s, 5)).toBe(s)
    expect(unplace(s, 0)).toBe(s)
    const p = place(s, 0)
    expect(move(p, 0, 3)).toBe(p)
    expect(move(p, 0, 0)).toBe(p)
  })

  it('validates a restored state against the tokens', () => {
    const tokens = ['a', 'b', 'a']
    const s = place(newOrderState(tokens, seq(0.4)), 1)
    expect(matchesTokens(s, tokens)).toBe(true)
    expect(matchesTokens(s, ['a', 'b'])).toBe(false)
    expect(matchesTokens({ pool: [{ id: '0', text: 'a' }, { id: '0', text: 'a' }], placed: [{ id: '1', text: 'b' }] }, tokens)).toBe(false)
    expect(matchesTokens({ pool: [{ id: '0', text: 'x' }, { id: '2', text: 'a' }], placed: [{ id: '1', text: 'b' }] }, tokens)).toBe(false)
  })
})
