import { describe, expect, it, vi } from 'vitest'

vi.mock('./supabase', () => ({ supabase: {}, db: {} }))
const { loginEmail } = await import('./auth')

describe('loginEmail', () => {
  it.each([
    ['LUGU-1042', 'lugu-1042@students.lugu.invalid'],
    ['lugu-1042', 'lugu-1042@students.lugu.invalid'],
    [' LUGU 1042 ', 'lugu-1042@students.lugu.invalid'],
    ['lugu1042', 'lugu-1042@students.lugu.invalid'],
    ['Teacher@Example.com', 'teacher@example.com'],
  ])('%s → %s', (input, expected) => expect(loginEmail(input)).toBe(expected))

  it.each(['', '1042', 'LUGU-', 'LUGU-12', 'hello'])('rejects %j', (input) => expect(loginEmail(input)).toBeNull())
})
