import { z } from 'zod'

/**
 * Keywords structured outputs do not accept (claude-api skill, "JSON Schema
 * Limitations"). They are removed from the schema sent to the API; zod still
 * enforces every one of them on the response.
 */
const UNSUPPORTED = new Set([
  '$schema',
  'minLength',
  'maxLength',
  'pattern',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minItems',
  'maxItems',
  'uniqueItems',
  'format',
  'default',
])

function sanitise(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(sanitise)
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    if (UNSUPPORTED.has(key)) continue
    if (key === 'oneOf') out.anyOf = sanitise(value)
    else if (key === 'properties' || key === '$defs' || key === 'definitions') {
      // Property names are data here, not keywords: keep every one.
      const props: Record<string, unknown> = {}
      for (const [name, sub] of Object.entries(value as Record<string, unknown>)) props[name] = sanitise(sub)
      out[key] = props
    } else out[key] = sanitise(value)
  }
  if (out.type === 'object' || out.properties) out.additionalProperties = false
  return out
}

/**
 * Converts a zod schema into a JSON Schema accepted by `output_config.format`.
 * Uses the *input* shape so fields with zod defaults may be omitted by the
 * model; repeated sub-schemas become `$defs` references to keep the grammar small.
 */
export function toStructuredSchema(schema: z.ZodType): Record<string, unknown> {
  const raw = z.toJSONSchema(schema, { io: 'input', reused: 'ref', unrepresentable: 'any' })
  return sanitise(raw) as Record<string, unknown>
}
