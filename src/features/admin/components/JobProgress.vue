<script setup lang="ts">
import { computed } from 'vue'
import { BaseAlert, BaseButton, ProgressBar } from 'rei-kit'
import type { AiJob } from '@/lib/api/admin'
import { stageInfo } from '../lib/package-edit'
import { formatDateTime } from '../lib/format'

const { job, pollError = null, stepped = false } = defineProps<{
  job: AiJob
  pollError?: string | null
  /** Multi-step lesson jobs show a stage bar; single-call insight jobs a sentence. */
  stepped?: boolean
}>()
const emit = defineEmits<{ resume: [] }>()

const info = computed(() => stageInfo(job.stage))
/** A lesson job that has not moved for 10 minutes may be resumed (docs/ai-workflow.md §8). */
const resumable = computed(
  () => stepped && job.status === 'running' && (info.value.stalled || Date.now() - Date.parse(job.updated_at) > 10 * 60_000),
)
</script>

<template>
  <BaseAlert v-if="job.status === 'failed'" tone="danger">
    <template #title>Yapay zekâ işi başarısız oldu</template>
    {{ job.error ?? 'Ayrıntı yok.' }}
  </BaseAlert>
  <BaseAlert v-else-if="job.status === 'succeeded'" tone="success">
    <template #title>Yapay zekâ işi tamamlandı</template>
    {{ formatDateTime(job.updated_at) }}
  </BaseAlert>
  <div v-else class="surface rounded-card p-4" role="status">
    <p class="type-small font-semibold">{{ stepped ? info.label : 'Yapay zekâ çalışıyor…' }}</p>
    <ProgressBar v-if="stepped" class="mt-2" :value="info.step" :max="info.total" :label="`Aşama ${info.step}/${info.total}`" />
    <p class="text-ink-soft mt-2 type-small">Son güncelleme {{ formatDateTime(job.updated_at) }}. Sayfa açık kaldıkça durum otomatik yenilenir.</p>
    <p v-if="pollError" class="text-ink-soft mt-1 type-small">{{ pollError }}</p>
    <BaseButton v-if="resumable" class="mt-3" size="sm" variant="secondary" @click="emit('resume')">Kaldığı yerden sürdür</BaseButton>
  </div>
</template>
