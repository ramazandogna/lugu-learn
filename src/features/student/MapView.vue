<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { BaseButton } from 'rei-kit'
import { ChevronLeft, Compass, WandSparkles } from 'lucide-vue-next'

import { AmbientLayer, CharacterBubble, EmptyScene, JarProgress, LearningMap, LoadingScene, WorldBackground, useReducedMotion } from '@/design'
import { CHARACTER_KEYS, type CharacterKey } from '@/domain/content'
import { friendlyMessage, getLearningMap } from '@/lib/api/student'
import type { StudentLearningMap } from '@/lib/database.types'

import { lessonRoute, lockedReason, toMapNodes } from './map'
import { useStudentHome } from './useStudentHome'

const router = useRouter()
const { home } = useStudentHome()
const programs = computed(() => (home.value?.assignments.length ?? 0) > 1 ? home.value!.assignments : [])
const reduced = useReducedMotion()
const route = useRoute()

const map = shallowRef<StudentLearningMap | null>(null)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const noticeEl = ref<HTMLElement | null>(null)

const id = computed(() => String(route.params.assignmentId ?? ''))

async function load() {
  error.value = null
  map.value = null
  try {
    map.value = await getLearningMap(id.value)
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
watch(id, load, { immediate: true })

const nodes = computed(() => (map.value ? toMapNodes(map.value.lessons) : []))

/* D3: which stops opened since the learner last saw this map (remembered per program; the first visit celebrates nothing). */
const fresh = shallowRef<string[]>([])
function seenKey() {
  return `lugu.map.open:${id.value}`
}
watch(map, (m) => {
  fresh.value = []
  if (!m) return
  const open = toMapNodes(m.lessons).filter((n) => n.state !== 'locked').map((n) => n.id)
  try {
    const raw = localStorage.getItem(seenKey())
    if (raw !== null) {
      const before = new Set(JSON.parse(raw) as string[])
      fresh.value = open.filter((x) => !before.has(x)).slice(0, 1)
    }
    localStorage.setItem(seenKey(), JSON.stringify(open))
  } catch {
    /* no storage: no celebration, the map still works */
  }
})
const character = computed<CharacterKey>(() => {
  const c = map.value?.lessons.find((l) => l.id === map.value?.assignment.current_lesson_id)?.character
  return CHARACTER_KEYS.find((k) => k === c) ?? 'momo'
})
const done = computed(() => map.value?.lessons.filter((l) => l.state === 'completed').length ?? 0)
const total = computed(() => map.value?.lessons.length ?? 0)
/** The stop the guide talks about: the one in progress or open, else the last finished. */
const here = computed(() => {
  const l = map.value?.lessons ?? []
  return l.find((x) => x.state === 'in_progress') ?? l.find((x) => x.state === 'current') ?? [...l].reverse().find((x) => x.state === 'completed') ?? null
})
const next = computed(() => map.value?.lessons.filter((l) => l.state === 'locked').length ?? 0)
const guide = computed(() =>
  here.value?.state === 'completed'
    ? 'Tüm yolu yürüdün! İstediğin durağa dokunup tekrar oynayabilirsin.'
    : here.value
      ? `Şu an Ders ${here.value.sequence}: ${here.value.title}. Işıklı durağa dokun, yola devam edelim!`
      : 'Yolun burada. Açık bir durağa dokunabilirsin.',
)
const STATE_LABELS = { locked: 'Kilitli', available: 'Başla', in_progress: 'Devam et', completed: 'Tamamlandı · Tekrar oyna' } as const

function select(lessonId: string) {
  notice.value = null
  const lesson = map.value?.lessons.find((l) => l.id === lessonId)
  const to = lesson && lessonRoute(lesson)
  if (to) void router.push(to)
}

function locked(lessonId: string) {
  const lesson = map.value?.lessons.find((l) => l.id === lessonId)
  if (lesson && map.value) {
    notice.value = `${lesson.title}: ${lockedReason(lesson, map.value)}`
    /* The bubble sits above the map; a tap far down the path would leave it off screen. */
    void nextTick(() => noticeEl.value?.scrollIntoView({ behavior: reduced.value ? 'auto' : 'smooth', block: 'center' }))
  }
}
</script>

<template>
  <EmptyScene v-if="error" tone="danger" title="Haritan açılamadı" :description="error">
    <BaseButton @click="load">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!map" label="Haritan hazırlanıyor" character="momo" />
  <EmptyScene v-else-if="!map.lessons.length" title="Bu haritada henüz ders yok" description="Öğretmenin dersleri eklediğinde yolun burada belirecek.">
    <BaseButton as="router-link" to="/">Ana sayfaya dön</BaseButton>
  </EmptyScene>
  <WorldBackground v-else :character="character" intensity="rich" class="relative min-h-full">
    <AmbientLayer kind="candy" :count="3" :active="!reduced" />
    <div class="relative mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <header class="surface rounded-card relative flex flex-col gap-3 overflow-hidden p-4 pt-7 sm:p-6 sm:pt-9">
        <div class="tent absolute inset-x-0 top-0" aria-hidden="true" />
        <RouterLink v-if="programs.length" :to="{ name: 'student-maps' }" class="focus-ring rounded-control text-primary type-task -ms-1 inline-flex min-h-11 w-fit items-center gap-1 px-1">
          <ChevronLeft :size="20" aria-hidden="true" /> Haritalarım ({{ programs.length }})
        </RouterLink>
        <div>
          <p class="type-eyebrow text-ink-soft">{{ map.assignment.curriculum_name || 'Öğrenme haritam' }}</p>
          <h1 class="type-hero text-ink">Macera yolun</h1>
        </div>
        <JarProgress :value="done" :max="Math.max(1, total)" :label="`${total} dersten ${done} ders tamamlandı`">
          <p class="type-task text-ink">{{ total }} dersten {{ done }} tamam</p>
          <p class="type-small text-ink-soft">Bitirdiklerini istediğin zaman tekrar oynayabilirsin.<template v-if="next"> Önünde {{ next }} kilitli durak var.</template></p>
        </JarProgress>
      </header>
      <CharacterBubble :character="character" size="sm">{{ guide }}</CharacterBubble>
      <div ref="noticeEl" aria-live="polite">
        <CharacterBubble v-if="notice" :character="character" expression="thinking" size="sm">
          {{ notice }}
        </CharacterBubble>
      </div>
      <LearningMap :nodes="nodes" label="Öğrenme haritam" :character="character" :state-labels="STATE_LABELS" :fresh="fresh" @select="select" @locked="locked" />
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink v-if="here" :to="`/hayal/${here.id}`" class="surface surface-interactive rounded-card flex items-center gap-3 p-4">
          <WandSparkles :size="32" class="text-primary shrink-0" aria-hidden="true" />
          <span class="min-w-0">
            <span class="type-task text-ink block">Hayal kur</span>
            <span class="type-small text-ink-soft block">Ders {{ here.sequence }} kelimeleriyle karakter ve sahne kur.</span>
          </span>
        </RouterLink>
        <RouterLink to="/kesfet" class="surface surface-interactive rounded-card flex items-center gap-3 p-4">
          <Compass :size="32" class="text-primary shrink-0" aria-hidden="true" />
          <span class="min-w-0">
            <span class="type-task text-ink block">İngilizce ile neler yapabilirsin?</span>
            <span class="type-small text-ink-soft block">8 dünyayı gez.</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </WorldBackground>
</template>

<style scoped>
/* The unit's awning: a striped band in the unit's own colours (scalloped lower edge). */
.tent {
  height: 1rem;
  background: repeating-linear-gradient(90deg, var(--color-primary-fill) 0 1.25rem, var(--color-surface) 1.25rem 2.5rem);
  border-bottom: 2px solid var(--color-primary);
}
</style>
