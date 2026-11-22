/**
 * Client-side grading, for instant feedback only. The server's
 * `lugu.grade_response()` is authoritative and implements the same rules;
 * `src/domain/grading-cases.ts` holds the shared cases both must agree on.
 */
import type { Question, VocabItem } from './content'

/** Direction of a vocabulary question: prompt language → answer language. */
export type VocabDirection = 'en_tr' | 'tr_en'

/**
 * Normalise a typed answer so trivial differences do not count as errors.
 *
 * Steps, in this exact order (the SQL twin must follow it):
 * 1. Unicode NFC.
 * 2. Typographic apostrophes `’` and `‘` → `'`.
 * 3. `İ` and `I` → `i` (Turkish-safe: JS would turn `İ` into `i̇`), then lower-case.
 * 4. Trim, then collapse every whitespace run to one space.
 * 5. Strip trailing `.`, `!`, `?` (any number), then trim again.
 *
 * Whitespace is the JS `\s` class (includes NBSP and other Unicode spaces).
 */
export function normalizeAnswer(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[’‘]/g, "'")
    .replace(/[İI]/g, 'i')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
    .trim()
}

/**
 * Grade one response against a question.
 *
 * - `choice`: `response` is the ORIGINAL option index (not the shuffled display position).
 * - `order`: `response` is the token texts in the chosen order; exact, element-wise
 *   equality with `answer` (tokens come from the question itself, so no normalisation:
 *   a punctuation token such as `?` must not collapse to an empty string).
 * - `text`: correct when the normalised response equals any normalised `accept`;
 *   an empty normalised response is never correct.
 *
 * Any response of the wrong shape is incorrect (never throws): it comes from jsonb.
 */
export function gradeResponse(question: Question, response: unknown): boolean {
  switch (question.type) {
    case 'choice':
      return typeof response === 'number' && Number.isInteger(response) && response === question.answer
    case 'order':
      return (
        Array.isArray(response) &&
        response.length === question.answer.length &&
        response.every((t, i) => typeof t === 'string' && t === question.answer[i])
      )
    case 'text': {
      if (typeof response !== 'string') return false
      const r = normalizeAnswer(response)
      return r !== '' && question.accept.some((a) => normalizeAnswer(a) === r)
    }
  }
}

/** The text a vocabulary question expects in `direction`. */
export const vocabTarget = (item: Pick<VocabItem, 'en' | 'tr'>, direction: VocabDirection) =>
  direction === 'en_tr' ? item.tr : item.en

/** The text a vocabulary question shows in `direction`. */
export const vocabPrompt = (item: Pick<VocabItem, 'en' | 'tr'>, direction: VocabDirection) =>
  direction === 'en_tr' ? item.en : item.tr

/**
 * Grade a vocabulary answer by the chosen option's TEXT (what `record_vocab_answer`
 * receives): `en_tr` expects `item.tr`, `tr_en` expects `item.en`, compared normalised.
 */
export function gradeVocab(item: Pick<VocabItem, 'en' | 'tr'>, direction: VocabDirection, chosen: string): boolean {
  const c = normalizeAnswer(chosen)
  return c !== '' && c === normalizeAnswer(vocabTarget(item, direction))
}
