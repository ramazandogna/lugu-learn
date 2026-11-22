// Edge entry: lesson content pipeline. All logic lives in _shared/ai (see docs/ai-workflow.md).
import { handleAiGenerate } from '../_shared/ai/handler.ts'
import { generateDeps } from '../_shared/ai/adapters/edge.ts'

const deps = generateDeps((name) => Deno.env.get(name))

Deno.serve((req) => handleAiGenerate(req, deps))
