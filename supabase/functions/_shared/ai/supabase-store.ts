/**
 * Supabase implementations of the persistence ports. Constructed with the
 * service-role client (server only); every query is in schema `lugu`.
 * Column names follow `supabase/migrations/0002–0005`.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { AdminLessonMaterial, LessonPackage, QaReport } from '@/domain/content.ts'
import { bytesToBase64, MAX_TEXT_SOURCE_CHARS, type ClassWeakItem, type CurriculumSource, type LessonContext, type PreviousLesson } from './context.ts'
import type { LearnerSnapshot, SpeakingNoteRow } from './insights/observed.ts'
import type { AiJobPatch, AiJobRow, InsightsStore, JobStore, LearnerContextLoad, LessonDraft, LessonStore, NewAiJob } from './store.ts'

const BUCKET = 'curriculum-sources'
/** PDFs above this size are rejected (request limit is 32 MB including base64 overhead). */
const MAX_PDF_BYTES = 20 * 1024 * 1024

type Res<T> = { data: T | null; error: { message: string } | null }
function must<T>(res: Res<T>, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`)
  if (res.data == null) throw new Error(`${what}: not found`)
  return res.data
}

const db = (c: SupabaseClient) => c.schema('lugu')

export function supabaseJobStore(client: SupabaseClient): JobStore {
  return {
    async create(job: NewAiJob) {
      const res = (await db(client)
        .from('ai_jobs')
        .insert({
          kind: job.kind,
          status: 'queued',
          stage: 'queued',
          input: job.input,
          lesson_id: job.lessonId ?? null,
          student_id: job.studentId ?? null,
          created_by: job.createdBy,
        })
        .select('id')
        .single()) as Res<{ id: string }>
      return must(res, 'create ai_job')
    },
    async get(id: string) {
      const res = (await db(client)
        .from('ai_jobs')
        .select('id, kind, status, stage, input, output, updated_at')
        .eq('id', id)
        .maybeSingle()) as Res<{
        id: string
        kind: AiJobRow['kind']
        status: AiJobRow['status']
        stage: string | null
        input: unknown
        output: unknown
        updated_at: string
      }>
      if (res.error) throw new Error(`get ai_job: ${res.error.message}`)
      const r = res.data
      return r ? { id: r.id, kind: r.kind, status: r.status, stage: r.stage, input: r.input, output: r.output, updatedAt: r.updated_at } : null
    },
    async claim(id: string, expectedUpdatedAt: string, stage: string) {
      const res = (await db(client)
        .from('ai_jobs')
        .update({ stage, error: null })
        .eq('id', id)
        .eq('updated_at', expectedUpdatedAt)
        .in('status', ['queued', 'running'])
        .select('id')) as Res<{ id: string }[]>
      return must(res, 'claim ai_job').length === 1
    },
    async update(id: string, p: AiJobPatch) {
      const row: Record<string, unknown> = {}
      if (p.status !== undefined) row.status = p.status
      if (p.stage !== undefined) row.stage = p.stage
      if (p.output !== undefined) row.output = p.output
      if (p.error !== undefined) row.error = p.error
      if (p.model !== undefined) row.model = p.model
      if (p.inputTokens !== undefined) row.input_tokens = p.inputTokens
      if (p.outputTokens !== undefined) row.output_tokens = p.outputTokens
      if (p.packageId !== undefined) row.package_id = p.packageId
      const { error } = await db(client).from('ai_jobs').update(row).eq('id', id)
      if (error) throw new Error(`update ai_job: ${error.message}`)
    },
  }
}

function imageType(path: string): 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' {
  const ext = path.toLowerCase().split('.').pop()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
}

interface PackageRow {
  id: string
  lesson_id: string
  revision: number
  status: string
  content: unknown
}

/** Prefers the published revision, else the newest one. */
function pickPackage(rows: PackageRow[], lessonId: string): PackageRow | undefined {
  const own = rows.filter((r) => r.lesson_id === lessonId)
  return own.find((r) => r.status === 'published') ?? own.sort((a, b) => b.revision - a.revision)[0]
}

export function supabaseLessonStore(client: SupabaseClient): LessonStore {
  return {
    async loadLessonContext(lessonId, opts): Promise<LessonContext> {
      const lesson = must(
        (await db(client)
          .from('curriculum_lessons')
          .select('id, version_id, sequence, title, objective_ids, estimated_minutes, source_notes')
          .eq('id', lessonId)
          .single()) as Res<{
          id: string
          version_id: string
          sequence: number
          title: string
          objective_ids: string[]
          estimated_minutes: number | null
          source_notes: string | null
        }>,
        'lesson',
      )
      const version = must(
        (await db(client).from('curriculum_versions').select('id, curriculum_id').eq('id', lesson.version_id).single()) as Res<{
          id: string
          curriculum_id: string
        }>,
        'curriculum version',
      )
      const curriculum = must(
        (await db(client)
          .from('curricula')
          .select('name, description, grade, target_level')
          .eq('id', version.curriculum_id)
          .single()) as Res<{ name: string; description: string | null; grade: number | null; target_level: string | null }>,
        'curriculum',
      )
      const objectives = lesson.objective_ids.length
        ? must(
            (await db(client).from('curriculum_objectives').select('id, code, text, sort').in('id', lesson.objective_ids)) as Res<
              { id: string; code: string; text: string; sort: number }[]
            >,
            'objectives',
          ).sort((a, b) => a.sort - b.sort)
        : []

      // Sources: this lesson's, the version's general ones, and the curriculum's general ones.
      const srcRows = must(
        (await db(client)
          .from('curriculum_sources')
          .select('id, version_id, lesson_id, kind, title, storage_path, text_content')
          .eq('curriculum_id', version.curriculum_id)
          .order('created_at')) as Res<
          {
            id: string
            version_id: string | null
            lesson_id: string | null
            kind: 'text' | 'pdf' | 'image' | 'document'
            title: string
            storage_path: string | null
            text_content: string | null
          }[]
        >,
        'curriculum sources',
      ).filter((s) => s.lesson_id === lessonId || (s.lesson_id == null && (s.version_id == null || s.version_id === version.id)))

      const sources: CurriculumSource[] = []
      for (const s of srcRows) {
        if (s.text_content && (s.kind === 'text' || s.kind === 'document' || !s.storage_path)) {
          if (s.text_content.length > MAX_TEXT_SOURCE_CHARS)
            throw new Error(`source "${s.title}" is longer than ${MAX_TEXT_SOURCE_CHARS} characters; split it into smaller sources`)
          sources.push({ id: s.id, kind: s.kind === 'document' ? 'document' : 'text', title: s.title, text: s.text_content })
          continue
        }
        if (!s.storage_path) continue
        const file = await client.storage.from(BUCKET).download(s.storage_path)
        if (file.error || !file.data) throw new Error(`download ${s.storage_path}: ${file.error?.message ?? 'empty'}`)
        const bytes = new Uint8Array(await file.data.arrayBuffer())
        if (s.kind === 'pdf') {
          if (bytes.length > MAX_PDF_BYTES) throw new Error(`PDF "${s.title}" is larger than 20 MB`)
          sources.push({ id: s.id, kind: 'pdf', title: s.title, base64: bytesToBase64(bytes) })
        } else if (s.kind === 'image') {
          sources.push({ id: s.id, kind: 'image', title: s.title, mediaType: imageType(s.storage_path), base64: bytesToBase64(bytes) })
        } else {
          // A 'document' (e.g. .docx) without extracted text cannot be read by the model.
          throw new Error(`source "${s.title}" has no extracted text; paste its text or upload it as PDF`)
        }
      }

      // Earlier lessons in this version and what their packages taught.
      const earlier = must(
        (await db(client)
          .from('curriculum_lessons')
          .select('id, sequence, title')
          .eq('version_id', lesson.version_id)
          .lt('sequence', lesson.sequence)
          .order('sequence')) as Res<{ id: string; sequence: number; title: string }[]>,
        'previous lessons',
      )
      const pkgRows = earlier.length
        ? must(
            (await db(client)
              .from('lesson_content_packages')
              .select('id, lesson_id, revision, status, content')
              .in(
                'lesson_id',
                earlier.map((l) => l.id),
              )
              .neq('status', 'archived')) as Res<PackageRow[]>,
            'previous packages',
          )
        : []
      const previousLessons: PreviousLesson[] = []
      const labels = new Map<string, string>()
      const prevPackageIds: string[] = []
      for (const l of earlier) {
        const row = pickPackage(pkgRows, l.id)
        const pkg = row ? LessonPackage.safeParse(row.content) : null
        if (row && pkg?.success) {
          prevPackageIds.push(row.id)
          for (const v of pkg.data.vocabulary) labels.set(`${row.id}:${v.id}`, v.en)
          for (const g of pkg.data.homework.groups) labels.set(`${row.id}:${g.order.id}`, g.order.answer.join(' '))
        }
        previousLessons.push({
          sequence: l.sequence,
          title: l.title,
          vocabulary: pkg?.success ? pkg.data.vocabulary.map((v) => v.en) : [],
          grammar: pkg?.success ? pkg.data.meta.grammar : [],
        })
      }

      // Anonymised class-level weak items: error rates per item, no student ids leave the database query.
      let classWeakItems: ClassWeakItem[] = []
      if (opts.includeClassWeakItems && prevPackageIds.length) {
        const attempts = must(
          (await db(client)
            .from('question_attempts')
            .select('package_id, question_id, correct')
            .in('package_id', prevPackageIds)
            .in('section', ['vocab_quiz', 'homework', 'review'])
            .limit(5000)) as Res<{ package_id: string; question_id: string; correct: boolean }[]>,
          'class attempts',
        )
        const agg = new Map<string, { n: number; wrong: number }>()
        for (const a of attempts) {
          const k = `${a.package_id}:${a.question_id}`
          const e = agg.get(k) ?? { n: 0, wrong: 0 }
          e.n += 1
          if (!a.correct) e.wrong += 1
          agg.set(k, e)
        }
        classWeakItems = [...agg]
          .filter(([k, e]) => e.n >= 5 && labels.has(k))
          .map(([k, e]) => ({ label: labels.get(k) ?? k, attempts: e.n, errorRate: Math.round((e.wrong / e.n) * 100) / 100 }))
          .filter((i) => i.errorRate >= 0.3)
          .sort((a, b) => b.errorRate - a.errorRate)
          .slice(0, 10)
      }

      return {
        curriculum: {
          name: curriculum.name,
          description: curriculum.description,
          grade: curriculum.grade == null ? null : String(curriculum.grade),
          targetLevel: curriculum.target_level,
        },
        lesson: {
          id: lesson.id,
          sequence: lesson.sequence,
          title: lesson.title,
          objectives: objectives.map((o) => ({ id: o.code, text: o.text })),
          estimatedMinutes: lesson.estimated_minutes,
          sourceNotes: lesson.source_notes,
        },
        sources,
        previousLessons,
        classWeakItems,
        adminInstructions: opts.adminInstructions,
      }
    },

    async saveDraft(d: LessonDraft) {
      // `revision` is assigned by the lugu.package_before_write trigger (max + 1).
      const pkg = must(
        (await db(client)
          .from('lesson_content_packages')
          .insert({
            lesson_id: d.lessonId,
            status: 'ai_generated',
            origin: 'ai',
            content: LessonPackage.parse(d.content),
            ai_job_id: d.jobId,
          })
          .select('id, revision')
          .single()) as Res<{ id: string; revision: number }>,
        'insert package',
      )
      const admin = AdminLessonMaterial.parse(d.admin)
      const { error } = await db(client)
        .from('lesson_admin_material')
        .insert({
          package_id: pkg.id,
          teacher_guide: admin.teacherGuide,
          speaking_plan: admin.speakingPlan ?? null,
          visual_plan: admin.visualPlan ?? null,
          qa_report: QaReport.parse(d.qaReport),
        })
      if (error) throw new Error(`insert admin material: ${error.message}`)
      return { packageId: pkg.id, revision: pkg.revision }
    },
  }
}

function noteText(n: { observations: string | null; strengths: string | null; goals: string | null; follow_up: string | null }): string {
  return [
    n.observations && `Gözlem: ${n.observations}`,
    n.strengths && `Güçlü yönler: ${n.strengths}`,
    n.goals && `Hedefler: ${n.goals}`,
    n.follow_up && `Takip: ${n.follow_up}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function supabaseInsightsStore(client: SupabaseClient): InsightsStore {
  return {
    async loadLearner(studentId, since): Promise<LearnerContextLoad> {
      const q = db(client)
      const sp = must(
        (await q
          .from('student_profiles')
          .select('user_id, student_code, first_name, last_name, display_name, grade, school_id')
          .eq('user_id', studentId)
          .single()) as Res<{
          user_id: string
          student_code: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          grade: number | null
          school_id: string | null
        }>,
        'student',
      )
      const school = sp.school_id
        ? ((await q.from('schools').select('name').eq('id', sp.school_id).maybeSingle()) as Res<{ name: string }>).data
        : null
      const gte = <T extends { gte: (c: string, v: string) => T }>(b: T, col: string) => (since ? b.gte(col, since) : b)

      const attempts = must(
        (await gte(
          q
            .from('question_attempts')
            .select('question_id, package_id, section, correct, response_ms, hint_used, created_at')
            .eq('student_id', studentId),
          'created_at',
        )
          .order('created_at', { ascending: false })
          .limit(5000)) as Res<
          { question_id: string; package_id: string; section: string; correct: boolean; response_ms: number | null; hint_used: boolean; created_at: string }[]
        >,
        'attempts',
      )
      const mastery = must(
        (await q
          .from('vocabulary_mastery')
          .select('item_id, package_id, correct_count, incorrect_count, mastered_at')
          .eq('student_id', studentId)) as Res<
          { item_id: string; package_id: string; correct_count: number; incorrect_count: number; mastered_at: string | null }[]
        >,
        'mastery',
      )
      const sessions = must(
        (await gte(
          q
            .from('learning_sessions')
            .select('id, kind, status, active_seconds, idle_seconds, break_seconds, started_at')
            .eq('student_id', studentId),
          'started_at',
        ).limit(500)) as Res<
          {
            id: string
            kind: 'primary' | 'replay'
            status: 'active' | 'completed' | 'abandoned'
            active_seconds: number
            idle_seconds: number
            break_seconds: number
            started_at: string
          }[]
        >,
        'sessions',
      )
      const breaks = must(
        (await gte(q.from('break_sessions').select('planned_minutes, early_return').eq('student_id', studentId), 'started_at').limit(1000)) as Res<
          { planned_minutes: number; early_return: boolean | null }[]
        >,
        'breaks',
      )
      const assessments = must(
        (await gte(
          q.from('assessment_results').select('percent, quiz_percent, reading_percent, submitted_at').eq('student_id', studentId),
          'submitted_at',
        )) as Res<{ percent: number | string; quiz_percent: number | string; reading_percent: number | string; submitted_at: string }[]>,
        'assessments',
      )
      const exams = must(
        (await q.from('school_exams').select('id, exam_date').eq('student_id', studentId)) as Res<{ id: string; exam_date: string }[]>,
        'exams',
      )
      const examResults = exams.length
        ? must(
            (await q
              .from('school_exam_results')
              .select('exam_id, net, subject_id')
              .in(
                'exam_id',
                exams.map((e) => e.id),
              )) as Res<{ exam_id: string; net: number | string; subject_id: string }[]>,
            'exam results',
          )
        : []
      const subjects = examResults.length
        ? must((await q.from('school_subjects').select('id, name')) as Res<{ id: string; name: string }[]>, 'subjects')
        : []
      const speaking = must(
        (await q.from('speaking_sessions').select('id').eq('student_id', studentId)) as Res<{ id: string }[]>,
        'speaking sessions',
      )
      const notes = speaking.length
        ? must(
            (await gte(
              q
                .from('speaking_session_notes')
                .select('id, speaking_session_id, observations, strengths, goals, follow_up, created_at')
                .in(
                  'speaking_session_id',
                  speaking.map((s) => s.id),
                ),
              'created_at',
            ).order('created_at')) as Res<
              {
                id: string
                speaking_session_id: string
                observations: string | null
                strengths: string | null
                goals: string | null
                follow_up: string | null
                created_at: string
              }[]
            >,
            'speaking notes',
          )
        : []
      const profile = ((await q
        .from('student_learning_profiles')
        .select('teacher_observations, updated_at')
        .eq('student_id', studentId)
        .maybeSingle()) as Res<{ teacher_observations: string | null; updated_at: string }>).data

      const speakingNotes: SpeakingNoteRow[] = notes
        .map((n) => ({ id: n.id, at: n.created_at, text: noteText(n), speakingSessionId: n.speaking_session_id }))
        .filter((n) => n.text)
      if (profile?.teacher_observations?.trim())
        speakingNotes.push({ id: 'profile', at: profile.updated_at, text: profile.teacher_observations })

      // Current lesson: the open assignment's current lesson, its published package and teacher guide.
      const assignment = ((await q
        .from('program_assignments')
        .select('current_lesson_id')
        .eq('student_id', studentId)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()) as Res<{ current_lesson_id: string | null }>).data
      let currentLesson: LearnerContextLoad['currentLesson'] = null
      if (assignment?.current_lesson_id) {
        const row = ((await q
          .from('lesson_content_packages')
          .select('id, content')
          .eq('lesson_id', assignment.current_lesson_id)
          .eq('status', 'published')
          .maybeSingle()) as Res<{ id: string; content: unknown }>).data
        const parsed = row ? LessonPackage.safeParse(row.content) : null
        if (row && parsed?.success) {
          const mat = ((await q.from('lesson_admin_material').select('teacher_guide').eq('package_id', row.id).maybeSingle()) as Res<{
            teacher_guide: unknown
          }>).data
          const admin = AdminLessonMaterial.safeParse({ teacherGuide: mat?.teacher_guide })
          currentLesson = { packageId: row.id, content: parsed.data, admin: admin.success ? admin.data : null }
        }
      }

      // Labels for the item ids in attempts/mastery, from the packages involved.
      const pkgIds = [...new Set([...attempts.map((a) => a.package_id), ...mastery.map((m) => m.package_id)])]
      const itemLabels: Record<string, string> = {}
      if (pkgIds.length) {
        const pkgs = must(
          (await q.from('lesson_content_packages').select('id, content').in('id', pkgIds)) as Res<{ id: string; content: unknown }[]>,
          'packages',
        )
        for (const p of pkgs) {
          const parsed = LessonPackage.safeParse(p.content)
          if (!parsed.success) continue
          const pkg = parsed.data
          for (const v of pkg.vocabulary) itemLabels[v.id] = v.en
          for (const g of pkg.homework.groups)
            for (const qq of [g.complete, g.order, g.meaning]) itemLabels[qq.id] = qq.type === 'order' ? qq.answer.join(' ') : qq.prompt
          for (const qq of [...pkg.story.questions, ...pkg.assessment.quiz, ...pkg.assessment.reading.questions, ...pkg.review.questions])
            itemLabels[qq.id] = qq.type === 'order' ? qq.answer.join(' ') : qq.prompt
        }
      }

      const examDate = new Map(exams.map((e) => [e.id, e.exam_date]))
      const subjectName = new Map(subjects.map((s) => [s.id, s.name]))
      const snapshot: LearnerSnapshot = {
        studentId,
        names: {
          firstName: sp.first_name,
          lastName: sp.last_name,
          displayName: sp.display_name,
          studentCode: sp.student_code,
          schoolName: school?.name ?? null,
        },
        grade: sp.grade == null ? null : String(sp.grade),
        attempts: attempts.map((a) => ({
          questionId: a.question_id,
          packageId: a.package_id,
          section: a.section,
          correct: a.correct,
          responseMs: a.response_ms,
          hintUsed: a.hint_used,
          createdAt: a.created_at,
        })),
        mastery: mastery.map((m) => ({
          itemId: m.item_id,
          packageId: m.package_id,
          correctCount: m.correct_count,
          incorrectCount: m.incorrect_count,
          masteredAt: m.mastered_at,
        })),
        sessions: sessions.map((x) => ({
          id: x.id,
          kind: x.kind,
          status: x.status,
          activeSeconds: x.active_seconds,
          idleSeconds: x.idle_seconds,
          breakSeconds: x.break_seconds,
          startedAt: x.started_at,
        })),
        breaks: breaks.map((b) => ({ plannedMinutes: b.planned_minutes, earlyReturn: b.early_return === true })),
        assessments: assessments.map((a) => ({
          percent: Number(a.percent),
          quizPercent: Number(a.quiz_percent),
          readingPercent: Number(a.reading_percent),
          createdAt: a.submitted_at,
        })),
        exams: examResults.map((r) => ({
          examId: r.exam_id,
          examDate: examDate.get(r.exam_id) ?? '',
          subject: subjectName.get(r.subject_id) ?? 'Bilinmeyen ders',
          net: Number(r.net),
        })),
        speakingNotes,
        itemLabels,
      }
      return { snapshot, currentLesson }
    },

    async saveLearningProfile(r) {
      // teacher_observations is the teacher's own text: never written here.
      const { error } = await db(client)
        .from('student_learning_profiles')
        .upsert(
          { student_id: r.studentId, observed: r.observed, ai_interpretation: r.aiInterpretation, generated_at: r.generatedAt, ai_job_id: r.jobId },
          { onConflict: 'student_id' },
        )
      if (error) throw new Error(`save learning profile: ${error.message}`)
    },

    async saveSpeakingPlan(r) {
      const res = (await db(client)
        .from('speaking_sessions')
        .update({ plan: r.plan, ai_job_id: r.jobId })
        .eq('id', r.speakingSessionId)
        .eq('student_id', r.studentId)
        .select('id')) as Res<{ id: string }[]>
      if (!must(res, 'save speaking plan').length) throw new Error('speaking session not found for this student')
    },

    async saveWeeklyReport(r) {
      const existing = ((await db(client)
        .from('weekly_learning_reports')
        .select('id, status')
        .eq('student_id', r.studentId)
        .eq('week_start', r.weekStart)
        .maybeSingle()) as Res<{ id: string; status: 'draft' | 'reviewed' }>).data
      if (existing?.status === 'reviewed') throw new Error('this week\'s report was already reviewed; it is not overwritten')
      const saved = must(
        (await db(client)
          .from('weekly_learning_reports')
          .upsert(
            { student_id: r.studentId, week_start: r.weekStart, content: r.content, status: 'draft', ai_job_id: r.jobId },
            { onConflict: 'student_id,week_start' },
          )
          .select('id')
          .single()) as Res<{ id: string }>,
        'save weekly report',
      )
      return saved
    },
  }
}
