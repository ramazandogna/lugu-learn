<script setup lang="ts">
import { computed } from 'vue'
import { BaseInput, BaseSelect, BaseTextarea } from 'rei-kit'
import type { Question } from '@/domain/content'
import { blankQuestion, type QuestionType } from '../../lib/package-edit'
import { toLines, useEditor } from './context'

/* One gradable question. `types` narrows the shapes allowed here (a homework order step is always `order`). */
const q = defineModel<Question>({ required: true })
const { types = ['choice', 'order', 'text'], noHints = false } = defineProps<{ types?: readonly QuestionType[]; noHints?: boolean }>()
const { objectiveOptions, vocabOptions } = useEditor()

const TYPE_LABEL: Record<QuestionType, string> = { choice: 'Çoktan seçmeli', order: 'Cümle sıralama', text: 'Kısa cevap' }
const typeOptions = computed(() => types.map((t) => ({ value: t, label: TYPE_LABEL[t] })))

const type = computed({
  get: () => q.value.type,
  set: (t: QuestionType) => {
    if (t === q.value.type) return
    const keep = { prompt: q.value.prompt, hint: q.value.hint, explain: q.value.explain, objectiveId: q.value.objectiveId, vocabId: q.value.vocabId }
    q.value = { ...blankQuestion(t, q.value.id), ...keep } as Question
  },
})

const optionsText = computed({
  get: () => (q.value.type === 'choice' ? q.value.options.join('\n') : ''),
  set: (s: string) => {
    if (q.value.type !== 'choice') return
    q.value.options = s.split('\n').map((x) => x.trim())
    if (q.value.answer >= q.value.options.length) q.value.answer = 0
  },
})
const answerOptions = computed(() =>
  q.value.type === 'choice' ? q.value.options.map((o, i) => ({ value: i, label: o || `${i + 1}. seçenek (boş)` })) : [],
)
const orderText = computed({
  get: () => (q.value.type === 'order' ? q.value.answer.join(' | ') : ''),
  set: (s: string) => {
    if (q.value.type !== 'order') return
    const parts = (s.includes('|') ? s.split('|') : s.split(/\s+/)).map((x) => x.trim()).filter(Boolean)
    q.value.answer = parts
    q.value.tokens = [...parts].reverse()
  },
})
const acceptText = computed({
  get: () => (q.value.type === 'text' ? q.value.accept.join('\n') : ''),
  set: (s: string) => {
    if (q.value.type === 'text') q.value.accept = toLines(s)
  },
})
const optional = (v: string) => v.trim() || undefined
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2">
    <BaseSelect v-if="types.length > 1" v-model="type" size="sm" label="Soru türü" :options="typeOptions" />
    <p class="text-ink-soft self-end type-small">Kimlik: <code>{{ q.id }}</code></p>
    <BaseInput v-model="q.prompt" class="md:col-span-2" label="Soru metni" />

    <template v-if="q.type === 'choice'">
      <BaseTextarea v-model="optionsText" label="Seçenekler (her satıra bir tane)" :rows="4" />
      <BaseSelect v-model="q.answer" label="Doğru seçenek" :options="answerOptions" />
    </template>
    <BaseInput
      v-else-if="q.type === 'order'"
      v-model="orderText"
      class="md:col-span-2"
      size="sm"
      label="Doğru cümle"
      hint="Parçalar boşlukla ya da | ile ayrılır; öğrenciye karışık gösterilir"
    />
    <BaseTextarea v-else v-model="acceptText" class="md:col-span-2" label="Kabul edilen cevaplar (her satıra bir tane)" :rows="3" />

    <template v-if="!noHints">
      <BaseInput :model-value="q.hint ?? ''" label="İpucu (Türkçe, isteğe bağlı)" @update:model-value="(v: string) => (q.hint = optional(v))" />
      <BaseInput :model-value="q.explain ?? ''" label="Açıklama (yanıttan sonra)" @update:model-value="(v: string) => (q.explain = optional(v))" />
    </template>
    <BaseSelect
      :model-value="q.objectiveId"
      size="sm"
      label="Hedef"
      placeholder="Yok"
      :options="objectiveOptions"
      @update:model-value="(v: string | undefined) => (q.objectiveId = v || undefined)"
    />
    <BaseSelect
      :model-value="q.vocabId"
      size="sm"
      label="Kelime"
      placeholder="Yok"
      :options="vocabOptions"
      @update:model-value="(v: string | undefined) => (q.vocabId = v || undefined)"
    />
  </div>
</template>
