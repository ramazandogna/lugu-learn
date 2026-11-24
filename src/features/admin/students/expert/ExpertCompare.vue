<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp, Minus } from 'lucide-vue-next'
import { BaseDatePicker, BaseSelect, EmptyState } from 'rei-kit'
import type { StatMeta, StatsInput } from '@/domain/stats'
import { periodWindows, type Range } from '@/domain/stats/windows'
import { buildParams, formatDelta, formatStat, rangeParams, safeRun, verdict, type Controls } from './stat-format'

const { input, now, controls, nthDefault, metas } = defineProps<{
  input: StatsInput
  now: string
  controls: Controls
  nthDefault: number
  metas: readonly StatMeta[]
}>()

type Kind = 'day' | 'week' | 'month' | 'custom'
const kind = ref<Kind>('week')
const a = ref({ from: '', to: '' })
const b = ref({ from: '', to: '' })
const KINDS = [
  { value: 'week' as const, label: 'Bu hafta ve geçen hafta' },
  { value: 'month' as const, label: 'Bu ay ve geçen ay' },
  { value: 'day' as const, label: 'Bugün ve dün' },
  { value: 'custom' as const, label: 'İki özel aralık' },
]

const pair = computed<{ cur: Range; prev: Range; curLabel: string; prevLabel: string } | null>(() => {
  if (kind.value === 'custom') {
    if (!a.value.from || !a.value.to || !b.value.from || !b.value.to) return null
    return { cur: { ...a.value }, prev: { ...b.value }, curLabel: 'Dönem A', prevLabel: 'Dönem B' }
  }
  const w = periodWindows(kind.value, now)
  if (!w) return null
  const L: [string, string] = kind.value === "day" ? ["Bugün", "Dün"] : kind.value === "week" ? ["Bu hafta", "Geçen hafta"] : ["Bu ay", "Geçen ay"]
  return { cur: w.cur, prev: w.prev, curLabel: L[0], prevLabel: L[1] }
})

const base = computed(() => buildParams({ ...controls, window: 'all' }, now, nthDefault))
const eligible = computed(() => metas.filter((m) => m.group !== 'period' && !m.needs.includes('statId')))

const rows = computed(() => {
  const p = pair.value
  if (!p) return []
  return eligible.value.map((meta) => {
    const cur = safeRun(meta.id, input, rangeParams(base.value, p.cur))
    const prev = safeRun(meta.id, input, rangeParams(base.value, p.prev))
    const delta = cur.value !== null && prev.value !== null ? cur.value - prev.value : null
    return { meta, cur, prev, delta, tone: delta === null ? 'flat' : verdict(delta, meta.direction) }
  })
})
const TONE_CLASS = { good: 'text-positive', bad: 'text-negative', flat: 'text-ink-soft' } as const
const TONE_WORD = { good: 'iyi yönde', bad: 'kötü yönde', flat: 'değişim yok' } as const
const metric = computed(() => controls.metric)
const range = (r: Range) => `${r.from} – ${r.to}`
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="border-hair bg-surface rounded-card grid gap-3 border p-4 sm:grid-cols-2">
      <BaseSelect :model-value="kind" label="Kıyas türü" :options="KINDS" @update:model-value="(v) => v && (kind = v)" />
      <p v-if="pair && kind !== 'custom'" class="text-ink-soft type-small self-end">{{ pair.curLabel }}: {{ range(pair.cur) }} · {{ pair.prevLabel }}: {{ range(pair.prev) }}</p>
      <template v-if="kind === 'custom'">
        <BaseDatePicker previous-label="Önceki ay" next-label="Sonraki ay" :model-value="a.from || undefined" label="Dönem A başlangıç" @update:model-value="(v) => (a = { ...a, from: v ?? '' })" />
        <BaseDatePicker previous-label="Önceki ay" next-label="Sonraki ay" :model-value="a.to || undefined" label="Dönem A bitiş" @update:model-value="(v) => (a = { ...a, to: v ?? '' })" />
        <BaseDatePicker previous-label="Önceki ay" next-label="Sonraki ay" :model-value="b.from || undefined" label="Dönem B başlangıç" @update:model-value="(v) => (b = { ...b, from: v ?? '' })" />
        <BaseDatePicker previous-label="Önceki ay" next-label="Sonraki ay" :model-value="b.to || undefined" label="Dönem B bitiş" @update:model-value="(v) => (b = { ...b, to: v ?? '' })" />
      </template>
    </div>

    <EmptyState v-if="!pair" title="İki aralığı da seç" description="Dört tarihi de girince göstergeler yan yana gelir." />
    <EmptyState v-else-if="!rows.length" title="Bu süzgeçle gösterge yok" description="Grubu veya aramayı değiştir." />
    <div v-else class="border-hair bg-surface rounded-card overflow-x-auto border">
      <table class="w-full type-small">
        <caption class="sr-only">İki dönemin göstergeleri</caption>
        <thead class="text-ink-soft text-start">
          <tr>
            <th scope="col" class="px-3 py-2 text-start font-semibold">Gösterge</th>
            <th scope="col" class="px-3 py-2 text-end font-semibold">{{ pair.curLabel }}</th>
            <th scope="col" class="px-3 py-2 text-end font-semibold">{{ pair.prevLabel }}</th>
            <th scope="col" class="px-3 py-2 text-end font-semibold">Fark</th>
          </tr>
        </thead>
        <tbody class="divide-hair divide-y">
          <tr v-for="r in rows" :key="r.meta.id" class="hover:bg-muted min-h-11">
            <th scope="row" class="px-3 py-2 text-start font-normal" :title="r.meta.hint">{{ r.meta.name }}</th>
            <td class="px-3 py-2 text-end tabular-nums">{{ formatStat(r.cur.value, r.meta.unit, metric) }}</td>
            <td class="px-3 py-2 text-end tabular-nums">{{ formatStat(r.prev.value, r.meta.unit, metric) }}</td>
            <td class="px-3 py-2 text-end tabular-nums" :class="TONE_CLASS[r.tone]">
              <template v-if="r.delta !== null">
                <span class="inline-flex items-center gap-1">
                  <ArrowUp v-if="r.delta > 0" :size="14" aria-hidden="true" />
                  <ArrowDown v-else-if="r.delta < 0" :size="14" aria-hidden="true" />
                  <Minus v-else :size="14" aria-hidden="true" />
                  {{ formatDelta(r.delta, r.meta.unit, metric) }}
                  <span class="sr-only">, {{ TONE_WORD[r.tone] }}</span>
                </span>
              </template>
              <span v-else class="text-ink-soft">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
