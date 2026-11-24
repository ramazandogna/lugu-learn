<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseSelect } from 'rei-kit'
import type { LessonPackage, Question } from '@/domain/content'
import { blankQuestion } from '../../lib/package-edit'
import { useEditor } from './context'
import QuestionEditor from './QuestionEditor.vue'

const pkg = defineModel<LessonPackage>({ required: true })
const { newId, objectiveOptions } = useEditor()
type Order = LessonPackage['homework']['groups'][number]['order']

function addGroup() {
  const id = newId('', 'hw')
  pkg.value.homework.groups.push({
    id,
    objectiveId: pkg.value.meta.objectives[0]?.id ?? '',
    complete: blankQuestion('choice', `${id}-complete`),
    order: blankQuestion('order', `${id}-order`) as Order,
    meaning: blankQuestion('choice', `${id}-meaning`),
  })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-ink-soft type-small">Her grup aynı cümle üzerinde üç adım: tamamla → sırala → anlam. Önerilen 6–8 grup.</p>
    <div v-for="(g, i) in pkg.homework.groups" :key="g.id" class="border-hair rounded-card flex flex-col gap-3 border p-3">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <BaseSelect v-model="g.objectiveId" class="min-w-64" :label="`${i + 1}. grup hedefi`" :options="objectiveOptions" />
        <BaseButton variant="quiet" @click="pkg.homework.groups.splice(i, 1)"><Trash2 class="size-4" aria-hidden="true" /> Grubu sil</BaseButton>
      </div>
      <h4 class="type-small font-semibold">1 · Cümle tamamlama</h4>
      <QuestionEditor :model-value="g.complete" :types="['choice', 'text']" @update:model-value="(q: Question) => (g.complete = q)" />
      <h4 class="type-small font-semibold">2 · Cümle sıralama</h4>
      <QuestionEditor :model-value="g.order" :types="['order']" @update:model-value="(q: Question) => q.type === 'order' && (g.order = q)" />
      <h4 class="type-small font-semibold">3 · Anlam</h4>
      <QuestionEditor :model-value="g.meaning" :types="['choice', 'text']" @update:model-value="(q: Question) => (g.meaning = q)" />
    </div>
    <BaseButton class="w-fit" variant="secondary" @click="addGroup"><Plus class="size-4" aria-hidden="true" /> Grup ekle</BaseButton>
  </div>
</template>
