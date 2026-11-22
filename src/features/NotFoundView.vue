<script setup lang="ts">
import { BaseButton } from 'rei-kit'
</script>

<template>
  <main id="main" class="grid min-h-dvh place-items-center bg-canvas p-6 text-ink">
    <section class="max-w-md text-center">
      <h1 class="font-display text-3xl font-semibold">Bu sayfayı bulamadık</h1>
      <p class="mt-3 text-ink-soft">Aradığın yer taşınmış ya da hiç var olmamış olabilir.</p>
      <BaseButton class="mt-6" @click="$router.push('/')">Ana sayfaya dön</BaseButton>
    </section>
  </main>
</template>
