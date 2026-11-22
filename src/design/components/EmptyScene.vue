<script setup lang="ts">
import { EmptyState } from 'rei-kit'

import type { CharacterKey } from '@/domain/content'

import type { Expression } from '../mascots'
import LuguMascot from './LuguMascot.vue'
import TinyCat from './TinyCat.vue'

/*
 * Nothing here yet, said by a character. The words and the way out are
 * rei-kit's EmptyState (title, sentence, action slot); Lugu adds the picture.
 * `tone="error"` is the same scene for a failed load: the host looks
 * surprised, and the action is "Tekrar dene".
 */
const {
  title,
  description,
  character = 'momo',
  tone = 'empty',
  compact = false,
} = defineProps<{
  title: string
  description?: string
  character?: CharacterKey
  tone?: 'empty' | 'error'
  /** Smaller picture, for a panel rather than a page. */
  compact?: boolean
}>()

const expression: Record<'empty' | 'error', Expression> = { empty: 'thinking', error: 'surprised' }
</script>

<template>
  <div class="flex flex-col items-center" :role="tone === 'error' ? 'alert' : undefined">
    <div class="relative">
      <LuguMascot :character="character" :expression="expression[tone]" :size="compact ? 88 : 128" />
      <TinyCat v-if="!compact" class="absolute -right-8 bottom-1" pose="peek" :size="36" />
    </div>
    <EmptyState class="pt-2" :title="title" :description="description">
      <template v-if="$slots.default" #action>
        <slot />
      </template>
    </EmptyState>
  </div>
</template>
