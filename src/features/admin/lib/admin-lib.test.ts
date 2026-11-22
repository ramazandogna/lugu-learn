import { describe, expect, it } from 'vitest'
import { testPackage } from '@/engine/testing/package'
import { errorMessage, toAdminError } from '@/lib/api/admin/errors'
import { summariseSections, toAnalyticsInput } from './analytics-input'
import { attentionReasons, type AttentionInput } from './attention'
import { blankPackage, collectIds, moveItem, slugId, stageInfo, toDraft, validatePackage } from './package-edit'
import { packageLabels } from './package-labels'
import { EMPTY_FILTERS, filterOptions, filterStudents, fold, type FilterableStudent } from './student-filters'
import { buildTimeline, type TimelineInput } from './timeline'

const student = (over: Partial<FilterableStudent>): FilterableStudent => ({
  code: 'LUGU-1001',
  name: 'Ayşe Yılmaz',
  displayName: null,
  grade: 6,
  school: { id: 's1', name: 'Atatürk Ortaokulu' },
  status: 'active',
  program: { curriculumId: 'c1', curriculumName: 'A1', currentLesson: { id: 'l1', title: 'Hello' } },
  ...over,
})

describe('student filters', () => {
  const list = [
    student({}),
    student({ code: 'LUGU-1002', name: 'İsmail Işık', grade: 7, school: { id: 's2', name: 'Cumhuriyet' }, status: 'paused', program: null }),
  ]
  it('searches Turkish-aware across name, code and school', () => {
    expect(filterStudents(list, { ...EMPTY_FILTERS, q: 'ismail' }).map((s) => s.code)).toEqual(['LUGU-1002'])
    expect(filterStudents(list, { ...EMPTY_FILTERS, q: 'ISIK' }).map((s) => s.code)).toEqual(['LUGU-1002'])
    expect(filterStudents(list, { ...EMPTY_FILTERS, q: 'atatürk' })).toHaveLength(1)
    expect(fold('İSTANBUL')).toBe('istanbul')
  })
  it('combines filters', () => {
    expect(filterStudents(list, { ...EMPTY_FILTERS, grade: 6, status: 'active' })).toHaveLength(1)
    expect(filterStudents(list, { ...EMPTY_FILTERS, lessonId: 'l1', status: 'paused' })).toHaveLength(0)
    expect(filterStudents(list, { ...EMPTY_FILTERS, curriculumId: 'c1' })).toHaveLength(1)
  })
  it('offers only options present in the list', () => {
    const o = filterOptions(list)
    expect(o.grades.map((g) => g.value)).toEqual([6, 7])
    expect(o.lessons).toEqual([{ value: 'l1', label: 'Hello' }])
  })
})

describe('timeline', () => {
  const input: TimelineInput = {
    sessions: [
      { id: 'a', lesson_id: 'l1', kind: 'primary', status: 'abandoned', started_at: '2026-11-01T10:00:00Z', completed_at: null, last_seen_at: '2026-11-01T10:20:00Z', active_seconds: 600 },
    ],
    completions: [{ id: 'c', lesson_id: 'l1', completed_at: '2026-11-03T10:00:00Z' }],
    assessments: [{ id: 'r', session_id: 'a', percent: 80, submitted_at: '2026-11-02T10:00:00Z' }],
    breaks: [{ id: 'b', after_section: 'story', planned_minutes: 10, started_at: '2026-11-01T10:05:00Z', ended_at: '2026-11-01T10:15:00Z', early_return: false }],
    events: [
      { id: 'e1', kind: 'visibility_hidden', at: '2026-11-01T10:06:00Z' },
      { id: 'e2', kind: 'visibility_visible', at: '2026-11-01T10:07:00Z' },
    ],
    programEvents: [{ id: 'p', kind: 'forward', created_at: '2026-11-04T10:00:00Z', to_lesson_id: 'l2', note: 'hızlı' }],
    lessonTitle: (id) => (id === 'l1' ? 'Hello' : 'Family'),
  }
  it('orders newest first and labels each source in Turkish', () => {
    const items = buildTimeline(input)
    expect(items.map((i) => i.key)).toEqual(['p-p', 'c-c', 'a-r', 'sa-a', 'e-e1', 'b-b', 's-a'])
    expect(items[0]?.description).toBe('Family · hızlı')
    expect(items.find((i) => i.key === 'a-r')?.title).toContain('Hello')
    expect(items.find((i) => i.key === 'b-b')?.description).toContain('10 dk')
  })
  it('hides paired minor events unless asked', () => {
    expect(buildTimeline(input, { includeMinorEvents: true }).some((i) => i.key === 'e-e2')).toBe(true)
    expect(buildTimeline(input, { limit: 2 })).toHaveLength(2)
  })
})

describe('attention', () => {
  const now = Date.parse('2026-11-20T00:00:00Z')
  const base: AttentionInput = { status: 'active', hasActiveProgram: true, lastActivityAt: '2026-11-19T00:00:00Z', sessions: [], attempts: [], vocab: [], latestAssessmentPercent: null }
  it('flags inactivity, never-started and low assessment', () => {
    expect(attentionReasons({ ...base, lastActivityAt: '2026-11-10T00:00:00Z' }, now).map((r) => r.kind)).toEqual(['inactive'])
    expect(attentionReasons({ ...base, lastActivityAt: null }, now).map((r) => r.kind)).toEqual(['never_started'])
    expect(attentionReasons({ ...base, latestAssessmentPercent: 40 }, now).map((r) => r.kind)).toEqual(['low_assessment'])
  })
  it('ignores paused students and those without an active program', () => {
    expect(attentionReasons({ ...base, status: 'paused', lastActivityAt: null }, now)).toEqual([])
    expect(attentionReasons({ ...base, hasActiveProgram: false, lastActivityAt: null }, now)).toEqual([])
  })
  it('uses domain signals for abandonment and repeated errors', () => {
    const sessions = ['abandoned', 'abandoned', 'completed'].map((status, i) => ({ status: status as 'abandoned', startedAt: `2026-11-1${i}T00:00:00Z`, kind: 'primary' as const }))
    const vocab = [{ itemId: 'w', correctCount: 0, incorrectCount: 4, masteredAt: null }]
    const kinds = attentionReasons({ ...base, sessions, vocab }, now).map((r) => r.kind)
    expect(kinds).toContain('repeated_abandonment')
    expect(kinds).toContain('repeated_errors')
  })
})

describe('package editing', () => {
  it('moves items without mutating', () => {
    const xs = ['a', 'b', 'c']
    expect(moveItem(xs, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(xs, 0, 5)).toEqual(xs)
    expect(xs).toEqual(['a', 'b', 'c'])
  })
  it('accepts a valid package and explains problems in Turkish', () => {
    const p = testPackage()
    expect(validatePackage(p).ok).toBe(true)
    const broken = structuredClone(p)
    broken.vocabulary = broken.vocabulary.slice(0, 1)
    broken.meta.title = ''
    const r = validatePackage(broken)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.issues.some((i) => i.startsWith('Kelimeler') && i.includes('en az 3'))).toBe(true)
      expect(r.issues.some((i) => i.startsWith('Genel bilgiler › başlık'))).toBe(true)
    }
  })
  it('translates cross-reference issues', () => {
    const p = structuredClone(testPackage())
    const second = p.vocabulary[1]
    if (second) second.id = p.vocabulary[0]?.id ?? 'x'
    const r = validatePackage(p)
    expect(!r.ok && r.issues.some((i) => i.includes('birden fazla kez'))).toBe(true)
  })
  it('mints unique slug ids', () => {
    expect(slugId('Have breakfast!', new Set())).toBe('have-breakfast')
    expect(slugId('have breakfast', new Set(['have-breakfast']))).toBe('have-breakfast-2')
    expect(slugId('', new Set(), 'word')).toBe('word')
    expect(slugId('çay', new Set())).toBe('cay')
  })
  it('collects ids and fills missing sections of a stored draft', () => {
    const p = testPackage()
    expect(collectIds(p).has(p.vocabulary[0]?.id ?? '')).toBe(true)
    const d = toDraft({ meta: { title: 'X' }, vocabulary: [] }, 'Fallback', 40)
    expect(d.meta.title).toBe('X')
    expect(d.meta.estimatedMinutes).toBe(40)
    expect(d.story.scenes).toEqual([])
    expect(toDraft(null, 'T', 2).meta.estimatedMinutes).toBe(5)
    expect(blankPackage('T', 45).schemaVersion).toBe(1)
  })
  it('describes job stages', () => {
    expect(stageInfo(null).step).toBe(0)
    expect(stageInfo('qa_round_2')).toMatchObject({ step: 5, stalled: false })
    expect(stageInfo('qa_round_2').label).toContain('2. tur')
    expect(stageInfo('stalled:plan')).toMatchObject({ step: 1, stalled: true })
    expect(stageInfo('done').step).toBe(stageInfo('done').total)
  })
})

describe('package labels', () => {
  it('maps vocabulary and question ids, tolerating odd documents', () => {
    const p = testPackage()
    const l = packageLabels(p)
    expect(l.vocab.get(p.vocabulary[0]?.id ?? '')).toContain(p.vocabulary[0]?.en ?? '?')
    expect(l.questions.get(p.assessment.quiz[0]?.id ?? '')).toBe(p.assessment.quiz[0]?.prompt)
    expect(packageLabels('nope').vocab.size).toBe(0)
  })
})

describe('analytics input', () => {
  it('maps rows and summarises sections in lesson order', () => {
    const input = toAnalyticsInput({
      sections: [
        { section: 'story', started_at: '2026-11-01T10:00:00Z', completed_at: '2026-11-01T10:10:00Z', active_seconds: 500 },
        { section: 'vocabulary', started_at: '2026-11-01T09:50:00Z', completed_at: null, active_seconds: 100 },
        { section: 'story', started_at: null, completed_at: null, active_seconds: 300 },
        { section: 'homework', started_at: null, completed_at: null, active_seconds: 0 },
      ],
      attempts: [{ question_id: 'q', section: 'story', attempt_no: 1, correct: true, response_ms: 900, hint_used: false, created_at: '2026-11-01T10:01:00Z' }],
      mastery: [],
      sessions: [
        { status: 'completed', started_at: '2026-11-01T09:00:00Z', kind: 'primary' },
        { status: 'completed', started_at: '2026-11-02T09:00:00Z', kind: 'replay' },
      ],
    })
    expect(input.attempts[0]).toMatchObject({ questionId: 'q', responseMs: 900 })
    expect(input.sessions).toHaveLength(1)
    expect(summariseSections(input.sections)).toEqual([
      { section: 'vocabulary', samples: 1, avgActiveSeconds: 100, medianDurationSeconds: null },
      { section: 'story', samples: 2, avgActiveSeconds: 400, medianDurationSeconds: 600 },
    ])
  })
})

describe('admin errors', () => {
  it('maps LUGU codes, Postgres codes and network failures to Turkish', () => {
    expect(errorMessage({ message: 'LUGU_NO_NEXT_LESSON' })).toBe('Sonraki ders yok.')
    expect(toAdminError({ message: 'x', code: '23505' }).code).toBe('23505')
    expect(errorMessage(new TypeError('Failed to fetch'))).toContain('Sunucuya ulaşılamadı')
    expect(errorMessage({ message: 'boom' })).toContain('boom')
  })
})
