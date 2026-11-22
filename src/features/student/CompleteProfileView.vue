<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from 'rei-kit'

import { CharacterBubble, EmptyScene, LoadingScene, LuguLogo, WorldBackground } from '@/design'
import { friendlyMessage, getMyProfile } from '@/lib/api/student'
import { auth, markProfileComplete } from '@/lib/auth'

import ProfileForm from './components/ProfileForm.vue'
import { toProfileValues, type ProfileValues } from './profile'

const router = useRouter()
const values = ref<ProfileValues | null>(null)
const school = ref<{ id: string; name: string; city: string } | null>(null)
const loadError = ref<string | null>(null)

async function load() {
  loadError.value = null
  const userId = auth.account?.userId
  if (!userId) return
  try {
    const row = await getMyProfile(userId)
    values.value = toProfileValues(row)
    school.value = row.school
  } catch (e) {
    loadError.value = friendlyMessage(e)
  }
}

async function saved() {
  markProfileComplete()
  await router.replace('/')
}

onMounted(load)
</script>

<template>
  <WorldBackground character="momo" intensity="soft" class="bg-canvas min-h-dvh">
    <main id="main" tabindex="-1" class="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8">
      <LuguLogo class="self-center" />
      <h1 class="type-title text-ink text-center">Seni tanıyalım!</h1>
      <CharacterBubble character="momo" expression="happy">
        Birkaç bilgi ve bir avatar seçersen maceraya hazırsın. Bu bilgileri sadece sen ve öğretmenin görür.
      </CharacterBubble>
      <EmptyScene v-if="loadError" tone="error" title="Profilin açılamadı" :description="loadError">
        <BaseButton @click="load">Tekrar dene</BaseButton>
      </EmptyScene>
      <LoadingScene v-else-if="!values" label="Profilin hazırlanıyor" compact />
      <div v-else class="surface rounded-card p-5">
        <ProfileForm :initial="values" :school="school" submit-label="Maceraya başla" @saved="saved" />
      </div>
    </main>
  </WorldBackground>
</template>
