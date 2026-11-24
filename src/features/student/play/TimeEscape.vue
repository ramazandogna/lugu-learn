<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'
import { Hourglass, Pause, Play } from 'lucide-vue-next'

import { LuguMascot, StampOption, playSound } from '@/design'
import type { CharacterKey } from '@/domain/content'
import { shuffleWith } from '@/engine/mastery'
import { TIME_BANK, createDailyRounds, createTimeBank, lastSecond, riverLevel, softPulse, vignetteAlpha, vignetteRadius } from '@/play/time-bank'

import type { TimedQ } from './types'
import { usePlayUi } from './uiContext'

/*
 * "Lavdan kaç" — a timed round for things the learner already knows. Fixed by
 * pedagogy: 10 s bank, +3 s per right answer (cap 10), a round is 60-90 s, three
 * rounds a day, no penalty when time runs out (Piko escapes, candies stay).
 * Red is edge vignette in ten steps plus one gentle tint in the last second;
 * the clock is always also a number, an hourglass and the river's height.
 * Easy mode: the clock never drains, no red. Pause is always on screen.
 */
const { questions, chase, easyDefault = false } = defineProps<{
  questions: readonly TimedQ[]
  chase: { chaser: 'honey-slime' | 'caramel-river'; escapee: CharacterKey }
  easyDefault?: boolean
}>()
const emit = defineEmits<{ answered: [q: TimedQ, optionIndex: number, ms: number]; finish: [r: { corrects: number; rounds: number }] }>()

const ui = usePlayUi()
const bank = createTimeBank({ easy: easyDefault })
const daily = createDailyRounds()
const st = bank.state

const easy = ref(easyDefault || daily.suggestEasy())
const suggested = daily.suggestEasy()
const breakCard = ref(!daily.canStart())
const rounds = ref(0)
const totalCorrect = ref(0)

const deck = ref<TimedQ[]>([])
const qi = ref(0)
const picked = ref<number | null>(null)
const bonus = ref(0)
let shownAt = Date.now()
let advance: ReturnType<typeof setTimeout> | undefined

const q = computed(() => deck.value[qi.value % Math.max(1, deck.value.length)])
const running = computed(() => st.status === 'run' || st.status === 'paused')
const ended = computed(() => st.status === 'end-win' || st.status === 'end-time')
const red = computed(() => running.value && !st.easy)
const alpha = computed(() => (red.value ? vignetteAlpha(st.tier) : 0))
const radius = computed(() => vignetteRadius(st.tier))
const tint = computed(() => red.value && st.status === 'run' && lastSecond(st.seconds))
const edgePulse = computed(() => red.value && st.status === 'run' && softPulse(st.tier) && !tint.value)
const river = computed(() => (st.easy ? 12 : 10 + (1 - riverLevel(st.seconds)) * 45))
const roundShare = computed(() => Math.min(1, st.elapsedMs / (TIME_BANK.roundSeconds * 1000)))

function start() {
  clearTimeout(advance)
  deck.value = shuffleWith(questions, Math.random)
  qi.value = 0
  picked.value = null
  shownAt = Date.now()
  breakCard.value = false
  bank.setEasy(easy.value)
  bank.start()
}

let raf = 0
let last = 0
function loop(t: number) {
  if (last) bank.tick(Math.min(250, t - last))
  last = t
  if (bank.state.status === 'run') raf = requestAnimationFrame(loop)
}
watch(
  () => st.status,
  (s, prev) => {
    cancelAnimationFrame(raf)
    last = 0
    if (s === 'run') raf = requestAnimationFrame(loop)
    if (ui) ui.timed.value = s === 'run' || s === 'paused'
    if ((s === 'end-win' || s === 'end-time') && prev === 'run') {
      daily.recordRound(s)
      rounds.value++
      totalCorrect.value += st.corrects
      clearTimeout(advance)
    }
  },
)
const hide = () => document.visibilityState === 'hidden' && bank.pause()
onMounted(() => document.addEventListener('visibilitychange', hide))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', hide)
  cancelAnimationFrame(raf)
  clearTimeout(advance)
  if (ui) ui.timed.value = false
})

function pick(i: number | null) {
  const cur = q.value
  if (i === null || picked.value !== null || !cur || st.status !== 'run') return
  picked.value = i
  emit('answered', cur, i, Date.now() - shownAt)
  const ok = i === cur.answer
  if (ok) {
    bank.correct()
    bonus.value++
    playSound('pop')
  }
  advance = setTimeout(() => {
    qi.value++
    picked.value = null
    shownAt = Date.now()
  }, ok ? 650 : 1200)
}
const resultOf = (i: number): 'correct' | 'wrong' | 'dim' | undefined => {
  if (picked.value === null || !q.value) return undefined
  return i === q.value.answer ? 'correct' : i === picked.value ? 'wrong' : 'dim'
}
const done = () => emit('finish', { corrects: totalCorrect.value, rounds: rounds.value })
</script>

<template>
  <section class="relative flex flex-col gap-4" aria-label="Lavdan kaç">
    <!-- red edge + one gentle tint, never over the question card -->
    <div v-if="alpha > 0" class="vignette pointer-events-none fixed inset-0" :class="edgePulse ? 'animate-edge' : ''" :style="{ '--a': `${alpha * 100}%`, '--r': `${radius}%` }" aria-hidden="true" />
    <div v-if="tint" class="tint animate-tint pointer-events-none fixed inset-0" aria-hidden="true" />

    <div class="stage surface rounded-shell relative isolate flex min-h-[30rem] flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <!-- the river rises as time falls -->
      <div class="river absolute inset-x-0 bottom-0 -z-10" :class="st.tier <= 3 && !st.easy ? 'is-hot' : ''" :style="{ height: `${river}%` }" aria-hidden="true">
        <span v-if="chase.chaser === 'honey-slime'" class="slime"></span>
      </div>

      <template v-if="breakCard">
        <div class="surface rounded-card m-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
          <LuguMascot :character="chase.escapee" expression="resting" :size="88" />
          <p class="type-section text-ink">Bugün 3 tur oynadın, harika!</p>
          <p class="type-body text-ink-soft">Biraz mola ver, göz dinlendir. İstersen yine de bir tur oynayabilirsin.</p>
          <div class="flex flex-wrap justify-center gap-2">
            <BaseButton size="lg" @click="done">Tamam, bitir</BaseButton>
            <BaseButton variant="quiet" @click="start">Yine de bir tur</BaseButton>
          </div>
        </div>
      </template>

      <template v-else-if="st.status === 'ready'">
        <div class="surface rounded-card m-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
          <LuguMascot :character="chase.escapee" expression="encouraging" :size="88" animated />
          <p class="type-section text-ink">Piko'yu {{ chase.chaser === 'honey-slime' ? 'bal canavarından' : 'karamel nehrinden' }} kaçır!</p>
          <p class="type-body text-ink">Bildiğin şeyleri hızlı hatırla. Doğru cevap +3 saniye kazandırır. Süre dolsa da kaybetmezsin, şekerlerin kalır.</p>
          <BaseButton :pressed="easy" variant="secondary" @click="easy = !easy">
            Kolay mod: {{ easy ? 'açık' : 'kapalı' }}
          </BaseButton>
          <p class="type-small text-ink-soft">Kolay modda süre akmaz ve ekran kızarmaz. Ödül aynı.</p>
          <p v-if="suggested && !easy" class="type-small text-ink" role="status">Son turlar zordu. İstersen kolay modu aç.</p>
          <BaseButton size="lg" @click="start">Başla</BaseButton>
        </div>
      </template>

      <template v-else-if="running && q">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="type-section text-ink flex items-center gap-2 tabular-nums">
            <Hourglass :size="24" aria-hidden="true" />
            <span>{{ st.easy ? 'Kolay mod' : st.label }}</span>
          </p>
          <p v-if="!st.easy" class="type-small text-ink font-bold">Kademe {{ st.tier }} / 10</p>
          <BaseButton variant="secondary" :aria-label="st.status === 'paused' ? 'Devam et' : 'Duraklat'" @click="st.status === 'paused' ? bank.resume() : bank.pause()">
            <Play v-if="st.status === 'paused'" :size="20" aria-hidden="true" />
            <Pause v-else :size="20" aria-hidden="true" />
            {{ st.status === 'paused' ? 'Devam' : 'Duraklat' }}
          </BaseButton>
        </div>
        <ProgressBar
          :value="st.easy ? roundShare * 100 : st.seconds"
          :max="st.easy ? 100 : TIME_BANK.cap"
          size="sm"
          :label="st.easy ? 'Tur ilerlemesi' : st.label"
        />
        <div class="flex items-center gap-3">
          <LuguMascot :character="chase.escapee" :expression="st.tier <= 3 && !st.easy ? 'encouraging' : 'happy'" :size="64" />
          <p :key="bonus" class="type-small text-ink font-bold" :class="bonus ? 'animate-stamp' : ''">Doğru: {{ st.corrects }} <span v-if="bonus">· +3 sn</span></p>
        </div>

        <div class="card surface rounded-card flex flex-col gap-4 p-4 shadow-(--shadow-raised) sm:p-6" :class="st.status === 'paused' ? 'blur-sm' : ''" :aria-hidden="st.status === 'paused'">
          <p class="type-title text-ink" :lang="q.lang?.prompt">{{ q.prompt }}</p>
          <fieldset class="m-0 grid min-w-0 gap-3 border-0 p-0 sm:grid-cols-2">
            <legend class="sr-only">{{ q.prompt }}</legend>
            <StampOption
              v-for="(o, i) in q.options"
              :key="`${qi}-${i}`"
              :model-value="picked"
              :name="`te-${qi}`"
              :value="i"
              :disabled="st.status === 'paused'"
              :result="resultOf(i)"
              @update:model-value="pick"
            >
              <span :lang="q.lang?.option">{{ o }}</span>
            </StampOption>
          </fieldset>
        </div>
        <div v-if="st.status === 'paused'" class="absolute inset-0 grid place-items-center">
          <div class="surface rounded-card flex flex-col items-center gap-3 p-6 text-center shadow-(--shadow-overlay)">
            <p class="type-section text-ink">Duraklatıldı</p>
            <p class="type-body text-ink-soft">Süre durdu. Hazır olunca devam et.</p>
            <BaseButton size="lg" @click="bank.resume()">Devam et</BaseButton>
          </div>
        </div>
      </template>

      <template v-else-if="ended">
        <div class="surface rounded-card m-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
          <LuguMascot :character="chase.escapee" :expression="st.status === 'end-win' ? 'celebrating' : 'encouraging'" :size="88" animated />
          <p class="type-section text-ink">{{ st.status === 'end-win' ? 'Turu bitirdin, Piko kurtuldu!' : 'Piko kaçtı, sen de çok iyiydin!' }}</p>
          <p class="type-display text-ink">{{ st.corrects }}</p>
          <p class="type-body text-ink">tane şekeri hızlıca hatırladın. Şekerlerin hepsi duruyor.</p>
          <div class="flex flex-wrap justify-center gap-2">
            <BaseButton size="lg" @click="done">Bitir</BaseButton>
            <BaseButton v-if="daily.canStart()" variant="secondary" @click="start">Bir tur daha</BaseButton>
            <p v-else class="type-small text-ink-soft">Bugünlük 3 tur tamam. Yarın yine bekleriz.</p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.vignette {
  z-index: var(--z-vignette);
  background: radial-gradient(ellipse at center, transparent var(--r), color-mix(in oklab, var(--color-negative) var(--a), transparent) 100%);
}
.tint {
  z-index: var(--z-vignette);
  background: color-mix(in oklab, var(--color-negative) 35%, transparent);
}
.animate-tint {
  animation: tint-pulse var(--duration-celebrate, 900ms) ease-in-out 1 both;
}
.animate-edge {
  animation: edge-pulse 1000ms ease-in-out infinite;
}
@keyframes tint-pulse {
  50% {
    opacity: 0.6;
  }
}
@keyframes edge-pulse {
  50% {
    opacity: 0.8;
  }
}
.river {
  background: linear-gradient(to top, color-mix(in oklab, var(--color-warning) 75%, var(--color-accent)), color-mix(in oklab, var(--color-warning) 35%, transparent));
  border-top-left-radius: var(--radius-card);
  border-top-right-radius: var(--radius-card);
  transition: height 900ms linear;
}
.river.is-hot {
  background: linear-gradient(to top, color-mix(in oklab, var(--color-negative) 55%, var(--color-warning)), color-mix(in oklab, var(--color-negative) 20%, transparent));
}
.slime {
  position: absolute;
  inset-inline-start: 12%;
  top: -14px;
  width: 44px;
  height: 28px;
  border-radius: 50% 50% 40% 40%;
  background: color-mix(in oklab, var(--color-warning) 85%, var(--color-ink));
}
.card {
  background-color: var(--color-surface);
}
@media (prefers-reduced-motion: reduce) {
  .river {
    transition: none;
  }
}
</style>
