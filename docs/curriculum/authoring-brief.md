# Kitap müfredatı — ders yazım yönergesi (içerik ajanları için)

Bu yönerge `scripts/content/book/<ders>.ts` dosyalarını yazan ajanlar içindir. Plan, kadro ve ders tablosu: `docs/curriculum/kitap-mufredati.md`. Kural çakışırsa sıra: `src/domain/content.ts` (zod şeması) > bu yönerge > referans ders.

## Önce oku
1. `docs/curriculum/kitap-mufredati.md` — ders tablosu (hedef dil bilgisi, kelimeler, tema), kadro, tenis unvanı tablosu.
2. `scripts/content/school-life-package.ts` — **referans ders**. Yapıyı birebir izle: 7 bölüm + `play` (aynı şablon ataması: review time-escape, vocabulary scroll-story vocab-reveal, vocab_quiz stamp-quiz, story scroll-story, explanation tap-guide + goNoGo, homework fill-workshop, assessment stamp-quiz, extras imagine) + teacherGuide + speakingPlan.
3. `src/domain/content.ts` — şema ve `validatePlay` sınırları.
4. `docs/play/patterns.md` bölüm 1-6 ve `.team/play/pedagog.md` bölüm 2-3 — pedagojik sınırlar.

## Dosya biçimi
```ts
/** Ünite X.Y — <başlık>: <hedef dil bilgisi>. Theme <themeId>, host <character>. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.1 — New Term, New Class',
  sourceNotes: 'Kitap Ünite 1 (School Life): … (kitaptaki dil bilgisi ve kelimeler)',
  package: { schemaVersion: 1, meta: {…}, review: {…}, vocabulary: […], story: {…}, explanation: {…}, homework: {…}, assessment: {…}, play: {…} },
  teacherGuide: {…},
  speakingPlan: {…},
}
export default lesson
```
Doğrula (ağ gerekmez), hata kalmayana kadar düzelt:
`pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/book.ts --check <ders-id> [<ders-id>…]`
Yalnız sana verilen dosyaları yaz; başka dosyaya dokunma, commit atma.

## Hacim (her ders, "dolu dolu")
| Bölüm | Hedef |
|---|---|
| review.questions | 3-5; **önceki dersin** dil bilgisi (1.1 için: he/she/it + is tekrar) |
| vocabulary | 16-22 öğe; tek kelime yerine öbek/collocation tercih ("take notes"); her birinde gerçekçi örnek cümle + Türkçesi; zorluk 1-3 dağılımı |
| story | 4 sahne, sahne başına 4-6 satır, 1 sahnede `choice`; 4-6 anlama sorusu (choice/order/text karışık) |
| explanation.steps | 6-8 adım; her adım tek fikir, 2-4 örnek, bir `check` sorusu |
| homework.groups | 8-10 grup (complete → order → meaning), dersin tüm hedeflerini kapsar |
| assessment.quiz | 12 soru, ödevden farklı prompt; hint/explain YOK |
| assessment.reading | 3 paragraf okuma (kitaptaki yazma/kültür türüne uygun: okul gönderisi, okul türleri, günlük…) + 5 True/False + 3 dört şıklı boşluk |
| meta.estimatedMinutes | 45-55 |
| objectives | 4-6; id'ler **ders önekli**: `u1l1-…` (müfredat genelinde tekil olmalı) |

## İçerik kuralları
- Öğrenci: Türk, 11-12 yaşında bir kız, 6. sınıf. Ton sıcak, zeki, **bebeksi değil**; gerçekçi Türk okul hayatı (bayrak töreni, ders programı, teneffüs, kantin, nöbetçi öğrenci, sınıf başkanı seçimi, kulüpler).
- Öğrenci metinde **"you"** olarak geçer. Adı, okulu, şehri, adresi asla yazılmaz ya da sorulmaz. Konuşma planında "gerçek ya da hayali cevap verebilirsin" seçeneği bulunur.
- Kadro sabit: Piko (he), Leo (he), Sasha (she), Dora (she), Momo (she); Ms Pearl (İngilizce öğretmeni), Mrs Demir (müdür), Mr Aydın (beden eğitimi öğretmeni + tenis antrenörü). Başka isimli karakter ekleme. `speaker` yalnız `piko|sasha|momo|dora|leo|narrator`; yetişkin konuşmaları narrator satırında tırnakla verilir ("Mrs Demir says: …").
- **Dil bilgisi sırası:** ders yalnız kendi hedef dil bilgisini + önceki derslerde öğretileni kullanır. 1.1-1.3'te present simple (-s) ve present progressive cümlesi KURMA (be fiili, imperative, there is/are, have kalıbı "I have a book" serbest). 1.4'te progressive yok. Ünite 2 tüm Ünite 1'i kullanabilir.
- İngilizce doğal ve doğru (A1-A2, cümle ≤12 kelime tercihen). İngiliz yazımı: favourite, colour, practise (fiil)/practice (isim).
- Türkçe: doğru ç ğ ı İ ö ş ü, kısa, "sen" diye hitap. Hata dili nazik: "Yaklaştın!", "Bak:"; YASAK: "yanlış", "hata yaptın", "yine mi".
- Her soru bir sahnede, isimli bir karakterle ("Ms Pearl writes on the board: …"). `hint` Türkçe, cevabı vermez. `explain` Türkçe ≤2 cümle, `**kalın**` ile kural.
- **Doğru şık konumunu dağıt** (answer 0/1/2/3 dengeli; referans dersteki gibi hep 0 olmasın). Şıklar makul çeldirici olsun, ikisi de doğru olmasın.
- `order`: `tokens` karışık sırada, `answer`'ın permütasyonu, ≤12 token; noktalama son token'a yapışık ("library.").
- `text` soruları: `accept` içinde tüm makul yazımlar; kesme işaretli kelimelerde hem `'` hem `’` sürümü ("isn't", "isn’t"); büyük/küçük harf zaten normalize edilir.
- Yasak: URL, marka, gerçek kişi adı, romantizm, şiddet, korku, kilo/görünüş yargısı. Millî günler adlarıyla anılır (Republic Day — 29 October, National Sovereignty and Children's Day — 23 April, Youth and Sports Day — 19 May, Teachers' Day — 24 November); siyasi yorum yok.
- Espri: ders başına **en çok 2** (`joke` alanları toplamı; scroll-story step + tap-guide guide).

## Play katmanı sınırları (zod da denetler)
- Slot metni ≤240 karakter. scroll-story `story` modu 1-6 adım, `vocab-reveal` 1-8 adım; adım başına ≤2 cümle, cümle ≤12 kelime; `emphasis` ≤2 ve satır içinde geçmeli; `gate` mevcut bir soru id'si.
- vocabRefs ≤25 (tüm kelimeler); vocab_quiz `questions` 6-8 kelime id'si, `showStreak: true, shield: true, hintBudget: 2`.
- tap-guide: guides 2-4 (`stepRef` mevcut adım id'leri), goNoGo warmup 4-5, round 8-10, `why` tek satır; kural dersin ana ayrımı (ör. 1.1 a/an, 1.2 olumlu/olumsuz emir, 1.4 -s alır/almaz, 1.5 -ing şimdi mi?, 2.2 now/every day).
- fill-workshop items 6 (homework soru id'leri: complete veya order), `hint.fine` cevabı vermez.
- time-escape pool 12-20: bu dersin kelime id'leri + review soru id'leri. `seconds: { bank: 10, perCorrect: 3, cap: 10 }`.
- assessment: `hintBudget: 0, explain: false`, tüm quiz id'leri.
- imagine: 6-10 çip (ünite kelimeleri), `frame` dersin kalıbı; 1.6'da `activity: 'scene'` + "okul rutinleri posteri" koleksiyonu.

## teacherGuide ve speakingPlan (Türkçe, öğretmen için)
- teacherGuide: tüm alanlar dolu; expectedDifficulties 5+ (Türkçe konuşan çocuğa özgü: ör. a/an'ı yazıya göre seçmek, -s unutmak), commonErrors 5+, listening script 80-120 kelime + 4-5 soru, rolePlay gerçekçi okul durumu.
- speakingPlan: ~60 dk; bloklar warmUp 5, vocabulary 10, grammar 10, rolePlay 10, listening 8, weaknessReinforcement 8, freeSpeaking 7-9; closingTask kitaptaki yazma/proje çıktısına bağlı (1.6 school post + poster, 2.3 sayı oyunu, 2.4 diary).

## Tenis unvanı (öğrenciyi mutlu edecek an)
Öğrencinin unvanı: **"2026-2027 Eğitim Öğretim Yılı Okul Sporları Mahalli Tenis Müsabakaları Küçük Kız İl Birincisi"**. İngilizce karşılığı: **"the province champion (first place) in the Junior Girls' category of the 2026-2027 School Sports Local Tennis Competition"** — sahnelerde kısa: "the province tennis champion", "first in the province". Yalnız kendi dersindeki yerlere koy (kitap-mufredati.md tablosu); doğal, gururlandıran, abartısız. 1.6'da Türkçe unvan bir `tr` satırında **birebir** geçer.
