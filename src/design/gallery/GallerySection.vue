<script setup lang="ts">
const { title, note } = defineProps<{ title: string; note?: string }>()
</script>

<template>
  <section class="border-hair border-t py-12">
    <h2 class="type-title text-ink">{{ title }}</h2>
    <p v-if="note" class="text-ink-soft mt-1 max-w-(--measure-reading) type-small">{{ note }}</p>
    <div class="mt-6">
      <slot />
    </div>
  </section>
</template>
