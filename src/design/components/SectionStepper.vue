<script setup lang="ts" generic="K extends string">
import { computed } from 'vue'
import { BaseStepper, ProgressBar, type StepperStep } from 'rei-kit'

/*
 * Where the learner is inside a lesson. Wide screens get rei-kit's stepper
 * (every section named, earlier ones clickable when `interactive`). A phone
 * cannot fit seven labels, so it gets the current section's name, "3 / 7"
 * and a bar — the same facts, one line.
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
const current = computed(() => steps[index.value])
</script>

<template>
  <div>
    <div class="md:hidden">
      <div class="flex items-baseline justify-between gap-3">
        <p class="type-section text-ink truncate">{{ current?.label }}</p>
        <p class="text-ink-soft shrink-0 type-small font-bold tabular-nums">{{ counter(index + 1, steps.length) }}</p>
      </div>
      <ProgressBar class="mt-2" :value="index + 1" :max="steps.length" size="md" :label="counter(index + 1, steps.length)" />
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
