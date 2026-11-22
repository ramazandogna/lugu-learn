import type { InsightsRequest } from '@/domain/insights'
import type { AccountStatus } from '../../database.types'
import { supabase } from '../../supabase'
import { AdminApiError } from './errors'

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body })
  if (error) {
    const ctx: unknown = (error as { context?: unknown }).context
    let code = 'network'
    if (ctx instanceof Response) {
      const parsed: unknown = await ctx
        .clone()
        .json()
        .catch(() => null)
      const reported = parsed && typeof parsed === 'object' ? (parsed as { error?: unknown }).error : undefined
      code = typeof reported === 'string' ? reported : ctx.status === 401 ? 'unauthorized' : ctx.status === 403 ? 'forbidden' : 'unknown'
    }
    throw new AdminApiError(code)
  }
  if (data === null) throw new AdminApiError('unknown')
  return data
}

export interface CreatedStudent {
  student_id: string
  student_code: string
  password: string
}

export interface NewStudentInput {
  first_name?: string
  last_name?: string
  display_name?: string
  grade?: number
}

export const createStudent = (input: NewStudentInput) => invoke<CreatedStudent>('admin-students', { action: 'create', ...input })

export const resetStudentPassword = (studentId: string) =>
  invoke<{ student_id: string; password: string }>('admin-students', { action: 'reset-password', student_id: studentId })

export const setStudentStatus = (studentId: string, status: AccountStatus) =>
  invoke<{ student_id: string; status: AccountStatus }>('admin-students', { action: 'set-status', student_id: studentId, status })

export const startLessonGeneration = (lessonId: string, instructions?: string) =>
  invoke<{ jobId: string }>('ai-generate', { lessonId, ...(instructions ? { instructions } : {}), includeClassWeakItems: true })

export const resumeLessonGeneration = (jobId: string) => invoke<{ jobId: string }>('ai-generate', { action: 'resume', jobId })

export const startInsight = (request: InsightsRequest) => invoke<{ jobId: string }>('ai-insights', request)

export const processDeletion = (requestId: string, confirmStudentCode: string) =>
  invoke<{ status: string }>('process-deletion', { request_id: requestId, confirm_student_code: confirmStudentCode })
