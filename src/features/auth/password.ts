/** Password checks for the first-login change. Kind and specific, never scary. */
export type Strength = 'short' | 'weak' | 'ok' | 'strong'

export const MIN_PASSWORD = 8

export function passwordStrength(pw: string): Strength {
  if (pw.length < MIN_PASSWORD) return 'short'
  const kinds = [/[a-zğüşıöç]/, /[A-ZĞÜŞİÖÇ]/, /\d/, /[^\p{L}\d]/u].filter((r) => r.test(pw)).length
  if (kinds >= 3 && pw.length >= 12) return 'strong'
  if (kinds >= 2) return 'ok'
  return 'weak'
}

export const STRENGTH_TEXT: Record<Strength, string> = {
  short: `En az ${MIN_PASSWORD} karakter olmalı.`,
  weak: 'Biraz daha güçlendirelim: bir rakam ya da büyük harf ekleyebilirsin.',
  ok: 'Güzel! Daha da güçlü olması için biraz uzatabilirsin.',
  strong: 'Harika, çok güçlü bir şifre!',
}
