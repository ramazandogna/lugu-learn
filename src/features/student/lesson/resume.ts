/**
 * From the server's `session_section_progress` rows to the player's starting
 * point: which sections are started/completed (for `createLessonFlow`), each
 * section's resume snapshot, and the section to open.
 */
import type { SectionKey } from '@/domain/content'
import { canEnter, nextSection, type LessonFlow } from '@/engine/lesson-flow'
import type { Json, Tables } from '@/lib/database.types'

type ProgressRow = Pick<Tables<'session_section_progress'>, 'section' | 'status' | 'state'>

export interface ResumePoint {
  started: SectionKey[]
  completed: SectionKey[]
  snapshots: Partial<Record<SectionKey, Json>>
  /** True when anything had been done before this visit. */
  resumed: boolean
}

const hasState = (s: Json) => s !== null && !(typeof s === 'object' && !Array.isArray(s) && Object.keys(s).length === 0)

export function resumePoint(rows: readonly ProgressRow[]): ResumePoint {
  const started: SectionKey[] = []
  const completed: SectionKey[] = []
  const snapshots: Partial<Record<SectionKey, Json>> = {}
  for (const r of rows) {
    if (r.status === 'completed') completed.push(r.section)
    else if (r.status === 'in_progress') started.push(r.section)
    if (hasState(r.state)) snapshots[r.section] = r.state
  }
  return { started, completed, snapshots, resumed: started.length + completed.length > 0 }
}

/**
 * The section to open: the server's `current_section` when it can still be
 * entered and is not already behind us, else the first section left to do,
 * else the last section (everything done — the completion screen follows).
 */
export function initialSection(flow: LessonFlow, serverCurrent: SectionKey | null): SectionKey | null {
  if (serverCurrent && canEnter(flow, serverCurrent) && !flow.completed.has(serverCurrent)) return serverCurrent
  return nextSection(flow) ?? flow.sections.at(-1) ?? null
}
