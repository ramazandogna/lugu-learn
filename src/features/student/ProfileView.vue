<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { BaseButton, SegmentedControl, useTheme, useToast } from 'rei-kit'

import { Trophy } from 'lucide-vue-next'
import { AvatarArt, EmptyScene, LoadingScene, SoundToggle, WorldBackground } from '@/design'
import { friendlyMessage, getMyProfile } from '@/lib/api/student'
import { auth, signOut } from '@/lib/auth'

import ProfileForm from './components/ProfileForm.vue'
import { isAvatarKey, toProfileValues, type ProfileValues } from './profile'
import { levelOf } from './progress'
import { useProgress } from './useProgress'
import { useStudentHome } from './useStudentHome'

const router = useRouter()
const toast = useToast()
const theme = useTheme()
const { refresh, home } = useStudentHome()
const { streak, ready: progressReady } = useProgress()
const level = computed(() => levelOf(home.value?.xp ?? 0))

const values = ref<ProfileValues | null>(null)
const school = ref<{ id: string; name: string; city: string } | null>(null)
const code = ref('')
const error = ref<string | null>(null)
const formKey = ref(0)

async function load() {
  error.value = null
  const userId = auth.account?.userId
  if (!userId) return
  try {
    const row = await getMyProfile(userId)
    values.value = toProfileValues(row)
    school.value = row.school
    code.value = row.student_code
    formKey.value++
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
onMounted(load)

async function saved() {
  toast.success('Profilin kaydedildi.')
  await Promise.all([load(), refresh()])
}

async function logout() {
  await signOut()
  await router.replace({ name: 'login' })
}

const THEMES = [
  { value: 'system' as const, label: 'Cihaz' },
  { value: 'light' as const, label: 'Gündüz' },
  { value: 'dark' as const, label: 'Gece' },
]
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
    <WorldBackground character="momo" intensity="rich" class="rounded-card overflow-hidden">
      <header class="flex items-center gap-4 p-4 sm:p-6">
        <AvatarArt v-if="values && isAvatarKey(values.avatarKey)" :avatar="values.avatarKey" :size="72" />
        <div class="min-w-0">
          <p class="type-eyebrow text-ink-soft">Profilim</p>
          <h1 class="type-title text-ink">Bilgilerin</h1>
          <p v-if="code" class="text-ink type-small">Öğrenci kodun: <span class="font-bold">{{ code }}</span> · Seviye {{ level.level }}</p>
          <p v-if="home?.profile?.honor_title" class="bg-accent text-on-accent rounded-control type-small mt-1 inline-flex items-center gap-1 px-2 py-1 font-semibold">
            <Trophy :size="16" aria-hidden="true" /> {{ home.profile.honor_title }}
          </p>
        </div>
      </header>
    </WorldBackground>

    <EmptyScene v-if="error" tone="danger" title="Profilin açılamadı" :description="error">
      <BaseButton @click="load">Tekrar dene</BaseButton>
    </EmptyScene>
    <LoadingScene v-else-if="!values" label="Profilin hazırlanıyor" compact />
    <section v-else aria-labelledby="info-title" class="surface rounded-card p-4 sm:p-6">
      <h2 id="info-title" class="sr-only">Profil bilgileri</h2>
      <ProfileForm :key="formKey" :initial="values" :school="school" submit-label="Kaydet" @saved="saved" />
    </section>

    <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
      <span>
        <span class="type-eyebrow text-ink-soft block">Yolculuğum</span>
        <span class="type-task text-ink block">Seviye {{ level.level }}<template v-if="progressReady"> · zincir {{ streak.current }} gün · en uzun {{ streak.best }}</template></span>
      </span>
      <span class="type-small text-primary font-bold underline">Ayrıntılar</span>
    </RouterLink>

    <section aria-labelledby="look-title" class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <h2 id="look-title" class="type-section text-ink">Görünüm</h2>
      <SegmentedControl v-model="theme" :options="THEMES" aria-label="Tema" />
      <div class="flex items-center justify-between gap-3">
        <p class="type-body text-ink">Ses efektleri</p>
        <SoundToggle />
      </div>
    </section>

    <section aria-labelledby="account-title" class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <h2 id="account-title" class="type-section text-ink">Hesabım</h2>
      <div class="flex flex-wrap gap-2">
        <BaseButton as="router-link" to="/sifre-degistir" variant="secondary">Şifremi değiştir</BaseButton>
        <BaseButton variant="quiet" @click="logout">Çıkış yap</BaseButton>
      </div>
    </section>
  </div>
</template>
