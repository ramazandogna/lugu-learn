<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { Check } from 'lucide-vue-next'

import { useReducedMotion } from '../motion'
import { playSound } from '../sound'
import CandyTwist from './CandyTwist.vue'

/*
 * Şeker düğme (wow-pass A). jelly = her birincil eylem, wrapper = ekran başına
 * 1 hero, drop = satır içi mini. Gerçek <button>/<a>; dolgu `primary-fill`,
 * etiket `on-primary`, saçak `accent`. Nefes yalnız wrapper'da ve sınırlı.
 */
const {
  variant = 'jelly',
  size,
  loading = false,
  disabled = false,
  disabledReason,
  as = 'button',
  to,
  type = 'button',
  block = false,
} = defineProps<{
  variant?: 'jelly' | 'wrapper' | 'drop'
  size?: 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  /** Visible reason, linked with aria-describedby. */
  disabledReason?: string
  as?: 'button' | 'router-link'
  to?: string
  type?: 'button' | 'submit'
  /** Full width (375px primary actions). */
  block?: boolean
}>()
const emit = defineEmits<{ click: [e: MouseEvent] }>()

const reduced = useReducedMotion()
const reasonId = useId()
const el = ref<HTMLElement | null>(null)
const pressed = ref(false)
const done = ref(false)
const burst = ref(false)

const sz = computed(() => size ?? (variant === 'drop' ? 'md' : variant === 'wrapper' ? 'lg' : 'lg'))
const locked = computed(() => disabled || loading)

function down() {
  if (locked.value) return
  pressed.value = true
  playSound('tik')
}
function up() {
  pressed.value = false
}
function onClick(e: MouseEvent) {
  if (locked.value) {
    e.preventDefault()
    return
  }
  emit('click', e)
}

let burstTimer: ReturnType<typeof setTimeout> | undefined
let doneTimer: ReturnType<typeof setTimeout> | undefined
/** Success: the label turns into a check, six candy bits fly, one pop. One burst per call. */
function celebrate() {
  if (burst.value) return
  playSound('pop')
  done.value = true
  clearTimeout(doneTimer)
  doneTimer = setTimeout(() => (done.value = false), 900)
  if (reduced.value) return
  burst.value = true
  clearTimeout(burstTimer)
  burstTimer = setTimeout(() => (burst.value = false), 700)
}
defineExpose({ celebrate, focus: () => el.value?.focus() })

/* Breath (wrapper only): 4 cycles after first sight, 2 more after 8 s idle, then still. */
const breath = ref<0 | 2 | 4>(0)
let idleTimer: ReturnType<typeof setTimeout> | undefined
let idleDone = false
function startBreath(n: 2 | 4) {
  if (reduced.value || variant !== 'wrapper' || locked.value) return
  breath.value = 0
  void nextTick(() => (breath.value = n))
}
function armIdle() {
  clearTimeout(idleTimer)
  if (idleDone) return
  idleTimer = setTimeout(() => {
    idleDone = true
    startBreath(2)
  }, 8000)
}
function onActivity() {
  if (!idleDone) armIdle()
}
function onBreathEnd(e: AnimationEvent) {
  if (e.animationName !== 'candy-breathe') return
  breath.value = 0
  if (!idleDone) armIdle()
}
onMounted(() => {
  if (variant !== 'wrapper') return
  startBreath(4)
  window.addEventListener('pointerdown', onActivity, { passive: true })
  window.addEventListener('keydown', onActivity, { passive: true })
})
onBeforeUnmount(() => {
  clearTimeout(idleTimer)
  clearTimeout(burstTimer)
  clearTimeout(doneTimer)
  window.removeEventListener('pointerdown', onActivity)
  window.removeEventListener('keydown', onActivity)
})

const tag = computed(() => (as === 'router-link' ? RouterLink : 'button'))
const attrs = computed(() =>
  as === 'router-link'
    ? { to: to ?? '/', 'aria-disabled': locked.value ? 'true' : undefined, tabindex: locked.value ? -1 : undefined }
    : { type, disabled: disabled || undefined, 'aria-disabled': loading ? 'true' : undefined },
)
</script>

<template>
  <span class="candy-wrap" :data-block="block || undefined">
    <component
      :is="tag"
      ref="el"
      v-bind="attrs"
      class="candy focus-ring"
      :data-variant="variant"
      :data-size="sz"
      :data-pressed="pressed || undefined"
      :data-loading="loading || undefined"
      :data-done="done || undefined"
      :data-breath="breath || undefined"
      :aria-busy="loading ? 'true' : undefined"
      :aria-describedby="disabled && disabledReason ? reasonId : undefined"
      @pointerdown="down"
      @pointerup="up"
      @pointerleave="up"
      @pointercancel="up"
      @animationend="onBreathEnd"
      @click="onClick"
    >
      <!-- The look lives on this inner layer: the breath moves it, never the clickable box. -->
      <span class="candy-skin" aria-hidden="true">
        <CandyTwist v-if="variant === 'wrapper'" side="start" :class="{ 'candy-gone': done }" />
        <CandyTwist v-if="variant === 'wrapper'" side="end" :class="{ 'candy-gone': done }" />
      </span>
      <span class="candy-body">
        <span v-if="loading" class="candy-spin" aria-hidden="true" />
        <span class="candy-label">
          <Check v-if="done" :size="20" :stroke-width="3" aria-hidden="true" />
          <slot v-else />
        </span>
      </span>
      <span v-if="burst" class="candy-bits" aria-hidden="true">
        <i v-for="n in 6" :key="n" :style="{ '--dx': `${(n % 2 ? 1 : -1) * (36 + (n % 3) * 10)}px`, '--dy': `${-14 - n * 7}px` }" />
      </span>
    </component>
    <span v-if="disabled && disabledReason" :id="reasonId" class="type-small text-ink-soft candy-reason">{{ disabledReason }}</span>
  </span>
</template>

<style scoped>
.candy-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.375rem;
  max-width: 100%;
}
.candy-wrap[data-block] {
  display: flex;
  width: 100%;
}
.candy {
  --lip: var(--lip-sm);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  min-height: 2.75rem;
  padding-inline: 1.25rem;
  border: 0;
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--color-on-primary);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transform: translateY(0);
  transition:
    transform 180ms var(--ease-pop),
    filter var(--duration-fast) var(--ease-standard);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.candy[data-size='lg'] {
  min-height: 3.5rem;
  font-size: 1.0625rem;
}
.candy-wrap[data-block] .candy {
  width: 100%;
}
/* the skin: fill, lip, gloss on the upper 45%, shade below; all under the label */
.candy-skin {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--color-primary-fill);
  box-shadow: 0 var(--lip) 0 color-mix(in oklab, var(--color-primary-fill) 65%, black);
  pointer-events: none;
  transition: box-shadow var(--duration-fast) var(--ease-standard);
}
.candy-skin::before,
.candy-skin::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}
.candy-skin::before {
  bottom: 55%;
  background: radial-gradient(ellipse 60% 40% at 30% 18%, rgb(255 255 255 / 0.28), transparent 70%);
  transition: translate var(--duration-fast) var(--ease-standard);
}
.candy-skin::after {
  background: linear-gradient(transparent 55%, rgb(0 0 0 / 0.1));
}
.candy-body {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.candy-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* drop: pastille, one colour, no gloss */
.candy[data-variant='drop'] {
  border-radius: 999px;
  padding-inline: 1rem;
  font-size: 0.9375rem;
}
.candy[data-variant='drop'] .candy-skin::before,
.candy[data-variant='drop'] .candy-skin::after {
  display: none;
}
/* wrapper: pill body + paper fringe */
.candy[data-variant='wrapper'] {
  min-height: 4rem;
  min-width: min(220px, 100%);
  border-radius: 999px;
  padding-inline: 2rem;
  font-size: 1.125rem;
  --lip: var(--lip-lg);
  --twist-rot: 0deg;
}
.candy[data-variant='wrapper'][data-breath] .candy-skin {
  animation: candy-breathe 3600ms ease-in-out both;
  animation-iteration-count: var(--breath-n, 4);
}
.candy[data-breath='2'] {
  --breath-n: 2;
}
.candy[data-breath='4'] {
  --breath-n: 4;
}

@media (hover: hover) {
  .candy:hover:not(:disabled, [aria-disabled='true']) {
    transform: translateY(-1px);
    filter: brightness(1.06);
    --twist-rot: 6deg;
  }
  .candy:hover:not(:disabled, [aria-disabled='true']) .candy-skin::before {
    translate: 12% 0;
  }
}
/* press: squash 90ms, lip 3 -> 1, spring back on release */
.candy[data-pressed],
.candy:active:not(:disabled, [aria-disabled='true']) {
  --lip: 1px;
  --twist-rot: 14deg;
  transform: translateY(2px) scale(1.03, 0.94);
  transition-duration: 90ms;
}
.candy:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.candy[data-loading] {
  cursor: progress;
}
.candy-spin {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2.5px solid color-mix(in oklab, currentColor 30%, transparent);
  border-top-color: currentColor;
  animation: candy-spin 900ms linear infinite;
}
.candy:disabled,
.candy[aria-disabled='true']:not([data-loading]) {
  --lip: 1px;
  cursor: not-allowed;
  filter: saturate(0.5);
  color: var(--color-ink-soft);
  transition-duration: var(--duration-base);
}
.candy:disabled .candy-skin,
.candy[aria-disabled='true']:not([data-loading]) .candy-skin {
  background: color-mix(in oklab, var(--color-primary-fill) 30%, var(--color-muted));
  box-shadow: 0 1px 0 color-mix(in oklab, var(--color-primary-fill) 25%, var(--color-muted));
}
.candy:disabled .candy-skin::before,
.candy:disabled .candy-skin::after,
.candy[aria-disabled='true']:not([data-loading]) .candy-skin::before {
  display: none;
}
.candy-gone {
  animation: candy-fly-off 500ms ease-out both;
}

.candy-bits {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}
.candy-bits i {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.5rem;
  height: 0.5rem;
  margin: -0.25rem;
  border-radius: 40%;
  background: var(--color-accent);
  animation: candy-bit 600ms var(--ease-pop) both;
}
.candy-bits i:nth-child(3n + 2) {
  background: var(--color-star);
}
.candy-bits i:nth-child(3n) {
  background: var(--color-primary);
}

@keyframes candy-breathe {
  50% {
    transform: scale(1.02);
    --twist-rot: 2deg;
  }
}
@keyframes candy-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes candy-bit {
  from {
    transform: translate(0, 0) scale(0.6);
    opacity: 1;
  }
  to {
    transform: translate(var(--dx), var(--dy)) scale(1);
    opacity: 0;
  }
}
@keyframes candy-fly-off {
  to {
    transform: translateY(-14px) rotate(12deg);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .candy,
  .candy-skin::before {
    transition: background-color var(--duration-fast) linear;
  }
  .candy[data-pressed],
  .candy:active:not(:disabled, [aria-disabled='true']) {
    transform: none;
    filter: brightness(0.96);
  }
  .candy:hover:not(:disabled, [aria-disabled='true']) {
    transform: none;
  }
  .candy[data-breath] .candy-skin {
    animation: none;
  }
  .candy-gone,
  .candy-bits {
    animation: none;
    display: none;
  }
  .candy-spin {
    animation-duration: 1800ms;
  }
}
</style>
