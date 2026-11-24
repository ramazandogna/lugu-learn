<script setup lang="ts">
import { computed } from 'vue'
import { BaseDatePicker, BaseSelect, NumberInput } from 'rei-kit'
import type { StatsInput } from '@/domain/stats'
import { WINDOW_OPTIONS, type Controls } from './stat-format'

const c = defineModel<Controls>({ required: true })
const { input } = defineProps<{ input: StatsInput }>()

const subjectOptions = computed(() => [
  { value: '', label: 'Tüm dersler (toplam)' },
  ...[...input.subjects]
    .sort((a, b) => Number(b.active) - Number(a.active) || a.sort - b.sort)
    .map((s) => ({ value: s.id, label: s.active ? s.name : `${s.name} (pasif)` })),
])
const lessonOptions = computed(() => [
  { value: '', label: 'Tüm müfredat dersleri' },
  ...[...input.lessons].sort((a, b) => a.sequence - b.sequence).map((l) => ({ value: l.id, label: `Ders ${l.sequence} · ${l.title}` })),
])
const METRICS = [
  { value: 'pct' as const, label: 'Yüzde' },
  { value: 'net' as const, label: 'Net' },
]

const set = <K extends keyof Controls>(k: K, v: Controls[K]) => (c.value = { ...c.value, [k]: v })
</script>

<template>
  <div class="border-hair bg-surface rounded-card grid gap-3 border p-4 sm:grid-cols-2 xl:grid-cols-4" role="group" aria-label="Analiz süzgeçleri">
    <BaseSelect :model-value="c.window" label="Pencere" :options="WINDOW_OPTIONS" @update:model-value="(v) => v && set('window', v)" />
    <BaseSelect :model-value="c.subjectId" label="Okul dersi" :options="subjectOptions" @update:model-value="(v) => set('subjectId', v ?? '')" />
    <BaseSelect :model-value="c.lessonId" label="Müfredat dersi" :options="lessonOptions" @update:model-value="(v) => set('lessonId', v ?? '')" />
    <BaseSelect :model-value="c.metric" label="Deneme ölçüsü" :options="METRICS" @update:model-value="(v) => v && set('metric', v)" />

    <template v-if="c.window === 'range'">
      <BaseDatePicker previous-label="Önceki ay" next-label="Sonraki ay" :model-value="c.from || undefined" label="Başlangıç" @update:model-value="(v) => set('from', v ?? '')" />
      <BaseDatePicker previous-label="Önceki ay" next-label="Sonraki ay" :model-value="c.to || undefined" label="Bitiş" @update:model-value="(v) => set('to', v ?? '')" />
    </template>
    <NumberInput v-if="c.window === 'lastN'" :model-value="c.n" label="N (deneme sayısı)" :min="1" :max="100" decrement-label="Azalt" increment-label="Artır" @update:model-value="(v) => set('n', v ?? 5)" />
    <NumberInput
      :model-value="c.nth ?? undefined"
      label="N. deneme (boş = son)"
      :min="1"
      :max="500"
      decrement-label="Azalt"
      increment-label="Artır"
      @update:model-value="(v) => set('nth', v ?? null)"
    />
  </div>
</template>
