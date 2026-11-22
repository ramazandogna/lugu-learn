<script setup lang="ts">
import { AnnounceHost, ToastHost, useTheme } from 'rei-kit'
import { isConfigured } from './lib/supabase'
import SetupNotice from './features/SetupNotice.vue'

useTheme()
</script>

<template>
  <SetupNotice v-if="!isConfigured" />
  <RouterView v-else />
  <ToastHost close-label="Kapat" />
  <AnnounceHost />
</template>
