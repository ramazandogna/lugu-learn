import type { MapNode, MapNodeState } from '@/design'
import type { LessonState, StudentLearningMap } from '@/lib/database.types'

type MapLesson = StudentLearningMap['lessons'][number]

/** Server lesson state → the map's node state. `current` is "available" until a session exists. */
export const NODE_STATE: Record<LessonState, MapNodeState> = {
  current: 'available',
  in_progress: 'in_progress',
  completed: 'completed',
  locked: 'locked',
}

export const toMapNodes = (lessons: readonly MapLesson[]): MapNode[] =>
  lessons.map((l) => ({ id: l.id, title: l.title, sequence: l.sequence, state: NODE_STATE[l.state], character: l.character }))

/** Where a tap on an open node goes: completed lessons are replays. */
export function lessonRoute(lesson: Pick<MapLesson, 'id' | 'state'>): string | null {
  if (lesson.state === 'locked') return null
  return lesson.state === 'completed' ? `/ders/${lesson.id}/tekrar` : `/ders/${lesson.id}`
}

/** Why a locked lesson is locked, in words a learner can act on. */
export function lockedReason(lesson: Pick<MapLesson, 'sequence' | 'teacher_locked'>, map: StudentLearningMap): string {
  if (map.assignment.status === 'paused') return 'Programın şu an duraklatıldı. Öğretmenin açınca bu ders de sırası gelince açılacak.'
  if (lesson.teacher_locked) return 'Bu ders henüz açılmadı. Öğretmeninden bu dersi senin için açmasını isteyebilirsin!'
  const current = map.lessons.find((l) => l.id === map.assignment.current_lesson_id)
  if (current && lesson.sequence < current.sequence)
    return 'Öğretmenin bu dersi şimdilik atlamanı istedi. Güncel dersine devam edebilirsin.'
  /* Open lessons wait for the ones before them: count the open stops still ahead of this one. */
  const before = current ? map.lessons.filter((l) => !l.teacher_locked && l.sequence >= current.sequence && l.sequence < lesson.sequence).length : 0
  return before > 1
    ? `Bu ders ${before} ders sonra açılacak. Sıradaki dersini bitirdikçe yol açılır!`
    : 'Bu ders, şu anki dersini bitirince açılacak. Az kaldı!'
}

/** The next few lessons after the current one, for the home page. */
export const upcoming = (map: StudentLearningMap, count = 3) => map.lessons.filter((l) => l.state === 'locked' && l.sequence > (map.lessons.find((x) => x.id === map.assignment.current_lesson_id)?.sequence ?? Infinity)).slice(0, count)
