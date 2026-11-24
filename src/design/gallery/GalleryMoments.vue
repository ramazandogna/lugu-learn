<script setup lang="ts">
import { BaseButton } from 'rei-kit'

import BreakScene from '../components/BreakScene.vue'
import CompletionCelebration from '../components/CompletionCelebration.vue'
import EmptyScene from '../components/EmptyScene.vue'
import LoadingScene from '../components/LoadingScene.vue'
import GallerySection from './GallerySection.vue'
</script>

<template>
  <GallerySection title="Tamamlama">
    <CompletionCelebration
      title="Ders tamamlandı!"
      message="Bugün 12 yeni kelime öğrendin. Bir adım daha, büyük hayaline biraz daha yakınsın."
      :stars="2"
      stars-label="3 yıldızdan 2 yıldız"
      :xp="1240"
      xp-label="Toplam 1.240 XP"
    >
      <BaseButton size="lg">Haritaya dön</BaseButton>
      <BaseButton size="lg" variant="secondary">Dersi tekrar et</BaseButton>
    </CompletionCelebration>
  </GallerySection>

  <GallerySection title="Mola" note="Geri sayım sayfanın; bir sonraki bölüm asla kendiliğinden başlamaz.">
    <BreakScene title="Kısa bir mola" message="Biraz su iç, gözlerini dinlendir. Hazır olduğunda devam edersin.">
      <template #countdown>
        <p class="type-eyebrow text-ink-soft">Kalan süre</p>
        <p class="font-display text-ink type-display font-semibold tabular-nums">09:42</p>
      </template>
      <template #actions>
        <BaseButton size="lg">Erken dön</BaseButton>
      </template>
    </BreakScene>
  </GallerySection>

  <GallerySection title="Boş, hata, yükleniyor">
    <div class="grid gap-6 md:grid-cols-3">
      <div class="surface rounded-card">
        <EmptyScene title="Henüz tamamlanan ders yok" description="İlk dersini bitirdiğinde burada görünecek.">
          <BaseButton>Derse başla</BaseButton>
        </EmptyScene>
      </div>
      <div class="surface rounded-card">
        <EmptyScene tone="danger" character="piko" title="Bir şeyler ters gitti" description="Bağlantını kontrol edip tekrar dene.">
          <BaseButton variant="secondary">Tekrar dene</BaseButton>
        </EmptyScene>
      </div>
      <div class="surface rounded-card">
        <LoadingScene label="Haritan hazırlanıyor" />
      </div>
    </div>
  </GallerySection>
</template>
