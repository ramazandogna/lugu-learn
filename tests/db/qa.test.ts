import { beforeAll, describe, expect, test } from 'vitest'
import { createHarness, type Harness } from './harness'
import { correctAssessment, createProgram, type Program, type SessionPayload } from './fixtures'

let h: Harness
let student: { id: string; code: string }
let program: Program
let sid: string

const n = async (sql: string, params: unknown[] = []) => (await h.db.query<{ n: number }>(sql, params)).rows[0]!.n

beforeAll(async () => {
  h = await createHarness()
  const admin = await h.createAdmin()
  student = await h.createStudent()
  program = await createProgram(h, 1)
  await h.rpc(admin, 'admin_assign_program', { student_id: student.id, version_id: program.versionId })
  sid = (await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })).session.id
  await h.rpc(student.id, 'complete_section', { session_id: sid, section: 'vocabulary' })
})

describe('idempotent answers (client_id)', () => {
  test('record_vocab_answer retry returns the first result without a second attempt or mastery change', async () => {
    const args = { session_id: sid, item_id: 'wake-up', direction: 'en_tr', chosen: 'uyanmak', client_id: crypto.randomUUID() }
    const first = await h.rpc(student.id, 'record_vocab_answer', args)
    const again = await h.rpc(student.id, 'record_vocab_answer', args)
    expect(again).toEqual(first)
    expect(await n(`select count(*)::int as n from lugu.question_attempts where session_id = $1`, [sid])).toBe(1)
    expect(await n(`select correct_count as n from lugu.vocabulary_mastery where item_id = 'wake-up'`)).toBe(1)
  })

  test('record_answer retry returns the first result', async () => {
    for (const [i, tr] of [['wake-up', 'uyanmak'], ['have-breakfast', 'kahvaltı yapmak'], ['have-breakfast', 'kahvaltı yapmak'], ['brush-teeth', 'dişlerimi fırçalamak'], ['brush-teeth', 'dişlerimi fırçalamak']] as const)
      await h.rpc(student.id, 'record_vocab_answer', { session_id: sid, item_id: i, direction: 'en_tr', chosen: tr })
    await h.rpc(student.id, 'complete_section', { session_id: sid, section: 'vocab_quiz' })
    const args = { session_id: sid, section: 'story', question_id: 'st-1', response: 1, client_id: crypto.randomUUID() }
    const first = await h.rpc(student.id, 'record_answer', args)
    expect(await h.rpc(student.id, 'record_answer', args)).toEqual(first)
    expect(await n(`select count(*)::int as n from lugu.question_attempts where section = 'story'`)).toBe(1)
  })

  test('submit_assessment retry with the same client_id returns the stored score', async () => {
    const call = (name: string, args: Record<string, unknown>) => h.rpc(student.id, name, { session_id: sid, ...args })
    await call('record_answer', { section: 'story', question_id: 'st-2', response: 'morning' })
    await call('complete_section', { section: 'story' })
    await call('record_answer', { section: 'explanation', question_id: 'ex-1-check', response: 0 })
    await call('complete_section', { section: 'explanation' })
    for (const [q, r] of [['hw-1-c', 'have'], ['hw-1-o', ['I', 'have', 'breakfast']], ['hw-1-m', 0]] as const)
      await call('record_answer', { section: 'homework', question_id: q, response: r })
    await call('complete_section', { section: 'homework' })
    const client_id = crypto.randomUUID()
    const first = await call('submit_assessment', { answers: correctAssessment, client_id })
    expect(await call('submit_assessment', { answers: correctAssessment, client_id })).toEqual(first)
  })
})
