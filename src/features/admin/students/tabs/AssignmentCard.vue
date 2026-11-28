<script setup lang="ts">
/*
 * One program of a student. The lesson list is the control surface: tick the lessons the student may take
 * (they are walked in order, each after the one before), save. Rare actions (move, restart, pause, remove)
 * live in one menu.
 */
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown, FlaskConical, MessagesSquare, Trash2 } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseCard, BaseMenu, BaseSelect, BaseSwitch } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import { setOpenLessons, setProgress, type AssignmentDetail } from '@/lib/api/admin'
import type { ProgressAction } from '@/lib/database.types'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import LessonPicker from '../../components/LessonPicker.vue'
import { ASSIGNMENT_STATUS, PROGRAM_EVENT_LABEL, formatDateTime } from '../../lib/format'
import { useAction } from '../../lib/use-load'
import LessonSpeakingPanel from '../../content/LessonSpeakingPanel.vue'

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

/* ── open lessons ── */
const saved = computed<string[] | null>(() => a.value.open_lesson_ids)
const savedOrdered = computed(() => (saved.value ? lessons.value.filter((l) => saved.value!.includes(l.id)).map((l) => l.id) : []))
const allOpen = ref(false)
const picked = ref<string[]>([])
function reset() {
  allOpen.value = saved.value === null
  picked.value = [...savedOrdered.value]
}
watch(saved, reset, { immediate: true })
const dirty = computed(() => (allOpen.value ? saved.value !== null : saved.value === null || picked.value.join() !== savedOrdered.value.join()))
const currentLocked = computed(() => saved.value !== null && !!a.value.current_lesson_id && !saved.value.includes(a.value.current_lesson_id))
const summary = computed(() => {
  if (saved.value === null) return { tone: 'neutral' as const, text: 'Tüm dersler sırayla açılır' }
  if (currentLocked.value) return { tone: 'warning' as const, text: 'Öğrenci yeni ders bekliyor' }
  return { tone: 'success' as const, text: `${saved.value.length} ders açık` }
})

const { busy, run } = useAction()
async function save() {
  const ids = allOpen.value ? null : picked.value
  const ok = await run(() => setOpenLessons(a.value.id, ids), ids === null ? 'Tüm dersler açıldı' : `${ids.length} ders açık olarak kaydedildi`)
  if (ok) emit('changed')
}

/* ── rare program actions ── */
const target = ref<string | undefined>()
const lessonOptions = computed(() => lessons.value.map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))
const COPY: Record<ProgressAction, { label: string; message: string; tone?: 'danger' }> = {
  forward: { label: 'Öğrenciyi sonraki derse geçir', message: 'Öğrenci bir sonraki derse geçirilir; şu anki dersin açık oturumu yarım bırakılmış sayılır.' },
  backward: { label: 'Öğrenciyi önceki derse al', message: 'Öğrenci önceki derse alınır ve o dersi normal bir oturum olarak yeniden yapar.' },
  set_lesson: { label: 'Belirli bir derse taşı', message: 'Öğrencinin şu anki dersi seçilen ders olur. Hiçbir kayıt silinmez.' },
  restart_lesson: { label: 'Dersi yeniden başlat', message: 'Şu anki dersin açık oturumu kapatılır; öğrenci dersi baştan başlar. Önceki yanıtlar korunur.' },
  pause: { label: 'Programı duraklat', message: 'Öğrenci bu programda ilerleyemez; kayıtlar korunur.' },
  resume: { label: 'Programı sürdür', message: 'Öğrenci kaldığı dersten devam eder.' },
  archive: { label: 'Programı kaldır', message: 'Program kapatılır ve açık oturumlar sonlandırılır. Bu işlem geri alınamaz.', tone: 'danger' },
}
const pending = ref<ProgressAction | null>(null)
const confirmOpen = ref(false)
function ask(action: ProgressAction) {
  pending.value = action
  target.value = undefined
  confirmOpen.value = true
}
async function confirm(note: string) {
  const action = pending.value
  if (!action) return
  const ok = await run(() => setProgress(a.value.id, action, note, action === 'set_lesson' ? target.value : null), 'Program güncellendi')
  confirmOpen.value = false
  if (ok) emit('changed')
}
const linkClass = 'focus-ring rounded-control text-ink-soft hover:text-ink hover:bg-muted type-small inline-flex min-h-10 items-center gap-1 px-2'
</script>

<template>
  <BaseCard as="section" :aria-label="`${detail.curriculumName} programı`">
    <template #head>
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="type-body font-semibold">{{ detail.curriculumName }}</h2>
            <BaseBadge :tone="a.status === 'active' ? 'success' : a.status === 'paused' ? 'warning' : 'neutral'">{{ ASSIGNMENT_STATUS[a.status] }}</BaseBadge>
            <BaseBadge v-if="open" :tone="summary.tone">{{ summary.text }}</BaseBadge>
          </div>
          <p class="text-ink-soft type-small">
            Şu anki ders: <strong class="text-ink">{{ lessonTitle(a.current_lesson_id) }}</strong> · sürüm {{ detail.version }} · atanma {{ formatDateTime(a.created_at) }}
          </p>
        </div>
        <span v-if="open" class="flex shrink-0 flex-wrap gap-2">
        <BaseButton size="sm" variant="secondary" class="text-negative" @click="ask('archive')"><Trash2 :size="16" aria-hidden="true" /> Programı kaldır</BaseButton>
        <BaseMenu :label="`${detail.curriculumName} program işlemleri`" align="end">
          <template #trigger>
            <BaseButton size="sm" variant="secondary">Diğer işlemler <ChevronDown :size="16" aria-hidden="true" /></BaseButton>
          </template>
          <BaseButton variant="row" role="menuitem" :disabled="currentIdx < 0 || currentIdx >= lessons.length - 1" @click="ask('forward')">Sonraki derse geçir</BaseButton>
          <BaseButton variant="row" role="menuitem" :disabled="currentIdx <= 0" @click="ask('backward')">Önceki derse al</BaseButton>
          <BaseButton variant="row" role="menuitem" @click="ask('set_lesson')">Belirli bir derse taşı…</BaseButton>
          <BaseButton variant="row" role="menuitem" :disabled="currentIdx < 0" @click="ask('restart_lesson')">Dersi yeniden başlat</BaseButton>
          <BaseButton v-if="a.status === 'active'" variant="row" role="menuitem" @click="ask('pause')">Programı duraklat</BaseButton>
          <BaseButton v-else variant="row" role="menuitem" @click="ask('resume')">Programı sürdür</BaseButton>
        </BaseMenu>
        </span>
      </div>
      <div class="bg-muted mt-2 h-2 overflow-hidden rounded-full" role="progressbar" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="lessons.length" :aria-label="`${lessons.length} dersten ${done} ders tamamlandı`">
        <div class="bg-primary h-full rounded-full" :style="{ width: `${lessons.length ? (100 * done) / lessons.length : 0}%` }" />
      </div>
      <p class="text-ink-soft type-small mt-1">{{ lessons.length }} dersten {{ done }} ders tamamlandı</p>
    </template>

    <section v-if="open" class="flex flex-col gap-3" :aria-label="`${detail.curriculumName}: öğrencinin açabileceği dersler`">
      <div>
        <h3 class="type-body font-semibold">Öğrencinin açabileceği dersler</h3>
        <p class="text-ink-soft type-small">
          İşaretlediğiniz dersler sırayla açılır: öğrenci birini bitirince sıradaki işaretli derse geçer. İşaretsiz dersleri öğrenci
          "öğretmenin açacak" diye kilitli görür.
        </p>
      </div>
      <BaseSwitch v-model="allOpen" label="Seçim yapma: tüm dersler sırayla açılsın" />
      <LessonPicker v-if="!allOpen" v-model="picked" :lessons="lessons" :completed="detail.completedLessonIds" :current="a.current_lesson_id" :disabled="busy">
        <template #row="{ lesson }">
          <span class="flex shrink-0 gap-1 ps-9 sm:ps-0">
            <RouterLink :class="linkClass" :to="{ name: 'admin-lesson-preview', params: { lessonId: lesson.id } }"><FlaskConical :size="16" aria-hidden="true" /> Test et</RouterLink>
            <RouterLink :class="linkClass" :to="{ name: 'admin-lesson', params: { lessonId: lesson.id }, query: { sekme: 'speaking' } }"><MessagesSquare :size="16" aria-hidden="true" /> Konuşma planı</RouterLink>
          </span>
        </template>
      </LessonPicker>
      <div v-if="dirty" class="bg-surface border-hair rounded-tile sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-2 border p-2 shadow-lg">
        <span class="type-small text-ink ps-1 font-semibold">{{ allOpen ? 'Tüm dersler açılacak' : `${picked.length} ders açık olacak` }}</span>
        <span class="flex gap-2">
          <BaseButton variant="secondary" :disabled="busy" @click="reset">Vazgeç</BaseButton>
          <BaseButton :loading="busy" :disabled="!allOpen && !picked.length" @click="save">Kaydet</BaseButton>
        </span>
      </div>
      <p v-if="!allOpen && !picked.length" class="type-small text-warning-ink">En az bir ders seçin. Programı tamamen kaldırmak için yukarıdaki "Programı kaldır" düğmesini kullanın.</p>
    </section>

    <BaseDisclosure v-if="a.current_lesson_id" class="mt-3" :title="`Konuşma dersi planı · ${lessonTitle(a.current_lesson_id)}`" :heading-level="3">
      <LessonSpeakingPanel :lesson-id="a.current_lesson_id" />
    </BaseDisclosure>

    <BaseDisclosure class="mt-3" :title="`Olay kaydı (${detail.events.length})`" :heading-level="3">
      <ul class="divide-hair divide-y type-small">
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
      :message="COPY[pending].message"
      :confirm-label="COPY[pending].label"
      :tone="COPY[pending].tone ?? 'primary'"
      :confirm-disabled="pending === 'set_lesson' && (!target || target === a.current_lesson_id)"
      with-note
      note-label="Not (olay kaydına yazılır)"
      :busy="busy"
      @confirm="confirm"
    >
      <BaseSelect v-if="pending === 'set_lesson'" v-model="target" class="mt-3" label="Hedef ders" placeholder="Ders seçin" :options="lessonOptions" />
    </ConfirmDialog>
  </BaseCard>
</template>
