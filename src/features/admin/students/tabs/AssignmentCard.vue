<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, Lock, LockOpen, Play } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseCard, BaseSelect } from 'rei-kit'
import { BaseDisclosure, BaseToolbar } from 'rei-kit/web'
import { setLessonGate, setProgress, type AssignmentDetail } from '@/lib/api/admin'
import type { ProgressAction } from '@/lib/database.types'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
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
const target = ref<string | undefined>()
const lessonOptions = computed(() => lessons.value.map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))

const COPY: Record<ProgressAction, { label: string; message: string; tone?: 'danger' }> = {
  forward: { label: 'Sonraki derse geçir', message: 'Öğrenci bir sonraki derse geçirilir; şu anki dersin açık oturumu yarım bırakılmış sayılır.' },
  backward: { label: 'Önceki derse al', message: 'Öğrenci önceki derse alınır ve o dersi normal bir oturum olarak yeniden yapar.' },
  set_lesson: { label: 'Seçilen derse taşı', message: 'Öğrencinin şu anki dersi seçilen ders olur. Hiçbir kayıt silinmez.' },
  restart_lesson: { label: 'Dersi yeniden başlat', message: 'Şu anki dersin açık oturumu kapatılır; öğrenci dersi baştan başlar. Önceki yanıtlar korunur.' },
  pause: { label: 'Programı duraklat', message: 'Öğrenci bu programda ilerleyemez; kayıtlar korunur.' },
  resume: { label: 'Programı sürdür', message: 'Öğrenci kaldığı dersten devam eder.' },
  archive: { label: 'Programı kaldır', message: 'Program kapatılır ve açık oturumlar sonlandırılır. Bu işlem geri alınamaz.', tone: 'danger' },
}
const pending = ref<ProgressAction | null>(null)
const confirmOpen = ref(false)
const { busy, run } = useAction()

function ask(action: ProgressAction) {
  pending.value = action
  confirmOpen.value = true
}

/* Teacher gate: lessons up to `gate` (sequence) may be opened; null = they open one after another. */
const gate = computed(() => a.value.open_through_sequence)
const currentSeq = computed(() => lessons.value[currentIdx.value]?.sequence ?? null)
const waiting = computed(() => gate.value !== null && currentSeq.value !== null && currentSeq.value > gate.value)
const nextToOpen = computed(() => {
  if (gate.value === null) return null
  if (waiting.value) return lessons.value[currentIdx.value] ?? null
  return lessons.value.find((l) => l.sequence > gate.value!) ?? null
})
const gateTarget = ref<number | undefined>()
const gateOptions = computed(() => lessons.value.map((l) => ({ value: l.sequence, label: `${l.sequence}. ${l.title}` })))
type LessonMark = 'done' | 'current' | 'open' | 'locked'
const mark = (l: (typeof lessons.value)[number]): LessonMark => {
  if (l.id === a.value.current_lesson_id) return waiting.value ? 'locked' : 'current'
  if (detail.completedLessonIds.has(l.id)) return 'done'
  if (gate.value !== null && l.sequence <= gate.value && l.sequence > (currentSeq.value ?? 0)) return 'open'
  return 'locked'
}
const MARK_LABEL: Record<LessonMark, string> = { done: 'tamamlandı', current: 'şu an açık', open: 'açık, sırası gelince', locked: 'kilitli' }

async function applyGate(value: number | null, message: string) {
  const ok = await run(() => setLessonGate(a.value.id, value), message)
  if (ok) {
    gateTarget.value = undefined
    emit('changed')
  }
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
        <h2 class="type-body font-semibold">{{ detail.curriculumName }} · sürüm {{ detail.version }}</h2>
        <BaseBadge :tone="a.status === 'active' ? 'success' : a.status === 'paused' ? 'warning' : 'neutral'">{{ ASSIGNMENT_STATUS[a.status] }}</BaseBadge>
      </div>
      <p class="text-ink-soft type-small">
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
        <BaseButton size="sm" variant="danger" @click="ask('archive')">Kaldır</BaseButton>
      </BaseToolbar>
      <form class="flex flex-wrap items-end gap-2" @submit.prevent="ask('set_lesson')">
        <BaseSelect v-model="target" class="min-w-64" size="sm" label="Belirli bir derse taşı" placeholder="Ders seçin" :options="lessonOptions" />
        <BaseButton size="sm" type="submit" :disabled="!target || target === a.current_lesson_id">Taşı</BaseButton>
      </form>
    </div>

    <section v-if="open" class="border-hair rounded-card mt-4 flex flex-col gap-3 border p-3" aria-labelledby="gate-title">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 id="gate-title" class="type-body font-semibold">Öğretmen kilidi</h3>
        <BaseBadge :tone="gate === null ? 'neutral' : waiting ? 'warning' : 'success'">
          {{ gate === null ? 'Kapalı: dersler sırayla açılır' : waiting ? 'Öğrenci sıradaki dersi bekliyor' : `${gate}. derse kadar açık` }}
        </BaseBadge>
      </div>
      <p class="text-ink-soft type-small">
        <template v-if="gate === null">Öğrenci bir dersi bitirince sonraki kendiliğinden açılır. Kilidi açarsanız sonraki dersleri siz açarsınız.</template>
        <template v-else-if="waiting">Öğrenci {{ lessonTitle(a.current_lesson_id) }} dersine geldi; siz açana kadar kilitli görür.</template>
        <template v-else>Öğrenci {{ gate }}. derse kadar ilerleyebilir; sonrası siz açana kadar kilitli.</template>
      </p>
      <div class="flex flex-wrap gap-2">
        <BaseButton v-if="nextToOpen" size="sm" :loading="busy" @click="applyGate(nextToOpen.sequence, `${nextToOpen.sequence}. ders açıldı`)">
          <LockOpen :size="16" aria-hidden="true" /> {{ nextToOpen.sequence }}. dersi aç
        </BaseButton>
        <BaseButton v-if="gate === null && currentSeq !== null" size="sm" variant="secondary" :loading="busy" @click="applyGate(currentSeq, 'Öğretmen kilidi açıldı')">
          <Lock :size="16" aria-hidden="true" /> Dersleri ben açayım
        </BaseButton>
        <BaseButton v-if="gate !== null" size="sm" variant="secondary" :loading="busy" @click="applyGate(null, 'Öğretmen kilidi kaldırıldı')">Kilidi kaldır</BaseButton>
      </div>
      <form class="flex flex-wrap items-end gap-2" @submit.prevent="gateTarget !== undefined && applyGate(gateTarget, `${gateTarget}. derse kadar açıldı`)">
        <BaseSelect v-model="gateTarget" class="min-w-64" size="sm" label="Şu derse kadar aç" placeholder="Ders seçin" :options="gateOptions" />
        <BaseButton size="sm" type="submit" variant="secondary" :disabled="gateTarget === undefined || gateTarget === gate">Uygula</BaseButton>
      </form>
      <ol class="divide-hair divide-y type-small" aria-label="Dersler">
        <li v-for="l in lessons" :key="l.id" class="flex flex-wrap items-center justify-between gap-2 py-2">
          <span class="flex min-w-0 items-center gap-2">
            <Check v-if="mark(l) === 'done'" :size="16" class="shrink-0" aria-hidden="true" />
            <Play v-else-if="mark(l) === 'current'" :size="16" class="shrink-0" aria-hidden="true" />
            <LockOpen v-else-if="mark(l) === 'open'" :size="16" class="shrink-0" aria-hidden="true" />
            <Lock v-else :size="16" class="text-ink-soft shrink-0" aria-hidden="true" />
            <span class="min-w-0" :class="mark(l) === 'locked' ? 'text-ink-soft' : ''">{{ l.sequence }}. {{ l.title }}</span>
            <span class="text-ink-soft">· {{ MARK_LABEL[mark(l)] }}</span>
          </span>
          <span class="flex gap-3">
            <RouterLink class="focus-ring rounded-cell hover:underline" :to="{ name: 'admin-lesson-preview', params: { lessonId: l.id } }">Test et</RouterLink>
            <RouterLink class="focus-ring rounded-cell hover:underline" :to="{ name: 'admin-lesson', params: { lessonId: l.id }, query: { sekme: 'speaking' } }">Konuşma planı</RouterLink>
          </span>
        </li>
      </ol>
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
