<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseAlert, BaseButton, PasswordInput, ProgressBar } from 'rei-kit'

import { CharacterBubble, LuguLogo, WorldBackground } from '@/design'
import { auth, changePassword } from '@/lib/auth'

import { passwordStrength, STRENGTH_TEXT, type Strength } from './password'

const router = useRouter()
const password = ref('')
const confirm = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const tried = ref(false)

const strength = computed(() => passwordStrength(password.value))
const LEVEL: Record<Strength, number> = { short: 1, weak: 2, ok: 3, strong: 4 }
const forced = computed(() => auth.account?.mustChangePassword ?? false)
const mismatch = computed(() => tried.value && confirm.value !== password.value)

async function submit() {
  tried.value = true
  error.value = null
  if (strength.value === 'short' || strength.value === 'weak' || confirm.value !== password.value) return
  busy.value = true
  try {
    const msg = await changePassword(password.value)
    if (msg) error.value = 'Şifren değiştirilemedi. Biraz sonra tekrar dener misin?'
    else await router.replace('/')
  } catch {
    error.value = 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dener misin?'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <WorldBackground character="leo" intensity="soft" class="bg-canvas min-h-dvh">
    <main id="main" tabindex="-1" class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div class="flex flex-col items-center gap-2 text-center">
        <LuguLogo />
        <h1 class="type-title text-ink">Kendi şifreni oluştur</h1>
      </div>
      <CharacterBubble character="leo" expression="happy">
        {{ forced ? 'İlk girişin! Öğretmeninin verdiği şifre yerine sadece senin bildiğin yeni bir şifre seçelim.' : 'Yeni şifreni seç. Kimseyle paylaşma, tamam mı?' }}
      </CharacterBubble>
      <form class="surface rounded-card flex flex-col gap-4 p-5" novalidate @submit.prevent="submit">
        <BaseAlert v-if="error" tone="danger">{{ error }}</BaseAlert>
        <PasswordInput
          v-model="password"
          label="Yeni şifre"
          toggle-label="Şifreyi göster"
          autocomplete="new-password"
          :error="tried && (strength === 'short' || strength === 'weak') ? STRENGTH_TEXT[strength] : undefined"
          :hint="!tried || strength === 'ok' || strength === 'strong' ? STRENGTH_TEXT[strength] : undefined"
        />
        <ProgressBar :value="password ? LEVEL[strength] : 0" :max="4" size="sm" :label="`Şifre gücü: ${STRENGTH_TEXT[strength]}`" />
        <PasswordInput
          v-model="confirm"
          label="Yeni şifre (tekrar)"
          toggle-label="Şifreyi göster"
          autocomplete="new-password"
          :error="mismatch ? 'İki şifre aynı değil. Bir daha bakar mısın?' : undefined"
        />
        <BaseButton type="submit" size="lg" block :loading="busy">Şifremi kaydet</BaseButton>
        <BaseButton v-if="!forced" variant="ghost" block @click="router.back()">Vazgeç</BaseButton>
      </form>
    </main>
  </WorldBackground>
</template>
