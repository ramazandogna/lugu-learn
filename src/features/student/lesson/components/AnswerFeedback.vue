<script setup lang="ts">
import { CircleCheck, CircleHelp } from 'lucide-vue-next'

import { CharacterBubble } from '@/design'
import type { CharacterKey } from '@/domain/content'

/* Feedback after an answer: character + icon + word, announced politely. Never colour alone. */
const { correct, character, explain } = defineProps<{ correct: boolean; character: CharacterKey; explain?: string | null }>()
</script>

<template>
  <CharacterBubble :character="character" :expression="correct ? 'happy' : 'thinking'" size="sm" live>
    <p class="flex items-center gap-2 font-bold">
      <CircleCheck v-if="correct" :size="20" class="text-positive" aria-hidden="true" />
      <CircleHelp v-else :size="20" class="text-warning" aria-hidden="true" />
      <span class="text-ink">{{ correct ? 'Doğru! Harika gidiyorsun.' : 'Tam olmadı, bir daha deneyelim.' }}</span>
    </p>
    <p v-if="explain" class="text-ink mt-1">{{ explain }}</p>
    <slot />
  </CharacterBubble>
</template>
