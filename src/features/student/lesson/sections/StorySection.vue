<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from 'rei-kit'

import { CharacterBubble } from '@/design'
import {
  advanceScene,
  answerStoryQuestion,
  backScene,
  canAdvanceScene,
  chooseInScene,
  currentScene,
  currentStoryQuestion,
  isStoryComplete,
  nextStoryQuestion,
  restoreStory,
  revealStoryHint,
  snapshotStory,
  startStory,
  type StoryAnswer,
} from '@/engine/story'

import AnswerFeedback from '../components/AnswerFeedback.vue'
import PracticeQuestion from '../components/PracticeQuestion.vue'
import { toJson, useLesson } from '../context'

const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

const run = snapshot ? restoreStory(snapshot, ctx.pkg) : startStory(ctx.pkg)
const version = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))

const story = ctx.pkg.story
const scene = read(() => currentScene(run))
const question = read(() => currentStoryQuestion(run))
const phase = read(() => run.phase)
const canNext = read(() => canAdvanceScene(run))
const chosen = read(() => (scene.value ? run.choices[scene.value.id] : undefined))
const choiceFeedback = computed(() => (scene.value?.choice && chosen.value !== undefined ? scene.value.choice.options[chosen.value]?.feedback : null))
const hint = ref<string | null>(null)
const result = ref<StoryAnswer | null>(null)
const finished = read(() => completed || isStoryComplete(run))

function bump() {
  version.value++
  emit('state', snapshotStory(run))
}

function choose(i: number) {
  chooseInScene(run, i)
  bump()
}
function forward() {
  if (advanceScene(run)) bump()
}
function back() {
  if (backScene(run)) bump()
}

function showHint() {
  hint.value = revealStoryHint(run)
  bump()
}

function answer(response: number | string | string[], ms: number) {
  const q = question.value
  const r = answerStoryQuestion(run, response)
  if (!q || !r) return
  result.value = r
  hint.value = null
  void ctx.recordAnswer({ section: 'story', questionId: q.id, response: toJson(response), responseMs: ms, hintUsed: r.hintUsed })
  bump()
}

function nextQuestion() {
  if (!nextStoryQuestion(run)) return
  result.value = null
  bump()
}

const speakerName = (k: string) => (k === 'narrator' ? null : k)
</script>

<template>
  <div class="flex flex-col gap-4">
    <header>
      <p class="type-eyebrow text-ink-soft">{{ story.setting }}</p>
      <h3 class="type-section text-ink" lang="en">{{ story.title }}</h3>
    </header>

    <template v-if="phase === 'scenes' && scene">
      <p class="text-ink-soft text-sm">Sahne {{ run.scene + 1 }} / {{ story.scenes.length }}</p>
      <div class="flex flex-col gap-3">
        <template v-for="(line, i) in scene.lines" :key="`${scene.id}-${i}`">
          <CharacterBubble v-if="speakerName(line.speaker)" :character="line.speaker === 'narrator' ? story.character : line.speaker" :side="i % 2 ? 'end' : 'start'" size="sm">
            <p class="text-ink" lang="en">{{ line.en }}</p>
            <p v-if="line.tr" class="text-ink-soft text-sm">{{ line.tr }}</p>
          </CharacterBubble>
          <p v-else class="text-ink italic">
            <span lang="en">{{ line.en }}</span>
            <span v-if="line.tr" class="text-ink-soft block text-sm not-italic">{{ line.tr }}</span>
          </p>
        </template>
      </div>
      <fieldset v-if="scene.choice" class="surface rounded-card flex flex-col gap-2 p-4">
        <legend class="type-task text-ink px-1" lang="en">{{ scene.choice.prompt }}</legend>
        <BaseButton v-for="(o, i) in scene.choice.options" :key="i" variant="secondary" :pressed="chosen === i" lang="en" @click="choose(i)">{{ o.text }}</BaseButton>
        <CharacterBubble v-if="choiceFeedback" :character="story.character" size="sm" live>{{ choiceFeedback }}</CharacterBubble>
      </fieldset>
      <div class="flex flex-wrap justify-between gap-2">
        <BaseButton variant="secondary" :disabled="run.scene === 0" @click="back">Önceki sahne</BaseButton>
        <BaseButton :disabled="!canNext" @click="forward">{{ run.scene + 1 < story.scenes.length ? 'Sonraki sahne' : 'Sorulara geç' }}</BaseButton>
      </div>
      <p v-if="!canNext" class="text-ink-soft text-sm">Devam etmek için bir seçim yap.</p>
    </template>

    <template v-else-if="phase === 'questions' && question">
      <p class="text-ink-soft text-sm">Soru {{ run.question + 1 }} / {{ story.questions.length }}</p>
      <PracticeQuestion :question="question" :hint="hint" :hint-available="!!question.hint" @answer="answer" @hint="showHint" />
      <AnswerFeedback v-if="result" :correct="result.correct" :character="story.character" :explain="result.explain" />
      <BaseButton v-if="result" class="self-start" @click="nextQuestion">{{ run.question + 1 < story.questions.length ? 'Sonraki soru' : 'Hikâyeyi bitir' }}</BaseButton>
    </template>

    <div v-if="phase === 'done' || (completed && phase !== 'scenes' && !question)" class="surface rounded-card flex flex-col gap-3 p-5">
      <p class="type-section text-ink">Hikâyeyi tamamladın!</p>
      <BaseButton class="self-start" :disabled="!finished" @click="emit('complete')">Devam et</BaseButton>
    </div>
    <BaseButton v-else-if="completed" variant="ghost" class="self-start" @click="emit('complete')">Bu bölümden çık</BaseButton>
  </div>
</template>
