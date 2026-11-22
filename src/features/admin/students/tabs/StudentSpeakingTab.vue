<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard } from 'rei-kit'
import { listSpeakingSessions, type StudentSummary } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import ScheduleSpeakingDialog from '../../coaching/ScheduleSpeakingDialog.vue'
import SpeakingSessionList from '../../coaching/SpeakingSessionList.vue'
import { useLoad } from '../../lib/use-load'

const { student } = defineProps<{ student: StudentSummary }>()
const sessions = useLoad(() => listSpeakingSessions({ studentId: student.id }))
const scheduling = ref(false)
</script>

<template>
  <BaseCard as="section" aria-labelledby="sp-title">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sp-title" class="text-base font-semibold">Konuşma oturumları</h2>
        <BaseButton size="sm" :disabled="student.status !== 'active'" @click="scheduling = true">Oturum planla</BaseButton>
      </div>
    </template>
    <LoadState :loading="sessions.loading.value" :error="sessions.error.value" @retry="sessions.reload">
      <SpeakingSessionList :sessions="sessions.data.value ?? []" />
    </LoadState>
    <ScheduleSpeakingDialog v-model="scheduling" :students="[student]" :fixed-student-id="student.id" @scheduled="sessions.reload" />
  </BaseCard>
</template>
