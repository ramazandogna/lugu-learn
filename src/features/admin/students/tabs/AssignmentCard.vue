<script setup lang="ts">
/* One program: header, progress, pause/remove, rare actions menu, lesson states, history. */
import { computed, ref } from 'vue'
import { ChevronDown, Trash2 } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseCard, BaseMenu } from 'rei-kit'
import { setProgress, type AssignmentDetail } from '@/lib/api/admin'
import type { ProgressAction } from '@/lib/database.types'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { ASSIGNMENT_STATUS } from '../../lib/format'
import { useAction } from '../../lib/use-load'
import LessonStatusList from './LessonStatusList.vue'
import ProgramHistory from './ProgramHistory.vue'

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
const done = computed(() => lessons.value.filter((l) => detail.completedLessonIds.has(l.id)).length)
const showHistory = ref(false)

const { busy, run } = useAction()
const COPY: Partial<Record<ProgressAction, { label: string; message: string; tone?: 'danger' }>> = {
  forward: { label: 'Sonraki derse geçir', message: 'Öğrenci bir sonraki derse geçirilir; şu anki dersin açık oturumu yarım bırakılmış sayılır.' },
  backward: { label: 'Önceki derse al', message: 'Öğrenci önceki derse alınır ve o dersi normal bir oturum olarak yeniden yapar.' },
  restart_lesson: { label: 'Baştan başlat', message: 'Şu anki dersin açık oturumu kapatılır; öğrenci dersi baştan başlar. Önceki yanıtlar korunur.' },
  archive: { label: 'Programı kaldır', message: 'Program kapatılır. Öğrencinin kayıtları silinmez, korunur.', tone: 'danger' },
}
const pending = ref<ProgressAction | null>(null)
const confirmOpen = ref(false)
function ask(action: ProgressAction) {
  pending.value = action
  confirmOpen.value = true
}
async function confirm(note: string) {
  const action = pending.value
  if (!action) return
  const ok = await run(() => setProgress(a.value.id, action, note), 'Program güncellendi')
  confirmOpen.value = false
  if (ok) emit('changed')
}
async function toggle(action: 'pause' | 'resume') {
  if (await run(() => setProgress(a.value.id, action, ''), 'Program güncellendi')) emit('changed')
}
</script>

<template>
  <BaseCard as="section" :aria-label="`${detail.curriculumName} programı`">
    <template #head>
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="type-body font-semibold">{{ detail.curriculumName }}</h2>
            <BaseBadge :tone="a.status === 'active' ? 'success' : a.status === 'paused' ? 'warning' : 'neutral'">{{ ASSIGNMENT_STATUS[a.status] }}</BaseBadge>
          </div>
          <p class="text-ink-soft type-small">
            sürüm {{ detail.version }} · Şu anki ders: <strong class="text-ink">{{ lessonTitle(a.current_lesson_id) }}</strong>
          </p>
        </div>
        <span v-if="open" class="flex shrink-0 flex-wrap gap-2">
          <BaseButton v-if="a.status === 'active'" size="sm" variant="secondary" :loading="busy" @click="toggle('pause')">Duraklat</BaseButton>
          <BaseButton v-else size="sm" variant="secondary" :loading="busy" @click="toggle('resume')">Sürdür</BaseButton>
          <BaseButton size="sm" variant="secondary" class="text-negative" @click="ask('archive')"><Trash2 :size="16" aria-hidden="true" /> Programı kaldır</BaseButton>
          <BaseMenu :label="`${detail.curriculumName} program işlemleri`" align="end">
            <template #trigger>
              <BaseButton size="sm" variant="secondary">Diğer <ChevronDown :size="16" aria-hidden="true" /></BaseButton>
            </template>
            <BaseButton variant="row" role="menuitem" :disabled="currentIdx < 0 || currentIdx >= lessons.length - 1" @click="ask('forward')">Sonraki derse geçir</BaseButton>
            <BaseButton variant="row" role="menuitem" :disabled="currentIdx <= 0" @click="ask('backward')">Önceki derse al</BaseButton>
            <BaseButton variant="row" role="menuitem" :disabled="currentIdx < 0" @click="ask('restart_lesson')">Baştan başlat</BaseButton>
          </BaseMenu>
        </span>
      </div>
      <div class="bg-muted mt-2 h-2 overflow-hidden rounded-full" role="progressbar" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="lessons.length" :aria-label="`${lessons.length} dersten ${done} ders tamamlandı`">
        <div class="bg-primary h-full rounded-full" :style="{ width: `${lessons.length ? (100 * done) / lessons.length : 0}%` }" />
      </div>
      <p class="text-ink-soft type-small mt-1">{{ done }}/{{ lessons.length }} ders tamamlandı</p>
    </template>

    <LessonStatusList :detail="detail" @changed="emit('changed')" />

    <BaseButton class="mt-3" size="sm" variant="secondary" :aria-expanded="showHistory" @click="showHistory = !showHistory">Geçmiş ›</BaseButton>
    <ProgramHistory v-if="showHistory" class="mt-2" :detail="detail" />

    <ConfirmDialog
      v-if="pending && COPY[pending]"
      v-model="confirmOpen"
      :title="COPY[pending]!.label"
      :message="COPY[pending]!.message"
      :confirm-label="COPY[pending]!.label"
      :tone="COPY[pending]!.tone ?? 'primary'"
      with-note
      note-label="Not (olay kaydına yazılır)"
      :busy="busy"
      @confirm="confirm"
    />
  </BaseCard>
</template>
