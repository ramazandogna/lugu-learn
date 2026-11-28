<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseButton, BaseTextarea } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'

/* A confirmation that needs explaining, optionally with a note that is stored with the change. */
const open = defineModel<boolean>({ default: false })
const {
  title,
  message,
  confirmLabel,
  tone = 'primary',
  withNote = false,
  noteLabel = 'Not (isteğe bağlı)',
  busy = false,
  confirmDisabled = false,
} = defineProps<{
  title: string
  message: string
  confirmLabel: string
  tone?: 'primary' | 'danger'
  withNote?: boolean
  noteLabel?: string
  busy?: boolean
  confirmDisabled?: boolean
}>()
const emit = defineEmits<{ confirm: [note: string] }>()

const note = ref('')
watch(open, (v) => {
  if (v) note.value = ''
})
</script>

<template>
  <ResponsiveDialog v-model="open" :title="title" close-label="Kapat" :tone="tone === 'danger' ? 'alert' : 'default'">
    <p class="text-ink-soft type-small">{{ message }}</p>
    <slot />
    <BaseTextarea v-if="withNote" v-model="note" class="mt-4" :label="noteLabel" :rows="3" />
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton :variant="tone === 'danger' ? 'danger' : 'primary'" :loading="busy" :disabled="confirmDisabled" @click="emit('confirm', note)">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </ResponsiveDialog>
</template>
