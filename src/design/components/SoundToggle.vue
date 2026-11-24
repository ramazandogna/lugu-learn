<script setup lang="ts">
import { onMounted } from 'vue'
import { Volume2, VolumeX } from 'lucide-vue-next'

import { armSound, playSound, soundMuted, toggleSoundMuted } from '../sound'

/* One switch for all sound. aria-pressed = "sound is off"; the label says what a press does. */
const { label = 'Sesi kapat', labelOff = 'Sesi aç' } = defineProps<{ label?: string; labelOff?: string }>()

onMounted(armSound)

function press() {
  toggleSoundMuted()
  playSound('pop')
}
</script>

<template>
  <button
    type="button"
    class="control focus-ring text-ink btn-press rounded-control inline-flex size-11 items-center justify-center"
    :aria-pressed="soundMuted"
    :aria-label="soundMuted ? labelOff : label"
    :title="soundMuted ? labelOff : label"
    @click="press"
  >
    <VolumeX v-if="soundMuted" :size="20" :stroke-width="2" aria-hidden="true" />
    <Volume2 v-else :size="20" :stroke-width="2" aria-hidden="true" />
  </button>
</template>
