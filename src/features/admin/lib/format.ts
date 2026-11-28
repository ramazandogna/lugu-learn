import type { AccountStatus, AssignmentStatus, PackageStatus, SectionKey, SessionEventKind } from '@/lib/database.types'

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const formatDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : '—')
export const formatDateTime = (iso: string | null | undefined) => (iso ? dateTimeFmt.format(new Date(iso)) : '—')

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—'
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h) return `${h} sa ${m} dk`
  if (m) return r ? `${m} dk ${r} sn` : `${m} dk`
  return `${r} sn`
}

export const formatPercent = (ratio: number | null | undefined) => (ratio === null || ratio === undefined ? '—' : `%${Math.round(ratio * 100)}`)
export const formatNumber = (x: number | null | undefined, digits = 2) =>
  x === null || x === undefined ? '—' : (Math.round(x * 10 ** digits) / 10 ** digits).toLocaleString('tr-TR')

export function daysSince(iso: string | null, now: number = Date.now()): number | null {
  if (!iso) return null
  return Math.floor((now - Date.parse(iso)) / 86_400_000)
}

export const ACCOUNT_STATUS: Record<AccountStatus, string> = { active: 'Etkin', paused: 'Duraklatıldı', disabled: 'Devre dışı' }
export const ACCOUNT_TONE: Record<AccountStatus, 'success' | 'warning' | 'danger'> = { active: 'success', paused: 'warning', disabled: 'danger' }

export const ASSIGNMENT_STATUS: Record<AssignmentStatus, string> = {
  active: 'Devam ediyor',
  paused: 'Duraklatıldı',
  archived: 'Arşivlendi',
  completed: 'Tamamlandı',
}

export const PACKAGE_STATUS: Record<PackageStatus, string> = {
  draft: 'Taslak',
  ai_generated: 'AI taslağı',
  qa: 'Kalite kontrol',
  review: 'İncelemede',
  approved: 'Onaylandı',
  published: 'Yayında',
  archived: 'Arşiv',
}
export const PACKAGE_TONE: Record<PackageStatus, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
  draft: 'neutral',
  ai_generated: 'warning',
  qa: 'warning',
  review: 'primary',
  approved: 'primary',
  published: 'success',
  archived: 'neutral',
}

export const SECTION_LABEL: Record<SectionKey, string> = {
  review: 'Tekrar',
  vocabulary: 'Kelimeler',
  vocab_quiz: 'Kelime testi',
  story: 'Hikâye',
  explanation: 'Konu anlatımı',
  homework: 'Ödev',
  assessment: 'Değerlendirme',
}
export const sectionLabel = (s: string | null) => (s && s in SECTION_LABEL ? SECTION_LABEL[s as SectionKey] : (s ?? '—'))

export const SESSION_EVENT_LABEL: Record<SessionEventKind, string> = {
  visibility_hidden: 'Sekmeden ayrıldı',
  visibility_visible: 'Sekmeye döndü',
  fullscreen_exit: 'Tam ekrandan çıktı',
  leave_warning: 'Ayrılma uyarısı gösterildi',
  interrupted: 'Oturum kesildi',
  resumed: 'Oturuma devam etti',
  idle_start: 'Hareketsiz kaldı',
  idle_end: 'Hareketsizlik bitti',
}

export const PROGRAM_EVENT_LABEL: Record<string, string> = {
  assigned: 'Program atandı',
  forward: 'Sonraki derse geçirildi',
  backward: 'Önceki derse alındı',
  set_lesson: 'Ders değiştirildi',
  restart_lesson: 'Ders yeniden başlatıldı',
  pause: 'Program duraklatıldı',
  resume: 'Program sürdürüldü',
  archive: 'Program arşivlendi',
  lesson_completed: 'Ders tamamlandı',
  program_completed: 'Program tamamlandı',
  gate: 'Öğretmen kilidi değişti',
  open_lessons: 'Açık dersler değişti',
}

export const SESSION_STATUS: Record<'active' | 'completed' | 'abandoned', string> = {
  active: 'Açık',
  completed: 'Tamamlandı',
  abandoned: 'Yarım bırakıldı',
}
