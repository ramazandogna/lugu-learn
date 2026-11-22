import { AVATAR_KEYS, type AvatarKey } from '@/design'

export interface ProfileValues {
  firstName: string
  lastName: string
  displayName: string
  grade: number | undefined
  schoolId: string
  avatarKey: AvatarKey | undefined
}

export const isAvatarKey = (k: string | null | undefined): k is AvatarKey => !!k && (AVATAR_KEYS as readonly string[]).includes(k)

interface ProfileRow {
  first_name: string | null
  last_name: string | null
  display_name: string | null
  grade: number | null
  school_id: string | null
  avatar_key: string | null
}

/** Form values from a `student_profiles` row (or blanks for a new learner). */
export function toProfileValues(row: ProfileRow | null): ProfileValues {
  return {
    firstName: row?.first_name ?? '',
    lastName: row?.last_name ?? '',
    displayName: row?.display_name ?? '',
    grade: row?.grade ?? undefined,
    schoolId: row?.school_id ?? '',
    avatarKey: isAvatarKey(row?.avatar_key) ? row.avatar_key : undefined,
  }
}

/** The name Lugu greets the learner with. */
export const greetingName = (p: { display_name: string | null; first_name: string | null } | null) =>
  p?.display_name?.trim() || p?.first_name?.trim() || ''
