<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'

/*
 * "Bana tıkla" (Parlayan Şeker). One at a time per screen. The ring pulses
 * three times (1.2 s each), then settles to a quiet "still here". Icon + label,
 * never colour alone. With an `id` it is shown once per day. Reduced motion:
 * no pulse, a static bright ring (main.css switches every animate-* off).
 */
const { label = 'Bana tıkla', ariaLabel = 'İpucu aç', id } = defineProps<{
  label?: string
  ariaLabel?: string
  /** Stable key; when given the beacon appears once a day for that key. */
  id?: string
}>()
const emit = defineEmits<{ press: [] }>()

const PULSES = 3
const PERIOD = 1200
const settled = ref(false)
const hidden = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const storeKey = () => `lugu.beacon.${id}.${new Date().toISOString().slice(0, 10)}`

onMounted(() => {
  if (id) {
    try {
      if (localStorage.getItem(storeKey())) hidden.value = true
      else localStorage.setItem(storeKey(), '1')
    } catch {
      /* storage blocked: show it, it settles by itself */
    }
  }
  timer = setTimeout(() => (settled.value = true), PULSES * PERIOD)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button
    v-if="!hidden"
    type="button"
    class="focus-ring text-ink relative inline-flex min-h-12 min-w-12 items-center gap-2 rounded-full px-3"
    :aria-label="ariaLabel"
    @click="emit('press')"
  >
    <span class="relative grid size-12 place-items-center" aria-hidden="true">
      <span
        class="bg-star absolute inset-0 rounded-full"
        :class="settled ? 'animate-none opacity-25' : 'animate-pulse-ring opacity-60'"
        :style="{ animationDuration: `${PERIOD}ms` }"
      />
      <span class="bg-star text-ink relative grid size-9 place-items-center rounded-full" :class="settled ? 'opacity-70' : ''">
        <Sparkles :size="20" :stroke-width="2" />
      </span>
    </span>
    <span class="type-small font-bold">{{ settled ? 'Hâlâ buradayım' : label }}</span>
  </button>
</template>
