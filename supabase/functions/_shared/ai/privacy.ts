/**
 * Data minimisation for prompts. Learners are children: the model receives
 * ids, aggregates and lesson content only — never names, student codes,
 * emails, schools or free text that mentions them.
 */

/** Personal fields a student record may carry. Used only to scrub, never rendered. */
export interface PersonalNames {
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  studentCode?: string | null
  schoolName?: string | null
}

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g
const PHONE = /(?:\+?\d[\d\s()-]{8,}\d)/g
const STUDENT_CODE = /\bLUGU-\d{3,}\b/gi

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Distinct name tokens (≥2 letters), in Turkish- and ASCII-cased variants. */
function nameVariants(names: PersonalNames): string[] {
  const tokens = new Set<string>()
  for (const v of Object.values(names)) {
    if (!v) continue
    for (const part of [v, ...v.split(/\s+/)]) {
      const t = part.trim()
      if (t.length < 2) continue
      tokens.add(t)
      tokens.add(t.toLocaleLowerCase('tr'))
      tokens.add(t.toLocaleUpperCase('tr'))
      tokens.add(t.toLowerCase())
      tokens.add(t.toUpperCase())
    }
  }
  // Longest first so "Ayşe Yılmaz" is replaced before "Ayşe".
  return [...tokens].sort((a, b) => b.length - a.length)
}

/**
 * Replaces the student's names, student code, e-mail addresses and phone
 * numbers in free text (teacher notes) with neutral placeholders.
 */
export function scrubText(text: string, names: PersonalNames): string {
  let out = text.replace(EMAIL, '[e-posta]').replace(STUDENT_CODE, '[öğrenci]').replace(PHONE, '[telefon]')
  for (const token of nameVariants(names)) {
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(token)}(?![\\p{L}\\p{N}])`, 'gu'), 'öğrenci')
  }
  return out
}

/** True when any name token of `names` still occurs in `text` (used by tests and as a last guard). */
export function containsPersonalName(text: string, names: PersonalNames): boolean {
  const lower = text.toLocaleLowerCase('tr')
  return nameVariants(names).some((t) =>
    new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(t.toLocaleLowerCase('tr'))}(?![\\p{L}\\p{N}])`, 'u').test(lower),
  )
}
