<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseAlert, BaseButton, BaseCheckbox, BaseInput, PasswordInput, safeRedirect } from 'rei-kit'

import { CharacterBubble, LuguLogo, WorldBackground } from '@/design'
import { signIn, type SignInError } from '@/lib/auth'

const router = useRouter()
const route = useRoute()

const identifier = ref('')
const password = ref('')
const remember = ref(true)
const busy = ref(false)
const error = ref<SignInError | 'empty' | null>(null)

const MESSAGES: Record<SignInError | 'empty', string> = {
  empty: 'Öğrenci kodunu (ya da e-postanı) ve şifreni yazmalısın.',
  invalid_identifier: 'Öğrenci kodun LUGU-1042 gibi görünmeli. Öğretmeninin verdiği kodu yazabilirsin.',
  invalid_credentials: 'Kod ya da şifre eşleşmedi. Bir kez daha dener misin?',
  account_inactive: 'Hesabın şu an dinlenmede. Öğretmeninle konuşabilirsin.',
  no_profile: 'Bu hesap için Lugu profili bulunamadı. Öğretmenine haber verebilirsin.',
  network: 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dener misin?',
}

async function submit() {
  error.value = null
  if (!identifier.value.trim() || !password.value) {
    error.value = 'empty'
    return
  }
  busy.value = true
  try {
    error.value = await signIn(identifier.value, password.value, remember.value)
  } catch {
    error.value = 'network'
  } finally {
    busy.value = false
  }
  if (error.value === null) {
    await router.replace(safeRedirect(route.query.redirect))
  }
}
</script>

<template>
  <WorldBackground character="piko" intensity="rich" class="bg-canvas min-h-dvh">
    <main id="main" tabindex="-1" class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div class="flex flex-col items-center gap-2 text-center">
        <LuguLogo size="lg" tagline="Küçük adımlar, büyük hayaller." />
        <h1 class="type-title text-ink">Tekrar hoş geldin!</h1>
      </div>

      <CharacterBubble character="piko" expression="happy" size="md" animated>
        Öğretmeninin verdiği öğrenci kodunu ve şifreni yaz, macerana kaldığın yerden devam edelim.
      </CharacterBubble>

      <form class="surface rounded-card flex flex-col gap-4 p-5" novalidate @submit.prevent="submit">
        <BaseAlert v-if="error" tone="danger">{{ MESSAGES[error] }}</BaseAlert>
        <BaseInput
          v-model="identifier"
          label="Öğrenci kodu ya da e-posta"
          hint="Örneğin: LUGU-1042"
          autocomplete="username"
          autocapitalize="characters"
          spellcheck="false"
        />
        <PasswordInput v-model="password" label="Şifre" toggle-label="Şifreyi göster" autocomplete="current-password" />
        <BaseCheckbox v-model="remember" label="Beni hatırla" hint="Ortak bir bilgisayardaysan işaretleme." />
        <BaseButton type="submit" size="lg" block :loading="busy">Giriş yap</BaseButton>
      </form>
      <p class="text-ink-soft text-center text-sm">Şifreni unuttuysan öğretmenin sana yeni bir şifre verebilir.</p>
    </main>
  </WorldBackground>
</template>
