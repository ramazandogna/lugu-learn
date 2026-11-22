<script setup lang="ts">
import { reactive } from 'vue'
import { BaseButton, BaseInput, BaseTextarea } from 'rei-kit'
import type { TeacherGuide } from '@/domain/content'
import { toLines } from './editor/context'

const { guide } = defineProps<{ guide: TeacherGuide | null }>()
const emit = defineEmits<{ save: [guide: TeacherGuide]; cancel: [] }>()
const busy = defineModel<boolean>('busy', { default: false })

const lines = (xs: readonly string[] | undefined) => (xs ?? []).join('\n')
const form = reactive({
  objective: guide?.objective ?? '',
  vocabulary: lines(guide?.vocabulary),
  grammar: lines(guide?.grammar),
  expectedDifficulties: lines(guide?.expectedDifficulties),
  commonErrors: (guide?.commonErrors ?? []).map((e) => `${e.error} => ${e.correction}`).join('\n'),
  questionsToAsk: lines(guide?.questionsToAsk),
  speakingPrompts: lines(guide?.speakingPrompts),
  situation: guide?.rolePlay.situation ?? '',
  roles: lines(guide?.rolePlay.roles),
  steps: lines(guide?.rolePlay.steps),
  script: guide?.listening.script ?? '',
  listeningQuestions: lines(guide?.listening.questions),
  reinforcement: lines(guide?.reinforcement),
  suggestedActivities: lines(guide?.suggestedActivities),
})

function submit() {
  emit('save', {
    objective: form.objective.trim(),
    vocabulary: toLines(form.vocabulary),
    grammar: toLines(form.grammar),
    expectedDifficulties: toLines(form.expectedDifficulties),
    commonErrors: toLines(form.commonErrors).map((l) => {
      const [error = '', correction = ''] = l.split('=>').map((x) => x.trim())
      return { error, correction }
    }),
    questionsToAsk: toLines(form.questionsToAsk),
    speakingPrompts: toLines(form.speakingPrompts),
    rolePlay: { situation: form.situation.trim(), roles: toLines(form.roles), steps: toLines(form.steps) },
    listening: { script: form.script.trim(), questions: toLines(form.listeningQuestions) },
    reinforcement: toLines(form.reinforcement),
    suggestedActivities: toLines(form.suggestedActivities),
  })
}
</script>

<template>
  <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submit">
    <p class="text-ink-soft text-sm md:col-span-2">Listelerde her satır bir madde.</p>
    <BaseInput v-model="form.objective" class="md:col-span-2" size="sm" label="Hedef" />
    <BaseTextarea v-model="form.vocabulary" size="sm" label="Kelimeler" :rows="4" />
    <BaseTextarea v-model="form.grammar" size="sm" label="Dil bilgisi" :rows="4" />
    <BaseTextarea v-model="form.expectedDifficulties" size="sm" label="Beklenen zorluklar" :rows="4" />
    <BaseTextarea v-model="form.commonErrors" size="sm" label="Sık hatalar" hint="Satır başına: hata => doğrusu" :rows="4" />
    <BaseTextarea v-model="form.questionsToAsk" size="sm" label="Sorulacak sorular" :rows="4" />
    <BaseTextarea v-model="form.speakingPrompts" size="sm" label="Konuşma soruları" :rows="4" />
    <BaseInput v-model="form.situation" class="md:col-span-2" size="sm" label="Canlandırma durumu" />
    <BaseTextarea v-model="form.roles" size="sm" label="Roller" :rows="3" />
    <BaseTextarea v-model="form.steps" size="sm" label="Canlandırma adımları" :rows="3" />
    <BaseTextarea v-model="form.script" size="sm" label="Dinleme metni" :rows="5" />
    <BaseTextarea v-model="form.listeningQuestions" size="sm" label="Dinleme soruları" :rows="5" />
    <BaseTextarea v-model="form.reinforcement" size="sm" label="Pekiştirme" :rows="3" />
    <BaseTextarea v-model="form.suggestedActivities" size="sm" label="Önerilen etkinlikler" :rows="3" />
    <div class="flex gap-2 md:col-span-2">
      <BaseButton type="submit" :loading="busy">Rehberi kaydet</BaseButton>
      <BaseButton variant="secondary" @click="emit('cancel')">Vazgeç</BaseButton>
    </div>
  </form>
</template>
