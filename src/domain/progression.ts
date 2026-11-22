/**
 * Lesson states for the learning map, derived — never stored. Mirrors the
 * server rule (docs/architecture.md §2.5, `student_learning_map`):
 *
 * 1. The current lesson of an `active` assignment → `in_progress` when an
 *    active primary session exists for it, else `available` — even when it
 *    has a completion record: an admin who moves a student back or restarts
 *    a lesson wants it taken again, and the old record stays as history.
 * 2. Otherwise a completion record → `completed` (replayable), also while the
 *    assignment is paused. A paused (or archived/completed) assignment opens
 *    nothing new.
 * 3. Everything else → `locked` (later lessons, and earlier lessons an admin
 *    moved past without a record).
 */
export type LessonState = 'locked' | 'available' | 'in_progress' | 'completed'
export type AssignmentStatus = 'active' | 'paused' | 'archived' | 'completed'

export interface ProgressionInput {
  /** Lessons of the curriculum version; sorted by `sequence` here. */
  lessons: readonly { id: string; sequence: number }[]
  currentLessonId: string | null
  completedLessonIds: Iterable<string>
  /** Lesson ids with a `learning_sessions` row of kind `primary`, status `active`. */
  activePrimaryLessonIds: Iterable<string>
  assignmentStatus: AssignmentStatus
}

export interface MapLesson {
  id: string
  sequence: number
  state: LessonState
  /** Completed lessons can be replayed (a replay never changes the record). */
  replayable: boolean
}

export function deriveLessonStates(input: ProgressionInput): MapLesson[] {
  const done = new Set(input.completedLessonIds)
  const active = new Set(input.activePrimaryLessonIds)
  const open = input.assignmentStatus === 'active'
  return [...input.lessons]
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ id, sequence }) => {
      const state: LessonState =
        open && id === input.currentLessonId
          ? active.has(id)
            ? 'in_progress'
            : 'available'
          : done.has(id)
            ? 'completed'
            : 'locked'
      return { id, sequence, state, replayable: state === 'completed' }
    })
}

/** May the student open this lesson? `primary` for the current lesson, `replay` for a completed one, null otherwise. */
export function sessionKindFor(state: LessonState): 'primary' | 'replay' | null {
  if (state === 'completed') return 'replay'
  if (state === 'available' || state === 'in_progress') return 'primary'
  return null
}
