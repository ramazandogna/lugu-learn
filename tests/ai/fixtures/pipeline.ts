/** Fixtures and fakes for the AI pipeline tests: no network, no database. */
import type { z } from 'zod'
import type { AdminMaterialDraft, LessonPlan } from '../../../supabase/functions/_shared/ai/lesson-pipeline.ts'
import type { LessonContext } from '../../../supabase/functions/_shared/ai/context.ts'
import type { ModelClient, ModelRequest, ModelResponse } from '../../../supabase/functions/_shared/ai/model.ts'
import type {
  AiJobPatch,
  AiJobRow,
  JobStore,
  LessonDraft,
  LessonStore,
  NewAiJob,
} from '../../../supabase/functions/_shared/ai/store.ts'
import { lessonPackageFixture } from './lesson-package.ts'

export const planFixture: LessonPlan = {
  analysis: {
    level: 'A1–A2',
    objectives: [
      { id: 'obj-routines', text: 'Günlük rutinlerini I / you / we ile anlatır (Present Simple).' },
      { id: 'obj-third-person', text: 'Başkasının rutinini he / she ile anlatır (-s / -es, has, does, goes).' },
      { id: 'obj-time', text: 'Zaman ifadelerini kullanır.' },
    ],
    grammar: ['present simple I/you/we', 'present simple he/she', 'time expressions'],
    vocabularyCandidates: [
      'wake up', 'get up', 'have breakfast', 'brush my teeth', 'get dressed', 'catch the bus', 'go to school', 'be late for',
      'have lunch', 'after school', 'do my homework', 'play football', 'take a shower', 'watch TV', 'go to bed', 'have dinner',
    ],
    prerequisites: ['to be: am / is / are', 'greetings'],
    scope: 'Daily routines on a school day with the present simple, affirmative.',
    outOfScope: ['negative and question forms with do/does (next lesson)', 'adverbs of frequency in detail'],
    skills: ['vocabulary', 'reading', 'speaking'],
  },
  design: {
    theme: 'Daily routines',
    setting: 'Piko’s Monday: home, bus stop, school',
    character: 'piko',
    strategy: 'Chunks in flashcards → see them in the story → notice -s in the explanation → linked homework.',
    cognitiveLoad: 'One grammar point (third-person -s) on top of known I/you forms; 15 chunks.',
    estimatedMinutes: 60,
    sections: [
      { key: 'review', minutes: 4, focus: 'to be' },
      { key: 'vocabulary', minutes: 8, focus: 'routine chunks' },
      { key: 'vocab_quiz', minutes: 8, focus: 'mastery' },
      { key: 'story', minutes: 10, focus: 'chunks in context' },
      { key: 'explanation', minutes: 8, focus: '-s / -es' },
      { key: 'homework', minutes: 12, focus: 'linked groups' },
      { key: 'assessment', minutes: 10, focus: 'quiz + reading' },
    ],
    reviewFocus: ['is / am / are', 'Nice to meet you'],
  },
}

const block = (minutes: number, activities: string[]) => ({ minutes, activities })

export const adminFixture: z.infer<typeof AdminMaterialDraft> = {
  teacherGuide: {
    objective: 'Öğrenci kendi ve başkalarının günlük rutinlerini Present Simple ile anlatır.',
    vocabulary: lessonPackageFixture.vocabulary.map((v) => v.en),
    grammar: ['I / you / we + yalın fiil', 'he / she + -s / -es; has, does, goes', 'at + saat, after school, every Monday'],
    expectedDifficulties: ['He / she ile -s eklemeyi unutmak', 'have → has dönüşümü', '“do homework” yerine “make homework”'],
    commonErrors: [
      { error: 'She have lunch.', correction: 'She has lunch.' },
      { error: 'He go to school.', correction: 'He goes to school.' },
      { error: 'I make my homework.', correction: 'I do my homework.' },
    ],
    questionsToAsk: ['What time do you wake up?', 'What does your brother do after school?'],
    speakingPrompts: ['Describe your Monday in five sentences.', 'Tell me about a friend’s routine.'],
    rolePlay: { situation: 'A new student asks about the school day.', roles: ['new student', 'Lugu learner'], steps: ['Greet', 'Ask about times', 'Describe the day', 'Say goodbye'] },
    listening: { script: 'Leo wakes up at seven. He has breakfast and catches the bus at eight.', questions: ['What time does Leo wake up?', 'How does he go to school?'] },
    reinforcement: ['Third-person -s drill with photos of family members'],
    suggestedActivities: ['Draw a routine timeline and present it'],
  },
  speakingPlan: {
    warmUp: block(5, ['Ask: How was your Monday? (Pazartesi gününü sor.)']),
    vocabulary: block(10, ['Picture cards: the learner says the routine chunk and one sentence with it.']),
    grammar: block(10, ['What does Piko do at 7? → He wakes up. Repeat with the other characters.']),
    rolePlay: block(10, ['A new student asks about your school day; switch roles.']),
    listening: { ...block(8, ['Read the script twice; ask the two questions.']), script: 'Sasha gets up at half past six. She has breakfast, brushes her teeth and catches the bus at eight. After school she does her homework.' },
    weaknessReinforcement: block(8, ['he / she + -s: correct five sentences together.']),
    freeSpeaking: block(7, ['Talk about your favourite day of the week.']),
    closingTask: { task: 'Write three sentences about a family member’s routine for next week.' },
  },
  visualPlan: {
    character: 'piko',
    scenes: [
      { sceneId: 'sc-morning', description: 'Piko jumps out of bed; alarm clock at 7:00.' },
      { sceneId: 'sc-bus-stop', description: 'Sasha and Piko run; Momo with odd shoes.' },
      { sceneId: 'sc-school', description: 'Canteen: Dora, Piko; Leo with a football.' },
      { sceneId: 'sc-evening', description: 'Piko on the sofa after a shower; clock at 9:30.' },
    ],
  },
}

/** The three content parts of the fixture, as the content steps return them. */
export function contentParts() {
  const p = lessonPackageFixture
  return {
    core: { meta: p.meta, vocabulary: p.vocabulary, story: p.story },
    practice: { explanation: p.explanation, homework: p.homework },
    assessment: { assessment: p.assessment, review: p.review },
  }
}

export const lessonContextFixture: LessonContext = {
  curriculum: { name: 'Lugu A1 Starter', grade: '6', targetLevel: 'A1', description: 'Everyday English for 6th graders' },
  lesson: {
    id: '00000000-0000-4000-8000-000000000101',
    sequence: 2,
    title: 'Daily routines',
    objectives: planFixture.analysis.objectives,
    estimatedMinutes: 60,
    sourceNotes: null,
  },
  sources: [
    { id: 'src-1', kind: 'text', title: 'Unit 2 – My Day', text: 'Unit 2: Daily routines. Present simple affirmative, he/she -s. Vocabulary: wake up, get up, have breakfast…' },
  ],
  previousLessons: [{ sequence: 1, title: 'Hello!', vocabulary: ['nice to meet you', 'how are you'], grammar: ['to be'] }],
  classWeakItems: [{ label: 'nice to meet you', errorRate: 0.4, attempts: 10 }],
  adminInstructions: null,
}

type Reply = string | ((req: ModelRequest) => string)

const usage = { inputTokens: 1000, outputTokens: 500, cacheReadInputTokens: 0, cacheCreationInputTokens: 0 }

/**
 * A scripted model: each stage prefix has a queue of replies; the last reply
 * repeats. Every request is recorded for assertions.
 */
export class FakeModel implements ModelClient {
  readonly model = 'fake-model'
  readonly requests: ModelRequest[] = []
  private readonly queues = new Map<string, Reply[]>()

  on(stage: string, ...replies: Reply[]): this {
    this.queues.set(stage, replies)
    return this
  }

  calls(stagePrefix: string): ModelRequest[] {
    return this.requests.filter((r) => r.stage === stagePrefix || r.stage.startsWith(`${stagePrefix}_`) || r.stage.startsWith(`${stagePrefix}:`))
  }

  async generate(req: ModelRequest): Promise<ModelResponse> {
    this.requests.push(req)
    const base = req.stage.replace(/:repair$/, '').replace(/_\d+$/, '')
    const q = this.queues.get(req.stage) ?? this.queues.get(base)
    if (!q?.length) throw new Error(`FakeModel: no reply scripted for stage ${req.stage}`)
    const next = q.length > 1 ? (q.shift() as Reply) : (q[0] as Reply)
    const text = typeof next === 'function' ? next(req) : next
    return { text, stopReason: 'end_turn', model: this.model, usage }
  }
}

/** A model scripted with valid fixture output for every lesson step. */
export function happyLessonModel(): FakeModel {
  const parts = contentParts()
  return new FakeModel()
    .on('plan', JSON.stringify(planFixture))
    .on('content_core', JSON.stringify(parts.core))
    .on('content_practice', JSON.stringify(parts.practice))
    .on('content_assessment', JSON.stringify(parts.assessment))
    .on('qa_round', JSON.stringify({ issues: [{ severity: 'minor', section: 'story', message: 'sc-evening could use one more line of dialogue.' }] }))
    .on('admin_material', JSON.stringify(adminFixture))
}

export class MemoryJobs implements JobStore {
  readonly rows = new Map<string, AiJobRow & { history: AiJobPatch[]; error?: string | null; packageId?: string }>()
  private n = 0

  async create(job: NewAiJob) {
    const id = `00000000-0000-4000-8000-${String(++this.n).padStart(12, '0')}`
    this.rows.set(id, { id, kind: job.kind, status: 'queued', stage: 'queued', input: job.input, output: null, updatedAt: new Date().toISOString(), history: [] })
    return { id }
  }

  async get(id: string) {
    return this.rows.get(id) ?? null
  }

  async claim(id: string, expectedUpdatedAt: string, stage: string) {
    const row = this.rows.get(id)
    if (!row || row.updatedAt !== expectedUpdatedAt || (row.status !== 'queued' && row.status !== 'running')) return false
    row.stage = stage
    row.updatedAt = new Date(Date.parse(row.updatedAt) + 1).toISOString()
    return true
  }

  async update(id: string, p: AiJobPatch) {
    const row = this.rows.get(id)
    if (!row) throw new Error(`no job ${id}`)
    row.history.push(p)
    if (p.status) row.status = p.status
    if (p.stage !== undefined) row.stage = p.stage
    if (p.output !== undefined) row.output = p.output
    if (p.error !== undefined) row.error = p.error
    if (p.packageId) row.packageId = p.packageId
    row.updatedAt = new Date().toISOString()
  }
}

export class MemoryLessons implements LessonStore {
  readonly drafts: LessonDraft[] = []
  constructor(private readonly ctx: LessonContext = lessonContextFixture) {}
  async loadLessonContext() {
    return this.ctx
  }
  async saveDraft(d: LessonDraft) {
    this.drafts.push(d)
    return { packageId: `pkg-${this.drafts.length}`, revision: this.drafts.length + 1 }
  }
}
