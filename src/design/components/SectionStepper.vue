<script setup lang="ts" generic="K extends string">
import { computed } from 'vue'
import { BaseStepper, type StepperStep } from 'rei-kit'

import JarProgress from './JarProgress.vue'

/*
 * Where the learner is inside a lesson. Wide screens get rei-kit's stepper
 * (every section named, earlier ones clickable when `interactive`). A phone
 * cannot fit seven labels, so it gets "3 / 7" on a jar; the page's own heading
 * names the section (never twice).
 */
const model = defineModel<K>({ required: true })

const {
  steps,
  label,
  counter,
  interactive = false,
  stateLabels,
} = defineProps<{
  steps: readonly StepperStep<K>[]
  /** Accessible name of the list, e.g. "Ders bölümleri". */
  label: string
  /** Builds the phone counter, e.g. (3, 7) => "Bölüm 3 / 7". */
  counter: (current: number, total: number) => string
  /** Completed sections become buttons back to them. */
  interactive?: boolean
  /** Read after a step's label: { complete: 'tamamlandı', error: 'kontrol et' }. */
  stateLabels?: { complete: string; error: string }
}>()

const index = computed(() => Math.max(0, steps.findIndex((s) => s.key === model.value)))
</script>

<template>
  <div>
    <!-- Phone: the page's own heading names the section, so only the count lives here. -->
    <div class="md:hidden">
      <JarProgress :value="index + 1" :max="steps.length" :label="counter(index + 1, steps.length)" size="sm">
        <p class="text-ink type-small font-bold tabular-nums">{{ counter(index + 1, steps.length) }}</p>
      </JarProgress>
    </div>
    <BaseStepper
      v-model="model"
      class="hidden md:block"
      :steps="steps"
      :label="label"
      :interactive="interactive"
      :state-labels="stateLabels"
    />
  </div>
</template>
