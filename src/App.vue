<script setup lang="ts">
import { useTheme } from 'rei-kit'
import { isConfigured } from './lib/supabase'
import SetupNotice from './features/SetupNotice.vue'

// Toast and announce hosts are rendered by StudentShell / AdminShell.
useTheme()
</script>

<template>
  <SetupNotice v-if="!isConfigured" />
  <RouterView v-else />
</template>
