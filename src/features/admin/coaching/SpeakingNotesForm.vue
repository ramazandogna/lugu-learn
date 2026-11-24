<script setup lang="ts">
import { reactive, watch } from 'vue'
import { BaseButton, BaseCard, BaseTextarea } from 'rei-kit'
import { saveSpeakingNote, type SpeakingNote } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const { sessionId, note } = defineProps<{ sessionId: string; note: SpeakingNote | null }>()
const emit = defineEmits<{ saved: [] }>()
const form = reactive({ observations: '', strengths: '', goals: '', follow_up: '' })
const { busy, run } = useAction()

watch(
  () => note,
  (n) => Object.assign(form, { observations: n?.observations ?? '', strengths: n?.strengths ?? '', goals: n?.goals ?? '', follow_up: n?.follow_up ?? '' }),
  { immediate: true },
)

const t = (s: string) => s.trim() || null
async function save() {
  const ok = await run(
    () =>
      saveSpeakingNote(sessionId, note?.id ?? null, {
        observations: t(form.observations),
        strengths: t(form.strengths),
        goals: t(form.goals),
        follow_up: t(form.follow_up),
      }),
    'Notlar kaydedildi',
  )
  if (ok) emit('saved')
}
</script>

<template>
  <BaseCard as="section" aria-labelledby="sp-notes">
    <template #head>
      <h2 id="sp-notes" class="type-body font-semibold">Öğretmen notları</h2>
      <p class="text-ink-soft type-small">Bu notlar öğrenme profilinde öğretmen gözlemi olarak kullanılır.</p>
    </template>
    <form class="grid gap-4 md:grid-cols-2" @submit.prevent="save">
      <BaseTextarea v-model="form.observations" label="Gözlemler" :rows="4" />
      <BaseTextarea v-model="form.strengths" label="Güçlü yönler" :rows="4" />
      <BaseTextarea v-model="form.goals" label="Hedefler" :rows="3" />
      <BaseTextarea v-model="form.follow_up" label="Takip" hint="Bir sonraki oturumda neye bakılacak" :rows="3" />
      <BaseButton class="w-fit" type="submit" :loading="busy">Notları kaydet</BaseButton>
    </form>
  </BaseCard>
</template>
