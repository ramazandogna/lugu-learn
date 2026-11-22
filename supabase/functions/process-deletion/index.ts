/**
 * process-deletion: POST { request_id, confirm_student_code } (admin only).
 * Approves a `requested` deletion request (or takes an `approved` one), deletes the student's Auth
 * user — every lugu row about the student cascades from it — and records the outcome. The request
 * row has no FK to the student so it survives as the record that the deletion happened.
 */
import { z } from 'zod'
import { audit, requireAdmin } from '../_shared/auth.ts'
import { json, preflight } from '../_shared/cors.ts'

const Body = z.object({ request_id: z.uuid(), confirm_student_code: z.string().trim().min(1) })

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  if (req.method !== 'POST') return json(req, 405, { error: 'method_not_allowed' })
  const auth = await requireAdmin(req)
  if (auth instanceof Response) return auth
  const { adminId, service } = auth

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json(req, 400, { error: 'invalid_body' })
  const { request_id, confirm_student_code } = parsed.data

  const { data: request } = await service.from('data_deletion_requests').select('*').eq('id', request_id).maybeSingle()
  if (!request) return json(req, 404, { error: 'request_not_found' })
  if (request.status !== 'requested' && request.status !== 'approved') return json(req, 409, { error: 'request_not_open' })

  const [{ data: profile }, { data: sp }] = await Promise.all([
    service.from('profiles').select('role').eq('user_id', request.student_id).maybeSingle(),
    service.from('student_profiles').select('student_code').eq('user_id', request.student_id).maybeSingle(),
  ])
  // Only student accounts are deleted through this path, never an admin.
  if (!profile || profile.role !== 'student' || !sp) return json(req, 404, { error: 'student_not_found' })
  if (sp.student_code.toUpperCase() !== confirm_student_code.toUpperCase())
    return json(req, 400, { error: 'confirmation_mismatch' })

  const now = new Date().toISOString()
  await service
    .from('data_deletion_requests')
    .update({ status: 'approved', approved_by: adminId, approved_at: request.approved_at ?? now, student_code: sp.student_code })
    .eq('id', request_id)

  const { error } = await service.auth.admin.deleteUser(request.student_id)
  if (error) {
    await service.from('data_deletion_requests').update({ status: 'failed', error: error.message }).eq('id', request_id)
    await audit(service, adminId, 'student_deletion_failed', 'data_deletion_requests', request_id, { student_code: sp.student_code })
    return json(req, 500, { error: 'delete_failed' })
  }
  await service
    .from('data_deletion_requests')
    .update({ status: 'completed', processed_at: new Date().toISOString(), error: null })
    .eq('id', request_id)
  await audit(service, adminId, 'student_deleted', 'data_deletion_requests', request_id, { student_code: sp.student_code })
  return json(req, 200, { request_id, status: 'completed' })
})
