<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseCombobox, BaseInput, BaseSelect, BaseTextarea, NumberInput } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { createLesson, updateLesson, type CurriculumLesson, type CurriculumObjective } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const open = defineModel<boolean>({ default: false })
const { versionId, lesson, lessons, objectives, nextSequence } = defineProps<{
  versionId: string
  lesson: CurriculumLesson | null
  lessons: readonly CurriculumLesson[]
  objectives: readonly CurriculumObjective[]
  nextSequence: number
}>()
const emit = defineEmits<{ saved: [] }>()

const form = reactive({
  title: '',
  estimated_minutes: 45 as number | undefined,
  objective_ids: [] as string[],
  prerequisite_ids: [] as string[],
  source_notes: '',
  status: 'draft' as CurriculumLesson['status'],
})
const { busy, run } = useAction()

watch(open, (v) => {
  if (!v) return
  Object.assign(form, {
    title: lesson?.title ?? '',
    estimated_minutes: lesson?.estimated_minutes ?? 45,
    objective_ids: [...(lesson?.objective_ids ?? [])],
    prerequisite_ids: [...(lesson?.prerequisite_ids ?? [])],
    source_notes: lesson?.source_notes ?? '',
    status: lesson?.status ?? 'draft',
  })
})

const objectiveOptions = computed(() => objectives.map((o) => ({ value: o.id, label: `${o.code} · ${o.text}` })))
const prerequisiteOptions = computed(() => lessons.filter((l) => l.id !== lesson?.id).map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))
const statuses = [
  { value: 'draft' as const, label: 'Taslak' },
  { value: 'ready' as const, label: 'Hazır' },
  { value: 'archived' as const, label: 'Arşiv (programda atlanır)' },
]

async function submit() {
  if (!form.title.trim()) return
  const input = {
    title: form.title.trim(),
    estimated_minutes: form.estimated_minutes ?? 45,
    objective_ids: form.objective_ids,
    prerequisite_ids: form.prerequisite_ids,
    source_notes: form.source_notes.trim() || null,
    status: form.status,
  }
  const ok = await run(() => (lesson ? updateLesson(lesson.id, input) : createLesson(versionId, nextSequence, input)), 'Ders kaydedildi')
  if (ok) {
    open.value = false
    emit('saved')
  }
}
</script>

<template>
  <ResponsiveDialog v-model="open" :title="lesson ? 'Dersi düzenle' : 'Ders ekle'" close-label="Kapat">
    <form id="lesson-form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <BaseInput v-model="form.title" class="sm:col-span-2" label="Başlık" :error="form.title.trim() ? undefined : 'Gerekli'" />
      <NumberInput v-model="form.estimated_minutes" label="Tahmini süre (dk)" :min="5" :max="180" :step="5" decrement-label="Azalt" increment-label="Artır" />
      <BaseSelect v-model="form.status" label="Durum" :options="statuses" />
      <BaseCombobox
        v-model="form.objective_ids"
        class="sm:col-span-2"
        mode="multiple"
        label="Hedefler"
        :options="objectiveOptions"
        empty-label="Hedef yok; Hedefler sekmesinden ekleyin"
        :remove-label="(l: string) => `${l} kaldır`"
      />
      <BaseCombobox
        v-model="form.prerequisite_ids"
        class="sm:col-span-2"
        mode="multiple"
        label="Ön koşul dersler"
        :options="prerequisiteOptions"
        empty-label="Başka ders yok"
        :remove-label="(l: string) => `${l} kaldır`"
      />
      <BaseTextarea v-model="form.source_notes" class="sm:col-span-2" label="Kaynak notları" hint="AI içerik üretimine bağlam olarak gönderilir" :rows="4" />
    </form>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton type="submit" form="lesson-form" :loading="busy" :disabled="!form.title.trim()">Kaydet</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
