/**
 * The model boundary. The pipeline talks to Claude only through {@link ModelClient},
 * so the core is runtime-agnostic and unit-testable with a fake client. The
 * production implementation (Anthropic SDK, Deno only) is
 * `adapters/anthropic.ts`.
 */

/** Recommended default (claude-api skill). Override with `LUGU_AI_MODEL`. */
export const DEFAULT_MODEL = 'claude-opus-5-5'

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

/** The subset of Messages API content blocks the pipeline sends. */
export type ContextBlock =
  | { type: 'text'; text: string }
  | { type: 'document'; title: string; mediaType: 'application/pdf'; base64: string }
  | { type: 'image'; mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'; base64: string }

/**
 * One structured request. The adapter renders it as:
 * `system` (shared, stable) → user message [`context` blocks, cache breakpoint
 * on the last one] → user text `instruction`. Keeping per-stage text after the
 * shared context lets every stage of one job reuse the cached curriculum prefix.
 */
export interface ModelRequest {
  /** Pipeline stage, for logs and test fakes. */
  stage: string
  system: string
  context: ContextBlock[]
  instruction: string
  /** JSON Schema for structured output (`output_config.format`), already sanitised. */
  jsonSchema: Record<string, unknown>
  maxTokens: number
  effort: Effort
}

export interface ModelUsage {
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens: number
  cacheCreationInputTokens: number
}

export type StopReason = 'end_turn' | 'max_tokens' | 'refusal' | 'stop_sequence' | 'tool_use' | 'pause_turn' | 'other'

export interface ModelResponse {
  /** Concatenated text blocks (thinking blocks are ignored). */
  text: string
  stopReason: StopReason
  model: string
  usage: ModelUsage
}

/** Thrown by adapters for API failures; `retryable` drives the job error message only. */
export class ModelError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ModelError'
  }
}

export interface ModelClient {
  readonly model: string
  generate(request: ModelRequest): Promise<ModelResponse>
}

/** Accumulates token usage across every call of one job. */
export class UsageMeter {
  inputTokens = 0
  outputTokens = 0
  cacheReadInputTokens = 0
  cacheCreationInputTokens = 0
  calls = 0

  add(u: ModelUsage): void {
    this.calls += 1
    this.inputTokens += u.inputTokens
    this.outputTokens += u.outputTokens
    this.cacheReadInputTokens += u.cacheReadInputTokens
    this.cacheCreationInputTokens += u.cacheCreationInputTokens
  }

  /** Input tokens as stored in `ai_jobs.input_tokens` (uncached + cache reads + cache writes). */
  get totalInputTokens(): number {
    return this.inputTokens + this.cacheReadInputTokens + this.cacheCreationInputTokens
  }
}
