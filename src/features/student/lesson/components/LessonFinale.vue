<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpenText, Repeat2 } from 'lucide-vue-next'

import { CandyButton, CharacterBubble, LessonJar, LuguMascot, ProgressStars, XpBadge, characterThemeStyle, playSound } from '@/design'
import type { CharacterKey } from '@/domain/content'

import SpeakButton from '../../play/SpeakButton.vue'
import { speak, speechSupported } from '../../play/speech'

/*
 * C7 "Kavanozun Doldu": the lesson's last screen. It stays until the learner
 * chooses; nothing starts by itself. The jar holds the new words as candies
 * (tap one: the word, its meaning, its sound), three honest numbers, one
 * sentence the learner can now say, a character sticker on the jar, Piko, and
 * the way on: map (hero), repeat, a story.
 */
const {
  replay,
  words,
  bestRun,
  previousWords,
  sentence,
  character,
  stars,
  xp,
  mapTo,
  repeatTo,
} = defineProps<{
  replay: boolean
  /** The lesson's vocabulary (new words first). */
  words: readonly { id: string; en: string; tr: string }[]
  /** Longest run of right answers in this lesson. */
  bestRun: number
  /** New words of the lesson before this one; null while fewer than 3 lessons are on record. */
  previousWords: number | null
  /** One sentence from the goals ("Is he hungry?"). */
  sentence: { en: string; tr: string } | null
  character: CharacterKey
  stars: number
  xp: number
  mapTo: string
  repeatTo: string
}>()

const picked = ref<string | null>(null)
const pickedWord = computed(() => words.find((w) => w.id === picked.value) ?? null)
function tapWord(id: string, en: string) {
  picked.value = id
  playSound('pop')
  if (speechSupported()) speak(en, 'normal')
}
const compare = computed(() => {
  if (previousWords === null) return { value: 'İlk', label: 'ilk dersin' }
  const d = words.length - previousWords
  return d > 0 ? { value: `+${d}`, label: 'geçen derse göre kelime' } : { value: '=', label: 'geçen dersle aynı tempo' }
})
</script>

<template>
  <section class="fin surface rounded-shell relative flex flex-col items-center gap-5 overflow-hidden px-4 py-6 text-center sm:px-10" :data-character="character" :style="characterThemeStyle(character)" aria-labelledby="fin-title">
    <div class="relative grid place-items-center pt-2">
      <LessonJar lid="closed" :candies="Math.min(12, words.length)" :size="168" />
      <div class="fin-sticker absolute -right-12 bottom-3 rotate-6" aria-hidden="true">
        <LuguMascot :character="character" expression="celebrating" :size="72" />
      </div>
    </div>

    <div role="status">
      <h2 id="fin-title" tabindex="-1" class="type-hero text-ink outline-none">{{ replay ? 'Tekrarı tamamladın!' : 'Kavanozun doldu!' }}</h2>
      <p class="type-body text-ink-soft mx-auto mt-1 max-w-[42ch]">
        {{ replay ? 'Bildiklerini tazeledin. Harika bir tekrar oldu!' : 'Bugünkü şekerlerin hepsi kavanozda. Her biri bir kelime.' }}
      </p>
    </div>

    <ul v-if="words.length" class="flex max-w-2xl flex-wrap justify-center gap-2" aria-label="Kavanozdaki kelimeler">
      <li v-for="w in words" :key="w.id">
        <button
          type="button"
          class="fin-candy focus-ring type-small text-on-accent bg-accent inline-flex min-h-11 items-center rounded-full px-4 font-bold"
          :aria-pressed="picked === w.id"
          :aria-label="`${w.en}: ${w.tr}. Dinlemek için dokun.`"
          @click="tapWord(w.id, w.en)"
        >
          <span lang="en">{{ w.en }}</span>
        </button>
      </li>
    </ul>
    <p class="type-body text-ink min-h-7" role="status" aria-live="polite">
      <template v-if="pickedWord"><span lang="en" class="font-bold">{{ pickedWord.en }}</span> = {{ pickedWord.tr }}</template>
      <template v-else-if="words.length"><span class="text-ink-soft">Bir şekere dokun, kelimeyi dinle.</span></template>
    </p>

    <ul class="grid w-full max-w-xl grid-cols-3 gap-2" aria-label="Bugünün sayıları">
      <li class="bg-wash rounded-card p-3">
        <p class="type-display text-ink tabular-nums">{{ words.length }}</p>
        <p class="type-small text-ink-soft">yeni kelime</p>
      </li>
      <li class="bg-wash rounded-card p-3">
        <p class="type-display text-ink tabular-nums">{{ bestRun }}</p>
        <p class="type-small text-ink-soft">en iyi seri</p>
      </li>
      <li class="bg-wash rounded-card p-3">
        <p class="type-display text-ink tabular-nums">{{ compare.value }}</p>
        <p class="type-small text-ink-soft">{{ compare.label }}</p>
      </li>
    </ul>

    <div class="flex flex-wrap items-center justify-center gap-3">
      <ProgressStars :value="stars" :label="`3 yıldızdan ${stars} yıldız`" size="lg" />
      <XpBadge v-if="xp" :xp="xp" :label="`${xp} XP kazandın`" />
    </div>

    <div v-if="sentence" class="surface rounded-card border-hair flex max-w-xl flex-col items-center gap-1 border p-4">
      <p class="type-eyebrow text-ink-soft">Artık şunu diyebilirsin:</p>
      <p class="type-title text-ink" lang="en">“{{ sentence.en }}”</p>
      <p class="type-small text-ink-soft">{{ sentence.tr }}</p>
      <SpeakButton :text="sentence.en" label="Dinle" />
    </div>

    <CharacterBubble character="piko" size="sm">{{ replay ? 'Tazelemek de ustalıktır!' : 'Kavanoz dolu, ben çok gururluyum. Biraz dinlen, sonra yeni bir şeker bulalım.' }}</CharacterBubble>

    <div class="flex w-full max-w-sm flex-col items-center gap-3">
      <CandyButton variant="wrapper" as="router-link" :to="mapTo" block>Haritaya dön</CandyButton>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <CandyButton variant="drop" as="router-link" :to="repeatTo"><Repeat2 :size="20" aria-hidden="true" /> Dersi tekrar et</CandyButton>
        <CandyButton variant="drop" as="router-link" to="/kesfet"><BookOpenText :size="20" aria-hidden="true" /> Bir hikâye oyna</CandyButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fin-sticker {
  animation: fin-stick var(--duration-slower) var(--ease-pop) 500ms both;
}
@keyframes fin-stick {
  from {
    transform: scale(1.8) rotate(-14deg);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fin-sticker {
    animation: none;
  }
}
</style>
