<script setup lang="ts">
import { computed } from 'vue'
import { TrendingDown } from 'lucide-vue-next'
import type { StatsInput } from '@/domain/stats'
import { safeRun } from './stat-format'

const { input, now, metric } = defineProps<{ input: StatsInput; now: string; metric: 'pct' | 'net' }>()
const emit = defineEmits<{ pickSubject: [id: string]; openLessons: [] }>()

const names = computed(() => new Map(input.subjects.map((s) => [s.id, s.name] as const)))

/** Subjects with at least one decline rule hit, strongest first (the stat already sorts). */
const subjects = computed(() => {
  const r = safeRun('ex_decline_subjects', input, { now, metric })
  return (r.breakdown ?? [])
    .filter((b) => (b.value ?? 0) >= 1)
    .map((b) => ({ id: b.key, name: names.value.get(b.key) ?? 'Ders', severity: b.value ?? 0, magnitude: b.extra ?? null }))
})
const lessonSev = computed(() => safeRun('ls_lesson_decline_flag', input, { now }).value ?? 0)
const fmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 })
</script>

<template>
  <section class="border-hair bg-surface rounded-card flex flex-col gap-2 border p-4" aria-labelledby="decline-title">
    <h2 id="decline-title" class="type-body flex items-center gap-2 font-semibold">
      <TrendingDown :size="18" class="text-negative" aria-hidden="true" /> Düşüş uyarıları
    </h2>
    <p v-if="!subjects.length && lessonSev < 1" class="text-ink-soft type-small">Son denemelerde ve derslerde belirgin bir düşüş görünmüyor.</p>
    <ul v-else class="flex flex-wrap gap-2">
      <li v-for="s in subjects" :key="s.id">
        <button
          type="button"
          class="focus-ring rounded-control border-hair bg-muted hover:bg-wash flex min-h-10 items-center gap-2 border px-3 type-small"
          :aria-label="`${s.name}: ${s.severity >= 2 ? 'belirgin düşüş' : 'uyarı'}. Bu derse göre süz.`"
          @click="emit('pickSubject', s.id)"
        >
          <span class="font-semibold">{{ s.name }}</span>
          <span :class="s.severity >= 2 ? 'text-negative font-semibold' : 'text-warning-ink'">{{ s.severity >= 2 ? 'Belirgin düşüş' : 'Uyarı' }}</span>
          <span v-if="s.magnitude !== null" class="text-ink-soft tabular-nums">−{{ fmt.format(s.magnitude) }}{{ metric === 'pct' ? ' puan' : ' net' }}</span>
        </button>
      </li>
      <li v-if="lessonSev >= 1">
        <button
          type="button"
          class="focus-ring rounded-control border-hair bg-muted hover:bg-wash flex min-h-10 items-center gap-2 border px-3 type-small"
          aria-label="Müfredat derslerinde düşüş. Ders gelişimini aç."
          @click="emit('openLessons')"
        >
          <span class="font-semibold">Müfredat dersleri</span>
          <span :class="lessonSev >= 2 ? 'text-negative font-semibold' : 'text-warning-ink'">{{ lessonSev >= 2 ? 'Belirgin düşüş' : 'Uyarı' }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>
