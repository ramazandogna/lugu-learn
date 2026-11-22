import { LessonPackage } from '@/domain/content'
import type { Harness } from './harness'

/** A small valid package; `title` varies per lesson. Parsed through the real schema so drift fails here. */
export function testPackage(title: string, overrides: { minAssessmentPercent?: number } = {}): LessonPackage {
  return LessonPackage.parse({
    schemaVersion: 1,
    meta: {
      title,
      tagline: 'Sabah rutinini anlat',
      theme: 'morning',
      character: 'piko',
      level: 'A1',
      estimatedMinutes: 30,
      objectives: [{ id: 'obj-routine', text: 'Talk about a morning routine' }],
    },
    review: { questions: [{ id: 'rv-1', type: 'choice', prompt: 'Pick hello', options: ['hello', 'bye'], answer: 0 }] },
    vocabulary: [
      { id: 'wake-up', en: 'wake up', tr: 'uyanmak', example: { en: 'I wake up at seven.', tr: 'Yedide uyanırım.' }, difficulty: 1 },
      { id: 'have-breakfast', en: 'have breakfast', tr: 'kahvaltı yapmak', example: { en: 'I have breakfast.', tr: 'Kahvaltı yaparım.' }, difficulty: 1 },
      { id: 'brush-teeth', en: 'brush my teeth', tr: 'dişlerimi fırçalamak', example: { en: 'I brush my teeth.', tr: 'Dişlerimi fırçalarım.' }, difficulty: 2 },
    ],
    story: {
      title: 'Piko wakes up',
      character: 'piko',
      setting: 'home',
      scenes: [{ id: 'sc-1', lines: [{ speaker: 'piko', en: 'Good morning!', tr: 'Günaydın!' }] }],
      questions: [
        { id: 'st-1', type: 'choice', prompt: 'What does Piko say?', options: ['Good morning', 'Good night'], answer: 0 },
        { id: 'st-2', type: 'text', prompt: 'Piko says good ...', accept: ['morning'] },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-1',
          title: 'Present simple',
          body: 'Rutinler için **present simple** kullanırız.',
          check: { id: 'ex-1-check', type: 'choice', prompt: 'I ___ up.', options: ['wake', 'wakes'], answer: 0 },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'obj-routine',
          complete: { id: 'hw-1-c', type: 'text', prompt: 'I ___ breakfast.', accept: ['have'] },
          order: { id: 'hw-1-o', type: 'order', prompt: 'Order it', tokens: ['breakfast', 'I', 'have'], answer: ['I', 'have', 'breakfast'] },
          meaning: { id: 'hw-1-m', type: 'choice', prompt: 'Kahvaltı yaparım', options: ['I have breakfast', 'I sleep'], answer: 0 },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-1', type: 'choice', prompt: 'She ___ up at 7.', options: ['wake', 'wakes', 'waking'], answer: 1 },
        { id: 'as-2', type: 'text', prompt: 'Uyanmak = ___ up', accept: ['wake'], hint: 'w...', explain: 'wake up' },
        { id: 'as-3', type: 'order', prompt: 'Order', tokens: ['I', 'teeth', 'brush', 'my'], answer: ['I', 'brush', 'my', 'teeth'] },
      ],
      reading: {
        title: 'Morning',
        paragraphs: ['Ali wakes up at seven. He has breakfast.'],
        questions: [
          { id: 'rd-1', type: 'choice', prompt: 'Ali wakes up at seven.', options: ['True', 'False'], answer: 0 },
          { id: 'rd-2', type: 'choice', prompt: 'Ali has lunch.', options: ['True', 'False'], answer: 1 },
        ],
      },
    },
    completion: {
      requireVocabMastery: true,
      requireStory: true,
      requireHomework: true,
      requireAssessment: true,
      minAssessmentPercent: overrides.minAssessmentPercent ?? 0,
    },
  })
}

/** Correct assessment answers for {@link testPackage}. */
export const correctAssessment = {
  'as-1': 1,
  'as-2': 'Wake',
  'as-3': ['I', 'brush', 'my', 'teeth'],
  'rd-1': 0,
  'rd-2': 1,
}

export interface Program {
  curriculumId: string
  versionId: string
  lessonIds: string[]
  packageIds: string[]
}

/** Creates a published version with `lessons` lessons, each with a published package (as superuser). */
export async function createProgram(h: Harness, lessons = 3, opts: { minAssessmentPercent?: number } = {}): Promise<Program> {
  const { db } = h
  const curriculumId = (
    await db.query<{ id: string }>(`insert into lugu.curricula (name, grade) values ('Test curriculum', 6) returning id`)
  ).rows[0]!.id
  const versionId = (
    await db.query<{ id: string }>(`insert into lugu.curriculum_versions (curriculum_id, version) values ($1, 1) returning id`, [
      curriculumId,
    ])
  ).rows[0]!.id
  const lessonIds: string[] = []
  const packageIds: string[] = []
  for (let i = 1; i <= lessons; i++) {
    const lessonId = (
      await db.query<{ id: string }>(
        `insert into lugu.curriculum_lessons (version_id, sequence, title, status) values ($1, $2, $3, 'ready') returning id`,
        [versionId, i, `Lesson ${i}`],
      )
    ).rows[0]!.id
    const packageId = (
      await db.query<{ id: string }>(
        `insert into lugu.lesson_content_packages (lesson_id, revision, status, content) values ($1, 1, 'published', $2) returning id`,
        [lessonId, JSON.stringify(testPackage(`Lesson ${i}`, opts))],
      )
    ).rows[0]!.id
    lessonIds.push(lessonId)
    packageIds.push(packageId)
  }
  await db.query(`update lugu.curriculum_versions set status = 'published' where id = $1`, [versionId])
  return { curriculumId, versionId, lessonIds, packageIds }
}

export interface SessionPayload {
  session: { id: string; kind: string; status: string; package_id: string; lesson_id: string }
  sections: { section: string; status: string; state: Record<string, unknown> }[]
}

/** Drives one primary/replay session through every section to a completable state. */
export async function playThrough(
  h: Harness,
  studentId: string,
  sessionId: string,
  answers: Record<string, unknown> = correctAssessment,
): Promise<void> {
  const call = (name: string, args: Record<string, unknown>) => h.rpc(studentId, name, { session_id: sessionId, ...args })
  await call('complete_section', { section: 'vocabulary' })
  for (const [item, tr] of [
    ['wake-up', 'uyanmak'],
    ['have-breakfast', 'kahvaltı yapmak'],
    ['brush-teeth', 'dişlerimi fırçalamak'],
  ] as const) {
    await call('record_vocab_answer', { item_id: item, direction: 'en_tr', chosen: tr })
    await call('record_vocab_answer', { item_id: item, direction: 'en_tr', chosen: tr })
  }
  await call('complete_section', { section: 'vocab_quiz' })
  await call('record_answer', { section: 'story', question_id: 'st-1', response: 0 })
  await call('record_answer', { section: 'story', question_id: 'st-2', response: 'nope' })
  await call('complete_section', { section: 'story' })
  await call('complete_section', { section: 'explanation' })
  await call('record_answer', { section: 'homework', question_id: 'hw-1-c', response: 'have' })
  await call('record_answer', { section: 'homework', question_id: 'hw-1-o', response: ['I', 'have', 'breakfast'] })
  await call('record_answer', { section: 'homework', question_id: 'hw-1-m', response: 0 })
  await call('complete_section', { section: 'homework' })
  await call('submit_assessment', { answers })
  await call('complete_section', { section: 'assessment' })
}
