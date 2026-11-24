<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton } from 'rei-kit'
import { ArrowLeft, Check, Sparkles, Volume2 } from 'lucide-vue-next'

import { AmbientLayer, LuguMascot, SoundToggle, armSound, playSound, useReducedMotion } from '@/design'

import { useStudentHome } from '../useStudentHome'
import { canSpeak, speak, stopSpeaking } from './speech'
import { WORLDS, fillLine, markOpened, openedWorlds, type World } from './worlds'

/*
 * "İngilizce ile neler yapabilirsin?" - Dünya Kavanozları (design-bible F8).
 * 8 jars, one silhouette, no locks, no rewards. Open one and tap: each tap
 * reveals one line, word by word. Every scene is a simulation; nobody real is
 * on the other side.
 */
const route = useRoute()
const reduced = useReducedMotion()
const { mainAssignment } = useStudentHome()

const opened = ref<string[]>([])
const world = ref<World | null>(null)
const shown = ref(0)
/** Chosen option per step index; any option is fine. */
const picks = ref<Record<number, string>>({})
const slow = ref(false)

const steps = computed(() => world.value?.steps ?? [])
const current = computed(() => steps.value[shown.value - 1])
const needsPick = computed(() => !!current.value?.pick && !picks.value[shown.value - 1])
const finished = computed(() => !!world.value && shown.value >= steps.value.length && !needsPick.value)
const lessonId = computed(() => mainAssignment.value?.current_lesson?.id ?? null)

/** A darker mix of the jar colour, so white marks on it stay readable. */
const shade = (t: string) => `color-mix(in oklab, ${t} 78%, var(--color-ink))`
const lineAt = (i: number) => fillLine(steps.value[i]?.en ?? '', picks.value[i] ?? null)
const trAt = (i: number) => (steps.value[i]?.tr ?? '').replace('___', '…')
const words = (s: string) => s.split(' ')

function open(w: World) {
  world.value = w
  shown.value = 0
  picks.value = {}
  opened.value = markOpened(w.id)
  playSound('pop')
  next()
}

function next() {
  if (!world.value || needsPick.value || shown.value >= steps.value.length) return
  shown.value += 1
  playSound('tik')
  if (!steps.value[shown.value - 1]?.pick) say(shown.value - 1)
}

function pick(option: string) {
  picks.value = { ...picks.value, [shown.value - 1]: option }
  playSound('dogru')
  say(shown.value - 1)
  if (shown.value >= steps.value.length) playSound('kutlama-kucuk')
}

function say(i: number) {
  speak(lineAt(i), slow.value)
}

function back() {
  stopSpeaking()
  world.value = null
  playSound('whoosh')
}

onMounted(() => {
  armSound()
  opened.value = openedWorlds()
  const q = route.query.dunya
  const w = WORLDS.find((x) => x.id === q)
  if (w) open(w)
})
onBeforeUnmount(stopSpeaking)
</script>

<template>
  <div class="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <AmbientLayer v-if="!world" kind="candy" :count="3" :active="!reduced" />

    <header class="relative flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="type-eyebrow text-ink-soft">Keşfet</p>
        <h1 class="type-hero text-ink">İngilizce ile neler yapabilirsin?</h1>
        <p v-if="!world" class="type-body text-ink-soft mt-1">Bir kavanoz seç, dokun, İngilizce senin için açılsın.</p>
      </div>
      <SoundToggle />
    </header>

    <!-- Hub: eight jars, none locked -->
    <section v-if="!world" aria-labelledby="hub-title" class="relative flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="hub-title" class="type-section text-ink">8 dünya seni bekliyor</h2>
        <p class="type-small text-ink-soft" aria-live="polite">Açtığın dünyalar: {{ opened.length }} / {{ WORLDS.length }}</p>
      </div>
      <ul class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <li v-for="w in WORLDS" :key="w.id">
          <button
            type="button"
            class="jar surface focus-ring rounded-card flex h-full w-full flex-col items-center gap-2 p-4 text-center"
            @click="open(w)"
          >
            <span class="relative grid size-24 place-items-center" aria-hidden="true">
              <svg viewBox="0 0 96 96" class="absolute inset-0 size-full" focusable="false">
                <rect x="28" y="6" width="40" height="12" rx="6" fill="var(--color-ink-soft)" />
                <path d="M30 18h36v8c14 4 22 14 22 30v20a14 14 0 0 1-14 14H22a14 14 0 0 1-14-14V56c0-16 8-26 22-30z" :fill="shade(w.tint)" />
                <path d="M22 50q2-12 12-16" fill="none" stroke="var(--color-surface)" stroke-width="4" stroke-linecap="round" opacity="0.6" />
              </svg>
              <component :is="w.icon" :size="32" :stroke-width="2.2" class="text-surface relative mt-4" />
            </span>
            <span class="type-task text-ink">{{ w.title }}</span>
            <span class="type-small text-ink-soft">{{ w.hook }}</span>
            <span v-if="opened.includes(w.id)" class="type-small text-ink flex items-center gap-1 font-bold">
              <Check :size="16" :stroke-width="2.4" aria-hidden="true" /> Açtın
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- A world -->
    <section v-else class="surface rounded-shell relative flex flex-col gap-6 p-4 sm:p-6" :aria-labelledby="`w-${world.id}`">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <button type="button" class="focus-ring text-primary rounded-control flex min-h-11 items-center gap-2 font-bold" @click="back">
          <ArrowLeft :size="20" :stroke-width="2.2" aria-hidden="true" /> Dünyalara dön
        </button>
        <label v-if="canSpeak()" class="type-small text-ink flex min-h-11 cursor-pointer items-center gap-2">
          <input v-model="slow" type="checkbox" class="size-5" /> Yavaş oku
        </label>
      </div>

      <div class="flex items-center gap-4">
        <span class="animate-bob rounded-card text-surface grid size-20 shrink-0 place-items-center" :style="{ background: shade(world.tint) }" aria-hidden="true">
          <component :is="world.icon" :size="40" :stroke-width="2" />
        </span>
        <div class="min-w-0">
          <h2 :id="`w-${world.id}`" class="type-title text-ink">{{ world.title }}</h2>
          <p class="type-body text-ink-soft">{{ world.hook }}</p>
        </div>
      </div>

      <p v-if="world.note" class="type-body text-ink bg-wash rounded-tile p-3" role="note">
        <Sparkles :size="16" class="mr-1 inline" aria-hidden="true" />{{ world.note }}
      </p>

      <ol class="flex flex-col gap-4" aria-live="polite">
        <li v-for="(_, i) in shown" :key="i" class="flex flex-col gap-1">
          <div class="flex items-start gap-2">
            <p
              :key="`${i}-${picks[i] ?? ''}`"
              lang="en"
              class="min-w-0 flex-1 text-wrap"
              :class="i === shown - 1 ? 'type-hero text-ink' : 'type-task text-ink-soft'"
            >
              <span
                v-for="(word, k) in words(lineAt(i))"
                :key="k"
                class="word inline-block pe-2"
                :style="{ animationDelay: i === shown - 1 ? `calc(${k} * var(--stagger))` : '0ms' }"
              >{{ word }}</span>
            </p>
            <button
              v-if="canSpeak()"
              type="button"
              class="control focus-ring rounded-control btn-press grid size-11 shrink-0 place-items-center"
              :aria-label="`Sesli oku: ${lineAt(i)}`"
              @click="say(i)"
            >
              <Volume2 :size="20" :stroke-width="2" aria-hidden="true" />
            </button>
          </div>
          <p class="type-body text-ink-soft">{{ trAt(i) }}</p>

          <fieldset v-if="steps[i]?.pick && i === shown - 1" class="mt-2 flex flex-wrap gap-2">
            <legend class="type-small text-ink-soft mb-2">Birini seç; hepsi güzel bir cümle olur.</legend>
            <button
              v-for="o in steps[i]?.pick"
              :key="o"
              type="button"
              class="control focus-ring rounded-control btn-press type-task text-ink min-h-12 px-4"
              :class="picks[i] === o ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="picks[i] === o"
              lang="en"
              @click="pick(o)"
            >
              {{ o }}
            </button>
          </fieldset>
        </li>
      </ol>

      <BaseButton v-if="!finished" size="lg" class="self-stretch sm:self-start" :disabled="needsPick" @click="next">
        <Sparkles :size="20" aria-hidden="true" />
        {{ shown === 0 ? 'Dokun, başlayalım' : needsPick ? 'Önce bir seçenek seç' : 'Dokun: sıradaki' }}
      </BaseButton>

      <div v-else class="bg-wash rounded-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center" role="status">
        <LuguMascot character="piko" expression="happy" :size="72" :animated="!reduced" />
        <div class="min-w-0 flex-1">
          <p class="type-eyebrow text-ink-soft">Senin seviyen</p>
          <p class="type-body text-ink">Bu cümleyi şimdiden anlarsın:</p>
          <p lang="en" class="type-title text-ink">{{ world.youKnow.en }}</p>
          <p class="type-body text-ink-soft">{{ world.youKnow.tr }}</p>
        </div>
        <button
          v-if="canSpeak()"
          type="button"
          class="control focus-ring rounded-control btn-press grid size-11 place-items-center"
          :aria-label="`Sesli oku: ${world.youKnow.en}`"
          @click="speak(world.youKnow.en, slow)"
        >
          <Volume2 :size="20" aria-hidden="true" />
        </button>
      </div>

      <div v-if="finished" class="flex flex-wrap gap-2">
        <button type="button" class="control focus-ring rounded-control btn-press type-task text-ink min-h-12 px-4" @click="back">Başka dünya aç</button>
        <BaseButton v-if="world.id === 'uretim' && lessonId" as="router-link" :to="`/hayal/${lessonId}`">Hayal kur'a geç</BaseButton>
      </div>
    </section>
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
.word {
  animation: word-in var(--duration-slow) var(--ease-sheet) both;
}
@keyframes word-in {
  from {
    opacity: 0;
    translate: 0 8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .word {
    animation: none;
  }
  .jar {
    transition: none;
  }
}
</style>
