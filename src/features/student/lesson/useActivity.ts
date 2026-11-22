/**
 * Browser events → the activity engine → the server. Estimates only: the
 * page sees its own tab, nothing else. A return after being away (or idle)
 * shows a gentle reminder, never a warning.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { advance, createActivity, isIdle, record, tick, type ActivityEventType, type ActivityState } from '@/engine/activity'
import type { Json, SessionEventKind } from '@/lib/database.types'

export interface ActivitySink {
  event(kind: SessionEventKind, data?: Json): void
  /** Active seconds to attach to the next `save_section_state`. */
  addActive(seconds: number): void
  flush(): void
}

const INPUTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
const TICK_MS = 5000

export function useActivity(sink: ActivitySink, now: () => number = Date.now) {
  const reminder = ref(false)
  let state: ActivityState | null = null
  let idleSince: number | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  function push(type: ActivityEventType) {
    if (!state) return
    record(state, { type, at: now() })
  }

  function endIdle() {
    if (idleSince === null) return
    sink.event('idle_end', { idle_seconds: Math.round((now() - idleSince) / 1000) })
    idleSince = null
    reminder.value = true
  }

  function onInput() {
    endIdle()
    push('input')
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      push('hidden')
      sink.event('visibility_hidden')
      sink.flush()
    } else {
      push('visible')
      sink.event('visibility_visible')
      endIdle()
      reminder.value = true
    }
  }

  function onFullscreen() {
    if (!document.fullscreenElement) sink.event('fullscreen_exit')
  }

  function onTick() {
    if (!state) return
    const t = now()
    advance(state, t)
    if (idleSince === null && isIdle(state, t)) {
      idleSince = state.lastInputAt
      sink.event('idle_start')
    }
    const d = tick(state, t)
    if (d) {
      if (d.activeSeconds > 0) sink.addActive(d.activeSeconds)
      sink.flush()
    }
  }

  onMounted(() => {
    state = createActivity(now(), {}, document.visibilityState !== 'hidden')
    INPUTS.forEach((e) => window.addEventListener(e, onInput, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('fullscreenchange', onFullscreen)
    timer = setInterval(onTick, TICK_MS)
  })

  onBeforeUnmount(() => {
    INPUTS.forEach((e) => window.removeEventListener(e, onInput))
    document.removeEventListener('visibilitychange', onVisibility)
    document.removeEventListener('fullscreenchange', onFullscreen)
    if (timer) clearInterval(timer)
    onTick()
  })

  return {
    reminder,
    dismissReminder: () => (reminder.value = false),
    breakStarted: () => push('break_start'),
    breakEnded: () => push('break_end'),
  }
}
