import { beforeEach, describe, expect, it, vi } from 'vitest'

import { strippedContent } from './testing'

vi.mock('@/lib/api/student', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api/student')>()
  return {
    ...real,
    getLessonContent: vi.fn(),
    startOrResumeSession: vi.fn(),
    getMasteredItems: vi.fn(async () => ['get-up']),
    getOpenBreaks: vi.fn(async () => []),
    saveSectionState: vi.fn(async () => undefined),
    completeSection: vi.fn(async () => ({})),
    recordSessionEvent: vi.fn(async () => undefined),
    recordAnswer: vi.fn(async () => ({ correct: true, expected: null, attempt_no: 1 })),
  }
})

const api = await import('@/lib/api/student')
const { useLessonSession } = await import('./useLessonSession')

const session = { id: 's1', kind: 'primary', current_section: 'vocab_quiz', lesson_id: 'l1' }
const rows = [
  { section: 'vocabulary', status: 'completed', state: { v: 1, index: 0, seen: [] } },
  { section: 'vocab_quiz', status: 'in_progress', state: { v: 1 } },
]

beforeEach(() => {
  vi.mocked(api.getLessonContent).mockResolvedValue({ package_id: 'p1', lesson_id: 'l1', revision: 1, content: strippedContent() })
  vi.mocked(api.startOrResumeSession).mockResolvedValue({ session, sections: rows } as never)
  vi.mocked(api.saveSectionState).mockClear()
  vi.mocked(api.completeSection).mockClear()
})

describe('useLessonSession', () => {
  it('resumes at the server section with its snapshot and pre-mastered words', async () => {
    const s = useLessonSession(() => 'l1', () => 'primary')
    await s.load()
    expect(s.current.value).toBe('vocab_quiz')
    expect(s.flow.value?.completed.has('vocabulary')).toBe(true)
    expect(s.snapshots.value.vocab_quiz).toEqual({ v: 1 })
    expect(s.loaded.value?.preMastered).toEqual(['get-up'])
    await s.queue.drain()
    expect(api.recordSessionEvent).toHaveBeenCalledWith('s1', 'resumed', { section: 'vocab_quiz' })
  })

  it('a replay starts with nothing pre-mastered', async () => {
    const s = useLessonSession(() => 'l1', () => 'replay')
    await s.load()
    expect(s.loaded.value?.preMastered).toEqual([])
  })

  it('sends only the newest snapshot and the active time exactly once', async () => {
    const s = useLessonSession(() => 'l1', () => 'primary')
    await s.load()
    await s.queue.drain()
    vi.mocked(api.saveSectionState).mockClear()
    s.addActive(42)
    s.saveState('vocab_quiz', { n: 1 })
    s.saveState('vocab_quiz', { n: 2 })
    s.saveState('vocab_quiz', { n: 3 })
    await s.queue.drain()
    const calls = vi.mocked(api.saveSectionState).mock.calls
    expect(calls.at(-1)?.[2]).toEqual({ n: 3 })
    expect(calls.reduce((sum, c) => sum + (c[3] ?? 0), 0)).toBe(42)
    expect(calls.length).toBeLessThanOrEqual(2)
  })

  it('reopens a section the server refuses to complete', async () => {
    vi.mocked(api.completeSection).mockRejectedValueOnce(new api.ApiError('LUGU_SECTION_CRITERIA_NOT_MET'))
    const s = useLessonSession(() => 'l1', () => 'primary')
    await s.load()
    s.completeSection('vocab_quiz')
    expect(s.flow.value?.completed.has('vocab_quiz')).toBe(true)
    await s.queue.drain()
    await Promise.resolve()
    expect(s.flow.value?.completed.has('vocab_quiz')).toBe(false)
  })

  it('surfaces a load error', async () => {
    vi.mocked(api.startOrResumeSession).mockRejectedValueOnce(new api.ApiError('LUGU_LESSON_LOCKED'))
    const s = useLessonSession(() => 'l1', () => 'primary')
    await s.load()
    expect(api.toApiError(s.loadError.value).code).toBe('LUGU_LESSON_LOCKED')
  })
})
