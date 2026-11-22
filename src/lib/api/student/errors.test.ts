import { describe, expect, it } from 'vitest'

import { friendlyMessage, toApiError } from './errors'

describe('api errors', () => {
  it('reads the LUGU code from a postgrest error', () => {
    expect(toApiError({ message: 'LUGU_LESSON_LOCKED', code: 'P0001' }).code).toBe('LUGU_LESSON_LOCKED')
  })
  it('recognises a dropped connection', () => {
    expect(toApiError(new TypeError('Failed to fetch')).code).toBe('NETWORK')
    expect(toApiError({ message: 'TypeError: Load failed' }).code).toBe('NETWORK')
  })
  it('has a Turkish sentence for every case, falling back kindly', () => {
    expect(friendlyMessage({ message: 'LUGU_USE_REPLAY' })).toMatch(/tekrar/)
    expect(friendlyMessage({ message: 'LUGU_SOMETHING_NEW' })).toMatch(/tekrar dener/)
    expect(friendlyMessage(new Error('boom'))).toMatch(/ters gitti/)
  })
})
