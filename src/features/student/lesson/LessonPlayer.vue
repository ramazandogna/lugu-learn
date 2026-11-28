<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import { BaseButton } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'

import { AmbientLayer, JarProgress, LuguMascot, SectionStepper, SECTION_CHARACTER, SoundToggle, WaxSeal, WorldBackground, playSound, useReducedMotion, useUnitTheme } from '@/design'
import type { SectionKey } from '@/domain/content'
import { canEnter, offersBreakAfter, type LessonFlow } from '@/engine/lesson-flow'
import type { BreakMinutes } from '@/engine/break'
import { resolvePlay, themeOf } from '@/play/resolve-play'

import { MOOD_BUS, createMoodBus } from '../play/mood'
import { PLAY_UI } from '../play/uiContext'
import { useStudentHome } from '../useStudentHome'
import BreakPanel from './components/BreakPanel.vue'
import CandyFlight from './components/CandyFlight.vue'
import LessonFinale from './components/LessonFinale.vue'
import LessonHeader from './components/LessonHeader.vue'
import LessonIntro from './components/LessonIntro.vue'
import SealCeremony from './components/SealCeremony.vue'
import SectionDone from './components/SectionDone.vue'
import SectionIntroCard from './components/SectionIntroCard.vue'
import { LESSON } from './context'
import { SECTION_COMPONENT, SECTION_LABEL } from './sections'
import { useActivity } from './useActivity'
import { useBreak } from './useBreak'
import { SECTION_GOAL, SECTION_PIKO, doneLine, openingFor, previousLessons, recordLesson, sectionCardMs } from './useSectionFlow'
import { LEAVE_MESSAGE, LEAVE_TITLE, useLeaveGuard } from './useLeaveGuard'
import type { LoadedLesson, useLessonSession } from './useLessonSession'

const { session, loaded } = defineProps<{ session: ReturnType<typeof useLessonSession>; loaded: LoadedLesson }>()

const ctx = session.context(loaded)
provide(LESSON, ctx)

/* The unit's colours, its one ambient object, and the play templates' link back to the player. */
const unit = useUnitTheme(themeOf(loaded.pkg))
const timed = ref(false)
provide(PLAY_UI, { timed })
const ambientKind = computed(() => (unit.ambient.value === 'piko' ? 'candy' : unit.ambient.value))
const play = computed(() => (current.value ? resolvePlay(loaded.pkg, current.value) : undefined))
/* Admin test run: no student home, no breaks, no leave warning, every section open and skippable. */
const preview = session.preview
const { refresh: refreshHome } = preview ? { refresh: async () => {} } : useStudentHome()

const flow = computed<LessonFlow>(() => session.flow.value!)
const current = computed(() => session.current.value)
const replay = loaded.session.kind === 'replay'
const steps = computed(() => flow.value.sections.map((k) => ({ key: k, label: SECTION_LABEL[k] })))
const heading = useTemplateRef<HTMLElement>('heading')

const activity = useActivity({ event: session.event, addActive: session.addActive, flush: session.flushActive })
const pause = useBreak({
  sessionId: () => loaded.session.id,
  queue: session.queue,
  report: ctx.report,
  onStart: activity.breakStarted,
  onEnd: activity.breakEnded,
})

const done = computed(() => session.completion.value !== null)
const finishing = ref(false)
const guard = useLeaveGuard({
  active: () => !preview && !done.value && !session.sessionClosed.value,
  onWarn: () => session.event('leave_warning'),
  beforeLeave: async () => {
    session.flushActive()
    session.event('interrupted')
    await Promise.race([session.queue.drain(), new Promise((r) => setTimeout(r, 3000))])
  },
})

async function focusSection() {
  await nextTick()
  heading.value?.focus()
}

function open(k: SectionKey) {
  if (session.go(k)) {
    void focusSection()
    showCard(k)
  }
}

function stepTo(k: SectionKey) {
  if (stage.value === 'intro' || interlude.value) return
  if (k !== current.value && canEnter(flow.value, k) && !pause.offerAfter.value) open(k)
}

/* ----- wow moments (wow-pass C): opening, section card, candy flight, seal ceremony ----- */
const reduced = useReducedMotion()
const mood = createMoodBus()
provide(MOOD_BUS, mood)

const sections = computed(() => flow.value.sections)
const opening = openingFor(loaded.session.id, loaded.resumed)
const stage = ref<'intro' | 'play'>(opening ? 'intro' : 'play')
const card = ref<{ key: SectionKey; ms: number } | null>(null)
const interlude = ref<{ from: SectionKey; next: SectionKey | null; wasDone: boolean } | null>(null)
const flight = ref(0)
const stamped = ref(false)
const ceremony = ref(false)
const doneBtn = useTemplateRef<{ focus: () => void }>('doneCard')
const prior = previousLessons()
const lessonsSeen = prior.length

const objectives = computed(() => (loaded.pkg.meta.objectives ?? []).map((o) => o.text))
const freshWords = computed(() => loaded.pkg.vocabulary.filter((v) => !loaded.preMastered.includes(v.id)))
const wordList = computed(() => (freshWords.value.length ? freshWords.value : loaded.pkg.vocabulary))
const sentence = computed(() => {
  const ex = loaded.pkg.explanation.steps.flatMap((st) => st.examples)
  return ex.find((e) => e.en.includes('?')) ?? ex[0] ?? loaded.pkg.vocabulary[0]?.example ?? null
})

function showCard(k: SectionKey) {
  if (flow.value.completed.has(k)) return
  card.value = { key: k, ms: sectionCardMs() }
}
function startLesson() {
  if (stage.value !== 'intro') return
  stage.value = 'play'
  if (current.value) showCard(current.value)
  void focusSection()
}

function proceed(k: SectionKey, wasDone: boolean) {
  const next = session.upNext.value
  if (!next) {
    finishing.value = true
    void session.finishLesson().then(() => {
      finishing.value = false
      void refreshHome()
    })
    return
  }
  if (!preview && !wasDone && offersBreakAfter(flow.value, k)) {
    pause.offer(k)
    void focusSection()
  } else open(next)
}

function onComplete(k: SectionKey) {
  const wasDone = flow.value.completed.has(k)
  session.completeSection(k)
  card.value = null
  const next = session.upNext.value
  if (wasDone) return proceed(k, true)
  if (k === 'assessment') {
    ceremony.value = true
    return proceed(k, false)
  }
  if (!next) return proceed(k, false)
  interlude.value = { from: k, next, wasDone }
  stamped.value = false
  playSound('muhur')
  playSound('whoosh')
  flight.value++
  void nextTick(() => doneBtn.value?.focus())
}
function landed() {
  stamped.value = true
  setTimeout(() => (stamped.value = false), 1400)
}
function afterDone() {
  const i = interlude.value
  if (!i) return
  interlude.value = null
  proceed(i.from, i.wasDone)
}

function skipCurrent() {
  const k = current.value
  if (!k) return
  session.skipSection(k)
  const next = session.upNext.value
  if (next) open(next)
}

function chooseBreak(m: BreakMinutes) {
  if (pause.choose(m)) startNext()
}
function startNext() {
  pause.resume()
  const next = session.upNext.value
  if (next) open(next)
}

const canSkip = computed(() => !!current.value && !flow.value.mandatory.has(current.value) && !flow.value.completed.has(current.value))
const character = computed(() => (current.value ? SECTION_CHARACTER[current.value] : loaded.pkg.meta.character))
const onBreak = computed(() => pause.offerAfter.value !== null)

const wake = () => session.queue.wake()

/* Piko: 8 s without a touch on an open page = he tilts his head; a break = he naps. */
let stuckTimer: ReturnType<typeof setTimeout> | undefined
function touched() {
  mood.stuck(false)
  clearTimeout(stuckTimer)
  stuckTimer = setTimeout(() => {
    if (stage.value === 'play' && !done.value && !onBreak.value && !interlude.value && !ceremony.value) mood.stuck(true)
  }, 8000)
}
watch(onBreak, (b) => mood.resting(b))
watch(done, (d) => {
  if (!d || !session.completion.value) return
  if (!preview) recordLesson({ words: wordList.value.length, best: mood.best() })
  void nextTick(() => document.getElementById('fin-title')?.focus())
})
const WATCH = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
onMounted(() => {
  window.addEventListener('online', wake)
  for (const e of WATCH) window.addEventListener(e, touched, { passive: true })
  touched()
  if (stage.value === 'play') void focusSection()
})
onBeforeUnmount(() => {
  window.removeEventListener('online', wake)
  for (const e of WATCH) window.removeEventListener(e, touched)
  clearTimeout(stuckTimer)
})

const mapTo = computed(() => (preview ? `/admin/dersler/${loaded.session.lesson_id}` : '/harita'))
const sectionIndex = (k: SectionKey) => Math.max(0, sections.value.indexOf(k)) + 1
const pikoLine = (k: SectionKey) => SECTION_PIKO[k][(lessonsSeen + sectionIndex(k)) % 3]!
const viewKey = computed(() => (onBreak.value ? 'break' : interlude.value ? `done-${interlude.value.from}` : (current.value ?? 'none')))
const headingText = computed(() => (onBreak.value ? 'Mola' : interlude.value ? 'Bölüm tamam' : current.value ? SECTION_LABEL[current.value] : ''))
</script>

<template>
  <div v-bind="unit.attrs" class="min-h-full">
  <WorldBackground :character="character" intensity="soft" class="min-h-full">
    <AmbientLayer :kind="ambientKind" :count="ambientKind === 'candy' ? 3 : 4" :active="!timed && !done && stage === 'play'" />
    <div class="relative mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:max-w-4xl" style="z-index: var(--z-raised)">
      <LessonHeader :pkg="loaded.pkg" :replay="replay" :saving="session.saving.value" />
      <p v-if="preview" class="surface rounded-card text-ink p-3 type-small" role="note">
        <strong>Test modu.</strong> Cevaplar kaydedilmez, öğrenciye bir şey yansımaz. Üstteki bölüm adımlarından istediğin bölüme geç ya da “Bu bölümü atla” de.
      </p>

      <template v-if="done && session.completion.value">
        <LessonFinale
          :replay="replay"
          :words="wordList"
          :best-run="mood.best()"
          :previous-words="prior.length >= 2 ? (prior.at(-1)?.words ?? null) : null"
          :sentence="sentence"
          :character="loaded.pkg.meta.character"
          :stars="session.completion.value.stars"
          :xp="session.completion.value.xp_awarded"
          :map-to="mapTo"
          :repeat-to="preview ? `/admin/dersler/${loaded.session.lesson_id}/test` : `/ders/${loaded.session.lesson_id}/tekrar`"
        />
      </template>

      <LessonIntro
        v-else-if="stage === 'intro' && opening"
        :title="loaded.pkg.meta.title"
        :objectives="objectives"
        :ms="opening.ms"
        @start="startLesson"
      />

      <template v-else>
        <SectionStepper
          v-if="current"
          :model-value="current"
          :steps="steps"
          label="Ders bölümleri"
          :counter="(c, t) => `Bölüm ${c} / ${t}`"
          interactive
          :state-labels="{ complete: 'tamamlandı', error: 'kontrol et' }"
          @update:model-value="stepTo"
        />

        <div v-if="activity.reminder.value && !onBreak" class="surface rounded-card flex flex-wrap items-center justify-between gap-3 p-4" role="status">
          <p class="text-ink font-bold">Piko seni bekliyor! Hadi tekrar dersimize dönelim.</p>
          <BaseButton size="sm" @click="activity.dismissReminder">Devam et</BaseButton>
        </div>

        <div class="flex items-center justify-between gap-3">
          <h2 ref="heading" tabindex="-1" class="type-section text-ink outline-none">
            {{ headingText }}
          </h2>
          <div class="flex items-center gap-2">
            <WaxSeal v-if="stamped" :size="28" />
            <JarProgress
              data-lesson-jar
              class="hidden md:flex"
              size="sm"
              :value="flow.completed.size"
              :max="sections.length"
              :label="`${sections.length} bölümden ${flow.completed.size} tanesi tamamlandı`"
            />
            <SoundToggle />
            <LuguMascot character="piko" :mood="mood.mood.value" :size="44" :animated="!reduced" class="hidden sm:block" />
          </div>
        </div>

        <Transition name="sec" mode="out-in">
          <div :key="viewKey" class="flex flex-col gap-4">
            <BreakPanel
              v-if="onBreak"
              :status="pause.status.value"
              :countdown="pause.countdown.value"
              :seconds-left="pause.secondsLeft.value"
              :next-label="session.upNext.value ? SECTION_LABEL[session.upNext.value] : ''"
              @choose="chooseBreak"
              @resume="startNext"
            />
            <SectionDone
              v-else-if="interlude && interlude.next"
              ref="doneCard"
              :label="SECTION_LABEL[interlude.from]"
              :line="doneLine(interlude.from, freshWords.length)"
              :next-label="SECTION_LABEL[interlude.next]"
              @next="afterDone"
            />
            <template v-else-if="current">
              <component
                :is="SECTION_COMPONENT[current]"
                :key="current"
                :snapshot="session.snapshots.value[current]"
                :completed="flow.completed.has(current)"
                :play="play"
                @state="(s: unknown) => ctx.saveState(current!, s)"
                @complete="onComplete(current!)"
              />
              <BaseButton v-if="canSkip" variant="quiet" class="self-start" @click="skipCurrent">Bu bölümü atla</BaseButton>
            </template>
          </div>
        </Transition>
        <p v-if="finishing" class="text-ink-soft" role="status">Dersin tamamlanıyor…</p>
      </template>
    </div>

    <SectionIntroCard
      v-if="card && !done && !interlude && !onBreak"
      :key="card.key"
      :index="sectionIndex(card.key)"
      :total="sections.length"
      :label="SECTION_LABEL[card.key]"
      :goal="SECTION_GOAL[card.key]"
      :line="pikoLine(card.key)"
      :ms="card.ms"
      @done="card = null"
    />
    <CandyFlight :trigger="flight" :from="heading" @land="landed" />
    <SealCeremony v-if="ceremony" :words="wordList.length" @done="ceremony = false" />

    <ResponsiveDialog :model-value="guard.asking.value" :title="LEAVE_TITLE" close-label="Derse dön" @update:model-value="(v: boolean) => !v && guard.stay()">
      <p class="text-ink">{{ LEAVE_MESSAGE }}</p>
      <template #actions>
        <BaseButton variant="secondary" @click="guard.leave">Şimdilik ayrıl</BaseButton>
        <BaseButton @click="guard.stay">Derse devam et</BaseButton>
      </template>
    </ResponsiveDialog>
  </WorldBackground>
  </div>
</template>

<style>
/* C3: the old section leaves in 200 ms, the new one rises 12 px in 340 ms. */
.sec-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}
.sec-enter-active {
  transition:
    opacity var(--duration-slow) var(--ease-sheet),
    transform var(--duration-slow) var(--ease-sheet);
}
.sec-leave-to {
  opacity: 0;
}
.sec-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
@media (prefers-reduced-motion: reduce) {
  .sec-leave-active,
  .sec-enter-active {
    transition: none;
  }
}
</style>
