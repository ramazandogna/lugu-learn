// Edge entry: learner insights. All logic lives in _shared/ai (see docs/ai-workflow.md).
import { handleAiInsights } from '../_shared/ai/handler.ts'
import { insightsDeps } from '../_shared/ai/adapters/edge.ts'

const deps = insightsDeps((name) => Deno.env.get(name))

Deno.serve((req) => handleAiInsights(req, deps))
