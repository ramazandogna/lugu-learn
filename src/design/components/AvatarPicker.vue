<script setup lang="ts">
import { useId } from 'vue'

import { AVATARS, AVATAR_KEYS, type AvatarKey } from '../avatars'
import AvatarArt from './AvatarArt.vue'

/*
 * A radio group whose answers are pictures. rei-kit's BaseRadioGroup draws
 * text-only options, so the group is written here with the same contract: a
 * fieldset named by its legend, real radios (arrow keys move, one tab stop),
 * and the visible tile taking the radio's focus ring through `peer`.
 */
const model = defineModel<AvatarKey | undefined>()

const {
  legend,
  legendHidden = false,
  options = AVATAR_KEYS,
  hint,
} = defineProps<{
  /** The question, e.g. "Avatarını seç". */
  legend: string
  legendHidden?: boolean
  /** Which avatars to offer, in order. Defaults to all. */
  options?: readonly AvatarKey[]
  hint?: string
}>()

const name = `lugu-avatar-${useId()}`
const hintId = `${name}-hint`
</script>

<template>
  <fieldset :aria-describedby="hint ? hintId : undefined">
    <legend class="text-ink mb-3 font-bold" :class="{ 'sr-only': legendHidden }">{{ legend }}</legend>
    <p v-if="hint" :id="hintId" class="text-ink-soft -mt-2 mb-3 type-small">{{ hint }}</p>
    <div class="grid grid-cols-3 gap-3 min-[420px]:grid-cols-4 sm:grid-cols-5 lg:grid-cols-7">
      <label v-for="key in options" :key="key" class="group relative flex cursor-pointer flex-col items-center gap-1.5">
        <input v-model="model" class="peer sr-only" type="radio" :name="name" :value="key" />
        <span
          class="rounded-tile flex w-full justify-center border-2 border-transparent p-2 transition-[border-color,background-color,transform] duration-(--duration-fast) group-hover:bg-muted peer-checked:border-primary peer-checked:bg-wash peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary group-active:scale-(--press-scale)"
        >
          <AvatarArt :avatar="key" :size="64" />
        </span>
        <span class="text-ink-soft text-center type-small leading-tight font-semibold peer-checked:text-ink">
          {{ AVATARS[key].label }}
        </span>
        <!-- Not colour alone: the chosen tile also carries a tick. -->
        <span
          class="bg-primary text-on-primary absolute top-1 right-1 hidden size-6 items-center justify-center rounded-full type-small font-black peer-checked:flex"
          aria-hidden="true"
        >✓</span>
      </label>
    </div>
  </fieldset>
</template>
