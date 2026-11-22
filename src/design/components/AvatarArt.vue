<script setup lang="ts">
import { computed, useId } from 'vue'

import { AVATARS, avatarShapes, type AvatarKey } from '../avatars'

const {
  avatar,
  size = 48,
  label,
} = defineProps<{
  avatar: AvatarKey
  size?: number | string
  /** Accessible name. Defaults to decoration when left out (a name usually sits beside it). */
  label?: string
}>()

const clip = `lugu-avatar-${useId()}`
const def = computed(() => AVATARS[avatar])
const shapes = computed(() => avatarShapes(def.value))
const box = computed(() => (typeof size === 'number' ? `${size}px` : size))
</script>

<template>
  <svg
    viewBox="0 0 64 64"
    :width="box"
    :height="box"
    class="shrink-0 overflow-visible"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <defs>
      <clipPath :id="clip"><circle cx="32" cy="32" r="32" /></clipPath>
    </defs>
    <circle cx="32" cy="32" r="32" :fill="def.bg" />
    <g :clip-path="`url(#${clip})`">
      <path
        v-for="(s, i) in shapes.shoulders"
        :key="`s${i}`"
        :d="s.d"
        :fill="s.fill"
        :stroke="s.stroke"
        :stroke-width="s.strokeWidth"
      />
    </g>
    <path
      v-for="(s, i) in shapes.head"
      :key="`h${i}`"
      :d="s.d"
      :fill="s.fill"
      :stroke="s.stroke"
      :stroke-width="s.strokeWidth"
      :opacity="s.opacity"
    />
  </svg>
</template>
