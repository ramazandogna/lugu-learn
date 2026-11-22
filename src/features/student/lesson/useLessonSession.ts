/**
 * One lesson session: load (content + start/resume), the section flow, and
 * every write through one ordered retry queue. Section logic stays in the
 * engines; this only wires them to the server.
 */
import { computed, ref, shallowRef, triggerRef } from 'vue'
import { useToast } from 'rei-kit'

import type { SectionKey } from '@/domain/content'
import { complete, createLessonFlow, enter, nextSection, sectionStatuses, skip, type LessonFlow } from '@/engine/lesson-flow'
import * as api from '@/lib/api/student'
import type { Json, LessonCompletion, SessionKind, Tables } from '@/lib/database.types'

import { toJson, type LessonContext } from './context'
import { parseStudentPackage, type StudentPackage } from './package'
import { initialSection, resumePoint } from './resume'

export interface LoadedLesson {
  pkg: StudentPackage
  session: Tables<'learning_sessions'>
  preMastered: string[]
  resumed: boolean
}

export function useLessonSession(lessonId: () => string, kind: () => SessionKind) {
  const toast = useToast()
  const saving = ref<api.QueueStatus>('idle')
  const queue = api.createWriteQueue({ onChange: (s) => (saving.value = s) })

  const loaded = shallowRef<LoadedLesson | null>(null)
  const loadError = ref<unknown>(null)
  const flow = shallowRef<LessonFlow | null>(null)
  const snapshots = shallowRef<Partial<Record<SectionKey, Json>>>({})
  const completion = shallowRef<LessonCompletion | null>(null)
  const sessionClosed = ref(false)

  /** Active seconds measured but not yet sent; taken by the next state save. */
  let pendingActive = 0
  const addActive = (s: number) => (pendingActive += s)
  const takeActive = () => {
    const n = Math.min(600, pendingActive)
    pendingActive -= n
    return n
  }

  function report(e: unknown) {
    const err = api.toApiError(e)
    if (err.code === 'LUGU_SESSION_NOT_ACTIVE' || err.code === 'LUGU_LESSON_NOT_CURRENT') sessionClosed.value = true
    toast.warning(api.friendlyMessage(err))
  }

  async function load() {
    loadError.value = null
    loaded.value = null
    try {
      const [content, payload] = await Promise.all([api.getLessonContent(lessonId()), api.startOrResumeSession(lessonId(), kind())])
      const pkg = parseStudentPackage(content.content)
      const preMastered = kind() === 'primary' ? await api.getMasteredItems(content.package_id).catch(() => []) : []
      const point = resumePoint(payload.sections)
      const f = createLessonFlow(pkg, { started: point.started, completed: point.completed })
      const first = initialSection(f, payload.session.current_section)
      if (first) enter(f, first)
      snapshots.value = point.snapshots
      flow.value = f
      loaded.value = { pkg, session: payload.session, preMastered, resumed: point.resumed }
      // A break left open by a closed page ends now: the learner is back.
      void api.getOpenBreaks(payload.session.id).then((ids) => ids.forEach((id) => void queue.enqueue(() => api.endBreak(id)).catch(() => {})), () => {})
      if (point.resumed) void queue.enqueue(() => api.recordSessionEvent(payload.session.id, 'resumed', { section: first })).catch(() => {})
    } catch (e) {
      loadError.value = e
    }
  }

  const sessionId = () => loaded.value?.session.id ?? ''
  const current = computed(() => flow.value?.current ?? null)
  const statuses = computed(() => (flow.value ? sectionStatuses(flow.value) : []))

  function saveState(section: SectionKey, snapshot: unknown) {
    const state = toJson(snapshot)
    snapshots.value = { ...snapshots.value, [section]: state }
    let delta: number | null = null
    queue
      .enqueue(
        () => {
          delta ??= takeActive()
          return api.saveSectionState(sessionId(), section, state, delta)
        },
        { key: `state:${section}` },
      )
      .catch(report)
  }

  /** Sends measured active time even when nothing else is being saved. */
  function flushActive() {
    const s = current.value
    if (s && pendingActive >= 1) saveState(s, snapshots.value[s] ?? {})
  }

  function go(section: SectionKey): boolean {
    const f = flow.value
    if (!f || !enter(f, section)) return false
    triggerRef(flow)
    saveState(section, snapshots.value[section] ?? {})
    return true
  }

  /** Marks a section done locally at once; the server call is queued behind its answers. */
  function completeSection(section: SectionKey) {
    const f = flow.value
    if (!f || !complete(f, section)) return
    triggerRef(flow)
    queue.enqueue(() => api.completeSection(sessionId(), section)).catch((e) => {
      // The server disagrees (criteria): reopen the section so the learner can finish it.
      f.completed.delete(section)
      f.started.add(section)
      triggerRef(flow)
      report(e)
    })
  }

  function skipSection(section: SectionKey) {
    const f = flow.value
    if (f && skip(f, section)) triggerRef(flow)
  }

  const upNext = computed(() => (flow.value ? nextSection(flow.value) : null))

  async function finishLesson() {
    await queue.drain()
    try {
      completion.value = await queue.enqueue(() => api.completeLesson(sessionId()))
      sessionClosed.value = true
    } catch (e) {
      report(e)
    }
  }

  function event(kindName: Parameters<typeof api.recordSessionEvent>[1], data: Json = {}) {
    if (!loaded.value || sessionClosed.value) return
    queue.enqueue(() => api.recordSessionEvent(sessionId(), kindName, data)).catch(() => {})
  }

  function context(l: LoadedLesson): LessonContext {
    return {
      pkg: l.pkg,
      sessionId: l.session.id,
      lessonId: l.session.lesson_id,
      kind: l.session.kind,
      preMastered: l.preMastered,
      rng: Math.random,
      character: l.pkg.meta.character,
      saving,
      saveState,
      // One client id per answer, created outside the retried task so every retry reuses it.
      recordAnswer: (a) => {
        const clientId = crypto.randomUUID()
        return queue.enqueue(() => api.recordAnswer({ sessionId: l.session.id, ...a, clientId })).catch((e) => (report(e), undefined))
      },
      recordVocab: (a) => {
        const clientId = crypto.randomUUID()
        return queue.enqueue(() => api.recordVocabAnswer({ sessionId: l.session.id, ...a, clientId })).catch((e) => (report(e), undefined))
      },
      submitAssessment: async (answers) => {
        await queue.drain()
        const clientId = crypto.randomUUID()
        return queue.enqueue(() => api.submitAssessment(l.session.id, answers, clientId))
      },
      report,
    }
  }

  return {
    load,
    loaded,
    loadError,
    flow,
    current,
    statuses,
    snapshots,
    upNext,
    saving,
    queue,
    completion,
    sessionClosed,
    go,
    saveState,
    completeSection,
    skipSection,
    finishLesson,
    event,
    addActive,
    flushActive,
    context,
  }
}
