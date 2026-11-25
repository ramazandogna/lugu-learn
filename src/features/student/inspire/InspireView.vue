<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Award, Check, Sticker } from 'lucide-vue-next'

import { AmbientLayer, CandyButton, LuguMascot, SoundToggle, armSound, playSound, useReducedMotion } from '@/design'

import { useStudentHome } from '../useStudentHome'
import { GLYPHS } from './glyphs'
import StoryPlayer from './StoryPlayer.vue'
import { STORIES } from './stories'
import { BADGE_NAME, useStories } from './useStories'
import { WORLDS } from './worlds'

/*
 * Hikâye Rafı (wow-pass B): 8 kavanoz = 8 hikâye. Çocuk İngilizce bilen bir
 * karakterin yerine geçer, seçer, sonucu görür. Kilit yok, para/süre yok;
 * hatıra şekeri hikâyeyi sonuna kadar oynamanın karşılığı, kaynağı hep görünür.
 */
const route = useRoute()
const reduced = useReducedMotion()
const { mainAssignment } = useStudentHome()
const { progress, restart, doneCount, resumable, badge } = useStories()

const openId = ref<string | null>(null)
/** Where the player starts: resume the saved frame, or begin again if it was finished. */
const start = ref<{ frame: number; picks: Record<string, string> }>({ frame: 0, picks: {} })

const items = computed(() =>
  STORIES.map((s) => ({ story: s, world: WORLDS.find((w) => w.id === s.worldId)!, p: progress(s.id) })),
)
const suggested = computed(() => items.value.find((i) => !i.p?.done)?.story.id)
const current = computed(() => items.value.find((i) => i.story.id === openId.value))
const nextItem = computed(() => {
  const i = items.value.findIndex((x) => x.story.id === openId.value)
  if (i < 0) return undefined
  const rest = [...items.value.slice(i + 1), ...items.value.slice(0, i)]
  return rest.find((x) => !x.p?.done) ?? rest[0]
})
const lessonId = computed(() => mainAssignment.value?.current_lesson?.id ?? null)
const shade = (t: string) => `color-mix(in oklab, ${t} 78%, var(--color-ink))`

function open(id: string) {
  const p = progress(id)
  if (p && !p.done && p.frame > 0) start.value = { frame: p.frame, picks: p.picks }
  else {
    if (p) restart(STORIES.find((s) => s.id === id)!)
    start.value = { frame: 0, picks: {} }
  }
  openId.value = id
  playSound('pop')
}

onMounted(() => {
  armSound()
  const w = typeof route.query.dunya === 'string' ? route.query.dunya : null
  const s = STORIES.find((x) => x.worldId === w)
  if (s) open(s.id)
})
</script>

<template>
  <div class="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <AmbientLayer kind="candy" :count="3" :active="!reduced" />

    <header class="relative flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="type-eyebrow text-ink-soft">Keşfet</p>
        <h1 class="type-hero text-ink">Piko ile Hikâyeler</h1>
        <p class="type-body text-ink-soft mt-1">Bir kavanoz seç, hikâyeye gir. İngilizceyi sen kullan, sonucu gör.</p>
      </div>
      <SoundToggle />
    </header>

    <!-- Picks up where you left -->
    <section v-if="resumable" class="surface rounded-card relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center" aria-labelledby="resume-title">
      <LuguMascot character="piko" expression="happy" :size="64" :animated="!reduced" />
      <div class="min-w-0 flex-1">
        <p class="type-eyebrow text-ink-soft">Kaldığın hikâye</p>
        <h2 id="resume-title" class="type-title text-ink">{{ resumable.title.tr }}</h2>
        <p class="type-small text-ink-soft">{{ progress(resumable.id)!.frame + 1 }}. kareden devam edeceksin.</p>
      </div>
      <CandyButton @click="open(resumable.id)">Devam et</CandyButton>
    </section>

    <section aria-labelledby="shelf-title" class="relative flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="shelf-title" class="type-section text-ink">8 hikâye seni bekliyor</h2>
        <p class="type-small text-ink-soft" aria-live="polite">Hatıra şekerlerin: {{ doneCount }} / {{ STORIES.length }}</p>
      </div>
      <ul class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <li v-for="{ story, world, p } in items" :key="story.id" class="relative">
          <button
            type="button"
            class="jar surface focus-ring rounded-card flex h-full w-full flex-col items-center gap-2 p-4 text-center"
            @click="open(story.id)"
          >
            <span class="relative grid size-24 place-items-center" aria-hidden="true">
              <svg viewBox="0 0 96 96" class="absolute inset-0 size-full" focusable="false">
                <rect x="28" y="6" width="40" height="12" rx="6" :fill="p?.done ? 'var(--color-positive)' : 'var(--color-ink-soft)'" />
                <path d="M30 18h36v8c14 4 22 14 22 30v20a14 14 0 0 1-14 14H22a14 14 0 0 1-14-14V56c0-16 8-26 22-30z" :fill="shade(world.tint)" />
                <path d="M22 50q2-12 12-16" fill="none" stroke="var(--color-surface)" stroke-width="4" stroke-linecap="round" opacity="0.6" />
              </svg>
              <component :is="p?.done ? GLYPHS[story.souvenir.glyph] : world.icon" :size="32" :stroke-width="2.2" class="text-surface relative mt-4" />
            </span>
            <span class="type-task text-ink">{{ story.title.tr }}</span>
            <span class="type-small text-ink-soft">{{ world.hook }}</span>
            <span class="flex items-center gap-1.5" :aria-label="`${story.frames.length} karenin ${p?.done ? story.frames.length : (p?.frame ?? 0)} tanesi`">
              <i
                v-for="n in story.frames.length"
                :key="n"
                class="size-2.5 rounded-full border-2 border-ink"
                :class="n <= (p?.done ? story.frames.length : (p?.frame ?? 0)) ? 'bg-primary-fill' : 'bg-transparent'"
              />
            </span>
            <span v-if="p?.done" class="type-small text-ink flex items-center gap-1 font-bold">
              <Check :size="16" :stroke-width="2.4" aria-hidden="true" /> Mühürlü
              <template v-if="story.endings > 1 && p.endingsSeen.length < story.endings"> · Başka bir son var</template>
            </span>
          </button>
          <span v-if="suggested === story.id && !p?.done" class="pointer-events-none absolute -top-3 end-3">
            <span class="animate-pulse-ring bg-star/50 rounded-control absolute inset-0" aria-hidden="true" />
            <span class="bg-star text-on-star type-small rounded-control relative block px-2 py-0.5 font-extrabold">Bunu dene</span>
          </span>
        </li>
      </ul>
    </section>

    <!-- Collection -->
    <section class="surface rounded-card relative flex flex-col gap-3 p-4" aria-labelledby="coll-title">
      <h2 id="coll-title" class="type-section text-ink">Hatıra şekerlerin</h2>
      <ul class="flex flex-wrap gap-3">
        <li v-for="{ story, p } in items" :key="story.id" class="flex w-16 flex-col items-center gap-1 text-center">
          <span
            class="grid size-12 place-items-center rounded-full border-2"
            :class="p?.done ? 'border-ink bg-primary-fill text-on-primary' : 'border-ink-soft border-dashed text-ink-soft'"
          >
            <component :is="p?.done ? GLYPHS[story.souvenir.glyph] : Sticker" :size="22" :stroke-width="2.2" aria-hidden="true" />
          </span>
          <span class="type-small text-ink-soft leading-tight">{{ p?.done ? story.souvenir.name.replace(' şekeri', '') : 'Boş' }}</span>
        </li>
      </ul>
      <p class="type-body flex items-center gap-2" :class="badge ? 'text-ink font-bold' : 'text-ink-soft'">
        <Award :size="22" aria-hidden="true" />
        <template v-if="badge">Rafı tamamladın = "{{ BADGE_NAME }}" rozeti.</template>
        <template v-else>8 hikâyeyi sonuna kadar oyna = "{{ BADGE_NAME }}" rozeti. Şu an {{ doneCount }} / 8.</template>
      </p>
    </section>

    <StoryPlayer
      v-if="current"
      :key="current.story.id"
      :story="current.story"
      :world="current.world"
      :start-frame="start.frame"
      :start-picks="start.picks"
      :next-world="nextItem?.world"
      :next-story-id="nextItem?.story.id"
      :imagine-to="current.story.id === 'zipi-tanit' && lessonId ? `/hayal/${lessonId}` : undefined"
      @close="openId = null"
      @open="open"
    />
  </div>
</template>

<style scoped>
.jar {
  transition:
    translate var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
@media (hover: hover) {
  .jar:hover {
    translate: 0 -4px;
    box-shadow: var(--shadow-raised);
  }
}
.jar:active {
  scale: var(--press-scale);
}
@media (prefers-reduced-motion: reduce) {
  .jar {
    transition: none;
  }
}
</style>
