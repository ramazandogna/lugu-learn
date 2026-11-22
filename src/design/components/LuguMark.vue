<script setup lang="ts">
/*
 * The Lugu mark: three small steps rising toward a star in the night —
 * "Küçük adımlar, büyük hayaller." Brand colours are fixed here on purpose:
 * the mark does not take a character's theme. public/favicon.svg is the same
 * drawing; change both together.
 */
const { size = 40, label } = defineProps<{
  size?: number
  /** Given, the mark is an image with this name; otherwise decoration. */
  label?: string
}>()
</script>

<template>
  <svg
    viewBox="0 0 48 48"
    :width="size"
    :height="size"
    class="shrink-0"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path d="M24 2C39 2 46 9 46 24C46 39 39 46 24 46C9 46 2 39 2 24C2 9 9 2 24 2Z" fill="#43399e" />
    <path d="M3.6 33C12 30 22 34 30 31C36 29 41 30 45.4 31.6C43.8 41 37 46 24 46C11 46 4.6 41 3.6 33Z" fill="#5a4fc0" />
    <circle cx="12" cy="36" r="2.4" fill="#fdf7ee" />
    <circle cx="18.5" cy="30.5" r="2.9" fill="#fdf7ee" />
    <circle cx="25.5" cy="25.5" r="3.4" fill="#fdf7ee" />
    <path
      d="M34.5 7.5L37 13.2L43.2 13.9L38.6 18L39.9 24.1L34.5 21L29.1 24.1L30.4 18L25.8 13.9L32 13.2Z"
      fill="#f6b92b"
      stroke="#fdf7ee"
      stroke-width="1.4"
      stroke-linejoin="round"
    />
    <circle cx="41" cy="30" r="1.2" fill="#fdf7ee" opacity="0.8" />
    <circle cx="10" cy="14" r="1" fill="#fdf7ee" opacity="0.7" />
  </svg>
</template>
