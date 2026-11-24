<script setup lang="ts">
import { CircleCheck, RotateCcw } from 'lucide-vue-next'

import { CharacterBubble } from '@/design'
import type { CharacterKey } from '@/domain/content'

/* Feedback after an answer: character + icon + word, announced politely. Never colour alone. */
const { correct, character, explain } = defineProps<{ correct: boolean; character: CharacterKey; explain?: string | null }>()
</script>

<template>
  <CharacterBubble :character="character" :expression="correct ? 'happy' : 'thinking'" size="sm" live>
    <p class="flex items-center gap-2 font-bold">
      <CircleCheck v-if="correct" :size="20" class="text-positive" aria-hidden="true" />
      <RotateCcw v-else :size="20" class="text-primary" aria-hidden="true" />
      <span class="text-ink">{{ correct ? 'Doğru! Harika gidiyorsun.' : 'Yaklaştın! Bir daha deneyelim.' }}</span>
    </p>
    <p v-if="explain" class="text-ink mt-1">{{ explain }}</p>
    <slot />
  </CharacterBubble>
</template>
