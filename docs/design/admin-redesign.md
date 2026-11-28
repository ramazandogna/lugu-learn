# UI/UX Güncelleme Raporu — LUGU Yönetim Paneli

Kapsam: `src/features/admin/**`. Sabit kurallar: admin'de AI ve müfredat oluşturma/düzenleme yok (içerik dışarıda hazırlanır); öğrenci arayüzü değişmez; istatistikler yalnız deterministik kurallarla.


## 1) Yeni bilgi mimarisi

Menü (5): **Bugün · Öğrenciler · Oturumlar · Müfredat · Ayarlar**. Mobilde alt çubuk, masaüstünde yan menü. Mobilde "Çıkış yap" ikon düğmesi (`aria-label="Çıkış yap"`).

Öğrenci sekmeleri (4, `ScrollTabs`): **İlerleme · Program · Konuşma · Profil**.

Rotalar: mevcut rota adları korunur. Kalkan ekranların rotaları yönlendirilir: Analitik → `/students`; Akademik → `/students` (öğrenci seçilince Profil › Okul bölümü). Eski öğrenci sekme sorguları (insight, timeline, history, expert, tasks) yeni sekmeye yönlenir: insight/timeline/history/expert → İlerleme, tasks → Konuşma. `SubjectsCard` Ayarlar'a taşınır. Ayarlar küçük sekmeleri birleşir: Okullar+Dersler · Sistem · Başarımlar · Görünüm · Silme.


## 2) Ekran ekran tasarım

**Ortak:** kart `p-4`, bölüm aralığı `gap-6`, ince kenarlık; birincil kenarlık yalnız "Şu an". Boş durum: `AdminEmpty` (48px ikon + 1 cümle + birincil eylem). Renk tek başına sinyal değildir: ikon + metin.

### Bugün (`DashboardView`)
```
Bugün
[Aktif öğrenci 12] [Bu hafta ders 31] [Planlı oturum 2] (0 olanlar soluk)
Dikkat gerektirenler            Tümünü gör ›
 ! 7+ gün çalışmadı (4)  Ali, Ece, +2
 ! Puan düşük (2)        ...
Yaklaşan oturumlar  | Son tamamlanan dersler (tembel yüklenir)
```
Bileşenler: `StatCounters`, `DashboardAttention` (aynı nedenler gruplanır, ilk 5), `DashboardFeeds`. `DashboardDeclines` Dikkat listesine katılır.

### Öğrenciler (`StudentsView`)
```
Öğrenciler            [+ Yeni öğrenci]
[Ara…           ] [Filtre (2)]
 Ali Y.  · Kitap 3/10 · ! 8 gün çalışmadı   ›
```
Varsayılan sıra: dikkat gerekenler önce. 5 filtre tek "Filtre" alt sayfasında (`student-filters.ts`). Satırda "Program ata" kısayolu yok; Program sekmesinde.

### Öğrenci › İlerleme
```
Bu hafta nasıl gidiyor?  ● İyi gidiyor
 3 gün · 74 dk · 2 ders · Ort. 82 (↑4)
Ders geçmişi (LessonJourney)
 New Term  Puan 85 iyi · İlk deneme %78 dikkat · Süre 1.1x iyi · İpucu %10 iyi
 Öğretmen notu: "Konu oturdu; sonraki derse geçebilir."
 Zorlandı: Bölüm B · kelimeler …   Öğrendi: …
Zaman çizelgesi (StudentTimelineTab)
Uzman analizi ›  (düğmeyle yüklenir)
```
Dört bölüm tek sayfada, `<details>` iç içe yok. Etiketler: "Ders geçmişi", "Zaman çizelgesi", "Uzman analizi", "Zorlandığı yerler", "Öğrendikleri", "ilk deneme".

### Öğrenci › Program
```
Programlar: [Kitap 3/10 ✓] [School Life 0/1] [+ Program ata]
Kitap · sürüm 1     [Duraklat] [Programı kaldır]
▓▓▓░░░░░ 3/10
 1. New Term    ✓ Bitti   [Dersi dene] [Kilitle]
 3. School Tour ▶ Şu an   [Dersi dene] [Kilitle]
 4. My Day      ○ Açık    [Dersi dene] [Kilitle]
 5. Right Now   🔒 Kilitli [Dersi dene] [Aç]
[Geçmiş ›]
```
Bileşenler: `ProgramStrip` (yatay kaydırma + kenar solması), `AssignmentCard`, `LessonStatusList` (`LessonPicker` yerine). Durumlar: Bitti, Şu an, Açık, Kilitli. "Aç/Kilitle" anında `admin_set_open_lessons` çağırır; toast "Ders açıldı · Geri al". Kaydet çubuğu yok. Satır menüsü: "Buradan başlat", "Konuşma planı". Kart menüsü: "İleri al", "Geri al", "Baştan başlat". "Programı kaldır" tek onay ister. `AssignProgramDialog`: yalnız program seç + "Ata" (ders 1 açık, kalanı kilitli). "Geçmiş" ayrı görünüm (olay günlüğü).

### Öğrenci › Konuşma
```
Sonraki oturum: Per 15:00 [Başlat]   [+ Oturum planla]
Görevler (StudentTasksTab)
Oturum geçmişi (SpeakingSessionList)
```
`SpeakingPlanCard` salt okunur plan gösterir; AI düğmeleri yok.

### Öğrenci › Profil
```
Bilgiler [Düzenle]   Ünvan: [__________] (tek satır)
Hesap (StudentAccountActions)  Şifre sıfırla · Kimlik bilgileri
Okul ve akademik (StudentAcademicPanel: sınavlar)
Tehlikeli bölge: Öğrenciyi sil
```

### Müfredat liste / detay (salt okunur)
```
Müfredat
 Kitap · sürüm 1 · 10 ders   [Öğrencilere ata]
Detay: ders listesi
 1. New Term · 12 dk · Yayında   [Dersi dene]
Ders sayfası: Öğretmen kılavuzu · Konuşma planı · Yayın durumu
```
Yeni/Düzenle/Sil, kaynaklar, hedef düzenleyici yok. `AssignToStudentsDialog` yalnız açılınca monte edilir.

### Dersi dene (`LessonPreviewView`)
Üstte sabit bant: "Dersi dene — Hiçbir şey kaydedilmez". Çıkış: "Kapat". Öğrenci oynatıcısı olduğu gibi (`PreviewPlayer`), değişmez.

## 3) İstatistik yorum kuralları (`src/features/admin/lib/insights.ts`, saf fonksiyonlar)

- Puan (`assessment_percent`): ≥80 iyi, 60–79 dikkat, <60 zayıf; yoksa "—".
- İlk deneme doğruluğu (`attempt_no=1`): aynı eşikler; n<5 → "yetersiz veri".
- Süre oranı = aktif_sn / (`estimated_minutes`·60): 0.5–1.5 iyi; 1.5–2.5 veya 0.3–0.5 dikkat; >2.5 veya <0.3 zayıf. (`estimated_minutes` `enrich()` select'ine eklenir.)
- İpucu oranı: ≤%15 iyi, 16–35 dikkat, >35 zayıf.
- Önceki deneme (aynı `lesson_id`, `completed_at` sırası): Δpuan |Δ|<3 "aynı", aksi ↑/↓; Δsüre >%20 ise belirt; yoksa "ilk deneme".
- Zorlandı: ilk deneme doğruluğu en düşük bölüm (<%70) + `incorrect_count≥2` ve öğrenilmemiş ilk 3 kelime. Öğrendi: öğrenilen kelimeler + karşılanan konuşma hedefleri + ders hedefleri.
- Öğretmen cümlesi (ilk eşleşen): 1) puan<60 → "Dersi tekrar edin; en çok {bölüm} ve {kelimeler} üzerinde durun." 2) ipucu zayıf → "İpucuna bağımlı; ipucu olmadan kısa tekrar verin." 3) süre zayıf ve çok hızlı → "Çok hızlı geçti; dikkatle tekrar önerilir." 4) puan iyi ve Δ≥0 → "Konu oturdu; sonraki derse geçebilir." 5) "Kısa bir tekrar yeterli."
- "Bu hafta nasıl gidiyor?" (7 gün): çalışılan gün (hedef ≥3), aktif dk, biten ders, ort. puan ve geçen haftaya Δ. ≥3 gün ve ort ≥70 → "iyi gidiyor"; 1–2 gün → "düzensiz"; 0 → "bu hafta çalışmadı".
- Dikkat gerektirenler (biri yeterli): program atanmışken 7+ gün oturum yok; son 2 puan ort. <60; art arda iki düşüş (Δ≤−10); son 20 cevapta ilk deneme <%60; terk edilen oturum ≥2. Aynı neden gruplanır, ilk 5 + "Tümünü gör".


## 4) Silinecekler

AI: `components/AiButton.vue`, `components/JobProgress.vue`, `content/GeneratePanel.vue`, `students/tabs/StudentInsightTab.vue`, AI bölümleri `coaching/SpeakingPlanCard.vue` içinde, AI ayarı `settings/SystemSettingsPanel.vue` içinde.
Düzenleme: `curricula/CurriculumDialog.vue`, `curricula/LessonDialog.vue`, `curricula/ObjectivesEditor.vue`, `curricula/SourcesPanel.vue`, `content/PackageEditor.vue`, `content/editor/*` (9 dosya), `content/TeacherGuideForm.vue`, `content/SpeakingPlanForm.vue`, `lib/package-edit.ts`.
Menü/IA: `analytics/AnalyticsView.vue`, `analytics/AnalyticsPanel.vue`, `academic/AcademicView.vue`, `components/LessonPicker.vue` (LessonStatusList'e dönüşür), `students/tabs/StudentHistoryTab.vue` ve `StudentTimelineTab.vue` (içerik İlerleme'ye bölüm olarak taşınır).

## 5) Performans kararları

Ölçüm: Panel 22, Öğrenciler 14, Müfredat 4, öğrenci ilk yükleme 28 istek; sekme başı Program +18, Uzman +21, Akademik +6. Yavaşlık ağdan ve iskeletten gelir, animasyondan değil.
- P1: `profiles` tek promise (`auth.ts:56` + router guard). `AssignProgramDialog` (`StudentsView.vue:210`) ve `AssignToStudentsDialog` (`CurriculumView.vue:147`) `v-if` ile. Dashboard `Promise.all` bölünür: sayaç + dikkat önce, akışlar tembel; `curriculum_lessons` tek sorgu. `getStudent` ve `studentLearning` versions/lessons/curricula'yı paylaşır.
- P2: `useLoad` yenilemede eski veriyi tutar + `refreshing` bayrağı. Uzman analizi yalnız düğmeyle. Yalnız seçili sekme monte edilir (mevcut davranış).

## 6) Uygulama sırası (bağımsız paketler)

- WP1 Performans P1 (auth tek promise, v-if diyaloglar, paylaşılan veri).
- WP2 `insights.ts` + `estimated_minutes` + Bugün sayaç/dikkat (yeni kurallar).
- WP3 Menü 5 öğe, yönlendirmeler, Ayarlar birleştirme, `SubjectsCard` taşıma.
- WP4 Öğrenci sayfası 4 sekme: İlerleme (bölümler, öğretmen cümlesi, bu hafta).
- WP5 Program sekmesi: `ProgramStrip`, `LessonStatusList`, anında Aç/Kilitle + geri al, sade `AssignProgramDialog`, Geçmiş görünümü.
- WP6 Konuşma + Profil sekmeleri (Görevler taşıma, ünvan tek satır, okul/akademik).
- WP7 Müfredat salt okunur + "Dersi dene" bandı.
- WP8 AI ve düzenleme dosyalarının silinmesi (WP3–WP7 sonrası).
- WP9 Görsel cila: boş durumlar, ritim, `useLoad` refreshing, mobil çıkış ikonu.

## 7) Kabul kriterleri

- WP1: ağ sekmesinde `profiles` sayfa başına 1; kapalı diyalog ağ isteği yok; ölçüm hedefleri tutar.
- WP2: her eşik tablosu bölüm 3 ile birebir; veri yoksa "—"/"yetersiz veri"; renk yanında ikon+metin.
- WP3: menüde 5 öğe; eski rotalar yönlenir; `type-check` temiz.
- WP4: 390px'te sekme 4; ders satırında 4 gösterge + öğretmen cümlesi; iç içe açılır panel yok.
- WP5: ders aç/kilitle tek dokunuş, toast "Geri al" çalışır; Kaydet çubuğu yok; dört durum ikon+metinli; iki programda şerit kaydırılır; kaldır tek onay; atama sonrası ders 1 açık, kalan kilitli.
- WP7: müfredatta oluştur/düzenle/sil yok; "Dersi dene" bandı görünür, hiçbir kayıt yazılmaz.
- WP8: `grep` AI/editör referansı 0; build ve type-check geçer; öğrenci uygulaması dosyalarına dokunulmaz.

## Lider notları (Opus)

Tasarım kararları onaylandı. Yalnız kritik ve performans notları:
- Öğrenci sekmeleri 4 tane: İlerleme, Program, Konuşma (Görevler bunun içinde bir bölüm), Profil. Ekip bu konuda uzlaştı. Eski `?sekme=` değerleri yeni sekmelere yönlenir; bağlantı kırılmaz.
- "Aç/Kilitle" anında kaydedilir. Arka arkaya hızlı tıklamalarda istekler sıraya girmeli. Geri al, önceki `open_lesson_ids` değerini yazar. Veri kaybı yok, çünkü tamamlama kayıtlarına dokunulmaz.
- Programı kaldırma `archive` işlemidir; kayıtlar silinmez. Onay metni bunu söylemeli.
- Admin mobil alt çubuğu WP9'a ertelendi. Yan menü mobilde çekmece olarak kalır. Gerekçe: risk ve süre.
- Performans P1 işlerinden ikisi yapıldı: kapalı diyaloglar yüklenmiyor; `useLoad` yenilemede eski veriyi gösteriyor (`refreshing`). `profiles` isteği `auth.ts` içinde zaten tek promise ile paylaşılıyor.
- Migration gerekmiyor: tüm kurallar mevcut verilerle istemcide hesaplanıyor.
- Öğrenci tarafındaki mantık düzeltmeleri ayrı yapıldı (kelime kartı, rekor koşusu, harita seçimi). Admin işleri öğrenci dosyalarına dokunmaz; tek istisna, önizlemenin kullandığı `LessonPreviewView` bandıdır.
