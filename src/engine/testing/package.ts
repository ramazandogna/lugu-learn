/** Test-only: a small valid lesson package. Not imported by app code. */
import { LessonPackage } from '@/domain/content'

const vocab = (id: string, en: string, tr: string, difficulty: number) => ({
  id,
  en,
  tr,
  example: { en: `${en}.`, tr: `${tr}.` },
  difficulty,
})

export function testPackage(over: Partial<Record<'review' | 'vocabulary', unknown>> = {}): LessonPackage {
  return LessonPackage.parse({
    schemaVersion: 1,
    meta: {
      title: 'Morning',
      tagline: 'Sabah rutini',
      theme: 'home',
      character: 'piko',
      level: 'A1',
      estimatedMinutes: 40,
      objectives: [{ id: 'obj-1', text: 'Talk about routines' }],
    },
    review: over.review ?? { questions: [] },
    vocabulary: over.vocabulary ?? [
      vocab('have-breakfast', 'have breakfast', 'kahvaltı yapmak', 1),
      vocab('go-to-school', 'go to school', 'okula gitmek', 1),
      vocab('look-for', 'look for', 'aramak', 2),
      vocab('be-afraid-of', 'be afraid of', 'korkmak', 2),
      vocab('get-up', 'get up', 'kalkmak', 1),
      vocab('wake-up', 'wake up', 'uyanmak', 3),
    ],
    story: {
      title: 'Piko wakes up',
      character: 'piko',
      setting: 'home',
      scenes: [
        { id: 'sc-1', lines: [{ speaker: 'narrator', en: 'Piko wakes up.' }] },
        {
          id: 'sc-2',
          lines: [{ speaker: 'piko', en: 'I am hungry!' }],
          choice: {
            prompt: 'What does Piko do?',
            options: [
              { text: 'Have breakfast', feedback: 'Afiyet olsun!' },
              { text: 'Go back to bed', feedback: 'Ama okul var!' },
            ],
          },
        },
        { id: 'sc-3', lines: [{ speaker: 'narrator', en: 'Piko goes to school.' }] },
      ],
      questions: [
        { id: 'sq-1', type: 'choice', prompt: 'Is Piko hungry?', options: ['Yes', 'No'], answer: 0, hint: 'Sahne 2', explain: 'Evet.' },
        { id: 'sq-2', type: 'text', prompt: 'Where does Piko go?', accept: ['to school', 'school'] },
      ],
    },
    explanation: {
      steps: [{ id: 'ex-1', title: 'Present simple', body: 'Her gün yaptıklarımız.' }],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'obj-1',
          complete: { id: 'hw-1-c', type: 'choice', prompt: 'I ___ breakfast.', options: ['have', 'has'], answer: 0, hint: 'I ile' },
          order: { id: 'hw-1-o', type: 'order', prompt: 'Sırala', tokens: ['breakfast', 'I', 'have'], answer: ['I', 'have', 'breakfast'] },
          meaning: { id: 'hw-1-m', type: 'text', prompt: 'Türkçesi?', accept: ['kahvaltı yaparım'] },
        },
        {
          id: 'hw-2',
          objectiveId: 'obj-1',
          complete: { id: 'hw-2-c', type: 'choice', prompt: 'She ___ to school.', options: ['go', 'goes'], answer: 1 },
          order: { id: 'hw-2-o', type: 'order', prompt: 'Sırala', tokens: ['school', 'goes', 'She', 'to'], answer: ['She', 'goes', 'to', 'school'] },
          meaning: { id: 'hw-2-m', type: 'choice', prompt: 'Anlamı?', options: ['Okula gider', 'Eve gider'], answer: 0 },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'aq-1', type: 'choice', prompt: 'He ___ up at 7.', options: ['get', 'gets', 'getting', 'got'], answer: 1, hint: 'x', explain: 'y' },
        { id: 'aq-2', type: 'text', prompt: 'kahvaltı yapmak = ?', accept: ['have breakfast'] },
        { id: 'aq-3', type: 'order', prompt: 'Cümleyi kur', tokens: ['up', 'I', 'wake'], answer: ['I', 'wake', 'up'] },
      ],
      reading: {
        title: 'A busy morning',
        paragraphs: ['Momo gets up early.'],
        questions: [
          { id: 'ar-1', type: 'choice', prompt: 'Momo gets up late.', options: ['True', 'False'], answer: 1 },
          { id: 'ar-2', type: 'choice', prompt: 'Momo ___ up early.', options: ['get', 'gets', 'got', 'getting'], answer: 1 },
        ],
      },
    },
  })
}
