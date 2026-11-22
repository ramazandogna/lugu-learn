import type { AccountStatus } from '@/lib/database.types'

/** The fields of a student summary the list filters read. */
export interface FilterableStudent {
  code: string
  name: string
  displayName: string | null
  grade: number | null
  school: { id: string; name: string } | null
  status: AccountStatus
  program: { curriculumId: string; curriculumName: string; currentLesson: { id: string; title: string } | null } | null
}

export interface StudentFilters {
  q: string
  grade: number | undefined
  schoolId: string | undefined
  curriculumId: string | undefined
  lessonId: string | undefined
  status: AccountStatus | undefined
}

export const EMPTY_FILTERS: StudentFilters = { q: '', grade: undefined, schoolId: undefined, curriculumId: undefined, lessonId: undefined, status: undefined }

/** Turkish-aware fold: case and dotted/dotless i do not matter. */
export const fold = (s: string) => s.toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/\p{M}/gu, '').replace(/ı/g, 'i').trim()

export function filterStudents<S extends FilterableStudent>(list: readonly S[], f: StudentFilters): S[] {
  const q = fold(f.q)
  return list.filter((s) => {
    if (q && ![s.code, s.name, s.displayName ?? '', s.school?.name ?? ''].some((x) => fold(x).includes(q))) return false
    if (f.grade !== undefined && s.grade !== f.grade) return false
    if (f.schoolId && s.school?.id !== f.schoolId) return false
    if (f.curriculumId && s.program?.curriculumId !== f.curriculumId) return false
    if (f.lessonId && s.program?.currentLesson?.id !== f.lessonId) return false
    if (f.status && s.status !== f.status) return false
    return true
  })
}

interface Option<V> {
  value: V
  label: string
}

/** The choices actually present in the list, so a filter never offers an empty result by construction. */
export function filterOptions(list: readonly FilterableStudent[]) {
  const grades = new Map<number, Option<number>>()
  const schools = new Map<string, Option<string>>()
  const programs = new Map<string, Option<string>>()
  const lessons = new Map<string, Option<string>>()
  for (const s of list) {
    if (s.grade !== null) grades.set(s.grade, { value: s.grade, label: `${s.grade}. sınıf` })
    if (s.school) schools.set(s.school.id, { value: s.school.id, label: s.school.name })
    if (s.program) {
      programs.set(s.program.curriculumId, { value: s.program.curriculumId, label: s.program.curriculumName })
      const l = s.program.currentLesson
      if (l) lessons.set(l.id, { value: l.id, label: l.title })
    }
  }
  const byLabel = <V>(m: Map<unknown, Option<V>>) => [...m.values()].sort((a, b) => a.label.localeCompare(b.label, 'tr'))
  return {
    grades: [...grades.values()].sort((a, b) => a.value - b.value),
    schools: byLabel(schools),
    programs: byLabel(programs),
    lessons: byLabel(lessons),
  }
}
