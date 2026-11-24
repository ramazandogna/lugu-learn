/*
 * Feature flags: the one place that reads them. AI is off until the owner turns
 * it on (VITE_AI_ENABLED=true); every AI trigger asks here and shows "Yakında"
 * while it is off.
 */
export const features = {
  ai: import.meta.env.VITE_AI_ENABLED === 'true',
} as const

export const AI_ENABLED = features.ai
