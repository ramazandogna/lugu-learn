<script setup lang="ts">
import { reactive } from 'vue'
import { BaseButton, BaseInput, BaseTextarea, NumberInput } from 'rei-kit'
import type { SpeakingPlan } from '@/domain/content'
import { toLines } from './editor/context'

const { plan } = defineProps<{ plan: SpeakingPlan | null }>()
const emit = defineEmits<{ save: [plan: SpeakingPlan]; cancel: [] }>()
const busy = defineModel<boolean>('busy', { default: false })

const BLOCKS = [
  { key: 'warmUp', label: 'Isınma', minutes: 5 },
  { key: 'vocabulary', label: 'Kelime', minutes: 10 },
  { key: 'grammar', label: 'Dil bilgisi', minutes: 10 },
  { key: 'rolePlay', label: 'Canlandırma', minutes: 10 },
  { key: 'listening', label: 'Dinleme', minutes: 10 },
  { key: 'weaknessReinforcement', label: 'Zayıf alan pekiştirme', minutes: 5 },
  { key: 'freeSpeaking', label: 'Serbest konuşma', minutes: 10 },
] as const
type BlockKey = (typeof BLOCKS)[number]['key']

const form = reactive({
  blocks: Object.fromEntries(
    BLOCKS.map((b) => [b.key, { minutes: plan?.[b.key].minutes ?? b.minutes, activities: (plan?.[b.key].activities ?? []).join('\n') }]),
  ) as Record<BlockKey, { minutes: number | undefined; activities: string }>,
  script: plan?.listening.script ?? '',
  closing: plan?.closingTask.task ?? '',
})

function submit() {
  const block = (k: BlockKey) => ({ minutes: form.blocks[k].minutes ?? 5, activities: toLines(form.blocks[k].activities) })
  emit('save', {
    warmUp: block('warmUp'),
    vocabulary: block('vocabulary'),
    grammar: block('grammar'),
    rolePlay: block('rolePlay'),
    listening: { ...block('listening'), script: form.script.trim() },
    weaknessReinforcement: block('weaknessReinforcement'),
    freeSpeaking: block('freeSpeaking'),
    closingTask: { task: form.closing.trim() },
  })
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="submit">
    <div v-for="b in BLOCKS" :key="b.key" class="grid gap-2 md:grid-cols-[10rem_1fr]">
      <NumberInput v-model="form.blocks[b.key].minutes" :label="`${b.label} (dk)`" :min="1" :max="60" decrement-label="Azalt" increment-label="Artır" />
      <BaseTextarea v-model="form.blocks[b.key].activities" :label="`${b.label}: etkinlikler (her satıra bir tane)`" :rows="2" />
    </div>
    <BaseTextarea v-model="form.script" label="Dinleme metni" :rows="4" />
    <BaseInput v-model="form.closing" label="Kapanış görevi" />
    <div class="flex gap-2">
      <BaseButton type="submit" :loading="busy">Planı kaydet</BaseButton>
      <BaseButton variant="secondary" @click="emit('cancel')">Vazgeç</BaseButton>
    </div>
  </form>
</template>
