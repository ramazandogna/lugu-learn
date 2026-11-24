<script setup lang="ts">
import { computed, ref } from 'vue'
import { SegmentedControl, useTheme } from 'rei-kit'

import { CHARACTER_KEYS, type CharacterKey } from '@/domain/content'

import { CHARACTERS, characterThemeStyle } from './characters'
import GalleryBrand from './gallery/GalleryBrand.vue'
import GalleryCharacters from './gallery/GalleryCharacters.vue'
import GalleryLearning from './gallery/GalleryLearning.vue'
import GalleryMoments from './gallery/GalleryMoments.vue'
import GalleryPlay from './gallery/GalleryPlay.vue'
import GalleryShells from './gallery/GalleryShells.vue'
import { UNIT_THEME_IDS, UNIT_THEMES, unitThemeAttrs, type UnitThemeId } from './unitThemes'

/*
 * Dev-only: every Lugu design component and state on one page, for visual
 * review (mounted at /dev/design in development builds). The switches at the
 * top re-theme the whole page — brand, a character, or the admin area — and
 * flip day/night, so each component is seen in every theme it will meet.
 */
type Theme = 'brand' | 'admin' | CharacterKey
const theme = ref<Theme>('brand')
const options = [
  { value: 'brand' as Theme, label: 'Marka' },
  ...CHARACTER_KEYS.map((k) => ({ value: k as Theme, label: CHARACTERS[k].name })),
  { value: 'admin' as Theme, label: 'Yönetim' },
]
const unit = ref<UnitThemeId>('base')
const unitOptions = UNIT_THEME_IDS.map((v) => ({ value: v, label: UNIT_THEMES[v].name }))
const mode = useTheme()
const modes = [
  { value: 'light' as const, label: 'Gündüz' },
  { value: 'dark' as const, label: 'Gece' },
  { value: 'system' as const, label: 'Sistem' },
]

const scope = computed(() => {
  if (theme.value === 'admin') return { 'data-area': 'admin' }
  if (theme.value === 'brand') return unitThemeAttrs(unit.value)
  return { 'data-character': theme.value, style: characterThemeStyle(theme.value) }
})
</script>

<template>
  <div class="canvas text-ink min-h-dvh" v-bind="scope">
    <header class="border-hair sticky top-0 z-(--z-popover) border-b bg-(--glass) backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <h1 class="type-section me-auto">Lugu tasarım sistemi</h1>
        <div class="no-scrollbar max-w-full overflow-x-auto"><SegmentedControl v-model="theme" :options="options" aria-label="Tema" /></div>
        <SegmentedControl v-if="theme === 'brand'" v-model="unit" :options="unitOptions" aria-label="Ünite teması" />
        <SegmentedControl v-model="mode" :options="modes" aria-label="Görünüm" />
      </div>
    </header>
    <main class="mx-auto max-w-6xl min-w-0 overflow-x-clip px-4 pb-24">
      <GalleryBrand />
      <GalleryCharacters />
      <GalleryLearning />
      <GalleryMoments />
      <GalleryPlay />
      <GalleryShells />
    </main>
  </div>
</template>
