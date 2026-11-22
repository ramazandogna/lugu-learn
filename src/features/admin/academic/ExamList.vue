<script setup lang="ts">
import { BaseButton, BasePopconfirm, BaseTable, EmptyState } from 'rei-kit'
import { deleteExam, type Exam, type ExamResult } from '@/lib/api/admin'
import { formatDate, formatNumber } from '../lib/format'
import { useAction } from '../lib/use-load'

const { exams, results, subjectName } = defineProps<{ exams: readonly Exam[]; results: readonly ExamResult[]; subjectName: (id: string) => string }>()
const emit = defineEmits<{ edit: [exam: Exam]; changed: [] }>()
const { run } = useAction()

const KIND: Record<Exam['kind'], string> = { school: 'Okul sınavı', mock: 'Deneme', lgs: 'LGS', other: 'Diğer' }

const rowsFor = (examId: string) =>
  results
    .filter((r) => r.exam_id === examId)
    .map((r) => ({
      id: r.id,
      subject: subjectName(r.subject_id),
      total: r.total ?? '—',
      correct: r.correct,
      incorrect: r.incorrect,
      blank: r.blank,
      net: formatNumber(r.net),
    }))

async function remove(id: string) {
  if (await run(() => deleteExam(id), 'Sınav silindi')) emit('changed')
}
</script>

<template>
  <EmptyState v-if="!exams.length" title="Henüz sınav sonucu girilmedi" />
  <ul v-else class="flex flex-col gap-4">
    <li v-for="e in exams" :key="e.id" class="border-hair rounded-card border p-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="font-semibold">{{ e.title }}</p>
          <p class="text-ink-soft text-sm">{{ formatDate(e.exam_date) }} · {{ KIND[e.kind] }}<template v-if="e.notes"> · {{ e.notes }}</template></p>
        </div>
        <div class="flex gap-2">
          <BaseButton size="sm" variant="secondary" @click="emit('edit', e)">Düzenle</BaseButton>
          <BasePopconfirm message="Sınav ve sonuçları silinsin mi?" confirm-label="Sil" cancel-label="Vazgeç" tone="danger" @confirm="remove(e.id)">
            <template #trigger="{ props }"><BaseButton size="sm" variant="quiet" v-bind="props">Sil</BaseButton></template>
          </BasePopconfirm>
        </div>
      </div>
      <BaseTable
        class="mt-2"
        :caption="`${e.title} sonuçları`"
        caption-hidden
        row-key="id"
        :rows="rowsFor(e.id)"
        :columns="[
          { key: 'subject', label: 'Ders' },
          { key: 'total', label: 'Soru', align: 'end' },
          { key: 'correct', label: 'Doğru', align: 'end' },
          { key: 'incorrect', label: 'Yanlış', align: 'end' },
          { key: 'blank', label: 'Boş', align: 'end' },
          { key: 'net', label: 'Net', align: 'end' },
        ]"
      />
    </li>
  </ul>
</template>
