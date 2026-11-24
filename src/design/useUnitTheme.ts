import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { UNIT_THEMES, isUnitThemeId, unitThemeAttrs, type UnitThemeId } from './unitThemes'

/**
 * The unit theme for a subtree: bind `attrs` to its root (`v-bind="attrs"`) and
 * the `[data-unit]` rules in main.css repaint it. `ambient` says which ambient
 * object the theme owns (see AmbientLayer).
 */
export function useUnitTheme(themeId: MaybeRefOrGetter<string | null | undefined>) {
  const id = computed<UnitThemeId>(() => {
    const v = toValue(themeId)
    return isUnitThemeId(v) ? v : 'base'
  })
  const attrs = computed(() => unitThemeAttrs(id.value))
  const ambient = computed(() => UNIT_THEMES[id.value].ambient)
  return { id, attrs, ambient, name: computed(() => UNIT_THEMES[id.value].name) }
}
