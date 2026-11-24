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
    <ol class="flex flex-wrap gap-3">
      <li v-for="l in lessons" :key="l.id" class="surface rounded-card flex flex-1 basis-56 flex-col gap-1 p-4">
        <span class="type-eyebrow text-ink-soft flex items-center gap-1"><Lock :size="16" aria-hidden="true" /> Ders {{ l.sequence }} · kilitli</span>
        <span class="type-task text-ink">{{ l.title }}</span>
        <span class="text-ink-soft type-small">{{ l.tagline || 'Önceki dersi bitirince açılır.' }}</span>
      </li>
    </ol>
  </section>
</template>
