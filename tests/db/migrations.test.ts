import { describe, expect, test } from 'vitest'
import { LessonPackage } from '@/domain/content'
import { createHarness } from './harness'

describe('migrations', () => {
  test('apply cleanly and enable RLS on every lugu table', async () => {
    const h = await createHarness()
    const res = await h.db.query<{ relname: string; relrowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'lugu' and c.relkind = 'r' order by 1`,
    )
    expect(res.rows.length).toBe(34)
    expect(res.rows.filter((r) => !r.relrowsecurity).map((r) => r.relname)).toEqual([])
  })

  test('every architecture table exists', async () => {
    const h = await createHarness()
    const res = await h.db.query<{ relname: string }>(
      `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'lugu' and c.relkind = 'r'`,
    )
    const names = new Set(res.rows.map((r) => r.relname))
    for (const t of [
      'profiles', 'student_profiles', 'schools', 'curricula', 'curriculum_versions', 'curriculum_objectives',
      'curriculum_lessons', 'lesson_content_packages', 'lesson_admin_material', 'curriculum_sources',
      'program_assignments', 'program_events', 'learning_sessions', 'session_section_progress', 'session_events',
      'break_sessions', 'question_attempts', 'vocabulary_mastery', 'assessment_results', 'lesson_completion_records',
      'school_subjects', 'school_exams', 'school_exam_results', 'speaking_sessions', 'speaking_session_notes',
      'student_learning_profiles', 'weekly_learning_reports', 'ai_jobs', 'achievements',
      'student_achievement_records', 'progress_rewards', 'admin_audit_logs', 'system_settings',
      'data_deletion_requests',
    ]) {
      expect(names.has(t), t).toBe(true)
    }
  })

  test('no lugu function is executable by PUBLIC or anon; internals are not executable by authenticated', async () => {
    const h = await createHarness()
    const res = await h.db.query<{ proname: string; anon: boolean; auth: boolean }>(
      `select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon,
              has_function_privilege('authenticated', p.oid, 'execute') as auth
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'lugu'`,
    )
    expect(res.rows.filter((r) => r.anon).map((r) => r.proname)).toEqual([])
    const authCallable = new Set(res.rows.filter((r) => r.auth).map((r) => r.proname))
    for (const internal of ['grade_response', 'student_session', 'audit', 'next_student_code', 'require_admin', 'lesson_access']) {
      expect(authCallable.has(internal), internal).toBe(false)
    }
    for (const rpc of ['student_home', 'complete_lesson', 'admin_set_progress', 'mark_password_changed', 'is_admin']) {
      expect(authCallable.has(rpc), rpc).toBe(true)
    }
  })

  test('anon has no table privileges in lugu', async () => {
    const h = await createHarness()
    const res = await h.db.query<{ n: number }>(
      `select count(*)::int as n from information_schema.role_table_grants where table_schema = 'lugu' and grantee in ('anon', 'PUBLIC')`,
    )
    expect(res.rows[0]!.n).toBe(0)
    const err = await h.as(null, (tx) => tx.query('select * from lugu.schools')).catch((e: Error) => e.message)
    expect(err).toMatch(/permission denied/)
  })

  test('seed.sql applies and its package is a valid LessonPackage', async () => {
    const h = await createHarness({ seed: true })
    const res = await h.db.query<{ content: unknown; status: string }>(
      `select content, status from lugu.lesson_content_packages`,
    )
    expect(res.rows).toHaveLength(1)
    expect(res.rows[0]!.status).toBe('published')
    const parsed = LessonPackage.safeParse(res.rows[0]!.content)
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true)
    if (parsed.success) expect(parsed.data.vocabulary).toHaveLength(5)
    const lessons = await h.db.query<{ n: number }>(`select count(*)::int as n from lugu.curriculum_lessons`)
    expect(lessons.rows[0]!.n).toBe(2)
    const people = await h.db.query<{ n: number }>(`select count(*)::int as n from lugu.profiles`)
    expect(people.rows[0]!.n).toBe(0)
  })
})
