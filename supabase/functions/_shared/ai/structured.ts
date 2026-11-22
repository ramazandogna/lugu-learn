import type { z } from 'zod'
import { toStructuredSchema } from './json-schema.ts'
import type { ContextBlock, Effort, ModelClient, UsageMeter } from './model.ts'

/** A stage that could not produce valid output. The job fails with this message. */
export class StageError extends Error {
  constructor(
    readonly stage: string,
    message: string,
    readonly details: string[] = [],
  ) {
    super(`${stage}: ${message}`)
    this.name = 'StageError'
  }
}

export interface StructuredCall<T> {
  stage: string
  system: string
  context: ContextBlock[]
  instruction: string
  schema: z.ZodType<T>
  maxTokens: number
  effort: Effort
  /**
   * Extra checks after zod parsing (e.g. evidence keys exist). Returned
   * messages are treated like validation errors: fed back once for repair.
   */
  validate?: (value: T) => string[]
}

/** Pulls the JSON object out of a response (tolerates code fences when structured output is off). */
export function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
  const body = fenced?.[1] ?? trimmed
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end < start) throw new SyntaxError('no JSON object in response')
  return JSON.parse(body.slice(start, end + 1))
}

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.slice(0, 40).map((i) => `${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`)
}

type Attempt<T> = { ok: true; value: T } | { ok: false; errors: string[]; raw: string }

/**
 * Calls the model for one stage and returns output validated by `schema`.
 *
 * Contract: on invalid JSON, schema errors or `validate` errors, exactly one
 * repair request is sent with the previous output and the error list; if that
 * also fails, a {@link StageError} is thrown. A refusal or a truncated
 * response (`max_tokens`) fails the stage immediately — repeating the same
 * request would not help.
 */
export async function callStructured<T>(client: ModelClient, call: StructuredCall<T>, usage: UsageMeter): Promise<T> {
  const jsonSchema = toStructuredSchema(call.schema)

  const attempt = async (instruction: string, stage: string): Promise<Attempt<T>> => {
    const res = await client.generate({
      stage,
      system: call.system,
      context: call.context,
      instruction,
      jsonSchema,
      maxTokens: call.maxTokens,
      effort: call.effort,
    })
    usage.add(res.usage)
    if (res.stopReason === 'refusal') throw new StageError(call.stage, 'the model declined this request')
    if (res.stopReason === 'max_tokens') throw new StageError(call.stage, `output truncated at ${call.maxTokens} tokens`)
    let json: unknown
    try {
      json = extractJson(res.text)
    } catch (e) {
      return { ok: false, errors: [`invalid JSON: ${(e as Error).message}`], raw: res.text }
    }
    const parsed = call.schema.safeParse(json)
    if (!parsed.success) return { ok: false, errors: formatZodIssues(parsed.error), raw: res.text }
    const extra = call.validate?.(parsed.data) ?? []
    if (extra.length) return { ok: false, errors: extra, raw: res.text }
    return { ok: true, value: parsed.data }
  }

  const first = await attempt(call.instruction, call.stage)
  if (first.ok) return first.value

  const repair = [
    call.instruction,
    '',
    'Your previous answer to this task failed validation. Return the complete corrected JSON object, not a diff.',
    '<previous_output>',
    first.raw.slice(0, 200_000),
    '</previous_output>',
    '<validation_errors>',
    ...first.errors.map((e) => `- ${e}`),
    '</validation_errors>',
  ].join('\n')
  const second = await attempt(repair, `${call.stage}:repair`)
  if (second.ok) return second.value
  throw new StageError(call.stage, 'output failed validation after one repair attempt', second.errors)
}
