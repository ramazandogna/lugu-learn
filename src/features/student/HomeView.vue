<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, ProgressBar } from 'rei-kit'
import { Clock, Compass, Snowflake, WandSparkles } from 'lucide-vue-next'

import { AmbientLayer, AvatarArt, EmptyScene, LoadingScene, LuguMark, LuguMascot, WorldBackground, useReducedMotion } from '@/design'
import type { Expression } from '@/design'

import MyTasks from './components/MyTasks.vue'
import StreakChain from './components/StreakChain.vue'
import UpcomingLessons from './components/UpcomingLessons.vue'
import { greetingName, isAvatarKey } from './profile'
import { greeting, lineOfTheDay } from './motivation'
import { useProgress } from './useProgress'
import { useStudentHome } from './useStudentHome'

const { home, error, refresh, mainAssignment } = useStudentHome()
const { streak, ready: progressReady } = useProgress()
const reduced = useReducedMotion()
onMounted(() => void refresh())

const name = computed(() => greetingName(home.value?.profile ?? null))
const avatar = computed(() => {
  const k = home.value?.profile?.avatar_key
  return isAvatarKey(k) ? k : null
})
const current = computed(() => mainAssignment.value?.current_lesson ?? null)
const paused = computed(() => mainAssignment.value?.status === 'paused')
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
const guideTo = computed(() => (current.value && !paused.value ? `/ders/${current.value.id}` : mainAssignment.value ? `/harita/${mainAssignment.value.id}` : '/kesfet'))
const guideLabel = computed(() => (current.value && !paused.value ? (current.value.in_progress ? 'Devam edelim' : 'Başlayalım') : 'Haritaya bakalım'))
const hayalTo = computed(() => (current.value ? `/hayal/${current.value.id}` : null))
</script>

<template>
  <EmptyScene v-if="error && !home" tone="danger" title="Ana sayfan açılamadı" :description="error">
    <BaseButton @click="refresh">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!home" label="Ana sayfan hazırlanıyor" />
  <div v-else class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <WorldBackground character="piko" intensity="rich" class="rounded-card relative overflow-hidden">
      <AmbientLayer kind="candy" :count="3" :active="!reduced" />
      <div class="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
        <div class="flex min-w-0 flex-1 items-center gap-4">
          <AvatarArt v-if="avatar" :avatar="avatar" :size="72" />
          <div class="min-w-0">
            <p class="type-eyebrow text-ink-soft">{{ greeting() }}</p>
            <h1 class="type-hero text-ink">{{ name ? `${name}!` : 'Hoş geldin!' }}</h1>
          </div>
        </div>
        <div class="bg-surface rounded-card flex items-center gap-3 p-3 shadow-(--shadow-card) sm:max-w-md" data-character="piko">
          <LuguMascot character="piko" :expression="look" :size="64" :animated="!reduced" />
          <div class="min-w-0">
            <p class="type-eyebrow text-ink-soft">Piko</p>
            <p class="type-body text-ink" aria-live="polite">{{ pikoLine }}</p>
            <BaseButton as="router-link" :to="guideTo" size="sm" class="mt-2">{{ guideLabel }}</BaseButton>
          </div>
        </div>
      </div>
    </WorldBackground>

    <EmptyScene v-if="!mainAssignment" title="Henüz bir programın yok" description="Öğretmenin sana bir program atadığında ilk dersin burada görünecek." />

    <template v-else>
      <section aria-labelledby="current-title" class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
        <template v-if="current && !paused">
          <div>
            <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }} · Ders {{ current.sequence }}</p>
            <h2 id="current-title" class="type-title text-ink">{{ current.title }}</h2>
            <p v-if="current.tagline" class="type-body text-ink-soft mt-1">{{ current.tagline }}</p>
            <p class="text-ink-soft mt-2 flex items-center gap-1 type-small">
              <Clock :size="16" aria-hidden="true" /> Yaklaşık {{ current.estimated_minutes }} dakika
            </p>
          </div>
          <BaseButton as="router-link" :to="`/ders/${current.id}`" size="lg" class="self-start">
            {{ current.in_progress ? 'Kaldığın yerden devam et' : 'Derse başla' }}
          </BaseButton>
        </template>
        <template v-else-if="paused">
          <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }}</p>
          <h2 id="current-title" class="type-section text-ink">Programın şu an duraklatıldı</h2>
          <p class="type-body text-ink-soft">Öğretmenin programı yeniden açınca kaldığın yerden devam edeceksin. Bitirdiğin dersleri haritadan tekrar oynayabilirsin.</p>
        </template>
        <template v-else>
          <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }}</p>
          <h2 id="current-title" class="type-section text-ink">Programını tamamladın!</h2>
          <p class="type-body text-ink-soft">Tüm dersleri bitirdin. İstediğin dersi haritadan tekrar oynayabilirsin.</p>
        </template>
        <ProgressBar
          :value="mainAssignment.lessons_completed"
          :max="Math.max(1, mainAssignment.lessons_total)"
          :label="`${mainAssignment.lessons_total} dersten ${mainAssignment.lessons_completed} ders tamamlandı`"
        />
      </section>
      <BaseButton as="router-link" :to="`/harita/${mainAssignment.id}`" variant="secondary" class="self-start">Haritamı aç</BaseButton>

      <UpcomingLessons :key="mainAssignment.id" :assignment-id="mainAssignment.id" />

      <section v-if="others.length" aria-labelledby="other-title" class="flex flex-col gap-3">
        <h2 id="other-title" class="type-section text-ink">Diğer programların</h2>
        <RouterLink
          v-for="a in others"
          :key="a.id"
          :to="`/harita/${a.id}`"
          class="surface surface-interactive rounded-card flex min-h-11 items-center justify-between gap-3 p-4"
        >
          <span class="type-task text-ink">{{ a.curriculum.name }}</span>
          <span class="text-ink-soft type-small">{{ a.lessons_completed }} / {{ a.lessons_total }}</span>
        </RouterLink>
      </section>
    </template>

    <MyTasks />

    <section aria-labelledby="pocket-title" class="flex flex-col gap-3">
      <h2 id="pocket-title" class="type-section text-ink">Şeker cebim</h2>
      <ul class="grid grid-cols-3 gap-3">
        <li>
          <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex h-full flex-col gap-1 p-3 sm:p-4">
            <p class="type-eyebrow text-ink-soft">Günlük zincir</p>
            <p class="type-display text-ink">{{ progressReady ? streak.current : '–' }}</p>
            <p class="type-small text-ink-soft flex items-center gap-1"><LuguMark :size="16" /> gün</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex h-full flex-col gap-1 p-3 sm:p-4">
            <p class="type-eyebrow text-ink-soft">Yeni kelime</p>
            <p class="type-display text-ink">{{ fmt(home.mastered_words) }}</p>
            <p class="type-small text-ink-soft">öğrendin</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex h-full flex-col gap-1 p-3 sm:p-4">
            <p class="type-eyebrow text-ink-soft">En iyi seri</p>
            <p class="type-display text-ink">{{ progressReady ? streak.best : '–' }}</p>
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
  </div>
</template>
