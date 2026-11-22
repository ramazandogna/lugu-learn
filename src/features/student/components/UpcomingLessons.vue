<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { Lock } from 'lucide-vue-next'

import { getLearningMap } from '@/lib/api/student'

import { upcoming } from '../map'

/* The next few lessons after the current one. Quietly absent if the map cannot load. */
const { assignmentId } = defineProps<{ assignmentId: string }>()
const lessons = shallowRef<ReturnType<typeof upcoming>>([])

onMounted(async () => {
  try {
    lessons.value = upcoming(await getLearningMap(assignmentId))
  } catch {
    lessons.value = []
  }
})
</script>

<template>
  <section v-if="lessons.length" aria-labelledby="upcoming-title" class="flex flex-col gap-3">
    <h2 id="upcoming-title" class="type-section text-ink">Sıradaki dersler</h2>
    <ol class="grid gap-3 sm:grid-cols-3">
      <li v-for="l in lessons" :key="l.id" class="surface rounded-card flex flex-col gap-1 p-4">
        <span class="type-eyebrow text-ink-soft flex items-center gap-1"><Lock :size="14" aria-hidden="true" /> Ders {{ l.sequence }} · kilitli</span>
        <span class="type-task text-ink">{{ l.title }}</span>
        <span v-if="l.tagline" class="text-ink-soft text-sm">{{ l.tagline }}</span>
      </li>
    </ol>
  </section>
</template>
