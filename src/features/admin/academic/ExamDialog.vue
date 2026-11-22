<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { BaseAlert, BaseButton, BaseDatePicker, BaseInput, BaseSelect, NumberInput, todayKey } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { computeNet } from '@/domain/analytics'
import { saveExam, type Exam, type ExamResult, type Subject } from '@/lib/api/admin'
import { formatNumber } from '../lib/format'
import { useAction } from '../lib/use-load'

const open = defineModel<boolean>({ default: false })
const { studentId, exam, results, subjects, penalty } = defineProps<{
  studentId: string
  exam: Exam | null
  results: readonly ExamResult[]
  subjects: readonly Subject[]
  penalty: number
}>()
const emit = defineEmits<{ saved: [] }>()

type Line = { subject_id: string; name: string; include: boolean; total?: number; correct?: number; incorrect?: number; blank?: number }
const form = reactive({ title: '', exam_date: '' as string | undefined, kind: 'school' as Exam['kind'], notes: '' })
const lines = ref<Line[]>([])
const { busy, run } = useAction()

watch(open, (v) => {
  if (!v) return
  Object.assign(form, { title: exam?.title ?? '', exam_date: exam?.exam_date ?? todayKey(), kind: exam?.kind ?? 'school', notes: exam?.notes ?? '' })
  lines.value = subjects
    .filter((s) => s.active || results.some((r) => r.subject_id === s.id))
    .map((s) => {
      const r = results.find((x) => x.subject_id === s.id)
      return { subject_id: s.id, name: s.name, include: Boolean(r), total: r?.total ?? undefined, correct: r?.correct, incorrect: r?.incorrect, blank: r?.blank }
    })
})

const kinds = [
  { value: 'school' as const, label: 'Okul sınavı' },
  { value: 'mock' as const, label: 'Deneme' },
  { value: 'lgs' as const, label: 'LGS' },
  { value: 'other' as const, label: 'Diğer' },
]
const filled = (l: Line) => l.correct !== undefined || l.incorrect !== undefined || l.blank !== undefined
const invalid = computed(() =>
  lines.value.filter((l) => filled(l) && l.total !== undefined && (l.correct ?? 0) + (l.incorrect ?? 0) + (l.blank ?? 0) > l.total).map((l) => l.name),
)

async function submit() {
  if (!form.title.trim() || !form.exam_date || invalid.value.length) return
  const date = form.exam_date
  const ok = await run(
    () =>
      saveExam(
        studentId,
        { id: exam?.id, title: form.title.trim(), exam_date: date, kind: form.kind, notes: form.notes.trim() || null },
        lines.value.filter(filled).map((l) => ({
          subject_id: l.subject_id,
          total: l.total ?? null,
          correct: l.correct ?? 0,
          incorrect: l.incorrect ?? 0,
          blank: l.blank ?? 0,
        })),
      ),
    'Sınav kaydedildi',
  )
  if (ok) {
    open.value = false
    emit('saved')
  }
}
</script>

<template>
  <ResponsiveDialog v-model="open" :title="exam ? 'Sınavı düzenle' : 'Sınav ekle'" close-label="Kapat">
    <form id="exam-form" class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-3">
        <BaseInput v-model="form.title" class="sm:col-span-3" label="Sınav adı" :error="form.title.trim() ? undefined : 'Gerekli'" />
        <BaseDatePicker v-model="form.exam_date" label="Tarih" previous-label="Önceki ay" next-label="Sonraki ay" :week-starts-on="1" />
        <BaseSelect v-model="form.kind" label="Tür" :options="kinds" />
        <BaseInput v-model="form.notes" label="Not" />
      </div>
      <fieldset class="flex flex-col gap-3">
        <legend class="mb-2 text-sm font-semibold">Ders sonuçları (boş bırakılan dersler kaydedilmez)</legend>
        <div v-for="l in lines" :key="l.subject_id" class="border-hair rounded-card grid grid-cols-2 items-end gap-2 border p-3 md:grid-cols-5">
          <p class="col-span-2 font-semibold md:col-span-5">
            {{ l.name }}
            <span v-if="filled(l)" class="text-ink-soft text-sm font-normal">· tahmini net {{ formatNumber(computeNet(l.correct ?? 0, l.incorrect ?? 0, penalty)) }}</span>
          </p>
          <NumberInput v-model="l.total" size="sm" label="Soru sayısı" :min="0" decrement-label="Azalt" increment-label="Artır" />
          <NumberInput v-model="l.correct" size="sm" label="Doğru" :min="0" decrement-label="Azalt" increment-label="Artır" />
          <NumberInput v-model="l.incorrect" size="sm" label="Yanlış" :min="0" decrement-label="Azalt" increment-label="Artır" />
          <NumberInput v-model="l.blank" size="sm" label="Boş" :min="0" decrement-label="Azalt" increment-label="Artır" />
        </div>
      </fieldset>
      <BaseAlert v-if="invalid.length" tone="danger">Doğru + yanlış + boş, soru sayısını aşamaz: {{ invalid.join(', ') }}</BaseAlert>
    </form>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton type="submit" form="exam-form" :loading="busy" :disabled="!form.title.trim() || invalid.length > 0">Kaydet</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
