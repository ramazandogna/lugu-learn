<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseTextarea } from 'rei-kit'
import type { LessonPackage, Question } from '@/domain/content'
import { blankQuestion } from '../../lib/package-edit'
import { useEditor } from './context'
import QuestionEditor from './QuestionEditor.vue'

const pkg = defineModel<LessonPackage>({ required: true })
const { newId } = useEditor()
type Step = LessonPackage['explanation']['steps'][number]

const addStep = () => pkg.value.explanation.steps.push({ id: newId('', 'step'), title: '', body: '', examples: [] })
const toggleCheck = (s: Step) => (s.check = s.check ? undefined : blankQuestion('choice', newId('', 'check')))
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-ink-soft type-small">Her adımda tek fikir. Metin Türkçe; yalnızca **kalın** biçimi desteklenir.</p>
    <div v-for="(s, i) in pkg.explanation.steps" :key="s.id" class="border-hair rounded-card flex flex-col gap-3 border p-3">
      <div class="flex items-center justify-between">
        <p class="type-small font-semibold">{{ i + 1 }}. adım <code class="text-ink-soft type-small">{{ s.id }}</code></p>
        <BaseButton variant="quiet" @click="pkg.explanation.steps.splice(i, 1)"><Trash2 class="size-4" aria-hidden="true" /> Adımı sil</BaseButton>
      </div>
      <BaseInput v-model="s.title" label="Başlık" />
      <BaseTextarea v-model="s.body" label="Anlatım" :rows="4" />
      <div class="flex flex-col gap-2">
        <p class="type-small font-semibold">Örnekler</p>
        <div v-for="(e, ei) in s.examples" :key="ei" class="grid items-end gap-2 md:grid-cols-[1fr_1fr_auto]">
          <BaseInput v-model="e.en" label="İngilizce" />
          <BaseInput v-model="e.tr" label="Türkçe" />
          <BaseButton variant="quiet" icon :aria-label="`${ei + 1}. örneği sil`" @click="s.examples.splice(ei, 1)"><Trash2 class="size-4" aria-hidden="true" /></BaseButton>
        </div>
        <BaseButton v-if="s.examples.length < 6" class="w-fit" variant="secondary" @click="s.examples.push({ en: '', tr: '' })">
          <Plus class="size-4" aria-hidden="true" /> Örnek
        </BaseButton>
      </div>
      <BaseButton class="w-fit" variant="quiet" @click="toggleCheck(s)">{{ s.check ? 'Kontrol sorusunu kaldır' : 'Kontrol sorusu ekle' }}</BaseButton>
      <div v-if="s.check" class="bg-muted rounded-card p-3">
        <QuestionEditor :model-value="s.check" @update:model-value="(q: Question) => (s.check = q)" />
      </div>
    </div>
    <BaseButton class="w-fit" variant="secondary" @click="addStep"><Plus class="size-4" aria-hidden="true" /> Adım ekle</BaseButton>
  </div>
</template>
