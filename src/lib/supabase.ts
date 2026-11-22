import { createSupabaseClient } from 'rei-kit/supabase'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True when the deployment has been configured; the app shows a setup notice otherwise. */
export const isConfigured = Boolean(url && anonKey)

/**
 * The one client. The anon key is public by design: row-level security and
 * the `lugu.*` RPCs are the boundary, never this key or the role the UI reads.
 */
export const supabase = createSupabaseClient<Database>(url || 'http://localhost:54321', anonKey || 'unconfigured')

/** Every Lugu table and RPC lives in the `lugu` schema. */
export const db = supabase.schema('lugu')
