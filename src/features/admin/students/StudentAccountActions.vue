<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseMenu } from 'rei-kit'
import { resetStudentPassword, setStudentStatus } from '@/lib/api/admin'
import type { AccountStatus } from '@/lib/database.types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useAction } from '../lib/use-load'
import CredentialsDialog from './CredentialsDialog.vue'

const { studentId, code, name, status } = defineProps<{ studentId: string; code: string; name: string; status: AccountStatus }>()
const emit = defineEmits<{ changed: [] }>()

type Pending = { kind: 'reset' } | { kind: 'status'; to: AccountStatus }
const pending = ref<Pending | null>(null)
const confirmOpen = ref(false)
const password = ref<string | null>(null)
const showPassword = ref(false)
const { busy, run } = useAction()

const COPY: Record<string, { title: string; message: string; confirm: string; tone: 'primary' | 'danger' }> = {
  reset: {
    title: 'Şifre sıfırlansın mı?',
    message: 'Yeni bir geçici şifre üretilir; öğrenci eski şifresiyle giriş yapamaz ve ilk girişte şifresini değiştirir.',
    confirm: 'Şifreyi sıfırla',
    tone: 'primary',
  },
  paused: {
    title: 'Hesap duraklatılsın mı?',
    message: 'Öğrenci giriş yapamaz; ilerlemesi ve tüm kayıtları korunur. İstediğiniz zaman yeniden etkinleştirebilirsiniz.',
    confirm: 'Duraklat',
    tone: 'primary',
  },
  disabled: {
    title: 'Hesap devre dışı bırakılsın mı?',
    message: 'Öğrenci giriş yapamaz. Kayıtlar silinmez; kalıcı silme için Ayarlar › Veri silme taleplerini kullanın.',
    confirm: 'Devre dışı bırak',
    tone: 'danger',
  },
  active: {
    title: 'Hesap etkinleştirilsin mi?',
    message: 'Öğrenci yeniden giriş yapabilir ve kaldığı yerden devam eder.',
    confirm: 'Etkinleştir',
    tone: 'primary',
  },
}
const copy = computed(() => (pending.value ? COPY[pending.value.kind === 'reset' ? 'reset' : pending.value.to] : undefined))

function ask(p: Pending) {
  pending.value = p
  confirmOpen.value = true
}

async function confirm() {
  const p = pending.value
  if (!p) return
  const ok = await run(async () => {
    if (p.kind === 'reset') password.value = (await resetStudentPassword(studentId)).password
    else await setStudentStatus(studentId, p.to)
  }, p.kind === 'reset' ? undefined : 'Hesap durumu güncellendi')
  confirmOpen.value = false
  if (!ok) return
  if (p.kind === 'reset') showPassword.value = true
  emit('changed')
}
</script>

<template>
  <BaseMenu :label="`${name} hesap işlemleri`" align="end">
    <template #trigger>
      <BaseButton as="button" variant="secondary" size="sm">Hesap</BaseButton>
    </template>
    <BaseButton variant="row" role="menuitem" @click="ask({ kind: 'reset' })">Şifreyi sıfırla</BaseButton>
    <BaseButton v-if="status !== 'active'" variant="row" role="menuitem" @click="ask({ kind: 'status', to: 'active' })">Etkinleştir</BaseButton>
    <BaseButton v-if="status === 'active'" variant="row" role="menuitem" @click="ask({ kind: 'status', to: 'paused' })">Duraklat</BaseButton>
    <BaseButton v-if="status !== 'disabled'" variant="row" role="menuitem" @click="ask({ kind: 'status', to: 'disabled' })">Devre dışı bırak</BaseButton>
  </BaseMenu>
  <ConfirmDialog
    v-if="copy"
    v-model="confirmOpen"
    :title="copy.title"
    :message="`${name} (${code}): ${copy.message}`"
    :confirm-label="copy.confirm"
    :tone="copy.tone"
    :busy="busy"
    @confirm="confirm"
  />
  <CredentialsDialog v-if="password" v-model="showPassword" :code="code" :password="password" />
</template>
