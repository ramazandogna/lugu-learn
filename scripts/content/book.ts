/**
 * Publishes the textbook curriculum, units 1-2 (plan: docs/curriculum/kitap-mufredati.md).
 * One file per lesson in `book/`, in map order; units 3-4 are planned in the doc, not built yet.
 *
 * Usage:
 *   pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/book.ts --check [u1-l1 ...]   # validate only
 *   LUGU_ADMIN_PASSWORD=... pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/book.ts [--assign LUGU-1001]
 */
import { runCli, type ContentLesson } from './publish.ts'

export const LESSON_FILES = ['u1-l1', 'u1-l2', 'u1-l3', 'u1-l4', 'u1-l5', 'u1-l6', 'u2-l1', 'u2-l2', 'u2-l3', 'u2-l4'] as const

runCli(async () => {
  const args = process.argv.slice(2)
  const only = args.includes('--check') ? args.filter((a) => (LESSON_FILES as readonly string[]).includes(a)) : []
  const files = only.length ? only : LESSON_FILES
  const lessons = await Promise.all(files.map(async (f) => ((await import(`./book/${f}.ts`)) as { default: ContentLesson }).default))
  return {
    name: '6. Sınıf İngilizce — Kitap Müfredatı',
    description: 'Ders kitabının 4 temasından Ünite 1 (School Life) ve Ünite 2 (Classroom Life). Ünite 3-4 planlandı.',
    grade: 6,
    targetLevel: 'A1-A2',
    lessons,
  }
})
