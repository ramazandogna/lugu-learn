import { computed, reactive, readonly } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { setRememberMe } from 'rei-kit/supabase'
import { db, supabase } from './supabase'

export type Role = 'admin' | 'student'
export type AccountStatus = 'active' | 'paused' | 'disabled'

export interface Account {
  userId: string
  role: Role
  status: AccountStatus
  mustChangePassword: boolean
  /** Students only: false until first name, grade, school and avatar are set. */
  profileComplete: boolean
}

const STUDENT_CODE = /^lugu-?(\d{3,})$/i

/**
 * Students sign in with the code the teacher gave them (`LUGU-1042`); Auth
 * knows them by a synthetic address on the reserved `.invalid` domain, so no
 * real mailbox is ever involved. Anything containing `@` is an admin email.
 * Returns null when the input is neither.
 */
export function loginEmail(identifier: string): string | null {
  const id = identifier.trim()
  if (id.includes('@')) return id.toLowerCase()
  const m = STUDENT_CODE.exec(id.replace(/\s+/g, ''))
  return m ? `lugu-${m[1]}@students.lugu.invalid` : null
}

const state = reactive<{ ready: boolean; session: Session | null; account: Account | null }>({
  ready: false,
  session: null,
  account: null,
})

async function loadAccount(session: Session | null): Promise<Account | null> {
  if (!session) return null
  const userId = session.user.id
  const { data: profile, error } = await db
    .from('profiles')
    .select('role, status, must_change_password')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!profile) return null
  let profileComplete = true
  if (profile.role === 'student') {
    const { data: sp, error: spError } = await db
      .from('student_profiles')
      .select('profile_completed_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (spError) throw spError
    profileComplete = Boolean(sp?.profile_completed_at)
  }
  return {
    userId,
    role: profile.role,
    status: profile.status,
    mustChangePassword: profile.must_change_password,
    profileComplete,
  }
}

async function apply(session: Session | null) {
  const account = await loadAccount(session)
  // A paused/disabled account with a still-valid token would bounce between login and home.
  if (session && account && account.status !== 'active') {
    await supabase.auth.signOut()
    state.session = null
    state.account = null
    return
  }
  state.session = session
  state.account = account
}

let readyPromise: Promise<void> | null = null

/** Restores the stored session once; the router guard awaits it before its first decision. */
export function authReady(): Promise<void> {
  readyPromise ??= (async () => {
    const { data } = await supabase.auth.getSession()
    try {
      await apply(data.session)
    } finally {
      state.ready = true
    }
    supabase.auth.onAuthStateChange((event, session) => {
      // Token refreshes keep the same account; reloading it on each would be wasted requests.
      if (event === 'TOKEN_REFRESHED') {
        state.session = session
        return
      }
      void apply(session)
    })
  })()
  return readyPromise
}

export type SignInError = 'invalid_identifier' | 'invalid_credentials' | 'account_inactive' | 'no_profile' | 'network'

export async function signIn(identifier: string, password: string, remember: boolean): Promise<SignInError | null> {
  const email = loginEmail(identifier)
  if (!email) return 'invalid_identifier'
  setRememberMe(remember)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error?.code === 'user_banned') return 'account_inactive'
  if (error) return error.status === 400 || error.code === 'invalid_credentials' ? 'invalid_credentials' : 'network'
  const account = await loadAccount(data.session)
  if (!account) {
    await supabase.auth.signOut()
    return 'no_profile'
  }
  if (account.status !== 'active') {
    await supabase.auth.signOut()
    return 'account_inactive'
  }
  state.session = data.session
  state.account = account
  return null
}

export async function signOut() {
  await supabase.auth.signOut()
  state.session = null
  state.account = null
}

/** Sets a new password and clears the first-login flag (server-side RPC; the flag is not client-writable). */
export async function changePassword(password: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return error.message
  const { error: rpcError } = await db.rpc('mark_password_changed')
  if (rpcError) return rpcError.message
  if (state.account) state.account.mustChangePassword = false
  return null
}

export function markProfileComplete() {
  if (state.account) state.account.profileComplete = true
}

export const auth = readonly(state)
export const isAuthenticated = computed(() => state.account !== null && state.account.status === 'active')
export const isAdmin = computed(() => state.account?.role === 'admin')
