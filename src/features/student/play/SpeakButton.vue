<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Turtle, Volume2 } from 'lucide-vue-next'

import { speak, speechSupported } from './speech'

/* Read-aloud, normal and slow. Hidden when the browser has no speech synthesis. */
const { text, label = 'Dinle' } = defineProps<{ text: string; label?: string }>()
const supported = ref(false)
onMounted(() => (supported.value = speechSupported()))
</script>

<template>
  <div v-if="supported" class="flex items-center gap-2" role="group" :aria-label="label">
    <button type="button" class="control btn-press focus-ring text-ink rounded-control inline-flex min-h-11 items-center gap-2 px-3" @click="speak(text, 'normal')">
      <Volume2 :size="20" aria-hidden="true" />
      <span class="type-small font-bold">{{ label }}</span>
    </button>
    <button type="button" class="control btn-press focus-ring text-ink rounded-control inline-flex size-11 items-center justify-center" aria-label="Yavaş dinle" title="Yavaş dinle" @click="speak(text, 'slow')">
      <Turtle :size="20" aria-hidden="true" />
    </button>
  </div>
</template>
