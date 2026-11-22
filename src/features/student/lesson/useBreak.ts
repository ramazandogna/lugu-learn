/**
 * The break between sections, on `engine/break`. The countdown ticks once a
 * second; when it reaches zero the page waits for the learner's explicit
 * "Başla" — the next section never opens on its own.
 */
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

import type { SectionKey } from '@/domain/content'
import { breakStatus, remaining, startBreak, startNextSection, type BreakMinutes, type BreakState } from '@/engine/break'
import * as api from '@/lib/api/student'
import type { WriteQueue } from '@/lib/api/student'

export function useBreak(opts: { sessionId: () => string; queue: WriteQueue; onStart: () => void; onEnd: () => void; report: (e: unknown) => void }, now: () => number = Date.now) {
  const offerAfter = ref<SectionKey | null>(null)
  const state = shallowRef<BreakState | null>(null)
  const clock = ref(now())
  let breakId: Promise<string | null> | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  const status = computed(() => (state.value ? breakStatus(state.value, clock.value) : null))
  const secondsLeft = computed(() => (state.value ? remaining(state.value, clock.value) : 0))
  const countdown = computed(() => {
    const s = secondsLeft.value
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  })

  function endQuietly(id: string | null) {
    if (id) opts.queue.enqueue(() => api.endBreak(id)).catch(() => {})
  }

  function stopTimer() {
    if (timer) clearInterval(timer)
    timer = null
  }

  function offer(after: SectionKey) {
    offerAfter.value = after
  }

  /** The learner picked a length. 0 = continue now (returns true: go on at once). */
  function choose(minutes: BreakMinutes): boolean {
    const after = offerAfter.value
    if (!after) return true
    const t = now()
    const b = startBreak(minutes, t)
    const id = opts.queue.enqueue(() => api.startBreak(opts.sessionId(), after, minutes)).then(
      (row) => row.id,
      (e) => (opts.report(e), null),
    )
    if (minutes === 0) {
      void id.then((x) => endQuietly(x))
      offerAfter.value = null
      return true
    }
    breakId = id
    state.value = b
    clock.value = t
    opts.onStart()
    stopTimer()
    timer = setInterval(() => (clock.value = now()), 1000)
    return false
  }

  /** "Erken dön" while running, or "Başla" once over. Both are the learner's explicit start. */
  function resume() {
    if (!state.value) return
    state.value = startNextSection(state.value, now())
    stopTimer()
    const id = breakId
    breakId = null
    void id?.then((x) => endQuietly(x))
    opts.onEnd()
    state.value = null
    offerAfter.value = null
  }

  /** Not taking a break offered: same as 0 minutes. */
  const decline = () => choose(0)

  onBeforeUnmount(stopTimer)

  return { offerAfter, state, status, secondsLeft, countdown, offer, choose, resume, decline }
}
