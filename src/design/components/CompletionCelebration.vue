<script setup lang="ts">
import type { CharacterKey } from '@/domain/content'

import { characterThemeStyle } from '../characters'
import LuguMascot from './LuguMascot.vue'
import ProgressStars from './ProgressStars.vue'
import StarBurst from './StarBurst.vue'
import TinyCat from './TinyCat.vue'
import XpBadge from './XpBadge.vue'

/*
 * The end of a lesson (or a section worth marking). One burst, once; the
 * heading is announced as a status so a screen-reader user hears the news
 * without having focus yanked. Actions go in the slot — usually "Haritaya
 * dön" and "Dersi tekrar et".
 */
const {
  title,
  message,
  character = 'sasha',
  stars,
  starsLabel = '',
  xp,
  xpLabel,
  animated = true,
} = defineProps<{
  title: string
  message?: string
  character?: CharacterKey
  /** Earned stars out of 3, if this lesson awards them. */
  stars?: number
  /** Accessible text for the stars, e.g. "3 yıldızdan 2 yıldız". */
  starsLabel?: string
  /** XP gained in this lesson, shown as a total badge. */
  xp?: number
  xpLabel?: string
  animated?: boolean
}>()
</script>

<template>
  <section
    class="surface rounded-shell relative flex flex-col items-center overflow-hidden px-6 pt-4 pb-6 text-center sm:px-12"
    :data-character="character"
    :style="characterThemeStyle(character)"
  >
    <div class="relative grid place-items-center">
      <StarBurst class="col-start-1 row-start-1" :size="260" :animated="animated" />
      <LuguMascot class="col-start-1 row-start-1" :character="character" expression="celebrating" :size="150" :animated="animated" />
    </div>
    <div role="status" class="-mt-4">
      <h2 class="type-hero text-ink">{{ title }}</h2>
      <p v-if="message" class="text-ink-soft mx-auto mt-2 max-w-[42ch] type-body">{{ message }}</p>
    </div>
    <div v-if="stars !== undefined || xp !== undefined" class="mt-4 flex flex-wrap items-center justify-center gap-3">
      <ProgressStars v-if="stars !== undefined" :value="stars" :label="starsLabel" size="lg" />
      <XpBadge v-if="xp !== undefined" :xp="xp" :label="xpLabel" />
    </div>
    <div v-if="$slots.default" class="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
      <slot />
    </div>
    <TinyCat class="absolute bottom-2 left-3" pose="sit" :size="36" fur="var(--color-primary)" />
  </section>
</template>
