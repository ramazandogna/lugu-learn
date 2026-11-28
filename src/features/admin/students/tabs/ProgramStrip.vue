<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { AssignmentDetail } from '@/lib/api/admin'

/* One chip per open program ("Ad 3/10"), the selected one highlighted; scrolls sideways with a fade at the edges. */
const { items, selected } = defineProps<{ items: AssignmentDetail[]; selected: string | undefined }>()
const emit = defineEmits<{ select: [id: string]; assign: [] }>()

const progress = (d: AssignmentDetail) => {
  const lessons = d.lessons.filter((l) => l.status !== 'archived')
  return `${lessons.filter((l) => d.completedLessonIds.has(l.id)).length}/${lessons.length}`
}
const chip = 'focus-ring rounded-control border-hair inline-flex min-h-10 shrink-0 items-center gap-1 border px-3 type-small'
</script>

<template>
  <div class="relative">
    <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pe-6 pb-1" role="list" aria-label="Programlar">
      <button
        v-for="d in items"
        :key="d.assignment.id"
        type="button"
        role="listitem"
        :class="[chip, d.assignment.id === selected ? 'bg-primary text-surface border-primary font-semibold' : 'bg-surface text-ink']"
        :aria-pressed="d.assignment.id === selected"
        @click="emit('select', d.assignment.id)"
      >
        {{ d.curriculumName }} {{ progress(d) }}
      </button>
      <button type="button" role="listitem" :class="[chip, 'bg-surface text-primary font-semibold']" @click="emit('assign')">
        <Plus :size="16" aria-hidden="true" /> Program ata
      </button>
    </div>
    <span class="from-surface pointer-events-none absolute inset-y-0 end-0 w-6 bg-gradient-to-l to-transparent" aria-hidden="true" />
  </div>
</template>
