<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { BaseAlert, BaseButton, BaseInput, BaseSelect } from 'rei-kit'

import { AvatarPicker } from '@/design'
import { friendlyMessage, updateMyProfile, type School } from '@/lib/api/student'

import { isAvatarKey, type ProfileValues } from '../profile'
import SchoolPicker from './SchoolPicker.vue'


const { initial, school, submitLabel } = defineProps<{
  initial: ProfileValues
  school?: Pick<School, 'id' | 'name' | 'city'> | null
  submitLabel: string
}>()
const emit = defineEmits<{ saved: [] }>()

const v = reactive<ProfileValues>({ ...initial })
const tried = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)

const GRADES = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}. sınıf` }))

const errors = computed(() => ({
  firstName: v.firstName.trim() ? undefined : 'Adını yazmalısın.',
  grade: v.grade ? undefined : 'Sınıfını seçmelisin.',
  school: v.schoolId ? undefined : 'Okulunu seçmelisin.',
  avatar: v.avatarKey ? undefined : 'Bir avatar seçmelisin.',
}))
const valid = computed(() => Object.values(errors.value).every((e) => e === undefined))

async function submit() {
  tried.value = true
  error.value = null
  if (!valid.value) return
  busy.value = true
  try {
    await updateMyProfile({
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim() || null,
      displayName: v.displayName.trim() || null,
      grade: v.grade ?? null,
      schoolId: v.schoolId,
      avatarKey: isAvatarKey(v.avatarKey) ? v.avatarKey : null,
    })
    emit('saved')
  } catch (e) {
    error.value = friendlyMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
    <BaseAlert v-if="error" tone="danger">{{ error }}</BaseAlert>
    <BaseAlert v-else-if="tried && !valid" tone="warning">Birkaç bilgi eksik kaldı. İşaretli alanlara bakar mısın?</BaseAlert>
    <!-- The face first: the avatar is the fun part, so it is not buried under six fields. -->
    <AvatarPicker v-model="v.avatarKey" legend="Avatarını seç" :hint="tried ? errors.avatar : 'Seni en iyi anlatan karakteri seç.'" />
    <fieldset class="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
      <legend class="type-section text-ink mb-3">Seni tanıyalım</legend>
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="v.firstName" label="Adın" autocomplete="given-name" :error="tried ? errors.firstName : undefined" />
        <BaseInput v-model="v.lastName" label="Soyadın (isteğe bağlı)" autocomplete="family-name" />
        <BaseInput v-model="v.displayName" label="Takma adın (isteğe bağlı)" hint="Lugu seni bu isimle selamlar." autocomplete="nickname" />
      </div>
    </fieldset>
    <fieldset class="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
      <legend class="type-section text-ink mb-3">Okulun</legend>
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseSelect v-model="v.grade" label="Sınıfın" :options="GRADES" placeholder="Seç" :error="tried ? errors.grade : undefined" />
      </div>
      <SchoolPicker v-model="v.schoolId" :initial="school" :error="tried ? errors.school : undefined" />
    </fieldset>
    <!-- Save stays in reach above the tab bar while the form scrolls. -->
    <div class="bg-(--glass) sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+var(--space-4))] z-(--z-raised) -mx-4 px-4 py-2 backdrop-blur-sm md:bottom-0 sm:-mx-6 sm:px-6">
      <BaseButton type="submit" size="lg" block :loading="busy">{{ submitLabel }}</BaseButton>
    </div>
  </form>
</template>
