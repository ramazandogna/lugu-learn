/** Small Turkish wording helpers for the result screens. */

/** Possessive suffix after a number: 4 -> "ü" ("4'ü"), 7 -> "si", 10 -> "u". */
export function possessive(n: number): string {
  const whole = Math.abs(Math.trunc(n))
  if (whole === 0) return 'ı'
  const last = whole % 10
  if (last !== 0) return ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'][last] as string
  const tens = whole % 100
  if (tens !== 0) return ({ 10: 'u', 20: 'si', 30: 'u', 40: 'ı', 50: 'si', 60: 'ı', 70: 'i', 80: 'i', 90: 'ı' } as Record<number, string>)[tens] ?? 'u'
  return 'ü'
}

/** "7 adımın 4'ü" (or "7 sorunun 4'ü"). */
export const stepsOf = (total: number, done: number, noun: 'adım' | 'soru' = 'adım'): string =>
  `${total} ${noun === 'soru' ? 'sorunun' : 'adımın'} ${done}'${possessive(done)}`

/** Short local date like "12 Kas". */
export function shortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}
