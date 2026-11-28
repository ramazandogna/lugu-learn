<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseCard } from 'rei-kit'
import { AlertTriangle } from 'lucide-vue-next'
import type { StudentSummary } from '@/lib/api/admin'
import type { AttentionKind, AttentionReason } from '../lib/insights'
import EmptyState from './/AdminEmpty.vue'

const MAX_GROUPS = 5
const MAX_NAMES = 3

const props = defineProps<{ items: readonly { student: StudentSummary; reasons: AttentionReason[] }[] }>()
const all = ref(false)

/** Same reason -> one row with a count and the students' names; biggest group first. */
const groups = computed(() => {
  const map = new Map<AttentionKind, { kind: AttentionKind; label: string; students: StudentSummary[] }>()
  for (const item of props.items)
    for (const r of item.reasons) {
      const g = map.get(r.kind) ?? { kind: r.kind, label: r.label, students: [] }
      g.students.push(item.student)
      map.set(r.kind, g)
    }
  return [...map.values()].sort((a, b) => b.students.length - a.students.length)
})
const shown = computed(() => (all.value ? groups.value : groups.value.slice(0, MAX_GROUPS)))
const expandable = computed(() => groups.value.length > MAX_GROUPS || groups.value.some((g) => g.students.length > MAX_NAMES))
</script>

<template>
  <BaseCard as="section" aria-labelledby="dash-attention">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="dash-attention" class="type-body font-semibold">Dikkat gerektirenler</h2>
        <BaseButton v-if="expandable" variant="link" :aria-expanded="all" @click="all = !all">{{ all ? 'Daha az göster' : 'Tümünü gör' }}</BaseButton>
      </div>
    </template>
    <EmptyState v-if="!groups.length" title="Şu an dikkat gerektiren bir durum görünmüyor" />
    <ul v-else class="divide-hair divide-y">
      <li v-for="g in shown" :key="g.kind" class="py-3">
        <p class="type-body flex items-center gap-2 font-semibold">
          <AlertTriangle :size="16" class="text-warning-ink shrink-0" aria-hidden="true" />
          {{ g.label }} ({{ g.students.length }})
        </p>
        <p class="type-small text-ink-soft mt-1">
          <template v-for="(s, i) in all ? g.students : g.students.slice(0, MAX_NAMES)" :key="s.id">
            <template v-if="i">, </template>
            <RouterLink :to="{ name: 'admin-student', params: { studentId: s.id } }" class="focus-ring rounded-cell text-ink hover:underline">{{ s.name }}</RouterLink>
          </template>
          <template v-if="!all && g.students.length > MAX_NAMES"> +{{ g.students.length - MAX_NAMES }}</template>
        </p>
      </li>
    </ul>
  </BaseCard>
</template>
