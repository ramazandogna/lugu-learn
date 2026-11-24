<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from 'rei-kit'

import { CHARACTERS, CharacterBubble } from '@/design'
import type { CharacterKey, ScrollStorySlots } from '@/domain/content'
import {
  advanceScene,
  answerStoryQuestion,
  backScene,
  chooseInScene,
  currentStoryQuestion,
  isStoryComplete,
  nextStoryQuestion,
  restoreStory,
  revealStoryHint,
  snapshotStory,
  startStory,
  type StoryAnswer,
} from '@/engine/story'
import type { ResolvedPlay } from '@/play/resolve-play'

import ScrollStory from '../../play/ScrollStory.vue'
import StampQuiz from '../../play/StampQuiz.vue'
import type { StoryStepView } from '../../play/types'
import { toJson, useLesson } from '../context'

/*
 * The story is one pinned stage: every line is a step (words appear one by
 * one, Piko beside it), the scene's decision is a gate before the next scene,
 * then the comprehension questions are stamps. The engine still owns scenes,
 * choices, questions and the resume snapshot; the stage just walks it.
 */
const { snapshot, completed = false, play } = defineProps<{ snapshot?: unknown; completed?: boolean; play?: ResolvedPlay }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

const run = snapshot ? restoreStory(snapshot, ctx.pkg) : startStory(ctx.pkg)
const version = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))

const story = ctx.pkg.story
const authored = new Map(((play?.slots ?? undefined) as ScrollStorySlots | undefined)?.steps.map((s) => [s.id, s]) ?? [])

const flat = story.scenes.flatMap((sc, si) => sc.lines.map((line, li) => ({ sc, si, li, line })))
const steps: StoryStepView[] = flat.map(({ sc, si, li, line }) => {
  const a = authored.get(`${sc.id}-${li}`)
  return {
    id: `${sc.id}-${li}`,
    speaker: line.speaker,
    en: line.en,
    tr: line.tr ?? a?.line.tr,
    title: line.speaker === 'narrator' ? `Anlatıcı · Sahne ${si + 1}` : `${CHARACTERS[line.speaker].name} · Sahne ${si + 1}`,
    emphasis: a?.emphasis,
    joke: a?.joke,
    gate: sc.choice && li === sc.lines.length - 1 ? `choice:${sc.id}` : undefined,
  }
})
const startAt = Math.max(0, flat.findIndex((f) => f.si === run.scene))
const index = ref(startAt)
const speaker = computed<CharacterKey>(() => {
  const s = steps[index.value]?.speaker
  return s && s !== 'narrator' ? s : story.character
})
const presolved = story.scenes.flatMap((sc) => (sc.choice && run.choices[sc.id] !== undefined ? [`choice:${sc.id}`] : []))

const phase = read(() => run.phase)
const question = read(() => currentStoryQuestion(run))
const finished = read(() => completed || isStoryComplete(run))

function bump() {
  version.value++
  emit('state', snapshotStory(run))
}

/** The stage moved: bring the engine's scene to the step's scene. */
function onStep(i: number) {
  index.value = i
  const target = flat[i]?.si ?? 0
  let guard = 0
  while (run.phase === 'scenes' && run.scene < target && guard++ < 50) if (!advanceScene(run)) break
  while (run.phase === 'scenes' && run.scene > target && guard++ < 50) if (!backScene(run)) break
  bump()
}
function finishScenes() {
  let guard = 0
  while (run.phase === 'scenes' && guard++ < 50) if (!advanceScene(run)) break
  bump()
}

function choose(scene: string, i: number, pass: (ok: boolean) => unknown) {
  const si = story.scenes.findIndex((s) => s.id === scene)
  if (si < 0) return
  while (run.phase === 'scenes' && run.scene < si && advanceScene(run)) {
    /* the stage is ahead of the engine only on a fresh mount; catch up */
  }
  chooseInScene(run, i)
  pass(true)
  bump()
}
const chosenOf = (scene: string) => run.choices[scene]
const sceneOf = (gate: string) => story.scenes.find((s) => `choice:${s.id}` === gate)

/* questions */
const picked = ref<number | null>(null)
const graded = ref<{ correct: boolean } | null>(null)
const lastAnswer = ref<StoryAnswer | null>(null)
function answer(response: number | string | string[], ms: number) {
  const q = question.value
  const r = answerStoryQuestion(run, response)
  if (!q || !r) return
  lastAnswer.value = r
  if (q.type === 'choice' && typeof response === 'number') picked.value = response
  else graded.value = { correct: r.correct }
  void ctx.recordAnswer({ section: 'story', questionId: q.id, response: toJson(response), responseMs: ms, hintUsed: r.hintUsed })
  bump()
}
function nextQuestion() {
  if (!nextStoryQuestion(run)) return
  picked.value = null
  graded.value = null
  lastAnswer.value = null
  bump()
}
const answered = computed(() => picked.value !== null || graded.value !== null)
const qProgress = computed(() => ({ done: run.question + (answered.value ? 1 : 0), total: story.questions.length }))
</script>

<template>
  <div class="flex flex-col gap-4">
    <header>
      <p class="type-eyebrow text-ink-soft">{{ story.setting }}</p>
      <h3 class="type-section text-ink" lang="en">{{ story.title }}</h3>
    </header>

    <ScrollStory
      v-if="phase === 'scenes'"
      :steps="steps"
      :character="speaker"
      :start-index="startAt"
      :presolved="presolved"
      last-label="Sorulara geç"
      label="Hikâye"
      @step="onStep"
      @finish="finishScenes"
    >
      <template #gate="{ step, pass }">
        <fieldset v-if="sceneOf(step.gate ?? '')?.choice" class="surface rounded-tile border-hair flex flex-col gap-2 border p-4">
          <legend class="type-task text-ink px-1" lang="en">{{ sceneOf(step.gate ?? '')?.choice?.prompt }}</legend>
          <BaseButton
            v-for="(o, i) in sceneOf(step.gate ?? '')?.choice?.options"
            :key="i"
            variant="secondary"
            size="lg"
            :pressed="chosenOf(sceneOf(step.gate ?? '')!.id) === i"
            lang="en"
            @click="choose(sceneOf(step.gate ?? '')!.id, i, pass)"
          >
            {{ o.text }}
          </BaseButton>
          <CharacterBubble
            v-if="chosenOf(sceneOf(step.gate ?? '')!.id) !== undefined"
            :character="story.character"
            size="sm"
            live
          >
            {{ sceneOf(step.gate ?? '')?.choice?.options[chosenOf(sceneOf(step.gate ?? '')!.id)!]?.feedback }}
          </CharacterBubble>
        </fieldset>
      </template>
    </ScrollStory>

    <StampQuiz
      v-else-if="phase === 'questions' && question"
      :question="question"
      :picked="picked"
      :graded="graded"
      :progress="qProgress"
      eyebrow="Hikâye soruları"
      :character="story.character"
      :hint-budget="play?.hintBudget ?? 2"
      :show-streak="false"
      :next-label="run.question + 1 < story.questions.length ? 'Sonraki soru' : 'Hikâyeyi bitir'"
      @answer="answer"
      @next="nextQuestion"
      @hint="revealStoryHint(run)"
    />

    <div v-if="phase === 'done' || (completed && phase !== 'scenes' && !question)" class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <p class="type-section text-ink">Hikâyeyi tamamladın!</p>
      <BaseButton class="self-start" :disabled="!finished" @click="emit('complete')">Devam et</BaseButton>
    </div>
    <BaseButton v-else-if="completed" variant="quiet" class="self-start" @click="emit('complete')">Bu bölümden çık</BaseButton>
  </div>
</template>
