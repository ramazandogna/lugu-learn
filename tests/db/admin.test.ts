import { beforeAll, describe, expect, test } from 'vitest'
import { createHarness, errorOf, type Harness } from './harness'
import { createProgram, playThrough, testPackage, type Program, type SessionPayload } from './fixtures'

interface Assignment {
  id: string
  status: string
  current_lesson_id: string | null
}

let h: Harness
let admin: string
let student: { id: string; code: string }
let program: Program
let assignment: Assignment

const scalar = async <T>(sql: string, params: unknown[] = []) =>
  (await h.db.query<{ v: T }>(sql, params)).rows[0]!.v

beforeAll(async () => {
  h = await createHarness()
  admin = await h.createAdmin()
  student = await h.createStudent()
  program = await createProgram(h, 3)
  assignment = await h.rpc<Assignment>(admin, 'admin_assign_program', { student_id: student.id, version_id: program.versionId })
})

describe('admin_assign_program', () => {
  test('rejects duplicates, drafts and foreign lessons; logs an event and an audit row', async () => {
    expect(await errorOf(h.rpc(admin, 'admin_assign_program', { student_id: student.id, version_id: program.versionId }))).toBe(
      'LUGU_ALREADY_ASSIGNED',
    )
    const other = await createProgram(h, 1)
    expect(
      await errorOf(
        h.rpc(admin, 'admin_assign_program', {
          student_id: student.id,
          version_id: program.versionId,
          start_lesson_id: other.lessonIds[0],
        }),
      ),
    ).toBe('LUGU_LESSON_NOT_IN_PROGRAM')
    const draft = await h.rpc<{ id: string }>(admin, 'admin_new_version', { curriculum_id: other.curriculumId })
    expect(await errorOf(h.rpc(admin, 'admin_assign_program', { student_id: student.id, version_id: draft.id }))).toBe(
      'LUGU_VERSION_NOT_PUBLISHED',
    )
    expect(await scalar<number>(`select count(*)::int as v from lugu.program_events where assignment_id = $1 and kind = 'assigned'`, [assignment.id])).toBe(1)
    expect(await scalar<number>(`select count(*)::int as v from lugu.admin_audit_logs where action = 'admin_assign_program' and actor_id = $1`, [admin])).toBe(1)
  })
})

describe('admin_set_progress', () => {
  test('forward/backward/set_lesson move the current lesson, log events, never delete history', async () => {
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    await h.rpc(student.id, 'complete_section', { session_id: s.session.id, section: 'vocabulary' })
    await h.rpc(student.id, 'record_vocab_answer', { session_id: s.session.id, item_id: 'wake-up', direction: 'en_tr', chosen: 'uyanmak' })

    let a = await h.rpc<Assignment>(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'forward', note: 'skip' })
    expect(a.current_lesson_id).toBe(program.lessonIds[1])
    // The session on the lesson the student left is abandoned, its attempts kept.
    expect(await scalar<string>(`select status as v from lugu.learning_sessions where id = $1`, [s.session.id])).toBe('abandoned')
    expect(await scalar<number>(`select count(*)::int as v from lugu.question_attempts where session_id = $1`, [s.session.id])).toBe(1)
    expect(await errorOf(h.rpc(student.id, 'complete_section', { session_id: s.session.id, section: 'vocab_quiz' }))).toBe(
      'LUGU_SESSION_NOT_ACTIVE',
    )

    a = await h.rpc<Assignment>(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'backward' })
    expect(a.current_lesson_id).toBe(program.lessonIds[0])
    expect(await errorOf(h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'backward' }))).toBe(
      'LUGU_NO_PREVIOUS_LESSON',
    )
    a = await h.rpc<Assignment>(admin, 'admin_set_progress', {
      assignment_id: assignment.id,
      action: 'set_lesson',
      lesson_id: program.lessonIds[2],
    })
    expect(a.current_lesson_id).toBe(program.lessonIds[2])
    expect(await errorOf(h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'forward' }))).toBe(
      'LUGU_NO_NEXT_LESSON',
    )
    expect(await errorOf(h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'teleport' }))).toBe(
      'LUGU_INVALID_ARGUMENT',
    )
    await h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'set_lesson', lesson_id: program.lessonIds[0] })

    const events = await h.db.query<{ kind: string; note: string | null }>(
      `select kind, note from lugu.program_events where assignment_id = $1 order by created_at, kind`,
      [assignment.id],
    )
    expect(events.rows.map((e) => e.kind)).toEqual(['assigned', 'forward', 'backward', 'set_lesson', 'set_lesson'])
    expect(events.rows[1]!.note).toBe('skip')
    expect(await scalar<number>(`select count(*)::int as v from lugu.admin_audit_logs where action = 'admin_set_progress'`)).toBe(4)
  })

  test('pause blocks the student, resume restores; restart abandons the session but keeps attempts and mastery', async () => {
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    await h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'pause' })
    expect(await errorOf(h.rpc(student.id, 'complete_section', { session_id: s.session.id, section: 'vocabulary' }))).toBe(
      'LUGU_ASSIGNMENT_NOT_ACTIVE',
    )
    expect(await errorOf(h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'pause' }))).toBe(
      'LUGU_INVALID_STATUS_TRANSITION',
    )
    await h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'resume' })
    await h.rpc(student.id, 'complete_section', { session_id: s.session.id, section: 'vocabulary' })
    await h.rpc(student.id, 'record_vocab_answer', { session_id: s.session.id, item_id: 'wake-up', direction: 'en_tr', chosen: 'uyanmak' })

    await h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'restart_lesson' })
    expect(await scalar<string>(`select status as v from lugu.learning_sessions where id = $1`, [s.session.id])).toBe('abandoned')
    expect(await scalar<number>(`select count(*)::int as v from lugu.question_attempts where session_id = $1`, [s.session.id])).toBe(1)
    const fresh = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    expect(fresh.session.id).not.toBe(s.session.id)
    expect(fresh.sections.every((x) => x.status === 'not_started')).toBe(true)
    // Both earlier sessions answered wake-up correctly once: 2 correct since the last miss → mastered.
    expect(await scalar<boolean>(`select mastered_at is not null as v from lugu.vocabulary_mastery where item_id = 'wake-up'`)).toBe(true)
  })

  test('moving back to a completed lesson: taken again, second record, no second reward', async () => {
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    await playThrough(h, student.id, s.session.id)
    await h.rpc(student.id, 'complete_lesson', { session_id: s.session.id })
    const xp = await scalar<number>(`select sum(amount)::int as v from lugu.progress_rewards where student_id = $1`, [student.id])

    await h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'backward' })
    const map = await h.rpc<{ lessons: { state: string }[] }>(student.id, 'student_learning_map', { assignment_id: assignment.id })
    expect(map.lessons[0]!.state).toBe('current')
    const again = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    expect(again.session.kind).toBe('primary')
    await playThrough(h, student.id, again.session.id)
    const r = await h.rpc<{ xp_awarded: number; next_lesson_id: string }>(student.id, 'complete_lesson', { session_id: again.session.id })
    expect(r).toMatchObject({ xp_awarded: 0, next_lesson_id: program.lessonIds[1] })
    expect(await scalar<number>(`select count(*)::int as v from lugu.lesson_completion_records where lesson_id = $1`, [program.lessonIds[0]])).toBe(2)
    expect(await scalar<number>(`select sum(amount)::int as v from lugu.progress_rewards where student_id = $1`, [student.id])).toBe(xp)
  })

  test('archive abandons sessions and freezes the assignment', async () => {
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[1] })
    await h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'archive' })
    expect(await scalar<string>(`select status as v from lugu.learning_sessions where id = $1`, [s.session.id])).toBe('abandoned')
    expect(await errorOf(h.rpc(admin, 'admin_set_progress', { assignment_id: assignment.id, action: 'resume' }))).toBe(
      'LUGU_ASSIGNMENT_ARCHIVED',
    )
    expect(await errorOf(h.rpc(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[1] }))).toBe(
      'LUGU_LESSON_NOT_ASSIGNED',
    )
    // Reassigning is a new assignment; the old one and its history stay.
    const re = await h.rpc<Assignment>(admin, 'admin_assign_program', { student_id: student.id, version_id: program.versionId })
    expect(re.id).not.toBe(assignment.id)
    expect(await scalar<number>(`select count(*)::int as v from lugu.lesson_completion_records where assignment_id = $1`, [assignment.id])).toBe(2)
  })
})

describe('packages and versions', () => {
  test('publishing requires approved, archives the previous revision; published content is immutable', async () => {
    const lessonId = program.lessonIds[2]!
    const draft = await h.as(admin, async (tx) =>
      (
        await tx.query<{ id: string; revision: number }>(
          `insert into lugu.lesson_content_packages (lesson_id, content) values ($1, $2) returning id, revision`,
          [lessonId, JSON.stringify(testPackage('Revision 2'))],
        )
      ).rows[0]!,
    )
    expect(draft.revision).toBe(2)
    expect(await errorOf(h.rpc(admin, 'admin_set_package_status', { package_id: draft.id, status: 'published' }))).toBe(
      'LUGU_INVALID_STATUS_TRANSITION',
    )
    for (const st of ['qa', 'review', 'approved', 'published']) {
      await h.rpc(admin, 'admin_set_package_status', { package_id: draft.id, status: st })
    }
    expect(await scalar<string>(`select status as v from lugu.lesson_content_packages where id = $1`, [program.packageIds[2]])).toBe('archived')
    expect(await scalar<string>(`select status as v from lugu.lesson_content_packages where id = $1`, [draft.id])).toBe('published')
    expect(
      await errorOf(h.as(admin, (tx) => tx.query(`update lugu.lesson_content_packages set content = '{}' where id = $1`, [draft.id]))),
    ).toBe('LUGU_PACKAGE_IMMUTABLE')
    expect(await errorOf(h.rpc(admin, 'admin_set_package_status', { package_id: draft.id, status: 'draft' }))).toBe(
      'LUGU_INVALID_STATUS_TRANSITION',
    )
    expect(await scalar<number>(`select count(*)::int as v from lugu.admin_audit_logs where action = 'admin_set_package_status'`)).toBe(4)
  })

  test('malformed content cannot be published', async () => {
    const id = await scalar<string>(
      `insert into lugu.lesson_content_packages (lesson_id, status, content) values ($1, 'approved', '{"schemaVersion":1}') returning id as v`,
      [program.lessonIds[1]],
    )
    expect(await errorOf(h.rpc(admin, 'admin_set_package_status', { package_id: id, status: 'published' }))).toBe('LUGU_PACKAGE_INVALID')
  })

  test('published version lessons cannot be reordered or removed; new version copies lessons and packages', async () => {
    expect(
      await errorOf(h.as(admin, (tx) => tx.query(`update lugu.curriculum_lessons set sequence = 9 where id = $1`, [program.lessonIds[0]]))),
    ).toBe('LUGU_VERSION_LOCKED')
    expect(await errorOf(h.as(admin, (tx) => tx.query(`delete from lugu.curriculum_lessons where id = $1`, [program.lessonIds[0]])))).toBe(
      'LUGU_VERSION_LOCKED',
    )
    await h.as(admin, (tx) => tx.query(`update lugu.curriculum_lessons set title = 'Renamed' where id = $1`, [program.lessonIds[0]]))

    const v2 = await h.rpc<{ id: string; version: number; status: string }>(admin, 'admin_new_version', {
      curriculum_id: program.curriculumId,
    })
    expect(v2).toMatchObject({ version: 2, status: 'draft' })
    expect(await scalar<number>(`select count(*)::int as v from lugu.curriculum_lessons where version_id = $1`, [v2.id])).toBe(3)
    expect(
      await scalar<number>(
        `select count(*)::int as v from lugu.lesson_content_packages p join lugu.curriculum_lessons l on l.id = p.lesson_id
         where l.version_id = $1 and p.status = 'published'`,
        [v2.id],
      ),
    ).toBe(3)
    await h.as(admin, (tx) => tx.query(`update lugu.curriculum_lessons set sequence = sequence + 10 where version_id = $1`, [v2.id]))
    const published = await h.rpc<{ status: string }>(admin, 'admin_publish_version', { version_id: v2.id })
    expect(published.status).toBe('published')
    expect(await errorOf(h.rpc(admin, 'admin_publish_version', { version_id: v2.id }))).toBe('LUGU_INVALID_STATUS_TRANSITION')
    expect(
      await errorOf(h.as(admin, (tx) => tx.query(`update lugu.curriculum_versions set status = 'draft' where id = $1`, [v2.id]))),
    ).toBe('LUGU_INVALID_STATUS_TRANSITION')
  })
})

describe('schools', () => {
  test('add_school dedupes by Turkish-aware key; search_schools matches "30 agustos"', async () => {
    const s1 = await h.rpc<{ id: string; name: string }>(student.id, 'add_school', {
      name: '30 Ağustos Ortaokulu',
      city: 'İzmir',
      district: 'Karşıyaka',
    })
    const s2 = await h.rpc<{ id: string }>(student.id, 'add_school', {
      name: '  30 agustos   ortaokulu. ',
      city: 'IZMIR',
      district: 'karsiyaka',
    })
    expect(s2.id).toBe(s1.id)
    await h.rpc(admin, 'add_school', { name: 'Atatürk Ortaokulu', city: 'Ankara' })
    const hits = await h.rpcRows<{ id: string; name: string }>(student.id, 'search_schools', { q: '30 agustos' })
    expect(hits.map((x) => x.id)).toEqual([s1.id])
    expect((await h.rpcRows(student.id, 'search_schools', { q: 'ORTAOKULU' })).length).toBe(2)
    expect((await h.rpcRows(student.id, 'search_schools', { q: 'ataturk' })).length).toBe(1)
    expect((await h.rpcRows(student.id, 'search_schools', { q: 'a' })).length).toBe(0)
    expect(await errorOf(h.rpc(student.id, 'add_school', { name: ' ', city: 'Ankara' }))).toBe('LUGU_INVALID_ARGUMENT')
  })

  test('admin_merge_schools repoints students, hides the merged school, and add_school returns the survivor', async () => {
    const dup = await h.rpc<{ id: string }>(admin, 'add_school', { name: 'Ataturk Orta Okulu', city: 'Ankara' })
    const keep = (await h.rpcRows<{ id: string }>(admin, 'search_schools', { q: 'atatürk ortaokulu' }))[0]!
    await h.rpc(student.id, 'update_my_profile', { school_id: dup.id })
    await h.rpc(admin, 'admin_merge_schools', { from_id: dup.id, into_id: keep.id })
    expect(await scalar<string>(`select school_id as v from lugu.student_profiles where user_id = $1`, [student.id])).toBe(keep.id)
    expect((await h.rpcRows<{ id: string }>(student.id, 'search_schools', { q: 'ataturk orta okulu' })).map((x) => x.id)).not.toContain(dup.id)
    const again = await h.rpc<{ id: string }>(student.id, 'add_school', { name: 'Atatürk Orta Okulu', city: 'Ankara' })
    expect(again.id).toBe(keep.id)
    expect(await scalar<number>(`select count(*)::int as v from lugu.admin_audit_logs where action = 'admin_merge_schools'`)).toBe(1)
  })
})

describe('profile and password', () => {
  test('update_my_profile sets only permitted fields and marks completion', async () => {
    const fresh = await h.createStudent()
    const school = await h.rpc<{ id: string }>(fresh.id, 'add_school', { name: 'Demo Okulu', city: 'Bursa' })
    let p = await h.rpc<{ profile_completed_at: string | null }>(fresh.id, 'update_my_profile', { first_name: 'Deniz', grade: 6 })
    expect(p.profile_completed_at).toBeNull()
    p = await h.rpc(fresh.id, 'update_my_profile', { school_id: school.id, avatar_key: 'fox' })
    expect(p.profile_completed_at).not.toBeNull()
    expect(await errorOf(h.rpc(fresh.id, 'update_my_profile', { grade: 13 }))).toBe('LUGU_INVALID_PROFILE')
    expect(await errorOf(h.rpc(admin, 'update_my_profile', { grade: 5 }))).toBe('LUGU_NOT_STUDENT')
  })

  test('mark_password_changed clears only the caller’s flag', async () => {
    const x = await h.createStudent()
    const y = await h.createStudent()
    await h.rpc(x.id, 'mark_password_changed')
    expect(await scalar<boolean>(`select must_change_password as v from lugu.profiles where user_id = $1`, [x.id])).toBe(false)
    expect(await scalar<boolean>(`select must_change_password as v from lugu.profiles where user_id = $1`, [y.id])).toBe(true)
    expect(await errorOf(h.rpc(null, 'mark_password_changed'))).toMatch(/permission denied/)
  })

  test('next_student_code is sequential from 1001 and service-role only', async () => {
    const fresh = await createHarness()
    expect(await fresh.db.query<{ c: string }>(`select lugu.next_student_code() as c`).then((r) => r.rows[0]!.c)).toBe('LUGU-1001')
    const code = await fresh.db.transaction(async (tx) => {
      await tx.exec('set local role service_role')
      return (await tx.query<{ c: string }>(`select lugu.next_student_code() as c`)).rows[0]!.c
    })
    expect(code).toBe('LUGU-1002')
  })
})

describe('academic', () => {
  test('net = correct − incorrect × wrong_penalty, recomputed on update; counts cannot exceed total', async () => {
    const examId = await h.as(admin, async (tx) =>
      (
        await tx.query<{ id: string }>(
          `insert into lugu.school_exams (student_id, title, exam_date) values ($1, 'Deneme 1', '2026-11-20') returning id`,
          [student.id],
        )
      ).rows[0]!.id,
    )
    const subject = await scalar<string>(`select id as v from lugu.school_subjects where name = 'Matematik'`)
    const net = await h.as(admin, async (tx) =>
      (
        await tx.query<{ net: string }>(
          `insert into lugu.school_exam_results (exam_id, subject_id, total, correct, incorrect, blank) values ($1, $2, 20, 14, 4, 2) returning net`,
          [examId, subject],
        )
      ).rows[0]!.net,
    )
    expect(Number(net)).toBe(13)
    await h.db.query(`update lugu.system_settings set value = '0.333' where key = 'academic.wrong_penalty'`)
    const updated = await scalar<string>(`update lugu.school_exam_results set incorrect = 3 where exam_id = $1 returning net as v`, [examId])
    expect(Number(updated)).toBe(13)
    expect(
      await errorOf(
        h.as(admin, (tx) =>
          tx.query(`insert into lugu.school_exam_results (exam_id, subject_id, total, correct, incorrect, blank)
                    select $1, id, 10, 8, 3, 0 from lugu.school_subjects where name = 'Türkçe'`, [examId]),
        ),
      ),
    ).toMatch(/school_exam_results_counts/)
  })
})

describe('data deletion', () => {
  test('deleting the auth user cascades every student row; the request and audit rows survive', async () => {
    const victim = await h.createStudent()
    await h.rpc(admin, 'admin_assign_program', { student_id: victim.id, version_id: program.versionId })
    const s = await h.rpc<SessionPayload>(victim.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    await playThrough(h, victim.id, s.session.id)
    await h.rpc(victim.id, 'complete_lesson', { session_id: s.session.id })
    const req = await scalar<string>(
      `insert into lugu.data_deletion_requests (student_id, student_code, status, approved_by, approved_at)
       values ($1, $2, 'approved', $3, now()) returning id as v`,
      [victim.id, victim.code, admin],
    )
    await h.db.query(`delete from auth.users where id = $1`, [victim.id])
    const left = await scalar<number>(
      `select (select count(*) from lugu.profiles where user_id = $1) + (select count(*) from lugu.question_attempts where student_id = $1)
            + (select count(*) from lugu.progress_rewards where student_id = $1) + (select count(*) from lugu.program_assignments where student_id = $1)
            + (select count(*) from lugu.lesson_completion_records where student_id = $1) as v`,
      [victim.id],
    )
    expect(Number(left)).toBe(0)
    expect(await scalar<number>(`select count(*)::int as v from lugu.data_deletion_requests where id = $1`, [req])).toBe(1)
  })
})
