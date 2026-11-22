import type { RolePrompt } from './common.ts'

/** Stage `admin_material`. */
export const visualAssetPlanner: RolePrompt = {
  role: 'visual-asset-planner',
  version: 1,
  purpose: 'Describe the character and per-scene illustrations the lesson needs.',
  instructions: `Role: Visual Asset Planner → visualPlan.
- character: the lesson's main character.
- scenes: one entry per story scene (sceneId = the scene id) with a one-sentence illustration brief: setting, characters present, action, mood. Consistent character looks; age 10–16; no text in the image; no brands or real people.`,
}
