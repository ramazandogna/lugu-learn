/** The SQL grader must agree with src/domain/grading.ts on every shared case. */
import { beforeAll, describe, expect, test } from 'vitest'
import { gradeCases, normalizeCases, vocabCases } from '@/domain/grading-cases'
import { createHarness, type Harness } from './harness'

let h: Harness
beforeAll(async () => {
  h = await createHarness()
})

describe('lugu.normalize_answer', () => {
  test.each(normalizeCases)('$input → $expected', async ({ input, expected }) => {
    const res = await h.db.query<{ r: string }>('select lugu.normalize_answer($1) as r', [input])
    expect(res.rows[0]!.r).toBe(expected)
  })

  test('JS whitespace class: NBSP, ideographic space, BOM', async () => {
    const res = await h.db.query<{ r: string }>('select lugu.normalize_answer($1) as r', [' have　 breakfast﻿'])
    expect(res.rows[0]!.r).toBe('have breakfast')
  })
})

describe('lugu.grade_response', () => {
  test.each(gradeCases)('$name', async ({ question, response, correct }) => {
    const res = await h.db.query<{ r: boolean }>('select lugu.grade_response($1::jsonb, $2::jsonb) as r', [
      JSON.stringify(question),
      JSON.stringify(response),
    ])
    expect(res.rows[0]!.r).toBe(correct)
  })

  test('SQL null response is incorrect', async () => {
    const res = await h.db.query<{ r: boolean }>(`select lugu.grade_response('{"type":"text","accept":["a"]}', null) as r`)
    expect(res.rows[0]!.r).toBe(false)
  })
})

describe('lugu.grade_vocab', () => {
  test.each(vocabCases)('$name', async ({ item, direction, chosen, correct }) => {
    const res = await h.db.query<{ r: boolean }>('select lugu.grade_vocab($1::jsonb, $2, $3) as r', [
      JSON.stringify(item),
      direction,
      chosen,
    ])
    expect(res.rows[0]!.r).toBe(correct)
  })
})
