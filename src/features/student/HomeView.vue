<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { BaseButton } from 'rei-kit'
import { Clock, Compass, Map, Snowflake, Trophy, WandSparkles } from 'lucide-vue-next'

import { AmbientLayer, AvatarArt, CandyButton, EmptyScene, JarProgress, LessonJar, LoadingScene, LuguMark, LuguMascot, WorldBackground, playSound, unitThemeAttrs, useReducedMotion } from '@/design'
import type { Expression } from '@/design'

import { prefetchLesson, prefetchMap } from '@/lib/api/student'

import DayGuide from './components/DayGuide.vue'
import MyTasks from './components/MyTasks.vue'
import StreakChain from './components/StreakChain.vue'
import UpcomingLessons from './components/UpcomingLessons.vue'
import { greetingName, isAvatarKey } from './profile'
import { greeting, lineOfTheDay } from './motivation'
import { useLessonTheme } from './useLessonTheme'
import { useProgress } from './useProgress'
import { useStudentHome } from './useStudentHome'

const { home, error, refresh, mainAssignment } = useStudentHome()
const { streak, ready: progressReady } = useProgress()
const reduced = useReducedMotion()
const router = useRouter()
onMounted(() => void refresh())

/* D1 "Bugünkü kavanoz": the lid opens a crack once, the title candy glows; the press lifts the lid, then the lesson opens on a 420 ms crossfade. */
const lid = ref<'closed' | 'ajar' | 'open'>('closed')
let lidTimers: ReturnType<typeof setTimeout>[] = []
function peek() {
  if (reduced.value) return
  lidTimers.push(setTimeout(() => (lid.value = 'ajar'), 600), setTimeout(() => (lid.value = 'closed'), 2200))
}
function openLesson(to: string) {
  if (reduced.value) return void router.push(to)
  lid.value = 'open'
  playSound('whoosh')
  setTimeout(() => {
    const go = () => router.push(to).then(() => undefined)
    if ('startViewTransition' in document) void document.startViewTransition(go)
    else void go()
  }, 320)
}
const homeReady = computed(() => !!home.value)
let peeked = false
watch(homeReady, (r) => {
  if (r && !peeked) (peeked = true), peek()
}, { immediate: true })
onBeforeUnmount(() => lidTimers.forEach(clearTimeout))

/* Şeker cebi numbers count up once per session (600 ms). */
const counted = ref<{ streak: number; words: number; best: number } | null>(null)
function countUp(to: { streak: number; words: number; best: number }) {
  let done = false
  try {
    done = sessionStorage.getItem('lugu.home.counted') === '1'
    sessionStorage.setItem('lugu.home.counted', '1')
  } catch {
    /* counts every visit without storage */
  }
  if (done || reduced.value) return void (counted.value = to)
  const t0 = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / 600)
    counted.value = { streak: Math.round(to.streak * p), words: Math.round(to.words * p), best: Math.round(to.best * p) }
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}


/* Everything one tap away is warmed while the learner reads: lesson chunk, map chunk, lesson content, maps. */
watch(
  () => home.value?.assignments,
  (list) => {
    if (!list) return
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
    idle(() => {
      void import('./lesson/LessonView.vue').catch(() => {})
      void import('./MapView.vue').catch(() => {})
    })
    for (const a of list) {
      if (a.current_lesson && !a.current_lesson.teacher_locked) prefetchLesson(a.current_lesson.id)
      prefetchMap(a.id)
    }
  },
  { immediate: true },
)

watch(
  () => [home.value?.mastered_words, progressReady.value, streak.value.current, streak.value.best] as const,
  ([words, ready, cur, best]) => {
    if (words === undefined || !ready || counted.value) return
    countUp({ streak: cur, words, best })
  },
  { immediate: true },
)
const name = computed(() => greetingName(home.value?.profile ?? null))
const avatar = computed(() => {
  const k = home.value?.profile?.avatar_key
  return isAvatarKey(k) ? k : null
})
const current = computed(() => mainAssignment.value?.current_lesson ?? null)
const paused = computed(() => mainAssignment.value?.status === 'paused')
/* The hero wears the unit of the lesson the learner is on (Ü1 pink, Ü2 night, Ü3 neon). */
const unitTheme = useLessonTheme(() => current.value?.id)
const others = computed(() => (home.value?.assignments ?? []).filter((a) => a.id !== mainAssignment.value?.id))
const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n)

/* Piko Rehber: one bubble, one button; after 8 s of quiet the head turns (not under reduced motion). */
const look = ref<Expression>('happy')
let idle: ReturnType<typeof setTimeout> | undefined
const nudge = () => {
  look.value = 'happy'
  clearTimeout(idle)
  if (!reduced.value) idle = setTimeout(() => (look.value = 'thinking'), 8000)
}
onMounted(() => {
  nudge()
  window.addEventListener('pointerdown', nudge, { passive: true })
})
onBeforeUnmount(() => {
  clearTimeout(idle)
  window.removeEventListener('pointerdown', nudge)
})

const pikoLine = computed(() => {
  const s = streak.value
  if (progressReady.value && s.mood === 'back') return `Geri geldin! Zincir yeniden başlıyor, rekorun duruyor (en uzun: ${s.best}).`
  if (progressReady.value && s.frozen && !s.today) return 'Piko zinciri dondurdu. Sen hiç merak etme, kaldığın yerden devam!'
  if (progressReady.value && s.today) return 'Bugünkü adımını attın. Bir tur daha istersen buradayım!'
  return lineOfTheDay()
})
const ready = computed(() => !!current.value && !paused.value && !current.value.teacher_locked)
const guideTo = computed(() => (ready.value && current.value ? `/ders/${current.value.id}` : mainAssignment.value ? '/harita' : '/kesfet'))
const guideLabel = computed(() => (ready.value && current.value ? (current.value.in_progress ? 'Devam edelim' : 'Başlayalım') : 'Haritaya bakalım'))
const hayalTo = computed(() => (current.value ? `/hayal/${current.value.id}` : null))
</script>

<template>
  <EmptyScene v-if="error && !home" tone="danger" title="Ana sayfan açılamadı" :description="error">
    <BaseButton @click="refresh">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!home" label="Ana sayfan hazırlanıyor" />
  <div v-else class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <WorldBackground
      character="piko"
      intensity="rich"
      class="rounded-shell relative overflow-hidden"
      v-bind="unitThemeAttrs(unitTheme)"
      aria-labelledby="hero-title"
      role="region"
    >
      <AmbientLayer kind="candy" :count="2" :active="!reduced" />
      <div class="relative grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:items-center md:gap-8 md:p-8">
        <div class="flex min-w-0 flex-col gap-4">
          <div class="flex items-center gap-4">
            <AvatarArt v-if="avatar" :avatar="avatar" :size="64" />
            <div class="min-w-0">
              <p class="type-eyebrow text-ink-soft">{{ greeting() }}</p>
              <h1 id="hero-title" class="type-hero text-ink">{{ name ? `${name}!` : 'Hoş geldin!' }}</h1>
              <p v-if="home?.profile?.honor_title" class="bg-accent text-on-accent rounded-control type-small mt-1 inline-flex items-center gap-1 px-2 py-1 font-semibold">
                <Trophy :size="16" aria-hidden="true" /> {{ home.profile.honor_title }}
              </p>
            </div>
          </div>

          <template v-if="mainAssignment">
            <div v-if="current && !paused" class="flex items-center gap-3">
              <div class="relative shrink-0" aria-hidden="true">
                <LessonJar :lid="lid" :candies="Math.min(12, mainAssignment.lessons_completed + 1)" :size="84" />
                <span v-if="lid === 'ajar'" class="home-candy" />
              </div>
              <div class="flex min-w-0 flex-col gap-1">
                <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }} · Ders {{ current.sequence }}</p>
                <h2 class="type-title text-ink">{{ current.title }}</h2>
                <p v-if="current.tagline" class="type-body text-ink-soft">{{ current.tagline }}</p>
                <p class="text-ink-soft type-small mt-1 flex items-center gap-1"><Clock :size="16" aria-hidden="true" /> Yaklaşık {{ current.estimated_minutes }} dakika</p>
              </div>
            </div>
            <div v-else-if="paused" class="flex flex-col gap-1">
              <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }}</p>
              <h2 class="type-section text-ink">Programın şu an duraklatıldı</h2>
              <p class="type-body text-ink-soft">Öğretmenin programı açınca kaldığın yerden devam edeceksin. Bitirdiklerini haritadan tekrar oynayabilirsin.</p>
            </div>
            <div v-else class="flex flex-col gap-1">
              <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }}</p>
              <h2 class="type-section text-ink">Programını tamamladın!</h2>
              <p class="type-body text-ink-soft">Tüm dersleri bitirdin. İstediğin dersi haritadan tekrar oynayabilirsin.</p>
            </div>
            <JarProgress
              :value="mainAssignment.lessons_completed"
              :max="Math.max(1, mainAssignment.lessons_total)"
              :label="`${mainAssignment.lessons_total} dersten ${mainAssignment.lessons_completed} ders tamamlandı`"
            >
              <p class="type-task text-ink">{{ mainAssignment.lessons_total }} dersten {{ mainAssignment.lessons_completed }} tamam</p>
              <p class="type-small text-ink-soft">Her ders kavanozuna bir şeker ekler.</p>
            </JarProgress>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p v-if="current && !paused && current.teacher_locked" class="type-body text-ink-soft self-center" role="status">Bu dersi öğretmenin açacak. Açılınca hemen başlayabilirsin!</p>
              <CandyButton v-else-if="current && !paused" variant="wrapper" class="self-center sm:min-w-60 sm:self-auto" @click="openLesson(`/ders/${current.id}`)">
                {{ current.in_progress ? 'Devam et' : 'Derse başla' }}
              </CandyButton>
              <BaseButton as="router-link"  to="/harita" :variant="current && !paused ? 'secondary' : 'primary'" :size="current && !paused ? 'md' : 'lg'">
                <Map :size="20" aria-hidden="true" /> Haritamı aç
              </BaseButton>
            </div>
          </template>
          <p v-else class="type-body text-ink">Henüz bir programın yok. Öğretmenin sana bir program atadığında ilk dersin burada görünecek.</p>
        </div>

        <!-- Piko on the stage: big, floating, with the bubble beside him. -->
        <div class="flex items-center gap-3 md:flex-col md:items-center" data-character="piko">
          <LuguMascot character="piko" :expression="look" :size="132" :animated="!reduced" class="shrink-0" />
          <div class="bg-surface rounded-card min-w-0 p-3 shadow-(--shadow-card) sm:p-4">
            <p class="type-eyebrow text-ink-soft">Piko</p>
            <p class="type-body text-ink" aria-live="polite">{{ pikoLine }}</p>
            <BaseButton as="router-link" :to="guideTo" variant="quiet" class="mt-1 -ms-3">{{ guideLabel }}</BaseButton>
          </div>
        </div>
      </div>
    </WorldBackground>

    <template v-if="mainAssignment">
      <UpcomingLessons :key="mainAssignment.id" :assignment-id="mainAssignment.id" />

      <section v-if="others.length" aria-labelledby="other-title" class="flex flex-col gap-3">
        <h2 id="other-title" class="type-section text-ink">Diğer programların</h2>
        <ul class="flex flex-col gap-3">
          <li v-for="a in others" :key="a.id" class="surface rounded-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div class="min-w-0">
              <p class="type-task text-ink">{{ a.curriculum.name }}</p>
              <p class="type-small text-ink-soft">
                {{ a.lessons_completed }} / {{ a.lessons_total }} ders<template v-if="a.current_lesson && a.status !== 'paused'"> · Ders {{ a.current_lesson.sequence }}: {{ a.current_lesson.title }}</template
                ><template v-else-if="a.status === 'paused'"> · duraklatıldı</template>
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <BaseButton v-if="a.current_lesson && a.status !== 'paused' && !a.current_lesson.teacher_locked" as="router-link" :to="`/ders/${a.current_lesson.id}`">
                {{ a.current_lesson.in_progress ? 'Devam et' : 'Derse başla' }}
              </BaseButton>
              <BaseButton as="router-link" :to="`/harita/${a.id}`" variant="secondary"><Map :size="20" aria-hidden="true" /> Harita</BaseButton>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <MyTasks />

    <section aria-labelledby="pocket-title" class="flex flex-col gap-3">
      <h2 id="pocket-title" class="type-section text-ink">Şeker cebim</h2>
      <ul class="grid grid-cols-3 gap-3">
        <li>
          <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex h-full flex-col gap-1 p-3 sm:p-4">
            <p class="type-eyebrow text-ink-soft">Günlük zincir</p>
            <p class="type-display text-ink">{{ progressReady ? (counted?.streak ?? streak.current) : '–' }}</p>
            <p class="type-small text-ink-soft flex items-center gap-1"><LuguMark :size="16" /> gün</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex h-full flex-col gap-1 p-3 sm:p-4">
            <p class="type-eyebrow text-ink-soft">Yeni kelime</p>
            <p class="type-display text-ink">{{ fmt(counted?.words ?? home.mastered_words) }}</p>
            <p class="type-small text-ink-soft">öğrendin</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex h-full flex-col gap-1 p-3 sm:p-4">
            <p class="type-eyebrow text-ink-soft">En iyi seri</p>
            <p class="type-display text-ink">{{ progressReady ? (counted?.best ?? streak.best) : '–' }}</p>
            <p class="type-small text-ink-soft">gün</p>
          </RouterLink>
        </li>
      </ul>
      <div v-if="progressReady" class="surface rounded-card flex flex-col gap-3 p-4">
        <StreakChain :streak="streak" />
        <p class="type-small text-ink-soft flex items-center gap-1">
          <Snowflake :size="16" aria-hidden="true" />
          {{ streak.freezes }} dondurma hakkın var; gerekirse Piko zinciri kendiliğinden dondurur.
        </p>
      </div>
    </section>

    <section aria-labelledby="more-title" class="flex flex-col gap-3">
      <h2 id="more-title" class="sr-only">Keşfet ve hayal kur</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink to="/kesfet" class="surface surface-interactive rounded-card flex items-center gap-3 p-4">
          <Compass :size="32" class="text-primary shrink-0" aria-hidden="true" />
          <span class="min-w-0">
            <span class="type-task text-ink block">İngilizce ile neler yapabilirsin?</span>
            <span class="type-small text-ink-soft block">8 dünya, dokundukça açılır.</span>
          </span>
        </RouterLink>
        <RouterLink v-if="hayalTo" :to="hayalTo" class="surface surface-interactive rounded-card flex items-center gap-3 p-4">
          <WandSparkles :size="32" class="text-primary shrink-0" aria-hidden="true" />
          <span class="min-w-0">
            <span class="type-task text-ink block">Hayal kur</span>
            <span class="type-small text-ink-soft block">Karakterini ve sahneni İngilizceyle kur. Yanlışı yok.</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <DayGuide :lesson="current && !paused ? { id: current.id, title: current.title, in_progress: current.in_progress } : null" :done-today="progressReady && streak.today" />
  </div>
</template>

<style scoped>
/* The title candy that peeks out of the jar while the lid is ajar. */
.home-candy {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 18px;
  height: 12px;
  margin-left: -9px;
  border-radius: 40%;
  background: var(--color-star);
  border: 1.5px solid var(--color-ink);
  filter: drop-shadow(0 0 6px var(--color-star));
  animation: home-candy 1200ms var(--ease-sheet) both;
}
@keyframes home-candy {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  to {
    transform: translateY(-8px);
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .home-candy {
    animation: none;
  }
}
</style>
