<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BaseButton } from 'rei-kit'
import { ArrowRight, Info, Languages, RotateCcw, X } from 'lucide-vue-next'

import { CandyButton, SoundToggle, WaxSeal, WorldBackground, playSound, useReducedMotion } from '@/design'

import SpeakButton from '../play/SpeakButton.vue'
import { GLYPHS } from './glyphs'
import { stopSpeaking } from './speech'
import { lineOf, useStories } from './useStories'
import type { Story } from './storyTypes'
import type { World } from './worlds'

/*
 * Hikâye oynatıcı (wow-pass B1). Tam ekran sheet: 5 kare, seçim hepsi geçerli,
 * zamanlayıcı yok, X her zaman görünür ve çıkınca kaldığı kare kaydolur.
 * Sesli okuma yalnız isteğe bağlı küçük buton; kendiliğinden konuşmaz.
 */
const { story, world, startFrame = 0, startPicks = {}, nextWorld, nextStoryId, imagineTo } = defineProps<{
  story: Story
  world: World
  startFrame?: number
  startPicks?: Record<string, string>
  nextWorld?: World
  nextStoryId?: string
  imagineTo?: string
}>()
const emit = defineEmits<{ close: []; open: [storyId: string] }>()

const reduced = useReducedMotion()
const { setFrame, finish, restart, progress } = useStories()

const frame = ref(startFrame)
const picks = ref<Record<string, string>>({ ...startPicks })
const selected = ref<string | null>(null)
const sealing = ref(false)
const showTr = ref(false)
const title = ref<HTMLElement | null>(null)
const cta = ref<InstanceType<typeof CandyButton> | null>(null)

const cur = computed(() => story.frames[frame.value]!)
const total = story.frames.length
const isPayoff = computed(() => cur.value.beat === 'payoff')
const spoken = computed(() => lineOf(story, cur.value, picks.value))
const speakerName = computed(() => (cur.value.speaker === 'narrator' ? 'Anlatıcı' : (story.cast.find((c) => c.id === cur.value.speaker)?.name ?? '')))
const words = computed(() => spoken.value.en.split(' '))
const shade = `color-mix(in oklab, ${world.tint} 78%, var(--color-ink))`

const seen = computed(() => progress(story.id)?.endingsSeen.length ?? 0)

function go(to: number) {
  frame.value = to
  selected.value = null
  showTr.value = false
  stopSpeaking()
  playSound('tik')
  if (story.frames[to]?.beat === 'payoff') {
    finish(story, picks.value)
    playSound('kutlama-buyuk')
  } else {
    setFrame(story, to, picks.value)
  }
}

function advance() {
  const c = cur.value.choice
  if (c) {
    if (!selected.value || sealing.value) return
    picks.value = { ...picks.value, [c.id]: selected.value }
    playSound('muhur')
    sealing.value = true
    setTimeout(
      () => {
        sealing.value = false
        go(frame.value + 1)
      },
      reduced.value ? 0 : 420,
    )
    return
  }
  go(frame.value + 1)
}

function again() {
  restart(story)
  picks.value = {}
  frame.value = 0
  selected.value = null
  playSound('whoosh')
}

function shelve() {
  cta.value?.celebrate()
  setTimeout(() => emit('close'), reduced.value ? 0 : 750)
}

function close() {
  stopSpeaking()
  emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(frame, () => title.value?.focus())
onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
  title.value?.focus()
  if (story.frames[frame.value]?.beat === 'payoff') go(frame.value)
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
  stopSpeaking()
})
</script>

<template>
  <div class="bg-canvas fixed inset-0 z-(--z-overlay) flex flex-col" role="dialog" aria-modal="true" :aria-labelledby="`st-${story.id}`" data-area="student">
    <header class="flex items-center gap-3 px-4 py-3">
      <ol class="flex min-w-0 flex-1 items-center gap-2" :aria-label="`Kare ${frame + 1} / ${total}`">
        <li
          v-for="(_, i) in total"
          :key="i"
          class="size-3.5 rounded-full border-2"
          :class="i <= frame ? 'border-ink bg-primary-fill' : 'border-ink-soft bg-transparent'"
          :aria-current="i === frame ? 'step' : undefined"
        />
      </ol>
      <SoundToggle />
      <button type="button" class="control focus-ring rounded-control btn-press grid size-11 shrink-0 place-items-center" aria-label="Hikâyeyi kapat, kaldığın yer kaydolur" @click="close">
        <X :size="22" :stroke-width="2.4" aria-hidden="true" />
      </button>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-6">
        <h2 :id="`st-${story.id}`" ref="title" tabindex="-1" class="type-eyebrow text-ink-soft focus:outline-none">
          {{ world.title }} · <span lang="en">{{ story.title.en }}</span>
        </h2>

        <p v-if="story.simulation && frame === 0" class="type-body text-ink bg-wash rounded-tile flex gap-2 p-3" role="note">
          <Info :size="20" class="mt-0.5 shrink-0" aria-hidden="true" />
          Mia gerçek biri değil; bu bir canlandırma. Kimseyle yazışmıyorsun, kişisel bilgi de vermiyorsun.
        </p>

        <!-- Scene: motif ground, cast on it -->
        <WorldBackground v-if="!isPayoff" :key="cur.scene" :motif="cur.scene" intensity="rich" :animated="!reduced" class="rounded-shell border-hair min-h-52 border">
          <div class="relative flex min-h-52 items-end justify-center gap-6 px-4 pt-6 pb-8">
            <div v-for="c in story.cast" :key="c.id" class="flex flex-col items-center gap-2" :class="cur.speaker === c.id ? 'animate-rise' : 'opacity-80'">
              <span
                class="text-surface grid place-items-center rounded-full border-4 border-ink transition-[width,height] duration-(--duration-base)"
                :class="cur.speaker === c.id ? 'size-28' : 'size-20'"
                :style="{ background: shade }"
                aria-hidden="true"
              >
                <component :is="GLYPHS[c.glyph]" :size="cur.speaker === c.id ? 52 : 36" :stroke-width="2" />
              </span>
              <span class="type-small text-ink bg-surface rounded-control px-2 py-0.5 font-bold">{{ c.name }}</span>
            </div>
          </div>
        </WorldBackground>

        <!-- Balloon -->
        <section class="surface rounded-card flex flex-col gap-2 p-4" aria-live="polite" :key="`${cur.id}-${spoken.en}`">
          <div class="flex items-center justify-between gap-2">
            <p class="type-eyebrow text-ink-soft">{{ speakerName }}</p>
            <SpeakButton v-if="spoken.en && !isPayoff" :text="spoken.en" label="Dinle" />
          </div>
          <p lang="en" class="type-hero text-ink text-wrap">
            <span
              v-for="(w, k) in words"
              :key="k"
              class="word inline-block pe-2"
              :style="{ animationDelay: `calc(${k} * var(--stagger))` }"
            >{{ w }}</span>
          </p>
          <button
            type="button"
            class="focus-ring text-primary rounded-control inline-flex min-h-11 items-center gap-2 self-start font-bold"
            :aria-expanded="showTr"
            @click="showTr = !showTr"
          >
            <Languages :size="20" aria-hidden="true" /> {{ showTr ? 'Türkçesini gizle' : 'Türkçesi' }}
          </button>
          <p v-if="showTr" class="type-body text-ink-soft">{{ spoken.tr }}</p>
        </section>

        <!-- Choice: every option is fine -->
        <fieldset v-if="cur.choice" class="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
          <legend class="type-task text-ink mb-2">{{ cur.choice.prompt.tr }}</legend>
          <p class="type-small text-ink-soft -mt-1 mb-1">Birini seç; hepsi güzel bir cevap.</p>
          <div class="grid gap-2" :class="cur.choice.options.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'">
            <button
              v-for="o in cur.choice.options"
              :key="o.id"
              type="button"
              class="control focus-ring rounded-control btn-press type-task text-ink relative flex min-h-14 flex-col items-start justify-center gap-0.5 px-4 py-2 text-start"
              :class="selected === o.id ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="selected === o.id"
              :disabled="sealing"
              @click="((selected = o.id), playSound('pop'))"
            >
              <span lang="en" class="font-bold">{{ o.en }}</span>
              <span class="type-small text-ink-soft">{{ o.tr }}</span>
              <WaxSeal v-if="selected === o.id" :size="28" class="absolute end-2 top-2" />
            </button>
          </div>
        </fieldset>

        <!-- Payoff -->
        <section v-if="isPayoff" class="bg-wash rounded-card flex flex-col items-center gap-3 p-5 text-center" role="status">
          <WaxSeal :size="96" />
          <p class="type-title text-ink text-wrap">{{ story.proud.tr }}</p>
          <p lang="en" class="type-task text-ink-soft">{{ story.proud.can.en }}</p>
          <div class="souvenir flex flex-col items-center gap-1">
            <span class="text-surface grid size-16 place-items-center rounded-full border-4 border-ink" :style="{ background: shade }" aria-hidden="true">
              <component :is="GLYPHS[story.souvenir.glyph]" :size="32" :stroke-width="2.2" />
            </span>
            <p class="type-body text-ink font-bold">Hatıra şekerin: {{ story.souvenir.name }}</p>
            <p class="type-small text-ink-soft">Hikâyeyi sonuna kadar oynadın; şeker kavanozunda durur.</p>
          </div>
          <p class="type-small text-ink-soft">
            <template v-if="story.endings > 1">{{ story.endings }} sondan {{ seen }} tanesini gördün<template v-if="seen < story.endings">. Başka bir son var.</template></template>
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <BaseButton v-if="story.endings > 1" variant="secondary" @click="again"><RotateCcw :size="20" aria-hidden="true" /> Bu sefer farklı seç</BaseButton>
            <CandyButton v-if="nextWorld && nextStoryId" variant="drop" @click="emit('open', nextStoryId)">
              Sıradaki raf: {{ nextWorld.title }} <ArrowRight :size="18" aria-hidden="true" />
            </CandyButton>
            <CandyButton v-if="imagineTo" variant="drop" as="router-link" :to="imagineTo">Hayal Kur’a götür</CandyButton>
          </div>
          <p v-if="nextWorld" class="type-small text-ink-soft">{{ nextWorld.hook }}</p>
        </section>
      </div>
    </div>

    <footer v-if="isPayoff" class="border-hair bg-canvas flex justify-center border-t px-8 py-3">
      <CandyButton ref="cta" variant="wrapper" @click="shelve">Rafa koy</CandyButton>
    </footer>
    <footer v-else class="border-hair bg-canvas border-t px-4 py-3">
      <div class="mx-auto max-w-3xl">
        <CandyButton
          block
          :disabled="!!cur.choice && !selected"
          disabled-reason="Önce bir seçenek seç"
          @click="advance"
        >
          {{ cur.choice ? 'Bunu seçtim' : 'Sıradaki' }} <ArrowRight :size="20" aria-hidden="true" />
        </CandyButton>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.word {
  animation: word-in var(--duration-slow) var(--ease-sheet) both;
}
.souvenir > span {
  animation: souvenir-drop 700ms var(--ease-pop) both;
}
@keyframes word-in {
  from {
    opacity: 0;
    translate: 0 8px;
  }
}
@keyframes souvenir-drop {
  from {
    opacity: 0;
    translate: 0 -48px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .word,
  .souvenir > span {
    animation: none;
  }
}
</style>
