<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { BaseButton, BaseTextarea } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import { resumeLessonGeneration, startLessonGeneration, type AiJob } from '@/lib/api/admin'
import JobProgress from '../components/JobProgress.vue'
import { useAction, useJobPoll } from '../lib/use-load'

const { lessonId, job } = defineProps<{ lessonId: string; job: AiJob | null }>()
const emit = defineEmits<{ finished: [packageId: string | null] }>()
const instructions = ref('')
const { busy, run } = useAction()
const poll = useJobPoll((j) => {
  const out = j.output as { packageId?: unknown } | null
  emit('finished', j.status === 'succeeded' && typeof out?.packageId === 'string' ? out.packageId : null)
})

onMounted(() => {
  if (job && (job.status === 'queued' || job.status === 'running')) poll.track(job.id)
})
const shown = computed(() => poll.job.value ?? job)
const running = computed(() => shown.value?.status === 'queued' || shown.value?.status === 'running')

async function start() {
  await run(async () => {
    const { jobId } = await startLessonGeneration(lessonId, instructions.value.trim() || undefined)
    poll.track(jobId)
  }, 'AI içerik üretimi başladı; birkaç dakika sürebilir')
}
async function resume() {
  const id = shown.value?.id
  if (id) await run(async () => poll.track((await resumeLessonGeneration(id)).jobId), 'Üretim kaldığı yerden sürüyor')
}
</script>

<template>
  <section class="surface rounded-card flex flex-col gap-3 p-4" aria-labelledby="gen-title">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 id="gen-title" class="text-base font-semibold">AI ile oluştur</h2>
        <p class="text-ink-soft text-sm">Müfredat kaynakları ve ders notlarından yeni bir “AI taslağı” revizyonu üretilir. Yayına çıkmadan önce sizin onayınız gerekir.</p>
      </div>
      <BaseButton :loading="busy" :disabled="running" @click="start"><Sparkles class="size-4" aria-hidden="true" /> AI ile oluştur</BaseButton>
    </div>
    <BaseDisclosure title="Ek yönergeler (isteğe bağlı)" :heading-level="3">
      <BaseTextarea v-model="instructions" label="Yönergeler" label-hidden placeholder="ör. Hikâyede okul kantini geçsin; kelimeleri günlük rutinlerden seçin." :rows="3" />
    </BaseDisclosure>
    <JobProgress v-if="shown && (running || shown.status === 'failed')" :job="shown" :poll-error="poll.error.value" stepped @resume="resume" />
  </section>
</template>
