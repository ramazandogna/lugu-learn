<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseCard } from 'rei-kit'
import { TrendingDown } from 'lucide-vue-next'
import { runStat } from '@/domain/stats'
import { examStatsInputs, type StudentSummary } from '@/lib/api/admin'
import { useLoad } from '../lib/use-load'
import LoadState from './LoadState.vue'

const { students } = defineProps<{ students: readonly StudentSummary[] }>()

const state = useLoad(examStatsInputs)
const now = new Date().toISOString()

/** Students with at least one subject in decline (rule hit >= 1), strongest first. */
const items = computed(() => {
  const byId = new Map(students.map((s) => [s.id, s] as const))
  return (state.data.value ?? [])
    .flatMap(({ studentId, input }) => {
      const student = byId.get(studentId)
      if (!student) return []
      const names = new Map(input.subjects.map((s) => [s.id, s.name] as const))
      const hit = (runStat('ex_decline_subjects', input, { now }).breakdown ?? []).filter((b) => (b.value ?? 0) >= 1)
      if (!hit.length) return []
      return [{ student, worst: Math.max(...hit.map((h) => h.value ?? 0)), subjects: hit.map((h) => names.get(h.key) ?? 'Ders') }]
    })
    .sort((a, b) => b.worst - a.worst || b.subjects.length - a.subjects.length)
    .slice(0, 8)
})
</script>

<template>
  <BaseCard as="section" aria-labelledby="dash-declines">
    <template #head>
      <h2 id="dash-declines" class="type-body flex items-center gap-2 font-semibold"><TrendingDown :size="18" class="text-negative" aria-hidden="true" /> Düşüş yaşayan öğrenciler</h2>
      <p class="text-ink-soft type-small">Son denemelerde düşüş kuralına takılan dersler. Ayrıntı öğrencinin Uzman analiz sekmesinde.</p>
    </template>
    <LoadState :loading="state.loading.value" :error="state.error.value" :empty="!items.length" empty-title="Denemelerde belirgin bir düşüş görünmüyor" :rows="2" @retry="state.reload">
      <ul class="divide-hair divide-y">
        <li v-for="i in items" :key="i.student.id" class="py-3">
          <RouterLink :to="{ name: 'admin-student', params: { studentId: i.student.id }, query: { sekme: 'uzman' } }" class="focus-ring rounded-cell font-semibold hover:underline">
            {{ i.student.name }}
          </RouterLink>
          <span class="type-small ms-2" :class="i.worst >= 2 ? 'text-negative font-semibold' : 'text-warning-ink'">{{ i.worst >= 2 ? 'Belirgin düşüş' : 'Uyarı' }}</span>
          <p class="text-ink-soft type-small">{{ i.subjects.join(', ') }}</p>
        </li>
      </ul>
    </LoadState>
  </BaseCard>
</template>
