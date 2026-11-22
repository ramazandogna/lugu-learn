<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseBadge, EmptyState } from 'rei-kit'
import type { SpeakingSession } from '@/lib/api/admin'
import { formatDateTime, formatDuration } from '../lib/format'

const { sessions, studentName } = defineProps<{ sessions: readonly SpeakingSession[]; studentName?: (id: string) => string }>()

const STATUS: Record<SpeakingSession['status'], { label: string; tone: 'neutral' | 'primary' | 'success' | 'warning' }> = {
  planned: { label: 'Planlandı', tone: 'primary' },
  started: { label: 'Sürüyor', tone: 'warning' },
  ended: { label: 'Tamamlandı', tone: 'success' },
  cancelled: { label: 'İptal', tone: 'neutral' },
}

const sorted = computed(() => [...sessions].sort((a, b) => (b.planned_at ?? b.created_at).localeCompare(a.planned_at ?? a.created_at)))
const duration = (s: SpeakingSession) => (s.started_at && s.ended_at ? formatDuration((Date.parse(s.ended_at) - Date.parse(s.started_at)) / 1000) : null)
</script>

<template>
  <EmptyState v-if="!sorted.length" title="Konuşma oturumu yok" />
  <ul v-else class="divide-hair divide-y">
    <li v-for="s in sorted" :key="s.id" class="flex flex-wrap items-center justify-between gap-2 py-3">
      <div>
        <RouterLink :to="{ name: 'admin-speaking-session', params: { sessionId: s.id } }" class="focus-ring rounded-control font-semibold hover:underline">
          {{ studentName ? studentName(s.student_id) : formatDateTime(s.planned_at ?? s.created_at) }}
        </RouterLink>
        <p class="text-ink-soft text-sm">
          <template v-if="studentName">{{ formatDateTime(s.planned_at) }}</template>
          <template v-if="duration(s)"> · {{ duration(s) }}</template>
          <template v-if="s.plan"> · plan hazır</template>
        </p>
      </div>
      <BaseBadge :tone="STATUS[s.status].tone">{{ STATUS[s.status].label }}</BaseBadge>
    </li>
  </ul>
</template>
