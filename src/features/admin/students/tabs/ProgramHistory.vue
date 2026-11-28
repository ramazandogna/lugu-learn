<script setup lang="ts">
import type { AssignmentDetail } from '@/lib/api/admin'
import { PROGRAM_EVENT_LABEL, formatDateTime } from '../../lib/format'

/* The program's event log, newest first. */
const { detail } = defineProps<{ detail: AssignmentDetail }>()
const title = (id: string | null) => {
  const l = detail.lessons.find((x) => x.id === id)
  return l ? `${l.sequence}. ${l.title}` : '—'
}
</script>

<template>
  <ul class="divide-hair divide-y type-small" aria-label="Program geçmişi">
    <li v-for="e in detail.events" :key="e.id" class="py-2">
      <span class="font-semibold">{{ PROGRAM_EVENT_LABEL[e.kind] ?? e.kind }}</span>
      <span class="text-ink-soft"> · {{ formatDateTime(e.created_at) }}</span>
      <span v-if="e.from_lesson_id || e.to_lesson_id" class="text-ink-soft"> · {{ title(e.from_lesson_id) }} → {{ title(e.to_lesson_id) }}</span>
      <p v-if="e.note" class="text-ink-soft">Not: {{ e.note }}</p>
    </li>
    <li v-if="!detail.events.length" class="text-ink-soft py-2">Kayıtlı olay yok.</li>
  </ul>
</template>
