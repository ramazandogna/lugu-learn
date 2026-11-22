import { describe, expect, it } from 'vitest'

import { passwordStrength } from './password'

describe('passwordStrength', () => {
  it('grades by length and variety', () => {
    expect(passwordStrength('abc')).toBe('short')
    expect(passwordStrength('abcdefgh')).toBe('weak')
    expect(passwordStrength('abcdefg1')).toBe('ok')
    expect(passwordStrength('Kediler-sever-7')).toBe('strong')
  })
})
