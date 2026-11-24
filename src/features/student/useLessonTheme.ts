import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { isUnitThemeId, type UnitThemeId } from '@/design/unitThemes'
import { getLessonContent } from '@/lib/api/student'

/*
 * The unit theme of one lesson (`meta.themeId` of its package), for screens
 * that wear the unit before the lesson is opened: the home hero. Read once per
 * lesson and kept for the tab's life; any failure quietly means `base`.
 */
const cache = new Map<string, UnitThemeId>()

export function useLessonTheme(lessonId: MaybeRefOrGetter<string | null | undefined>) {
  const theme = ref<UnitThemeId>('base')
  watch(
    () => toValue(lessonId),
    async (id) => {
      if (!id) {
        theme.value = 'base'
        return
      }
      const known = cache.get(id)
      if (known) {
        theme.value = known
        return
      }
      try {
        const content = await getLessonContent(id)
        const meta = (content.content as { meta?: { themeId?: unknown } } | null)?.meta
        const found = isUnitThemeId(meta?.themeId) ? meta.themeId : 'base'
        cache.set(id, found)
        if (toValue(lessonId) === id) theme.value = found
      } catch {
        theme.value = 'base'
      }
    },
    { immediate: true },
  )
  return theme
}
