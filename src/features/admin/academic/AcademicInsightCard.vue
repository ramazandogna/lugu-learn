<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { BaseButton, BaseCard, EmptyState } from 'rei-kit'
import { AcademicInsight, ObservedFacts } from '@/domain/insights'
import { latestJob, startInsight } from '@/lib/api/admin'
import JobProgress from '../components/JobProgress.vue'
import LoadState from '../components/LoadState.vue'
import EvidenceStatements from '../students/tabs/EvidenceStatements.vue'
import { formatDateTime } from '../lib/format'
import { useAction, useJobPoll, useLoad } from '../lib/use-load'

const { studentId, hasExams } = defineProps<{ studentId: string; hasExams: boolean }>()
const state = useLoad(() => latestJob({ kind: 'academic_insight', studentId }))
const poll = useJobPoll(() => void state.reload())
const { busy, run } = useAction()

const job = computed(() => poll.job.value ?? state.data.value ?? null)
const lastSucceeded = computed(() => (state.data.value?.status === 'succeeded' ? state.data.value : null))
/** `ai_jobs.output` = `{ result, observed, promptVersions }` (docs/ai-workflow.md §13). */
const output = computed(() => (lastSucceeded.value?.output ?? null) as { result?: unknown; observed?: unknown } | null)
const insight = computed(() => {
  const r = AcademicInsight.safeParse(output.value?.result)
  return r.success ? r.data : null
})
const facts = computed(() => {
  const r = ObservedFacts.safeParse(output.value?.observed)
  return r.success ? r.data.facts : []
})

async function generate() {
  await run(async () => {
    const { jobId } = await startInsight({ action: 'academic_insight', studentId })
    poll.track(jobId)
  }, 'Akademik gözlem hazırlanıyor')
}
</script>

<template>
  <BaseCard as="section" aria-labelledby="ac-ai">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="ac-ai" class="text-base font-semibold">AI akademik gözlem</h2>
          <p class="text-ink-soft text-sm">Taslaktır: yalnızca eğilimleri anlatır, neden iddia etmez. Öğrenciyle paylaşmadan önce gözden geçirin.</p>
        </div>
        <BaseButton
          size="sm"
          variant="secondary"
          :loading="busy"
          :disabled="!hasExams || job?.status === 'running' || job?.status === 'queued'"
          @click="generate"
        >
          <Sparkles class="size-4" aria-hidden="true" /> Oluştur
        </BaseButton>
      </div>
    </template>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <JobProgress v-if="job && job.status !== 'succeeded'" class="mb-3" :job="job" :poll-error="poll.error.value" />
      <EmptyState v-if="!insight" :title="hasExams ? 'Henüz akademik gözlem yok' : 'Gözlem için önce sınav sonucu girin'" />
      <div v-else class="flex flex-col gap-3">
        <p class="text-ink-soft text-xs">Oluşturma: {{ formatDateTime(lastSucceeded?.updated_at) }}</p>
        <p>{{ insight.summary }}</p>
        <EvidenceStatements :statements="insight.observations" :facts="facts" />
      </div>
    </LoadState>
  </BaseCard>
</template>
