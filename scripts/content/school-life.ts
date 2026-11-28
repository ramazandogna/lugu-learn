/**
 * Publishes the "School Life" lesson (curriculum "Örnek Müfredat: School Life", one version, one lesson).
 * A published version cannot take new lessons, so a separate curriculum keeps the 6th grade program untouched.
 * Publishing logic: `publish.ts`.
 *
 * Usage:
 *   LUGU_ADMIN_PASSWORD=... pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/school-life.ts [--check] [--assign LUGU-1001]
 */
import { runCli } from './publish.ts'
import { schoolLifePackageInput, schoolLifeSpeakingPlan, schoolLifeTeacherGuide } from './school-life-package.ts'

runCli({
  name: 'Örnek Müfredat: School Life',
  description: 'He / she / it + is konusu, okul hayatı teması. Örnek içerik dersi.',
  grade: 6,
  targetLevel: 'A1',
  lessons: [
    {
      title: 'Ünite 1 — School Life',
      sourceNotes: 'He / she / it + is / isn’t, Is he …?; okul hayatı kelimeleri.',
      package: schoolLifePackageInput,
      teacherGuide: schoolLifeTeacherGuide,
      speakingPlan: schoolLifeSpeakingPlan,
    },
  ],
})
