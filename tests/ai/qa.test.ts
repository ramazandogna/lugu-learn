import { describe, expect, it } from 'vitest'
import { LessonPackage } from '@/domain/content.ts'
import { deterministicQa, normaliseTokens, storyMissingVocabulary } from '../../supabase/functions/_shared/ai/qa.ts'
import { toStructuredSchema } from '../../supabase/functions/_shared/ai/json-schema.ts'
import { lessonPackageFixture } from './fixtures/lesson-package.ts'

const fixture = () => structuredClone(lessonPackageFixture)

describe('deterministic QA', () => {
  it('passes the demo package with no blocker or major issue', () => {
    const { pkg, issues } = deterministicQa(fixture())
    expect(pkg).not.toBeNull()
    expect(issues.filter((i) => i.severity !== 'minor')).toEqual([])
    expect(storyMissingVocabulary(pkg!)).toEqual([])
  })

  it('catches a broken answer key and attributes it to the section', () => {
    const p = fixture()
    const q = p.homework.groups[2]!.complete
    if (q.type !== 'choice') throw new Error('fixture shape')
    q.answer = 5
    const { pkg, issues } = deterministicQa(p)
    expect(pkg).toBeNull()
    expect(issues).toContainEqual(expect.objectContaining({ severity: 'blocker', area: 'homework', message: expect.stringContaining('answer outside options') }))
  })

  it('catches an order question whose tokens are not a permutation of the answer', () => {
    const p = fixture()
    p.assessment.quiz[7] = { ...p.assessment.quiz[7]!, type: 'order', tokens: ['Leo', 'get', 'up', 'early', 'every', 'day.'], answer: ['Leo', 'gets', 'up', 'early', 'every', 'day.'] }
    const { issues } = deterministicQa(p)
    expect(issues).toContainEqual(expect.objectContaining({ severity: 'blocker', area: 'assessment', message: expect.stringContaining('permutation') }))
  })

  it('catches a story that ignores the lesson vocabulary', () => {
    const p = fixture()
    p.story.scenes = [
      { id: 'sc-1', lines: [{ speaker: 'piko', en: 'Hello! I like my new bike.', tr: 'Merhaba! Yeni bisikletimi seviyorum.' }, { speaker: 'sasha', en: 'It is very nice. Let’s go to the park.', tr: 'Çok güzel. Parka gidelim.' }] },
    ]
    const { issues } = deterministicQa(p)
    const story = issues.find((i) => i.area === 'story' && i.severity === 'blocker')
    expect(story?.message).toMatch(/story uses 0% of the lesson vocabulary/)
    expect(story?.message).toContain('v-have-breakfast')
  })

  it('flags URLs/HTML, missing true/false items and duplicate ids across sections', () => {
    const p = fixture()
    p.story.scenes[0]!.lines[0]!.en = 'Visit https://example.com for more.'
    p.assessment.reading.questions = p.assessment.reading.questions.filter((q) => !q.id.startsWith('rd-tf'))
    let r = deterministicQa(p)
    expect(r.issues).toContainEqual(expect.objectContaining({ severity: 'blocker', area: 'story', message: expect.stringContaining('URL or HTML') }))
    expect(r.issues).toContainEqual(expect.objectContaining({ severity: 'major', area: 'assessment', message: expect.stringContaining('no true/false') }))

    const d = fixture()
    d.assessment.quiz[0]!.id = 'hw-1-complete'
    r = deterministicQa(d)
    expect(r.issues).toContainEqual(expect.objectContaining({ severity: 'blocker', message: expect.stringContaining('duplicate id "hw-1-complete"') }))
  })

  it('warns when vocabulary or homework counts are outside the targets', () => {
    const p = fixture()
    const extra = ['have dinner', 'walk the dog', 'tidy my room', 'feed the cat', 'listen to music', 'read a book']
    p.vocabulary.push(...extra.map((en, i) => ({ id: `v-extra-${i}`, en, tr: `ek ${i}`, example: { en: `I ${en}.`, tr: `Örnek ${i}.` }, difficulty: 1 })))
    p.homework.groups = p.homework.groups.slice(0, 4)
    const { issues } = deterministicQa(p)
    expect(issues).toContainEqual(expect.objectContaining({ severity: 'major', area: 'vocabulary', message: expect.stringContaining('21 vocabulary items') }))
    expect(issues).toContainEqual(expect.objectContaining({ severity: 'minor', area: 'homework', message: expect.stringContaining('4 homework groups') }))
    expect(issues.some((i) => i.area === 'story' && i.severity === 'blocker')).toBe(false)
  })

  it('normalises person and possessive forms when matching phrases', () => {
    expect(normaliseTokens('Piko brushes his teeth')).toEqual(normaliseTokens('piko brush my teeth'))
    expect(normaliseTokens('She has lunch')).toEqual(['she', 'have', 'lunch'])
    expect(normaliseTokens('Momo is late for the bus')).toEqual(['momo', 'be', 'late', 'for', 'the', 'bus'])
  })
})

describe('structured-output schema', () => {
  it('is accepted by output_config.format: no unsupported keywords, closed objects, no oneOf', () => {
    const schema = toStructuredSchema(LessonPackage)
    const text = JSON.stringify(schema)
    for (const k of ['minLength', 'maxLength', 'pattern', 'minimum', 'maximum', 'minItems', 'maxItems', 'oneOf', '$schema'])
      expect(text).not.toContain(`"${k}"`)
    const objects: Record<string, unknown>[] = []
    const walk = (n: unknown): void => {
      if (Array.isArray(n)) n.forEach(walk)
      else if (n && typeof n === 'object') {
        const o = n as Record<string, unknown>
        if (o.type === 'object') objects.push(o)
        Object.values(o).forEach(walk)
      }
    }
    walk(schema)
    expect(objects.length).toBeGreaterThan(10)
    expect(objects.every((o) => o.additionalProperties === false)).toBe(true)
  })
})
