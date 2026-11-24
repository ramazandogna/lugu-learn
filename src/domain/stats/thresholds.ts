/**
 * Tek eşik nesnesi (spec bölüm 1). Ortak kural: her eşik yalnız burada tanımlanır.
 * Spec metninde "n<2" gibi sayı olarak geçen kenar değerleri MIN_AVG ile aynı anlamdadır.
 * Yeni sabit gerekirse buraya eklenir ve spec tablosuna işlenir.
 */
export const STATS_THRESHOLDS = {
  // ── spec bölüm 1 tablosu ──
  MIN_AVG: 2,
  MIN_SLOPE: 3,
  MIN_REF_Z: 3,
  MIN_REF_10: 5,
  SD_FLOOR_PCT: 2,
  SD_FLOOR_NET: 0.5,
  DECLINE_SLOPE_PCT: -2,
  DECLINE_SLOPE_NET: -0.5,
  DECLINE_SD_K: 1,
  MIN_ATTEMPTS: 10,
  MIN_ATTEMPTS_ITEM: 3,
  STUCK_MISSES: 3,
  STALE_DAYS: 14,
  MIN_SESSIONS: 3,
  LONG_GAP_DAYS: 3,
  TARGET_ACC: 0.9,
  WEEK_MIN_DAYS: 7,

  // ── ek sabitler (spec formüllerinde sayı olarak geçenler; tabloya işlenecek) ──
  /** "ref5": N'den önceki en fazla 5 nokta. */
  REF_NEAR: 5,
  /** "ref10": N'den önceki en fazla 10 nokta. */
  REF_FAR: 10,
  /** ex_avg_last5 / ex_slope_last5 / ex_z pencere boyutları. */
  LAST_SHORT: 5,
  LAST_LONG: 10,
  /** Düşüş kuralı A: son 3 nokta eğimi. */
  DECLINE_LAST_N: 3,
  /** Düşüş kuralı B: son 6 nokta penceresi (son + önceki 5). */
  DECLINE_WINDOW: 6,
  /** ls_topic_error_density_exam: konu başına en az soru. */
  MIN_QUESTIONS_TOPIC: 5,
  /** mv_repeat_*, mv_review_lift: en az soru/kelime sayısı. */
  MIN_REPEAT_QUESTIONS: 5,
  /** tm_wrong_vs_right_ms: her grupta en az ölçüm. */
  MIN_TIMED_GROUP: 5,
  /** tm_focus_loss_per_hour: saniye cinsinden en az aktif süre. */
  FOCUS_MIN_ACTIVE_SECONDS: 600,
  /** tm_slow_accurate_flag: medyan ms eşiği. */
  SLOW_MEDIAN_MS: 7000,
  /** tm_slow_accurate_flag: doğruluk eşiği. */
  HIGH_ACCURACY: 0.85,
  /** hw_task_on_time / gecikme / tepki: en az görev. */
  MIN_TASKS_TIMING: 3,
  /** hw_task_by_subject: ders başına en az görev. */
  MIN_TASKS_SUBJECT: 2,
  /** hw_task_due_soon: bugünden sonraki gün sayısı. */
  DUE_SOON_DAYS: 3,
  /** st_weekly_days_avg: en az tam hafta. */
  MIN_FULL_WEEKS: 2,
  /** st_consistency: en az tam hafta. */
  MIN_FULL_WEEKS_CONSISTENCY: 3,
  /** st_at_risk_flag: streak en az bu kadar. */
  AT_RISK_STREAK: 3,
  /** st_momentum: karşılaştırılan pencere günü. */
  MOMENTUM_DAYS: 7,
  /** ls_stars: >= bu değer 3 yıldız. */
  STAR_3_MIN: 90,
  /** ls_stars: >= bu değer 2 yıldız, altı 1 yıldız. */
  STAR_2_MIN: 70,
  /** pc_z_vs_prev4: önceki dönem sayısı. */
  PERIOD_REF_COUNT: 4,
  /** Top-k listelerin varsayılan k değeri. */
  TOP_K: 5,
} as const
