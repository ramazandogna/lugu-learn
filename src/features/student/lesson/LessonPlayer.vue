<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useTemplateRef } from 'vue'
import { BaseButton } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'

import { CompletionCelebration, SectionStepper, SECTION_CHARACTER, WorldBackground } from '@/design'
import type { SectionKey } from '@/domain/content'
import { canEnter, offersBreakAfter, type LessonFlow } from '@/engine/lesson-flow'
import type { BreakMinutes } from '@/engine/break'

import { useStudentHome } from '../useStudentHome'
import BreakPanel from './components/BreakPanel.vue'
import LessonHeader from './components/LessonHeader.vue'
import { LESSON } from './context'
import { SECTION_COMPONENT, SECTION_LABEL } from './sections'
import { useActivity } from './useActivity'
import { useBreak } from './useBreak'
import { LEAVE_MESSAGE, LEAVE_TITLE, useLeaveGuard } from './useLeaveGuard'
import type { LoadedLesson, useLessonSession } from './useLessonSession'

const { session, loaded } = defineProps<{ session: ReturnType<typeof useLessonSession>; loaded: LoadedLesson }>()

const ctx = session.context(loaded)
provide(LESSON, ctx)
const { refresh: refreshHome } = useStudentHome()

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
  active: () => !done.value && !session.sessionClosed.value,
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
  if (session.go(k)) void focusSection()
}

function stepTo(k: SectionKey) {
  if (k !== current.value && canEnter(flow.value, k) && !pause.offerAfter.value) open(k)
}

async function onComplete(k: SectionKey) {
  const wasDone = flow.value.completed.has(k)
  session.completeSection(k)
  const next = session.upNext.value
  if (!next) {
    finishing.value = true
    await session.finishLesson()
    finishing.value = false
    void refreshHome()
    return
  }
  if (!wasDone && offersBreakAfter(flow.value, k)) {
    pause.offer(k)
    void focusSection()
  } else open(next)
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
onMounted(() => {
  window.addEventListener('online', wake)
  void focusSection()
})
onBeforeUnmount(() => window.removeEventListener('online', wake))
</script>

<template>
  <WorldBackground :character="character" intensity="soft" class="min-h-full">
    <div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5">
      <LessonHeader :pkg="loaded.pkg" :replay="replay" :saving="session.saving.value" />

      <template v-if="done && session.completion.value">
        <CompletionCelebration
          :title="replay ? 'Tekrarı tamamladın!' : 'Ders tamamlandı!'"
          :message="replay ? 'Bildiklerini tazeledin. Harika bir tekrar oldu!' : 'Bugünkü maceranı bitirdin. Küçük adımlar, büyük hayaller!'"
          :xp="session.completion.value.xp_awarded || undefined"
          :xp-label="`${session.completion.value.xp_awarded} XP kazandın`"
        >
          <div class="flex flex-wrap justify-center gap-2">
            <BaseButton as="router-link" to="/" size="lg">Ana sayfaya dön</BaseButton>
            <BaseButton as="router-link" :to="`/ders/${loaded.session.lesson_id}/tekrar`" variant="secondary">Dersi tekrar et</BaseButton>
          </div>
        </CompletionCelebration>
      </template>

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

        <h2 ref="heading" tabindex="-1" class="type-section text-ink outline-none">
          {{ onBreak ? 'Mola' : current ? SECTION_LABEL[current] : '' }}
        </h2>

        <BreakPanel
          v-if="onBreak"
          :status="pause.status.value"
          :countdown="pause.countdown.value"
          :seconds-left="pause.secondsLeft.value"
          :next-label="session.upNext.value ? SECTION_LABEL[session.upNext.value] : ''"
          @choose="chooseBreak"
          @resume="startNext"
        />
        <template v-else-if="current">
          <component
            :is="SECTION_COMPONENT[current]"
            :key="current"
            :snapshot="session.snapshots.value[current]"
            :completed="flow.completed.has(current)"
            @state="(s: unknown) => ctx.saveState(current!, s)"
            @complete="onComplete(current!)"
          />
          <BaseButton v-if="canSkip" variant="ghost" class="self-start" @click="skipCurrent">Bu bölümü atla</BaseButton>
        </template>
        <p v-if="finishing" class="text-ink-soft" role="status">Dersin tamamlanıyor…</p>
      </template>
    </div>

    <ResponsiveDialog :model-value="guard.asking.value" :title="LEAVE_TITLE" close-label="Derse dön" @update:model-value="(v: boolean) => !v && guard.stay()">
      <p class="text-ink">{{ LEAVE_MESSAGE }}</p>
      <template #actions>
        <BaseButton variant="secondary" @click="guard.leave">Şimdilik ayrıl</BaseButton>
        <BaseButton @click="guard.stay">Derse devam et</BaseButton>
      </template>
    </ResponsiveDialog>
  </WorldBackground>
</template>
