/**
 * DEVELOPMENT DEMO ONLY — never run against production.
 *
 * Builds a live-looking Grade 6 setup on the local stack through the real API
 * (admin and student sign-ins, RPCs, RLS), so every row passes the same rules
 * the app enforces:
 *   - curriculum "6. Sınıf İngilizce" (Unit 1 published, Units 2–3 planned)
 *   - the student LUGU-1001 profiled, assigned, part-way through Unit 1
 *   - five practice exams, speaking sessions with notes, a teacher observation
 *
 * Usage: LUGU_ADMIN_PASSWORD=… LUGU_STUDENT_PASSWORD=<temp> pnpm dlx tsx --tsconfig tsconfig.node.json scripts/demo/seed-grade6.ts
 * Remove: delete the curriculum and the exams/speaking rows in the admin UI, or `supabase db reset`.
 */
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { LessonPackage } from '@/domain/content'
import { lessonPackageFixture } from '../../tests/ai/fixtures/lesson-package'
import { adminFixture } from '../../tests/ai/fixtures/pipeline'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
)
const URL = env.VITE_SUPABASE_URL ?? ''
const ANON = env.VITE_SUPABASE_ANON_KEY ?? ''
const STUDENT_EMAIL = 'lugu-1001@students.lugu.invalid'
const STUDENT_NEW_PASSWORD = 'Ada-Demo-2026'

function client() {
  return createClient(URL, ANON, { db: { schema: 'lugu' }, auth: { persistSession: false } }) as unknown as SupabaseClient
}
async function signIn(email: string, password: string) {
  const c = client()
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`sign in ${email}: ${error.message}`)
  return c
}
function must<T>(r: { data: T; error: { message: string } | null } | { data: unknown; error: { message: string } }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`)
  return r.data as T
}
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10)

async function main() {
  const pkg = LessonPackage.parse(lessonPackageFixture)
  const admin = await signIn('admin@lugu.local', process.env.LUGU_ADMIN_PASSWORD ?? '')

  // ── Student onboarding (as the student, like the first login) ──
  let student: SupabaseClient
  try {
    student = await signIn(STUDENT_EMAIL, process.env.LUGU_STUDENT_PASSWORD ?? '')
    must(await student.auth.updateUser({ password: STUDENT_NEW_PASSWORD }), 'change password')
    must(await student.rpc('mark_password_changed'), 'mark_password_changed')
  } catch {
    student = await signIn(STUDENT_EMAIL, STUDENT_NEW_PASSWORD)
  }
  const studentId = (await student.auth.getUser()).data.user!.id
  const school = must(await student.rpc('add_school', { name: '30 Ağustos Ortaokulu', city: 'Kırşehir', district: 'Merkez' }), 'add_school') as { id: string }
  must(
    await student.rpc('update_my_profile', { first_name: 'Ada', last_name: 'Yılmaz', display_name: 'Ada', grade: 6, school_id: school.id, avatar_key: 'owl-reader' }),
    'update_my_profile',
  )

  // ── Curriculum ──
  const curriculum = must(
    await admin
      .from('curricula')
      .insert({ name: '6. Sınıf İngilizce (MEB uyumlu)', description: 'Ortaokul 6. sınıf İngilizce programı; ünite sırası MEB öğretim programını izler.', grade: 6, kind: 'standard', status: 'active', target_level: 'A1–A2' })
      .select()
      .single(),
    'curriculum',
  ) as { id: string }
  const version = must(await admin.from('curriculum_versions').insert({ curriculum_id: curriculum.id, version: 1, status: 'draft' }).select().single(), 'version') as { id: string }
  const objectives = must(
    await admin
      .from('curriculum_objectives')
      .insert(pkg.meta.objectives.map((o, i) => ({ version_id: version.id, code: o.id, text: o.text, sort: i })))
      .select(),
    'objectives',
  ) as { id: string }[]
  const lessons = must(
    await admin
      .from('curriculum_lessons')
      .insert([
        { version_id: version.id, sequence: 1, title: 'Ünite 1 — Life: Daily Routines', estimated_minutes: pkg.meta.estimatedMinutes, status: 'ready', objective_ids: objectives.map((o) => o.id), source_notes: 'MEB 6. sınıf, 1. ünite: günlük rutinler, geniş zaman (he/she -s), saat sorma.' },
        { version_id: version.id, sequence: 2, title: 'Ünite 2 — Yummy Breakfast', estimated_minutes: 45, status: 'draft', objective_ids: [], source_notes: null },
        { version_id: version.id, sequence: 3, title: 'Ünite 3 — Downtown', estimated_minutes: 45, status: 'draft', objective_ids: [], source_notes: null },
      ])
      .select()
      .order('sequence'),
    'lessons',
  ) as { id: string; sequence: number }[]
  const lesson1 = lessons.find((l) => l.sequence === 1)!

  const draft = must(
    await admin.from('lesson_content_packages').insert({ lesson_id: lesson1.id, revision: 1, status: 'draft', origin: 'ai', content: pkg }).select().single(),
    'package',
  ) as { id: string }
  must(
    await admin.from('lesson_admin_material').insert({ package_id: draft.id, teacher_guide: adminFixture.teacherGuide, speaking_plan: adminFixture.speakingPlan ?? null }),
    'admin material',
  )
  for (const status of ['ai_generated', 'qa', 'review', 'approved', 'published'] as const)
    must(await admin.rpc('admin_set_package_status', { package_id: draft.id, status }), `package → ${status}`)
  must(await admin.rpc('admin_publish_version', { version_id: version.id }), 'publish version')
  must(await admin.rpc('admin_assign_program', { student_id: studentId, version_id: version.id, start_lesson_id: lesson1.id }), 'assign')

  // ── Learning activity: real session through the student RPCs ──
  const session = must(await student.rpc('start_or_resume_session', { lesson_id: lesson1.id, kind: 'primary' }), 'session') as { id: string } | { session: { id: string } }
  const sessionId = 'session' in session ? session.session.id : session.id
  must(await student.rpc('complete_section', { session_id: sessionId, section: 'vocabulary' }), 'vocabulary done')

  // Two correct answers since the last miss master an item; a few honest misses on the harder phrases.
  const hard = new Set(pkg.vocabulary.filter((v) => v.difficulty >= 2).slice(0, 4).map((v) => v.id))
  for (const v of pkg.vocabulary) {
    const plan = hard.has(v.id) ? [false, true, true] : [true, true]
    for (const [i, ok] of plan.entries()) {
      const direction = i % 2 === 0 ? 'en_tr' : 'tr_en'
      const right = direction === 'en_tr' ? v.tr : v.en
      const chosen = ok ? right : (pkg.vocabulary.find((x) => x.id !== v.id)?.[direction === 'en_tr' ? 'tr' : 'en'] ?? 'x')
      must(
        await student.rpc('record_vocab_answer', { session_id: sessionId, item_id: v.id, direction, chosen, response_ms: (hard.has(v.id) ? 6000 : 2500) + Math.round(Math.random() * 3000), client_id: randomUUID() }),
        `vocab ${v.id}`,
      )
    }
  }
  must(await student.rpc('complete_section', { session_id: sessionId, section: 'vocab_quiz' }), 'vocab quiz done')
  const brk = must(await student.rpc('start_break', { session_id: sessionId, after_section: 'vocab_quiz', planned_minutes: 10 }), 'break') as { id: string }
  must(await student.rpc('end_break', { break_id: brk.id }), 'end break')
  must(await student.rpc('record_session_event', { session_id: sessionId, kind: 'visibility_hidden', data: {} }), 'event')
  must(await student.rpc('record_session_event', { session_id: sessionId, kind: 'visibility_visible', data: {} }), 'event')

  for (const [i, q] of pkg.story.questions.entries()) {
    const wrongFirst = i === 1
    const answers = wrongFirst ? [false, true] : [true]
    for (const ok of answers) {
      const response = q.type === 'choice' ? (ok ? q.answer : (q.answer + 1) % q.options.length) : q.type === 'order' ? (ok ? q.answer : [...q.answer].reverse()) : ok ? q.accept[0] : 'idk'
      must(
        await student.rpc('record_answer', { session_id: sessionId, section: 'story', question_id: q.id, response, response_ms: 7000 + i * 900, hint_used: wrongFirst && ok, client_id: randomUUID() }),
        `story ${q.id}`,
      )
    }
  }
  must(await student.rpc('complete_section', { session_id: sessionId, section: 'story' }), 'story done')
  must(await student.rpc('save_section_state', { session_id: sessionId, section: 'story', state: {}, active_seconds_delta: 1260 }), 'active time')

  // ── Academic: five practice exams (LGS-style section sizes) ──
  const subjectNames = ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Din Kültürü']
  const existing = must(await admin.from('school_subjects').select('id, name'), 'subjects') as { id: string; name: string }[]
  const subjects = new Map(existing.map((s) => [s.name, s.id]))
  for (const [i, name] of subjectNames.entries())
    if (!subjects.has(name)) subjects.set(name, (must(await admin.from('school_subjects').insert({ name, sort: i }).select().single(), name) as { id: string }).id)

  const totals: Record<string, number> = { Türkçe: 20, Matematik: 20, 'Fen Bilimleri': 20, 'Sosyal Bilgiler': 10, İngilizce: 10, 'Din Kültürü': 10 }
  // [correct, incorrect] per exam, oldest first: maths and English climb, science dips in the latest.
  const scores: Record<string, [number, number][]> = {
    Türkçe: [[14, 4], [15, 3], [15, 4], [16, 3], [16, 2]],
    Matematik: [[8, 8], [9, 7], [11, 6], [12, 5], [14, 4]],
    'Fen Bilimleri': [[13, 5], [14, 4], [14, 4], [15, 3], [11, 7]],
    'Sosyal Bilgiler': [[7, 2], [7, 3], [8, 2], [8, 1], [8, 2]],
    İngilizce: [[5, 4], [6, 3], [6, 3], [7, 2], [8, 2]],
    'Din Kültürü': [[8, 1], [9, 1], [8, 2], [9, 1], [9, 0]],
  }
  const exams = ['Eylül Kurum Denemesi', 'Ekim 1. Deneme', 'Ekim 2. Deneme', 'Kasım 1. Deneme', 'Kasım 2. Deneme']
  const dates = [70, 49, 35, 21, 7]
  for (const [e, title] of exams.entries()) {
    const exam = must(
      await admin.from('school_exams').insert({ student_id: studentId, title, kind: 'mock', exam_date: daysAgo(dates[e]!), notes: e === 4 ? 'Fen bölümünde süre yetmediğini söyledi.' : null }).select().single(),
      title,
    ) as { id: string }
    must(
      await admin.from('school_exam_results').insert(
        subjectNames.map((name) => {
          const [correct, incorrect] = scores[name]![e]!
          return { exam_id: exam.id, subject_id: subjects.get(name)!, total: totals[name]!, correct, incorrect, blank: totals[name]! - correct - incorrect }
        }),
      ),
      `${title} results`,
    )
  }

  // ── Speaking & coaching ──
  const at = (d: number, h: number) => new Date(Date.now() - d * 86_400_000 + h * 3_600_000).toISOString()
  const speaking = [
    { planned: at(14, 0), start: at(14, 0), end: at(14, 0.95), obs: 'Kelimeleri tanıyor ama cümle kurarken duraksıyor. "He go" / "he goes" karışıklığı sık.', strengths: 'Dinlediğini iyi anlıyor; soruları doğru yorumluyor.', goals: '3. tekil şahısta -s eki; günlük rutini 5 cümleyle anlatmak.', follow: 'Her gün sabah rutinini sesli anlatıp kaydetmesi önerildi.' },
    { planned: at(7, 0), start: at(7, 0), end: at(7, 1), obs: '-s ekini çoğunlukla doğru kullanıyor; "What time do you…?" sorusunda tereddüt var. Özgüveni artmış.', strengths: 'Rol oyununda gönüllü; telaffuzu net.', goals: 'Saat sorma/söyleme; sıklık zarfları (always, usually, sometimes).', follow: 'Haftaya rol oyunu: okul sabahı planlama.' },
  ]
  for (const s of speaking) {
    const row = must(
      await admin.from('speaking_sessions').insert({ student_id: studentId, lesson_id: lesson1.id, planned_at: s.planned, started_at: s.start, ended_at: s.end, status: 'ended' }).select().single(),
      'speaking',
    ) as { id: string }
    must(await admin.from('speaking_session_notes').insert({ speaking_session_id: row.id, observations: s.obs, strengths: s.strengths, goals: s.goals, follow_up: s.follow }), 'speaking notes')
  }
  must(await admin.from('speaking_sessions').insert({ student_id: studentId, lesson_id: lesson1.id, planned_at: at(-2, 17), status: 'planned', plan: adminFixture.speakingPlan ?? null }), 'next speaking')

  must(
    await admin.from('student_learning_profiles').upsert({
      student_id: studentId,
      teacher_observations: 'Ada istekli ve düzenli çalışıyor. Okuduğunu anlama güçlü; konuşmada cümle kurma ve 3. tekil şahıs -s eki üzerinde çalışıyoruz. Matematik netleri yükselişte; son denemede Fen düştü (süre yönetimi).',
      observed: {},
      ai_interpretation: {},
    }),
    'teacher observations',
  )

  console.log(`done: student ${studentId}, curriculum ${curriculum.id}, session ${sessionId}. Student password is now ${STUDENT_NEW_PASSWORD}`)
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
