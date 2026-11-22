/**
 * The one mapping from server errors to what a learner reads. RPCs raise
 * `P0001` with a stable `LUGU_*` message (docs/database.md "Error codes").
 * Messages are Turkish, calm and never blaming: a child should always know
 * what to do next, and nothing here says "failed".
 */
export type ApiErrorCode = `LUGU_${string}` | 'NETWORK' | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly detail: string | null
  constructor(code: ApiErrorCode, detail: string | null = null) {
    super(code)
    this.name = 'ApiError'
    this.code = code
    this.detail = detail
  }
  /** A dropped connection: safe to retry the same write later. */
  get retryable() {
    return this.code === 'NETWORK'
  }
}

interface RawError {
  message?: string
  code?: string
  details?: string | null
  status?: number
}

const NETWORK_HINT = /fetch|network|load failed|timeout|abort|offline/i

/** Turns a supabase-js error (or a thrown fetch error) into an ApiError. */
export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e
  const raw: RawError = typeof e === 'object' && e !== null ? (e as RawError) : { message: String(e) }
  const message = raw.message ?? ''
  const m = /LUGU_[A-Z_]+/.exec(message)
  if (m) return new ApiError(m[0] as `LUGU_${string}`, raw.details ?? null)
  if (e instanceof TypeError || NETWORK_HINT.test(message) || raw.status === 0 || (typeof navigator !== 'undefined' && navigator.onLine === false))
    return new ApiError('NETWORK')
  return new ApiError('UNKNOWN', message || null)
}

const MESSAGES: Record<string, string> = {
  NETWORK: 'İnternet bağlantısı kesilmiş gibi görünüyor. Bağlantı gelince kaldığın yerden devam ederiz.',
  UNKNOWN: 'Bir şeyler ters gitti. Biraz sonra tekrar dener misin?',
  LUGU_FORBIDDEN: 'Bu sayfayı açmak için izin yok. Tekrar giriş yapmayı dene.',
  LUGU_NOT_STUDENT: 'Bu bölüm öğrenci hesapları için.',
  LUGU_ACCOUNT_INACTIVE: 'Hesabın şu an dinlenmede. Öğretmeninle konuşabilirsin.',
  LUGU_INVALID_ARGUMENT: 'Bir bilgi eksik ya da hatalı görünüyor. Tekrar dener misin?',
  LUGU_INVALID_SECTION: 'Bu bölüm burada açılamıyor.',
  LUGU_INVALID_PROFILE: 'Profil bilgilerinden biri uygun değil. Lütfen kontrol et.',
  LUGU_STATE_TOO_LARGE: 'İlerlemen kaydedilirken bir sorun oldu. Devam edebilirsin, cevapların ayrıca kaydediliyor.',
  LUGU_SESSION_NOT_FOUND: 'Bu ders oturumu bulunamadı. Haritadan dersi yeniden açabilirsin.',
  LUGU_SESSION_NOT_ACTIVE: 'Bu ders oturumu kapanmış. Haritadan dersi yeniden açabilirsin.',
  LUGU_ASSIGNMENT_NOT_FOUND: 'Bu program bulunamadı.',
  LUGU_ASSIGNMENT_NOT_ACTIVE: 'Programın şu an duraklatılmış. Öğretmenin açınca devam edebilirsin.',
  LUGU_ASSIGNMENT_ARCHIVED: 'Bu program artık kullanılmıyor.',
  LUGU_LESSON_NOT_ASSIGNED: 'Bu ders senin programında değil.',
  LUGU_LESSON_LOCKED: 'Bu ders henüz kilitli. Önceki dersleri bitirince açılacak.',
  LUGU_LESSON_NOT_CURRENT: 'Öğretmenin programını güncelledi. Haritaya dönüp güncel dersine geçebilirsin.',
  LUGU_USE_REPLAY: 'Bu dersi zaten tamamladın! İstersen tekrar oynayabilirsin.',
  LUGU_REPLAY_NOT_AVAILABLE: 'Bu dersi tekrar oynamak için önce tamamlaman gerekiyor.',
  LUGU_NO_PUBLISHED_PACKAGE: 'Bu dersin içeriği henüz hazır değil. Çok yakında!',
  LUGU_SECTION_LOCKED: 'Önce bir önceki bölümü bitirmen gerekiyor.',
  LUGU_SECTION_CRITERIA_NOT_MET: 'Bu bölümde biraz daha çalışmamız gerekiyor. Kalan adımları tamamlayalım.',
  LUGU_QUESTION_NOT_FOUND: 'Bu soru bulunamadı. Sayfayı yenilemeyi dene.',
  LUGU_ITEM_NOT_FOUND: 'Bu kelime bulunamadı. Sayfayı yenilemeyi dene.',
  LUGU_USE_SUBMIT_ASSESSMENT: 'Değerlendirme cevapları en sonda birlikte gönderilir.',
  LUGU_USE_VOCAB_ANSWER: 'Bu kelime cevabı farklı kaydedilmeli. Sayfayı yenilemeyi dene.',
  LUGU_ASSESSMENT_ALREADY_SUBMITTED: 'Değerlendirmeni zaten gönderdin.',
  LUGU_ASSESSMENT_BELOW_MINIMUM: 'Değerlendirme puanın bu ders için gereken seviyenin biraz altında. Öğretmeninle birlikte tekrar edebilirsiniz.',
  LUGU_LESSON_INCOMPLETE: 'Dersi bitirmeden önce tamamlanmamış bir bölüm var.',
  LUGU_BREAK_ALREADY_OPEN: 'Zaten bir moladasın.',
  LUGU_BREAK_NOT_FOUND: 'Mola bulunamadı, ama sorun değil: devam edebilirsin.',
  LUGU_SCHOOL_NOT_FOUND: 'Bu okul bulunamadı. Listeden yeniden seçer misin?',
}

/** The sentence to show for any error. */
export function friendlyMessage(e: unknown): string {
  const code = toApiError(e).code
  return MESSAGES[code] ?? MESSAGES.UNKNOWN!
}
