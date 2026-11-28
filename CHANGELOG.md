# Changelog

## 0.2.0 — 2026-11-28

- **Kitap müfredatı:** "6. Sınıf İngilizce — Kitap Müfredatı", Ünite 1 (School Life, 6 ders) ve Ünite 2 (Classroom Life, 4 ders). Ünite 3-4 planı: `docs/curriculum/kitap-mufredati.md`. Yayın: `scripts/content/book.ts`.
- **Öğretmen kilidi:** admin, öğrencinin bir programda hangi derse kadar ilerleyebileceğini belirler (Program sekmesi → Öğretmen kilidi); yeni atamalarda varsayılan açık. Migration `0012_teacher_gate.sql`.
- **Dersi test et:** admin her dersi gerçek oynatıcıda dener; tüm bölümler açık ve atlanabilir, hiçbir şey kaydedilmez (`/admin/dersler/:id/test`).
- **Konuşma planı:** dersin 1 saatlik konuşma planı ve öğretmen rehberi öğrencinin Program sekmesinde ve test sayfasında görünür.

Yayın notu: uzak veritabanına önce `supabase db push` (0012), sonra frontend.
