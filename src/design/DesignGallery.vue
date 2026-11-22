<script setup lang="ts">
import { computed, ref } from 'vue'
import { SegmentedControl, useTheme } from 'rei-kit'

import { CHARACTER_KEYS, type CharacterKey } from '@/domain/content'

import { CHARACTERS, characterThemeStyle } from './characters'
import GalleryBrand from './gallery/GalleryBrand.vue'
import GalleryCharacters from './gallery/GalleryCharacters.vue'
import GalleryLearning from './gallery/GalleryLearning.vue'
import GalleryMoments from './gallery/GalleryMoments.vue'
import GalleryShells from './gallery/GalleryShells.vue'

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
const mode = useTheme()
const modes = [
  { value: 'light' as const, label: 'Gündüz' },
  { value: 'dark' as const, label: 'Gece' },
  { value: 'system' as const, label: 'Sistem' },
]

const scope = computed(() => {
  if (theme.value === 'brand') return {}
  if (theme.value === 'admin') return { 'data-area': 'admin' }
  return { 'data-character': theme.value, style: characterThemeStyle(theme.value) }
})
</script>

<template>
  <div class="canvas text-ink min-h-dvh" v-bind="scope">
    <header class="border-hair sticky top-0 z-40 border-b bg-[color-mix(in_oklab,var(--color-canvas)_92%,transparent)] backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <h1 class="type-section me-auto">Lugu tasarım sistemi</h1>
        <SegmentedControl v-model="theme" :options="options" aria-label="Tema" />
        <SegmentedControl v-model="mode" :options="modes" aria-label="Görünüm" />
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 pb-24">
      <GalleryBrand />
      <GalleryCharacters />
      <GalleryLearning />
      <GalleryMoments />
      <GalleryShells />
    </main>
  </div>
</template>
