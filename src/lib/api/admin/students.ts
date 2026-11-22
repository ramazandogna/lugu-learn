import type { AccountStatus, AssignmentStatus, Tables, TablesUpdate } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export interface StudentProgram {
  assignmentId: string
  status: AssignmentStatus
  curriculumId: string
  curriculumName: string
  versionId: string
  version: number
  currentLesson: { id: string; title: string; sequence: number } | null
}

export interface StudentSummary {
  id: string
  code: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  /** Best human name, falling back to the code. */
  name: string
  grade: number | null
  avatarKey: string | null
  school: { id: string; name: string; city: string; district: string | null } | null
  status: AccountStatus
  mustChangePassword: boolean
  createdAt: string
  profileCompletedAt: string | null
  /** The newest open program (active/paused first, then completed). */
  program: StudentProgram | null
  lastActivityAt: string | null
}

export function studentName(p: Pick<Tables<'student_profiles'>, 'first_name' | 'last_name' | 'display_name' | 'student_code'>): string {
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ')
  return full || p.display_name || p.student_code
}

const uniq = <T>(xs: readonly (T | null | undefined)[]): T[] => [...new Set(xs.filter((x): x is T => x !== null && x !== undefined))]

async function summaries(ids?: readonly string[]): Promise<StudentSummary[]> {
  let spQuery = db.from('student_profiles').select('*').order('student_code')
  if (ids) spQuery = spQuery.in('user_id', [...ids])
  const profiles = must(await spQuery)
  if (!profiles.length) return []
  const userIds = profiles.map((p) => p.user_id)
  const [accounts, assignments, sessions] = await Promise.all([
    db.from('profiles').select('user_id, status, must_change_password, created_at').in('user_id', userIds).then(must),
    db
      .from('program_assignments')
      .select('*')
      .in('student_id', userIds)
      .in('status', ['active', 'paused', 'completed'])
      .order('created_at', { ascending: false })
      .then(must),
    db
      .from('learning_sessions')
      .select('student_id, last_seen_at')
      .in('student_id', userIds)
      .order('last_seen_at', { ascending: false })
      .limit(1000)
      .then(must),
  ])
  const versionIds = uniq(assignments.map((a) => a.curriculum_version_id))
  const lessonIds = uniq(assignments.map((a) => a.current_lesson_id))
  const schoolIds = uniq(profiles.map((p) => p.school_id))
  const [schools, versions, lessons] = await Promise.all([
    schoolIds.length ? db.from('schools').select('id, name, city, district').in('id', schoolIds).then(must) : [],
    versionIds.length ? db.from('curriculum_versions').select('id, version, curriculum_id').in('id', versionIds).then(must) : [],
    lessonIds.length ? db.from('curriculum_lessons').select('id, title, sequence').in('id', lessonIds).then(must) : [],
  ])
  const curriculumIds = uniq(versions.map((v) => v.curriculum_id))
  const curricula = curriculumIds.length ? must(await db.from('curricula').select('id, name').in('id', curriculumIds)) : []

  const account = new Map(accounts.map((a) => [a.user_id, a]))
  const school = new Map(schools.map((s) => [s.id, s]))
  const version = new Map(versions.map((v) => [v.id, v]))
  const lesson = new Map(lessons.map((l) => [l.id, l]))
  const curriculum = new Map(curricula.map((c) => [c.id, c]))
  const lastSeen = new Map<string, string>()
  for (const s of sessions) if (!lastSeen.has(s.student_id)) lastSeen.set(s.student_id, s.last_seen_at)
  const rank = (s: AssignmentStatus) => (s === 'completed' ? 1 : 0)

  return profiles.map((p) => {
    const a = account.get(p.user_id)
    const open = assignments.filter((x) => x.student_id === p.user_id).sort((x, y) => rank(x.status) - rank(y.status))[0]
    const v = open ? version.get(open.curriculum_version_id) : undefined
    const current = open?.current_lesson_id ? lesson.get(open.current_lesson_id) : undefined
    return {
      id: p.user_id,
      code: p.student_code,
      firstName: p.first_name,
      lastName: p.last_name,
      displayName: p.display_name,
      name: studentName(p),
      grade: p.grade,
      avatarKey: p.avatar_key,
      school: p.school_id ? (school.get(p.school_id) ?? null) : null,
      status: a?.status ?? 'active',
      mustChangePassword: a?.must_change_password ?? false,
      createdAt: a?.created_at ?? p.created_at,
      profileCompletedAt: p.profile_completed_at,
      program:
        open && v
          ? {
              assignmentId: open.id,
              status: open.status,
              curriculumId: v.curriculum_id,
              curriculumName: curriculum.get(v.curriculum_id)?.name ?? '—',
              versionId: v.id,
              version: v.version,
              currentLesson: current ?? null,
            }
          : null,
      lastActivityAt: lastSeen.get(p.user_id) ?? null,
    }
  })
}

export const listStudents = () => summaries()

export async function getStudent(id: string): Promise<StudentSummary | null> {
  return (await summaries([id]))[0] ?? null
}

export type StudentProfilePatch = Pick<TablesUpdate<'student_profiles'>, 'first_name' | 'last_name' | 'display_name' | 'grade' | 'school_id'>

export async function updateStudentProfile(id: string, patch: StudentProfilePatch): Promise<void> {
  ok(await db.from('student_profiles').update(patch).eq('user_id', id))
}

export async function searchSchools(q: string): Promise<Tables<'schools'>[]> {
  return must(await db.rpc('search_schools', { q }))
}

export async function addSchool(name: string, city: string, district: string | null): Promise<Tables<'schools'>> {
  return must(await db.rpc('add_school', { name, city, district }))
}
