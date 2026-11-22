<script setup lang="ts">
import { ref } from 'vue'

import type { AvatarKey } from '../avatars'
import AvatarPicker from '../components/AvatarPicker.vue'
import LearningMap from '../components/LearningMap.vue'
import ProgressStars from '../components/ProgressStars.vue'
import SectionStepper from '../components/SectionStepper.vue'
import XpBadge from '../components/XpBadge.vue'
import type { MapNode } from '../map-layout'
import GallerySection from './GallerySection.vue'

const TITLES = ['Hello!', 'My Family', 'At School', 'My Day', 'Food I Like', 'My Weekend', 'In the City', 'Animals', 'The Weather', 'Hobbies']
const nodes: MapNode[] = TITLES.map((title, i) => ({
  id: `l${i + 1}`,
  title,
  sequence: i + 1,
  state: i < 4 ? 'completed' : i === 4 ? 'in_progress' : 'locked',
}))
const picked = ref('')

const steps = [
  { key: 'review', label: 'Tekrar' },
  { key: 'vocabulary', label: 'Kelimeler' },
  { key: 'vocab_quiz', label: 'Kelime quizi' },
  { key: 'story', label: 'Hikâye' },
  { key: 'explanation', label: 'Konu anlatımı' },
  { key: 'homework', label: 'Ödev' },
  { key: 'assessment', label: 'Değerlendirme' },
] as const
const step = ref<(typeof steps)[number]['key']>('story')
const avatar = ref<AvatarKey | undefined>('fox-scout')
</script>

<template>
  <GallerySection title="Öğrenme haritası" note="Kıvrılan yol; durum ikon + yazı ile de gösterilir. Telefonda dar, tablette geniş salınım.">
    <p class="text-ink-soft mb-2 text-sm" aria-live="polite">Seçilen: {{ picked || '—' }}</p>
    <div class="rounded-card border-hair h-[36rem] overflow-y-auto border">
      <LearningMap :nodes="nodes" label="Öğrenme haritam" @select="picked = $event" @locked="picked = `${$event} (kilitli)`" />
    </div>
  </GallerySection>

  <GallerySection title="Ders ilerlemesi">
    <SectionStepper
      v-model="step"
      :steps="steps"
      label="Ders bölümleri"
      :counter="(c, t) => `Bölüm ${c} / ${t}`"
      interactive
      :state-labels="{ complete: 'tamamlandı', error: 'kontrol et' }"
    />
  </GallerySection>

  <GallerySection title="Yıldız ve XP" note="XP hiç azalmaz; boş yıldız soluk değil, kesik çizgilidir.">
    <div class="flex flex-wrap items-center gap-6">
      <ProgressStars :value="0" label="3 yıldızdan 0 yıldız" />
      <ProgressStars :value="2" label="3 yıldızdan 2 yıldız" />
      <ProgressStars :value="3" label="3 yıldızdan 3 yıldız" size="lg" />
      <XpBadge :xp="1240" label="Toplam 1.240 XP" />
      <XpBadge :xp="85" size="sm" />
    </div>
  </GallerySection>

  <GallerySection title="Avatar seçimi">
    <AvatarPicker v-model="avatar" legend="Avatarını seç" hint="İstediğin zaman profilinden değiştirebilirsin." />
  </GallerySection>
</template>
