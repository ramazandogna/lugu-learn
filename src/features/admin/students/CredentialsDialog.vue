<script setup lang="ts">
import { computed } from 'vue'
import { BaseAlert, BaseButton, CopyButton, DescriptionList } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'

/* The temporary password exists only in this dialog: it is never stored in plain text and cannot be shown again. */
const open = defineModel<boolean>({ default: false })
const { code, password } = defineProps<{ code: string; password: string }>()

const both = computed(() => `Öğrenci kodu: ${code}\nGeçici şifre: ${password}`)
</script>

<template>
  <ResponsiveDialog v-model="open" title="Giriş bilgileri" close-label="Kapat" :dismissible="false">
    <BaseAlert tone="warning">
      <template #title>Bu şifre yalnızca şimdi gösteriliyor</template>
      Pencereyi kapattıktan sonra tekrar görüntülenemez. Öğrenciye güvenli bir yolla iletin; ilk girişte şifresini değiştirmesi istenecek.
    </BaseAlert>
    <DescriptionList
      class="mt-4"
      :items="[
        { key: 'code', term: 'Öğrenci kodu' },
        { key: 'password', term: 'Geçici şifre' },
      ]"
    >
      <template #code><code class="text-lg font-semibold">{{ code }}</code></template>
      <template #password><code class="text-lg font-semibold tracking-wider">{{ password }}</code></template>
    </DescriptionList>
    <template #actions>
      <CopyButton :text="both" copy-label="Bilgileri kopyala" copied-label="Kopyalandı" error-label="Kopyalanamadı" with-text />
      <BaseButton @click="open = false">Not aldım, kapat</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
