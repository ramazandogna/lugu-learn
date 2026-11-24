<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseCard, PageHeader } from 'rei-kit'
import { listSpeakingSessions, listStudents } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import ScheduleSpeakingDialog from './ScheduleSpeakingDialog.vue'
import SpeakingSessionList from './SpeakingSessionList.vue'

const state = useLoad(async () => {
  const [students, sessions] = await Promise.all([listStudents(), listSpeakingSessions()])
  return { students, sessions }
})
const scheduling = ref(false)

const name = (id: string) => state.data.value?.students.find((s) => s.id === id)?.name ?? 'Öğrenci'
const upcoming = computed(() => (state.data.value?.sessions ?? []).filter((s) => s.status === 'planned' || s.status === 'started'))
const past = computed(() => (state.data.value?.sessions ?? []).filter((s) => s.status === 'ended' || s.status === 'cancelled'))
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Konuşma & Koçluk" as="h1">
      <template #right>
        <BaseButton :disabled="!state.data.value" @click="scheduling = true">Oturum planla</BaseButton>
      </template>
    </PageHeader>
    <LoadState
      :loading="state.loading.value"
      :error="state.error.value"
      :empty="!state.data.value?.sessions.length"
      empty-title="Henüz konuşma oturumu yok"
      empty-description="Haftalık 60 dakikalık konuşma oturumlarını buradan planlayın; AI, öğrencinin verilerine göre bir plan önerir."
      @retry="state.reload"
    >
      <template #emptyAction><BaseButton @click="scheduling = true">Oturum planla</BaseButton></template>
      <div class="grid gap-4 lg:grid-cols-2">
        <BaseCard as="section" aria-labelledby="sp-up">
          <template #head><h2 id="sp-up" class="type-body font-semibold">Yaklaşan ve süren</h2></template>
          <SpeakingSessionList :sessions="upcoming" :student-name="name" />
        </BaseCard>
        <BaseCard as="section" aria-labelledby="sp-past">
          <template #head><h2 id="sp-past" class="type-body font-semibold">Geçmiş</h2></template>
          <SpeakingSessionList :sessions="past" :student-name="name" />
        </BaseCard>
      </div>
    </LoadState>
    <ScheduleSpeakingDialog v-if="state.data.value" v-model="scheduling" :students="state.data.value.students" @scheduled="state.reload" />
  </div>
</template>
