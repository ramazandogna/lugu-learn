/*
 * A tiny read cache for the learner's screens: key → value, a TTL, and one
 * shared in-flight promise per key. No Redis, no library: the app is static
 * hosting + Supabase, and a per-tab Map is all a single learner needs.
 *
 * - `cached`  fresh hit → value; stale → refetch (a failure never replaces a good value).
 * - `peek`    the last value regardless of age, for stale-while-revalidate screens.
 * - `invalidate(prefix)` after a write; `clearCache()` on sign-in/out so one account never sees another's data.
 * Failed fetches are not cached.
 */
interface Entry {
  value?: unknown
  at: number
  inflight?: Promise<unknown>
}

const store = new Map<string, Entry>()

export function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && 'value' in hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.value as T)
  if (hit?.inflight) return hit.inflight as Promise<T>
  const entry: Entry = hit ?? { at: 0 }
  store.set(key, entry)
  const p = fetcher().then(
    (value) => {
      // Dropped by `invalidate` while in flight: hand the value over but do not keep it.
      if (store.get(key) === entry) Object.assign(entry, { value, at: Date.now(), inflight: undefined })
      return value
    },
    (e) => {
      entry.inflight = undefined
      if (!('value' in entry)) store.delete(key)
      throw e
    },
  )
  entry.inflight = p
  return p
}

export const peek = <T>(key: string): T | undefined => store.get(key)?.value as T | undefined

export function invalidate(prefix: string): void {
  for (const k of [...store.keys()]) if (k.startsWith(prefix)) store.delete(k)
}

export const clearCache = (): void => store.clear()

/** Fire-and-forget warm-up; never throws. */
export function prefetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): void {
  cached(key, ttlMs, fetcher).catch(() => {})
}
