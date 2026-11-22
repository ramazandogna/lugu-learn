import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ALL_PROMPTS, INSIGHTS_SYSTEM, LESSON_SYSTEM } from '../../supabase/functions/_shared/ai/prompts/index.ts'

const doc = (name: string) => readFileSync(new URL(`../../docs/prompts/${name}.md`, import.meta.url), 'utf8')

describe('prompt documentation', () => {
  it.each(ALL_PROMPTS.map((p) => [p.role, p] as const))('docs/prompts/%s.md matches its module', (_role, p) => {
    const md = doc(p.role)
    expect(md).toContain(`version ${p.version}`)
    expect(md).toContain(p.instructions)
    expect(md).toContain(p.purpose)
  })

  it('docs/prompts/system.md matches the system prompts', () => {
    const md = doc('system')
    expect(md).toContain(LESSON_SYSTEM)
    expect(md).toContain(INSIGHTS_SYSTEM)
  })

  it('every role has a distinct id', () => {
    expect(new Set(ALL_PROMPTS.map((p) => p.role)).size).toBe(ALL_PROMPTS.length)
  })
})
