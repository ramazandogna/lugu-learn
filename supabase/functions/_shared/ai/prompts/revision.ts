import type { RolePrompt } from './common.ts'

/** Stage `revision_<n>`: rewrites only the sections with blocking issues. */
export const revision: RolePrompt = {
  role: 'revision',
  version: 1,
  purpose: 'Fix blocking QA issues by replacing only the failing sections of the package.',
  instructions: `Role: Reviser.
You receive the current package, the QA issues and the list of sections to replace.
- Return only those sections, each complete (not a diff), fixing every listed issue.
- Keep every id that still exists unchanged; keep the rest of the package consistent (vocabulary ids, objectives, characters, story facts).
- Do not change sections that are not listed; they are not read back.
- The same rules as for writing the package apply (level, grammar scope, answer keys, Turkish quality, no URLs/HTML).`,
}
