<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue'
import { useMediaQuery } from 'rei-kit'

import { CHARACTER_KEYS, type CharacterKey } from '@/domain/content'

import { characterThemeStyle } from '../characters'
import { currentNodeId, mapPoints, orderNodes, pathThrough, walkedCount, type MapNode, type MapNodeState } from '../map-layout'
import LuguMascot from './LuguMascot.vue'
import MapNodeButton from './MapNodeButton.vue'
import Sparkles from './Sparkles.vue'
import TinyCat from './TinyCat.vue'

const {
  nodes,
  label,
  character = 'momo',
  stateLabels = { locked: 'Kilitli', available: 'Başla', in_progress: 'Devam et', completed: 'Tamamlandı · Tekrar oyna' },
  numberLabel = (n: number) => `Ders ${n}`,
  currentLabel = 'Şu an buradasın',
} = defineProps<{
  nodes: readonly MapNode[]
  /** Accessible name of the map, e.g. "Öğrenme haritam". */
  label: string
  /** Theme and guide of this map; the guide stands beside the current node. */
  character?: CharacterKey
  stateLabels?: Record<MapNodeState, string>
  numberLabel?: (sequence: number) => string
  /** Read with the current node, so "where am I" is not shown by the mascot alone. */
  currentLabel?: string
}>()

const emit = defineEmits<{
  /** A lesson that can be opened (available, in progress, or completed for replay). */
  select: [id: string]
  /** A locked lesson was pressed; the page can say why. */
  locked: [id: string]
}>()

const wide = useMediaQuery('(min-width: 768px)')
const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
const ordered = computed(() => orderNodes(nodes))
/* A stop is the jar (72) + number + 2-line title + state (~100): the next one starts below it. */
const rowHeight = computed(() => (wide.value ? 200 : 192))
const points = computed(() => mapPoints(ordered.value.length, { amplitude: wide.value ? 30 : 22, rowHeight: rowHeight.value }))
const height = computed(() => (points.value.at(-1)?.y ?? 0) + 168)
const trail = computed(() => pathThrough(points.value))
const walked = computed(() => pathThrough(points.value.slice(0, walkedCount(ordered.value))))
const currentId = computed(() => currentNodeId(ordered.value))
/** A stop wears its own lesson's character; unknown or missing = the map's character. */
const keyOf = (n: MapNode): CharacterKey => CHARACTER_KEYS.find((k) => k === n.character) ?? character

const root = useTemplateRef<HTMLElement>('root')

function press(node: MapNode) {
  if (node.state === 'locked') emit('locked', node.id)
  else emit('select', node.id)
}

async function revealCurrent() {
  await nextTick()
  const el = root.value?.querySelector<HTMLElement>('[aria-current="step"]')
  if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', behavior: reduced.value ? 'auto' : 'smooth' })
}

onMounted(revealCurrent)
watch(currentId, revealCurrent)
</script>

<template>
  <nav ref="root" :aria-label="label" :data-character="character" :style="characterThemeStyle(character)">
    <div class="relative mx-auto w-full max-w-3xl" :style="{ height: `${height}px` }">
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full"
        :viewBox="`0 0 100 ${height}`"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path :d="trail" fill="none" stroke="var(--color-hair)" stroke-width="14" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        <path
          :d="trail"
          fill="none"
          stroke="var(--color-ink-soft)"
          stroke-width="3"
          stroke-dasharray="2 12"
          stroke-linecap="round"
          opacity="0.5"
          vector-effect="non-scaling-stroke"
        />
        <path :d="walked" fill="none" stroke="var(--color-primary)" stroke-width="8" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      </svg>

      <ol class="absolute inset-0">
        <li
          v-for="(node, i) in ordered"
          :key="node.id"
          class="absolute w-36 -translate-x-1/2 -translate-y-9 sm:w-40"
          :data-character="keyOf(node)"
          :style="{ ...characterThemeStyle(keyOf(node)), left: `${points[i]?.x}%`, top: `${points[i]?.y}px` }"
        >
          <MapNodeButton
            :node="node"
            :current="node.id === currentId"
            :number-label="numberLabel(node.sequence)"
            :state-label="stateLabels[node.state]"
            :current-label="currentLabel"
            @press="press(node)"
          />
          <LuguMascot
            v-if="node.id === currentId"
            class="absolute top-0"
            :class="(points[i]?.x ?? 50) > 50 ? '-left-12 sm:-left-16' : '-right-12 sm:-right-16'"
            :character="character"
            expression="encouraging"
            :size="wide ? 76 : 60"
            animated
          />
          <TinyCat
            v-else-if="i % 4 === 2"
            class="absolute top-4"
            :class="(points[i]?.x ?? 50) > 50 ? '-left-6' : '-right-6'"
            :pose="i % 8 === 2 ? 'sleep' : 'sit'"
            :size="34"
            fur="var(--color-ink-soft)"
          />
          <Sparkles v-else-if="i % 4 === 0 && node.state === 'completed'" class="absolute -top-4 -left-2" :size="44" :count="3" />
        </li>
      </ol>
    </div>
  </nav>
</template>
