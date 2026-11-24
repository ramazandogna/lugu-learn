<script setup lang="ts">
import LuguLogo from '../components/LuguLogo.vue'
import GallerySection from './GallerySection.vue'

const ROLES = ['canvas', 'surface', 'muted', 'wash', 'ink', 'ink-soft', 'hair', 'primary', 'accent', 'positive', 'negative', 'warning', 'star', 'primary-fill', 'warning-ink', 'accent-ink', 'field-edge'] as const
const FILLED = ['primary', 'accent', 'positive', 'negative', 'warning'] as const
const TYPE = [
  { cls: 'type-hero', name: 'type-hero · Program / sayfa', sample: 'Öğrenme Maceram' },
  { cls: 'type-title', name: 'type-title · Ders', sample: 'Ders 12: My Weekend' },
  { cls: 'type-section', name: 'type-section · Bölüm', sample: 'Hikâye' },
  { cls: 'type-task', name: 'type-task · Görev', sample: 'Cümleyi doğru sıraya koy.' },
  { cls: 'type-display', name: 'type-display · Sayaç', sample: '09:42' },
  { cls: 'type-body', name: 'type-body · Gövde (16)', sample: 'Bugün öğrendiklerin, yarın senin hikâyen olacak.' },
  { cls: 'type-small text-ink-soft', name: 'type-small · Meta (14)', sample: 'Yalnız yardımcı bilgi; talimat değil.' },
  { cls: 'type-code', name: 'type-code · Kod', sample: 'LUGU-1042' },
  { cls: 'type-eyebrow text-ink-soft', name: 'type-eyebrow · Etiket', sample: 'Bölüm 3 / 7' },
] as const
</script>

<template>
  <GallerySection title="Marka" note="İşaret: gece göğünde bir yıldıza yükselen üç küçük adım.">
    <div class="flex flex-wrap items-end gap-8">
      <LuguLogo size="lg" tagline="Küçük adımlar, büyük hayaller." />
      <LuguLogo />
      <LuguLogo size="sm" suffix="Yönetim" />
      <LuguLogo variant="mark" size="lg" />
    </div>
  </GallerySection>

  <GallerySection title="Renk rolleri" note="Değerler tema ve karakterle değişir; isimler değişmez.">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <div v-for="role in ROLES" :key="role" class="surface rounded-card overflow-hidden">
        <div class="h-14" :style="{ background: `var(--color-${role})` }" />
        <p class="text-ink px-3 py-2 type-small font-bold">{{ role }}</p>
      </div>
    </div>
    <div class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="role in FILLED"
        :key="role"
        class="rounded-control px-3 py-2 type-small font-bold"
        :style="{ background: `var(--color-${role})`, color: `var(--color-on-${role})` }"
      >on-{{ role }}</span>
    </div>
  </GallerySection>

  <GallerySection title="Tipografi" note="Fredoka başlıklar, Nunito her şey.">
    <dl class="flex flex-col gap-4">
      <div v-for="t in TYPE" :key="t.cls" class="grid gap-1 sm:grid-cols-[14rem_1fr] sm:items-baseline">
        <dt class="text-ink-soft font-mono type-small">{{ t.name }}</dt>
        <dd :class="t.cls">{{ t.sample }}</dd>
      </div>
    </dl>
  </GallerySection>
</template>
