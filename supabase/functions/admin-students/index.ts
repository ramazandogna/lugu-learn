/**
 * admin-students: POST { action: 'create' | 'reset-password' | 'set-status', ... } (admin only).
 * - create: next LUGU-#### code, Auth user `lugu-####@students.lugu.invalid`, temporary password
 *   (returned once, never stored in plain text), profile with must_change_password = true.
 * - reset-password: new temporary password, must_change_password = true.
 * - set-status: profiles.status; paused/disabled also ban the Auth user, active unbans.
 */
import { z } from 'zod'
import { audit, requireAdmin, type ServiceClient } from '../_shared/auth.ts'
import { json, preflight } from '../_shared/cors.ts'

const Body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    first_name: z.string().trim().min(1).max(60).optional(),
    last_name: z.string().trim().min(1).max(60).optional(),
    display_name: z.string().trim().min(1).max(40).optional(),
    grade: z.number().int().min(1).max(12).optional(),
  }),
  z.object({ action: z.literal('reset-password'), student_id: z.uuid() }),
  z.object({ action: z.literal('set-status'), student_id: z.uuid(), status: z.enum(['active', 'paused', 'disabled']) }),
])

// No look-alike characters (0/o, 1/l/i): codes are read aloud and typed by children.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

export function temporaryPassword(length = 12): string {
  const out: string[] = []
  const buf = new Uint32Array(1)
  // Rejection sampling keeps every character equally likely.
  const limit = Math.floor(0x1_0000_0000 / ALPHABET.length) * ALPHABET.length
  while (out.length < length) {
    crypto.getRandomValues(buf)
    const n = buf[0]!
    if (n < limit) out.push(ALPHABET[n % ALPHABET.length]!)
  }
  return out.join('')
}

async function isStudent(service: ServiceClient, id: string): Promise<boolean> {
  const { data } = await service.from('profiles').select('role').eq('user_id', id).maybeSingle()
  return data?.role === 'student'
}

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  if (req.method !== 'POST') return json(req, 405, { error: 'method_not_allowed' })
  const auth = await requireAdmin(req)
  if (auth instanceof Response) return auth
  const { adminId, service } = auth

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json(req, 400, { error: 'invalid_body' })
  const body = parsed.data

  if (body.action === 'create') {
    const { data: code, error: codeError } = await service.rpc('next_student_code')
    if (codeError || !code) return json(req, 500, { error: 'code_failed' })
    const email = `${code.toLowerCase()}@students.lugu.invalid`
    const password = temporaryPassword()
    const { data: created, error: userError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { student_code: code },
    })
    if (userError || !created.user) return json(req, 500, { error: 'auth_create_failed' })
    const userId = created.user.id
    const { error: pError } = await service
      .from('profiles')
      .insert({ user_id: userId, role: 'student', status: 'active', must_change_password: true })
    const { error: spError } = pError
      ? { error: pError }
      : await service.from('student_profiles').insert({
          user_id: userId,
          student_code: code,
          first_name: body.first_name ?? null,
          last_name: body.last_name ?? null,
          display_name: body.display_name ?? null,
          grade: body.grade ?? null,
        })
    if (spError) {
      // Without its profile the account is unusable; remove it rather than leave an orphan.
      await service.auth.admin.deleteUser(userId)
      return json(req, 500, { error: 'profile_create_failed' })
    }
    await audit(service, adminId, 'student_created', 'student_profiles', userId, { student_code: code })
    return json(req, 200, { student_id: userId, student_code: code, password })
  }

  if (!(await isStudent(service, body.student_id))) return json(req, 404, { error: 'student_not_found' })

  if (body.action === 'reset-password') {
    const password = temporaryPassword()
    const { error } = await service.auth.admin.updateUserById(body.student_id, { password })
    if (error) return json(req, 500, { error: 'auth_update_failed' })
    await service.from('profiles').update({ must_change_password: true }).eq('user_id', body.student_id)
    await audit(service, adminId, 'student_password_reset', 'profiles', body.student_id)
    return json(req, 200, { student_id: body.student_id, password })
  }

  // ~100 years: Auth has no "forever" ban.
  const ban_duration = body.status === 'active' ? 'none' : '876000h'
  const { error } = await service.auth.admin.updateUserById(body.student_id, { ban_duration })
  if (error) return json(req, 500, { error: 'auth_update_failed' })
  const { error: sError } = await service.from('profiles').update({ status: body.status }).eq('user_id', body.student_id)
  if (sError) return json(req, 500, { error: 'status_update_failed' })
  await audit(service, adminId, 'student_status_set', 'profiles', body.student_id, { status: body.status })
  return json(req, 200, { student_id: body.student_id, status: body.status })
})
