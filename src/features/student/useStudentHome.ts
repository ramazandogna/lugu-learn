import { computed, ref, shallowRef } from 'vue'

import { friendlyMessage, getHome } from '@/lib/api/student'
import type { StudentHome } from '@/lib/database.types'

/*
 * `student_home` is read by the layout (XP, avatar, map link) and the home
 * page; one cached copy keeps them in step. `refresh()` after a lesson ends.
 */
const home = shallowRef<StudentHome | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
let inflight: Promise<void> | null = null

async function refresh(): Promise<void> {
  inflight ??= (async () => {
    loading.value = true
    error.value = null
    try {
      home.value = await getHome()
    } catch (e) {
      error.value = friendlyMessage(e)
    } finally {
      loading.value = false
      inflight = null
    }
  })()
  return inflight
}

/** The assignment the learner is working in: the first active one, else the first open one. */
const mainAssignment = computed(() => {
  const list = home.value?.assignments ?? []
  return list.find((a) => a.status === 'active') ?? list[0] ?? null
})

export function useStudentHome() {
  if (!home.value && !inflight) void refresh()
  return { home, error, loading, refresh, mainAssignment }
}
