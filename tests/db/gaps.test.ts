import { beforeAll, describe, expect, test } from 'vitest'
import { createHarness, errorOf, type Harness } from './harness'
import { correctAssessment, createProgram, playThrough, testPackage, type Program, type SessionPayload } from './fixtures'

let h: Harness
let admin: string
let student: { id: string; code: string }
let program: Program

const scalar = async <T>(sql: string, params: unknown[] = []) => (await h.db.query<{ v: T }>(sql, params)).rows[0]!.v

beforeAll(async () => {
  h = await createHarness()
  admin = await h.createAdmin()
  student = await h.createStudent()
  program = await createProgram(h, 2)
  await h.rpc(admin, 'admin_assign_program', { student_id: student.id, version_id: program.versionId })
})

describe('0009 gaps', () => {
  test('explanation requires every check attempted', async () => {
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    const call = (name: string, args: Record<string, unknown>) => h.rpc(student.id, name, { session_id: s.session.id, ...args })
    await call('complete_section', { section: 'vocabulary' })
    // One miss on wake-up so it becomes a review item for lesson 2.
    await call('record_vocab_answer', { item_id: 'wake-up', direction: 'en_tr', chosen: 'yanlış' })
    for (const [i, tr] of [['wake-up', 'uyanmak'], ['have-breakfast', 'kahvaltı yapmak'], ['brush-teeth', 'dişlerimi fırçalamak']] as const) {
      await call('record_vocab_answer', { item_id: i, direction: 'en_tr', chosen: tr })
      await call('record_vocab_answer', { item_id: i, direction: 'en_tr', chosen: tr })
    }
    await call('complete_section', { section: 'vocab_quiz' })
    await call('record_answer', { section: 'story', question_id: 'st-1', response: 0 })
    await call('record_answer', { section: 'story', question_id: 'st-2', response: 'morning' })
    await call('complete_section', { section: 'story' })
    expect(await errorOf(call('complete_section', { section: 'explanation' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
  })

  test('complete_lesson reports stars from the assessment percent and stores them', async () => {
    const sid = await scalar<string>(`select id as v from lugu.learning_sessions where status = 'active'`)
    await playThrough(h, student.id, sid, { ...correctAssessment, 'rd-2': 0 })
    const r = await h.rpc<{ stars: number }>(student.id, 'complete_lesson', { session_id: sid })
    expect(r.stars).toBe(2)
    expect(await scalar<number>(`select (summary ->> 'stars')::int as v from lugu.lesson_completion_records where session_id = $1`, [sid])).toBe(2)
    expect((await h.rpc<{ stars: number }>(student.id, 'complete_lesson', { session_id: sid })).stars).toBe(2)
  })

  test('student_review_items lists weak items from earlier lessons; record_review_answer keeps mastery', async () => {
    expect(await h.rpc(student.id, 'student_review_items', { lesson_id: program.lessonIds[0] })).toEqual([])
    const items = await h.rpc<{ package_id: string; item_id: string; tr: string }[]>(student.id, 'student_review_items', {
      lesson_id: program.lessonIds[1],
    })
    expect(items.map((i) => i.item_id)).toEqual(['wake-up'])
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[1] })
    const before = await scalar<string>(`select row_to_json(m)::text as v from lugu.vocabulary_mastery m where item_id = 'wake-up' and package_id = $1`, [program.packageIds[0]])
    const r = await h.rpc<{ correct: boolean }>(student.id, 'record_review_answer', {
      session_id: s.session.id, package_id: items[0]!.package_id, item_id: 'wake-up', chosen: 'Uyanmak',
    })
    expect(r.correct).toBe(true)
    expect(await scalar<string>(`select row_to_json(m)::text as v from lugu.vocabulary_mastery m where item_id = 'wake-up' and package_id = $1`, [program.packageIds[0]])).toBe(before)
    expect(
      await errorOf(h.rpc(student.id, 'record_review_answer', { session_id: s.session.id, package_id: program.packageIds[1], item_id: 'wake-up', chosen: 'x' })),
    ).toBe('LUGU_ITEM_NOT_FOUND')
  })

  test('student_open_break returns the open break or null, own sessions only', async () => {
    const sid = await scalar<string>(`select id as v from lugu.learning_sessions where status = 'active' and kind = 'primary'`)
    expect(await h.rpc(student.id, 'student_open_break', { session_id: sid })).toBeNull()
    const b = await h.rpc<{ id: string }>(student.id, 'start_break', { session_id: sid, after_section: 'vocabulary', planned_minutes: 10 })
    expect((await h.rpc<{ id: string }>(student.id, 'student_open_break', { session_id: sid })).id).toBe(b.id)
    const other = await h.createStudent()
    expect(await h.rpc(other.id, 'student_open_break', { session_id: sid })).toBeNull()
  })

  test('admin_reorder_lessons is atomic and validates the id set; locked once published', async () => {
    const v2 = await h.rpc<{ id: string }>(admin, 'admin_new_version', { curriculum_id: program.curriculumId })
    const ids = (await h.db.query<{ id: string }>(`select id from lugu.curriculum_lessons where version_id = $1 order by sequence`, [v2.id])).rows.map((r) => r.id)
    await h.rpc(admin, 'admin_reorder_lessons', { version_id: v2.id, lesson_ids: `{${[...ids].reverse().join(',')}}` })
    const after = (await h.db.query<{ id: string }>(`select id from lugu.curriculum_lessons where version_id = $1 order by sequence`, [v2.id])).rows.map((r) => r.id)
    expect(after).toEqual([...ids].reverse())
    expect(await errorOf(h.rpc(admin, 'admin_reorder_lessons', { version_id: v2.id, lesson_ids: `{${ids[0]}}` }))).toBe('LUGU_INVALID_ARGUMENT')
    expect(await errorOf(h.rpc(admin, 'admin_reorder_lessons', { version_id: program.versionId, lesson_ids: `{${program.lessonIds.join(',')}}` }))).toBe('LUGU_VERSION_LOCKED')
    expect(await errorOf(h.rpc(student.id, 'admin_reorder_lessons', { version_id: v2.id, lesson_ids: `{${ids.join(',')}}` }))).toBe('LUGU_FORBIDDEN')
  })

  test('admin_new_revision creates the next draft and copies admin material', async () => {
    await h.db.query(`insert into lugu.lesson_admin_material (package_id, teacher_guide) values ($1, '{"objective":"o"}')`, [program.packageIds[1]])
    const p = await h.rpc<{ id: string; revision: number; status: string }>(admin, 'admin_new_revision', {
      package_id: program.packageIds[1], content: JSON.stringify(testPackage('Edited')),
    })
    expect(p).toMatchObject({ revision: 2, status: 'draft' })
    expect(await scalar<string>(`select teacher_guide ->> 'objective' as v from lugu.lesson_admin_material where package_id = $1`, [p.id])).toBe('o')
  })

  test('academic_insights is admin-only; ai_jobs has speaking_session_id', async () => {
    await h.as(admin, (tx) => tx.query(`insert into lugu.academic_insights (student_id, content, status) values ($1, '{"summary":"s"}', 'reviewed')`, [student.id]))
    expect(await h.as(student.id, async (tx) => (await tx.query(`select * from lugu.academic_insights`)).rows.length)).toBe(0)
    const sp = await scalar<string>(`insert into lugu.speaking_sessions (student_id) values ($1) returning id as v`, [student.id])
    await h.as(admin, (tx) => tx.query(`insert into lugu.ai_jobs (kind, speaking_session_id) values ('speaking_plan', $1)`, [sp]))
  })
})
