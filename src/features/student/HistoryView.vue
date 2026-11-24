<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { BaseBadge, BaseButton, SkeletonList } from 'rei-kit'
import { Clock } from 'lucide-vue-next'

import { EmptyScene, JarProgress } from '@/design'
import { friendlyMessage, getHistory } from '@/lib/api/student'

import { duration, historyRows, STATUS_TEXT, type HistoryRow } from './history'
import { dayOf, weekStart } from './progress'

const rows = shallowRef<HistoryRow[] | null>(null)
const completedCount = ref(0)
const error = ref<string | null>(null)

async function load() {
  error.value = null
  try {
    const h = await getHistory()
    rows.value = historyRows(h.sessions, h.breaks)
    completedCount.value = new Set(h.completions.map((c) => c.lesson_id)).size
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
onMounted(load)

const fmtDate = (d: string) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
/** Rows under "Bu hafta", "Geçen hafta" or "Daha önce": the learner's own timeline, nothing else. */
const groups = computed(() => {
  const thisWeek = weekStart(dayOf(new Date()))
  const lastWeek = weekStart(dayOf(new Date(Date.now() - 7 * 86_400_000)))
  const out = [
    { key: 'this', title: 'Bu hafta', rows: [] as HistoryRow[] },
    { key: 'last', title: 'Geçen hafta', rows: [] as HistoryRow[] },
    { key: 'older', title: 'Daha önce', rows: [] as HistoryRow[] },
  ]
  for (const r of rows.value ?? []) {
    const w = weekStart(dayOf(r.started_at))
    out[w === thisWeek ? 0 : w === lastWeek ? 1 : 2]!.rows.push(r)
  }
  return out.filter((g) => g.rows.length)
})
/** The longest session sets the 100% of the minute gauge, so rows compare with each other. */
const longest = computed(() => Math.max(60, ...(rows.value ?? []).map((r) => r.active_seconds)))
const gauge = (r: HistoryRow) => `${Math.max(6, Math.round((r.active_seconds / longest.value) * 100))}%`
const total = computed(() => (rows.value ?? []).reduce((s, r) => s + r.active_seconds, 0))
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
    <header>
      <p class="type-eyebrow text-ink-soft">Öğrenme geçmişim</p>
      <h1 class="type-title text-ink">Yaptıkların</h1>
    </header>

    <EmptyScene v-if="error" tone="danger" title="Geçmişin açılamadı" :description="error">
      <BaseButton @click="load">Tekrar dene</BaseButton>
    </EmptyScene>
    <SkeletonList v-else-if="!rows" :rows="5" />
    <EmptyScene v-else-if="!rows.length" title="Henüz bir ders yapmadın" description="İlk dersine başladığında burada görünecek.">
      <BaseButton as="router-link" to="/">Derse başla</BaseButton>
    </EmptyScene>
    <template v-else>
      <dl class="grid grid-cols-2 gap-3">
        <div class="surface rounded-card animate-rise flex flex-col gap-1 p-4">
          <dt class="type-eyebrow text-ink-soft">Tamamlanan ders</dt>
          <dd class="type-display text-ink">{{ completedCount }}</dd>
        </div>
        <div class="surface rounded-card animate-rise flex flex-col gap-1 p-4" style="animation-delay: 60ms">
          <dt class="type-eyebrow text-ink-soft">Toplam çalışma</dt>
          <dd class="type-display text-ink">{{ duration(total) }}</dd>
        </div>
      </dl>
      <section v-for="g in groups" :key="g.key" :aria-labelledby="`g-${g.key}`" class="flex flex-col gap-3">
        <h2 :id="`g-${g.key}`" class="type-section text-ink">{{ g.title }}</h2>
        <ul class="flex flex-col gap-3">
          <li
            v-for="(r, i) in g.rows"
            :key="r.id"
            class="surface rounded-card animate-rise flex items-center gap-4 p-4"
            :style="{ animationDelay: `${Math.min(i, 8) * 60}ms` }"
          >
            <JarProgress :value="r.status === 'completed' ? 1 : 0" :max="1" :label="r.status === 'completed' ? 'Ders kavanozu dolu' : 'Ders kavanozu henüz dolmadı'" />
            <div class="flex min-w-0 flex-1 flex-col gap-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="type-task text-ink">{{ r.title }}</p>
                <div class="flex gap-2">
                  <BaseBadge v-if="r.kind === 'replay'">Tekrar</BaseBadge>
                  <BaseBadge :tone="r.status === 'completed' ? 'success' : 'neutral'">{{ STATUS_TEXT[r.status] }}</BaseBadge>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Clock :size="16" class="text-ink-soft shrink-0" aria-hidden="true" />
                <span class="bg-muted border-hair h-2 flex-1 overflow-hidden rounded-full border" aria-hidden="true">
                  <span class="bg-primary-fill block h-full rounded-full" :style="{ width: gauge(r) }" />
                </span>
                <span class="type-small text-ink shrink-0 font-bold tabular-nums">{{ duration(r.active_seconds) }}</span>
              </div>
              <p class="text-ink-soft type-small">
                {{ fmtDate(r.started_at) }}
                <template v-if="r.breaks.length"> · {{ r.breaks.length }} mola ({{ duration(r.break_seconds) }})</template>
              </p>
              <BaseButton
                v-if="r.status === 'active'"
                as="router-link"
                :to="r.kind === 'replay' ? `/ders/${r.lesson_id}/tekrar` : `/ders/${r.lesson_id}`"
                class="self-start"
              >
                Kaldığın yerden devam et
              </BaseButton>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
