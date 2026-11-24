/** Unit themes (design-bible B). Colour, texture and ambient only. */
export const UNIT_THEME_IDS = ['base', 'u1-morning', 'u2-night-oven', 'u3-neon-street'] as const
export type UnitThemeId = (typeof UNIT_THEME_IDS)[number]

export const UNIT_THEMES: Record<UnitThemeId, { name: string; ambient: 'piko' | 'gear' | 'steam' | 'tram' }> = {
  base: { name: 'Temel', ambient: 'piko' },
  'u1-morning': { name: 'Sabah Şekeri', ambient: 'gear' },
  'u2-night-oven': { name: 'Gece Fırını', ambient: 'steam' },
  'u3-neon-street': { name: 'Neon Şeker Sokağı', ambient: 'tram' },
}

export function isUnitThemeId(v: unknown): v is UnitThemeId {
  return typeof v === 'string' && (UNIT_THEME_IDS as readonly string[]).includes(v)
}

/** Attributes for the element that wraps a unit: `v-bind="unitThemeAttrs(id)"`. Unknown or missing = base. */
export function unitThemeAttrs(themeId?: string | null): { 'data-unit': UnitThemeId } {
  return { 'data-unit': isUnitThemeId(themeId) ? themeId : 'base' }
}
