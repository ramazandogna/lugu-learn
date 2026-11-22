# Visual Asset Planner

> Source: `supabase/functions/_shared/ai/prompts/visual-asset-planner.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Describe the character and per-scene illustrations the lesson needs.

| | |
| --- | --- |
| Step | `admin_material` |
| Inputs | Shared context, plan, final package. |
| Output | `VisualPlan`. |
| Validation | Every `sceneId` is a story scene id. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Visual Asset Planner → visualPlan.
- character: the lesson's main character.
- scenes: one entry per story scene (sceneId = the scene id) with a one-sentence illustration brief: setting, characters present, action, mood. Consistent character looks; age 10–16; no text in the image; no brands or real people.
```
