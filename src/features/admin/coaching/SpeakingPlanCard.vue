<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { BaseButton, BaseCard, EmptyState } from 'rei-kit'
import { SpeakingPlanDraft } from '@/domain/insights'
import { startInsight, type AiJob, type SpeakingSession } from '@/lib/api/admin'
import JobProgress from '../components/JobProgress.vue'
import EvidenceStatements from '../students/tabs/EvidenceStatements.vue'
import { useAction, useJobPoll } from '../lib/use-load'
import SpeakingPlanBlocks from './SpeakingPlanBlocks.vue'

const { session, job } = defineProps<{ session: SpeakingSession; job: AiJob | null }>()
const emit = defineEmits<{ changed: [] }>()
const { busy, run } = useAction()
const poll = useJobPoll(() => emit('changed'))

onMounted(() => {
  if (job && (job.status === 'queued' || job.status === 'running')) poll.track(job.id)
})

const draft = computed(() => {
  if (!session.plan) return null
  const r = SpeakingPlanDraft.safeParse(session.plan as unknown)
  return r.success ? r.data : 'invalid'
})
const shown = computed(() => poll.job.value ?? job)
const running = computed(() => shown.value?.status === 'queued' || shown.value?.status === 'running')

async function generate() {
  await run(async () => {
    const { jobId } = await startInsight({ action: 'speaking_plan', studentId: session.student_id, speakingSessionId: session.id })
    poll.track(jobId)
  }, 'Konuşma planı hazırlanıyor')
}
</script>

<template>
  <BaseCard as="section" aria-labelledby="sp-plan">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sp-plan" class="text-base font-semibold">60 dakikalık plan</h2>
        <BaseButton size="sm" variant="secondary" :loading="busy" :disabled="running" @click="generate">
          <Sparkles class="size-4" aria-hidden="true" /> {{ draft ? 'AI ile yeniden oluştur' : 'AI ile plan oluştur' }}
        </BaseButton>
      </div>
    </template>
    <JobProgress v-if="shown && shown.status !== 'succeeded'" class="mb-4" :job="shown" :poll-error="poll.error.value" />
    <EmptyState v-if="!draft" title="Henüz plan yok" description="AI, öğrencinin son verilerine ve şu anki derse göre bir taslak hazırlar; siz gözden geçirirsiniz." />
    <p v-else-if="draft === 'invalid'" class="text-ink-soft text-sm">Kayıtlı plan beklenen biçimde değil; yeniden oluşturun.</p>
    <div v-else class="flex flex-col gap-4">
      <div v-if="draft.focus.length">
        <h3 class="mb-2 text-sm font-semibold">Odak noktaları (AI varsayımı)</h3>
        <EvidenceStatements :statements="draft.focus" :facts="[]" />
      </div>
      <SpeakingPlanBlocks :plan="draft.plan" />
    </div>
  </BaseCard>
</template>
