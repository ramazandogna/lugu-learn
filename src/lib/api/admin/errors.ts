/** One place where server error codes become Turkish sentences for the teacher. */

const MESSAGES: Record<string, string> = {
  LUGU_FORBIDDEN: 'Bu işlem için yetkiniz yok. Oturumunuzu yenileyip tekrar deneyin.',
  LUGU_NOT_STUDENT: 'Bu hesap bir öğrenci hesabı değil.',
  LUGU_ACCOUNT_INACTIVE: 'Öğrenci hesabı duraklatılmış veya devre dışı.',
  LUGU_INVALID_ARGUMENT: 'Gönderilen bilgilerden biri geçersiz.',
  LUGU_INVALID_SECTION: 'Bilinmeyen veya yanıt almayan bölüm.',
  LUGU_INVALID_PROFILE: 'Profil alanlarından biri geçersiz.',
  LUGU_STATE_TOO_LARGE: 'Kaydedilen durum çok büyük.',
  LUGU_SESSION_NOT_FOUND: 'Oturum bulunamadı.',
  LUGU_SESSION_NOT_ACTIVE: 'Oturum zaten kapanmış.',
  LUGU_ASSIGNMENT_NOT_FOUND: 'Program ataması bulunamadı.',
  LUGU_ASSIGNMENT_NOT_ACTIVE: 'Program ataması etkin değil.',
  LUGU_ASSIGNMENT_ARCHIVED: 'Program ataması arşivlenmiş; değiştirilemez.',
  LUGU_LESSON_NOT_ASSIGNED: 'Bu ders öğrencinin açık programında yok.',
  LUGU_LESSON_LOCKED: 'Ders henüz açılmamış.',
  LUGU_LESSON_NOT_CURRENT: 'Öğrenci bu dersten başka bir derse taşınmış.',
  LUGU_USE_REPLAY: 'Ders tamamlanmış; tekrar olarak başlatılmalı.',
  LUGU_REPLAY_NOT_AVAILABLE: 'Hiç tamamlanmamış bir ders tekrar edilemez.',
  LUGU_NO_PUBLISHED_PACKAGE: 'Bu dersin yayınlanmış içeriği yok.',
  LUGU_SECTION_LOCKED: 'Önceki zorunlu bölüm tamamlanmamış.',
  LUGU_SECTION_CRITERIA_NOT_MET: 'Bölümün tamamlanma koşulları karşılanmadı.',
  LUGU_QUESTION_NOT_FOUND: 'Soru bu pakette bulunamadı.',
  LUGU_ITEM_NOT_FOUND: 'Kelime bu pakette bulunamadı.',
  LUGU_ASSESSMENT_ALREADY_SUBMITTED: 'Değerlendirme bu oturumda zaten gönderilmiş.',
  LUGU_ASSESSMENT_BELOW_MINIMUM: 'Değerlendirme puanı en düşük sınırın altında.',
  LUGU_LESSON_INCOMPLETE: 'Zorunlu bölümler tamamlanmadan ders bitirilemez.',
  LUGU_BREAK_ALREADY_OPEN: 'Açık bir mola zaten var.',
  LUGU_BREAK_NOT_FOUND: 'Mola bulunamadı.',
  LUGU_SCHOOL_NOT_FOUND: 'Okul bulunamadı veya başka bir okulla birleştirilmiş.',
  LUGU_STUDENT_NOT_FOUND: 'Öğrenci bulunamadı.',
  LUGU_CURRICULUM_NOT_FOUND: 'Müfredat bulunamadı.',
  LUGU_VERSION_NOT_FOUND: 'Müfredat sürümü bulunamadı.',
  LUGU_PACKAGE_NOT_FOUND: 'İçerik paketi bulunamadı.',
  LUGU_VERSION_NOT_PUBLISHED: 'Sürüm yayınlanmadan atanamaz.',
  LUGU_VERSION_EMPTY: 'Sürümde ders olmadığı için yayınlanamaz.',
  LUGU_VERSION_LOCKED: 'Yayınlanmış sürümün dersleri eklenemez, silinemez veya sırası değiştirilemez.',
  LUGU_LESSON_NOT_IN_PROGRAM: 'Seçilen ders bu programın sürümünde yok.',
  LUGU_ALREADY_ASSIGNED: 'Öğrencinin bu sürüm için açık bir ataması zaten var.',
  LUGU_NO_NEXT_LESSON: 'Sonraki ders yok.',
  LUGU_NO_PREVIOUS_LESSON: 'Önceki ders yok.',
  LUGU_NO_CURRENT_LESSON: 'Programın şu anki dersi yok.',
  LUGU_INVALID_STATUS_TRANSITION: 'Bu durum değişikliğine izin verilmiyor.',
  LUGU_PACKAGE_IMMUTABLE: 'Yayınlanmış içerik değiştirilemez; yeni bir taslak oluşturun.',
  LUGU_PACKAGE_INVALID: 'Paket doğrulanamadı; yayınlamadan önce hataları düzeltin.',
  LUGU_SUBJECT_NOT_FOUND: 'Ders bulunamadı.',
  LUGU_TASK_NOT_FOUND: 'Görev bulunamadı.',
  // Edge functions.
  invalid_body: 'İstek geçersiz.',
  code_failed: 'Öğrenci kodu üretilemedi.',
  auth_create_failed: 'Öğrenci hesabı oluşturulamadı.',
  profile_create_failed: 'Öğrenci profili oluşturulamadı.',
  student_not_found: 'Öğrenci bulunamadı.',
  auth_update_failed: 'Hesap güncellenemedi.',
  status_update_failed: 'Hesap durumu güncellenemedi.',
  ai_not_configured: 'Yapay zekâ servisi yapılandırılmamış (ANTHROPIC_API_KEY).',
  forbidden: 'Bu işlem için yetkiniz yok.',
  unauthorized: 'Oturum süresi dolmuş; yeniden giriş yapın.',
  not_found: 'Kayıt bulunamadı.',
  confirmation_mismatch: 'Onay için yazılan öğrenci kodu eşleşmiyor.',
  request_not_found: 'Silme talebi bulunamadı.',
  request_not_open: 'Silme talebi artık açık değil.',
  delete_failed: 'Silme işlemi tamamlanamadı.',
  profile_lookup_failed: 'Yetki kontrolü yapılamadı.',
  job_not_found: 'Yapay zekâ işi bulunamadı.',
  job_not_running: 'Yapay zekâ işi çalışmıyor.',
  job_not_stalled: 'İş durmuş görünmüyor; biraz bekleyin.',
  method_not_allowed: 'İstek geçersiz.',
  // Postgres / PostgREST.
  '23505': 'Bu kayıt zaten var.',
  '23503': 'Bağlı kayıtlar olduğu için bu işlem yapılamıyor.',
  '23514': 'Girilen değerler kurallara uymuyor.',
  '42501': 'Bu işlem için yetkiniz yok.',
  network: 'Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.',
}

const FALLBACK = 'Beklenmeyen bir hata oluştu. Tekrar deneyin.'

export class AdminApiError extends Error {
  constructor(
    readonly code: string,
    readonly detail?: string,
  ) {
    super(code)
    this.name = 'AdminApiError'
  }
}

interface ErrorLike {
  message?: unknown
  code?: unknown
  details?: unknown
}

/** Normalises a PostgREST / Storage / thrown error into an {@link AdminApiError}. */
export function toAdminError(e: unknown): AdminApiError {
  if (e instanceof AdminApiError) return e
  const err = (e ?? {}) as ErrorLike
  const message = typeof err.message === 'string' ? err.message : ''
  const lugu = /LUGU_[A-Z_]+/.exec(message)?.[0]
  if (lugu) return new AdminApiError(lugu, typeof err.details === 'string' ? err.details : undefined)
  if (typeof err.code === 'string' && err.code in MESSAGES) return new AdminApiError(err.code, message)
  if (e instanceof TypeError || /fetch|network/i.test(message)) return new AdminApiError('network', message)
  return new AdminApiError('unknown', message || undefined)
}

export function errorMessage(e: unknown): string {
  const err = toAdminError(e)
  return MESSAGES[err.code] ?? (err.detail && err.code === 'unknown' ? `${FALLBACK} (${err.detail})` : FALLBACK)
}

/** Throws on a supabase-js error; returns the data otherwise. */
export function must<R extends { data: unknown; error: unknown }>(res: R): NonNullable<R['data']> {
  if (res.error) throw toAdminError(res.error)
  if (res.data === null || res.data === undefined) throw new AdminApiError('not_found')
  return res.data as NonNullable<R['data']>
}

/** For writes without a body. */
export function ok(res: { error: unknown }): void {
  if (res.error) throw toAdminError(res.error)
}
