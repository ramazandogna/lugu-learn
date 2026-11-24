<script setup lang="ts">
import { computed } from 'vue'
import { BaseAlert, BaseBadge, EmptyState } from 'rei-kit'
import { QaReport } from '@/domain/content'
import { formatDateTime } from '../lib/format'

const { report } = defineProps<{ report: unknown }>()
const parsed = computed(() => {
  if (report === null || report === undefined) return null
  const r = QaReport.safeParse(report)
  return r.success ? r.data : 'invalid'
})
const SEVERITY = { blocker: { label: 'Engelleyici', tone: 'danger' }, major: { label: 'Önemli', tone: 'warning' }, minor: { label: 'Küçük', tone: 'neutral' } } as const
const order = { blocker: 0, major: 1, minor: 2 } as const
const issues = computed(() => (parsed.value && parsed.value !== 'invalid' ? [...parsed.value.issues].sort((a, b) => order[a.severity] - order[b.severity]) : []))
</script>

<template>
  <EmptyState v-if="!parsed" title="Bu revizyon için kalite raporu yok" description="Kalite raporu AI üretiminde otomatik oluşur." />
  <p v-else-if="parsed === 'invalid'" class="text-ink-soft type-small">Kayıtlı rapor okunamadı.</p>
  <div v-else class="flex flex-col gap-3">
    <BaseAlert :tone="parsed.passed ? 'success' : 'warning'">
      <template #title>{{ parsed.passed ? 'Kalite kontrolünden geçti' : 'Çözülmemiş sorunlar var' }}</template>
      {{ issues.length }} bulgu · {{ formatDateTime(parsed.checkedAt) }}
    </BaseAlert>
    <ul class="divide-hair divide-y">
      <li v-for="(x, i) in issues" :key="i" class="flex flex-wrap items-start gap-2 py-2 type-small">
        <BaseBadge :tone="SEVERITY[x.severity].tone">{{ SEVERITY[x.severity].label }}</BaseBadge>
        <span class="text-ink-soft">{{ x.area }}</span>
        <span class="min-w-60 flex-1">{{ x.message }}</span>
      </li>
    </ul>
  </div>
</template>
