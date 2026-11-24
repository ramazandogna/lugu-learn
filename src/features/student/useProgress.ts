import { computed, shallowRef } from 'vue'

import { getHistory } from '@/lib/api/student'

import { streakOf, weeklyCompare, type ProgressSession } from './progress'

/* One cached copy of the learner's sessions; failure just leaves the progress cards out. */
const sessions = shallowRef<ProgressSession[] | null>(null)
let inflight: Promise<void> | null = null

async function refresh(): Promise<void> {
  inflight ??= (async () => {
    try {
      sessions.value = (await getHistory()).sessions
    } catch {
      sessions.value ??= null
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export function useProgress() {
  void refresh()
  return {
    ready: computed(() => sessions.value !== null),
    streak: computed(() => streakOf(sessions.value ?? [])),
    weekly: computed(() => weeklyCompare(sessions.value ?? [])),
    sessionCount: computed(() => sessions.value?.length ?? 0),
    refresh,
  }
}
