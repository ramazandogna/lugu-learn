<script setup lang="ts">
import { computed } from 'vue'
import { BarChart, EmptyState } from 'rei-kit'
import type { StatsInput } from '@/domain/stats'
import { SECTION_LABEL } from '../../lib/format'
import ExpertStatCard from './ExpertStatCard.vue'
import { formatStat, metaOf, safeRun, type Controls } from './stat-format'
import { buildParams } from './stat-format'

const { input, now, controls } = defineProps<{ input: StatsInput; now: string; controls: Controls }>()
const emit = defineEmits<{ pick: [lessonId: string] }>()

const lesson = computed(() => input.lessons.find((l) => l.id === controls.lessonId) ?? null)
const params = computed(() => buildParams({ ...controls, window: 'all' }, now, 1))

const overview = computed(() => {
  const r = safeRun('ls_lesson_error_density', input, params.value)
  const seq = new Map(input.lessons.map((l) => [l.id, l] as const))
  return (r.breakdown ?? []).flatMap((b) => {
    const l = seq.get(b.key)
    return l ? [{ id: l.id, label: `Ders ${l.sequence} · ${l.title}`, value: b.value, n: b.n }] : []
  })
})

const curve = computed(() => safeRun('ls_lesson_curve_series', input, params.value).series ?? [])
const curveBars = computed(() =>
  curve.value.map((p, i) => ({ key: `${p.x}-${i}`, label: `Oturum ${i + 1}`, value: Math.round(p.y * 100) })),
)
const sectionBars = computed(() =>
  (safeRun('ls_section_error_density', input, params.value).breakdown ?? [])
    .filter((b) => b.value !== null)
    .map((b) => ({ key: b.key, label: SECTION_LABEL[b.key as keyof typeof SECTION_LABEL] ?? b.key, value: Math.round((b.value ?? 0) * 100) })),
)

const CARD_IDS = [
  'ls_lesson_curve_slope',
  'ls_lesson_curve_delta',
  'ls_lesson_attempts_to_target',
  'ls_lesson_assessment_curve',
  'ls_hardest_section',
  'ls_accuracy',
  'ls_first_try_accuracy',
  'ls_lesson_compare_prev5',
  'tm_active_minutes',
]
const cards = computed(() =>
  CARD_IDS.flatMap((id) => {
    const meta = metaOf(id)
    return meta ? [{ meta, result: safeRun(id, input, params.value) }] : []
  }),
)
const labelOf = (k: string) => SECTION_LABEL[k as keyof typeof SECTION_LABEL] ?? k
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="!lesson">
      <p class="text-ink-soft type-small">Gelişimini açmak için bir müfredat dersi seç. Hata yoğunluğu bu derslerde şöyle:</p>
      <EmptyState v-if="!overview.length" title="Henüz ders verisi yok" description="Öğrenci ders oynadıkça burada görünür." />
      <ul v-else class="divide-hair border-hair bg-surface rounded-card divide-y border">
        <li v-for="o in overview" :key="o.id">
          <button type="button" class="focus-ring hover:bg-muted flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2 text-start" @click="emit('pick', o.id)">
            <span class="font-semibold">{{ o.label }}</span>
            <span class="text-ink-soft type-small tabular-nums">
              {{ o.value === null ? `Yetersiz veri (${o.n} cevap)` : `Hata yoğunluğu ${formatStat(o.value, 'ratio')} · ${o.n} cevap` }}
            </span>
          </button>
        </li>
      </ul>
    </template>
    <template v-else>
      <h3 class="type-body font-semibold">Ders {{ lesson.sequence }} · {{ lesson.title }}</h3>
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="border-hair bg-surface rounded-card border p-4" aria-labelledby="curve-title">
          <h4 id="curve-title" class="type-small mb-2 font-semibold">Gelişim eğrisi (oturum başına doğruluk)</h4>
          <EmptyState v-if="!curveBars.length" title="Bu derste henüz cevap yok" />
          <BarChart v-else :series="curveBars" label="Oturum başına doğruluk yüzdesi" :value-label="(v: number) => `%${v}`" />
        </section>
        <section class="border-hair bg-surface rounded-card border p-4" aria-labelledby="dens-title">
          <h4 id="dens-title" class="type-small mb-2 font-semibold">Bölüm hata yoğunluğu</h4>
          <EmptyState v-if="!sectionBars.length" title="Bölüm verisi yok" />
          <BarChart v-else :series="sectionBars" label="Bölüm başına hata yüzdesi" :value-label="(v: number) => `%${v}`" />
        </section>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ExpertStatCard v-for="c in cards" :key="c.meta.id" :meta="c.meta" :result="c.result" :prev="null" :params="params" :label-of="labelOf" />
      </div>
    </template>
  </div>
</template>
