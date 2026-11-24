<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'
import { ArrowLeft, ArrowRight, Smile } from 'lucide-vue-next'

import { LuguMascot, playSound } from '@/design'
import type { CharacterKey } from '@/domain/content'
import { createScrollStory, createStepInput, type StepDir } from '@/play/scroll-story'

import SpeakButton from './SpeakButton.vue'
import type { StoryStepView } from './types'

/*
 * "Kaydır-anlat" (scroll-story). The stage is pinned: the page does not move,
 * the story does. A tap on the big button, the wheel, a swipe or the arrow /
 * space keys go one step (one flick = one step). Each step is one big line
 * whose words appear one by one with the key word underlined; Piko stands by
 * it. A step with a `gate` waits for the parent to open it (slot `gate`).
 * Nothing advances by itself.
 */
const { steps, character, startIndex = 0, lastLabel = 'Bitir', label = 'Anlatı', presolved = [] } = defineProps<{
  steps: readonly StoryStepView[]
  character: CharacterKey
  startIndex?: number
  lastLabel?: string
  label?: string
  /** Gate ids already answered (a resumed lesson): those steps open freely. */
  presolved?: readonly string[]
}>()
const emit = defineEmits<{ step: [index: number, dir: StepDir]; finish: [] }>()

const story = createScrollStory(steps.map((s, i) => ({ gate: i < startIndex || (s.gate && presolved.includes(s.gate)) ? undefined : s.gate })))
for (let i = 0; i < startIndex; i++) story.next()
const st = story.state

const cur = computed(() => steps[st.index]!)
const isLast = computed(() => st.index >= steps.length - 1)
const open = computed(() => story.canAdvance() || st.phase === 'done')
const gated = computed(() => !!cur.value.gate)
const solved = computed(() => st.solved.includes(st.index) || (!!cur.value.gate && presolved.includes(cur.value.gate)))

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '')
const words = computed(() => cur.value.en.split(/\s+/).filter(Boolean))
const stress = computed(() => new Set((cur.value.emphasis ?? []).flatMap((e) => e.split(/\s+/).map(norm)).filter(Boolean)))
const after = computed(() => words.value.length + 1)

function forward() {
  if (!open.value) return
  playSound('whoosh')
  if (isLast.value) {
    story.next()
    emit('finish')
    return
  }
  if (story.next()) emit('step', st.index, 'next')
}
function back() {
  if (story.prev()) {
    playSound('whoosh')
    emit('step', st.index, 'prev')
  }
}
const input = createStepInput((dir) => (dir === 'next' ? forward() : back()))

const stage = useTemplateRef<HTMLElement>('stage')
function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
  const t = e.target as HTMLElement | null
  if (t && t !== document.body && t !== stage.value && (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName) || t.isContentEditable)) return
  if (document.querySelector('dialog[open], [role="dialog"]')) return
  if (input.key(e.key)) e.preventDefault()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

defineExpose({ index: computed(() => st.index) })
</script>

<template>
  <section ref="stage" class="stage surface rounded-shell flex flex-col gap-4 p-4 sm:p-6" :aria-label="label" aria-roledescription="sahne" tabindex="-1">
    <div class="flex items-center justify-between gap-3">
      <ProgressBar v-if="steps.length > 12" :value="st.index + 1" :max="steps.length" :label="`Adım ${st.index + 1} / ${steps.length}`" class="flex-1" />
      <ol v-else class="flex flex-wrap items-center gap-2" aria-hidden="true">
        <li
          v-for="(_, i) in steps"
          :key="i"
          class="size-3 rounded-full border-2 border-primary transition-colors"
          :class="i <= st.index ? 'bg-primary-fill' : 'bg-transparent'"
        />
      </ol>
      <p class="type-small text-ink-soft font-bold" role="status">Adım {{ st.index + 1 }} / {{ steps.length }}</p>
    </div>

    <!-- The pinned part: wheel, swipe and tap here step the story; the page does not scroll. -->
    <div
      class="pin flex min-h-64 flex-col items-center justify-center gap-4 text-center select-none sm:min-h-80"
      @wheel.prevent="input.wheel($event.deltaY)"
      @touchstart.passive="input.touchStart($event.touches[0]!.clientX, $event.touches[0]!.clientY)"
      @touchend.passive="input.touchEnd($event.changedTouches[0]!.clientX, $event.changedTouches[0]!.clientY)"
    >
      <LuguMascot :character="character" :expression="gated && !solved ? 'thinking' : cur.joke ? 'celebrating' : 'happy'" :size="72" animated />
      <div :key="cur.id" class="flex max-w-2xl flex-col items-center gap-3">
        <p v-if="cur.title" class="type-eyebrow text-ink-soft">{{ cur.title }}</p>
        <p :class="words.length > 14 ? 'type-title' : 'type-hero'" class="text-ink" :lang="cur.lang ?? 'en'" :aria-label="cur.en">
          <span
            v-for="(w, i) in words"
            :key="i"
            class="word animate-word"
            :class="stress.has(norm(w)) ? 'key-word text-primary font-extrabold' : ''"
            :style="{ '--i': i }"
            aria-hidden="true"
            >{{ w }}</span
          >
        </p>
        <p v-if="cur.tr" class="type-task text-ink-soft animate-word" :style="{ '--i': after }">{{ cur.tr }}</p>
        <p v-if="cur.joke" class="bg-wash rounded-tile type-body text-ink animate-word flex max-w-xl items-start gap-2 p-3 text-start" :style="{ '--i': after + 2 }">
          <Smile :size="20" class="text-accent-ink mt-1 shrink-0" aria-hidden="true" />
          <span>{{ cur.joke.tr }}</span>
        </p>
        <SpeakButton v-if="cur.lang !== 'tr'" :text="cur.en" label="Dinle" />
      </div>
      <p v-if="st.index === 0" class="type-small text-ink-soft">Dokun, kaydır ya da ok tuşuna bas: hikâye ilerler.</p>
    </div>

    <div v-if="cur.gate" class="flex flex-col gap-3">
      <slot name="gate" :step="cur" :pass="story.answerGate" :solved="solved" />
    </div>

    <nav class="flex flex-wrap items-center justify-between gap-2" aria-label="Adımlar">
      <BaseButton variant="secondary" :disabled="st.index === 0 && st.phase === 'step'" @click="back"><ArrowLeft :size="20" aria-hidden="true" /> Önceki</BaseButton>
      <p v-if="!open" class="type-small text-ink-soft">Devam etmek için soruyu cevapla.</p>
      <BaseButton size="lg" :disabled="!open" @click="forward">
        {{ isLast ? lastLabel : 'İleri' }} <ArrowRight v-if="!isLast" :size="20" aria-hidden="true" />
      </BaseButton>
    </nav>
  </section>
</template>

<style scoped>
.stage {
  background-image: radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--color-primary-fill) 9%, transparent), transparent 70%);
}
.pin {
  touch-action: none;
  overscroll-behavior: contain;
}
.word {
  display: inline-block;
  margin-inline-end: 0.28em;
}
.animate-word {
  animation: story-word var(--duration-slow) var(--ease-pop) both;
  animation-delay: calc(var(--i, 0) * var(--stagger, 60ms));
}
.key-word {
  background-image: linear-gradient(transparent 62%, color-mix(in oklab, var(--color-star) 60%, transparent) 62%);
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
}
@keyframes story-word {
  from {
    opacity: 0;
    transform: translateY(0.5em) scale(0.85);
  }
}
</style>
