<script setup lang="ts">
import { computed } from 'vue'
import type { TeacherGuide } from '@/domain/content'

const { guide, compact = false } = defineProps<{ guide: TeacherGuide; compact?: boolean }>()

const lists = computed(() =>
  [
    { title: 'Kelimeler', items: guide.vocabulary },
    { title: 'Dil bilgisi', items: guide.grammar },
    { title: 'Beklenen zorluklar', items: guide.expectedDifficulties },
    { title: 'Sorulacak sorular', items: guide.questionsToAsk },
    { title: 'Konuşma soruları', items: guide.speakingPrompts },
    { title: 'Pekiştirme', items: guide.reinforcement },
    { title: 'Önerilen etkinlikler', items: guide.suggestedActivities },
  ].filter((l) => l.items.length),
)
</script>

<template>
  <div class="flex flex-col gap-4 text-sm">
    <div>
      <h3 class="font-semibold">Hedef</h3>
      <p>{{ guide.objective }}</p>
    </div>
    <div :class="compact ? 'flex flex-col gap-4' : 'grid gap-4 md:grid-cols-2'">
      <div v-for="l in lists" :key="l.title">
        <h3 class="font-semibold">{{ l.title }}</h3>
        <ul class="list-disc ps-5">
          <li v-for="(x, i) in l.items" :key="i">{{ x }}</li>
        </ul>
      </div>
    </div>
    <div v-if="guide.commonErrors.length">
      <h3 class="font-semibold">Sık yapılan hatalar</h3>
      <ul class="flex flex-col gap-1">
        <li v-for="(e, i) in guide.commonErrors" :key="i"><s class="text-ink-soft">{{ e.error }}</s> → {{ e.correction }}</li>
      </ul>
    </div>
    <div>
      <h3 class="font-semibold">Canlandırma: {{ guide.rolePlay.situation }}</h3>
      <p class="text-ink-soft">Roller: {{ guide.rolePlay.roles.join(', ') }}</p>
      <ol class="list-decimal ps-5">
        <li v-for="(s, i) in guide.rolePlay.steps" :key="i">{{ s }}</li>
      </ol>
    </div>
    <div>
      <h3 class="font-semibold">Dinleme</h3>
      <p class="whitespace-pre-line">{{ guide.listening.script }}</p>
      <ul class="text-ink-soft mt-1 list-disc ps-5">
        <li v-for="(q, i) in guide.listening.questions" :key="i">{{ q }}</li>
      </ul>
    </div>
  </div>
</template>
