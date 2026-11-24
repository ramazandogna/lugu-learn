<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseSwitch, BaseTimeline } from 'rei-kit'
import { listAssignments, type LearningData } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import { buildTimeline } from '../../lib/timeline'
import { useLoad } from '../../lib/use-load'
import EmptyState from '../../components/AdminEmpty.vue'

const { studentId, data } = defineProps<{ studentId: string; data: LearningData }>()

const program = useLoad(() => listAssignments(studentId))
const minor = ref(false)

const items = computed(() => {
  const assignments = program.data.value ?? []
  const lessonTitles = new Map<string, string>()
  for (const a of assignments) for (const l of a.lessons) lessonTitles.set(l.id, `${l.sequence}. ${l.title}`)
  data.lessons.forEach((l, id) => lessonTitles.has(id) || lessonTitles.set(id, l.title))
  return buildTimeline(
    {
      sessions: data.sessions,
      completions: data.completions,
      assessments: data.assessments,
      breaks: data.breaks,
      events: data.events,
      programEvents: assignments.flatMap((a) => a.events),
      lessonTitle: (id) => (id ? (lessonTitles.get(id) ?? 'Ders') : '—'),
    },
    { includeMinorEvents: minor.value },
  )
})
</script>

<template>
  <LoadState :loading="program.loading.value" :error="program.error.value" @retry="program.reload">
    <div class="flex flex-col gap-4">
      <BaseSwitch v-model="minor" label="Sekmeye dönüş ve hareketsizlik bitişi olaylarını da göster" />
      <EmptyState v-if="!items.length" title="Henüz kayıtlı etkinlik yok" />
      <BaseTimeline v-else :events="items" label="Öğrencinin etkinlik zaman çizelgesi">
        <template #default="{ event }">
          <p class="type-small font-semibold">{{ event.title }}</p>
          <p v-if="event.description" class="text-ink-soft type-small">{{ event.description }}</p>
        </template>
      </BaseTimeline>
    </div>
  </LoadState>
</template>
