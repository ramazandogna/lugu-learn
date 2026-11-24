<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp, Info, Minus } from 'lucide-vue-next'
import type { StatMeta, StatParams, StatResult } from '@/domain/stats'
import Sparkline from './Sparkline.vue'
import { emptyText, formatDelta, formatStat, verdict } from './stat-format'

const { meta, result, prev, params, labelOf } = defineProps<{
  meta: StatMeta
  result: StatResult
  /** Same stat on the period before the selected window; null when there is none. */
  prev: StatResult | null
  params: StatParams
  labelOf: (key: string) => string
}>()

const showHint = ref(false)
const metric = computed(() => params.metric ?? 'pct')
const hasValue = computed(() => result.value !== null)

/** Period-group stats already are a difference; others compare against the previous window. */
const delta = computed<number | null>(() => {
  if (result.value === null) return null
  if (meta.group === 'period') return result.value
  if (prev?.value === null || prev === null) return null
  return result.value - prev.value
})
const tone = computed(() => (delta.value === null ? 'flat' : verdict(delta.value, meta.direction)))
const TONE_CLASS = { good: 'text-positive', bad: 'text-negative', flat: 'text-ink-soft' } as const
const TONE_WORD = { good: 'iyi yönde', bad: 'kötü yönde', flat: 'değişim yok' } as const

const spark = computed(() => (result.series ?? []).map((p) => p.y))
const rows = computed(() => (result.breakdown ?? []).filter((b) => b.value !== null).slice(0, 4))
const DIRECTION_TEXT = { higher_better: 'Yüksek iyi', lower_better: 'Düşük iyi', neutral: 'Yön yok' } as const
</script>

<template>
  <article class="border-hair bg-surface rounded-card flex flex-col gap-2 border p-4" :aria-label="meta.name">
    <header class="flex items-start justify-between gap-2">
      <h3 class="type-small text-ink-soft font-semibold">{{ meta.name }}</h3>
      <button
        type="button"
        class="focus-ring text-ink-soft hover:bg-muted rounded-cell -me-2 -mt-2 inline-flex size-10 shrink-0 items-center justify-center"
        :aria-expanded="showHint"
        :aria-label="`${meta.name}: yorum ipucu`"
        :title="meta.hint"
        @click="showHint = !showHint"
      >
        <Info :size="16" aria-hidden="true" />
      </button>
    </header>

    <div v-if="hasValue" class="flex items-end justify-between gap-3">
      <p class="type-title tabular-nums font-semibold">{{ formatStat(result.value, meta.unit, metric) }}</p>
      <Sparkline :points="spark" :label="`${meta.name} eğilimi`" />
    </div>
    <p v-else class="text-ink-soft type-small">{{ emptyText(meta, result, params) }}</p>

    <p v-if="delta !== null" class="type-small flex items-center gap-1 tabular-nums" :class="TONE_CLASS[tone]">
      <ArrowUp v-if="delta > 0" :size="16" aria-hidden="true" />
      <ArrowDown v-else-if="delta < 0" :size="16" aria-hidden="true" />
      <Minus v-else :size="16" aria-hidden="true" />
      <span>{{ formatDelta(delta, meta.unit, metric) }}</span>
      <span class="sr-only">, {{ TONE_WORD[tone] }}</span>
      <span v-if="meta.group !== 'period'" class="text-ink-soft">önceki döneme göre</span>
    </p>

    <ul v-if="hasValue && rows.length" class="text-ink-soft type-small flex flex-col gap-0.5">
      <li v-for="r in rows" :key="r.key" class="flex justify-between gap-2">
        <span class="truncate">{{ r.label ?? labelOf(r.key) }}</span>
        <span class="tabular-nums">{{ formatStat(r.value, meta.unit, metric) }}</span>
      </li>
    </ul>

    <footer class="text-ink-soft type-small flex items-center justify-between gap-2">
      <span>{{ DIRECTION_TEXT[meta.direction] }}</span>
      <span v-if="result.n">{{ result.n }} kayıt</span>
    </footer>
    <p v-if="showHint" class="bg-muted rounded-tile type-small p-2">{{ meta.hint }}</p>
  </article>
</template>
