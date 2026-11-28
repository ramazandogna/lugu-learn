import { listAssignments } from '@/lib/api/admin'

export interface SpeakingLessonOption {
  value: string
  label: string
}

/**
 * Every lesson of a student's open programs, for "which lesson do we talk about": the current lesson of each
 * program first is not needed — the caller defaults to it; options keep curriculum order.
 */
export async function speakingLessonOptions(studentId: string): Promise<{ options: SpeakingLessonOption[]; current: string | null }> {
  const all = await listAssignments(studentId)
  const open = all.filter((a) => a.assignment.status !== 'archived')
  const options = open.flatMap((a) =>
    a.lessons
      .filter((l) => l.status !== 'archived')
      .map((l) => ({
        value: l.id,
        label: `${open.length > 1 ? `${a.curriculumName} · ` : ''}${l.sequence}. ${l.title}${a.completedLessonIds.has(l.id) ? ' ✓' : l.id === a.assignment.current_lesson_id ? ' (şu anki)' : ''}`,
      })),
  )
  const active = open.find((a) => a.assignment.status === 'active') ?? open[0]
  return { options, current: active?.assignment.current_lesson_id ?? null }
}
