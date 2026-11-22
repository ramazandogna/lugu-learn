/**
 * The answer write queue. Every learning write goes through it, one at a time
 * and in order (the server checks section order, so order matters).
 *
 * - A dropped connection (`ApiError.retryable`) keeps the task at the head of
 *   the queue and retries with backoff — nothing typed by the learner is lost.
 * - Any other error rejects that task's promise and the queue moves on.
 * - Tasks with the same `key` coalesce while waiting: only the newest runs
 *   (resume snapshots — the latest state is the only one worth sending).
 *
 * Framework-free: `onChange` reports the visible "kaydediliyor" state.
 */
import { toApiError } from './errors'

export type QueueStatus = 'idle' | 'saving' | 'offline'

interface Task {
  key: string | null
  run: () => Promise<unknown>
  resolve: (v: unknown) => void
  reject: (e: unknown) => void
}

export interface WriteQueueOptions {
  /** Backoff in ms for attempt n (0-based). */
  backoff?: (attempt: number) => number
  wait?: (ms: number) => Promise<void>
  onChange?: (status: QueueStatus, pending: number) => void
}

export interface WriteQueue {
  enqueue<T>(run: () => Promise<T>, opts?: { key?: string }): Promise<T>
  readonly pending: number
  readonly status: QueueStatus
  /** Resolves once everything queued so far has settled. */
  drain(): Promise<void>
  /** Retry now (e.g. on the `online` event) instead of waiting out the backoff. */
  wake(): void
}

const defaultBackoff = (n: number) => Math.min(30_000, 1000 * 2 ** n)

export function createWriteQueue(options: WriteQueueOptions = {}): WriteQueue {
  const backoff = options.backoff ?? defaultBackoff
  const tasks: Task[] = []
  let running = false
  let status: QueueStatus = 'idle'
  let wakeUp: (() => void) | null = null
  let drainers: (() => void)[] = []

  const wait =
    options.wait ??
    ((ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(done, ms)
        function done() {
          clearTimeout(t)
          wakeUp = null
          resolve()
        }
        wakeUp = done
      }))

  function set(s: QueueStatus) {
    status = s
    options.onChange?.(s, tasks.length)
  }

  async function pump() {
    if (running) return
    running = true
    let attempt = 0
    while (tasks.length) {
      const task = tasks[0]!
      set(attempt > 0 ? 'offline' : 'saving')
      try {
        const v = await task.run()
        tasks.shift()
        attempt = 0
        task.resolve(v)
      } catch (e) {
        const err = toApiError(e)
        if (err.retryable) {
          set('offline')
          await wait(backoff(attempt++))
          continue
        }
        tasks.shift()
        attempt = 0
        task.reject(err)
      }
    }
    running = false
    set('idle')
    const d = drainers
    drainers = []
    d.forEach((f) => f())
  }

  return {
    enqueue<T>(run: () => Promise<T>, opts: { key?: string } = {}) {
      return new Promise<T>((resolve, reject) => {
        const key = opts.key ?? null
        const task: Task = { key, run, resolve: resolve as (v: unknown) => void, reject }
        // Never replace the head: it may be in flight.
        const i = key === null ? -1 : tasks.findIndex((t, idx) => idx > 0 && t.key === key)
        if (i > 0) {
          const old = tasks[i]!
          tasks[i] = task
          // The superseded write is covered by the newer one.
          old.resolve(undefined)
        } else tasks.push(task)
        options.onChange?.(status === 'idle' ? 'saving' : status, tasks.length)
        void pump()
      })
    },
    get pending() {
      return tasks.length
    },
    get status() {
      return status
    },
    drain() {
      if (!tasks.length && !running) return Promise.resolve()
      return new Promise<void>((r) => drainers.push(r))
    },
    wake() {
      wakeUp?.()
    },
  }
}
