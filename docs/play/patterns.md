# LUGU PLAY — Oyun Şablon Kataloğu

Şablon = mekanik + içerik yuvaları + tema yuvaları. Kod: `src/play/templates/<id>/`. Görsel/ses/hareket kuralları `design-bible.md`; sayısal sınırlar pedagog'dan (`.team/play/pedagog.md`).
Ortak (her şablon): ekranda tek ana görev; doğal bitiş noktası (otomatik sonraki oyun yok); duraklat + ses tuşu görünür; reduced-motion sakin; klavye ile oynanır; sürükleme varsa dokun-yerleştir alternatifi; hata dili "Yaklaştın!" (yasak: "yanlış", "hata yaptın"); aynı soruda 2 yanlışta Piko yardımı, 3.'de doğruyu açıkla + "sonra tekrar" kuyruğu (aynı gün <= 30 dk); ardışık 3 yanlışta zorluk bir kademe iner (belli edilmez).

## 0. Şema (geriye uyumlu ekleme: `src/domain/content.ts`)

Mevcut alanlara DOKUNULMAZ. `schemaVersion: 1` kalır; yeni alan opsiyonel. Eski paket = `play` yok = varsayılan eşleme (bölüm 9).
```ts
export const TEMPLATE_IDS = ['scroll-story','tap-guide','time-escape','fill-workshop','stamp-quiz','imagine','inspire-worlds'] as const
export const THEME_IDS = ['base','u1-morning','u2-night-oven','u3-neon-street'] as const

// LessonPackage.meta içine:
themeId?: ThemeId            // yoksa 'base'

// LessonPackage köküne:
play?: {
  sections: Partial<Record<SectionKey, SectionPlay>>   // yoksa bölüm varsayılan şablonu
  extras?: ExtraPlay[]                                  // isteğe bağlı: imagine (<=1)
}
type SectionPlay = { template: TemplateId; slots?: Slots[TemplateId]; hintBudget?: number; timed?: false }
type ExtraPlay = { template: 'imagine'; slots: ImagineSlots }
```
Kurallar (zod `superRefine`): `time-escape` yalnız `review` ve `vocab_quiz` bölümüne atanabilir; `assessment` için yalnız `stamp-quiz` (zamansız, ipucusuz); `slots` içindeki her `ref` mevcut `id`'ye (vocab/question/step) bağlanır. Tüm slot metinleri `Text` (min 1) ve uzunluk sınırlı.
Ortak yuva türleri:
```ts
type Ref = string                       // mevcut vocab/question/scene/step id
type Joke = { tr: string; en?: string }  // <= 2 satır, cevap vermez
type Hint = { fine: string; big?: string }  // fine: cevap vermez; big: şıkları 4->2 eler
```

## 1. scroll-story (id `scroll-story`) — Kaydır-anlat
- Ne zaman: yeni bilgi/hikâye tanıtımı, kelime kartları, sahne anlatısı. Zaman baskısı yok.
- Pedagog sınırı: sahne <= 6 adım; adım başına <= 2 cümle (<= 12 kelime/cümle); ders başına <= 2 espri; bölüm 3-4 dk; her adım kendi hızında (otomatik ilerleme yok). Hikâyede çocuğa dallanma seçimi: her seçenek "kabul edilebilir", puan yok.
- Mekanik: ekran kaymaz, sahne ilerler (pinned). Girdi: dokun / ileri tuşu (mobil), tekerlek/ok tuşu/Space (web). Her adım yeni bilgi açar; anahtar kelime kelime belirir (60 ms). Opsiyonel "doğru cevapla aç" kapısı (`gate: Ref`).
- Yuvalar:
```ts
type ScrollStorySlots = {
  mode: 'story' | 'vocab-reveal'
  steps: { id: Id; scene?: string /*illustration*/; line: { speaker: CharacterKey|'narrator'; en: Text; tr?: string };
           emphasis?: string[] /*en içinde vurgulanacak kelimeler, <=2*/; gate?: Ref; joke?: Joke }[]   // 1..6 (story) / 1..8 (vocab-reveal)
  choice?: { prompt: Text; options: { text: Text; feedback: Text }[] /*2..4*/ }
  vocabRefs?: Ref[]    // vocab-reveal: Şeker Flip kartları, kart bitince şeker kavanoza düşer
}
```
- Tema yuvaları: `themeId` (zemin/doku/ambient), `character` (anlatıcı/balon), `sceneBg`. Radius/boşluk sabit.
- Akış: `intro` -> `step[i]` (bekle -> açıl) -> `[gate]` -> `choice?` -> `done` (kutlama-küçük, "devam" düğmesi). Hata: gate yanlışsa ipucu merdiveni, ilerleme kilitlenmez (3. yanlışta açıklayıp geçirir).
- Erişilebilirlik: her `en` satırında sesli okuma (yavaş/normal); reduced-motion: kelimeler hemen görünür.

## 2. tap-guide (id `tap-guide`) — Bana tıkla + tıkla/sakın tıklama
- Ne zaman: kural/dilbilgisi tanıtımı (`explanation`), ayırt etme (he/she/it -> is).
- Pedagog sınırı: işaret ekranda <= 1; nabız 1.2 sn, 3 döngü sonra durur; aynı işaret aynı gün 2. kez gösterilmez; ders başına <= 3 ipucu hakkı; ipucu kademeleri 8 sn bekleme -> ince -> büyük; ceza yok, ipucusuz çözene küçük yıldız. "Tıkla/Tıklama" turu: 8-10 öğe, tur < 90 sn; önce süresiz ısınma turu; yanlış tıklamada komik animasyon <= 1 sn, 3. tekrardan sonra sessiz (alay yok), puan cezası YOK; bant yavaş, hedef >= 48px.
- Mekanik: (a) `guide`: sahnede 1 parlayan şeker + "bana tıkla" -> kısa esprili ipucu. (b) `go-nogo`: Şekerleme Bandı akar; "bunu görürsen tıkla" kuralı (`rule`) uyana dokun, uymayana dokunma.
- Yuvalar:
```ts
type TapGuideSlots = {
  guides: { id: Id; target: string /*sahne öğesi anahtarı*/; hint: Hint; joke?: Joke; stepRef?: Ref }[]   // 1..6
  goNoGo?: {
    rule: { tr: Text; tapIf: string /*ör. 'he|she|it'*/ }
    warmup: GoItem[]          // 4..5, süresiz
    round: GoItem[]           // 8..10
    onWrongTap: { anim: 'sneeze'|'candy-pop'; line: Text }   // <= 1 sn
  }
}
type GoItem = { id: Id; text: Text; tap: boolean; why: Text }  // why <= 1 satır, yanlışta gösterilir
```
- Tema yuvaları: `character` (reaksiyonu Piko/seçilen karakter), `themeId`, işaret ikonu sabit (Sparkles).
- Akış: `intro` -> `guide[i]` (idle -> hint-offered(8 sn) -> fine -> big -> resolved) -> `go-nogo.warmup` -> `round` -> `summary` ("yeni öğrenilen: n").
- Erişilebilirlik: reduced-motion: işaret sabit halka; her `GoItem` metin + ikon (tıkla/tıklama) ile işaretli, renk tek başına değil.

## 3. time-escape (id `time-escape`) — Lavdan/Canavardan kaç
- Ne zaman: YALNIZ öğrenilmiş içerikte akıcılık pekiştirme (`review`, `vocab_quiz` sonrası). Yeni konu, açıklama, ilk test, ilk karşılaşma ASLA.
- Pedagog sınırı: banka 10 sn, tavan 10 sn; doğru +3 sn; tur 60-90 sn; tüm turun %60'ı rahat tempo; günde <= 3 zamanlı tur (4.'de mola kartı); art arda 2 turda süre dolarsa otomatik kolay mod önerisi; son 3 kademede yumuşak nabız (<= 1 Hz); süre dolunca ceza yok, Piko kaçar, şeker kalır; tik-tak sesi varsayılan KAPALI; titreşim yok. Kolay mod: süre akmaz/yavaş, kırmızı yok, ödül aynı. Duraklat her an (ekran bulanık, süre durur).
- Görsel: 10 kademe yeşil->kırmızı (kademe rakamı + Karamel Nehri yüksekliği ile de gösterilir) + radial vinyet alpha 0->.55; kademe 1'de tam ekran tint .35 + tek 1 Hz nabız (design-bible H). Soru kartı opak.
- Yuvalar:
```ts
type TimeEscapeSlots = {
  pool: Ref[]               // 8..20; yalnız mastered/en az 1 doğru çözülmüş öğeler (çalışma zamanı filtreler)
  seconds: { bank: 10; perCorrect: 3; cap: 10 }   // sabit; değiştirilemez (zod literal)
  chase: { chaser: 'honey-slime'|'caramel-river'; escapee: CharacterKey }  // "yakaladı" yok
  easyDefault?: boolean
}
```
- Tema yuvaları: `themeId` (nehir/zemin dokusu), `chaser` görseli, `escapee`. Vinyet rengi SABİT (`--danger-edge`), temalanmaz.
- Akış: `gate` (öğrenilmiş içerik yoksa şablon açılmaz, `stamp-quiz`a düşer) -> `ready` (kolay mod seçeneği, tek dokunma) -> `run` (kademe 10..1, doğru +3) -> `end-win|end-time` (ikisi de kutlama/yumuşak çıkış, "bir tur daha" düğmesi var ama günlük sınır sonrası mola kartı) -> `summary`.
- Reduced-motion: vinyet kademeye göre SABİT, nabız yok; sayı + Hourglass + "n sn kaldı" metni her zaman.

## 4. fill-workshop (id `fill-workshop`) — Boşluk doldurma atölyesi (Tık Tezgâhı)
- Ne zaman: cümle kurma/tamamlama; `homework` complete + order grupları.
- Pedagog sınırı: boşluk <= 3; kelime havuzu <= 8 çip; çip 48px; cümle <= 12 kelime; süre yok; ipucu merdiveni (şık eleme); yanlış yerleşimde sallanma yok, çip 300 ms solup havuza döner + 1 satır neden.
- Mekanik: kelime çipine dokun -> boşluğa dokun (veya sürükle; 24 px yakında yumuşak vurgu, mıknatıs YOK); yerine oturunca `tik` sesi + 180 ms `--ease-pop`, cümle canlanır (Piko okur). Mevcut `OrderQuestion`/`ChoiceQuestion` doğrulaması kullanılır (sunucu puanı değişmez).
- Yuvalar:
```ts
type FillWorkshopSlots = {
  items: { ref: Ref /*homework complete|order sorusu*/; sceneObject?: string; onComplete?: { anim: 'sentence-glow'|'object-wiggle'; sfx?: 'kutlama-kucuk' } }[]  // 1..6
  hint?: Hint
}
```
- Tema yuvaları: `themeId`, `sceneObject` (cümle tamamlanınca canlanan nesne, ünite temasına göre).
- Akış: `item[i]`: `idle` -> `placing` -> `placed(tik)` -> `check` (sunucu/JS grading) -> `correct (mühür) | retry (soluk + neden)` -> sonraki; `summary`.
- Erişilebilirlik: dokun-yerleştir ana yol; çipler `button`, boşluklar `aria-label="boşluk 1"`; sonuç `aria-live`.

## 5. stamp-quiz (id `stamp-quiz`) — Mühürlü test
- Ne zaman: her çoktan seçmeli/true-false değerlendirme: `vocab_quiz`, story soruları, `assessment` (zamansız, ipucusuz, açıklamasız), explanation `check`.
- Pedagog sınırı: tek ekran/soru; açıklama <= 2 cümle; devam butonu hep görünür; ipucu hakkı 1-2 (assessment 0); seri çarpanı tavan x3; yanlışta seri yarıya iner/kalkan; mastery kuralı DEĞİŞMEZ (son hatadan beri 2 doğru). Test içi seri: Karamel Akışı. Test sonu: yüzde, mastery "adım", önceki denemeyle kıyas (son 5), en iyi seri, karışan kelimeler.
- Mekanik: Balmumu Mühür seçenekleri (C4); cevapta doğru + seçilen yanlış aynı ekranda; "Açıkla" 2 cümle.
- Yuvalar:
```ts
type StampQuizSlots = {
  questions: Ref[]            // mevcut Question id'leri (choice); order/text mevcut renderer'a düşer
  showStreak?: boolean        // test-içi seri göstergesi
  shield?: boolean            // 1 kalkan, 5 doğruda yenilenir
  hintBudget?: 0 | 1 | 2      // assessment'ta 0 zorunlu
  explain?: boolean           // assessment'ta false zorunlu
}
```
- Tema yuvaları: `themeId`; mühür şekli sabit; mühür rengi doğru=bal-yeşil sabit (temalanmaz, durum rengi).
- Akış: `question` -> `selected` -> `stamped` (420 ms) -> `feedback` (doğru+seçilen) -> `next`; `streak-break` (pof <600 ms); `end` -> `results`.

## 6. imagine (id `imagine`) — Hayal kur (Şeker Dükkânı Kur)
- Ne zaman: ünite sonunda isteğe bağlı üretim; bölüm değil, `extras` (ana sayfadan da açılır). Yanlışı yok.
- Pedagog sınırı: 5-8 dk; kapalı çip havuzu (6-10 çip); cümle kalıbı hazır (dilbilgisi hatası imkânsız); düzeltme yok, "daha da güzel yap" önerisi; skor yok, yalnız koleksiyon; paylaşım opsiyonel (akran puanı YOK); sıra bozuksa Piko "ha ha, olur!". 3 etkinlik: karakter kur / sahne kur / mini hikâye (3 kutu).
- Yuvalar:
```ts
type ImagineSlots = {
  activity: 'character' | 'scene' | 'story'
  frame: Text                                   // "My monster is ___ and ___."
  chips: { id: Id; en: Text; tr: Text; kind: 'adj'|'noun'|'verb'|'place' }[]   // 6..10, ünite kelimelerinden
  parts?: { id: Id; art: string }[]             // çizim parçaları (hazır set)
  backgrounds?: { id: Id; label: Text }[]       // 3 (uzay, orman, şeker dükkânı)
  collection: { title: Text }                   // koleksiyon kimliği
}
```
- Tema yuvaları: `themeId`, `parts/backgrounds` seti ünite temasına göre.
- Akış: `pick` (çip/parça) -> `build` (cümle otomatik kurulur) -> `play` (Piko okur, sahne canlanır) -> `save` (koleksiyon) -> `done` (tek "yeni oluştur" veya çık).

## 7. inspire-worlds (id `inspire-worlds`) — İngilizce ile neler yapabilirsin?
- Ne zaman: ders değil; öğrenci ana sayfasından açılan motivasyon ekranı. Veri paketten bağımsız: `src/play/data/worlds.ts` (8 dünya). Ünite bağı: `meta.inspireRef?: Id` (ünitenin konusuna uyan dünyayı öne çıkarır).
- Pedagog sınırı: 8 dünya (oyun, uzay, dünya turu, film, müzik, bilim, dünya arkadaşları, yaratıcı üretim); KİLİT YOK, ödül yok (merak); her sahne 20-40 sn, gerçekçi (abartı/sihir yok); sohbet sahneleri simülasyon, gerçek yabancı iletişimi YOK; kişisel veri istenmez.
- Yuvalar:
```ts
type World = { id: Id; title: Text; kavanozArt: string;
  scene: { steps: { en: Text; tr: Text; interact?: 'tap-reveal'|'fill' }[] /*2..4*/ };
  youKnowAlready: { en: Text; tr: Text }      // "senin seviyen: bu cümleyi zaten anlarsın"
  linkUnit?: Id }
```
- Tema yuvaları: dünya başına kendi kavanoz rengi (ünite temasından bağımsız, sabit palet), `base` zemin.
- Akış: `hub` (8 kavanoz, aynı silüet) -> `world` (tap-reveal adımlar) -> `youKnow` -> `hub`. Çıkış her an.

## 8. Ünite 1 (Daily Routines) örnek doldurulmuş paket (kısaltılmış)
Seed `scripts/demo/seed-grade6.ts` + MEB 6. sınıf Ünite 1: günlük rutinler, geniş zaman he/she -s, saat sorma. Karakter `piko`, tema `u1-morning`.
```ts
{
  meta: { /* mevcut alanlar */ themeId: 'u1-morning', character: 'piko' },
  play: { sections: {
    vocabulary: { template: 'scroll-story', slots: { mode: 'vocab-reveal',
      steps: [
        { id: 'v-wake', line: { speaker: 'piko', en: 'wake up', tr: 'uyanmak' }, emphasis: ['wake'] },
        { id: 'v-bfast', line: { speaker: 'piko', en: 'have breakfast', tr: 'kahvaltı etmek' }, emphasis: ['breakfast'] },
        { id: 'v-time', line: { speaker: 'piko', en: 'What time is it?', tr: 'Saat kaç?' }, emphasis: ['time'],
          joke: { tr: "'It' saatin ismi gibi; saate 'he' denmez, saat gücenir." } } ],
      vocabRefs: ['wake-up', 'have-breakfast', 'what-time'] } },
    vocab_quiz: { template: 'stamp-quiz', slots: { questions: ['vq-1','vq-2','vq-3','vq-4','vq-5'], showStreak: true, shield: true, hintBudget: 2 } },
    story: { template: 'scroll-story', slots: { mode: 'story', steps: [ /* story.scenes'ten türetilir: 4 adım */ ],
      choice: { prompt: 'Piko ne yapsın?', options: [{ text: 'Hemen kalksın', feedback: 'Güne enerjik başlar!' }, { text: 'Biraz daha uyusun', feedback: 'Olur, ama saat ilerliyor.' }] } } },
    explanation: { template: 'tap-guide', slots: {
      guides: [{ id: 'g-is', target: 'pronoun-he', hint: { fine: "He, she, it: üçü de 'bir tane' kulübü.", big: 'Bu üçünün yanına hangi kapıcı gelir: am, is, are?' },
                  joke: { tr: "He, she, it -> IS. 'Is' kulübün kapıcısı." } }],
      goNoGo: { rule: { tr: "'is' ister mi? Görürsen dokun.", tapIf: 'he|she|it' },
        warmup: [{ id: 'w1', text: 'she', tap: true, why: 'she tek kişi -> is' }, { id: 'w2', text: 'they', tap: false, why: 'they çok kişi -> are' }, { id: 'w3', text: 'it', tap: true, why: 'it -> is' }, { id: 'w4', text: 'we', tap: false, why: 'we -> are' }],
        round: [ /* 8-10 GoItem: he, I, you, it, she, we, they, he, ... */ ],
        onWrongTap: { anim: 'sneeze', line: 'Hapşu! Bu sefer o değil.' } } } },
    homework: { template: 'fill-workshop', slots: { items: [{ ref: 'hw1-complete', sceneObject: 'clock', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } }, { ref: 'hw1-order' }], hint: { fine: "Fiilin sonuna ne geliyor? he/she için s" } } },
    assessment: { template: 'stamp-quiz', slots: { questions: ['as-1', /* ... 10 soru */], hintBudget: 0, explain: false } },
    review: { template: 'time-escape', slots: { pool: ['wake-up','have-breakfast','what-time'], seconds: { bank: 10, perCorrect: 3, cap: 10 }, chase: { chaser: 'honey-slime', escapee: 'piko' }, easyDefault: false } }
  },
  extras: [{ template: 'imagine', slots: { activity: 'character', frame: 'My monster wakes up at ___.', chips: [ /* 6-10 */ ], collection: { title: 'Sabah Canavarlarım' } } }] }
}
```

## 9. Mevcut 7 bölüm tipine eşleme (varsayılan = `play` yokken)
| bölüm | varsayılan şablon | izinli şablonlar | not |
|---|---|---|---|
| `review` | `stamp-quiz` | `time-escape` (yalnız öğrenilmiş), `stamp-quiz` | asla bloklamaz; zamanlı varsayılan DEĞİL |
| `vocabulary` | `scroll-story` (`vocab-reveal`) | `scroll-story`, `tap-guide` | Şeker Flip kartı |
| `vocab_quiz` | `stamp-quiz` | `stamp-quiz`, `time-escape` (>= 1 doğru çözülmüşse) | mastery 2 doğru kuralı |
| `story` | `scroll-story` (`story`) | `scroll-story` | `story.questions` -> `stamp-quiz` alt adımı |
| `explanation` | `tap-guide` (`guide`) | `tap-guide`, `scroll-story` | step.check -> `stamp-quiz` satır içi |
| `homework` | `fill-workshop` | `fill-workshop`, `stamp-quiz` | meaning sorusu `stamp-quiz` |
| `assessment` | `stamp-quiz` | yalnız `stamp-quiz` | zamansız/ipucusuz/açıklamasız |
`imagine`: bölüm değil; `extras` veya ana sayfa. `inspire-worlds`: bölüm değil; ana sayfa. Eski paket: her bölüm varsayılan şablon + `themeId='base'`; mevcut `LessonPlayer` davranışı korunur (render fallback).

## 10. "Yeni konu = %96 yeniden kullan + %4 değiştir"
İçerik ajanı yeni ünite üretirken SIFIRDAN şablon seçmez: `authoring-log.md`'deki son işe yarayan ünite planını kopyalar, aşağıdaki "değişir" listesini doldurur.
SABİT (dokunma): şablon motorları ve süre/limit sayıları (banka 10 sn, +3, tavan 10; ipucu merdiveni; seri çarpanı x3; mastery 2 doğru); tasarım token'ları; ses tablosu; geri bildirim dili/sözlüğü; bölüm sırası ve 7 bölüm yapısı; ünite başı akış (kelime -> mini test -> hikâye -> açıklama -> ödev -> değerlendirme -> tekrar); mühür/streak/ilerleme görselleri; kolay mod, duraklat, mola kartı; `assessment` kuralları; `inspire-worlds` verisi.
DEĞİŞİR (müfredata göre): (1) içerik yuvaları (kelimeler, cümleler, sorular, `GoItem` listesi, espriler <= 2); (2) `themeId` (bir sonraki ünite sırası: base -> u1 -> u2 -> u3; yeni tema ancak yeni token seti + AA doğrulamasıyla); (3) `character` ve `escapee`/`chaser`; (4) EN ÇOK BİR bölümde şablon ataması (örn. `explanation` tap-guide yerine scroll-story) — gerekçe log'a yazılır; (5) `sceneObject`/ambient eşlemesi tema ile gelir; (6) `imagine.frame/chips/collection.title`.
Üretim sırası: log'dan son planı kopyala -> kelime/dilbilgisi yuvalarını doldur -> tema+karakter seç -> en çok 1 şablon değiştir -> sınırları doğrula (zod + yukarıdaki sayılar) -> log'a satır ekle. Yanlış tema/karakter/şablon kombinasyonu log'da "işe yaramadı" notuyla işaretlenir ve tekrarlanmaz.
