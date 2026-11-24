/** localStorage that never throws (private windows, blocked storage, SSG). */
export interface KV {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
}

export function safeStorage(): KV {
  return {
    getItem(k) {
      try {
        return globalThis.localStorage?.getItem(k) ?? null
      } catch {
        return null
      }
    },
    setItem(k, v) {
      try {
        globalThis.localStorage?.setItem(k, v)
      } catch {
        /* storage unavailable: counters just reset */
      }
    },
  }
}

/** Local calendar day, `YYYY-MM-DD`. */
export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
