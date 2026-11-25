<script setup lang="ts">
/* Wrapper-candy paper fringe: one end of the twist. Decoration only. */
defineProps<{ side: 'start' | 'end' }>()
</script>

<template>
  <svg class="candy-twist" :data-side="side" viewBox="0 0 28 40" aria-hidden="true" focusable="false">
    <path d="M28 20 L6 3 Q0 9 4 20 Q0 31 6 37 Z" fill="currentColor" />
    <path d="M26 20 L9 9 M26 20 L7 20 M26 20 L9 31" stroke="var(--color-surface)" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.45" />
  </svg>
</template>

<style scoped>
.candy-twist {
  position: absolute;
  top: 50%;
  height: 62%;
  width: auto;
  color: var(--color-accent);
  pointer-events: none;
  translate: 0 -50%;
}
.candy-twist[data-side='start'] {
  inset-inline-end: 100%;
  margin-inline-end: -6px;
  transform-origin: 100% 50%;
  rotate: var(--twist-rot, 0deg);
}
.candy-twist[data-side='end'] {
  inset-inline-start: 100%;
  margin-inline-start: -6px;
  transform-origin: 0% 50%;
  scale: -1 1;
  rotate: calc(var(--twist-rot, 0deg) * -1);
}
</style>
