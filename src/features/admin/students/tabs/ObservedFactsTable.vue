<script setup lang="ts">
import { computed } from 'vue'
import { BaseTable } from 'rei-kit'
import type { ObservedFact } from '@/domain/insights'
import { formatDate, formatDuration, formatNumber } from '../../lib/format'

const { facts, window } = defineProps<{ facts: readonly ObservedFact[]; window: { from: string | null; to: string } }>()

function factValue(f: ObservedFact): string {
  if (typeof f.value === 'boolean') return f.value ? 'Evet' : 'Hayır'
  if (typeof f.value === 'string') return f.value
  switch (f.unit) {
    case 'percent':
      return `%${formatNumber(f.value, 0)}`
    case 'ratio':
      return `%${formatNumber(f.value * 100, 0)}`
    case 'ms':
      return `${formatNumber(f.value / 1000, 1)} sn`
    case 'seconds':
      return formatDuration(f.value)
    default:
      return formatNumber(f.value)
  }
}

const rows = computed(() =>
  facts.map((f) => ({
    key: f.key,
    label: f.label + (f.detail ? ` (${f.detail})` : ''),
    value: factValue(f),
    sample: f.sampleSize < 10 ? `${f.sampleSize} · küçük örneklem` : String(f.sampleSize),
    source: f.source,
  })),
)
</script>

<template>
  <BaseTable
    :caption="`Gözlenen veriler, ${window.from ? formatDate(window.from) : 'başlangıç'} – ${formatDate(window.to)}`"
    row-key="key"
    :rows="rows"
    :columns="[
      { key: 'label', label: 'Veri' },
      { key: 'value', label: 'Değer', align: 'end' },
      { key: 'sample', label: 'Kayıt sayısı', align: 'end' },
      { key: 'source', label: 'Kaynak' },
    ]"
  />
</template>
