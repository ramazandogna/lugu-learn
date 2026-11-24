/**
 * DEVELOPMENT DEMO ONLY — never run against production.
 *
 * Builds a live-looking Grade 6 setup on the local stack through the real API
 * (admin and student sign-ins, RPCs, RLS, the admin-students edge function), so every
 * row passes the same rules the app enforces. Re-running is safe: each step looks for
 * its row first and skips it, or publishes a new revision only when the content changed.
 *   - curriculum "6. Sınıf İngilizce": Unit 1 published with its play plan (themeId u1-morning),
 *     Unit 2 published (themeId u2-night-oven, still locked for Ada), Unit 3 planned
 *   - LUGU-1001 Ada: profiled, assigned, part-way through Unit 1, ten practice exams with
 *     topic breakdowns, three replays of the Unit 1 vocabulary quiz spread over six weeks,
 *     three tasks (done, overdue, open), speaking sessions with notes
 *   - LUGU-1002 Emir: created through admin-students, Math and Science declining over the
 *     last four of ten exams, stuck in Unit 1 vocabulary, two tasks (one overdue)
 *
 * Usage: LUGU_ADMIN_PASSWORD=… [LUGU_STUDENT_PASSWORD=<Ada temp, only if still unchanged>] pnpm dlx tsx --tsconfig tsconfig.node.json scripts/demo/seed-grade6.ts
 * Needs the local stack: Supabase API on 54321, container supabase_db_lugu, edge function admin-students served.
 * The three Ada replays are backdated with psql inside supabase_db_lugu, because students cannot
 * write learning rows and an admin cannot backdate them through RPCs. Dev data only.
 * Remove: delete the curriculum and the exams/speaking/task rows in the admin UI, or `supabase db reset`.
 */
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { LessonPackage } from '@/domain/content'
import { lessonPackageFixture } from '../../tests/ai/fixtures/lesson-package'
import { adminFixture } from '../../tests/ai/fixtures/pipeline'
import { unit2PackageInput, unit2TeacherGuide } from './unit2-package'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
)
const URL = env.VITE_SUPABASE_URL ?? ''
const ANON = env.VITE_SUPABASE_ANON_KEY ?? ''
const DB_CONTAINER = 'supabase_db_lugu'
const CURRICULUM_NAME = '6. Sınıf İngilizce (MEB uyumlu)'
const SCHOOL = { name: '30 Ağustos Ortaokulu', city: 'Kırşehir', district: 'Merkez' }

type DemoStudent = { code: 'LUGU-1001' | 'LUGU-1002'; password: string; first: string; last: string; avatar: string }
const ADA: DemoStudent = { code: 'LUGU-1001', password: 'Ada-Demo-2026', first: 'Ada', last: 'Yılmaz', avatar: 'owl-reader' }
const EMIR: DemoStudent = { code: 'LUGU-1002', password: 'Emir-Demo-2026', first: 'Emir', last: 'Kaya', avatar: 'owl-reader' }

const SUBJECT_NAMES = ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Din Kültürü']
const TOTALS: Record<string, number> = { Türkçe: 20, Matematik: 20, 'Fen Bilimleri': 20, 'Sosyal Bilgiler': 10, İngilizce: 10, 'Din Kültürü': 10 }
/** Topic breakdown for these subjects only (the rest have no topic rows). Shares: 40 / 35 / 25 %. */
const TOPICS: Record<string, string[]> = {
  Türkçe: ['Sözcükte anlam', 'Paragraf', 'Dil bilgisi'],
  Matematik: ['Sayılar', 'Cebir', 'Geometri'],
  'Fen Bilimleri': ['Fiziksel olaylar', 'Canlılar', 'Dünya ve evren'],
  İngilizce: ['Vocabulary', 'Grammar', 'Reading'],
}

type Score = [correct: number, incorrect: number]
type ExamDef = { title: string; daysAgo: number; notes?: string }

// Ada: ten exams, oldest first. The first five are new; the last five are the original seed's (same titles and dates).
const ADA_EXAMS: ExamDef[] = [
  { title: 'Temmuz Kurum Denemesi', daysAgo: 125 },
  { title: 'Temmuz 2. Deneme', daysAgo: 112 },
  { title: 'Ağustos 1. Deneme', daysAgo: 98 },
  { title: 'Ağustos 2. Deneme', daysAgo: 85 },
  { title: 'Eylül 1. Deneme', daysAgo: 77 },
  { title: 'Eylül Kurum Denemesi', daysAgo: 70 },
  { title: 'Ekim 1. Deneme', daysAgo: 49 },
  { title: 'Ekim 2. Deneme', daysAgo: 35 },
  { title: 'Kasım 1. Deneme', daysAgo: 21 },
  { title: 'Kasım 2. Deneme', daysAgo: 7, notes: 'Fen bölümünde süre yetmediğini söyledi.' },
]
// Trend: Turkish, Math and English climb; Science dips in the latest exam (time management).
const ADA_SCORES: Record<string, Score[]> = {
  Türkçe: [[12, 5], [13, 5], [13, 4], [14, 4], [14, 3], [14, 4], [15, 3], [15, 4], [16, 3], [16, 2]],
  Matematik: [[5, 10], [6, 10], [6, 9], [7, 9], [8, 8], [8, 8], [9, 7], [11, 6], [12, 5], [14, 4]],
  'Fen Bilimleri': [[12, 6], [13, 5], [12, 6], [13, 5], [13, 5], [13, 5], [14, 4], [14, 4], [15, 3], [11, 7]],
  'Sosyal Bilgiler': [[6, 3], [6, 3], [7, 2], [7, 3], [7, 2], [7, 2], [7, 3], [8, 2], [8, 1], [8, 2]],
  İngilizce: [[4, 5], [4, 5], [5, 4], [5, 4], [5, 4], [5, 4], [6, 3], [6, 3], [7, 2], [8, 2]],
  'Din Kültürü': [[7, 2], [8, 1], [7, 2], [8, 1], [8, 1], [8, 1], [9, 1], [8, 2], [9, 1], [9, 0]],
}

// Emir: ten exams, oldest first. Math and Science fall over the last four (decline rule).
const EMIR_EXAMS: ExamDef[] = [
  { title: 'Ağustos Kurum Denemesi', daysAgo: 88 },
  { title: 'Ağustos 2. Deneme', daysAgo: 80 },
  { title: 'Eylül 1. Deneme', daysAgo: 72 },
  { title: 'Eylül 2. Deneme', daysAgo: 64 },
  { title: 'Ekim 1. Deneme', daysAgo: 56 },
  { title: 'Ekim 2. Deneme', daysAgo: 48 },
  { title: 'Ekim 3. Deneme', daysAgo: 40 },
  { title: 'Kasım 1. Deneme', daysAgo: 30 },
  { title: 'Kasım 2. Deneme', daysAgo: 20 },
  { title: 'Kasım 3. Deneme', daysAgo: 10 },
]
const EMIR_SCORES: Record<string, Score[]> = {
  Türkçe: [[13, 4], [14, 3], [13, 4], [14, 3], [13, 4], [14, 3], [13, 4], [14, 3], [13, 4], [14, 3]],
  Matematik: [[12, 4], [12, 4], [11, 5], [11, 5], [10, 6], [9, 7], [8, 8], [7, 8], [5, 10], [3, 12]],
  'Fen Bilimleri': [[12, 4], [12, 5], [11, 5], [11, 5], [10, 6], [10, 6], [9, 7], [8, 8], [6, 9], [4, 11]],
  'Sosyal Bilgiler': [[6, 2], [7, 2], [6, 3], [7, 2], [6, 2], [7, 2], [6, 3], [6, 2], [7, 2], [6, 2]],
  İngilizce: [[5, 3], [6, 2], [5, 3], [6, 2], [5, 3], [6, 2], [5, 3], [6, 2], [5, 3], [6, 2]],
  'Din Kültürü': [[7, 1], [8, 1], [7, 2], [8, 1], [7, 1], [8, 1], [7, 1], [8, 1], [7, 1], [8, 1]],
}

// Three replays of the Unit 1 vocabulary quiz, with different scores (out of 10) for the comparison charts.
const REPLAYS = [
  { n: 1, daysAgo: 40, correct: 4 },
  { n: 2, daysAgo: 25, correct: 7 },
  { n: 3, daysAgo: 9, correct: 9 },
]
const UNIT1_QUIZ_ITEMS = ['v-wake-up', 'v-get-up', 'v-have-breakfast', 'v-brush-teeth', 'v-get-dressed', 'v-catch-the-bus', 'v-go-to-school', 'v-be-late-for', 'v-have-lunch', 'v-after-school']

/** Unit 1 play plan (docs/play/patterns.md section 8). Every ref is a real vocabulary, question or step id. */
const UNIT1_PLAY = {
  sections: {
    review: {
      template: 'time-escape',
      slots: { pool: ['v-wake-up', 'v-have-breakfast', 'v-go-to-school', 'v-brush-teeth', 'v-catch-the-bus', 'v-get-dressed'], seconds: { bank: 10, perCorrect: 3, cap: 10 }, chase: { chaser: 'honey-slime', escapee: 'piko' }, easyDefault: false },
    },
    vocabulary: {
      template: 'scroll-story',
      slots: {
        mode: 'vocab-reveal',
        steps: [
          { id: 'vs-wake', line: { speaker: 'piko', en: 'wake up', tr: 'uyanmak' }, emphasis: ['wake'] },
          { id: 'vs-bfast', line: { speaker: 'piko', en: 'have breakfast', tr: 'kahvaltı yapmak' }, emphasis: ['breakfast'] },
          { id: 'vs-time', line: { speaker: 'piko', en: 'What time is it?', tr: 'Saat kaç?' }, emphasis: ['time'], joke: { tr: "'It' saatin ismi gibi; saate 'he' denmez, saat gücenir." } },
        ],
        vocabRefs: ['v-wake-up', 'v-have-breakfast', 'v-brush-teeth', 'v-get-dressed', 'v-go-to-school'],
      },
    },
    vocab_quiz: {
      template: 'stamp-quiz',
      slots: { questions: ['v-wake-up', 'v-have-breakfast', 'v-brush-teeth', 'v-get-dressed', 'v-go-to-school'], showStreak: true, shield: true, hintBudget: 2 },
    },
    story: {
      template: 'scroll-story',
      slots: {
        mode: 'story',
        steps: [
          { id: 'ps-wake', line: { speaker: 'narrator', en: "It is Monday. Piko wakes up at seven o'clock.", tr: 'Bugün pazartesi. Piko saat yedide uyanıyor.' }, gate: 'st-wake-time' },
          { id: 'ps-late', line: { speaker: 'piko', en: 'Oh no! I usually get up at half past six!', tr: 'Eyvah! Genelde altı buçukta kalkarım!' } },
          { id: 'ps-bfast', line: { speaker: 'piko', en: 'Yes! But first I have breakfast and brush my teeth.', tr: 'Evet! Ama önce kahvaltı yapıp dişlerimi fırçalıyorum.' } },
          { id: 'ps-bus', line: { speaker: 'narrator', en: 'They catch the bus and go to school together.', tr: 'Otobüse yetişiyorlar ve birlikte okula gidiyorlar.' } },
        ],
        choice: {
          prompt: 'Piko is late. What should he do?',
          options: [
            { text: 'Have a quick breakfast.', feedback: 'Güzel seçim! Kısa bir kahvaltı bile güne enerjiyle başlamanı sağlar.' },
            { text: 'Run to the bus stop now.', feedback: 'Hızlı ama aç kalabilir! Yine de otobüse yetişmek de önemli.' },
          ],
        },
      },
    },
    explanation: {
      template: 'tap-guide',
      slots: {
        guides: [
          { id: 'g-is', target: 'pronoun-he', hint: { fine: "He, she, it: üçü de 'bir tane' kulübü.", big: 'Bu üçünün yanına hangi kapıcı gelir: am, is, are?' }, joke: { tr: "He, she, it -> IS. 'Is' kulübün kapıcısı." }, stepRef: 'ex-he-she' },
        ],
        goNoGo: {
          rule: { tr: "Tekil özne (he / she / it) ise görürsen dokun.", tapIf: 'he|she|it' },
          warmup: [
            { id: 'w-she', text: 'she', tap: true, why: 'she tek kişi -> is' },
            { id: 'w-they', text: 'they', tap: false, why: 'they çok kişi -> are' },
            { id: 'w-it', text: 'it', tap: true, why: 'it -> is' },
            { id: 'w-we', text: 'we', tap: false, why: 'we -> are' },
          ],
          round: [
            { id: 'r-he', text: 'he', tap: true, why: 'he tek kişi -> is' },
            { id: 'r-i', text: 'I', tap: false, why: 'I -> am' },
            { id: 'r-you', text: 'you', tap: false, why: 'you -> are' },
            { id: 'r-it', text: 'it', tap: true, why: 'it -> is' },
            { id: 'r-she', text: 'she', tap: true, why: 'she -> is' },
            { id: 'r-we', text: 'we', tap: false, why: 'we -> are' },
            { id: 'r-they', text: 'they', tap: false, why: 'they -> are' },
            { id: 'r-bus', text: 'the bus', tap: true, why: 'the bus = it -> is' },
          ],
          onWrongTap: { anim: 'sneeze', line: 'Hapşu! Bu sefer o değil.' },
        },
      },
    },
    homework: {
      template: 'fill-workshop',
      slots: {
        items: [
          { ref: 'hw-1-complete', sceneObject: 'clock', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
          { ref: 'hw-2-complete' },
        ],
        hint: { fine: 'Fiilin sonuna ne geliyor? he / she için -s.' },
      },
    },
    assessment: {
      template: 'stamp-quiz',
      slots: { questions: ['as-shower', 'as-go-school', 'as-get-dressed', 'as-catch-bus', 'as-watches', 'as-correct-sentence'], hintBudget: 0, explain: false },
    },
  },
  extras: [
    {
      template: 'imagine',
      slots: {
        activity: 'character',
        frame: 'My monster wakes up at ___.',
        chips: [
          { id: 'c-wake', en: 'wake up', tr: 'uyanmak', kind: 'verb' },
          { id: 'c-brush', en: 'brush my teeth', tr: 'dişlerimi fırçalamak', kind: 'verb' },
          { id: 'c-late', en: 'late', tr: 'geç', kind: 'adj' },
          { id: 'c-school', en: 'school', tr: 'okul', kind: 'place' },
          { id: 'c-bfast', en: 'breakfast', tr: 'kahvaltı', kind: 'noun' },
          { id: 'c-bus', en: 'the bus', tr: 'otobüs', kind: 'noun' },
        ],
        collection: { title: 'Sabah Canavarlarım' },
      },
    },
  ],
}

// ── helpers ──

function client(): SupabaseClient {
  return createClient(URL, ANON, { db: { schema: 'lugu' }, auth: { persistSession: false } }) as unknown as SupabaseClient
}
async function signIn(email: string, password: string): Promise<SupabaseClient> {
  const c = client()
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`sign in ${email}: ${error.message}`)
  return c
}
function must<T>(r: { data: unknown; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`)
  return r.data as T
}
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10)
/** Key-order-independent JSON, to compare a stored package with the one we would publish. */
const canon = (v: unknown) => JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]])) : x))

function psql(sql: string) {
  try {
    execFileSync('docker', ['exec', '-i', DB_CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-q', '-v', 'ON_ERROR_STOP=1'], { input: sql, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' })
  } catch (e) {
    const err = e as { stderr?: string; message: string }
    throw new Error(`psql: ${(err.stderr || err.message).trim()}`)
  }
}

// ── curriculum ──

/** Publishes a package revision for a lesson unless the same content is already published. Returns the published id. */
async function ensurePublishedPackage(admin: SupabaseClient, lessonId: string, content: unknown, teacherGuide: unknown, speakingPlan: unknown): Promise<string> {
  const published = must<{ id: string; content: unknown } | null>(
    await admin.from('lesson_content_packages').select('id, content').eq('lesson_id', lessonId).eq('status', 'published').maybeSingle(),
    'published package lookup',
  )
  if (published && canon(published.content) === canon(content)) return published.id

  let id: string
  let from: string
  if (published) {
    id = must<{ id: string }>(await admin.rpc('admin_new_revision', { package_id: published.id, content }), 'new revision').id
    from = 'draft'
  } else {
    const pending = must<{ id: string; status: string } | null>(
      await admin.from('lesson_content_packages').select('id, status').eq('lesson_id', lessonId).in('status', ['draft', 'ai_generated', 'qa', 'review', 'approved']).order('revision', { ascending: false }).limit(1).maybeSingle(),
      'pending package lookup',
    )
    if (pending) {
      must(await admin.from('lesson_content_packages').update({ content }).eq('id', pending.id), 'pending content')
      id = pending.id
      from = pending.status
    } else {
      id = must<{ id: string }>(await admin.from('lesson_content_packages').insert({ lesson_id: lessonId, status: 'draft', content, origin: 'manual', revision: 1 }).select().single(), 'package').id
      from = 'draft'
    }
  }
  must(await admin.from('lesson_admin_material').upsert({ package_id: id, teacher_guide: teacherGuide, speaking_plan: speakingPlan ?? null }), 'admin material')
  const chain = ['draft', 'ai_generated', 'qa', 'review', 'approved', 'published']
  for (const status of chain.slice(chain.indexOf(from) + 1))
    must(await admin.rpc('admin_set_package_status', { package_id: id, status }), `package → ${status}`)
  return id
}

async function ensureCurriculum(admin: SupabaseClient, pkg1: LessonPackage) {
  let curriculum = must<{ id: string } | null>(await admin.from('curricula').select('id').eq('name', CURRICULUM_NAME).limit(1).maybeSingle(), 'curriculum lookup')
  if (!curriculum)
    curriculum = must<{ id: string }>(
      await admin
        .from('curricula')
        .insert({ name: CURRICULUM_NAME, description: 'Ortaokul 6. sınıf İngilizce programı; ünite sırası MEB öğretim programını izler.', grade: 6, kind: 'standard', status: 'active', target_level: 'A1–A2' })
        .select()
        .single(),
      'curriculum',
    )
  let version = must<{ id: string; status: string } | null>(
    await admin.from('curriculum_versions').select('id, status').eq('curriculum_id', curriculum.id).order('version', { ascending: false }).limit(1).maybeSingle(),
    'version lookup',
  )
  if (!version)
    version = must<{ id: string; status: string }>(await admin.from('curriculum_versions').insert({ curriculum_id: curriculum.id, version: 1, status: 'draft' }).select().single(), 'version')

  let objectives = must<{ id: string }[]>(await admin.from('curriculum_objectives').select('id').eq('version_id', version.id).order('sort'), 'objectives')
  if (objectives.length === 0)
    objectives = must<{ id: string }[]>(
      await admin.from('curriculum_objectives').insert(pkg1.meta.objectives.map((o, i) => ({ version_id: version!.id, code: o.id, text: o.text, sort: i }))).select(),
      'objectives',
    )

  let lessons = must<{ id: string; sequence: number; status: string }[]>(
    await admin.from('curriculum_lessons').select('id, sequence, status').eq('version_id', version.id).order('sequence'),
    'lessons',
  )
  if (lessons.length === 0)
    lessons = must(
      await admin
        .from('curriculum_lessons')
        .insert([
          { version_id: version.id, sequence: 1, title: 'Ünite 1 — Life: Daily Routines', estimated_minutes: pkg1.meta.estimatedMinutes, status: 'ready', objective_ids: objectives.map((o) => o.id), source_notes: 'MEB 6. sınıf, 1. ünite: günlük rutinler, geniş zaman (he/she -s), saat sorma.' },
          { version_id: version.id, sequence: 2, title: 'Ünite 2 — Yummy Breakfast', estimated_minutes: 45, status: 'draft', objective_ids: [], source_notes: null },
          { version_id: version.id, sequence: 3, title: 'Ünite 3 — Downtown', estimated_minutes: 45, status: 'draft', objective_ids: [], source_notes: null },
        ])
        .select()
        .order('sequence'),
      'lessons',
    )
  const lesson1 = lessons.find((l) => l.sequence === 1)!
  const lesson2 = lessons.find((l) => l.sequence === 2)!
  if (lesson2.status !== 'ready')
    must(await admin.from('curriculum_lessons').update({ status: 'ready' }).eq('id', lesson2.id), 'unit 2 ready')
  return { curriculum, version, lesson1, lesson2 }
}

// ── students ──

/** First login: temp password (when known and unchanged), else the demo password, else a fresh temp from the admin reset. */
async function firstLogin(admin: SupabaseClient, email: string, studentId: string, password: string, temp?: string): Promise<SupabaseClient> {
  const onboard = async (c: SupabaseClient) => {
    must(await c.auth.updateUser({ password }), 'change password')
    must(await c.rpc('mark_password_changed'), 'mark_password_changed')
    return c
  }
  if (temp) {
    const c = await signIn(email, temp).catch(() => null)
    if (c) return onboard(c)
  }
  const ok = await signIn(email, password).catch(() => null)
  if (ok) return ok
  const reset = must<{ password: string }>(await admin.functions.invoke('admin-students', { body: { action: 'reset-password', student_id: studentId } }), 'reset-password')
  return onboard(await signIn(email, reset.password))
}

async function ensureStudent(admin: SupabaseClient, s: DemoStudent): Promise<{ id: string; client: SupabaseClient }> {
  const email = `${s.code.toLowerCase()}@students.lugu.invalid`
  const existing = must<{ user_id: string } | null>(await admin.from('student_profiles').select('user_id').eq('student_code', s.code).maybeSingle(), `${s.code} lookup`)
  let id = existing?.user_id ?? ''
  let temp: string | undefined = s.code === ADA.code ? process.env.LUGU_STUDENT_PASSWORD : undefined
  if (!id) {
    const created = must<{ student_id: string; student_code: string; password: string }>(
      await admin.functions.invoke('admin-students', { body: { action: 'create', first_name: s.first, last_name: s.last, display_name: s.first, grade: 6 } }),
      `create ${s.code}`,
    )
    if (created.student_code !== s.code) throw new Error(`admin-students issued ${created.student_code}, expected ${s.code}; the code sequence is off`)
    id = created.student_id
    temp = created.password
  }
  return { id, client: await firstLogin(admin, email, id, s.password, temp) }
}

async function ensureProfile(s: DemoStudent, student: SupabaseClient, schoolId: string) {
  const profile = await student.from('student_profiles').select('school_id').maybeSingle()
  if (profile.data?.school_id === schoolId) return
  must(await student.rpc('update_my_profile', { first_name: s.first, last_name: s.last, display_name: s.first, grade: 6, school_id: schoolId, avatar_key: s.avatar }), `${s.code} profile`)
}

async function ensureAssignment(admin: SupabaseClient, studentId: string, versionId: string, lessonId: string) {
  const open = must<{ id: string } | null>(
    await admin.from('program_assignments').select('id').eq('student_id', studentId).in('status', ['active', 'paused']).limit(1).maybeSingle(),
    'assignment lookup',
  )
  if (!open) must(await admin.rpc('admin_assign_program', { student_id: studentId, version_id: versionId, start_lesson_id: lessonId }), 'assign')
}

async function ensureSubjects(admin: SupabaseClient): Promise<Map<string, string>> {
  const existing = must<{ id: string; name: string }[]>(await admin.from('school_subjects').select('id, name'), 'subjects')
  const subjects = new Map(existing.map((s) => [s.name, s.id]))
  for (const [i, name] of SUBJECT_NAMES.entries())
    if (!subjects.has(name)) subjects.set(name, must<{ id: string }>(await admin.from('school_subjects').insert({ name, sort: i }).select().single(), name).id)
  return subjects
}

// ── academic ──

async function ensureExam(admin: SupabaseClient, studentId: string, def: ExamDef): Promise<string> {
  const found = must<{ id: string } | null>(await admin.from('school_exams').select('id').eq('student_id', studentId).eq('title', def.title).limit(1).maybeSingle(), 'exam lookup')
  if (found) return found.id
  return must<{ id: string }>(
    await admin.from('school_exams').insert({ student_id: studentId, title: def.title, kind: 'mock', exam_date: daysAgo(def.daysAgo), notes: def.notes ?? null }).select().single(),
    def.title,
  ).id
}

/** Upserts exams, one result per subject, and the topic split for the subjects in TOPICS. Re-running updates in place. */
async function seedExams(admin: SupabaseClient, studentId: string, subjects: Map<string, string>, defs: ExamDef[], scores: Record<string, Score[]>, topicSubjects: string[]) {
  const nameOf = new Map([...subjects].map(([name, id]) => [id, name]))
  for (const [e, def] of defs.entries()) {
    const examId = await ensureExam(admin, studentId, def)
    const rows = SUBJECT_NAMES.map((name) => {
      const [correct, incorrect] = scores[name]![e]!
      return { exam_id: examId, subject_id: subjects.get(name)!, total: TOTALS[name]!, correct, incorrect, blank: TOTALS[name]! - correct - incorrect }
    })
    const results = must<{ id: string; subject_id: string }[]>(await admin.from('school_exam_results').upsert(rows, { onConflict: 'exam_id,subject_id' }).select('id, subject_id'), `${def.title} results`)
    const topicRows = results.flatMap((r) => {
      const name = nameOf.get(r.subject_id)!
      const row = rows.find((x) => x.subject_id === r.subject_id)!
      if (!topicSubjects.includes(name) || !TOPICS[name]) return []
      const split = (v: number) => {
        const a = Math.floor(v * 0.4)
        const b = Math.floor(v * 0.35)
        return [a, b, v - a - b]
      }
      const c = split(row.correct)
      const i = split(row.incorrect)
      const b = split(row.blank)
      return TOPICS[name].map((topic, k) => ({ result_id: r.id, topic, correct: c[k]!, incorrect: i[k]!, blank: b[k]! }))
    })
    if (topicRows.length) must(await admin.from('school_exam_result_topics').upsert(topicRows, { onConflict: 'result_id,topic' }), `${def.title} topics`)
  }
}

async function ensureTask(admin: SupabaseClient, studentId: string, t: { title: string; description: string; dueDays: number; subjectId: string; lessonId?: string; done?: boolean }) {
  const found = must<{ id: string } | null>(await admin.from('student_tasks').select('id').eq('student_id', studentId).eq('title', t.title).limit(1).maybeSingle(), 'task lookup')
  if (found) return
  const row = must<{ id: string }>(
    await admin.rpc('admin_assign_task', {
      p_student_id: studentId,
      p_title: t.title,
      p_description: t.description,
      p_due_date: daysAgo(t.dueDays),
      p_subject_id: t.subjectId,
      p_lesson_id: t.lessonId ?? null,
    }),
    `task ${t.title}`,
  )
  if (t.done) must(await admin.rpc('admin_update_task', { p_task_id: row.id, p_status: 'done' }), `done ${t.title}`)
}

// ── learning activity (through the student RPCs) ──

/** Ada: Unit 1 vocabulary done, vocab quiz partly done, story done, stopped in the explanation step. */
async function adaActivity(student: SupabaseClient, lessonId: string, pkg: LessonPackage) {
  const session = must<{ id: string } | { session: { id: string } }>(await student.rpc('start_or_resume_session', { lesson_id: lessonId, kind: 'primary' }), 'session')
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
  const brk = must<{ id: string }>(await student.rpc('start_break', { session_id: sessionId, after_section: 'vocab_quiz', planned_minutes: 10 }), 'break')
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
}

/** Emir: short first session, Unit 1 vocabulary started and a few misses, vocab quiz never finished. */
async function emirActivity(student: SupabaseClient, lessonId: string, pkg: LessonPackage) {
  const session = must<{ id: string } | { session: { id: string } }>(await student.rpc('start_or_resume_session', { lesson_id: lessonId, kind: 'primary' }), 'emir session')
  const sessionId = 'session' in session ? session.session.id : session.id
  must(await student.rpc('complete_section', { session_id: sessionId, section: 'vocabulary' }), 'emir vocabulary')
  const attempts: [string, boolean][] = [
    ['v-wake-up', true],
    ['v-get-up', false],
    ['v-have-breakfast', false],
    ['v-brush-teeth', true],
  ]
  for (const [itemId, ok] of attempts) {
    const v = pkg.vocabulary.find((x) => x.id === itemId)!
    const chosen = ok ? v.tr : pkg.vocabulary.find((x) => x.id !== itemId)!.tr
    must(await student.rpc('record_vocab_answer', { session_id: sessionId, item_id: itemId, direction: 'en_tr', chosen, response_ms: ok ? 3200 : 6100, client_id: randomUUID() }), `emir vocab ${itemId}`)
  }
  must(await student.rpc('save_section_state', { session_id: sessionId, section: 'vocabulary', state: {}, active_seconds_delta: 420 }), 'emir time')
}

/**
 * Three completed Unit 1 replays for Ada, dated over the last six weeks. The replay RPCs only
 * create sessions now and Ada's Unit 1 is not finished, so the rows are written directly with
 * fixed ids (re-running does nothing). Each replay has a vocab_quiz section progress row and one
 * question_attempts row per item, matching the correct count.
 */
function backdateAdaReplays(studentId: string, assignmentId: string, lessonId: string, packageId: string) {
  const sql = REPLAYS.map((r) => {
    const sid = `da000000-0000-4000-8000-00000000000${r.n}`
    const at = `now() - interval '${r.daysAgo} days'`
    const items = UNIT1_QUIZ_ITEMS.map((i) => `'${i}'`).join(',')
    return `do $$ begin
  if not exists (select 1 from lugu.learning_sessions where id = '${sid}') then
    insert into lugu.learning_sessions (id, student_id, assignment_id, lesson_id, package_id, kind, status, active_seconds, started_at, last_seen_at, completed_at)
    values ('${sid}', '${studentId}', '${assignmentId}', '${lessonId}', '${packageId}', 'replay', 'completed', 540, ${at}, ${at} + interval '15 minutes', ${at} + interval '15 minutes');
    insert into lugu.session_section_progress (session_id, section, status, attempts_count, correct_count, active_seconds, started_at, completed_at)
    values ('${sid}', 'vocab_quiz', 'completed', ${UNIT1_QUIZ_ITEMS.length}, ${r.correct}, 240, ${at}, ${at} + interval '6 minutes');
    insert into lugu.question_attempts (session_id, student_id, package_id, section, question_id, attempt_no, response, correct, response_ms, hint_used, created_at)
    select '${sid}', '${studentId}', '${packageId}', 'vocab_quiz', q.id, 1, jsonb_build_object('item', q.id), q.ord <= ${r.correct}, 2600, false, ${at} + q.ord * interval '30 seconds'
    from unnest(array[${items}]::text[]) with ordinality as q(id, ord);
  end if;
end $$;`
  }).join('\n')
  psql(sql)
}

// ── main ──

async function main() {
  const pkg1 = LessonPackage.parse({ ...lessonPackageFixture, meta: { ...lessonPackageFixture.meta, themeId: 'u1-morning' }, play: UNIT1_PLAY })
  const pkg2 = LessonPackage.parse(unit2PackageInput)
  const admin = await signIn('admin@lugu.local', process.env.LUGU_ADMIN_PASSWORD ?? '')

  // Curriculum, packages (Unit 1 gets the play plan, Unit 2 is published), then the version.
  const { version, lesson1, lesson2 } = await ensureCurriculum(admin, pkg1)
  await ensurePublishedPackage(admin, lesson1.id, pkg1, adminFixture.teacherGuide, adminFixture.speakingPlan ?? null)
  await ensurePublishedPackage(admin, lesson2.id, pkg2, unit2TeacherGuide, null)
  if (version.status === 'draft') must(await admin.rpc('admin_publish_version', { version_id: version.id }), 'publish version')
  const unit1PackageId = must<{ id: string }>(await admin.from('lesson_content_packages').select('id').eq('lesson_id', lesson1.id).eq('status', 'published').single(), 'unit 1 package').id

  const subjects = await ensureSubjects(admin)
  const schoolRow = (s: { client: SupabaseClient }) => s.client.rpc('add_school', { name: SCHOOL.name, city: SCHOOL.city, district: SCHOOL.district })

  // ── Ada (LUGU-1001) ──
  const ada = await ensureStudent(admin, ADA)
  const adaSchool = must<{ id: string }>(await schoolRow({ client: ada.client }), 'add_school')
  await ensureProfile(ADA, ada.client, adaSchool.id)
  await ensureAssignment(admin, ada.id, version.id, lesson1.id)
  const adaSessions = must<{ id: string }[]>(await admin.from('learning_sessions').select('id').eq('student_id', ada.id), 'ada sessions')
  if (adaSessions.length === 0) await adaActivity(ada.client, lesson1.id, pkg1)
  await seedExams(admin, ada.id, subjects, ADA_EXAMS, ADA_SCORES, Object.keys(TOPICS))
  const adaAssignment = must<{ id: string }>(await admin.from('program_assignments').select('id').eq('student_id', ada.id).in('status', ['active', 'paused']).single(), 'ada assignment')
  if (!must<{ id: string }[]>(await admin.from('learning_sessions').select('id').eq('student_id', ada.id).eq('kind', 'replay'), 'replays').length)
    backdateAdaReplays(ada.id, adaAssignment.id, lesson1.id, unit1PackageId)

  const adaSpeaking = must<{ id: string }[]>(await admin.from('speaking_sessions').select('id').eq('student_id', ada.id), 'speaking lookup')
  if (adaSpeaking.length === 0) {
    const at = (d: number, h: number) => new Date(Date.now() - d * 86_400_000 + h * 3_600_000).toISOString()
    const speaking = [
      { planned: at(14, 0), start: at(14, 0), end: at(14, 0.95), obs: 'Kelimeleri tanıyor ama cümle kurarken duraksıyor. "He go" / "he goes" karışıklığı sık.', strengths: 'Dinlediğini iyi anlıyor; soruları doğru yorumluyor.', goals: '3. tekil şahısta -s eki; günlük rutini 5 cümleyle anlatmak.', follow: 'Her gün sabah rutinini sesli anlatıp kaydetmesi önerildi.' },
      { planned: at(7, 0), start: at(7, 0), end: at(7, 1), obs: '-s ekini çoğunlukla doğru kullanıyor; "What time do you…?" sorusunda tereddüt var. Özgüveni artmış.', strengths: 'Rol oyununda gönüllü; telaffuzu net.', goals: 'Saat sorma/söyleme; sıklık zarfları (always, usually, sometimes).', follow: 'Haftaya rol oyunu: okul sabahı planlama.' },
    ]
    for (const s of speaking) {
      const row = must<{ id: string }>(
        await admin.from('speaking_sessions').insert({ student_id: ada.id, lesson_id: lesson1.id, planned_at: s.planned, started_at: s.start, ended_at: s.end, status: 'ended' }).select().single(),
        'speaking',
      )
      must(await admin.from('speaking_session_notes').insert({ speaking_session_id: row.id, observations: s.obs, strengths: s.strengths, goals: s.goals, follow_up: s.follow }), 'speaking notes')
    }
    must(await admin.from('speaking_sessions').insert({ student_id: ada.id, lesson_id: lesson1.id, planned_at: at(-2, 17), status: 'planned', plan: adminFixture.speakingPlan ?? null }), 'next speaking')
  }

  must(
    await admin.from('student_learning_profiles').upsert({
      student_id: ada.id,
      teacher_observations: 'Ada istekli ve düzenli çalışıyor. Okuduğunu anlama güçlü; konuşmada cümle kurma ve 3. tekil şahıs -s eki üzerinde çalışıyoruz. Matematik netleri yükselişte; son denemede Fen düştü (süre yönetimi).',
      observed: {},
      ai_interpretation: {},
    }),
    'ada observations',
  )

  await ensureTask(admin, ada.id, { title: 'Matematik sayılar tekrarı', description: 'Sayılar konusundaki 20 soruyu tekrar çöz.', dueDays: 10, subjectId: subjects.get('Matematik')!, done: true })
  await ensureTask(admin, ada.id, { title: 'Ünite 1 kelime listesi', description: 'Ünite 1 kelimelerini sesli söyle.', dueDays: 3, subjectId: subjects.get('İngilizce')!, lessonId: lesson1.id })
  await ensureTask(admin, ada.id, { title: 'Fen deneme hata analizi', description: 'Son denemedeki yanlışları konuya göre yaz.', dueDays: -4, subjectId: subjects.get('Fen Bilimleri')! })

  // ── Emir (LUGU-1002) ──
  const emir = await ensureStudent(admin, EMIR)
  await ensureProfile(EMIR, emir.client, adaSchool.id)
  await ensureAssignment(admin, emir.id, version.id, lesson1.id)
  const emirSessions = must<{ id: string }[]>(await admin.from('learning_sessions').select('id').eq('student_id', emir.id), 'emir sessions')
  if (emirSessions.length === 0) await emirActivity(emir.client, lesson1.id, pkg1)
  await seedExams(admin, emir.id, subjects, EMIR_EXAMS, EMIR_SCORES, ['Matematik', 'Fen Bilimleri'])
  must(
    await admin.from('student_learning_profiles').upsert({
      student_id: emir.id,
      teacher_observations: 'Emir kısa oturumlar çalışıyor; Ünite 1 kelime aşamasında takılı. Matematik ve Fen netleri son 4 denemede düşüyor.',
      observed: {},
      ai_interpretation: {},
    }),
    'emir observations',
  )
  await ensureTask(admin, emir.id, { title: 'Ünite 1 kelimelerini tekrar et', description: 'Piko ile 15 kelimeyi bir kez daha oku.', dueDays: 6, subjectId: subjects.get('İngilizce')!, lessonId: lesson1.id })
  await ensureTask(admin, emir.id, { title: 'Matematik deneme hata analizi', description: 'Son denemedeki yanlışları konuya göre yaz.', dueDays: -6, subjectId: subjects.get('Matematik')! })

  console.log(`done: Ada ${ada.id}, Emir ${emir.id}, curriculum ${version.id} (version), unit 1 package ${unit1PackageId}. Ada and Emir passwords are the demo ones.`)
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
