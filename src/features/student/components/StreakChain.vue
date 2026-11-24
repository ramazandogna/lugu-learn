<script setup lang="ts">
import { computed } from 'vue'
import { Check, Snowflake } from 'lucide-vue-next'

import { LuguMark } from '@/design'

import { type Streak } from '../progress'

/*
 * Şeker Zinciri (design-bible C6): last seven days as beads. A frozen day is a
 * frosted bead with a snowflake, never a gap or a red mark. State is icon +
 * word, never colour alone.
 */
const { streak } = defineProps<{ streak: Streak }>()

const SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const beads = computed(() =>
  streak.week.map((w) => ({
    ...w,
    name: SHORT[new Date(`${w.day}T12:00:00`).getDay()]!,
    word: { done: 'çalıştın', frozen: 'Piko dondurdu', today: 'bugün', empty: 'boş' }[w.state],
  })),
)
</script>

<template>
  <ol class="flex items-end justify-between gap-1" aria-label="Son yedi gün">
    <li v-for="b in beads" :key="b.day" class="flex min-w-0 flex-1 flex-col items-center gap-1">
      <span
        class="bead grid size-10 place-items-center rounded-full border-2 sm:size-11"
        :class="
          b.state === 'done'
            ? 'bg-primary-fill border-primary text-on-primary'
            : b.state === 'frozen'
              ? 'bg-wash border-primary border-dashed text-ink'
              : b.state === 'today'
                ? 'bg-surface border-primary text-ink'
                : 'bg-surface border-hair text-ink-soft'
        "
      >
        <Check v-if="b.state === 'done'" :size="20" :stroke-width="2.6" aria-hidden="true" />
        <Snowflake v-else-if="b.state === 'frozen'" :size="20" :stroke-width="2.2" aria-hidden="true" />
        <LuguMark v-else-if="b.state === 'today'" :size="20" />
      </span>
      <span class="type-small text-ink-soft">{{ b.name }}<span class="sr-only"> {{ b.word }}</span></span>
    </li>
  </ol>
</template>

<style scoped>
.bead {
  transition: background-color var(--duration-base) var(--ease-standard);
}
</style>
