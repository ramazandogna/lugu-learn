<script setup lang="ts">
// Shown only when the deployment has no Supabase settings: says what to set rather than failing on every request.
</script>

<template>
  <main id="main" class="grid min-h-dvh place-items-center bg-canvas p-6 text-ink">
    <section class="surface max-w-lg rounded-card p-8">
      <h1 class="font-display text-2xl font-semibold">Lugu henüz yapılandırılmadı</h1>
      <p class="mt-3 text-ink-soft">
        <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_ANON_KEY</code> ortam değişkenlerini tanımlayıp uygulamayı
        yeniden derleyin. Ayrıntılar <code>docs/deployment.md</code> dosyasında.
      </p>
    </section>
  </main>
</template>
