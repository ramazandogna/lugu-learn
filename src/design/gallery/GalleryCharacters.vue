<script setup lang="ts">
import { CHARACTER_KEYS } from '@/domain/content'

import { CHARACTERS } from '../characters'
import CharacterBubble from '../components/CharacterBubble.vue'
import LuguMascot from '../components/LuguMascot.vue'
import Sparkles from '../components/Sparkles.vue'
import StarBurst from '../components/StarBurst.vue'
import TinyCat from '../components/TinyCat.vue'
import WorldBackground from '../components/WorldBackground.vue'
import { EXPRESSIONS } from '../mascots'
import GallerySection from './GallerySection.vue'

const POSES = ['sit', 'sleep', 'peek', 'walk'] as const
</script>

<template>
  <GallerySection title="Karakterler × ifadeler" note="Aynı 120×120 kutu, aynı çizgi kalınlığı, aynı gölge dili.">
    <div class="overflow-x-auto">
      <table class="text-ink-soft type-small">
        <thead>
          <tr>
            <th class="p-2" />
            <th v-for="e in EXPRESSIONS" :key="e" class="p-2 font-bold">{{ e }}</th>
            <th class="p-2 font-bold">32px</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in CHARACTER_KEYS" :key="key">
            <th class="text-ink p-2 text-start type-small">{{ CHARACTERS[key].name }}</th>
            <td v-for="e in EXPRESSIONS" :key="e" class="p-1">
              <LuguMascot :character="key" :expression="e" :size="96" :label="`${CHARACTERS[key].name}: ${e}`" />
            </td>
            <td class="p-1"><LuguMascot :character="key" :size="32" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </GallerySection>

  <GallerySection title="Konuşma balonu">
    <div class="grid gap-6 md:grid-cols-2">
      <CharacterBubble character="piko" expression="thinking">"Did" geçmiş zamanı gösterir. Fiil yalın kalır: <em>Did you go?</em></CharacterBubble>
      <CharacterBubble character="sasha" expression="encouraging" side="end">Yanlış cevap da bir adım. Bir daha deneyelim!</CharacterBubble>
      <CharacterBubble character="dora" size="sm">Bir hikâye başlamak üzere…</CharacterBubble>
      <CharacterBubble character="leo" expression="celebrating" size="lg" animated>Gerçek hayatta da yapabilirsin.</CharacterBubble>
    </div>
  </GallerySection>

  <GallerySection title="Dünyalar" note="Motifler kenarlarda; orta alan metin için sakin kalır.">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <WorldBackground
        v-for="key in CHARACTER_KEYS"
        :key="key"
        :character="key"
        intensity="rich"
        animated
        class="rounded-card border-hair flex h-56 flex-col justify-center border p-6"
      >
        <p class="type-eyebrow text-ink-soft">{{ CHARACTERS[key].motif }}</p>
        <p class="type-title text-ink">{{ CHARACTERS[key].name }}</p>
        <p class="text-ink mt-1 max-w-[24ch] type-small">{{ CHARACTERS[key].catchphrases[0] }}</p>
      </WorldBackground>
    </div>
  </GallerySection>

  <GallerySection title="Süsler">
    <div class="flex flex-wrap items-center gap-8">
      <Sparkles :size="96" />
      <Sparkles :size="96" tone="primary" :count="8" />
      <StarBurst :size="180" />
      <TinyCat v-for="p in POSES" :key="p" :pose="p" :size="56" />
      <TinyCat pose="sit" :size="56" fur="var(--color-primary)" />
    </div>
  </GallerySection>
</template>
