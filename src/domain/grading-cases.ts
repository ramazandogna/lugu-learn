/**
 * Shared grading cases: `src/domain/grading.test.ts` runs them against the
 * TypeScript grader; the SQL `lugu.grade_response()` must give the same results.
 * Plain data only, so the DB test can import it as is.
 */
import type { Question } from './content'
import type { VocabDirection } from './grading'

export const normalizeCases: { input: string; expected: string }[] = [
  { input: 'Hello', expected: 'hello' },
  { input: '  have   breakfast  ', expected: 'have breakfast' },
  { input: 'Go to school.', expected: 'go to school' },
  { input: 'Really?!', expected: 'really' },
  { input: 'Wait ... ', expected: 'wait' },
  { input: 'Hello . ', expected: 'hello' },
  { input: 'I’m fine', expected: "i'm fine" },
  { input: '‘Yes’', expected: "'yes'" },
  { input: 'İSTANBUL', expected: 'istanbul' },
  { input: 'IRMAK', expected: 'irmak' },
  { input: 'ılık', expected: 'ılık' },
  { input: 'Ağaç\tve\nkuş', expected: 'ağaç ve kuş' },
  { input: 'é', expected: 'é' },
  { input: '...', expected: '' },
  { input: 'a.b', expected: 'a.b' },
  { input: '¡Hola!', expected: '¡hola' },
]

const choice: Question = { id: 'c1', type: 'choice', prompt: 'p', options: ['a', 'b', 'c', 'd'], answer: 2 }
const order: Question = {
  id: 'o1',
  type: 'order',
  prompt: 'p',
  tokens: ['school', 'I', 'to', 'go', '.'],
  answer: ['I', 'go', 'to', 'school', '.'],
}
const text: Question = { id: 't1', type: 'text', prompt: 'p', accept: ['have breakfast', 'eat breakfast'] }
const turkish: Question = { id: 't2', type: 'text', prompt: 'p', accept: ['İstanbul’a gidiyorum'] }

export const gradeCases: { name: string; question: Question; response: unknown; correct: boolean }[] = [
  { name: 'choice: right original index', question: choice, response: 2, correct: true },
  { name: 'choice: wrong index', question: choice, response: 1, correct: false },
  { name: 'choice: index as string', question: choice, response: '2', correct: false },
  { name: 'choice: fractional', question: choice, response: 2.5, correct: false },
  { name: 'choice: null', question: choice, response: null, correct: false },
  { name: 'order: right order', question: order, response: ['I', 'go', 'to', 'school', '.'], correct: true },
  { name: 'order: wrong order', question: order, response: ['go', 'I', 'to', 'school', '.'], correct: false },
  { name: 'order: case differs', question: order, response: ['i', 'go', 'to', 'school', '.'], correct: false },
  { name: 'order: missing token', question: order, response: ['I', 'go', 'to', 'school'], correct: false },
  { name: 'order: not an array', question: order, response: 'I go to school.', correct: false },
  { name: 'order: non-string token', question: order, response: ['I', 'go', 'to', 'school', 1], correct: false },
  { name: 'text: exact', question: text, response: 'have breakfast', correct: true },
  { name: 'text: second accept', question: text, response: 'Eat breakfast.', correct: true },
  { name: 'text: spacing and case', question: text, response: '  HAVE   Breakfast !', correct: true },
  { name: 'text: wrong', question: text, response: 'have lunch', correct: false },
  { name: 'text: empty', question: text, response: '   ', correct: false },
  { name: 'text: number', question: text, response: 5, correct: false },
  { name: 'text: Turkish İ and curly apostrophe', question: turkish, response: "istanbul'a gidiyorum", correct: true },
  { name: 'text: dotless ı is distinct', question: turkish, response: "ıstanbul'a gidiyorum", correct: false },
]

export const vocabCases: {
  name: string
  item: { en: string; tr: string }
  direction: VocabDirection
  chosen: string
  correct: boolean
}[] = [
  { name: 'en_tr expects tr', item: { en: 'have breakfast', tr: 'kahvaltı yapmak' }, direction: 'en_tr', chosen: 'kahvaltı yapmak', correct: true },
  { name: 'en_tr rejects en', item: { en: 'have breakfast', tr: 'kahvaltı yapmak' }, direction: 'en_tr', chosen: 'have breakfast', correct: false },
  { name: 'tr_en expects en', item: { en: 'Look for', tr: 'aramak' }, direction: 'tr_en', chosen: 'look for', correct: true },
  { name: 'tr_en wrong', item: { en: 'look for', tr: 'aramak' }, direction: 'tr_en', chosen: 'look at', correct: false },
  { name: 'Turkish capital İ', item: { en: 'get married', tr: 'İyi olmak' }, direction: 'en_tr', chosen: 'iyi olmak', correct: true },
  { name: 'empty chosen', item: { en: 'x', tr: 'y' }, direction: 'en_tr', chosen: '', correct: false },
]
