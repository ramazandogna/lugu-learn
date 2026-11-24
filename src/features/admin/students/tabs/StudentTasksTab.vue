<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { BaseBadge, BaseButton, BaseCard, BaseDatePicker, BaseInput, BasePopconfirm, BaseSelect, BaseTextarea } from 'rei-kit'
import { assignTask, deleteTask, listSubjects, listTasks, studentProgramLessons, updateTask, type StudentTaskRow } from '@/lib/api/admin'
import type { TaskStatus } from '@/lib/database.types'
import LoadState from '../../components/LoadState.vue'
import { formatDate } from '../../lib/format'
import { useAction, useLoad } from '../../lib/use-load'

const { studentId } = defineProps<{ studentId: string }>()

const tasks = useLoad(() => listTasks(studentId), () => studentId)
const subjects = useLoad(listSubjects)
const lessons = useLoad(() => studentProgramLessons(studentId), () => studentId)
const { busy, run } = useAction()

const STATUS: { value: TaskStatus; label: string }[] = [
  { value: 'open', label: 'Açık' },
  { value: 'in_progress', label: 'Sürüyor' },
  { value: 'done', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
]
const TONE: Record<TaskStatus, 'neutral' | 'primary' | 'success' | 'warning'> = { open: 'neutral', in_progress: 'primary', done: 'success', cancelled: 'warning' }
const label = (s: TaskStatus) => STATUS.find((x) => x.value === s)?.label ?? s

const form = reactive({ title: '', description: '', dueDate: undefined as string | undefined, subjectId: '', lessonId: '' })
const subjectOptions = computed(() => [{ value: '', label: 'Ders bağlantısı yok' }, ...(subjects.data.value ?? []).filter((s) => s.active).map((s) => ({ value: s.id, label: s.name }))])
const lessonOptions = computed(() => [{ value: '', label: 'Müfredat dersi yok' }, ...(lessons.data.value ?? []).map((l) => ({ value: l.id, label: `Ders ${l.sequence} · ${l.title}` }))])
const subjectName = (id: string | null) => subjects.data.value?.find((s) => s.id === id)?.name
const lessonName = (id: string | null) => {
  const l = lessons.data.value?.find((x) => x.id === id)
  return l ? `Ders ${l.sequence} · ${l.title}` : undefined
}

const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
const overdue = (t: StudentTaskRow) => (t.status === 'open' || t.status === 'in_progress') && t.due_date !== null && t.due_date < todayIso

const shown = computed(() => {
  const rank: Record<TaskStatus, number> = { open: 0, in_progress: 0, done: 1, cancelled: 2 }
  return [...(tasks.data.value ?? [])].sort((a, b) => rank[a.status] - rank[b.status])
})
const opened = ref(false)

async function add() {
  const title = form.title.trim()
  if (!title) return
  const done = await run(
    () => assignTask(studentId, { title, description: form.description.trim() || null, dueDate: form.dueDate ?? null, subjectId: form.subjectId || null, lessonId: form.lessonId || null }),
    'Görev atandı',
  )
  if (done) {
    Object.assign(form, { title: '', description: '', dueDate: undefined, subjectId: '', lessonId: '' })
    opened.value = false
    await tasks.reload()
  }
}
async function setStatus(t: StudentTaskRow, status: TaskStatus) {
  if (status !== t.status && (await run(() => updateTask(t.id, { status }), 'Durum güncellendi'))) await tasks.reload()
}
async function remove(t: StudentTaskRow) {
  if (await run(() => deleteTask(t.id), 'Görev silindi')) await tasks.reload()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseCard as="section" aria-labelledby="task-new">
      <template #head>
        <div class="flex items-center justify-between gap-2">
          <h2 id="task-new" class="type-body font-semibold">Yeni görev / sorumluluk</h2>
          <BaseButton v-if="!opened" size="sm" variant="secondary" @click="opened = true">Görev ekle</BaseButton>
        </div>
      </template>
      <form v-if="opened" class="grid gap-3 sm:grid-cols-2" @submit.prevent="add">
        <BaseInput v-model="form.title" class="sm:col-span-2" label="Başlık" :maxlength="200" required />
        <BaseTextarea v-model="form.description" class="sm:col-span-2" label="Açıklama" :rows="2" />
        <BaseDatePicker v-model="form.dueDate" label="Son tarih" previous-label="Önceki ay" next-label="Sonraki ay" :week-starts-on="1" />
        <BaseSelect v-model="form.subjectId" label="Okul dersi" :options="subjectOptions" />
        <BaseSelect v-model="form.lessonId" class="sm:col-span-2" label="Müfredat dersi" :options="lessonOptions" />
        <div class="flex gap-2 sm:col-span-2">
          <BaseButton type="submit" :loading="busy" :disabled="!form.title.trim()">Ata</BaseButton>
          <BaseButton variant="quiet" @click="opened = false">Vazgeç</BaseButton>
        </div>
      </form>
      <p v-else class="text-ink-soft type-small">Öğrencinin ana sayfasında görünür; öğrenci kendisi tamamlandı işaretleyebilir.</p>
    </BaseCard>

    <LoadState :loading="tasks.loading.value" :error="tasks.error.value" :empty="!shown.length" empty-title="Henüz görev atanmamış" @retry="tasks.reload">
      <ul class="flex flex-col gap-3">
        <li v-for="t in shown" :key="t.id" class="border-hair bg-surface rounded-card flex flex-col gap-2 border p-4" :class="{ 'opacity-70': t.status === 'done' || t.status === 'cancelled' }">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <h3 class="type-body font-semibold">{{ t.title }}</h3>
            <div class="flex items-center gap-2">
              <BaseBadge v-if="overdue(t)" tone="danger">Gecikmiş</BaseBadge>
              <BaseBadge :tone="TONE[t.status]">{{ label(t.status) }}</BaseBadge>
            </div>
          </div>
          <p v-if="t.description" class="text-ink-soft type-small whitespace-pre-line">{{ t.description }}</p>
          <p class="text-ink-soft type-small">
            Son tarih: {{ t.due_date ? formatDate(t.due_date) : 'yok' }}
            <template v-if="subjectName(t.subject_id)"> · {{ subjectName(t.subject_id) }}</template>
            <template v-if="lessonName(t.lesson_id)"> · {{ lessonName(t.lesson_id) }}</template>
            <template v-if="t.completed_at"> · Bitti: {{ formatDate(t.completed_at) }}</template>
          </p>
          <div class="flex flex-wrap items-end gap-2">
            <BaseSelect :model-value="t.status" class="min-w-44" label="Durum" :options="STATUS" @update:model-value="(v) => v && setStatus(t, v)" />
            <BasePopconfirm message="Görev silinsin mi? Geçmiş kalsın istersen durumu İptal yap." confirm-label="Sil" cancel-label="Vazgeç" tone="danger" @confirm="remove(t)">
              <template #trigger="{ props }"><BaseButton variant="quiet" v-bind="props">Sil</BaseButton></template>
            </BasePopconfirm>
          </div>
        </li>
      </ul>
    </LoadState>
  </div>
</template>
