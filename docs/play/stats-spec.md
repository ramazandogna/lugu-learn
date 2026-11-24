# Uzman analiz: istatistik spec (Faz 6)

Yazar: `analist`. Okuyan: `hamal` (toplu kod), `fe-2` (arayüz). Kod yazılmadı; bu dosya kontrattır.
Kaynak: `supabase/migrations/0001..0010`, `src/domain/analytics.ts`, `docs/database.md`.

## 0. Önce bilinmesi gerekenler

**Iki "ders" var, karıştırma.**
- `subject` = okul dersi (Fen, Matematik...). Tablo `lugu.school_subjects`. Deneme sonucu `school_exam_results.subject_id` ile bağlanır.
- `lesson` = müfredat dersi (Ders 1, Ders 2...). Tablo `lugu.curriculum_lessons` (`sequence`, `title`). Oturum, deneme-sorusu, tamamlama bunlara bağlanır.
- Belirli bir "dersin gelişimi" = param `lessonId` ile `ls_lesson_*` ailesi. Belirli okul dersi = param `subjectId` ile `ex_*` ailesi.

**Subject kodda sabit mi? HAYIR, zaten DB'de.** `school_subjects(id, name unique, sort, active)`; 0004 yedi satır tohumlar (Türkçe, Matematik, Fen Bilimleri, İnkılap, Sosyal, Din, İngilizce). Admin için RLS `for all` + grant var; arayüz `src/features/admin/academic/SubjectsCard.vue`. `src/domain/analytics.ts` ders adını parametre olarak alıyor (`subjectName(id)`); koda gömülü ders yok. Kural: `src/domain/stats/*` içinde ders adı/id sabiti YASAK; hep `subjectId` param.
Eksikler (şema bölümünde çözülür): ders için kısa ad/renk yok; sonucu olan ders silinemez (`on delete restrict`, doğru) ama "sil/arşivle" kararını veren RPC yok; konu bazında deneme kırılımı yok; öğrenciye görev/sorumluluk tablosu yok; öğrenci subject/deneme okuyamaz (admin-only, kalsın).

**Veri kaynağı özeti.**

| Kısa ad | Tablo | Kolonlar (kullanılan) |
| --- | --- | --- |
| exam | `school_exams` | `id, student_id, kind (school/mock/lgs/other), exam_date, title` |
| result | `school_exam_results` | `exam_id, subject_id, total, correct, incorrect, blank, net, score` (net trigger'la = correct - incorrect*penalty, ayar `academic.wrong_penalty` 0.25) |
| session | `learning_sessions` | `id, student_id, assignment_id, lesson_id, kind (primary/replay), status, active_seconds, idle_seconds, break_seconds, started_at, last_seen_at, completed_at` |
| section | `session_section_progress` | `session_id, section, status, attempts_count, correct_count, active_seconds, started_at, completed_at` |
| event | `session_events` | `session_id, student_id, kind (visibility_hidden/visibility_visible/fullscreen_exit/leave_warning/interrupted/resumed/idle_start/idle_end), at, data` |
| break | `break_sessions` | `session_id, after_section, planned_minutes, started_at, ended_at, early_return` |
| attempt | `question_attempts` | `session_id, student_id, section (review/vocab_quiz/story/explanation/homework/assessment), question_id, attempt_no, correct, response_ms, hint_used, created_at` |
| vocab | `vocabulary_mastery` | `student_id, package_id, item_id, correct_count (son hatadan beri), incorrect_count (ömür boyu), mastered_at, last_attempt_at, created_at` |
| assess | `assessment_results` | `session_id, student_id, quiz_percent, reading_percent, percent, submitted_at` |
| done | `lesson_completion_records` | `assignment_id, lesson_id, student_id, session_id, completed_at, summary` |
| assign | `program_assignments` | `student_id, curriculum_version_id, current_lesson_id, status, created_at` |
| pevent | `program_events` | `assignment_id, kind (backward/restart_lesson/...), created_at` |
| reward | `progress_rewards` | `student_id, amount, reason, created_at` |
| speak | `speaking_sessions` | `student_id, lesson_id, status (planned/started/ended/cancelled), planned_at, started_at, ended_at` |
| snote | `speaking_session_notes` | `speaking_session_id, observations, strengths, goals, follow_up` |
| task | `student_tasks` (0011, yeni) | bkz. şema bölümü |
| etopic | `school_exam_result_topics` (0011, yeni) | bkz. şema bölümü |

Mastery kuralı: yalnız primary oturumda; doğru -> `correct_count+1`, yanlış -> `incorrect_count+1` ve `correct_count=0`; `mastered_at` 2 doğruda set, silinmez. Bu yüzden `correct_count` ömür boyu doğru sayısı DEĞİLDİR; doğru oranı için `attempt` kullan.

## 1. Ortak tanımlar (tüm satırlar bunlara atıf yapar)

**Zaman.** Gün = `Europe/Istanbul` yerel takvim günü (`dayKey` = `YYYY-MM-DD`). Hafta = ISO, Pazartesi-Pazar. `now` her zaman param (kodda `Date.now()` yok).

**Aktif gün** = o gün en az bir `attempt` VEYA `done` kaydı olan gün. (Oturum açıp bir şey yapmayan gün sayılmaz.)

**SERI(subjectId)** = o öğrencinin sonuç satırları, `exam_date` artan, eşitlikte `exam.created_at`. Nokta alanları: `date, net, total, correct, incorrect, blank, kind, examId`, `pct = total>0 ? net/total*100 : null`. `subjectId=null` -> her denemenin tüm ders toplamı (net toplamı, total toplamı; bir ders total null ise o deneme pct=null).
`metric` param: `'pct'` (varsayılan) veya `'net'`. Aşağıda `v[i]` = seçilen metrik. `v` içinde null olan noktalar önce atılır, sonra pencere uygulanır.

**Pencere sözlüğü.**
- `lastN(k)`: sıralı serinin son k noktası (k > uzunluk ise hepsi). `none`: tüm seri.
- `days(d)`: `[now-d gün, now]`. `range(from,to)`: iki ucu dahil `dayKey` aralığı.
- `period(unit)`: `day|week|month|range`; bkz. bölüm 9.
- Bir stat birden çok pencere tipini kabul eder; meta `windows` alanında listelenir.

**Matematik (hepsi `math.ts`).**
- `mean(xs)`: n=0 -> null.
- `sd(xs)`: örneklem sd, `sqrt(sum((x-m)^2)/(n-1))`; n<2 -> null.
- `slope(ys)`: x = 0..n-1 (eşit aralık, tarih değil). `sum((x-xm)*(y-ym)) / sum((x-xm)^2)`; n<3 -> null. Birim: metrik/deneme.
- `z(v, ref)`: `(v-mean(ref)) / max(sd(ref), SD_FLOOR)`; `ref.length < MIN_REF_Z` -> null. (`SD_FLOOR` sd=0 durumunda sıfıra bölmeyi önler.)
- `safeDiv(a,b)`: b=0 veya b null/NaN -> null.
- `pctChange(from,to)`: `from<=0` -> null, yoksa `(to-from)/from*100`.
- `quantile(xs,q)`: doğrusal aradeğer; n=0 -> null.
- Yuvarlama domain'de YOK; arayüz yuvarlar.

**Eşikler (`thresholds.ts`, tek yerde, tek sabit nesne `STATS_THRESHOLDS`).**

| Sabit | Değer | Anlam |
| --- | --- | --- |
| `MIN_AVG` | 2 | ortalama için en az nokta |
| `MIN_SLOPE` | 3 | eğim için en az nokta |
| `MIN_REF_Z` | 3 | z-skor/önceki-ort için en az referans nokta |
| `MIN_REF_10` | 5 | "önceki 10" için en az referans nokta |
| `SD_FLOOR_PCT` / `SD_FLOOR_NET` | 2 / 0.5 | sd tabanı (metrik pct / net) |
| `DECLINE_SLOPE_PCT` / `DECLINE_SLOPE_NET` | -2 / -0.5 | son 3 nokta eğim eşiği (puan/deneme, net/deneme) |
| `DECLINE_SD_K` | 1 | son nokta, önceki 5 ort - K*sd altında ise düşüş |
| `MIN_ATTEMPTS` | 10 | oran istatistikleri için en az cevap |
| `MIN_ATTEMPTS_ITEM` | 3 | soru/bölüm başına en az cevap |
| `STUCK_MISSES` | 3 | takılan kelime: `incorrect_count >=` |
| `STALE_DAYS` | 14 | bayat kelime |
| `MIN_SESSIONS` | 3 | oturum bazlı oran için |
| `LONG_GAP_DAYS` | 3 | streak kopma sayılan boşluk >= gün |
| `TARGET_ACC` | 0.9 | gelişim eğrisi hedef doğruluğu |
| `WEEK_MIN_DAYS` | 7 | hız (/hafta) için en az pencere günü |

**Sonuç sözleşmesi.** Her stat `StatResult` döner (bölüm 11): `value: number | null`, `n` (kullanılan nokta/örnek sayısı), `reason?: 'insufficient' | 'no_data' | 'zero_denominator' | 'not_applicable'`, isteğe `series`, `breakdown`. Az veri eşiği altı -> `value=null`, `reason='insufficient'`, `n` doldurulur. Sıfıra bölme -> `null`, `reason='zero_denominator'`. "Sayma" statları (count) 0 döner, null DEĞİL (boş veri geçerli sıfırdır).

**Tek yönlü yorum kuralı (analytics.ts ilkesi).** Süre tek başına zayıflık etiketi doğurmaz; yorum ipuçları nötr, sebep söylemez, sayıyı verir.

## 2. Akademik denemeler (`ex_*`)

Ortak: param `subjectId` (null=toplam), `metric` ('pct' varsayılan), pencere satırda. "N. deneme" = 1-tabanlı sıra `nth` (varsayılan = son); `ref5` = N'den önceki en fazla 5 nokta (`min(5, N-1)`, en az `MIN_REF_Z`); `ref10` = önceki `min(10, N-1)` nokta (en az `MIN_REF_10`).

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ex_count` | Deneme sayısı | `len(SERI)` pencerede | result.id, exam.exam_date | lastN/days/range/none | boş = 0 | Veri derinliği; az ise diğer istatistikler zayıf. | nötr | count |
| `ex_last_net` | Son deneme neti | `SERI[-1].net` | result.net | none | seri boş -> null | Son durum; tek başına trend değil. | yüksek iyi | net |
| `ex_last_pct` | Son deneme yüzdesi | `SERI[-1].pct` | result.net, result.total | none | total null/0 -> null | Deneme büyüklüğünden bağımsız kıyas. | yüksek iyi | percent |
| `ex_avg_last5` | Son 5 deneme ortalaması | `mean(v[lastN(5)])` | result.net/total | lastN(5) | n<MIN_AVG -> null | Güncel seviye. | yüksek iyi | metrik |
| `ex_avg_last10` | Son 10 deneme ortalaması | `mean(v[lastN(10)])` | aynı | lastN(10) | n<MIN_AVG -> null | Orta vadeli seviye. | yüksek iyi | metrik |
| `ex_avg_lastn` | Son N deneme ortalaması | `mean(v[lastN(N)])` | aynı | lastN(N) param | n<MIN_AVG -> null | Admin seçtiği pencere. | yüksek iyi | metrik |
| `ex_avg_all` | Tüm deneme ortalaması | `mean(v)` | aynı | none/range | n<MIN_AVG -> null | Uzun vadeli taban. | yüksek iyi | metrik |
| `ex_slope_last5` | Son 5 deneme eğimi | `slope(v[lastN(5)])` | aynı | lastN(5) | n<MIN_SLOPE -> null | Pozitif = yükselen; birim deneme başına. | yüksek iyi | slope |
| `ex_slope_last10` | Son 10 deneme eğimi | `slope(v[lastN(10)])` | aynı | lastN(10) | n<MIN_SLOPE -> null | Daha yavaş, daha güvenilir yön. | yüksek iyi | slope |
| `ex_slope_lastn` | Son N deneme eğimi | `slope(v[lastN(N)])` | aynı | lastN(N) param | n<MIN_SLOPE -> null | Admin seçimi. | yüksek iyi | slope |
| `ex_slope_all` | Tüm dönem eğimi | `slope(v)` | aynı | none/range | n<MIN_SLOPE -> null | Genel gidişat. | yüksek iyi | slope |
| `ex_sd_lastn` | Son N deneme oynaklığı | `sd(v[lastN(N)])` | aynı | lastN(N) | n<MIN_SLOPE -> null | Yüksek sd = tutarsız sonuç. | düşük iyi | metrik |
| `ex_cv_lastn` | Değişim katsayısı | `safeDiv(sd, mean)` aynı pencere | aynı | lastN(N) | mean<=0 -> null | Seviyeden bağımsız tutarlılık. | düşük iyi | ratio |
| `ex_best` | En iyi deneme | `max(v)` | aynı | lastN/range/none | boş -> null | Tavan potansiyel. | yüksek iyi | metrik |
| `ex_worst` | En kötü deneme | `min(v)` | aynı | lastN/range/none | boş -> null | Taban; aykırı mı kalıcı mı bak. | yüksek iyi | metrik |
| `ex_range_lastn` | Aralık (maks-min) | `max-min` | aynı | lastN(N) | n<2 -> null | Dalgalanma genişliği. | düşük iyi | metrik |
| `ex_delta_last_prev` | Son - önceki deneme | `v[-1]-v[-2]` | aynı | none | n<2 -> null | Anlık değişim; gürültülü. | yüksek iyi | metrik |
| `ex_delta_nth_prev5` | N. deneme - önceki 5 ort. | `v[N]-mean(ref5)` | aynı | nth param | ref5<MIN_REF_Z -> null | N. deneme kendi yakın geçmişine göre ne kadar sapmış. | yüksek iyi | metrik |
| `ex_delta_nth_prev10` | N. deneme - önceki 10 ort. | `v[N]-mean(ref10)` | aynı | nth param | ref10<MIN_REF_10 -> null | Daha uzun referansa göre sapma. | yüksek iyi | metrik |
| `ex_pctchange_nth_prev5` | N. deneme, önceki 5'e göre % | `pctChange(mean(ref5), v[N])` | aynı | nth param | ref ort<=0 -> null | Göreli değişim. | yüksek iyi | percent |
| `ex_z_nth_prev5` | N. deneme z-skoru (önceki 5) | `z(v[N], ref5)` | aynı | nth param | ref5<MIN_REF_Z -> null; sd=0 -> SD_FLOOR | |z|>=1 dikkate değer, <=-1 belirgin düşüş. | yüksek iyi | z |
| `ex_z_nth_prev10` | N. deneme z-skoru (önceki 10) | `z(v[N], ref10)` | aynı | nth param | ref10<MIN_REF_10 -> null | Uzun referanslı sapma. | yüksek iyi | z |
| `ex_decline_slope3` | Düşüş kuralı A: son 3 eğim | `slope(v[lastN(3)]) < DECLINE_SLOPE` -> 1 yoksa 0; value = eğim, `flag` breakdown'da | aynı | lastN(3) | n<3 -> null | Üç denemedir sürekli iniş. | düşük iyi (eğim) | slope |
| `ex_decline_sd` | Düşüş kuralı B: son nokta sd altı | `v[-1] < mean(ref5) - DECLINE_SD_K*max(sd(ref5),SD_FLOOR)`; ref5 son noktadan ÖNCEKİ 5 | aynı | lastN(6) | ref5<MIN_REF_Z -> null | Son deneme olağan bandın altında. | yüksek iyi | flag |
| `ex_decline_flag` | Ders düşüş işareti | `sev = (A?1:0)+(B?1:0)`; A ve B null ise null; value=sev (0,1,2) | yukarıdaki iki kural | lastN(6) | ikisi de null -> null; biri null -> yalnız diğeri sayılır | 0 sorun yok, 1 uyarı, 2 belirgin düşüş. Ders listesinde vurgula. | düşük iyi | count |
| `ex_decline_magnitude` | Düşüş büyüklüğü | `mean(ref5) - v[-1]` (pozitif = düşüş) | aynı | lastN(6) | ref5<MIN_REF_Z -> null | Ne kadar puan/net kaybedildi. | düşük iyi | metrik |
| `ex_decline_subjects` | Düşen ders sayısı + liste | tüm aktif subject için `ex_decline_flag`; value = `count(sev>=1)`; breakdown = `[{key:subjectId,value:sev,n,extra:magnitude}]` sev desc, magnitude desc | result, school_subjects.active | lastN(6) her ders | verisi yetersiz dersler listede `value=null`, sayıya girmez | Admin "hangi derslerde düşüş var" ekranı. | düşük iyi | count |
| `ex_consec_declines` | Üst üste düşüş | sondan geriye `v[i]<v[i-1]` sağlanan adım sayısı | aynı | none | n<2 -> 0 | Seri düşüş uzunluğu. | düşük iyi | count |
| `ex_consec_gains` | Üst üste yükseliş | sondan geriye `v[i]>v[i-1]` | aynı | none | n<2 -> 0 | Seri yükseliş. | yüksek iyi | count |
| `ex_correct_rate` | Doğru oranı | `safeDiv(sum(correct), sum(D))`, `D=coalesce(total, correct+incorrect+blank)` | result.correct/incorrect/blank/total | lastN/range | sum(D)=0 -> null | Bilgi düzeyi. | yüksek iyi | ratio |
| `ex_wrong_rate` | Yanlış oranı | `safeDiv(sum(incorrect), sum(D))` | aynı | lastN/range | sum(D)=0 -> null | Yanlış yapma eğilimi. | düşük iyi | ratio |
| `ex_blank_rate` | Boş bırakma oranı | `safeDiv(sum(blank), sum(D))` | aynı | lastN/range | sum(D)=0 -> null | Yüksek: çekingen ya da süre yetmemesi (sebep söyleme). | düşük iyi | ratio |
| `ex_blank_vs_wrong` | Boş / (boş+yanlış) | `safeDiv(sum(blank), sum(blank)+sum(incorrect))` | aynı | lastN/range | payda 0 -> null | 1'e yakın: bilmediğinde boş bırakıyor; 0'a yakın: tahmin ediyor. | nötr | ratio |
| `ex_penalty_loss` | Yanlış cezası kaybı | `sum(correct - net)` | result.correct, result.net | lastN/range | boş -> 0 | Yanlışların net'ten götürdüğü toplam. | düşük iyi | net |
| `ex_kind_gap` | Genel/okul sınav farkı | `mean(pct[kind in lgs,mock]) - mean(pct[kind=school])` | exam.kind, result | range/none | iki grupta da n>=MIN_AVG değilse null | Deneme ortamında performans düşüyor mu. | yüksek iyi | points |
| `ex_total_net_last` | Son deneme toplam net | `sum(net)` son denemenin tüm dersleri | result.net | none | boş -> null | Genel puan gidişi. | yüksek iyi | net |
| `ex_subject_rank` | Ders sırası | aktif derslerin `ex_avg_last5(pct)` büyükten küçüğe; value = verilen `subjectId`'nin sırası (1=en iyi); breakdown tüm sıra | result, school_subjects | lastN(5) her ders | ders n<MIN_AVG ise sıraya girmez, value null | En güçlü/zayıf ders. | nötr | rank |
| `ex_weakest_subject` | En zayıf ders | breakdown'ın sonu; value = o dersin pct ort., `key` = subjectId | aynı | lastN(5) | hiç ders yeterli değil -> null | Önce hangi derse bakılır. | düşük iyi | percent |
| `ex_exam_interval_days` | Denemeler arası gün | `mean(date[i]-date[i-1])` | exam.exam_date | range/none | <2 deneme -> null | Deneme sıklığı; seyrek ise trend zayıf. | düşük iyi | days |
| `ex_days_since_last` | Son denemeden beri gün | `now - date[-1]` | exam.exam_date | none | boş -> null | Veri tazeliği. | düşük iyi | days |

## 3. Ders / konu ilerlemesi (`ls_*`)

"Konu/bölüm" = `lesson` (konu) ve `section` (bölüm: review, vocabulary, vocab_quiz, story, explanation, homework, assessment). Hata yoğunluğu = `yanlış cevap / toplam cevap` (`attempt.correct=false`). Param `lessonId` (null = hepsi). Ders = `lessonId` ile `session.lesson_id` üzerinden bağlanır; cevap -> `attempt.session_id` -> `session.lesson_id`.

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ls_completed_count` | Biten ders sayısı | `count(distinct lesson_id)` done kayıtları | done.lesson_id, completed_at | days/range/none | boş = 0 | İlerleme hacmi. | yüksek iyi | count |
| `ls_progress_pct` | Program ilerlemesi | `safeDiv(count(distinct done.lesson_id) , count(lessons status<>archived in version))*100` | done, curriculum_lessons.version_id/status, assign | none | payda 0 -> null | Programın yüzde kaçı bitti. | yüksek iyi | percent |
| `ls_completions_per_week` | Haftalık ders hızı | `count(done in pencere) / (pencere_gün/7)` | done.completed_at | days/range | pencere<WEEK_MIN_DAYS -> null | Tempo. | yüksek iyi | per_week |
| `ls_avg_days_per_lesson` | Ders başına ortalama gün | `mean(completed_at[i]-completed_at[i-1])` gün | done.completed_at | range/none | <2 kayıt -> null | Bir dersin sürdüğü gerçek gün. | düşük iyi | days |
| `ls_stall_days` | Takılı kalma günü | `now - max(son done.completed_at, assign.created_at)` aktif assignment için | done, assign | none | assignment completed/yok -> null | Uzun süre ders bitmiyorsa. | düşük iyi | days |
| `ls_backward_moves` | Geri alma sayısı | `count(pevent.kind='backward')` | pevent.kind | days/range | boş = 0 | Admin öğrenciyi geri götürdü; konu oturmamış. | düşük iyi | count |
| `ls_restart_count` | Ders yeniden başlatma | `count(pevent.kind='restart_lesson')` | pevent.kind | days/range | boş = 0 | Aynı dersi baştan aldırma. | düşük iyi | count |
| `ls_accuracy` | Doğruluk | `safeDiv(count(correct), count(attempt))` | attempt.correct | days/range/lessonId | n<MIN_ATTEMPTS -> null | Genel doğru oranı. | yüksek iyi | ratio |
| `ls_first_try_accuracy` | İlk denemede doğruluk | `safeDiv(count(attempt_no=1 and correct), count(attempt_no=1))` | attempt.attempt_no/correct | days/range/lessonId | n1<MIN_ATTEMPTS -> null | Gerçek bilgi; tekrarla düzelen doğruyu dışlar. | yüksek iyi | ratio |
| `ls_hint_rate` | İpucu kullanım oranı | `safeDiv(count(hint_used), count(attempt))` | attempt.hint_used | days/range/lessonId | n<MIN_ATTEMPTS -> null | Yüksek: ipucuna bağımlı (analytics.ts `hintRate`). | düşük iyi | ratio |
| `ls_attempts_per_question` | Soru başına deneme | `mean over question_id of count(attempts)` | attempt.question_id | days/range/lessonId | soru sayısı 0 -> null | >1: tekrarla çözüyor. | düşük iyi | ratio |
| `ls_section_error_density` | Bölüm hata yoğunluğu | bölüm başına `safeDiv(count(!correct), count(attempt))`; value = tümünün oranı; breakdown = `[{key:section,value,n}]` | attempt.section/correct | days/range/lessonId | bölüm n<MIN_ATTEMPTS_ITEM -> o bölüm value=null | Hangi bölümde hata yığılıyor. | düşük iyi | ratio |
| `ls_hardest_section` | En zor bölüm | `argmax(bölüm hata oranı)` n>=MIN_ATTEMPTS ; value=oran, `key`=section | aynı | days/range/lessonId | hiç bölüm yeterli değil -> null | Önce hangi bölüme çalışılır. | düşük iyi | ratio |
| `ls_question_error_density` | Soru hata yoğunluğu (en kötü k) | soru başına `incorrect/attempts`, n>=MIN_ATTEMPTS_ITEM, azalan sırala, ilk `k` (varsayılan 5); value = en kötünün oranı; breakdown liste | attempt.question_id/correct | days/range/lessonId | yeterli soru yok -> null | Tekrarlayan hatalı sorular (analytics.ts `questionStats`). | düşük iyi | ratio |
| `ls_lesson_error_density` | Ders (konu) hata yoğunluğu | lesson başına `incorrect/attempts`; breakdown `[{key:lessonId,value,n}]` sequence sırasıyla | attempt, session.lesson_id, curriculum_lessons.sequence | days/range | lesson n<MIN_ATTEMPTS -> null | Hangi konularda hata yoğun. | düşük iyi | ratio |
| `ls_topic_error_density_exam` | Deneme konu hata yoğunluğu | konu başına `sum(incorrect)/sum(correct+incorrect+blank)`; breakdown konu listesi; subjectId param | etopic.topic/correct/incorrect/blank (0011) | lastN(k)/range | konu n<5 soru -> null; tablo yoksa `not_applicable` | Okul dersinde hangi konu zayıf. | düşük iyi | ratio |
| `ls_assessment_last` | Son değerlendirme % | `assess.percent` en son | assess.percent, submitted_at | none | yok -> null | Ders sonu sınav sonucu. | yüksek iyi | percent |
| `ls_assessment_avg_lastn` | Son N değerlendirme ort. | `mean(percent[lastN(N)])` | assess.percent | lastN(N) | n<MIN_AVG -> null | Ders sonu seviyesi. | yüksek iyi | percent |
| `ls_assessment_slope_lastn` | Değerlendirme eğimi | `slope(percent[lastN(N)])` | assess.percent | lastN(N) | n<MIN_SLOPE -> null | Dersten derse ilerliyor mu. | yüksek iyi | slope |
| `ls_assessment_z_nth_prev5` | N. değerlendirme z (önceki 5) | `z(percent[N], ref5)` | assess.percent | nth | ref5<MIN_REF_Z -> null | Son ders sınavı olağandışı düşük mü. | yüksek iyi | z |
| `ls_stars_avg` | Ortalama yıldız | `mean(stars(percent))`, stars: >=90 -> 3, >=70 -> 2, yoksa 1; her ders için ilk primary tamamlama | assess.percent, done.session_id | lastN/range | n<MIN_AVG -> null | `lesson_stars` ile aynı kural. | yüksek iyi | ratio |
| `ls_lesson_curve_series` | Dersin gelişim eğrisi (seri) | `lessonId` derse ait oturumları `started_at` artan sırala (primary+replay); `y[i] = safeDiv(count(correct), count(attempt))` o oturum; series = `[{x:session.started_at, y}]`; oturumu cevapsız olan atılır; value = son y | session, attempt | lessonId zorunlu; none | <1 oturum -> value null | "Ders 2'de nasıl ilerledi" çizgisi. | yüksek iyi | ratio |
| `ls_lesson_curve_slope` | Dersin gelişim eğimi | `slope(y)` yukarıdaki seri | aynı | lessonId | n<MIN_SLOPE -> null | Tekrarlandıkça iyileşiyor mu. | yüksek iyi | slope |
| `ls_lesson_curve_delta` | Dersin ilk-son farkı | `y[-1]-y[0]` | aynı | lessonId | n<2 -> null | Toplam kazanım. | yüksek iyi | points |
| `ls_lesson_attempts_to_target` | Hedefe kaç oturumda | ilk `i` (1-tabanlı) `y[i]>=TARGET_ACC`; yoksa null | aynı | lessonId | hiç ulaşmadı -> null, reason='not_applicable' | Dersi oturtma hızı. | düşük iyi | count |
| `ls_lesson_assessment_curve` | Dersin değerlendirme eğrisi | `lessonId` oturumlarının `assess.percent` serisi (submitted_at artan); value = son | assess, session.lesson_id | lessonId | yok -> null | Ders sonu sınav gelişimi. | yüksek iyi | percent |
| `ls_lesson_compare_prev5` | Ders, önceki 5 derse göre | her ders için ilk primary oturum doğruluğu `a[j]` (sequence sıralı); `a[L]-mean(a[L-5..L-1])` ve `z` breakdown'da | session, attempt, curriculum_lessons.sequence | lessonId | ref<MIN_REF_Z -> null | Bu ders diğerlerinden zor mu. | yüksek iyi | points |
| `ls_lesson_decline_flag` | Konu düşüş işareti | `a[j]` serisine (sequence sıralı) `ex_decline_*` kuralları (A: son 3 eğim, B: son nokta - önceki 5 ort. - 1 sd) | aynı | lastN(6) | ref<MIN_REF_Z -> null | Son derslerde konu bazlı gerileme. | düşük iyi | count |

## 4. Mastery / kelime (`mv_*`)

Kelime = `vocab` satırı (`student_id, package_id, item_id`). Param: `lessonId` (paket -> ders; null hepsi). Yalnız primary oturum mastery'yi değiştirir.

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mv_seen_count` | Görülen kelime | `count(vocab)` | vocab.* | range(created_at)/none | boş = 0 | Karşılaşılan kelime. | yüksek iyi | count |
| `mv_mastered_count` | Öğrenilen kelime | `count(mastered_at is not null)` | vocab.mastered_at | range(mastered_at)/none | boş = 0 | Kalıcı kazanım (silinmez). | yüksek iyi | count |
| `mv_mastery_rate` | Mastery oranı | `safeDiv(mastered, seen)` | vocab | none/range | seen=0 -> null | Görülenin ne kadarı oturdu. | yüksek iyi | ratio |
| `mv_mastered_per_week` | Mastery hızı | `count(mastered_at in pencere) / (pencere_gün/7)` | vocab.mastered_at | days/range | pencere<WEEK_MIN_DAYS -> null | Haftada kaç kelime oturtuyor. | yüksek iyi | per_week |
| `mv_median_days_to_master` | Öğrenme süresi (medyan gün) | `median(mastered_at - created_at)` gün, mastered olanlar | vocab.created_at, mastered_at | range(mastered_at)/none | n<MIN_AVG -> null | İlk karşılaşmadan oturmaya geçen gün. | düşük iyi | days |
| `mv_stuck_words` | Takılan kelime | `count(mastered_at is null and incorrect_count>=STUCK_MISSES)`; breakdown kelime listesi `incorrect_count` azalan | vocab.incorrect_count, mastered_at | none | boş = 0 | Tekrar edilmesi gereken kelimeler. | düşük iyi | count |
| `mv_stale_words` | Bayat kelime | `count(mastered_at is null and last_attempt_at < now-STALE_DAYS)` | vocab.last_attempt_at | none | last_attempt_at null -> atla | Yarım bırakılmış kelime. | düşük iyi | count |
| `mv_vocab_accuracy` | Kelime sınavı doğruluğu | `safeDiv(correct, total)` `attempt.section='vocab_quiz'` | attempt | days/range/lessonId | n<MIN_ATTEMPTS -> null | Kelime bilgisi doğruluğu. | yüksek iyi | ratio |
| `mv_repeat_gain` | Tekrar etkisi | soru başına (>=2 cevap): `last_correct(0/1) - first_correct(0/1)`, ortalama; `attempt_no` sıralı | attempt.question_id/attempt_no/correct | days/range/lessonId | >=2 cevaplı soru <5 -> null | Aynı soruyu tekrarlayınca ne kadar düzeliyor. | yüksek iyi | points |
| `mv_repeat_recovery` | Hatadan toparlanma | `safeDiv(sorular: ilk cevap yanlış ve sonra en az bir doğru, sorular: ilk cevap yanlış ve >=2 cevap)` | attempt | days/range/lessonId | payda<5 -> null | Yanlış yaptığını sonra düzeltiyor mu. | yüksek iyi | ratio |
| `mv_review_accuracy` | Tekrar bölümü doğruluğu | `safeDiv(correct, total)` `attempt.section='review'` | attempt | days/range | n<MIN_ATTEMPTS -> null | Eski zayıf kelimelerde başarı. | yüksek iyi | ratio |
| `mv_review_lift` | Tekrar bölümü kazancı | `mv_review_accuracy - ilk-deneme-doğruluğu(vocab_quiz, aynı kelimeler)`; kelime = `review` cevabı olan `question_id` | attempt (review, vocab_quiz) | range | ortak kelime<5 -> null | Tekrar bölümü ilk karşılaşmadan daha iyi mi. | yüksek iyi | points |
| `mv_replay_gain` | Tekrar oturumu kazancı | `ls_accuracy(session.kind='replay') - ls_accuracy(kind='primary')` aynı ders kümesi | session.kind, attempt | lessonId/range | iki kind'da n<MIN_ATTEMPTS -> null | Dersi yeniden oynamak işe yarıyor mu. | yüksek iyi | points |
| `mv_per_lesson` | Ders başına öğrenilen kelime | `safeDiv(mastered, count(distinct done.lesson_id))` | vocab, done | none | ders=0 -> null | Her dersin kelime verimi. | yüksek iyi | ratio |

## 5. Zaman ve odak (`tm_*`)

Süre alanı birimi saniye. Oturum süresi yalnız `status in (completed, abandoned, active)` hepsi; "tamamlanan" belirtilirse yalnız `completed`. Odak olayları `event.kind`. Gizli süre: aynı oturumda `visibility_hidden` -> sıradaki `visibility_visible` farkı (sn); eşleşmeyen gizli olay 0 sn sayılır, `unmatched` sayacına eklenir.

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tm_active_minutes` | Aktif çalışma süresi | `sum(session.active_seconds)/60` | session.active_seconds | days/range/lessonId | boş = 0 | Gerçek çalışma. | yüksek iyi | minutes |
| `tm_session_count` | Oturum sayısı | `count(session)` | session.started_at | days/range/lessonId | boş = 0 | Çalışma sıklığı. | nötr | count |
| `tm_session_active_avg` | Ortalama oturum süresi (aktif) | `mean(active_seconds)/60` | session.active_seconds | days/range | n<MIN_SESSIONS -> null | Tipik oturum uzunluğu. | nötr | minutes |
| `tm_session_active_median` | Medyan oturum süresi | `median(active_seconds)/60` | aynı | days/range | n<MIN_SESSIONS -> null | Aykırı oturumlardan etkilenmez. | nötr | minutes |
| `tm_session_wall_avg` | Ortalama duvar saati süresi | `mean(completed_at-started_at)/60` yalnız completed | session.started_at/completed_at | days/range | n<MIN_SESSIONS -> null | Aktif süreyle farkı = bekleme/mola. | nötr | minutes |
| `tm_completion_rate` | Oturum tamamlama oranı | `safeDiv(count(status=completed), count(status in completed,abandoned))` | session.status | days/range | payda<MIN_SESSIONS -> null | Başladığını bitirme. | yüksek iyi | ratio |
| `tm_abandon_rate` | Yarım bırakma oranı | `safeDiv(count(abandoned), count(completed,abandoned))` | session.status | days/range | payda<MIN_SESSIONS -> null | Tekrarlayan yarım bırakma (analytics.ts `repeated_abandonment`). | düşük iyi | ratio |
| `tm_idle_share` | Boşta kalma payı | `safeDiv(sum(idle_seconds), sum(active+idle))` | session | days/range | payda 0 -> null | Ekranda ama etkin değil. | düşük iyi | ratio |
| `tm_break_share` | Mola payı | `safeDiv(sum(break_seconds), sum(active+break))` | session | days/range | payda 0 -> null | Mola dengesi. | nötr | ratio |
| `tm_focus_loss_count` | Odak kaybı sayısı | `count(event.kind='visibility_hidden')` | event.kind | days/range/lessonId | boş = 0 | Sekme/uygulama terk. | düşük iyi | count |
| `tm_focus_loss_per_hour` | Saatte odak kaybı | `safeDiv(focus_loss_count, sum(active_seconds)/3600)` | event, session.active_seconds | days/range | aktif süre<600 sn -> null | Süreye göre normalize odak kaybı. | düşük iyi | per_hour |
| `tm_hidden_seconds` | Toplam gizli kalma süresi | eşleşen hidden->visible farkı toplamı | event.at | days/range | eşleşme yok = 0 | Ders ekranından uzak kalınan süre. | düşük iyi | seconds |
| `tm_hidden_share` | Gizli kalma payı | `safeDiv(tm_hidden_seconds, sum(session.active+idle))` | event, session | days/range | payda 0 -> null | Oturumun ne kadarı ekran dışı. | düşük iyi | ratio |
| `tm_fullscreen_exits` | Tam ekran çıkışı | `count(kind='fullscreen_exit')` | event.kind | days/range | boş = 0 | Test modu ihlali eğilimi. | düşük iyi | count |
| `tm_longest_focus_run` | En uzun kesintisiz odak | oturum içinde art arda `visibility_hidden` olayları arası en büyük fark (sn; ilk/son sınır = started_at/last_seen_at) ; value = tüm oturumlarda max | event.at, session.started_at/last_seen_at | days/range | oturum yok -> null | Kesintisiz çalışabildiği en uzun süre. | yüksek iyi | seconds |
| `tm_response_ms_median` | Medyan cevap süresi | `median(response_ms)` null olmayanlar | attempt.response_ms | days/range/lessonId | n<MIN_ATTEMPTS -> null | Hız; yalnız doğrulukla yorumla. | nötr | ms |
| `tm_response_ms_p90` | Cevap süresi %90 | `quantile(response_ms, 0.9)` | aynı | days/range | n<MIN_ATTEMPTS -> null | Uzun duraksamalar. | düşük iyi | ms |
| `tm_slow_accurate_flag` | Yavaş ama doğru | `median_ms >= 7000 and accuracy >= 0.85` -> 1 yoksa 0 (analytics.ts `slowMedianMs`, `highAccuracy`) | attempt | days/range | n<MIN_ATTEMPTS -> null | Hız tek başına zayıflık değil; bilgi var, akıcılık geliştirilebilir. | nötr | flag |
| `tm_wrong_vs_right_ms` | Yanlış - doğru cevap süresi | `median(response_ms | !correct) - median(response_ms | correct)` | attempt | days/range | iki grupta n>=5 değilse null | Pozitif: yanlışlarda daha çok düşünüyor. Negatif: acele edip yanlış yapıyor. | nötr | ms |
| `tm_peak_hour` | En çok çalışılan saat | `mode(hour(session.started_at))` yerel saat; breakdown 0-23 oturum sayıları | session.started_at | range/days | oturum<MIN_SESSIONS -> null | Çalışma saati düzeni. | nötr | rank |
| `tm_section_time_share` | Bölüm süre payı | bölüm başına `sum(section.active_seconds)/sum(hepsi)`; breakdown | section.active_seconds | days/range/lessonId | toplam 0 -> null | Zaman nereye gidiyor. | nötr | ratio |
| `tm_break_early_return_rate` | Mola erken dönüş oranı | `safeDiv(count(early_return=true), count(ended_at not null))` | break | days/range | payda<MIN_SESSIONS -> null | Moladan erken dönmek: motivasyon ya da dinlenmeden devam. | nötr | ratio |

## 6. Streak ve alışkanlık (`st_*`)

`G` = pencere içindeki aktif günler kümesi (bölüm 1 tanımı), `dayKey` sıralı. Streak = ardışık aktif gün sayısı. Bugün henüz aktif değilse dünün streak'i korunur (bugün kırılma sayılmaz).

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `st_active_days` | Aktif gün sayısı | `len(G)` | attempt.created_at, done.completed_at | days/range | boş = 0 | Çalışma sıklığı. | yüksek iyi | count |
| `st_active_ratio` | Aktif gün oranı | `safeDiv(len(G), pencere_gün_sayısı)` | aynı | days/range | pencere 0 gün -> null | Günlerin ne kadarında çalıştı. | yüksek iyi | ratio |
| `st_current_streak` | Güncel streak | `now` dahil geriye ardışık aktif gün; bugün aktif değil ise dünden say | aynı | none | hiç aktif yok = 0 | Süren seri. | yüksek iyi | days |
| `st_longest_streak` | En uzun streak | `G`'deki en uzun ardışık dizi | aynı | days/range/none | boş = 0 | Rekor. | yüksek iyi | days |
| `st_streak_health` | Streak sağlığı | `safeDiv(st_current_streak, st_longest_streak)` | yukarıdakiler | none | longest=0 -> null | 1: rekorda; 0'a yakın: seriyi kaybetmiş. | yüksek iyi | ratio |
| `st_streak_breaks` | Streak kopma sayısı | pencerede ardışık iki aktif gün arası fark >= `LONG_GAP_DAYS`+1 olan sayısı | aynı | days/range | <2 aktif gün = 0 | Alışkanlığın kaç kez kesildiği. | düşük iyi | count |
| `st_days_since_active` | Son aktiviteden beri gün | `now - max(G)` | aynı | none | hiç aktif yok -> null | Uzun sessizlik uyarısı. | düşük iyi | days |
| `st_at_risk_flag` | Streak riski | `st_current_streak>=3 and bugün aktif değil` -> 1 yoksa 0 | aynı | none | streak<3 = 0 | Bugün çalışmazsa seri kopacak. | düşük iyi | flag |
| `st_longest_gap` | En uzun boşluk | pencerede ardışık aktif günler arası en büyük (fark-1) | aynı | days/range | <2 aktif gün -> null | En uzun çalışmama süresi. | düşük iyi | days |
| `st_weekly_days_avg` | Haftalık ortalama aktif gün | `mean(her ISO haftada len(G))` tam haftalar | aynı | range/days | tam hafta<2 -> null | Düzen; 4+ iyi. | yüksek iyi | count |
| `st_consistency` | Düzenlilik | `1 - safeDiv(sd(haftalık aktif gün), mean(haftalık aktif gün))`, [0,1]'e kırp | aynı | range/days | tam hafta<3 veya mean=0 -> null | 1'e yakın: her hafta aynı düzen. | yüksek iyi | ratio |
| `st_weekend_share` | Hafta sonu payı | `safeDiv(count(G içinde Cmt/Paz), len(G))` | aynı | days/range | len(G)=0 -> null | Çalışma gününün dağılımı. | nötr | ratio |
| `st_momentum` | İvme | `aktif_gün(son 7 gün) - aktif_gün(önceki 7 gün)` | aynı | now bazlı | pencere sabit (14 gün) | Pozitif: hızlanıyor, negatif: yavaşlıyor. | yüksek iyi | count |

## 7. Ödev ve sorumluluk (`hw_*`)

İki kaynak: (a) ders içi ödev bölümü (`homework`), (b) admin'in atadığı görev (`student_tasks`, 0011). Görev durumu: `open | in_progress | done | cancelled`. İptal edilenler (`cancelled`) tüm sayımlarda dışlanır. Gecikmiş = `status in (open,in_progress) and due_date < bugün(yerel)`. Zamanında = `status=done and due_date is not null and date(completed_at yerel) <= due_date`. `due_date` null olan görev "zamanında" paydasına girmez.

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `hw_section_completion` | Ders içi ödev bitirme oranı | `safeDiv(count(section='homework' and status=completed), count(section='homework' and status<>not_started))` | section.section/status | days/range/lessonId | payda<MIN_SESSIONS -> null | Ödev bölümü bitiriliyor mu. | yüksek iyi | ratio |
| `hw_section_accuracy` | Ders içi ödev doğruluğu | `safeDiv(correct, total)` `attempt.section='homework'` | attempt | days/range/lessonId | n<MIN_ATTEMPTS -> null | Ödev bölümünde bilgi düzeyi. | yüksek iyi | ratio |
| `hw_task_total` | Atanan görev sayısı | `count(task, status<>cancelled)` created_at pencerede | task.created_at/status | days/range/subjectId | boş = 0 | Yük. | nötr | count |
| `hw_task_done` | Biten görev sayısı | `count(status=done)` completed_at pencerede | task.completed_at | days/range/subjectId | boş = 0 | Üretim. | yüksek iyi | count |
| `hw_task_completion_rate` | Görev tamamlama oranı | `safeDiv(count(done), count(status<>cancelled))` son tarihi pencere içinde olanlar (`due_date` yoksa `created_at`) | task | days/range/subjectId | payda 0 -> null | Sorumluluk alma. | yüksek iyi | ratio |
| `hw_task_on_time_rate` | Zamanında bitirme oranı | `safeDiv(count(zamanında), count(done and due_date not null))` | task.due_date/completed_at | days/range/subjectId | payda<3 -> null | Teslim disiplini. | yüksek iyi | ratio |
| `hw_task_overdue_count` | Geciken görev | `count(gecikmiş)` bugün itibarıyla | task.status/due_date | none/subjectId | boş = 0 | Acil müdahale listesi. | düşük iyi | count |
| `hw_task_avg_delay_days` | Ortalama gecikme | `mean(max(0, date(completed_at) - due_date))` done+due_date olanlar | task | days/range | n<3 -> null | Geç teslimde ne kadar geç. | düşük iyi | days |
| `hw_task_lead_days` | Atamadan bitişe gün | `mean(date(completed_at) - date(created_at))` done olanlar | task | days/range/subjectId | n<3 -> null | Tepki hızı. | düşük iyi | days |
| `hw_task_open_count` | Açık görev | `count(status in open,in_progress)` | task.status | none/subjectId | boş = 0 | Birikmiş iş. | düşük iyi | count |
| `hw_task_due_soon` | Yaklaşan görev | `count(açık and due_date in [bugün, bugün+3])` | task | none | boş = 0 | Önümüzdeki 3 gün. | düşük iyi | count |
| `hw_task_by_subject` | Ders bazında görev tamamlama | `hw_task_completion_rate` her `subject_id` için; breakdown | task.subject_id | days/range | ders başına payda<2 -> null | Hangi derste görev aksıyor. | yüksek iyi | ratio |
| `hw_task_streak` | Zamanında görev serisi | tarihe göre sondan geriye art arda zamanında bitenler | task | none | boş = 0 | Teslim alışkanlığı. | yüksek iyi | count |

## 8. Konuşma (`sp_*`)

Konuşma oturumu admin'in planladığı birebir görüşme (`speaking_sessions`). Skor yok; yalnız hacim, düzen, not kapsaması.

| id | Ad | Formül | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sp_count` | Gerçekleşen konuşma | `count(status=ended)` ended_at pencerede | speak.status/ended_at | days/range/lessonId | boş = 0 | Konuşma pratiği hacmi. | yüksek iyi | count |
| `sp_completion_rate` | Konuşma gerçekleşme oranı | `safeDiv(count(ended), count(status in ended,cancelled))` planned_at pencerede | speak.status | days/range | payda 0 -> null | Planlananın yapılması. | yüksek iyi | ratio |
| `sp_cancel_rate` | İptal oranı | `safeDiv(count(cancelled), count(planned olmuş toplam))` | speak.status | days/range | payda 0 -> null | İptal çoksa takvim sorunu. | düşük iyi | ratio |
| `sp_avg_minutes` | Ortalama konuşma süresi | `mean(ended_at-started_at)/60` ended olanlar | speak.started_at/ended_at | days/range | n<2 -> null | Konuşma uzunluğu. | yüksek iyi | minutes |
| `sp_per_week` | Haftalık konuşma | `sp_count / (pencere_gün/7)` | speak | days/range | pencere<WEEK_MIN_DAYS -> null | Düzen. | yüksek iyi | per_week |
| `sp_days_since_last` | Son konuşmadan beri gün | `now - max(ended_at)` | speak.ended_at | none | hiç yok -> null | Uzun ara. | düşük iyi | days |
| `sp_note_coverage` | Not kapsaması | `safeDiv(count(ended with >=1 snote), count(ended))` | speak, snote.speaking_session_id | days/range | payda 0 -> null | Görüşmeler kayda alınıyor mu. | yüksek iyi | ratio |
| `sp_open_followups` | Açık takip sayısı | `count(snote where follow_up not null and btrim(follow_up)<>'')` en son notu olan konuşmalarda | snote.follow_up | none | boş = 0 | Yapılacak takipler. | düşük iyi | count |

## 9. Dönem kıyasları (`pc_*`)

Dönem birimi `unit`:
- `day`: bugün vs dün (aynı saate kadar kıyas yok; tam gün dünle, bugün kısmi ise `partial=true`).
- `week`: ISO hafta başından bugüne vs önceki haftanın aynı sayıda günü.
- `month`: ay başından bugüne vs önceki ayın aynı sayıda günü (önceki ay kısa ise önceki ayın sonu).
- `range`: `[from,to]` vs hemen öncesindeki aynı uzunlukta aralık.

`cur` ve `prev` pencereleri `periodWindows(unit, now, from?, to?)` üretir (`windows.ts`). Her `pc_*` bir taban stat'ı (yan tabloda) iki pencerede çalıştırır. Çıktı: `value = cur - prev`; `breakdown = [{key:'cur',value}, {key:'prev',value}, {key:'pct_change',value}]`; `pct_change = pctChange(prev, cur)` (prev<=0 -> null). Taban stat'ın birinde null varsa `value=null`, `reason='insufficient'`. Taban stat n eşikleri geçerli.

| id | Ad | Taban stat | Girdi | Pencere | Kenar durumları | Yorum ipucu | Yön | Birim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pc_generic` | Genel dönem farkı | param `statId` (herhangi bir tek-pencereli stat) | taban | period | `statId` bilinmiyor -> hata | Admin istediği stat'ı iki dönemde kıyaslar. | taban yönü | taban |
| `pc_active_minutes` | Çalışma süresi farkı | `tm_active_minutes` | session | period | cur=prev=0 -> value 0, pct null | Daha çok mu az mı çalıştı. | yüksek iyi | minutes |
| `pc_active_days` | Aktif gün farkı | `st_active_days` | attempt, done | period | prev=0 -> pct null | Sıklık değişimi. | yüksek iyi | count |
| `pc_lessons` | Biten ders farkı | `ls_completed_count` | done | period | prev=0 -> pct null | İlerleme hızı değişimi. | yüksek iyi | count |
| `pc_accuracy` | Doğruluk farkı | `ls_accuracy` | attempt | period | iki dönemde de n>=MIN_ATTEMPTS yoksa null | Bilgi düzeyi değişimi (puan). | yüksek iyi | points |
| `pc_first_try_accuracy` | İlk deneme doğruluğu farkı | `ls_first_try_accuracy` | attempt | period | aynı | Gerçek öğrenme değişimi. | yüksek iyi | points |
| `pc_assessment_avg` | Değerlendirme ort. farkı | `mean(assess.percent)` dönemde | assess | period | her iki dönemde n>=MIN_AVG yoksa null | Ders sonu sınav değişimi. | yüksek iyi | points |
| `pc_exam_avg` | Deneme ort. farkı | `mean(v)` dönemde `subjectId` param | result | period | iki dönemde n>=MIN_AVG yoksa null | Deneme performansı dönemden döneme. | yüksek iyi | metrik |
| `pc_mastered` | Öğrenilen kelime farkı | `mv_mastered_count` (mastered_at pencerede) | vocab | period | prev=0 -> pct null | Mastery hızı değişimi. | yüksek iyi | count |
| `pc_focus_loss_rate` | Odak kaybı farkı | `tm_focus_loss_per_hour` | event, session | period | aktif süre eşiği altı -> null | Dikkat dağılması arttı mı. | düşük iyi | per_hour |
| `pc_task_completion` | Görev tamamlama farkı | `hw_task_completion_rate` | task | period | payda 0 -> null | Sorumluluk alma değişimi. | yüksek iyi | points |
| `pc_speaking` | Konuşma sayısı farkı | `sp_count` | speak | period | prev=0 -> pct null | Konuşma pratiği değişimi. | yüksek iyi | count |
| `pc_xp` | XP farkı | `sum(reward.amount)` | reward | period | prev=0 -> pct null | Genel kazanım. | yüksek iyi | count |
| `pc_z_vs_prev4` | Dönem z-skoru (önceki 4 dönem) | taban stat bu dönem değeri `x`; önceki 4 aynı uzunlukta dönem değerleri `r`; `z(x, r)`; param `statId` | taban | period | `r` içinde null atılır, kalan<3 -> null | Bu dönem kendi geçmişine göre olağandışı mı. | taban yönü | z |

## 10. El ile doğrulama örneği (kod yazılmadan formül kontrolü)

Veri: tek ders, 10 deneme, metrik `net`: `[10, 12, 11, 14, 15, 13, 16, 17, 15, 12]` (N=10).

| stat | Hesap | Beklenen |
| --- | --- | --- |
| `ex_avg_last5` | `[13,16,17,15,12]` -> 73/5 | 14.6 |
| `ex_avg_last10` | 135/10 | 13.5 |
| `ex_slope_last5` | xm=2, ym=14.6; `sum((x-2)(y-14.6))` = 3.2 -1.4 +0 +0.4 -5.2 = -3.0; payda 10 | -0.3 |
| `ex_delta_nth_prev5` (N=10) | ref5=`[15,13,16,17,15]` ort 15.2; 12-15.2 | -3.2 |
| `ex_z_nth_prev5` | sd(ref5): sapma kareleri .04+4.84+.64+3.24+.04=8.8; 8.8/4=2.2; sd=1.4832; -3.2/1.4832 | -2.157 |
| `ex_delta_nth_prev10` (N=10) | ref = ilk 9 nokta (min(10,9)), ort 123/9=13.667; 12-13.667 | -1.667 |
| `ex_decline_slope3` | `[17,15,12]` xm=1, ym=14.667; (-1)(2.333)+0+(1)(-2.667)=-5.0; /2 | -2.5, eşik -0.5 -> kural A doğru |
| `ex_decline_sd` | eşik = 15.2 - 1*max(1.4832, 0.5) = 13.717; son 12 < 13.717 | doğru |
| `ex_decline_flag` | A + B | 2 |
| `ex_decline_magnitude` | 15.2 - 12 | 3.2 |
| `ex_consec_declines` | 17->15->12 ve 15<17; 16->17 yükseliş; sondan: 12<15, 15<17 | 2 |

Streak örneği: aktif günler (bugün = 20. gün): 15,16,17,18,19 ve 12,13. `st_current_streak` = 5 (bugün aktif değil, dünden say), `st_longest_streak` = 5, `st_streak_health` = 1, `st_longest_gap` = 1 (13->15: fark 2, gap=1), `st_streak_breaks` (LONG_GAP_DAYS=3 -> fark>=4 gerekir) = 0.

## 11. Kod düzeni (`src/domain/stats/`)

Kural: saf TypeScript, DOM/Supabase/Date.now yok. Tüm tarih `string` (ISO veya `YYYY-MM-DD`); `now` param. Yeni dosya sayısı sabit; stat eklemek = ilgili dosyaya fonksiyon + `registry.ts`'e bir satır.

```
src/domain/stats/
  types.ts        // girdi tipleri, StatParams, StatResult, meta tipleri
  thresholds.ts   // STATS_THRESHOLDS (bölüm 1 tablosu, tek nesne, `as const`)
  math.ts         // mean, sd, slope, z, quantile, median, safeDiv, pctChange, clamp
  windows.ts      // lastN, inDays, inRange, periodWindows, dayKey, isoWeekStart, activeDays
  series.ts       // SERI üretimi: buildExamSeries(input, params), applyMetric, buildLessonCurve
  exam.ts         // ex_*  (bölüm 2)
  lesson.ts       // ls_*  (bölüm 3)
  mastery.ts      // mv_*  (bölüm 4)
  time-focus.ts   // tm_*  (bölüm 5)
  habit.ts        // st_*  (bölüm 6)
  task.ts         // hw_*  (bölüm 7)
  speaking.ts     // sp_*  (bölüm 8)
  period.ts       // pc_*  (bölüm 9; registry'yi çağıran sarmalayıcı, döngüsel import yok: period.ts statFn'i parametre alır)
  registry.ts     // STAT_REGISTRY: Record<StatId, StatMeta>; listStats(group?); runStat(id, input, params)
  index.ts        // yeniden dışa aktarım
```

Bağımlılık yönü: `types` <- `thresholds`, `math` <- `windows` <- `series` <- grup dosyaları <- `period` <- `registry` <- `index`. Grup dosyaları birbirini import etmez (ortak ihtiyaç `series.ts`/`windows.ts`/`math.ts`'e taşınır). `period.ts` tabanı doğrudan import etmez; `registry.ts` `runStat`'ı ona geçirir.

### 11.1 Girdi tipleri (`types.ts`)

```ts
export type IsoTs = string      // 2026-11-25T09:30:00Z
export type DayKey = string     // 2026-11-25 (Europe/Istanbul)

export interface ExamRow { examId: string; date: DayKey; kind: 'school' | 'mock' | 'lgs' | 'other'; createdAt: IsoTs }
export interface ExamResultRow {
  examId: string; subjectId: string
  total: number | null; correct: number; incorrect: number; blank: number; net: number
}
export interface ExamTopicRow { resultKey: string /* examId:subjectId */; subjectId: string; topic: string; correct: number; incorrect: number; blank: number }
export interface SubjectRow { id: string; name: string; sort: number; active: boolean }

export interface LessonRow { id: string; sequence: number; title: string; status: 'draft' | 'ready' | 'archived'; versionId: string }
export interface SessionRow {
  id: string; assignmentId: string; lessonId: string; kind: 'primary' | 'replay'
  status: 'active' | 'completed' | 'abandoned'
  activeSeconds: number; idleSeconds: number; breakSeconds: number
  startedAt: IsoTs; lastSeenAt: IsoTs; completedAt: IsoTs | null
}
export interface SectionProgressRow {
  sessionId: string; section: Section; status: 'not_started' | 'in_progress' | 'completed'
  attemptsCount: number; correctCount: number; activeSeconds: number
}
export type Section = 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
export interface AttemptRow {
  sessionId: string; section: Exclude<Section, 'vocabulary'>; questionId: string
  attemptNo: number; correct: boolean; responseMs: number | null; hintUsed: boolean; at: IsoTs
}
export interface SessionEventRow {
  sessionId: string; at: IsoTs
  kind: 'visibility_hidden' | 'visibility_visible' | 'fullscreen_exit' | 'leave_warning' | 'interrupted' | 'resumed' | 'idle_start' | 'idle_end'
}
export interface BreakRow { sessionId: string; startedAt: IsoTs; endedAt: IsoTs | null; plannedMinutes: number; earlyReturn: boolean | null }
export interface VocabRow {
  packageId: string; itemId: string; lessonId: string | null
  correctCount: number; incorrectCount: number
  createdAt: IsoTs; masteredAt: IsoTs | null; lastAttemptAt: IsoTs | null
}
export interface AssessmentRow { sessionId: string; lessonId: string; percent: number; submittedAt: IsoTs }
export interface CompletionRow { lessonId: string; sessionId: string; completedAt: IsoTs }
export interface AssignmentRow { id: string; versionId: string; status: 'active' | 'paused' | 'archived' | 'completed'; createdAt: IsoTs }
export interface ProgramEventRow { assignmentId: string; kind: string; createdAt: IsoTs }
export interface RewardRow { amount: number; reason: string; createdAt: IsoTs }
export interface SpeakingRow { id: string; lessonId: string | null; status: 'planned' | 'started' | 'ended' | 'cancelled'; plannedAt: IsoTs | null; startedAt: IsoTs | null; endedAt: IsoTs | null }
export interface SpeakingNoteRow { speakingSessionId: string; followUp: string | null }
export interface TaskRow {
  id: string; subjectId: string | null; lessonId: string | null
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  dueDate: DayKey | null; createdAt: IsoTs; completedAt: IsoTs | null
}

/** Bir öğrencinin tüm ham verisi. Alanlar boş dizi olabilir; fonksiyon boş diziyi null/0 olarak ele alır. */
export interface StatsInput {
  exams: ExamRow[]; results: ExamResultRow[]; topics: ExamTopicRow[]; subjects: SubjectRow[]
  lessons: LessonRow[]; assignments: AssignmentRow[]; programEvents: ProgramEventRow[]
  sessions: SessionRow[]; sections: SectionProgressRow[]; attempts: AttemptRow[]
  events: SessionEventRow[]; breaks: BreakRow[]; vocab: VocabRow[]
  assessments: AssessmentRow[]; completions: CompletionRow[]; rewards: RewardRow[]
  speaking: SpeakingRow[]; speakingNotes: SpeakingNoteRow[]; tasks: TaskRow[]
  /** Ayar academic.wrong_penalty; yalnız net'i yeniden hesaplamak gerekirse (normalde result.net kullan). */
  wrongPenalty?: number
}

export type WindowKind = 'none' | 'lastN' | 'days' | 'range' | 'period'
export type PeriodUnit = 'day' | 'week' | 'month' | 'range'

export interface StatParams {
  now: IsoTs                       // zorunlu
  window?: WindowKind              // varsayılan: stat meta.windows[0]
  n?: number                       // lastN için
  days?: number                    // days için
  from?: DayKey; to?: DayKey       // range için
  periodUnit?: PeriodUnit          // period için
  nth?: number                     // N. deneme, 1-tabanlı; yoksa son
  subjectId?: string | null        // exam ailesi; null = toplam
  lessonId?: string | null         // lesson/mastery/time ailesi
  metric?: 'pct' | 'net'           // varsayılan 'pct'
  k?: number                       // top-k listeler, varsayılan 5
  statId?: StatId                  // yalnız pc_generic, pc_z_vs_prev4
}

export type NullReason = 'insufficient' | 'no_data' | 'zero_denominator' | 'not_applicable'
export interface StatPoint { x: string; y: number }
export interface StatBreakdownItem { key: string; label?: string; value: number | null; n: number; extra?: number | null }
export interface StatResult {
  value: number | null
  n: number
  reason?: NullReason              // value null iken zorunlu
  series?: StatPoint[]
  breakdown?: StatBreakdownItem[]
}
```

### 11.2 `registry.ts` meta şekli

```ts
export type StatGroup = 'exam' | 'lesson' | 'mastery' | 'time' | 'habit' | 'task' | 'speaking' | 'period'
export type Direction = 'higher_better' | 'lower_better' | 'neutral'
export type StatUnit =
  | 'net' | 'percent' | 'ratio' | 'count' | 'seconds' | 'minutes' | 'ms' | 'days'
  | 'points' | 'flag' | 'rank' | 'per_week' | 'per_hour' | 'slope' | 'z' | 'metric'
export type StatParamNeed = 'subjectId' | 'lessonId' | 'nth' | 'n' | 'statId' | 'k'
export type StatId = keyof typeof STAT_REGISTRY   // registry'den türetilir; elle yazılmaz

export interface StatMeta {
  id: string                       // snake_case, sabit, spec'teki id ile birebir
  name: string                     // Türkçe ad (spec "Ad" sütunu)
  group: StatGroup                 // id öneki: ex->exam, ls->lesson, mv->mastery, tm->time, st->habit, hw->task, sp->speaking, pc->period
  direction: Direction             // spec "Yön": yüksek iyi=higher_better, düşük iyi=lower_better, nötr=neutral
  unit: StatUnit                   // spec "Birim"
  windows: readonly WindowKind[]   // spec "Pencere" sütunundaki tipler; ilki varsayılan
  needs: readonly StatParamNeed[]  // zorunlu param; eksikse runStat NullReason 'not_applicable' döner
  minN: number                     // spec kenar durumundaki en az nokta (null dönmeden önce gereken n)
  schema?: '0011'                  // yalnız yeni tablolara bağlı statlar
  hint: string                     // spec "Yorum ipucu" (admin metni)
  fn: (input: StatsInput, params: StatParams) => StatResult
}

export const STAT_REGISTRY = {
  ex_avg_last5: { id: 'ex_avg_last5', name: '...', group: 'exam', direction: 'higher_better', unit: 'metric',
    windows: ['lastN'], needs: ['subjectId'], minN: 2, hint: '...', fn: exAvgLast5 },
  // ... her id için bir kayıt
} as const satisfies Record<string, StatMeta>

export const listStats = (group?: StatGroup): StatMeta[] => /* Object.values filtrele, group yoksa hepsi, sıra: spec sırası */
export const runStat = (id: StatId, input: StatsInput, params: StatParams): StatResult => /* needs kontrolü -> fn */
```

### 11.3 Mekanik yazım kuralları (Haiku için)

1. Spec'teki her satır = tam bir `StatMeta` kaydı + bir fonksiyon. Fonksiyon adı: id'nin camelCase'i (`ex_avg_last5` -> `exAvgLast5`). Id'yi asla değiştirme/yeniden adlandırma.
2. Fonksiyon imzası hep `(input: StatsInput, params: StatParams) => StatResult`. Başka imza yok.
3. Her fonksiyon 6 adım izler: (a) `params.now` ve pencere çöz (`windows.ts`), (b) ham satırları filtrele, (c) seriyi/kümeyi kur (`series.ts`), (d) `n` hesapla, (e) `n < minN` ise `{value:null, n, reason:'insufficient'}` dön, (f) formülü uygula.
4. Bölme her zaman `safeDiv`. `Math.round`, `toFixed`, `Number()` yuvarlama yok.
5. Eşik/sabit sayıları satıra gömme; `STATS_THRESHOLDS`'tan oku. Yeni sabit gerekirse thresholds.ts'e ekle ve spec tablosuna işle.
6. "Sayma" statı (count) boşta `0` döner, `reason` yok. Oran/ortalama/eğim boşta `null` + `reason`.
7. `null` alanları (`total`, `responseMs`, `completedAt`) formülden önce filtrele, sessizce 0 sayma.
8. Ders/subject kimliği, adı, sırası koda gömülmez; `subjectId`/`lessonId` param, ad için `input.subjects`/`input.lessons`.
9. Sıralama deterministik: eşitlikte `id` leksikografik. `breakdown` sırası satırda belirtilene uyar.
10. `breakdown`/`series` olan statlar `value`'yu satırdaki gibi doldurur; liste boşsa `value=null`, `reason='no_data'`.
11. `pc_*` ve `ex_decline_*`/`ls_lesson_decline_flag` tabanları çağırır, formül kopyalamaz: `ex_decline_flag` = `exDeclineSlope3` + `exDeclineSd` sonuçları.
12. Her `registry` kaydı `windows`, `needs`, `minN`, `unit`, `direction`'ı spec satırından birebir alır; `hint` = "Yorum ipucu" metni. `listStats()` spec sırasındadır.
13. Tarih karşılaştırması `dayKey` (string) ile yapılır, yerel saat dönüşümü yalnız `windows.dayKey(ts)` içinde (`Intl` ile `Europe/Istanbul`).
14. Faz 6 arayüzü yalnız `listStats`/`runStat`/`StatMeta` kullanır; domain dışı hesap yok.

## 12. Gerekli şema değişiklikleri (`0011_subjects_tasks.sql` taslağı)

Uygulama başkası yapacak. Desen: schema `lugu`, admin `for all` politikası, öğrenci yalnız kendi satırını okur, öğrenci yazması yalnız `SECURITY DEFINER` RPC (`set search_path = ''`), dosya sonunda `revoke ... from public, anon` + yeni fonksiyonlara `grant execute ... to authenticated`. Hata kodları mevcut `LUGU_*` listesinden; yeni: `LUGU_SUBJECT_NOT_FOUND`, `LUGU_TASK_NOT_FOUND` (docs/database.md'ye eklenmeli). Admin RPC parametreleri mevcut desen gibi adsız önek (`subject_id`...) ve içeride `v_` kopya; kolon adlarıyla çakışmayı tablo takma adıyla (`s.id`) çöz.

Karar: dersler (subject) zaten DB'de; yeni tablo yok, `school_subjects` genişletilir. Çıkarmak = sonucu olan dersi `active=false` (arşiv, geçmiş korunur, `on delete restrict` bozulmaz), sonucu olmayanı silmek. Subject öğrenci başına değil global (öğrenciye özel ders listesi istenirse ileride `student_subjects`; şimdi YAGNI).

```sql
-- 0011 subjects & student tasks: admin-managed subjects (color/short name, safe remove), exam-result topics, student tasks.

-- ───────────────────────── subjects ─────────────────────────

alter table lugu.school_subjects
  add column short_name text check (short_name is null or (btrim(short_name) <> '' and length(short_name) <= 20)),
  add column color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$');

-- ───────────────────────── exam result topics (konu bazlı hata yoğunluğu) ─────────────────────────

create table lugu.school_exam_result_topics (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references lugu.school_exam_results (id) on delete cascade,
  topic text not null check (btrim(topic) <> '' and length(topic) <= 120),
  correct integer not null default 0 check (correct >= 0),
  incorrect integer not null default 0 check (incorrect >= 0),
  blank integer not null default 0 check (blank >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_exam_result_topics_key unique (result_id, topic)
);
create trigger school_exam_result_topics_updated_at before update on lugu.school_exam_result_topics
  for each row execute function lugu.set_updated_at();

-- ───────────────────────── student tasks (sorumluluk / görev) ─────────────────────────

create table lugu.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references lugu.student_profiles (user_id) on delete cascade,
  subject_id uuid references lugu.school_subjects (id) on delete set null,
  lesson_id uuid references lugu.curriculum_lessons (id) on delete set null,
  title text not null check (btrim(title) <> '' and length(title) <= 200),
  description text check (length(description) <= 4000),
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  completed_at timestamptz,
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_tasks_completed_at check ((status = 'done') = (completed_at is not null))
);
create index student_tasks_student_idx on lugu.student_tasks (student_id, status, due_date);
create index student_tasks_subject_idx on lugu.student_tasks (subject_id);
create index student_tasks_lesson_idx on lugu.student_tasks (lesson_id);
create trigger student_tasks_updated_at before update on lugu.student_tasks
  for each row execute function lugu.set_updated_at();

-- ───────────────────────── RLS ─────────────────────────

alter table lugu.school_exam_result_topics enable row level security;
alter table lugu.student_tasks enable row level security;

create policy school_exam_result_topics_admin on lugu.school_exam_result_topics for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

-- Students read only their own tasks; they have no write policy (status changes go through student_set_task_status).
create policy student_tasks_select on lugu.student_tasks for select to authenticated
  using (student_id = auth.uid() or lugu.is_admin());
create policy student_tasks_admin_write on lugu.student_tasks for all to authenticated
  using (lugu.is_admin()) with check (lugu.is_admin());

grant select, insert, update, delete on lugu.school_exam_result_topics, lugu.student_tasks to authenticated;

-- ───────────────────────── admin RPCs ─────────────────────────

-- Add or edit a subject. subject_id null = create. Returns the row.
create function lugu.admin_upsert_subject(
  subject_id uuid, name text, short_name text default null, color text default null,
  sort integer default 0, active boolean default true)
returns lugu.school_subjects
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := subject_id;
  v_name text := btrim(name);
  v_admin uuid := lugu.require_admin();
  v_row lugu.school_subjects;
begin
  if v_name is null or v_name = '' or length(v_name) > 100 then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  if v_id is null then
    insert into lugu.school_subjects (name, short_name, color, sort, active)
    values (v_name, short_name, color, coalesce(sort, 0), coalesce(active, true))
    returning * into v_row;
  else
    update lugu.school_subjects s
       set name = v_name, short_name = admin_upsert_subject.short_name, color = admin_upsert_subject.color,
           sort = coalesce(admin_upsert_subject.sort, s.sort), active = coalesce(admin_upsert_subject.active, s.active)
     where s.id = v_id
    returning * into v_row;
    if not found then
      raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;
  perform lugu.audit('admin_upsert_subject', 'school_subjects', v_row.id::text,
    jsonb_build_object('name', v_row.name, 'active', v_row.active));
  return v_row;
end $$;
-- Not: duplicate name -> unique_violation (23505); arayüz bunu "bu ders zaten var" diye eşler.

-- Remove a subject: hard delete when it has no exam results, otherwise archive (active = false). Returns 'deleted' | 'archived'.
create function lugu.admin_remove_subject(subject_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := subject_id;
  v_admin uuid := lugu.require_admin();
  v_result text;
begin
  perform 1 from lugu.school_subjects s where s.id = v_id for update;
  if not found then
    raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if exists (select 1 from lugu.school_exam_results r where r.subject_id = v_id) then
    update lugu.school_subjects s set active = false where s.id = v_id;
    v_result := 'archived';
  else
    delete from lugu.school_subjects s where s.id = v_id;   -- student_tasks.subject_id -> set null
    v_result := 'deleted';
  end if;
  perform lugu.audit('admin_remove_subject', 'school_subjects', v_id::text, jsonb_build_object('result', v_result));
  return v_result;
end $$;

-- Assign a task to a student. Returns the row.
create function lugu.admin_assign_task(
  student_id uuid, title text, description text default null, due_date date default null,
  subject_id uuid default null, lesson_id uuid default null)
returns lugu.student_tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid := student_id;
  v_subject uuid := subject_id;
  v_lesson uuid := lesson_id;
  v_admin uuid := lugu.require_admin();
  v_row lugu.student_tasks;
begin
  if btrim(coalesce(title, '')) = '' then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  perform 1 from lugu.student_profiles sp where sp.user_id = v_student;
  if not found then
    raise exception 'LUGU_STUDENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_subject is not null and not exists (select 1 from lugu.school_subjects s where s.id = v_subject) then
    raise exception 'LUGU_SUBJECT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_lesson is not null and not exists (select 1 from lugu.curriculum_lessons l where l.id = v_lesson) then
    raise exception 'LUGU_LESSON_NOT_IN_PROGRAM' using errcode = 'P0001';
  end if;
  insert into lugu.student_tasks (student_id, subject_id, lesson_id, title, description, due_date, assigned_by)
  values (v_student, v_subject, v_lesson, btrim(title), description, due_date, v_admin)
  returning * into v_row;
  perform lugu.audit('admin_assign_task', 'student_tasks', v_row.id::text,
    jsonb_build_object('student_id', v_student, 'title', v_row.title, 'due_date', v_row.due_date));
  return v_row;
end $$;

-- Edit a task or change its status as admin. null argument = unchanged. status 'done' sets completed_at, any other clears it.
create function lugu.admin_update_task(
  task_id uuid, title text default null, description text default null, due_date date default null,
  subject_id uuid default null, lesson_id uuid default null, status text default null)
returns lugu.student_tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := task_id;
  v_status text := status;
  v_admin uuid := lugu.require_admin();
  v_row lugu.student_tasks;
begin
  if v_status is not null and v_status not in ('open', 'in_progress', 'done', 'cancelled') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  update lugu.student_tasks t set
    title = coalesce(nullif(btrim(admin_update_task.title), ''), t.title),
    description = coalesce(admin_update_task.description, t.description),
    due_date = coalesce(admin_update_task.due_date, t.due_date),
    subject_id = coalesce(admin_update_task.subject_id, t.subject_id),
    lesson_id = coalesce(admin_update_task.lesson_id, t.lesson_id),
    status = coalesce(v_status, t.status),
    completed_at = case when coalesce(v_status, t.status) = 'done' then coalesce(t.completed_at, now()) else null end
  where t.id = v_id
  returning * into v_row;
  if not found then
    raise exception 'LUGU_TASK_NOT_FOUND' using errcode = 'P0001';
  end if;
  perform lugu.audit('admin_update_task', 'student_tasks', v_id::text, jsonb_build_object('status', v_row.status));
  return v_row;
end $$;

-- Admin deletes a task (mistaken assignment). History-preserving alternative is status 'cancelled'.
create function lugu.admin_delete_task(task_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := task_id;
  v_admin uuid := lugu.require_admin();
begin
  delete from lugu.student_tasks t where t.id = v_id;
  if not found then
    raise exception 'LUGU_TASK_NOT_FOUND' using errcode = 'P0001';
  end if;
  perform lugu.audit('admin_delete_task', 'student_tasks', v_id::text, '{}'::jsonb);
end $$;

-- ───────────────────────── student RPCs ─────────────────────────

-- The caller's tasks, newest due first; includes subject name and lesson title (never source_notes).
create function lugu.student_tasks() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', t.id, 'title', t.title, 'description', t.description, 'due_date', t.due_date,
      'status', t.status, 'completed_at', t.completed_at,
      'subject', s.name, 'lesson', l.title) order by t.due_date nulls last, t.created_at), '[]'::jsonb)
  from lugu.student_tasks t
  left join lugu.school_subjects s on s.id = t.subject_id
  left join lugu.curriculum_lessons l on l.id = t.lesson_id
  where lugu.current_student_id() is not null and t.student_id = auth.uid() and t.status <> 'cancelled'
$$;

-- The student marks their own task open/in_progress/done. cancelled is admin-only.
create function lugu.student_set_task_status(task_id uuid, status text) returns lugu.student_tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := task_id;
  v_status text := status;
  v_student uuid := lugu.require_active_student();
  v_row lugu.student_tasks;
begin
  if v_status is null or v_status not in ('open', 'in_progress', 'done') then
    raise exception 'LUGU_INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  select * into v_row from lugu.student_tasks t where t.id = v_id and t.student_id = v_student for update;
  if not found then
    raise exception 'LUGU_TASK_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_row.status = 'cancelled' then
    raise exception 'LUGU_INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  update lugu.student_tasks t set
    status = v_status,
    completed_at = case when v_status = 'done' then coalesce(t.completed_at, now()) else null end
  where t.id = v_id
  returning * into v_row;
  return v_row;
end $$;

-- ───────────────────────── grants ─────────────────────────

revoke all on all functions in schema lugu from public;
revoke all on all functions in schema lugu from anon;
grant execute on function
  lugu.admin_upsert_subject(uuid, text, text, text, integer, boolean),
  lugu.admin_remove_subject(uuid),
  lugu.admin_assign_task(uuid, text, text, date, uuid, uuid),
  lugu.admin_update_task(uuid, text, text, date, uuid, uuid, text),
  lugu.admin_delete_task(uuid),
  lugu.student_tasks(),
  lugu.student_set_task_status(uuid, text)
to authenticated;
```

Uygulayıcı için notlar:
- `admin_upsert_subject` içinde parametre adı kolon adıyla çakıştığı için (`name`, `sort`, `active`) tüm kolon başvurularını tablo takma adı ve fonksiyon-önekiyle yaz (taslakta gösterildi); PGlite testinde (`tests/db`) çakışma uyarısını doğrula. İstenirse parametreleri `p_` önekli yap, o zaman `src/lib/database.types.ts` adlandırması buna uysun.
- Mevcut `school_subjects` politikası/grant'ı 0004'te var; 0011 yeniden tanımlamaz. `SubjectsCard.vue` doğrudan tabloya yazıyorsa RPC'ye geçirmek ya da en azından silmede `admin_remove_subject`'i kullanmak gerekir (aksi halde restrict hatası kullanıcıya kaba görünür).
- `student_tasks.completed_at` kısıtı (`status='done'` <=> `completed_at not null`) `admin_update_task` ve `student_set_task_status` ile tutarlı; doğrudan tablo yazımında admin bu kısıta takılabilir, arayüz RPC kullanmalı.
- Seed: `scripts/demo/seed-grade6.ts` ve `supabase/seed.sql` 2. öğrenci için birkaç görev ve konu satırı eklesin (Faz 8).
- Kontrol listesi: `docs/database.md` migrations tablosuna `0011_subjects_tasks.sql`, RPC tablosuna 7 yeni fonksiyon, güvenlik modeline "öğrenci kendi `student_tasks` satırlarını SELECT eder" satırı; `src/lib/database.types.ts` yeniden üretilecek.

## 13. Sayım

Toplam kayıtlı stat: bölüm 2 = 43, bölüm 3 = 28, bölüm 4 = 14, bölüm 5 = 22, bölüm 6 = 13, bölüm 7 = 13, bölüm 8 = 8, bölüm 9 = 14, toplam 155 satır. (Hedef ~100 idi; fazla satırlar aynı fonksiyonun pencere/param varyantı olduğu için kod hacmi yaklaşık 100 ayrı fonksiyon: `ex_avg_last5/10/lastn` tek `exAvgLastN(k)` çağrısı, `ex_slope_*` tek `exSlopeLastN(k)`, `ex_z_*` tek `exZNth(refSize)`.) Hamal varyantları tek yardımcı + ince sarmalayıcı olarak yazsın; `registry.ts` her id için bir kayıt tutar.
