/** A learner snapshot with personal names, for insights and privacy tests. */
import type { LearnerSnapshot } from '../../../supabase/functions/_shared/ai/insights/observed.ts'
import type { InsightsStore, LearnerContextLoad } from '../../../supabase/functions/_shared/ai/store.ts'
import { LessonPackage } from '@/domain/content.ts'
import { lessonPackageFixture } from './lesson-package.ts'
import { adminFixture } from './pipeline.ts'

export const STUDENT_ID = '00000000-0000-4000-8000-0000000000aa'

const day = (d: number, h = 17) => new Date(Date.UTC(2026, 10, d, h, 0, 0)).toISOString()

/** 30 attempts: slow-ish, accurate overall, improving, with repeated errors on two homework items. */
function attempts(): LearnerSnapshot['attempts'] {
  const out: LearnerSnapshot['attempts'] = []
  for (let i = 0; i < 30; i++) {
    const qid = i % 5 === 0 ? 'hw-2-complete' : i % 7 === 0 ? 'hw-6-complete' : `as-${['shower', 'go-school', 'watches', 'at-eight'][i % 4]}`
    const correct = i >= 15 ? qid !== 'hw-2-complete' : i % 3 !== 0
    out.push({ questionId: qid, packageId: 'pkg-1', section: qid.startsWith('hw') ? 'homework' : 'assessment', correct, responseMs: 6000 + (i % 4) * 1000, hintUsed: i % 6 === 0, createdAt: day(2 + Math.floor(i / 6), 10 + (i % 6)) })
  }
  return out
}

export function learnerSnapshot(): LearnerSnapshot {
  return {
    studentId: STUDENT_ID,
    names: { firstName: 'Ayşe', lastName: 'Yılmaz', displayName: 'Ayşecik', studentCode: 'LUGU-1042', schoolName: 'Atatürk Ortaokulu' },
    grade: '6',
    attempts: attempts(),
    mastery: lessonPackageFixture.vocabulary.map((v, i) => ({ itemId: v.id, packageId: 'pkg-1', correctCount: 2, incorrectCount: i < 2 ? 3 : 0, masteredAt: i < 13 ? day(3) : null })),
    sessions: [
      { id: 's1', kind: 'primary', status: 'completed', activeSeconds: 2400, idleSeconds: 300, breakSeconds: 600, startedAt: day(2, 9) },
      { id: 's2', kind: 'primary', status: 'abandoned', activeSeconds: 600, idleSeconds: 400, breakSeconds: 0, startedAt: day(4, 9) },
    ],
    breaks: [{ plannedMinutes: 10, earlyReturn: true }],
    assessments: [{ percent: 72, quizPercent: 70, readingPercent: 75, createdAt: day(5) }],
    exams: [
      { examId: 'e1', examDate: '2026-09-20', subject: 'Matematik', net: 8 },
      { examId: 'e1', examDate: '2026-09-20', subject: 'İngilizce', net: 7 },
      { examId: 'e2', examDate: '2026-10-18', subject: 'Matematik', net: 10.5 },
      { examId: 'e2', examDate: '2026-10-18', subject: 'İngilizce', net: 6.25 },
      { examId: 'e3', examDate: '2026-11-15', subject: 'Matematik', net: 12 },
      { examId: 'e3', examDate: '2026-11-15', subject: 'İngilizce', net: 5 },
    ],
    speakingNotes: [
      { id: 'n1', at: day(6), text: 'Ayşe confuses have and has. AYŞE YILMAZ needs more listening; mail: ayse@example.com, LUGU-1042.', speakingSessionId: 'sp1' },
      { id: 'profile', at: day(6), text: 'Ayşecik sentences are short but correct.' },
    ],
    itemLabels: { 'hw-2-complete': 'Sasha ___ (catch) the bus at eight.', 'hw-6-complete': 'Piko ___ (go) to bed at half past nine.', 'v-wake-up': 'wake up', 'v-get-up': 'get up' },
  }
}

export class MemoryInsights implements InsightsStore {
  profiles: unknown[] = []
  plans: unknown[] = []
  reports: unknown[] = []
  constructor(private readonly snapshot: LearnerSnapshot = learnerSnapshot()) {}
  async loadLearner(): Promise<LearnerContextLoad> {
    return { snapshot: this.snapshot, currentLesson: { packageId: 'pkg-1', content: LessonPackage.parse(lessonPackageFixture), admin: { teacherGuide: adminFixture.teacherGuide } } }
  }
  async saveLearningProfile(row: unknown) {
    this.profiles.push(row)
  }
  async saveSpeakingPlan(row: unknown) {
    this.plans.push(row)
  }
  async saveWeeklyReport(row: unknown) {
    this.reports.push(row)
    return { id: 'report-1' }
  }
}
