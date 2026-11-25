<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'
import { CircleCheck, Hand, Lightbulb, Star } from 'lucide-vue-next'

import { CandyButton, HintBubble, LuguMascot, TapBeacon, playSound, useReducedMotion } from '@/design'
import type { CharacterKey, TapGuideSlots } from '@/domain/content'
import { createGoNoGo, createGuide, createHintBudget, type GoFeedback, type GoNoGoRound } from '@/play/tap-guide'
import { dayKey, safeStorage } from '@/play/storage'

import SpeakButton from './SpeakButton.vue'
import type { GuideView } from './types'

/*
 * "Bana tıkla" + "bunu görürsen tıkla / sakın tıklama". Part 1: one glowing
 * candy at a time; tapping it opens a hint ladder (fine, then big) — never the
 * answer, no penalty, a small star when none was needed. Part 2 (when the
 * lesson has it): a warm-up with no clock, then a slow candy belt. A wrong tap
 * costs nothing; Piko reacts kindly and goes quiet after three.
 */
type GoSlots = NonNullable<TapGuideSlots['goNoGo']>

const { guides, goNoGo, hintBudget, character } = defineProps<{
  guides: readonly GuideView[]
  goNoGo?: GoSlots | undefined
  hintBudget: number
  character: CharacterKey
}>()
const emit = defineEmits<{ finish: [summary: { learned: number; total: number; stars: number }] }>()

const reduced = useReducedMotion()
const budget = createHintBudget(hintBudget)
const kv = safeStorage()

/* ── part 1: guides ─────────────────────────────────────────────────── */
const gi = ref(0)
const guide = shallowRef(createGuide(budget))
const g = computed(() => guides[gi.value])
const stage = computed(() => guide.value.state.stage)
const stars = ref(0)
const noHints = ref(false)
const seenToday = ref(false)
const BEACON_KEY = (id: string) => `lugu-play:beacon:${id}:${dayKey()}`

function enterGuide() {
  guide.value = createGuide(budget)
  noHints.value = false
  const cur = g.value
  if (!cur) return
  seenToday.value = kv.getItem(BEACON_KEY(cur.id)) !== null
  kv.setItem(BEACON_KEY(cur.id), '1')
}
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  enterGuide()
  timer = setInterval(() => guide.value.tick(1000), 1000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(belt)
})

function press() {
  if (!guide.value.askHint()) {
    noHints.value = true
    return
  }
  playSound('pop')
}
function understood() {
  if (guide.value.resolve().star) stars.value++
  playSound('kutlama-kucuk')
  if (gi.value + 1 < guides.length) {
    gi.value++
    enterGuide()
  } else if (goNoGo) phase.value = 'rule'
  else finish()
}

/* ── part 2: go / no-go ─────────────────────────────────────────────── */
type Phase = 'guides' | 'rule' | 'go' | 'summary'
const phase = ref<Phase>('guides')
const round = shallowRef<GoNoGoRound | null>(null)
const ITEM_MS = 5000
let belt: ReturnType<typeof setTimeout> | undefined
const fb = ref<GoFeedback | null>(null)
const beltKey = ref(0)
const rs = computed(() => round.value?.state)
const item = computed(() => round.value?.current())
const inWarmup = computed(() => rs.value?.phase === 'warmup')
const wrongCount = ref(0)

function startGo() {
  if (!goNoGo) return
  round.value = createGoNoGo(goNoGo)
  phase.value = 'go'
  armBelt()
}
function armBelt() {
  clearTimeout(belt)
  beltKey.value++
  if (rs.value?.phase === 'round' && !reduced.value) belt = setTimeout(() => act(false), ITEM_MS)
}
function act(tapped: boolean) {
  const r = round.value
  if (!r || r.state.phase === 'done') return
  const before = r.state.wrongTaps
  if (tapped) r.tap()
  else r.pass()
  fb.value = r.state.feedback
  if (r.state.wrongTaps > before) wrongCount.value++
  playSound(fb.value?.kind === 'good' || fb.value?.kind === 'ok-skip' ? 'tik' : 'yanlis-yumusak')
  if ((r.state.phase as string) === 'done') {
    clearTimeout(belt)
    phase.value = 'summary'
  } else armBelt()
}
watch(reduced, armBelt)

const summary = computed(() => round.value?.summary() ?? { learned: 0, total: 0, wrongTaps: 0, missed: 0 })
function finish() {
  emit('finish', { learned: summary.value.learned, total: summary.value.total, stars: stars.value })
}
const fbText = computed(() => {
  const f = fb.value
  if (!f) return ''
  if (f.kind === 'good') return 'Süper! Doğru şekere dokundun.'
  if (f.kind === 'ok-skip') return 'Güzel! Buna dokunmayacaktın.'
  if (f.kind === 'wrong-tap') return `${goNoGo?.onWrongTap.line ?? 'Hapşu! Bu sefer o değil.'} ${f.why}`
  return `Bu şekere dokunacaktın: ${f.why}`
})
const sneeze = computed(() => fb.value?.kind === 'wrong-tap' && fb.value.anim)
</script>

<template>
  <section class="surface rounded-shell flex flex-col gap-4 p-4 sm:p-6" aria-label="Bana tıkla">
    <!-- part 1 -->
    <template v-if="phase === 'guides' && g">
      <ProgressBar :value="gi + 1" :max="guides.length" :label="`İpucu şekeri ${gi + 1} / ${guides.length}`" />
      <div class="flex flex-col items-center gap-4 py-2 text-center">
        <LuguMascot :character="character" :expression="stage === 'resolved' ? 'celebrating' : 'thinking'" :size="72" animated />
        <p class="type-hero text-ink" lang="en">{{ g.label }}</p>
        <p v-if="stage === 'idle' || stage === 'hint-offered'" class="type-body text-ink-soft">Merak ediyorsan şekere dokun.</p>
        <div v-if="stage !== 'resolved'" class="flex flex-col items-center gap-2">
          <TapBeacon v-if="stage !== 'big' && !seenToday" :key="g.id" label="Bana tıkla" aria-label="İpucu aç" @press="press" />
          <BaseButton v-else-if="stage !== 'big'" variant="secondary" @click="press"><Lightbulb :size="20" aria-hidden="true" /> {{ stage === 'fine' ? 'Daha büyük ipucu' : 'İpucu al' }}</BaseButton>
          <BaseButton v-if="stage === 'fine' && !seenToday && g.hint.big" variant="quiet" @click="press">Daha büyük ipucu</BaseButton>
        </div>
        <HintBubble v-if="stage === 'fine' || stage === 'big'" :level="stage === 'big' ? 2 : 1" :closable="false" class="w-full max-w-xl text-start">
          {{ stage === 'big' && g.hint.big ? g.hint.big : g.hint.fine }}
        </HintBubble>
        <p v-if="(stage === 'fine' || stage === 'big') && g.joke" class="bg-wash rounded-tile type-body text-ink max-w-xl p-3 text-start">{{ g.joke.tr }}</p>
        <SpeakButton v-if="g.label.length < 60" :text="g.label" />
        <p v-if="noHints" class="type-small text-ink-soft" role="status">İpucu hakkın bitti, ama sen yaparsın!</p>
        <p class="type-small text-ink-soft">Kalan ipucu hakkı: {{ budget.left() }}</p>
      </div>
      <CandyButton class="self-end" @click="understood">
        {{ gi + 1 < guides.length ? 'Anladım, sıradaki' : goNoGo ? 'Anladım, tura geç' : 'Anladım' }}
      </CandyButton>
      <p v-if="stars" class="type-small text-ink flex items-center gap-1"><Star :size="16" aria-hidden="true" /> İpucusuz çözdüğün: {{ stars }}</p>
    </template>

    <!-- rule card -->
    <template v-else-if="phase === 'rule' && goNoGo">
      <div class="flex flex-col items-center gap-4 py-4 text-center">
        <LuguMascot :character="character" expression="encouraging" :size="80" animated />
        <p class="type-eyebrow text-ink-soft">Dokun / dokunma turu</p>
        <p class="type-hero text-ink">{{ goNoGo.rule.tr }}</p>
        <p class="type-body text-ink-soft max-w-xl">Önce süresiz bir ısınma var. Acele yok: kuralı gören şekere dokun, görmeyene dokunma. Yanlış dokunmanın cezası yok.</p>
        <CandyButton @click="startGo">Isınmaya başla</CandyButton>
      </div>
    </template>

    <!-- go / no-go -->
    <template v-else-if="phase === 'go' && goNoGo && rs">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="type-eyebrow text-ink-soft">{{ inWarmup ? 'Isınma · süre yok' : 'Tur' }} · {{ rs.index + 1 }} / {{ inWarmup ? goNoGo.warmup.length : goNoGo.round.length }}</p>
        <p class="type-body text-ink flex items-center gap-2 font-bold"><Hand :size="20" aria-hidden="true" /> {{ goNoGo.rule.tr }}</p>
      </div>
      <div v-if="item" class="belt rounded-tile bg-wash relative flex min-h-48 items-center justify-center overflow-hidden p-4">
        <button
          :key="`${item.id}-${beltKey}`"
          type="button"
          class="candy focus-ring text-ink rounded-card border-primary bg-surface btn-press type-hero relative grid min-h-24 min-w-32 place-items-center border-4 px-6 py-4 font-extrabold"
          :class="!inWarmup && !reduced ? 'animate-belt' : ''"
          :style="{ animationDuration: `${ITEM_MS}ms` }"
          :aria-label="`${item.text}: dokun`"
          @click="act(true)"
        >
          <span lang="en">{{ item.text }}</span>
        </button>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="type-small text-ink-soft">Dokunacaksan şekere bas. Dokunmayacaksan "Geç" de.</p>
        <BaseButton variant="secondary" size="lg" @click="act(false)">Geç, dokunma</BaseButton>
      </div>
      <div class="flex min-h-14 items-center gap-3" role="status" aria-live="polite">
        <span v-if="fb" :key="wrongCount + (sneeze ? 1 : 0)" :class="sneeze ? 'animate-stamp' : ''"
          ><LuguMascot :character="character" :expression="fb.kind === 'wrong-tap' ? 'thinking' : fb.kind === 'missed' ? 'encouraging' : 'happy'" :size="56"
        /></span>
        <p v-if="fb" class="type-body text-ink flex items-start gap-2">
          <CircleCheck v-if="fb.kind === 'good' || fb.kind === 'ok-skip'" :size="20" class="text-positive mt-1 shrink-0" aria-hidden="true" />
          <Lightbulb v-else :size="20" class="text-warning-ink mt-1 shrink-0" aria-hidden="true" />
          <span>{{ fbText }}</span>
        </p>
      </div>
    </template>

    <!-- summary -->
    <template v-else-if="phase === 'summary'">
      <div class="flex flex-col items-center gap-4 py-4 text-center">
        <LuguMascot :character="character" expression="celebrating" :size="88" animated />
        <p class="type-display text-ink">{{ summary.learned }} / {{ summary.total }}</p>
        <p class="type-task text-ink">Yeni öğrenilen: {{ summary.learned }} şeker tamam.</p>
        <p v-if="summary.wrongTaps + summary.missed" class="type-body text-ink-soft">Birlikte bakacağımız {{ summary.wrongTaps + summary.missed }} şeker var, bir dahaki turda onlar da senin olur.</p>
        <CandyButton @click="finish">Devam et</CandyButton>
      </div>
    </template>
  </section>
</template>

<style scoped>
.animate-belt {
  animation: belt-slide linear both;
}
@keyframes belt-slide {
  from {
    transform: translateX(min(42vw, 14rem));
  }
  to {
    transform: translateX(max(-42vw, -14rem));
  }
}
</style>
