<script setup lang="ts">
/*
 * Admin page title: left-aligned, wraps on a phone (title above, actions
 * below), one h1 per page. rei-kit's PageHeader is a centred mobile app bar
 * and does not fit a dense admin screen.
 */
const { title, as: tag = 'h1' } = defineProps<{ title: string; as?: 'h1' | 'h2' }>()
</script>

<template>
  <header class="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <component :is="tag" class="text-ink type-title min-w-0 flex-1 basis-48 font-semibold break-words">
      <slot name="title">{{ title }}</slot>
    </component>
    <div v-if="$slots.right" class="flex shrink-0 flex-wrap items-center gap-2"><slot name="right" /></div>
  </header>
</template>
