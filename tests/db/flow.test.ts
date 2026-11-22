import { beforeAll, describe, expect, test } from 'vitest'
import type { LessonPackage } from '@/domain/content'
import { createHarness, errorOf, type Harness } from './harness'
import { correctAssessment, createProgram, playThrough, type Program, type SessionPayload } from './fixtures'

let h: Harness
let admin: string
let student: { id: string; code: string }
let program: Program
let assignmentId: string
let sessionId: string

const call = <T = unknown>(name: string, args: Record<string, unknown> = {}) =>
  h.rpc<T>(student.id, name, { session_id: sessionId, ...args })
const vocab = (item_id: string, chosen: string) =>
  call<{ correct: boolean; mastered: boolean; correct_count: number }>('record_vocab_answer', {
    item_id,
    direction: 'en_tr',
    chosen,
  })
const mastery = async (item: string) =>
  (
    await h.db.query<{ correct_count: number; incorrect_count: number; mastered: boolean }>(
      `select correct_count, incorrect_count, mastered_at is not null as mastered from lugu.vocabulary_mastery
       where student_id = $1 and item_id = $2 and package_id = $3`,
      [student.id, item, program.packageIds[0]],
    )
  ).rows[0]

interface LessonResult {
  completed: boolean
  already_completed: boolean
  kind: string
  xp_awarded: number
  next_lesson_id: string | null
  assignment_status: string
  achievements: string[]
}

beforeAll(async () => {
  h = await createHarness()
  admin = await h.createAdmin()
  student = await h.createStudent()
  program = await createProgram(h, 2)
})

describe('primary lesson flow', () => {
  test('assign → map shows first lesson current, others locked', async () => {
    const a = await h.rpc<{ id: string; current_lesson_id: string }>(admin, 'admin_assign_program', {
      student_id: student.id,
      version_id: program.versionId,
    })
    assignmentId = a.id
    expect(a.current_lesson_id).toBe(program.lessonIds[0])
    const map = await h.rpc<{ lessons: { state: string; tagline: string }[] }>(student.id, 'student_learning_map', {
      assignment_id: assignmentId,
    })
    expect(map.lessons.map((l) => l.state)).toEqual(['current', 'locked'])
    expect(map.lessons[0]!.tagline).toBe('Sabah rutinini anlat')
    expect(await errorOf(h.rpc(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[1] }))).toBe(
      'LUGU_LESSON_LOCKED',
    )
    expect(await errorOf(h.rpc(student.id, 'student_lesson_content', { lesson_id: program.lessonIds[1] }))).toBe(
      'LUGU_LESSON_LOCKED',
    )
  })

  test('start_or_resume_session creates once and resumes', async () => {
    const first = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] })
    sessionId = first.session.id
    expect(first.session.kind).toBe('primary')
    expect(first.sections.map((s) => s.section)).toEqual([
      'review', 'vocabulary', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment',
    ])
    const again = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', {
      lesson_id: program.lessonIds[0],
      kind: 'primary',
    })
    expect(again.session.id).toBe(sessionId)
    expect(await errorOf(h.rpc(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0], kind: 'replay' }))).toBe(
      'LUGU_REPLAY_NOT_AVAILABLE',
    )
  })

  test('student_lesson_content strips assessment keys only', async () => {
    const res = await h.rpc<{ package_id: string; content: LessonPackage }>(student.id, 'student_lesson_content', {
      lesson_id: program.lessonIds[0],
    })
    expect(res.package_id).toBe(program.packageIds[0])
    const quiz = res.content.assessment.quiz as unknown as Record<string, unknown>[]
    for (const q of [...quiz, ...(res.content.assessment.reading.questions as unknown as Record<string, unknown>[])]) {
      expect(q).not.toHaveProperty('answer')
      expect(q).not.toHaveProperty('accept')
      expect(q).not.toHaveProperty('hint')
      expect(q).not.toHaveProperty('explain')
    }
    expect([...(quiz[2]!.tokens as string[])].sort()).toEqual(['I', 'brush', 'my', 'teeth'])
    // Practice sections keep their keys for instant feedback.
    expect(res.content.story.questions[0]).toHaveProperty('answer', 0)
    expect(res.content.homework.groups[0]!.complete).toHaveProperty('accept')
  })

  test('mandatory sections cannot be completed or answered out of order; review never blocks', async () => {
    expect(await errorOf(call('complete_section', { section: 'story' }))).toBe('LUGU_SECTION_LOCKED')
    expect(await errorOf(vocab('wake-up', 'uyanmak'))).toBe('LUGU_SECTION_LOCKED')
    expect(await errorOf(call('record_answer', { section: 'homework', question_id: 'hw-1-c', response: 'have' }))).toBe(
      'LUGU_SECTION_LOCKED',
    )
    expect(await errorOf(call('save_section_state', { section: 'assessment', state: {} }))).toBe('LUGU_SECTION_LOCKED')
    expect(await errorOf(call('complete_section', { section: 'nope' }))).toBe('LUGU_INVALID_SECTION')
    const r = await call<{ correct: boolean }>('record_answer', { section: 'review', question_id: 'rv-1', response: 0 })
    expect(r.correct).toBe(true)
    await call('save_section_state', { section: 'vocabulary', state: { index: 2 }, active_seconds_delta: 30 })
    await call('complete_section', { section: 'vocabulary' })
  })

  test('vocab: two correct since the last miss masters; a miss resets the count; mastered stays mastered', async () => {
    expect(await vocab('wake-up', 'uyanmak')).toMatchObject({ correct: true, mastered: false, correct_count: 1 })
    expect(await vocab('wake-up', 'yanlış')).toMatchObject({ correct: false, mastered: false, correct_count: 0 })
    expect(await vocab('wake-up', ' Uyanmak. ')).toMatchObject({ correct: true, mastered: false, correct_count: 1 })
    expect(await errorOf(call('complete_section', { section: 'vocab_quiz' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
    expect(await vocab('wake-up', 'uyanmak')).toMatchObject({ correct: true, mastered: true, correct_count: 2 })
    expect(await mastery('wake-up')).toEqual({ correct_count: 2, incorrect_count: 1, mastered: true })
    expect(await vocab('wake-up', 'yanlış')).toMatchObject({ correct: false, mastered: true, correct_count: 0 })
    expect(await mastery('wake-up')).toEqual({ correct_count: 0, incorrect_count: 2, mastered: true })

    const tr = await h.rpc<{ correct: boolean }>(student.id, 'record_vocab_answer', {
      session_id: sessionId,
      item_id: 'have-breakfast',
      direction: 'tr_en',
      chosen: 'Have breakfast',
    })
    expect(tr.correct).toBe(true)
    await vocab('have-breakfast', 'kahvaltı yapmak')
    expect(await errorOf(vocab('unknown-item', 'x'))).toBe('LUGU_ITEM_NOT_FOUND')
    expect(await errorOf(call('complete_section', { section: 'vocab_quiz' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
    await vocab('brush-teeth', 'dişlerimi fırçalamak')
    await vocab('brush-teeth', 'dişlerimi fırçalamak')
    const done = await call<{ status: string }>('complete_section', { section: 'vocab_quiz' })
    expect(done.status).toBe('completed')
    const attempts = await h.db.query<{ n: number }>(
      `select count(*)::int as n from lugu.question_attempts where session_id = $1 and section = 'vocab_quiz'`,
      [sessionId],
    )
    expect(attempts.rows[0]!.n).toBe(9)
  })

  test('story requires every question attempted; record_answer grades server-side', async () => {
    const r = await call<{ correct: boolean; expected: unknown }>('record_answer', {
      section: 'story',
      question_id: 'st-1',
      response: 1,
    })
    expect(r).toMatchObject({ correct: false, expected: 0 })
    expect(await errorOf(call('complete_section', { section: 'story' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
    expect(await errorOf(call('record_answer', { section: 'story', question_id: 'as-1', response: 1 }))).toBe(
      'LUGU_QUESTION_NOT_FOUND',
    )
    const t = await call<{ correct: boolean; expected: unknown }>('record_answer', {
      section: 'story',
      question_id: 'st-2',
      response: 'Morning!',
    })
    expect(t).toMatchObject({ correct: true, expected: 'morning' })
    await call('complete_section', { section: 'story' })
    await call('record_answer', { section: 'explanation', question_id: 'ex-1-check', response: 0 })
    await call('complete_section', { section: 'explanation' })
  })

  test('homework requires each question correct at least once', async () => {
    await call('record_answer', { section: 'homework', question_id: 'hw-1-c', response: 'has' })
    await call('record_answer', { section: 'homework', question_id: 'hw-1-o', response: ['I', 'have', 'breakfast'] })
    await call('record_answer', { section: 'homework', question_id: 'hw-1-m', response: 0 })
    expect(await errorOf(call('complete_section', { section: 'homework' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
    await call('record_answer', { section: 'homework', question_id: 'hw-1-c', response: 'have' })
    await call('complete_section', { section: 'homework' })
  })

  test('assessment: graded on submit, once; required before completing the section and the lesson', async () => {
    expect(await errorOf(call('record_answer', { section: 'assessment', question_id: 'as-1', response: 1 }))).toBe(
      'LUGU_USE_SUBMIT_ASSESSMENT',
    )
    expect(await errorOf(call('complete_section', { section: 'assessment' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
    expect(await errorOf(call('complete_lesson'))).toBe('LUGU_LESSON_INCOMPLETE')
    const score = await call<{ percent: number; quiz_correct: number; reading_correct: number; results: unknown[] }>(
      'submit_assessment',
      { answers: { ...correctAssessment, 'rd-2': 0 } },
    )
    expect(score).toMatchObject({ quiz_correct: 3, reading_correct: 1, percent: 80 })
    expect(score.results).toHaveLength(5)
    expect(await errorOf(call('submit_assessment', { answers: correctAssessment }))).toBe('LUGU_ASSESSMENT_ALREADY_SUBMITTED')
    await call('complete_section', { section: 'assessment' })
  })

  test('breaks and session events are recorded', async () => {
    const b = await call<{ id: string; planned_minutes: number }>('start_break', { after_section: 'homework', planned_minutes: 10 })
    expect(await errorOf(call('start_break', { after_section: 'homework', planned_minutes: 10 }))).toBe('LUGU_BREAK_ALREADY_OPEN')
    expect(await errorOf(call('start_break', { after_section: 'homework', planned_minutes: 7 }))).toBe('LUGU_INVALID_ARGUMENT')
    const ended = await h.rpc<{ ended_at: string; early_return: boolean }>(student.id, 'end_break', { break_id: b.id })
    expect(ended.early_return).toBe(true)
    await call('record_session_event', { kind: 'visibility_hidden', data: { at: 1 } })
    await call('record_session_event', { kind: 'idle_end', data: { idle_seconds: 45 } })
    expect(await errorOf(call('record_session_event', { kind: 'hacked' }))).toBe('LUGU_INVALID_ARGUMENT')
    const s = await h.db.query<{ idle_seconds: number; active_seconds: number }>(
      `select idle_seconds, active_seconds from lugu.learning_sessions where id = $1`,
      [sessionId],
    )
    expect(s.rows[0]).toEqual({ idle_seconds: 45, active_seconds: 30 })
  })

  test('complete_lesson writes the record, grants XP, advances; second call is idempotent', async () => {
    const r = await call<LessonResult>('complete_lesson')
    expect(r).toMatchObject({
      completed: true,
      already_completed: false,
      kind: 'primary',
      next_lesson_id: program.lessonIds[1],
      assignment_status: 'active',
    })
    expect(r.xp_awarded).toBe(120)
    expect(r.achievements).toEqual(['first_lesson'])
    const again = await call<LessonResult>('complete_lesson')
    expect(again).toMatchObject({ already_completed: true, xp_awarded: 0 })
    const rec = await h.db.query<{ n: number }>(`select count(*)::int as n from lugu.lesson_completion_records`)
    expect(rec.rows[0]!.n).toBe(1)
    const home = await h.rpc<{ xp: number; assignments: { lessons_completed: number; current_lesson: { id: string } }[] }>(
      student.id,
      'student_home',
    )
    expect(home.xp).toBe(120)
    expect(home.assignments[0]!.lessons_completed).toBe(1)
    expect(home.assignments[0]!.current_lesson.id).toBe(program.lessonIds[1])
    expect(await errorOf(call('complete_section', { section: 'vocabulary' }))).toBe('LUGU_SESSION_NOT_ACTIVE')
    const map = await h.rpc<{ lessons: { state: string; replay_available: boolean }[] }>(student.id, 'student_learning_map', {
      assignment_id: assignmentId,
    })
    expect(map.lessons.map((l) => l.state)).toEqual(['completed', 'current'])
    expect(await errorOf(h.rpc(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[0] }))).toBe(
      'LUGU_USE_REPLAY',
    )
  })

  test('replay records attempts but never changes mastery, completion, rewards or the assignment', async () => {
    const before = await h.db.query(
      `select (select json_agg(m order by item_id) from lugu.vocabulary_mastery m) as m,
              (select count(*) from lugu.lesson_completion_records) as c,
              (select sum(amount) from lugu.progress_rewards) as xp,
              (select current_lesson_id from lugu.program_assignments where id = $1) as cur`,
      [assignmentId],
    )
    const replay = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', {
      lesson_id: program.lessonIds[0],
      kind: 'replay',
    })
    expect(replay.session.kind).toBe('replay')
    const replayCall = (name: string, args: Record<string, unknown>) =>
      h.rpc<{ correct_count: number; mastered: boolean }>(student.id, name, { session_id: replay.session.id, ...args })
    await replayCall('complete_section', { section: 'vocabulary' })
    // Replay mastery is derived from the replay's own attempts.
    await replayCall('record_vocab_answer', { item_id: 'wake-up', direction: 'en_tr', chosen: 'wrong' })
    expect(await errorOf(replayCall('complete_section', { section: 'vocab_quiz' }))).toBe('LUGU_SECTION_CRITERIA_NOT_MET')
    // vocabulary is already completed; playThrough's complete_section on it is idempotent.
    await playThrough(h, student.id, replay.session.id)
    const r = await h.rpc<LessonResult>(student.id, 'complete_lesson', { session_id: replay.session.id })
    expect(r).toMatchObject({ kind: 'replay', xp_awarded: 0, next_lesson_id: program.lessonIds[1] })
    const after = await h.db.query(
      `select (select json_agg(m order by item_id) from lugu.vocabulary_mastery m) as m,
              (select count(*) from lugu.lesson_completion_records) as c,
              (select sum(amount) from lugu.progress_rewards) as xp,
              (select current_lesson_id from lugu.program_assignments where id = $1) as cur`,
      [assignmentId],
    )
    expect(after.rows).toEqual(before.rows)
    const attempts = await h.db.query<{ n: number }>(`select count(*)::int as n from lugu.question_attempts where session_id = $1`, [
      replay.session.id,
    ])
    expect(attempts.rows[0]!.n).toBeGreaterThan(9)
  })

  test('last lesson completes the program; replay stays available', async () => {
    const s = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', { lesson_id: program.lessonIds[1] })
    await playThrough(h, student.id, s.session.id)
    const r = await h.rpc<LessonResult>(student.id, 'complete_lesson', { session_id: s.session.id })
    expect(r).toMatchObject({ assignment_status: 'completed', next_lesson_id: null })
    const replay = await h.rpc<SessionPayload>(student.id, 'start_or_resume_session', {
      lesson_id: program.lessonIds[1],
      kind: 'replay',
    })
    expect(replay.session.kind).toBe('replay')
  })
})

describe('completion rules', () => {
  test('minAssessmentPercent blocks completion below the threshold', async () => {
    const h2 = await createHarness()
    const adm = await h2.createAdmin()
    const st = await h2.createStudent()
    const p = await createProgram(h2, 1, { minAssessmentPercent: 90 })
    await h2.rpc(adm, 'admin_assign_program', { student_id: st.id, version_id: p.versionId })
    const s = await h2.rpc<SessionPayload>(st.id, 'start_or_resume_session', { lesson_id: p.lessonIds[0] })
    await playThrough(h2, st.id, s.session.id, { ...correctAssessment, 'rd-2': 0 })
    expect(await errorOf(h2.rpc(st.id, 'complete_lesson', { session_id: s.session.id }))).toBe('LUGU_ASSESSMENT_BELOW_MINIMUM')
  })

  test('a lesson without a published package cannot be started', async () => {
    const h2 = await createHarness()
    const adm = await h2.createAdmin()
    const st = await h2.createStudent()
    const p = await createProgram(h2, 1)
    await h2.db.query(`update lugu.lesson_content_packages set status = 'archived'`)
    await h2.rpc(adm, 'admin_assign_program', { student_id: st.id, version_id: p.versionId })
    expect(await errorOf(h2.rpc(st.id, 'start_or_resume_session', { lesson_id: p.lessonIds[0] }))).toBe(
      'LUGU_NO_PUBLISHED_PACKAGE',
    )
  })
})
