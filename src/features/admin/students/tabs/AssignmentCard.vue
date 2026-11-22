<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseBadge, BaseButton, BaseCard, BaseSelect } from 'rei-kit'
import { BaseDisclosure, BaseToolbar } from 'rei-kit/web'
import { setProgress, type AssignmentDetail } from '@/lib/api/admin'
import type { ProgressAction } from '@/lib/database.types'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { ASSIGNMENT_STATUS, PROGRAM_EVENT_LABEL, formatDateTime } from '../../lib/format'
import { useAction } from '../../lib/use-load'

const { detail } = defineProps<{ detail: AssignmentDetail }>()
const emit = defineEmits<{ changed: [] }>()

const a = computed(() => detail.assignment)
const open = computed(() => a.value.status === 'active' || a.value.status === 'paused')
const lessons = computed(() => detail.lessons.filter((l) => l.status !== 'archived'))
const currentIdx = computed(() => lessons.value.findIndex((l) => l.id === a.value.current_lesson_id))
const lessonTitle = (id: string | null) => {
  const l = detail.lessons.find((x) => x.id === id)
  return l ? `${l.sequence}. ${l.title}` : '—'
}
const target = ref<string | undefined>()
const lessonOptions = computed(() => lessons.value.map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))

const COPY: Record<ProgressAction, { label: string; message: string; tone?: 'danger' }> = {
  forward: { label: 'Sonraki derse geçir', message: 'Öğrenci bir sonraki derse geçirilir; şu anki dersin açık oturumu yarım bırakılmış sayılır.' },
  backward: { label: 'Önceki derse al', message: 'Öğrenci önceki derse alınır ve o dersi normal bir oturum olarak yeniden yapar.' },
  set_lesson: { label: 'Seçilen derse taşı', message: 'Öğrencinin şu anki dersi seçilen ders olur. Hiçbir kayıt silinmez.' },
  restart_lesson: { label: 'Dersi yeniden başlat', message: 'Şu anki dersin açık oturumu kapatılır; öğrenci dersi baştan başlar. Önceki yanıtlar korunur.' },
  pause: { label: 'Programı duraklat', message: 'Öğrenci bu programda ilerleyemez; kayıtlar korunur.' },
  resume: { label: 'Programı sürdür', message: 'Öğrenci kaldığı dersten devam eder.' },
  archive: { label: 'Programı arşivle', message: 'Program kapatılır ve açık oturumlar sonlandırılır. Bu işlem geri alınamaz.', tone: 'danger' },
}
const pending = ref<ProgressAction | null>(null)
const confirmOpen = ref(false)
const { busy, run } = useAction()

function ask(action: ProgressAction) {
  pending.value = action
  confirmOpen.value = true
}

async function confirm(note: string) {
  const action = pending.value
  if (!action) return
  const ok = await run(() => setProgress(a.value.id, action, note, action === 'set_lesson' ? target.value : null), 'Program güncellendi')
  confirmOpen.value = false
  if (ok) emit('changed')
}
</script>

<template>
  <BaseCard as="section" :aria-label="`${detail.curriculumName} programı`">
    <template #head>
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-base font-semibold">{{ detail.curriculumName }} · sürüm {{ detail.version }}</h2>
        <BaseBadge :tone="a.status === 'active' ? 'success' : a.status === 'paused' ? 'warning' : 'neutral'">{{ ASSIGNMENT_STATUS[a.status] }}</BaseBadge>
      </div>
      <p class="text-ink-soft text-sm">
        Şu anki ders: <strong class="text-ink">{{ lessonTitle(a.current_lesson_id) }}</strong> · {{ detail.completedLessonIds.size }}/{{ lessons.length }} ders tamamlandı ·
        atanma {{ formatDateTime(a.created_at) }}
      </p>
    </template>

    <div v-if="open" class="flex flex-col gap-3">
      <BaseToolbar label="Program işlemleri" class="flex flex-wrap gap-2">
        <BaseButton size="sm" variant="secondary" :disabled="currentIdx <= 0" @click="ask('backward')">Önceki ders</BaseButton>
        <BaseButton size="sm" variant="secondary" :disabled="currentIdx < 0 || currentIdx >= lessons.length - 1" @click="ask('forward')">Sonraki ders</BaseButton>
        <BaseButton size="sm" variant="secondary" :disabled="currentIdx < 0" @click="ask('restart_lesson')">Dersi yeniden başlat</BaseButton>
        <BaseButton v-if="a.status === 'active'" size="sm" variant="secondary" @click="ask('pause')">Duraklat</BaseButton>
        <BaseButton v-else size="sm" variant="secondary" @click="ask('resume')">Sürdür</BaseButton>
        <BaseButton size="sm" variant="danger" @click="ask('archive')">Arşivle</BaseButton>
      </BaseToolbar>
      <form class="flex flex-wrap items-end gap-2" @submit.prevent="ask('set_lesson')">
        <BaseSelect v-model="target" class="min-w-64" size="sm" label="Belirli bir derse taşı" placeholder="Ders seçin" :options="lessonOptions" />
        <BaseButton size="sm" type="submit" :disabled="!target || target === a.current_lesson_id">Taşı</BaseButton>
      </form>
    </div>

    <BaseDisclosure class="mt-3" :title="`Olay kaydı (${detail.events.length})`" :heading-level="3">
      <ul class="divide-hair divide-y text-sm">
        <li v-for="e in detail.events" :key="e.id" class="py-2">
          <span class="font-semibold">{{ PROGRAM_EVENT_LABEL[e.kind] ?? e.kind }}</span>
          <span class="text-ink-soft"> · {{ formatDateTime(e.created_at) }}</span>
          <span v-if="e.from_lesson_id || e.to_lesson_id" class="text-ink-soft"> · {{ lessonTitle(e.from_lesson_id) }} → {{ lessonTitle(e.to_lesson_id) }}</span>
          <p v-if="e.note" class="text-ink-soft">Not: {{ e.note }}</p>
        </li>
        <li v-if="!detail.events.length" class="text-ink-soft py-2">Kayıtlı olay yok.</li>
      </ul>
    </BaseDisclosure>

    <ConfirmDialog
      v-if="pending"
      v-model="confirmOpen"
      :title="COPY[pending].label"
      :message="pending === 'set_lesson' ? `${COPY[pending].message} Hedef: ${lessonTitle(target ?? null)}` : COPY[pending].message"
      :confirm-label="COPY[pending].label"
      :tone="COPY[pending].tone ?? 'primary'"
      with-note
      note-label="Not (olay kaydına yazılır)"
      :busy="busy"
      @confirm="confirm"
    />
  </BaseCard>
</template>
