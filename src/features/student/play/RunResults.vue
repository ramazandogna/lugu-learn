<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BaseButton } from 'rei-kit'
import { Award, RotateCcw, Sparkles, Timer } from 'lucide-vue-next'

import { LuguMascot, playSound } from '@/design'
import type { CharacterKey } from '@/domain/content'

import type { ResultsData } from './results'
import { shortDate, stepsOf } from './tr'

/*
 * End of a test ("Kavanoz Sonucu"). Only the learner's own past: the percent of
 * first tries, "7 adımın 4'ü", the best streak, the words that tangled most,
 * and this run next to the previous one and the last five (hand-drawn SVG, no
 * library). A miss is never a score here: it is "words to warm up together".
 * A drop is told forwards, never in red.
 */
const { data, labelOf, title = 'Test bitti', character, continueLabel = 'Devam et' } = defineProps<{
  data: ResultsData
  labelOf: (questionId: string) => string
  title?: string
  character: CharacterKey
  continueLabel?: string
}>()
const emit = defineEmits<{ again: []; continue: [] }>()

const cur = computed(() => data.current)
const cmp = computed(() => data.comparison)
const prev = computed(() => data.previous)

const compareLine = computed(() => {
  const p = prev.value
  const d = cmp.value.delta
  if (!p || d === null) return 'Bu senin ilk denemen. Çizgin yeni başlıyor, bir dahaki sefere geçen seferki seninle yarışırsın.'
  if (d > 0) return `Geçen seferki sen %${p.accuracy} yapmıştı. Bu sefer %${cur.value.accuracy}: ${d} puan ileridesin!`
  if (d === 0) return `Geçen seferki senle aynı yerdesin (%${p.accuracy}). Bir dahaki sefere bir adım öne geçebilirsin.`
  return `Bu sefer zor şeyler çıktı, bunları birlikte oynayalım. Geçen sefer %${p.accuracy} yapmıştın, hâlâ yanındayım.`
})
const learned = computed(() => (prev.value ? cmp.value.fixed.length : cur.value.firstTryCorrect))
const learnedLabel = computed(() => (prev.value ? 'Geçen sefer takıldığın, şimdi bildiğin' : 'İlk seferde bildiğin'))
const speed = computed(() => {
  const s = cmp.value.speedDeltaMs
  return s !== null && s < -300 ? `Geçen seferden ${(Math.abs(s) / 1000).toFixed(1)} sn daha hızlısın.` : null
})
const missedLine = computed(() => {
  const n = cur.value.missed.length
  return n === 0 ? 'Hepsini ilk seferde bildin!' : `Birlikte ısınacağımız ${n} şey var.`
})

/* chart: oldest left, newest right */
const W = 300
const H = 150
const TOP = 24
const BASE = 118
const bars = computed(() => {
  const list = data.recent
  const slot = W / Math.max(list.length, 1)
  return list.map((r, i) => {
    const h = Math.max(4, (r.accuracy / 100) * (BASE - TOP))
    const x = i * slot + slot / 2
    return { x, y: BASE - h, h, w: Math.min(44, slot - 12), acc: r.accuracy, date: shortDate(r.at), now: i === list.length - 1 }
  })
})
const line = computed(() => bars.value.map((b) => `${b.x},${b.y}`).join(' '))
const chartLabel = computed(() => `Son ${data.recent.length} denemen, eskiden yeniye: ${data.recent.map((r) => `%${r.accuracy}`).join(', ')}`)

onMounted(() => playSound(cmp.value.isBestStreak ? 'kutlama-buyuk' : 'kutlama-kucuk'))
</script>

<template>
  <section class="surface rounded-shell flex flex-col gap-6 p-4 sm:p-6" aria-labelledby="run-title">
    <header class="flex flex-wrap items-center gap-4">
      <LuguMascot :character="character" expression="celebrating" :size="80" animated />
      <div class="min-w-0 flex-1">
        <h3 id="run-title" class="type-title text-ink">{{ title }}</h3>
        <p class="type-body text-ink-soft">{{ stepsOf(cur.questions, cur.firstTryCorrect) }} ilk seferde tamam.</p>
      </div>
      <p class="type-display text-ink">%{{ cur.accuracy }}</p>
    </header>

    <dl class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-tile bg-wash p-4">
        <dt class="type-small text-ink-soft flex items-center gap-1"><Sparkles :size="16" aria-hidden="true" /> {{ learnedLabel }}</dt>
        <dd class="type-section text-ink">{{ learned }}</dd>
      </div>
      <div class="rounded-tile bg-wash p-4">
        <dt class="type-small text-ink-soft flex items-center gap-1"><Award :size="16" aria-hidden="true" /> En iyi serin</dt>
        <dd class="type-section text-ink">{{ cur.bestStreak }} üst üste</dd>
        <dd class="type-small text-ink">{{ cmp.isBestStreak ? 'Yeni rekor!' : `Rekorun: ${data.bestEver}` }}</dd>
      </div>
      <div v-if="cur.medianMs !== null" class="rounded-tile bg-wash p-4">
        <dt class="type-small text-ink-soft flex items-center gap-1"><Timer :size="16" aria-hidden="true" /> Cevap hızın</dt>
        <dd class="type-section text-ink">{{ (cur.medianMs / 1000).toFixed(1) }} sn</dd>
        <dd v-if="speed" class="type-small text-ink">{{ speed }}</dd>
      </div>
    </dl>

    <div class="flex flex-col gap-3">
      <h4 class="type-task text-ink">Geçen seferki sen</h4>
      <p class="type-body text-ink">{{ compareLine }}</p>
      <figure v-if="bars.length >= 2" class="m-0">
        <svg :viewBox="`0 0 ${W} ${H}`" class="w-full max-w-md" role="img" :aria-label="chartLabel">
          <line :x1="0" :x2="W" :y1="BASE" :y2="BASE" stroke="var(--color-hair)" stroke-width="2" />
          <polyline :points="line" fill="none" stroke="var(--color-ink-soft)" stroke-width="2" stroke-dasharray="4 4" />
          <g v-for="(b, i) in bars" :key="i">
            <rect :x="b.x - b.w / 2" :y="b.y" :width="b.w" :height="b.h" rx="6" :fill="b.now ? 'var(--color-primary-fill)' : 'var(--color-wash)'" stroke="var(--color-primary-fill)" stroke-width="2" />
            <text :x="b.x" :y="b.y - 6" text-anchor="middle" font-size="13" font-weight="700" fill="var(--color-ink)">%{{ b.acc }}</text>
            <text :x="b.x" :y="BASE + 18" text-anchor="middle" font-size="12" fill="var(--color-ink-soft)">{{ b.now ? 'Şimdi' : b.date }}</text>
          </g>
        </svg>
        <figcaption class="type-small text-ink-soft">Son {{ bars.length }} denemen. Yalnız kendi geçmişinle kıyas.</figcaption>
      </figure>
    </div>

    <div class="flex flex-col gap-2">
      <h4 class="type-task text-ink">{{ missedLine }}</h4>
      <template v-if="data.confused.length && cur.missed.length">
        <p class="type-small text-ink-soft">En çok karışanlar, birlikte oynayalım:</p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="c in data.confused" :key="c.questionId" class="rounded-tile bg-wash type-body text-ink px-3 py-2 font-bold" lang="en">{{ labelOf(c.questionId) }}</li>
        </ul>
      </template>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <BaseButton size="lg" @click="emit('continue')">{{ continueLabel }}</BaseButton>
      <BaseButton variant="secondary" @click="emit('again')"><RotateCcw :size="20" aria-hidden="true" /> Tekrar çöz</BaseButton>
    </div>
  </section>
</template>
