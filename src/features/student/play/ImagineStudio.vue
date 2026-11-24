<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { BaseButton, SegmentedControl } from 'rei-kit'
import { Check, Sparkles, Volume2 } from 'lucide-vue-next'

import {
  AmbientLayer,
  CharacterBubble,
  EmptyScene,
  LoadingScene,
  SoundToggle,
  armSound,
  playSound,
  unitThemeAttrs,
  useReducedMotion,
} from '@/design'
import { CHARACTER_KEYS, type CharacterKey } from '@/domain/content'
import { friendlyMessage, getLessonContent } from '@/lib/api/student'

import { canSpeak, speak, stopSpeaking } from '../inspire/speech'
import ImagineArt from '../imagine/ImagineArt.vue'
import {
  BODIES,
  COLORS,
  EXTRAS,
  SCENE_FRAME,
  blanksOf,
  fillFrame,
  isSilly,
  loadCards,
  saveCard,
  studioFrom,
  type CardArt,
  type Creature,
  type ImagineCard,
  type Studio,
} from '../imagine/imagine'
import { parseStudentPackage } from '../lesson/package'

/*
 * Hayal kur (Şeker Dükkânı Kur). Nothing here can be wrong: a closed pool of
 * word chips, a ready sentence frame, no score. Piko reads the result aloud and
 * the card goes in a collection kept on this device (no server).
 */
const { lessonId } = defineProps<{ lessonId: string }>()
const reduced = useReducedMotion()

const studio = shallowRef<Studio | null>(null)
const character = ref<CharacterKey>('piko')
const themeId = ref<string | undefined>()
const error = ref<string | null>(null)

const mode = ref<'character' | 'scene'>('character')
const picks = ref<string[]>([])
const creature = ref<Creature>({ body: 'round', color: 'primary', eyes: 2, extra: 'none' })
const bg = ref(0)
const stage = ref<'build' | 'result'>('build')
const savedId = ref<string | null>(null)
const cards = ref<ImagineCard[]>([])

async function load() {
  error.value = null
  studio.value = null
  try {
    const res = await getLessonContent(lessonId)
    const pkg = parseStudentPackage(res.content)
    studio.value = studioFrom(pkg)
    character.value = CHARACTER_KEYS.find((k) => k === pkg.meta.character) ?? 'piko'
    themeId.value = pkg.meta.themeId
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
onMounted(() => {
  armSound()
  cards.value = loadCards(lessonId)
  void load()
})
watch(() => lessonId, load)
onBeforeUnmount(stopSpeaking)

const MODES = [
  { value: 'character' as const, label: 'Karakterini kur' },
  { value: 'scene' as const, label: 'Sahne kur' },
]
watch(mode, () => {
  picks.value = []
  stage.value = 'build'
  savedId.value = null
})

const limit = computed(() => (mode.value === 'scene' ? 3 : blanksOf(studio.value?.frame ?? '___')))
const frame = computed(() => (mode.value === 'scene' ? SCENE_FRAME : (studio.value?.frame ?? '')))
const ready = computed(() => (mode.value === 'scene' ? picks.value.length >= 1 : picks.value.length === limit.value))
const sentence = computed(() =>
  mode.value === 'scene' ? picks.value.map((p) => fillFrame(SCENE_FRAME, [p])).join(' ') : fillFrame(frame.value, picks.value),
)
const preview = computed(() => (mode.value === 'scene' ? (picks.value.length ? sentence.value : SCENE_FRAME) : sentence.value))
const silly = computed(() => !!studio.value && isSilly(picks.value, studio.value.chips))
const full = computed(() => picks.value.length >= limit.value)

function toggle(en: string) {
  const at = picks.value.indexOf(en)
  if (at >= 0) picks.value = picks.value.filter((p) => p !== en)
  else if (!full.value) picks.value = [...picks.value, en]
  else return
  playSound('tik')
}

const setPart = <K extends keyof Creature>(k: K, v: Creature[K]) => {
  creature.value = { ...creature.value, [k]: v }
  playSound('pop')
}

const art = computed<CardArt>(() =>
  mode.value === 'character' ? { kind: 'character', creature: creature.value } : { kind: 'scene', bg: bg.value, items: picks.value },
)

function finish() {
  stage.value = 'result'
  playSound('kutlama-kucuk')
  speak(sentence.value)
}

function save() {
  if (!studio.value || savedId.value) return
  const card: ImagineCard = {
    id: `${lessonId}-${Date.now()}`,
    lessonId,
    title: studio.value.collection,
    sentence: sentence.value,
    art: art.value,
    createdAt: new Date().toISOString(),
  }
  saveCard(card)
  cards.value = loadCards(lessonId)
  savedId.value = card.id
  playSound('muhur')
}

function again() {
  picks.value = []
  savedId.value = null
  stage.value = 'build'
}
</script>

<template>
  <EmptyScene v-if="error" tone="danger" title="Hayal kur açılamadı" :description="error">
    <BaseButton @click="load">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!studio" label="Şeker dükkânı hazırlanıyor" />
  <div v-else v-bind="unitThemeAttrs(themeId)" class="relative">
    <AmbientLayer kind="candy" :count="3" :active="!reduced" />
    <div class="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <header class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="type-eyebrow text-ink-soft">Hayal kur · {{ studio.lessonTitle }}</p>
          <h1 class="type-hero text-ink">Şeker Dükkânı Kur</h1>
          <p class="type-body text-ink-soft mt-1">Burada yanlış yok. Kelimeleri seç, hayalini kur.</p>
        </div>
        <SoundToggle />
      </header>

      <SegmentedControl v-model="mode" :options="MODES" aria-label="Ne kuracaksın?" />

      <section v-if="stage === 'build'" class="flex flex-col gap-6" aria-labelledby="build-title">
        <h2 id="build-title" class="sr-only">{{ mode === 'character' ? 'Karakter kur' : 'Sahne kur' }}</h2>

        <div class="surface rounded-card flex flex-col items-center gap-4 p-4 sm:flex-row sm:p-6">
          <ImagineArt :art="art" :size="168" :bg-labels="studio.backgrounds" />
          <div class="min-w-0 flex-1">
            <p class="type-eyebrow text-ink-soft">Cümlen</p>
            <p lang="en" class="type-title text-ink" aria-live="polite">{{ preview }}</p>
            <p v-if="silly" class="type-body text-ink-soft mt-2">Ha ha, komik! Olur, öyle kalsın.</p>
          </div>
        </div>

        <fieldset class="flex flex-col gap-3">
          <legend class="type-section text-ink">
            {{ mode === 'scene' ? 'Sahneye en çok 3 kelime koy' : `${limit} kelime seç` }}
            <span class="type-small text-ink-soft">({{ picks.length }} / {{ limit }})</span>
          </legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in studio.chips"
              :key="c.id"
              type="button"
              class="control focus-ring rounded-control btn-press flex min-h-12 flex-col items-start px-4 py-1 text-start"
              :class="picks.includes(c.en) ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="picks.includes(c.en)"
              :disabled="!picks.includes(c.en) && full"
              @click="toggle(c.en)"
            >
              <span lang="en" class="type-task text-ink flex items-center gap-1">
                <Check v-if="picks.includes(c.en)" :size="16" :stroke-width="2.6" aria-hidden="true" />{{ c.en }}
              </span>
              <span class="type-small text-ink-soft">{{ c.tr }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset v-if="mode === 'character'" class="flex flex-col gap-3">
          <legend class="type-section text-ink">Biraz süsle</legend>
          <div class="flex flex-wrap items-center gap-2">
            <span class="type-small text-ink-soft w-16">Renk</span>
            <button
              v-for="c in COLORS"
              :key="c.key"
              type="button"
              class="control focus-ring rounded-control btn-press type-small text-ink flex min-h-11 items-center gap-2 px-3"
              :class="creature.color === c.key ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="creature.color === c.key"
              @click="setPart('color', c.key)"
            >
              <span class="size-4 rounded-full" :style="{ background: c.css }" aria-hidden="true" />{{ c.label }}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="type-small text-ink-soft w-16">Beden</span>
            <button
              v-for="b in BODIES"
              :key="b.key"
              type="button"
              class="control focus-ring rounded-control btn-press type-small text-ink min-h-11 px-3"
              :class="creature.body === b.key ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="creature.body === b.key"
              @click="setPart('body', b.key)"
            >
              {{ b.label }}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="type-small text-ink-soft w-16">Göz</span>
            <button
              v-for="n in [1, 2, 3] as const"
              :key="n"
              type="button"
              class="control focus-ring rounded-control btn-press type-small text-ink min-h-11 px-3"
              :class="creature.eyes === n ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="creature.eyes === n"
              @click="setPart('eyes', n)"
            >
              {{ n }} göz
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="type-small text-ink-soft w-16">Süs</span>
            <button
              v-for="x in EXTRAS"
              :key="x.key"
              type="button"
              class="control focus-ring rounded-control btn-press type-small text-ink min-h-11 px-3"
              :class="creature.extra === x.key ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="creature.extra === x.key"
              @click="setPart('extra', x.key)"
            >
              {{ x.label }}
            </button>
          </div>
        </fieldset>

        <fieldset v-else class="flex flex-col gap-3">
          <legend class="type-section text-ink">Arka plan</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(label, i) in studio.backgrounds"
              :key="i"
              type="button"
              class="control focus-ring rounded-control btn-press type-small text-ink min-h-11 px-3"
              :class="bg === i ? 'bg-wash border-primary border-2' : ''"
              :aria-pressed="bg === i"
              @click="((bg = i), playSound('pop'))"
            >
              {{ label }}
            </button>
          </div>
        </fieldset>

        <BaseButton size="lg" class="self-start" :disabled="!ready" @click="finish">
          <Sparkles :size="20" aria-hidden="true" /> Hazır, göster!
        </BaseButton>
      </section>

      <section v-else class="flex flex-col gap-6" aria-labelledby="done-title">
        <div class="surface rounded-card flex flex-col items-center gap-4 p-6 text-center">
          <p class="type-eyebrow text-ink-soft">{{ studio.collection }}</p>
          <h2 id="done-title" class="sr-only">Sonuç kartın</h2>
          <ImagineArt :art="art" :size="200" :bg-labels="studio.backgrounds" />
          <p lang="en" class="type-hero text-ink">{{ sentence }}</p>
          <button
            v-if="canSpeak()"
            type="button"
            class="control focus-ring rounded-control btn-press type-task text-ink flex min-h-12 items-center gap-2 px-4"
            @click="speak(sentence)"
          >
            <Volume2 :size="20" aria-hidden="true" /> Piko okusun
          </button>
        </div>
        <CharacterBubble :character="character" size="sm" expression="happy">
          {{ silly ? 'Ha ha, komik! Olur, tam böyle kalsın.' : 'Ne güzel bir hayal! İstersen biraz daha süsle.' }}
        </CharacterBubble>
        <div class="flex flex-wrap gap-2">
          <BaseButton :disabled="!!savedId" @click="save">
            <Check v-if="savedId" :size="20" aria-hidden="true" />{{ savedId ? 'Koleksiyonda' : 'Koleksiyona ekle' }}
          </BaseButton>
          <BaseButton variant="secondary" @click="stage = 'build'; savedId = null">Daha da güzel yap</BaseButton>
          <BaseButton variant="secondary" @click="again">Yeni bir tane</BaseButton>
          <BaseButton as="router-link" to="/" variant="quiet">Bitir</BaseButton>
        </div>
      </section>

      <section v-if="cards.length" aria-labelledby="coll-title" class="flex flex-col gap-3">
        <h2 id="coll-title" class="type-section text-ink">{{ studio.collection }} ({{ cards.length }})</h2>
        <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <li v-for="c in cards" :key="c.id" class="surface rounded-card flex flex-col items-center gap-2 p-3 text-center">
            <ImagineArt :art="c.art" :size="96" :bg-labels="studio.backgrounds" />
            <p lang="en" class="type-small text-ink">{{ c.sentence }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
