<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from 'rei-kit'

import CandyButton from '../components/CandyButton.vue'
import AmbientLayer from '../components/AmbientLayer.vue'
import HintBubble from '../components/HintBubble.vue'
import SoundToggle from '../components/SoundToggle.vue'
import StampOption from '../components/StampOption.vue'
import TapBeacon from '../components/TapBeacon.vue'
import { playSound, type SoundName } from '../sound'
import GallerySection from './GallerySection.vue'

const SOUNDS: SoundName[] = ['tik', 'muhur', 'dogru', 'yanlis-yumusak', 'pop', 'whoosh', 'kutlama-kucuk', 'kutlama-buyuk', 'seri-pof', 'piko']
const picked = ref<string | null>(null)
const checked = ref(false)
const ANSWER = 'b'
const hint = ref(false)
const beacon = ref(0)
const candyRefs = ref<Record<string, InstanceType<typeof CandyButton> | null>>({})
const CANDY = ['jelly', 'wrapper', 'drop'] as const
const kind = ref<'candy' | 'gear' | 'steam' | 'tram'>('candy')

function resultFor(v: string) {
  if (!checked.value) return undefined
  if (v === ANSWER) return 'correct' as const
  return v === picked.value ? ('wrong' as const) : ('dim' as const)
}
</script>

<template>
  <GallerySection title="Düğmeler" note="4 varyant: primary, secondary, quiet, danger. Basınca 0.97 ölçek ve dudak 3 → 1 px; mobilde :active.">
    <div class="flex flex-wrap items-center gap-3">
      <BaseButton>Birincil</BaseButton>
      <BaseButton variant="secondary">İkincil</BaseButton>
      <BaseButton variant="quiet">Sessiz</BaseButton>
      <BaseButton variant="danger">Tehlike</BaseButton>
      <BaseButton disabled>Devre dışı</BaseButton>
      <BaseButton loading>Yükleniyor</BaseButton>
      <BaseButton size="lg">Ana eylem (lg)</BaseButton>
      <SoundToggle />
    </div>
  </GallerySection>

  <GallerySection title="Şeker düğmeler" note="jelly = birincil, wrapper = ekran başına 1 hero (nefes 4 + 2 döngü, sonra durur), drop = mini. Her satır: normal, devre dışı (neden satırı), yükleniyor, başarı.">
    <div v-for="v in CANDY" :key="v" class="mb-4 flex flex-wrap items-start gap-x-6 gap-y-4">
      <CandyButton :variant="v">{{ v }}</CandyButton>
      <CandyButton :variant="v" disabled disabled-reason="Önce bir seçenek seç">Devre dışı</CandyButton>
      <CandyButton :variant="v" loading>Yükleniyor</CandyButton>
      <CandyButton :ref="(r) => (candyRefs[v] = r as InstanceType<typeof CandyButton> | null)" :variant="v" @click="candyRefs[v]?.celebrate()">Başarı</CandyButton>
    </div>
    <CandyButton block class="max-w-sm">Tam genişlik (375)</CandyButton>
  </GallerySection>

  <GallerySection title="Balmumu mühür seçenekleri" note="Native radio gizli; ikon + metin. Yanlış seçim kırmızı değil, 'tekrar dene' tonu; doğru şık aynı anda mühürlenir.">
    <fieldset class="m-0 flex max-w-md min-w-0 flex-col gap-2 border-0 p-0">
      <legend class="type-task text-ink mb-2">She ___ a student.</legend>
      <StampOption v-model="picked" name="demo" value="a" :result="resultFor('a')">are</StampOption>
      <StampOption v-model="picked" name="demo" value="b" :result="resultFor('b')">is</StampOption>
      <StampOption v-model="picked" name="demo" value="c" :result="resultFor('c')">am</StampOption>
    </fieldset>
    <div class="mt-3 flex gap-2">
      <BaseButton :disabled="!picked || checked" @click="checked = true">Kontrol et</BaseButton>
      <BaseButton variant="quiet" @click="((checked = false), (picked = null))">Sıfırla</BaseButton>
    </div>
  </GallerySection>

  <GallerySection title="İpucu ve 'bana tıkla'" note="İşaret 3 nabızdan sonra söner; ipucu kapatılabilir, cevabı vermez.">
    <div class="flex max-w-md flex-col items-start gap-3">
      <TapBeacon :key="beacon" @press="hint = true" />
      <HintBubble v-if="hint" @close="hint = false">İlk kelime tek kişi. Fiilin tekil hâlini düşün.</HintBubble>
      <BaseButton variant="secondary" @click="((beacon += 1), (hint = false))">İşareti yeniden göster</BaseButton>
    </div>
  </GallerySection>

  <GallerySection title="Ses" note="Web Audio sentezi; varsayılan kısık, tek tuşla kapanır. İlk dokunuştan önce AudioContext açılmaz.">
    <div class="flex flex-wrap gap-2">
      <BaseButton v-for="s in SOUNDS" :key="s" variant="secondary" size="sm" @click="playSound(s)">{{ s }}</BaseButton>
    </div>
  </GallerySection>

  <GallerySection title="Ambient katman" note="En çok 5 nesne, metin altında değil, sekme gizlenince durur; reduced-motion'da hareketsiz.">
    <div class="mb-3 flex flex-wrap gap-2">
      <BaseButton v-for="k in (['candy', 'gear', 'steam', 'tram'] as const)" :key="k" :variant="kind === k ? 'primary' : 'secondary'" size="sm" @click="kind = k">{{ k }}</BaseButton>
    </div>
    <div class="surface rounded-card relative h-56 overflow-hidden">
      <AmbientLayer :kind="kind" :count="5" />
    </div>
  </GallerySection>
</template>
