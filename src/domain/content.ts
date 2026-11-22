/**
 * The lesson content package: the single, versioned document a lesson is taught from.
 *
 * One package revision is immutable once published. Student progress and every
 * attempt reference `(package_id, item id)`, so editing a lesson creates a new
 * revision and never rewrites what a past attempt was graded against.
 *
 * The same schema validates AI output (edge function), the admin editor, and
 * what the student client receives. Admin-only material (teacher guide,
 * speaking plan, visual plan, QA report) lives in {@link AdminLessonMaterial}
 * and is stored apart from the student-visible package.
 */
import { z } from 'zod'

export const CHARACTER_KEYS = ['piko', 'sasha', 'momo', 'dora', 'leo'] as const
export const CharacterKey = z.enum(CHARACTER_KEYS)
export type CharacterKey = z.infer<typeof CharacterKey>

/** Stable id inside one package: lowercase slug, unique per package. */
const Id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/, 'id: lowercase letters, digits, dashes')
const Text = z.string().trim().min(1)

/**
 * A gradable question. Three shapes cover every activity:
 * - `choice`: pick one option (`answer` is the option index). True/false is a
 *   two-option choice.
 * - `order`: arrange `tokens` into a sentence; `answer` is the correct token order.
 * - `text`: type a short answer; any of `accept` is correct after normalisation
 *   (case, surrounding space, repeated spaces, final punctuation).
 *
 * Grading rules are implemented twice on purpose: `domain/grading.ts` for
 * instant feedback and `lugu.grade_response()` in SQL, which is authoritative.
 * `tests/db/grading.test.ts` keeps the two in agreement.
 */
const QuestionBase = z.object({
  id: Id,
  prompt: Text,
  /** Turkish helper line under the prompt, shown only where hints are allowed. */
  hint: z.string().optional(),
  /** Short Turkish explanation shown after answering (never in the final assessment). */
  explain: z.string().optional(),
  objectiveId: Id.optional(),
  /** The vocabulary item this question practises, for vocabulary analytics. */
  vocabId: Id.optional(),
})

export const ChoiceQuestion = QuestionBase.extend({
  type: z.literal('choice'),
  options: z.array(Text).min(2).max(6),
  answer: z.number().int().nonnegative(),
})
export const OrderQuestion = QuestionBase.extend({
  type: z.literal('order'),
  /** Shown shuffled. Must be a permutation of `answer`. */
  tokens: z.array(Text).min(2).max(14),
  answer: z.array(Text).min(2).max(14),
})
export const TextQuestion = QuestionBase.extend({
  type: z.literal('text'),
  accept: z.array(Text).min(1),
})

export const Question = z
  .discriminatedUnion('type', [ChoiceQuestion, OrderQuestion, TextQuestion])
  .superRefine((q, ctx) => {
    if (q.type === 'choice') {
      if (q.answer >= q.options.length) ctx.addIssue({ code: 'custom', message: `${q.id}: answer outside options` })
      if (new Set(q.options.map((o) => o.toLowerCase())).size !== q.options.length)
        ctx.addIssue({ code: 'custom', message: `${q.id}: duplicate options` })
    }
    if (q.type === 'order') {
      const a = [...q.tokens].sort().join('\u0000')
      const b = [...q.answer].sort().join('\u0000')
      if (a !== b) ctx.addIssue({ code: 'custom', message: `${q.id}: tokens are not a permutation of answer` })
    }
  })
export type Question = z.infer<typeof Question>

export const Objective = z.object({ id: Id, text: Text })

export const VocabItem = z.object({
  id: Id,
  /** A phrase or collocation preferred over an isolated word: "have breakfast". */
  en: Text,
  tr: Text,
  example: z.object({ en: Text, tr: Text }),
  /** One line on when it is used, in Turkish. */
  context: z.string().optional(),
  difficulty: z.number().int().min(1).max(3),
  objectiveId: Id.optional(),
  illustration: z.string().optional(),
  audio: z.string().optional(),
})
export type VocabItem = z.infer<typeof VocabItem>

export const StoryLine = z.object({
  /** A character key, or `narrator`. */
  speaker: z.union([CharacterKey, z.literal('narrator')]),
  en: Text,
  tr: z.string().optional(),
})
export const StoryScene = z.object({
  id: Id,
  illustration: z.string().optional(),
  lines: z.array(StoryLine).min(1),
  /** An in-story decision. Every option is acceptable; feedback explains it. Not graded. */
  choice: z
    .object({
      prompt: Text,
      options: z.array(z.object({ text: Text, feedback: Text })).min(2).max(4),
    })
    .optional(),
})
export const Story = z.object({
  title: Text,
  character: CharacterKey,
  setting: Text,
  scenes: z.array(StoryScene).min(1),
  /** Comprehension questions after the story. Practice: hints and explanations allowed. */
  questions: z.array(Question).min(1),
})

export const ExplanationStep = z.object({
  id: Id,
  title: Text,
  /** Turkish, short: one idea per step. Plain text with `**bold**` only. */
  body: Text,
  examples: z.array(z.object({ en: Text, tr: Text })).max(6).default([]),
  /** Guided practice: one quick check per step. */
  check: Question.optional(),
})

/** Sentence completion → sentence ordering → meaning, all on one sentence/objective. */
export const HomeworkGroup = z.object({
  id: Id,
  objectiveId: Id,
  complete: Question,
  order: OrderQuestion,
  meaning: Question,
})

export const Assessment = z.object({
  /** About 10 questions, different from the homework. No hints, no explanations shown. */
  quiz: z.array(Question).min(3).max(20),
  reading: z.object({
    title: Text,
    paragraphs: z.array(Text).min(1),
    /** About 5 true/false (two-option choice) and 3 fill-in-the-blank (four options). */
    questions: z.array(Question).min(2).max(12),
  }),
})

export const CompletionRules = z.object({
  /** Every vocabulary item mastered (two correct answers). Primary progression rule. */
  requireVocabMastery: z.boolean().default(true),
  requireStory: z.boolean().default(true),
  requireHomework: z.boolean().default(true),
  requireAssessment: z.boolean().default(true),
  /** Supplementary threshold on the final assessment; 0 means "completed is enough". */
  minAssessmentPercent: z.number().int().min(0).max(100).default(0),
})

export const LessonPackage = z
  .object({
    schemaVersion: z.literal(1),
    meta: z.object({
      title: Text,
      /** Turkish one-liner the student sees on the lesson card. */
      tagline: Text,
      theme: Text,
      character: CharacterKey,
      level: Text,
      estimatedMinutes: z.number().int().min(5).max(180),
      objectives: z.array(Objective).min(1),
      grammar: z.array(Text).default([]),
    }),
    /** Optional fixed review items; the runtime adds the student's weak items from earlier lessons. */
    review: z.object({ questions: z.array(Question).max(8) }).default({ questions: [] }),
    vocabulary: z.array(VocabItem).min(3).max(25),
    story: Story,
    explanation: z.object({ steps: z.array(ExplanationStep).min(1).max(8) }),
    homework: z.object({ groups: z.array(HomeworkGroup).min(1).max(12) }),
    assessment: Assessment,
    completion: CompletionRules.default({
      requireVocabMastery: true,
      requireStory: true,
      requireHomework: true,
      requireAssessment: true,
      minAssessmentPercent: 0,
    }),
  })
  .superRefine((p, ctx) => {
    const ids = new Set<string>()
    const objectives = new Set(p.meta.objectives.map((o) => o.id))
    const vocab = new Set(p.vocabulary.map((v) => v.id))
    const seen = (id: string, where: string) => {
      if (ids.has(id)) ctx.addIssue({ code: 'custom', message: `duplicate id "${id}" (${where})` })
      ids.add(id)
    }
    p.vocabulary.forEach((v) => seen(v.id, 'vocabulary'))
    const questions: Question[] = [
      ...p.review.questions,
      ...p.story.questions,
      ...p.explanation.steps.flatMap((s) => (s.check ? [s.check] : [])),
      ...p.homework.groups.flatMap((g) => [g.complete, g.order, g.meaning]),
      ...p.assessment.quiz,
      ...p.assessment.reading.questions,
    ]
    questions.forEach((q) => {
      seen(q.id, 'question')
      if (q.objectiveId && !objectives.has(q.objectiveId))
        ctx.addIssue({ code: 'custom', message: `${q.id}: unknown objective ${q.objectiveId}` })
      if (q.vocabId && !vocab.has(q.vocabId))
        ctx.addIssue({ code: 'custom', message: `${q.id}: unknown vocabulary ${q.vocabId}` })
    })
    p.homework.groups.forEach((g) => {
      if (!objectives.has(g.objectiveId))
        ctx.addIssue({ code: 'custom', message: `${g.id}: unknown objective ${g.objectiveId}` })
    })
    const homeworkPrompts = new Set(p.homework.groups.flatMap((g) => [g.complete, g.order, g.meaning]).map((q) => q.prompt))
    p.assessment.quiz.forEach((q) => {
      if (homeworkPrompts.has(q.prompt)) ctx.addIssue({ code: 'custom', message: `${q.id}: assessment repeats a homework question` })
    })
  })
export type LessonPackage = z.infer<typeof LessonPackage>

/** Ordered sections of a lesson session. `review` never blocks completion. */
export const SECTION_KEYS = ['review', 'vocabulary', 'vocab_quiz', 'story', 'explanation', 'homework', 'assessment'] as const
export const SectionKey = z.enum(SECTION_KEYS)
export type SectionKey = z.infer<typeof SectionKey>

/* ── Admin-only material: stored in `lugu.lesson_admin_material`, never sent to students ── */

export const TeacherGuide = z.object({
  objective: Text,
  vocabulary: z.array(Text),
  grammar: z.array(Text),
  expectedDifficulties: z.array(Text),
  commonErrors: z.array(z.object({ error: Text, correction: Text })),
  questionsToAsk: z.array(Text),
  speakingPrompts: z.array(Text),
  rolePlay: z.object({ situation: Text, roles: z.array(Text), steps: z.array(Text) }),
  listening: z.object({ script: Text, questions: z.array(Text) }),
  reinforcement: z.array(Text),
  suggestedActivities: z.array(Text),
})
export type TeacherGuide = z.infer<typeof TeacherGuide>

const PlanBlock = z.object({ minutes: z.number().int().min(1).max(60), activities: z.array(Text).min(1) })
/** A ~60 minute weekly speaking session plan. */
export const SpeakingPlan = z.object({
  warmUp: PlanBlock,
  vocabulary: PlanBlock,
  grammar: PlanBlock,
  rolePlay: PlanBlock,
  listening: PlanBlock.extend({ script: Text }),
  weaknessReinforcement: PlanBlock,
  freeSpeaking: PlanBlock,
  closingTask: z.object({ task: Text }),
})
export type SpeakingPlan = z.infer<typeof SpeakingPlan>

export const VisualPlan = z.object({
  character: CharacterKey,
  scenes: z.array(z.object({ sceneId: Text, description: Text })),
})

export const QaReport = z.object({
  passed: z.boolean(),
  issues: z.array(
    z.object({
      severity: z.enum(['blocker', 'major', 'minor']),
      area: Text,
      message: Text,
    }),
  ),
  checkedAt: z.string(),
})
export type QaReport = z.infer<typeof QaReport>

export const AdminLessonMaterial = z.object({
  teacherGuide: TeacherGuide,
  speakingPlan: SpeakingPlan.optional(),
  visualPlan: VisualPlan.optional(),
})
export type AdminLessonMaterial = z.infer<typeof AdminLessonMaterial>
