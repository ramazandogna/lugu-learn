/**
 * Compile-only check (never executed): src/lib/database.types.ts must drive supabase-js typing for
 * the `lugu` schema. Run by `pnpm vue-tsc --build` through tsconfig.node.json.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database, LessonCompletion, SessionPayload, StudentHome } from '@/lib/database.types'

const db = createClient<Database>('http://localhost:54321', 'anon', { db: { schema: 'lugu' } })

type Expect<T extends true> = T
type Equal<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false

export async function typeChecks() {
  const profile = await db.from('profiles').select('role, status, must_change_password').eq('user_id', 'x').maybeSingle()
  if (profile.data) {
    const role: 'admin' | 'student' = profile.data.role
    const flag: boolean = profile.data.must_change_password
    void role
    void flag
  }

  const sp = await db.from('student_profiles').select('profile_completed_at, schools(name)').maybeSingle()
  if (sp.data) {
    const done: string | null = sp.data.profile_completed_at
    void done
  }

  const home = await db.rpc('student_home')
  type _home = Expect<Equal<NonNullable<typeof home.data>, StudentHome>>

  const session = await db.rpc('start_or_resume_session', { lesson_id: 'l', kind: 'replay' })
  type _session = Expect<Equal<NonNullable<typeof session.data>, SessionPayload>>

  const done = await db.rpc('complete_lesson', { session_id: 's' })
  type _done = Expect<Equal<NonNullable<typeof done.data>, LessonCompletion>>

  await db.rpc('mark_password_changed')
  await db.rpc('record_vocab_answer', { session_id: 's', item_id: 'wake-up', direction: 'en_tr', chosen: 'uyanmak' })
  await db.from('ai_jobs').insert({ kind: 'lesson_package' })
  await db.from('lesson_content_packages').insert({ lesson_id: 'l', content: {} })

  // @ts-expect-error: unknown section key
  await db.rpc('complete_section', { session_id: 's', section: 'intro' })
  // @ts-expect-error: generated column is not insertable
  await db.from('schools').insert({ name: 'n', city: 'c', normalized_key: 'k' })

  const schools = await db.rpc('search_schools', { q: '30 agustos' })
  const first: string | undefined = schools.data?.[0]?.name
  void first
}
