import { describe, expect, it } from 'vitest'

import { ApiError } from './errors'
import { createWriteQueue, type QueueStatus } from './write-queue'

const noWait = () => Promise.resolve()

describe('write queue', () => {
  it('runs tasks one at a time, in order', async () => {
    const q = createWriteQueue({ wait: noWait })
    const log: string[] = []
    let release!: () => void
    const first = q.enqueue(() => new Promise<string>((r) => (release = () => (log.push('a'), r('a')))))
    const second = q.enqueue(async () => (log.push('b'), 'b'))
    expect(log).toEqual([])
    release()
    expect(await first).toBe('a')
    expect(await second).toBe('b')
    expect(log).toEqual(['a', 'b'])
  })

  it('retries a dropped connection until it goes through, reporting offline', async () => {
    const statuses: QueueStatus[] = []
    const q = createWriteQueue({ wait: noWait, onChange: (s) => statuses.push(s) })
    let calls = 0
    const v = await q.enqueue(async () => {
      if (++calls < 3) throw new TypeError('Failed to fetch')
      return 'saved'
    })
    expect(v).toBe('saved')
    expect(calls).toBe(3)
    expect(statuses).toContain('offline')
    expect(q.status).toBe('idle')
  })

  it('rejects a domain error and moves on', async () => {
    const q = createWriteQueue({ wait: noWait })
    const bad = q.enqueue(() => Promise.reject({ message: 'LUGU_SECTION_LOCKED', code: 'P0001' }))
    const good = q.enqueue(async () => 1)
    await expect(bad).rejects.toMatchObject({ code: 'LUGU_SECTION_LOCKED' })
    expect(await good).toBe(1)
  })

  it('coalesces waiting tasks with the same key, never the one in flight', async () => {
    const q = createWriteQueue({ wait: noWait })
    const sent: number[] = []
    let release!: () => void
    const head = q.enqueue(() => new Promise<void>((r) => (release = () => (sent.push(0), r()))), { key: 's' })
    const a = q.enqueue(async () => void sent.push(1), { key: 's' })
    const b = q.enqueue(async () => void sent.push(2), { key: 's' })
    release()
    await Promise.all([head, a, b])
    expect(sent).toEqual([0, 2])
  })

  it('drain waits for everything queued', async () => {
    const q = createWriteQueue({ wait: noWait })
    let done = false
    void q.enqueue(async () => {
      await Promise.resolve()
      done = true
    })
    await q.drain()
    expect(done).toBe(true)
    expect(q.pending).toBe(0)
  })

  it('treats ApiError NETWORK as retryable', () => {
    expect(new ApiError('NETWORK').retryable).toBe(true)
    expect(new ApiError('LUGU_FORBIDDEN').retryable).toBe(false)
  })
})
