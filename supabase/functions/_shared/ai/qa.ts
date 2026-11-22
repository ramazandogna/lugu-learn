/**
 * Deterministic QA: checks that need no model and run before the AI reviewer.
 * Findings use the {@link QaReport} issue shape; `area` is always a package
 * section so a blocker can be revised on its own.
 */
import { LessonPackage, QaReport, type Question } from '@/domain/content.ts'
import type { z } from 'zod'

export type QaIssue = z.infer<typeof QaReport>['issues'][number]

export const PACKAGE_SECTIONS = ['meta', 'review', 'vocabulary', 'story', 'explanation', 'homework', 'assessment'] as const
export type PackageSection = (typeof PACKAGE_SECTIONS)[number]

export function isPackageSection(s: string): s is PackageSection {
  return (PACKAGE_SECTIONS as readonly string[]).includes(s)
}

/** Thresholds from the brief (§12.2, §12.6, §12.7). */
export const QA_LIMITS = {
  vocabTarget: 15,
  vocabMin: 10,
  vocabMax: 20,
  storyVocabCoverage: 0.7,
  homeworkMin: 6,
  homeworkMax: 8,
  readingTrueFalse: 5,
  readingFill: 3,
} as const

const IRREGULAR: Record<string, string> = { has: 'have', does: 'do', goes: 'go', is: 'be', are: 'be', am: 'be', was: 'be', were: 'be' }
const POSSESSIVES = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their'])

/** Lowercase, strip punctuation, unify possessive pronouns and third-person -s/-es. */
export function normaliseTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .split(/[^a-z']+/)
    .filter(Boolean)
    .map((t) => {
      const w = t.replace(/'s$/, '')
      if (IRREGULAR[w]) return IRREGULAR[w]
      if (POSSESSIVES.has(w)) return '<poss>'
      if (/(ch|sh|ss|x)es$/.test(w)) return w.slice(0, -2)
      if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
      return w
    })
}

function containsSequence(haystack: string[], needle: string[]): boolean {
  if (!needle.length) return false
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer
    return true
  }
  return false
}

/** Vocabulary ids whose phrase does not occur in the story (normalised phrase match). */
export function storyMissingVocabulary(pkg: LessonPackage): string[] {
  const storyText = [
    pkg.story.title,
    ...pkg.story.scenes.flatMap((s) => [...s.lines.map((l) => l.en), ...(s.choice ? [s.choice.prompt, ...s.choice.options.map((o) => o.text)] : [])]),
  ].join(' \n ')
  const story = normaliseTokens(storyText)
  return pkg.vocabulary.filter((v) => !containsSequence(story, normaliseTokens(v.en))).map((v) => v.id)
}

const URL_OR_HTML = /(https?:\/\/|www\.)|<\/?[a-z][a-z0-9-]*(\s[^>]*)?>/i

function walkStrings(value: unknown, path: string[], visit: (s: string, path: string[]) => void): void {
  if (typeof value === 'string') visit(value, path)
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, [...path, String(i)], visit))
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) walkStrings(v, [...path, k], visit)
}

const isTrueFalse = (q: Question) =>
  q.type === 'choice' && q.options.length === 2 && q.options.every((o) => /^(true|false|doğru|yanlış)$/i.test(o.trim()))
const isFourOptionFill = (q: Question) => q.type === 'choice' && q.options.length === 4 && /_{2,}/.test(q.prompt)

function sectionOf(path: PropertyKey[]): PackageSection | 'general' {
  const head = String(path[0] ?? '')
  if (head === 'schemaVersion' || head === 'completion' || head === '') return 'general'
  return isPackageSection(head) ? head : 'general'
}

/** Maps package-level refinement messages back to the section that holds the item id. */
function sectionOfId(pkg: unknown, message: string): PackageSection | 'general' {
  const id = /^([a-z0-9][a-z0-9-]*):/.exec(message)?.[1] ?? /"([a-z0-9][a-z0-9-]*)"/.exec(message)?.[1]
  if (!id || !pkg || typeof pkg !== 'object') return 'general'
  for (const s of PACKAGE_SECTIONS) {
    const body = JSON.stringify((pkg as Record<string, unknown>)[s] ?? null)
    if (body.includes(`"id":"${id}"`)) return s
  }
  return 'general'
}

export interface DeterministicQaResult {
  /** The parsed package, or `null` when it does not satisfy the schema. */
  pkg: LessonPackage | null
  issues: QaIssue[]
}

/**
 * Runs `LessonPackage.safeParse` (ids, answer keys, permutations, objective and
 * vocabulary references, assessment ≠ homework) plus the pedagogical checks:
 * vocabulary count, story vocabulary coverage, reading question shapes,
 * homework group count, no URLs/HTML, Turkish fields present.
 */
export function deterministicQa(raw: unknown): DeterministicQaResult {
  const parsed = LessonPackage.safeParse(raw)
  if (!parsed.success) {
    return {
      pkg: null,
      issues: parsed.error.issues.map((i) => {
        const area = i.path.length ? sectionOf(i.path) : sectionOfId(raw, i.message)
        return { severity: 'blocker', area, message: `schema: ${i.path.join('.') || '(package)'}: ${i.message}` }
      }),
    }
  }
  const pkg = parsed.data
  const issues: QaIssue[] = []
  const add = (severity: QaIssue['severity'], area: PackageSection | 'general', message: string) =>
    issues.push({ severity, area, message })

  const n = pkg.vocabulary.length
  if (n < QA_LIMITS.vocabMin || n > QA_LIMITS.vocabMax)
    add('major', 'vocabulary', `${n} vocabulary items; aim for about ${QA_LIMITS.vocabTarget} (${QA_LIMITS.vocabMin}–${QA_LIMITS.vocabMax})`)

  const missing = storyMissingVocabulary(pkg)
  const coverage = n ? (n - missing.length) / n : 0
  if (coverage < QA_LIMITS.storyVocabCoverage)
    add(
      'blocker',
      'story',
      `story uses ${Math.round(coverage * 100)}% of the lesson vocabulary (minimum ${QA_LIMITS.storyVocabCoverage * 100}%); missing: ${missing.join(', ')}`,
    )

  const rq = pkg.assessment.reading.questions
  const tf = rq.filter(isTrueFalse).length
  const fill = rq.filter(isFourOptionFill).length
  if (tf === 0) add('major', 'assessment', 'reading has no true/false questions (expected about 5)')
  else if (tf !== QA_LIMITS.readingTrueFalse) add('minor', 'assessment', `reading has ${tf} true/false questions (expected about 5)`)
  if (fill === 0) add('major', 'assessment', 'reading has no four-option fill-in-the-blank questions (expected about 3)')
  else if (fill !== QA_LIMITS.readingFill) add('minor', 'assessment', `reading has ${fill} four-option fill-in-the-blank questions (expected about 3)`)
  if (pkg.assessment.quiz.length < 8 || pkg.assessment.quiz.length > 12)
    add('minor', 'assessment', `quiz has ${pkg.assessment.quiz.length} questions (expected about 10)`)
  for (const q of [...pkg.assessment.quiz, ...rq])
    if (q.hint || q.explain) add('major', 'assessment', `${q.id}: final assessment questions must not carry hints or explanations`)

  const g = pkg.homework.groups.length
  if (g < QA_LIMITS.homeworkMin || g > QA_LIMITS.homeworkMax)
    add('minor', 'homework', `${g} homework groups (expected ${QA_LIMITS.homeworkMin}–${QA_LIMITS.homeworkMax})`)

  walkStrings(pkg, [], (s, path) => {
    if (URL_OR_HTML.test(s)) add('blocker', sectionOf(path), `URL or HTML in ${path.join('.')}`)
  })

  for (const v of pkg.vocabulary) {
    if (v.tr.trim().toLowerCase() === v.en.trim().toLowerCase()) add('major', 'vocabulary', `${v.id}: Turkish meaning equals the English phrase`)
    if (v.example.tr.trim().toLowerCase() === v.example.en.trim().toLowerCase())
      add('major', 'vocabulary', `${v.id}: example translation equals the English sentence`)
  }
  const untranslated = pkg.story.scenes.flatMap((s) => s.lines.filter((l) => !l.tr?.trim()).map(() => s.id))
  if (untranslated.length) add('minor', 'story', `${untranslated.length} story lines without Turkish translation (scenes: ${[...new Set(untranslated)].join(', ')})`)
  for (const step of pkg.explanation.steps)
    if (step.examples.some((e) => !e.tr.trim())) add('major', 'explanation', `${step.id}: example without Turkish translation`)

  return { pkg, issues }
}

export const hasBlocker = (issues: readonly QaIssue[]) => issues.some((i) => i.severity === 'blocker')
