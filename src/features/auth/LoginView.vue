<script setup lang="ts">
import { ref } from 'vue'
import { Mail } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { BaseAlert, BaseButton, BaseCheckbox, BaseInput, PasswordInput, safeRedirect } from 'rei-kit'

import { AmbientLayer, CharacterBubble, LuguLogo, SoundToggle, WorldBackground, playSound, useReducedMotion } from '@/design'
import { signIn, type SignInError } from '@/lib/auth'

const router = useRouter()
const route = useRoute()

const identifier = ref('')
const password = ref('')
const remember = ref(true)
const busy = ref(false)
const sealing = ref(false)
const shake = ref(false)
const reduced = useReducedMotion()
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
    shake.value = true
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
  if (error.value !== null) shake.value = true
  if (error.value === null) {
    sealing.value = true
    playSound('muhur')
    await new Promise((r) => setTimeout(r, reduced.value ? 0 : 340))
    await router.replace(safeRedirect(route.query.redirect))
  }
}
</script>

<template>
  <WorldBackground character="piko" intensity="rich" class="bg-canvas min-h-dvh">
    <AmbientLayer kind="candy" :count="4" />
    <div class="absolute end-4 top-4 z-(--z-raised)"><SoundToggle /></div>
    <main id="main" tabindex="-1" class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4 py-12">
      <div class="flex flex-col items-center gap-2 text-center">
        <LuguLogo size="lg" tagline="Küçük adımlar, büyük hayaller." />
        <h1 class="type-title text-ink">Tekrar hoş geldin!</h1>
      </div>

      <!-- Piko and the card are one object: the bubble sits on the card's top edge. -->
      <div class="flex flex-col">
        <CharacterBubble character="piko" expression="happy" size="md" animated class="relative z-(--z-raised) -mb-2 px-2">
          Öğrenci kodunu ve şifreni yaz, macerana kaldığın yerden devam edelim.
        </CharacterBubble>

        <form
          class="surface surface-raised rounded-card relative flex flex-col gap-4 overflow-hidden p-4 pt-6 sm:p-6 sm:pt-8"
          :class="shake ? 'animate-shake' : ''"
          novalidate
          :aria-busy="busy || sealing"
          @submit.prevent="submit"
          @animationend="shake = false"
        >
          <!-- "Mühürlü Mektup": only the flap. It folds shut and takes a seal when the letter is sent. -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-14" aria-hidden="true">
            <div class="flap bg-wash absolute inset-0" :class="sealing ? 'is-closed' : ''" />
            <span v-if="sealing" class="animate-stamp bg-primary-fill text-on-primary absolute start-1/2 top-9 grid size-10 -translate-x-1/2 place-items-center rounded-full">
              <Mail :size="20" :stroke-width="2.4" />
            </span>
          </div>

          <fieldset class="m-0 flex min-w-0 flex-col gap-4 border-0 p-0" :disabled="busy || sealing">
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
          </fieldset>
          <BaseAlert v-if="error" tone="danger">{{ MESSAGES[error] }}</BaseAlert>
          <BaseButton type="submit" size="lg" block :loading="busy">Giriş yap</BaseButton>
          <p class="text-ink-soft type-small text-center">Şifreni unuttuysan öğretmenin sana yeni bir şifre verebilir.</p>
        </form>
      </div>
    </main>
  </WorldBackground>
</template>

<style scoped>
/* The flap: a triangle that unfolds from the top edge; 340 ms on the sheet curve. */
.flap {
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top;
  transform: scaleY(0.001);
  transition: transform var(--duration-slow) var(--ease-sheet);
}
.flap.is-closed {
  transform: scaleY(1);
}
</style>
