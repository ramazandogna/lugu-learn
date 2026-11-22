import { beforeAll, describe, expect, test } from 'vitest'
import { createHarness, errorOf, type Harness } from './harness'
import { createProgram, type Program, type SessionPayload } from './fixtures'

let h: Harness
let admin: string
let a: { id: string; code: string }
let b: { id: string; code: string }
let program: Program
let sessionA: string
let sessionB: string

const count = (userId: string | null, sql: string, params: unknown[] = []) =>
  h.as(userId, async (tx) => (await tx.query<{ n: number }>(`select count(*)::int as n from (${sql}) x`, params)).rows[0]!.n)

beforeAll(async () => {
  h = await createHarness()
  admin = await h.createAdmin()
  a = await h.createStudent()
  b = await h.createStudent()
  program = await createProgram(h, 2)
  for (const s of [a, b]) await h.rpc(admin, 'admin_assign_program', { student_id: s.id, version_id: program.versionId })
  sessionA = (await h.rpc<SessionPayload>(a.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })).session.id
  sessionB = (await h.rpc<SessionPayload>(b.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })).session.id
  await h.rpc(a.id, 'complete_section', { session_id: sessionA, section: 'vocabulary' })
  await h.rpc(b.id, 'complete_section', { session_id: sessionB, section: 'vocabulary' })
  await h.rpc(b.id, 'record_vocab_answer', { session_id: sessionB, item_id: 'wake-up', direction: 'en_tr', chosen: 'uyanmak' })
  await h.db.query(`insert into lugu.lesson_admin_material (package_id, teacher_guide) values ($1, '{"objective":"x"}')`, [
    program.packageIds[0],
  ])
  await h.db.query(`insert into lugu.student_learning_profiles (student_id, observed) values ($1, '{}')`, [b.id])
  const sp = await h.db.query<{ id: string }>(`insert into lugu.speaking_sessions (student_id) values ($1) returning id`, [b.id])
  await h.db.query(`insert into lugu.speaking_session_notes (speaking_session_id, observations) values ($1, 'note')`, [sp.rows[0]!.id])
})

describe('student isolation', () => {
  test('a student reads only their own profile rows (auth.ts reads these)', async () => {
    expect(await count(a.id, 'select * from lugu.profiles')).toBe(1)
    expect(await count(a.id, 'select * from lugu.student_profiles')).toBe(1)
    const own = await h.as(a.id, (tx) =>
      tx.query<{ role: string; status: string; must_change_password: boolean }>(
        'select role, status, must_change_password from lugu.profiles where user_id = $1',
        [a.id],
      ),
    )
    expect(own.rows[0]).toEqual({ role: 'student', status: 'active', must_change_password: true })
    expect(await count(a.id, 'select * from lugu.student_profiles where user_id = $1', [b.id])).toBe(0)
  })

  test("a student cannot read another student's learning rows", async () => {
    for (const t of ['learning_sessions', 'question_attempts', 'vocabulary_mastery', 'program_assignments']) {
      expect(await count(a.id, `select * from lugu.${t} where student_id = $1`, [b.id]), t).toBe(0)
    }
    expect(await count(a.id, 'select * from lugu.session_section_progress where session_id = $1', [sessionB])).toBe(0)
    expect(await count(a.id, 'select * from lugu.learning_sessions')).toBe(1)
  })

  test("a student cannot use another student's session through RPCs", async () => {
    expect(await errorOf(h.rpc(a.id, 'complete_section', { session_id: sessionB, section: 'vocab_quiz' }))).toBe(
      'LUGU_SESSION_NOT_FOUND',
    )
    expect(
      await errorOf(
        h.rpc(a.id, 'record_vocab_answer', { session_id: sessionB, item_id: 'wake-up', direction: 'en_tr', chosen: 'uyanmak' }),
      ),
    ).toBe('LUGU_SESSION_NOT_FOUND')
    expect(await errorOf(h.rpc(a.id, 'complete_lesson', { session_id: sessionB }))).toBe('LUGU_SESSION_NOT_FOUND')
  })

  test('students cannot read packages, admin material, audit logs, AI jobs, coaching or reports', async () => {
    for (const t of [
      'lesson_content_packages', 'lesson_admin_material', 'admin_audit_logs', 'ai_jobs', 'program_events',
      'speaking_sessions', 'speaking_session_notes', 'student_learning_profiles', 'weekly_learning_reports',
      'school_exams', 'school_exam_results', 'system_settings', 'data_deletion_requests', 'curriculum_sources',
    ]) {
      expect(await count(b.id, `select * from lugu.${t}`), t).toBe(0)
    }
  })

  test('students see the curriculum structure only of versions assigned to them', async () => {
    const outsider = await h.createStudent()
    expect(await count(a.id, 'select * from lugu.curriculum_lessons')).toBe(2)
    expect(await count(outsider.id, 'select * from lugu.curriculum_lessons')).toBe(0)
    expect(await count(outsider.id, 'select * from lugu.curricula')).toBe(0)
  })

  test('students cannot write learning state directly', async () => {
    const attempts: [string, string, unknown[]][] = [
      [
        'question_attempts',
        `insert into lugu.question_attempts (session_id, student_id, package_id, section, question_id, attempt_no, response, correct)
         values ($1, $2, $3, 'story', 'st-1', 1, '0', true)`,
        [sessionA, a.id, program.packageIds[0]],
      ],
      [
        'vocabulary_mastery',
        `insert into lugu.vocabulary_mastery (student_id, package_id, item_id, correct_count, mastered_at) values ($1, $2, 'wake-up', 2, now())`,
        [a.id, program.packageIds[0]],
      ],
      ['progress_rewards', `insert into lugu.progress_rewards (student_id, amount, reason) values ($1, 1000, 'manual')`, [a.id]],
      [
        'program_assignments',
        `insert into lugu.program_assignments (student_id, curriculum_version_id, start_lesson_id, current_lesson_id) values ($1, $2, $3, $3)`,
        [a.id, program.versionId, program.lessonIds[1]],
      ],
      [
        'lesson_completion_records',
        `insert into lugu.lesson_completion_records (assignment_id, lesson_id, student_id, session_id, package_id)
         select a.id, $2, $1, $3, $4 from lugu.program_assignments a where a.student_id = $1`,
        [a.id, program.lessonIds[0], sessionA, program.packageIds[0]],
      ],
      ['session_section_progress', `update lugu.session_section_progress set status = 'completed' where session_id = $1`, [sessionA]],
      ['learning_sessions', `update lugu.learning_sessions set status = 'completed', completed_at = now() where id = $1`, [sessionA]],
      ['program_assignments update', `update lugu.program_assignments set current_lesson_id = $2 where student_id = $1`, [a.id, program.lessonIds[1]]],
      ['profiles', `update lugu.profiles set role = 'admin' where user_id = $1`, [a.id]],
      ['student_profiles', `update lugu.student_profiles set student_code = 'LUGU-9999' where user_id = $1`, [a.id]],
    ]
    for (const [name, sql, params] of attempts) {
      const result = await h
        .as(a.id, async (tx) => (await tx.query(sql, params)).affectedRows ?? 0)
        .then((n) => `affected ${n}`)
        .catch((e: Error) => e.message)
      expect(result, name).toMatch(/permission denied|row-level security|affected 0/)
    }
    const role = await h.db.query<{ role: string }>('select role from lugu.profiles where user_id = $1', [a.id])
    expect(role.rows[0]!.role).toBe('student')
  })

  test('students cannot call admin RPCs or service-only functions', async () => {
    expect(await errorOf(h.rpc(a.id, 'admin_set_progress', { assignment_id: program.versionId, action: 'forward' }))).toBe(
      'LUGU_FORBIDDEN',
    )
    expect(await errorOf(h.rpc(a.id, 'next_student_code'))).toMatch(/permission denied/)
    expect(await errorOf(h.rpc(a.id, 'grade_response', { question: {}, response: 1 }))).toMatch(/permission denied/)
  })

  test('anon can neither read tables nor call RPCs', async () => {
    expect(await errorOf(h.as(null, (tx) => tx.query('select * from lugu.profiles')))).toMatch(/permission denied/)
    expect(await errorOf(h.rpc(null, 'student_home'))).toMatch(/permission denied/)
    expect(await errorOf(h.rpc(null, 'search_schools', { q: 'ata' }))).toMatch(/permission denied/)
  })

  test('a paused student can read but not write through RPCs', async () => {
    await h.db.query(`update lugu.profiles set status = 'paused' where user_id = $1`, [a.id])
    try {
      expect(await errorOf(h.rpc(a.id, 'complete_section', { session_id: sessionA, section: 'vocab_quiz' }))).toBe(
        'LUGU_ACCOUNT_INACTIVE',
      )
      const home = await h.rpc<{ profile: { status: string } }>(a.id, 'student_home')
      expect(home.profile.status).toBe('paused')
    } finally {
      await h.db.query(`update lugu.profiles set status = 'active' where user_id = $1`, [a.id])
    }
  })
})

describe('admin', () => {
  test('admin can CRUD admin tables', async () => {
    await h.as(admin, async (tx) => {
      const c = await tx.query<{ id: string }>(`insert into lugu.curricula (name) values ('Admin made') returning id`)
      const id = c.rows[0]!.id
      await tx.query(`update lugu.curricula set description = 'edited' where id = $1`, [id])
      const v = await tx.query<{ id: string }>(`insert into lugu.curriculum_versions (curriculum_id, version) values ($1, 1) returning id`, [id])
      await tx.query(`insert into lugu.curriculum_lessons (version_id, sequence, title) values ($1, 1, 'L')`, [v.rows[0]!.id])
      await tx.query(`insert into lugu.ai_jobs (kind) values ('lesson_package')`)
      await tx.query(`insert into lugu.weekly_learning_reports (student_id, week_start) values ($1, '2026-11-16')`, [a.id])
      await tx.query(`update lugu.system_settings set value = '0.25' where key = 'academic.wrong_penalty'`)
      const del = await tx.query(`delete from lugu.curricula where id = $1`, [id])
      expect(del.affectedRows).toBe(1)
    })
    expect(await count(admin, 'select * from lugu.lesson_content_packages')).toBe(2)
    expect(await count(admin, 'select * from lugu.learning_sessions')).toBe(2)
    expect(await count(admin, 'select * from lugu.student_learning_profiles')).toBe(1)
  })

  test('admin cannot rewrite history tables directly', async () => {
    const r = await h
      .as(admin, async (tx) => (await tx.query(`delete from lugu.question_attempts`)).affectedRows ?? 0)
      .catch((e: Error) => e.message)
    expect(String(r)).toMatch(/permission denied/)
    const p = await h
      .as(admin, async (tx) => (await tx.query(`update lugu.program_events set note = 'x'`)).affectedRows ?? 0)
      .catch((e: Error) => e.message)
    expect(String(p)).toMatch(/permission denied/)
  })

  test('a disabled admin loses admin rights', async () => {
    const other = await h.createAdmin()
    await h.db.query(`update lugu.profiles set status = 'disabled' where user_id = $1`, [other])
    expect(await count(other, 'select * from lugu.lesson_content_packages')).toBe(0)
    expect(await h.rpc(other, 'is_admin')).toBe(false)
  })
})
