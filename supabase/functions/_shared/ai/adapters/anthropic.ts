/**
 * Production {@link ModelClient} over the official Anthropic TypeScript SDK.
 * Deno only (imported by the edge entry files, never by the tested core).
 *
 * - Streaming (`messages.stream().finalMessage()`) so large `max_tokens`
 *   never hit HTTP timeouts.
 * - Structured output via `output_config.format` (JSON Schema); zod validates
 *   again in the core. Forced `tool_choice` is not used: Claude Opus 5.5
 *   rejects it.
 * - Adaptive thinking is always on for Opus 5.5; depth is set with `effort`.
 * - Prompt caching: a breakpoint after the shared context blocks, so every
 *   stage of a job (and every continuation within the cache TTL) reuses it.
 * - Server-side refusal fallback (`fallbacks: "default"`), opt-out with
 *   `LUGU_AI_FALLBACKS=off`.
 */
import Anthropic from '@anthropic-ai/sdk'
import { DEFAULT_MODEL, ModelError, type ModelClient, type ModelRequest, type ModelResponse, type StopReason } from '../model.ts'

export interface AnthropicClientOptions {
  apiKey: string
  model?: string
  /** `false` disables `output_config.format` (prompt + zod validation only). */
  structuredOutput?: boolean
  fallbacks?: boolean
}

type Block = Anthropic.Beta.BetaContentBlockParam

function toBlocks(req: ModelRequest): Block[] {
  const blocks: Block[] = req.context.map((b): Block => {
    if (b.type === 'text') return { type: 'text', text: b.text }
    if (b.type === 'document')
      return { type: 'document', title: b.title, source: { type: 'base64', media_type: b.mediaType, data: b.base64 } }
    return { type: 'image', source: { type: 'base64', media_type: b.mediaType, data: b.base64 } }
  })
  const last = blocks.at(-1)
  if (last && (last.type === 'text' || last.type === 'document' || last.type === 'image')) last.cache_control = { type: 'ephemeral' }
  blocks.push({ type: 'text', text: req.instruction })
  return blocks
}

const STOP: Record<string, StopReason> = {
  end_turn: 'end_turn',
  max_tokens: 'max_tokens',
  refusal: 'refusal',
  stop_sequence: 'stop_sequence',
  tool_use: 'tool_use',
  pause_turn: 'pause_turn',
}

export function anthropicModelClient(opts: AnthropicClientOptions): ModelClient {
  // maxRetries: the SDK retries 408/409/429/5xx and connection errors with backoff.
  const client = new Anthropic({ apiKey: opts.apiKey, maxRetries: 3 })
  const model = opts.model || DEFAULT_MODEL
  const structured = opts.structuredOutput !== false
  const fallbacks = opts.fallbacks !== false

  return {
    model,
    async generate(req: ModelRequest): Promise<ModelResponse> {
      try {
        const stream = client.beta.messages.stream({
          model,
          max_tokens: req.maxTokens,
          system: [{ type: 'text', text: req.system }],
          messages: [{ role: 'user', content: toBlocks(req) }],
          thinking: { type: 'adaptive' },
          output_config: {
            effort: req.effort,
            ...(structured ? { format: { type: 'json_schema' as const, schema: req.jsonSchema } } : {}),
          },
          ...(fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
        })
        const msg = await stream.finalMessage()
        const text = msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
        return {
          text,
          stopReason: STOP[msg.stop_reason ?? ''] ?? 'other',
          model: msg.model,
          usage: {
            inputTokens: msg.usage.input_tokens,
            outputTokens: msg.usage.output_tokens,
            cacheReadInputTokens: msg.usage.cache_read_input_tokens ?? 0,
            cacheCreationInputTokens: msg.usage.cache_creation_input_tokens ?? 0,
          },
        }
      } catch (e) {
        if (e instanceof Anthropic.BadRequestError) throw new ModelError(`bad request: ${e.message}`, false, 400)
        if (e instanceof Anthropic.AuthenticationError) throw new ModelError('invalid ANTHROPIC_API_KEY', false, 401)
        if (e instanceof Anthropic.PermissionDeniedError) throw new ModelError(`permission denied: ${e.message}`, false, 403)
        if (e instanceof Anthropic.RateLimitError) throw new ModelError('rate limited; retry the job later', true, 429)
        if (e instanceof Anthropic.APIError) throw new ModelError(`API error ${e.status ?? ''}: ${e.message}`, true, e.status)
        throw new ModelError(`model call failed: ${(e as Error).message}`, true)
      }
    },
  }
}
