<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { BaseButton, BaseCard, BaseTextarea, EmptyState } from 'rei-kit'
import { LearningProfileInterpretation, ObservedFacts } from '@/domain/insights'
import { latestJob, learningProfile, saveTeacherObservations, startInsight } from '@/lib/api/admin'
import { features } from '@/lib/features'
import AiButton from '../../components/AiButton.vue'
import JobProgress from '../../components/JobProgress.vue'
import LoadState from '../../components/LoadState.vue'
import { formatDateTime } from '../../lib/format'
import { useAction, useJobPoll, useLoad } from '../../lib/use-load'
import EvidenceStatements from './EvidenceStatements.vue'
import ObservedFactsTable from './ObservedFactsTable.vue'

const { studentId } = defineProps<{ studentId: string }>()

const state = useLoad(async () => {
  const [profile, job] = await Promise.all([learningProfile(studentId), latestJob({ kind: 'learning_profile', studentId })])
  return { profile, job }
})
const poll = useJobPoll(() => void state.reload())
const teacher = ref('')
const { busy, run } = useAction()

watch(
  () => state.data.value,
  (d) => {
    teacher.value = d?.profile?.teacher_observations ?? ''
    if (d?.job && (d.job.status === 'queued' || d.job.status === 'running') && !poll.job.value) poll.track(d.job.id)
  },
)

const observed = computed(() => {
  const r = ObservedFacts.safeParse(state.data.value?.profile?.observed as unknown)
  return r.success ? r.data : null
})
const interpretation = computed(() => {
  const raw: unknown = state.data.value?.profile?.ai_interpretation
  if (!raw) return null
  const r = LearningProfileInterpretation.safeParse(raw)
  return r.success ? r.data : 'invalid'
})
const shownJob = computed(() => poll.job.value ?? state.data.value?.job ?? null)

async function regenerate() {
  if (!features.ai) return
  await run(async () => {
    const { jobId } = await startInsight({ action: 'learning_profile', studentId })
    poll.track(jobId)
  }, 'Öğrenme profili yeniden oluşturuluyor')
}

async function saveTeacher() {
  await run(() => saveTeacherObservations(studentId, teacher.value), 'Öğretmen gözlemi kaydedildi')
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-ink-soft type-small">
          Gözlenen veriler kodla hesaplanır; AI yorumu bu verilere dayanan varsayımlardır; öğretmen gözlemi yalnızca sizin yazdığınızdır.
          <template v-if="state.data.value?.profile?.generated_at"> Son oluşturma: {{ formatDateTime(state.data.value.profile.generated_at) }}.</template>
        </p>
        <AiButton variant="secondary" :loading="busy" :disabled="shownJob?.status === 'running' || shownJob?.status === 'queued'" @click="regenerate">
          <RefreshCw class="size-4" aria-hidden="true" /> Yeniden oluştur
        </AiButton>
      </div>
      <JobProgress v-if="shownJob && shownJob.status !== 'succeeded'" :job="shownJob" :poll-error="poll.error.value" />

      <BaseCard as="section" aria-labelledby="ins-observed">
        <template #head>
          <h2 id="ins-observed" class="type-body font-semibold">1 · Gözlenen veriler</h2>
          <p class="text-ink-soft type-small">Kayıtlardan hesaplanan, doğrulanabilir sayılar.</p>
        </template>
        <EmptyState v-if="!observed" title="Henüz hesaplanmış veri yok" description="“Yeniden oluştur” ile ilk profili oluşturun." />
        <ObservedFactsTable v-else :facts="observed.facts" :window="observed.window" />
      </BaseCard>

      <BaseCard as="section" aria-labelledby="ins-ai">
        <template #head>
          <h2 id="ins-ai" class="type-body font-semibold">2 · AI yorumu</h2>
          <p class="text-ink-soft type-small">Varsayım olarak okuyun; her cümlenin dayandığı veri yanında gösterilir.</p>
        </template>
        <EmptyState v-if="!interpretation" title="AI yorumu yok" />
        <p v-else-if="interpretation === 'invalid'" class="text-ink-soft type-small">Kayıtlı yorum beklenen biçimde değil; yeniden oluşturun.</p>
        <div v-else class="flex flex-col gap-4">
          <p>{{ interpretation.summary }}</p>
          <EvidenceStatements :statements="interpretation.statements" :facts="observed?.facts ?? []" />
          <div v-if="interpretation.openQuestions.length">
            <h3 class="type-small font-semibold">Verinin henüz yanıtlayamadığı sorular</h3>
            <ul class="text-ink-soft list-disc ps-6 type-small">
              <li v-for="q in interpretation.openQuestions" :key="q">{{ q }}</li>
            </ul>
          </div>
        </div>
      </BaseCard>

      <BaseCard as="section" aria-labelledby="ins-teacher">
        <template #head>
          <h2 id="ins-teacher" class="type-body font-semibold">3 · Öğretmen gözlemi</h2>
          <p class="text-ink-soft type-small">Yapay zekâ bu metni okur ama asla değiştirmez.</p>
        </template>
        <form class="flex flex-col gap-3" @submit.prevent="saveTeacher">
          <BaseTextarea v-model="teacher" label="Gözlemleriniz" label-hidden :rows="5" />
          <BaseButton class="w-fit" type="submit" :loading="busy">Kaydet</BaseButton>
        </form>
      </BaseCard>
    </div>
  </LoadState>
</template>
