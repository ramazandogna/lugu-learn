# Changelog

## 0.4.0 — 2026-11-28

- **Admin paneli yeniden tasarlandı** (tasarım raporu: `docs/design/admin-redesign.md`).
  - Menü 5 öğe: Bugün, Öğrenciler, Oturumlar, Müfredat, Ayarlar.
  - Öğrenci sayfasında 4 sekme: İlerleme, Program, Konuşma, Profil. Eski sekme bağlantıları yeni sekmelere yönlenir.
- **Program sekmesi:** üstte programlar şeridi; her derste Bitti / Şu an / Açık / Kilitli rozeti; tek dokunuşla "Aç / Kilitle" ve "Geri al" bildirimi; "Programı kaldır" düğmesi; "Buradan başlat"; olay geçmişi ayrı görünümde.
- **Yorumlu istatistik:**
  - "Bu hafta nasıl gidiyor?" kartı.
  - Her derste puan, ilk deneme doğruluğu, süre ve ipucu için iyi / dikkat / zayıf etiketi; önceki denemeye göre değişim; öğretmen notu; zorlandığı yerler ve öğrendikleri.
  - Kurallar sabit eşiklerle hesaplanır; AI kullanılmaz (`lib/insights.ts`).
- **Bugün:** dikkat gerektiren öğrenciler nedene göre gruplanır.
- **Müfredat salt okunur:** her derste "Dersi dene" düğmesi; deneme ekranında "Hiçbir şey kaydedilmez" bandı.
- **Kaldırılanlar:** panelden tüm AI ekranları ile müfredat ve ders oluşturma/düzenleme formları; Analitik ve Akademik sayfaları (akademik bilgiler öğrenci Profil sekmesine taşındı).
- **Performans:** kapalı pencereler veri çekmiyor; yenilemede ekran iskelete dönmüyor; yalnız seçili sekme yükleniyor.
- **Öğrenci tarafı:**
  - Kelime kartı çevrilmeden sonraki kelimeye geçilmiyor (1/2 → 2/2 adım göstergesi).
  - "Lavdan kaç" artık rekor koşusu: her doğru cevapta saat hızlanıyor, rekor saklanıyor ve kutlanıyor.
  - Birden fazla müfredatı olan öğrenciye haritaya her girişte müfredat seçimi soruluyor.

## 0.3.0 — 2026-11-28

- **Seçmeli ders atama:** admin her programda öğrencinin açabileceği dersleri tek tek işaretler (Program sekmesi ve atama pencereleri). Açık dersler sırayla gelir, her ders bir öncekinin bitmesini bekler; işaretsiz dersleri öğrenci "öğretmeninden iste" mesajıyla kilitli görür. 0012'deki "N. derse kadar" kilidi bu seçime dönüştürülür. Migration `0013_lesson_selection.sql`.
- **Harita seçimi:** öğrencinin birden fazla programı varsa Harita sekmesi "Hangi haritada ilerlemek istersin?" diye sorar; haritadan "Haritalarım" ile geri dönülür.
- **Ünvan:** admin öğrenciye süreli ya da süresiz bir ünvan verir (Profil sekmesi); öğrencinin ana sayfasında ve profilinde görünür.
- **Konuşma oturumu:** oturuma ders seçilir; dersin 1 saatlik planı yanında açılır; kayıtta hedefler (kazanıldı / kısmen / henüz değil) ve "neler konuştuk" alanı var.
- **Ders ders yolculuk:** İlerleme sekmesinde her ders için kazanımlar, puan, süre, doğruluk, kelime ve o ders üzerine yapılan konuşmalar ile hedef sonuçları.
- **Admin arayüzü:** öğrenci markasıyla aynı renkler, kart derinliği, atama kartında tek ders listesi ve "Diğer işlemler" menüsü, öğrenci sekmelerinin yeni sırası (İlerleme, Program, Konuşma, Profil…), mobil taşma ve dokunma alanı düzeltmeleri.

Yayın notu: uzak veritabanına önce `supabase db push` (0012 henüz uygulanmadıysa o da, sonra 0013), sonra frontend.

## 0.2.0 — 2026-11-28

- **Kitap müfredatı:** "6. Sınıf İngilizce — Kitap Müfredatı", Ünite 1 (School Life, 6 ders) ve Ünite 2 (Classroom Life, 4 ders). Ünite 3-4 planı: `docs/curriculum/kitap-mufredati.md`. Yayın: `scripts/content/book.ts`.
- **Öğretmen kilidi:** admin, öğrencinin bir programda hangi derse kadar ilerleyebileceğini belirler (Program sekmesi → Öğretmen kilidi); yeni atamalarda varsayılan açık. Migration `0012_teacher_gate.sql`.
- **Dersi test et:** admin her dersi gerçek oynatıcıda dener; tüm bölümler açık ve atlanabilir, hiçbir şey kaydedilmez (`/admin/dersler/:id/test`).
- **Konuşma planı:** dersin 1 saatlik konuşma planı ve öğretmen rehberi öğrencinin Program sekmesinde ve test sayfasında görünür.

Yayın notu: uzak veritabanına önce `supabase db push` (0012), sonra frontend.
