import { ref, shallowRef, watch, type Ref, type WatchSource } from 'vue'
import { useToast } from 'rei-kit'
import { errorMessage } from '@/lib/api/admin'

/** Loads data with loading/error state; reloads when `source` changes. Stale responses are dropped. */
export function useLoad<T>(fn: () => Promise<T>, source?: WatchSource) {
  const data = shallowRef<T | null>(null) as Ref<T | null>
  const loading = ref(true)
  /** A reload while data is on screen: the old data stays visible (no skeleton flash). */
  const refreshing = ref(false)
  const error = ref<string | null>(null)
  let token = 0
  async function reload() {
    const mine = ++token
    if (data.value === null) loading.value = true
    else refreshing.value = true
    error.value = null
    try {
      const value = await fn()
      if (mine === token) data.value = value
    } catch (e) {
      if (mine === token) error.value = errorMessage(e)
    } finally {
      if (mine === token) {
        loading.value = false
        refreshing.value = false
      }
    }
  }
  // A new source (another student, another lesson) must not show the previous one's data meanwhile.
  if (source)
    watch(source, () => {
      data.value = null
      void reload()
    }, { immediate: true })
  else void reload()
  return { data, loading, refreshing, error, reload }
}

/** Runs a write: busy flag, Turkish error toast, success toast. Returns whether it worked. */
export function useAction() {
  const toast = useToast()
  const busy = ref(false)
  async function run(fn: () => Promise<unknown>, success?: string): Promise<boolean> {
    busy.value = true
    try {
      await fn()
      if (success) toast.success(success)
      return true
    } catch (e) {
      toast.danger(errorMessage(e))
      return false
    } finally {
      busy.value = false
    }
  }
  return { busy, run }
}
