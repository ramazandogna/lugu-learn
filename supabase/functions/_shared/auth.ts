/**
 * Server-side auth for admin edge functions. The caller's JWT is verified with Auth, and the admin
 * role is read from `lugu.profiles` (never from JWT claims). The service-role key comes from the
 * environment only and never leaves the function.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types.ts'
import { json } from './cors.ts'

export function requireEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new Error(`missing environment variable ${name}`)
  return v
}

export function serviceClient() {
  return createClient<Database>(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'lugu' },
  })
}

export type ServiceClient = ReturnType<typeof serviceClient>

/** Returns the admin's user id and a service client, or an error Response to send as is. */
export async function requireAdmin(req: Request): Promise<{ adminId: string; service: ServiceClient } | Response> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return json(req, 401, { error: 'unauthorized' })
  const service = serviceClient()
  const { data, error } = await service.auth.getUser(token)
  if (error || !data.user) return json(req, 401, { error: 'unauthorized' })
  const { data: profile, error: pError } = await service
    .from('profiles')
    .select('role, status')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (pError) return json(req, 500, { error: 'profile_lookup_failed' })
  if (!profile || profile.role !== 'admin' || profile.status !== 'active') return json(req, 403, { error: 'forbidden' })
  return { adminId: data.user.id, service }
}

export async function audit(
  service: ServiceClient,
  actorId: string,
  action: string,
  targetTable: string,
  targetId: string,
  data: Record<string, string | number | boolean | null> = {},
): Promise<void> {
  const { error } = await service
    .from('admin_audit_logs')
    .insert({ actor_id: actorId, action, target_table: targetTable, target_id: targetId, data })
  if (error) console.error(`audit ${action} failed: ${error.message}`)
}
