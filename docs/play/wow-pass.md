# LUGU PLAY — Wow Pass (CTA + Hikâye Rafı + Ders Oturumu)

Durum: bağlayıcı, `design-bible.md` üzerine ek. Çatışma sırası: pedagog vetosu > bu belge > bible > sanatçı > cilgin.
Bu belge TEK istisna açar: bible C "boşta nefes yalnız Piko" -> ekranda EN ÇOK 1 hero CTA sınırlı süre nefes alır (A2). Başka her yerde bible geçerli.
Kural 0 aynen: reduced-motion sakin, ses tek tuşla kapanır, renk tek başına anlam taşımaz, hedef >= 44px, flaş <= 3 Hz, ekranda aynı anda 1 büyük + 2 küçük hareket.

## A) CTA buton sistemi — `CandyButton.vue` (`src/design/components/`)
Metafor: şeker. Sade `BaseButton` yalnız ikincil/quiet/admin kalır. Birincil eylem = CandyButton. Admin'de YOK.

### A1. Üç varyant
| varyant | görünüm | boyut | nerede |
|---|---|---|---|
| `jelly` (varsayılan) | jöle şeker: dolgu `--primary-fill`, üstte parlak yansıma, alt dudak (lip) | lg 56px / md 44px | tüm birincil eylemler: giriş, "Kontrol et", "Devam et", mühür testi, hikâye seçeneği onayı |
| `wrapper` (hero) | sarılı şeker: hap gövde + iki ucu bükülü kâğıt saçak (SVG) | lg 64px, min 220px | EKRAN BAŞINA 1: Ana sayfa "Derse başla", ders intro "Başlayalım", hikâye finali "Rafa koy", ders sonu "Haritaya dön" |
| `drop` (mini) | damla/pastil şeker, tek renk, yansıma yok, saçak yok | md 44px | satır içi "Sıradaki", "Sonra", bölüm sonu kartı; bir ekranda birden çok olabilir |
Props: `variant`, `size`, `loading`, `disabled`, `disabledReason` (görünür metin, `aria-describedby`), `as` (router-link geçer), `celebrate()` (exposed; başarı patlaması). Etiket: ikon (lucide, 20px) + metin; `--on-primary` üstü; Piko/şeker ikonu yalnız dekor.

### A2. Durum tablosu (süreler token: fast 150, base 200, slow 340, ease-pop)
| durum | jelly / drop | wrapper (ek) | süre/ease |
|---|---|---|---|
| idle | statik; yansıma sabit | nefes: scale 1->1.02, ilk görünüşten sonra 4 döngü (3.6s) durur; 8 sn işlemsiz kalırsa 2 döngü daha; saçaklar nefesle 2deg sallanır | idle 3600 ease-in-out |
| hover (yalnız imleç) | translateY(-1px), brightness 1.06, yansıma 12% sağa kayar | saçaklar 6deg açılır | fast standard |
| press (`pointerdown`/`:active`) | scale(1.03,.94) 90ms ezilme, lip 3->1px, translateY 2px; bırakınca yaylanma | saçak sıkıca bükülür (rotate 14deg) | 90ms ezil + 180ms ease-pop geri |
| success (`celebrate()`) | etiket Check ikonuna döner 400ms; 6 şeker parçacığı (`<i>` x6, `--dx/--dy` CSS değişkeniyle 36-56px, 600ms, `lugu-burst` keyframe yeniden kullan); ses `pop` | saçaklar kâğıt gibi uçup solar 500ms, gövde 1.0'a oturur | celebrate 900; yalnız 1 patlama/basış |
| loading | etiket sabit, solda 16px dönen şeker; basış kilitli, odak kalır | nefes durur | spinner 900ms lineer |
| disabled | doygunluk 50%, yansıma yok, lip 1px, metin `--ink-soft` + yanında neden satırı ("Önce bir seçenek seç") | nefes yok | geçiş base |
| focus | `focus-ring` (outline 2px primary-ink, offset 2px); ayrıca yansıma | aynı | anlık |
Hover sesi YOK (varsayılan kapalı). Basış sesi `tik`; başarıda `pop`. Parçacık sayısı 6'yı, aynı anda patlama 1'i geçmez.

### A3. CSS/SVG tekniği (JS yalnız `data-pressed` ve parçacık tetikleyici)
- Gövde: `background: var(--primary-fill)`; yansıma `::before` = `radial-gradient(ellipse 60% 40% at 30% 18%, rgb(255 255 255 / .28), transparent 70%)` yalnız üst %45; alt gölge `::after` = `linear-gradient(transparent 55%, rgb(0 0 0 / .10))`. Yansıma etiketi örtmez (`z-index` etiket üstte; alpha <= .28; `checkStyling` çiftleri fill/on-primary değişmez, gradient test dışı olduğundan kenar-örnekleme testi: etiket bölgesinde ortalama kontrast >= 4.5).
- Lip: `box-shadow: 0 var(--lip-sm) 0 color-mix(in oklab, var(--primary-fill) 65%, black)`; basılı `0 1px 0`.
- Wrapper saçakları: tek inline SVG sembol `#candy-twist` (2 path, `currentColor` = `--accent` dekor), sol/sağ `<use>`; `transform-origin` gövde kenarında. Dekor: `aria-hidden`.
- Ünite teması: dolgu zaten `--primary-fill`; saçak `--accent`; metin `--on-primary`. Hiçbir ünitede ek hex yok.
- Reduced-motion: nefes/ezilme/parçacık/saçak sallanması yok. Basış = yalnız lip 3->1 + 4% koyulaşma; success = Check ikonu + `kutlama-kucuk` yok (sessiz) ya da ses açıksa `pop`. Hover = renk.
- Performans: yalnız `transform/opacity`; parçacık DOM'u başarıda eklenir, 700ms sonra kaldırılır; `will-change` yalnız press süresince.
- Kabul: 375px'te lg buton tam genişlik, min-h 56; `prefers-reduced-motion` ekran görüntüsü karşılaştırması; galeride (`DesignGallery`) 3 varyant x 7 durum.

## B) Hikâye Rafı (İlham ekranının yerine) — "Piko ile Hikâyeler"
Karar: "neler yapabilirsin" menüsü ölür. Rota aynı kalır (`/ilham`), bilgi mimarisi değişir. 8 dünya = raftaki 8 kavanoz = 8 hikâye. Çocuk İngilizce bilen bir karakterin yerine geçer, seçer, sonucu görür; son kare = "İngilizce bildiğin için ..." anı.

### B1. Yapı
1. Raf (`InspireView`): üstte "Kaldığın hikâye" kartı (varsa), altında 8 kavanoz ızgarası (2 kolon mobil / 4 kolon md). Kavanoz üstünde kare boncukları (5-6 boncuk, dolu=dolgu+kontur). Bitenin kapağı mühürlü + içinde hatıra şekeri.
2. Hikâye oynatıcı (`StoryPlayer`, tam ekran sheet, `--radius-shell`): 5-6 kare. Üst: kare boncukları + kapat (X her zaman görünür, çıkınca kaldığı kare kaydolur). Orta: sahne (sade SVG sahne + karakter; `world-motifs.ts` yeniden kullanılır). Alt: balon (EN `type-task` + TR `type-small`, TR dokunca açılır) + `SpeakButton` (yavaş/normal). Kelimeler `--stagger` 60ms ile belirir (<= 12 kelime).
3. Seçim: 2-3 kart (control 12, >= 56px). HEPSİ geçerli, yanlış yok, süre yok. Seçince seçilen kart mühürlenir (`muhur` 420ms), sonuç karesi seçime göre değişir (dal-ve-birleş: 5-6 karede kalır).
4. Final kare (payoff): büyük mühür basılır (900ms, `kutlama-buyuk` yalnız burada), "İngilizce bildiğin için ..." satırı, hatıra şekeri kavanoza düşer, `wrapper` CTA "Rafa koy". Altında öneri (kilit değil): "Sıradaki raf: {dünya} — {hook}" `drop` CTA.
5. Tekrar: bitmiş hikâyede "Bu sefer farklı seç". Sonlar seçime göre belirlenir; "2 sondan 1'ini gördün" (net kriter, rastgele yok).

### B2. İlerleme/koleksiyon (pedagog §9 içinde)
- 8 hatıra şekeri (hikâye başına 1, bitirince; çaba kriteri = hikâyeyi sonuna kadar oynamak). Rozet: tek "Hikâye Koleksiyoncusu" (8 hatıra) -> rozet sayısına 1 yazılır (<= 40 toplam). Para/şeker kazancı: hikâye başına +5 şeker (günlük tavan 120 içinde). Rastgele ödül YOK; kaynak her zaman görünür ("Rafı tamamladın = bu rozet").
- Kilit YOK: 8 kavanoz baştan açık. "Merak" = öneri sırası (Piko "Bunu dene" parlak şeker, 3 döngü) + bitmiş hikâyede gizli ikinci son ipucu ("Başka bir son var").
- Güvenlik: sohbet sahnesi (Mia) simülasyon; kare 1'de not, yazı girişi YOK (yalnız çip), kişisel veri YOK. Zamanlayıcı YOK.

### B3. Veri şekli (TS taslağı) — `src/features/student/inspire/storyTypes.ts`
```ts
export type Gender = 'he' | 'she' | 'it'
export interface Line { en: string; tr: string }            // en/tr içinde {pick:<choiceId>} yer tutucu
export interface Cast { id: string; name: string; gender: Gender; glyph: string }  // glyph = lucide adı veya karakter anahtarı
export interface Option { id: string; en: string; tr: string; result: Line }       // result = sonraki kareye giren cevap
export interface Choice { id: string; prompt: Line; options: readonly Option[] }   // 2-3 şık, yanlış yok
export interface Frame {
  id: string; beat: 'hook' | 'problem' | 'choice' | 'result' | 'payoff'
  scene: string                // world-motifs anahtarı
  speaker: 'narrator' | string // Cast.id
  line: Line; choice?: Choice
}
export interface Story {
  id: string; worldId: string; title: Line
  cast: readonly Cast[]; frames: readonly Frame[]   // 5-6 kare
  proud: { can: Line; tr: string }                  // "İngilizce bildiğin için ..." satırı
  souvenir: { id: string; name: string; glyph: string }
  endings: number; simulation?: boolean             // Mia: true -> kare 1 notu zorunlu
}
export interface StoryProgress { frame: number; picks: Record<string, string>; done: boolean; endingsSeen: string[]; at: string }
```
Doğrulama (TS testi yok kuralı: yalnız `scripts/` lint): cümle <= 12 kelime, `{pick:…}` her zaman tanımlı, 5-6 kare, her şıkta `result`.
Saklama: `localStorage` `lugu.story.v1` = `Record<storyId, StoryProgress>` (try/catch; eski `lugu.inspire.opened` okunur, göç yok). İçerik: `src/features/student/inspire/stories.ts` (8 hikâye, tek dosya, ders paketlerinden bağımsız). `worlds.ts` yalnız raf kapağı (id, başlık, hook, ikon, tint) kalır; `steps/youKnow` silinir.

### B4. 8 hikâye taslağı (kare: K1 hook, K2 problem, K3 SEÇİM, K4 sonuç, K5 final; cümleler <= 9 kelime)
1. oyun "Kilitli Kapı" — Robo (it). K1 The door is locked. | K2 Robo: "Press START. Find the red key." | K3 "Where is the key?" -> Look in the box / Look under the bridge | K4 kutu: "It is empty. A note: It is on the bridge!" ya da köprü: "It is here! The key is red." | K5 Robo: "Level 2 is open!" Final: "Oyunun yazısını kimseye sormadan okudun." Hatıra: kırmızı anahtar şekeri.
2. uzay "Houston'dan Mesaj" — Nova (she). K1 Nova: "Houston, we have a message." | K2 Houston: "What can you see?" | K3 "I can see the ___." -> Moon / Earth / stars | K4 Nova: "Yes! The {pick} is big and bright." | K5 Houston: "Good job, team!" Final: "Telsize İngilizce cevap verdin." Hatıra: yıldız şekeri.
3. tur "Havalimanı Kafesi" — Garson Sam (he). K1 You are at the airport. You are hungry. | K2 Sam: "Hello! What would you like?" | K3 "I would like a ___, please." -> tea / juice / sandwich | K4 Sam: "A {pick} for you! Anything else?" (ek şık: No, thank you / A table for two) | K5 Sam: "Enjoy!" Final: "Siparişini kendin verdin, çeviri yok." Hatıra: bilet şekeri.
4. film "Sessizlik! Çekim!" — Zoe (she), Yönetmen. K1 "Quiet on set! Action!" | K2 Zoe: "She is the hero. You are the guide." | K3 "Your line: I am your ___." -> friend / guide / neighbour | K4 Zoe: "I am your {pick}? Great line!" | K5 "Cut! Perfect take!" Final: "Altyazısız replik oynadın." Hatıra: klaket şekeri.
5. muzik "Dörtlüğü Bitir" — Max (he). K1 Max: "One, two, three, four!" | K2 Song: "Sing along with me." | K3 "I sing in the ___." -> morning / rain / night | K4 koro: "I sing in the {pick}! Everyone sings." | K5 sahne ışığı. Final: "Şarkıyı anladın ve dizeyi sen kurdun." Hatıra: nota şekeri. Sonlar: sabah/yağmur/gece.
6. bilim "Dokunma! Sıcak!" — Dr. Ada (she). K1 Ada: "Don't touch! It is hot." | K2 "Mix the blue water and the red water." | K3 "Now let us ___!" -> watch / wait / write | K4 "It is purple! Let us {pick}." | K5 Ada: "Good scientist!" Final: "Uyarıyı okudun, deney güvenle bitti." Hatıra: mor damla şekeri.
7. arkadas "Mia ile Tanışma" (simülasyon, K1 notu: "Mia gerçek biri değil; bu bir canlandırma.") — Mia (she). K1 not + Mia: "Hi! I am Mia. I am 11." | K2 "And you? What do you like?" | K3 "I like ___." -> drawing / football / cats | K4 Mia: "Cool! I like {pick} too!" | K5 "She is my friend now" yok; Mia: "See you!" Final: "Kendini tanıttın ve sevdiğini söyledin." Hatıra: pul şekeri. Yazı girişi/kişisel bilgi YOK.
8. uretim "Zip'i Tanıt" — Zip (she, senin karakterin). K1 "This is my character. Her name is Zip." | K2 "Zip is ___." | K3 (2 seçim) funny / fast / kind ; "She has a ___" cape / map / robot cat | K4 Zip sahneye çıkar, seçilenle görünür | K5 "Hello! I am Zip!" Final: "Karakterini İngilizce tanıttın." Hatıra: Zip çıkartması (+ "Hayal Kur'a götür" `drop` CTA).
Çatışma notu: pedagog §7 "ödül değil, kilit yok" -> hatıra şekeri çaba kriterli ve kaynağı bilinen; kilit yok; bu çözüm pedagog §9 ile uyumlu, ayrıca pedagoga sunulur.

## C) Ders oturumu wow (LessonPlayer akışı)
Genel: her wow atlanabilir (dokun = geç), odak yönetimi korunur (`heading` focus), ses `playSound`, reduced-motion = aynı bilgi, anında kart (süre 0, yalnız fade 100ms yok). Dozaj pedagog: büyük kutlama yalnız 2 yerde (ders açılışı mühürü yok, büyük = sınav bitişi + ders sonu); küçük sık.
| # | an | tetik | süre | doz / sınır |
|---|---|---|---|---|
| C1 | Ders açılış sahnesi "Kavanoz Açılıyor" | oturum yeni başlar (resume'da yok) | 2400ms, dokun-geç | ders başına 1; 5. dersten sonra 1200ms kısa sürüm |
| C2 | Bölüm intro kartı | her bölüm değişince | 1200ms, otomatik kapanır, dokun-geç | resume'da yok; 3. dersten sonra 700ms |
| C3 | Bölüm geçişi "Şeker uçuşu" | bölüm `complete` | 600ms uçuş + 340 glow + 340 içerik geçişi | her bölüm; ses `muhur` + `whoosh` |
| C4 | Piko tepkileri (mood) | soru/hikâye olayları | 300-700ms | 4 sn'de en çok 1 tepki; 3 doğrunun 1'inde |
| C5 | Bölüm sonu mini kutlama | bölüm bitişi (C3 ile birlikte) | 900ms | küçük; `kutlama-kucuk` |
| C6 | Mühür Töreni (büyük) | sınav (assessment) bitişi | 2400ms | derste 1 kez; `kutlama-buyuk` |
| C7 | Ders sonu "Kavanozun Doldu" | `done` | sürekli ekran, doğal bitiş | auto-sonraki YOK |
- C1: Kavanoz silüeti ortada, kapak açılır (340), Piko yandan süzülerek girer, ders başlığı `type-hero` kelime kelime belirir; paketin 3 hedefi (`objectives`) 3 şeker olarak kavanoza düşer ("Bugün: he/she/it ile konuşacaksın"); `wrapper` CTA "Başlayalım". Tema `data-unit` renkleri; ambient tek.
- C2: alttan çıkan kart (`--ease-sheet`): mühür ikonu + "Bölüm 3/6 · Kelimeler" + tek cümle hedef + Piko mini satırı (bölüm başına 3 varyant, dönüşümlü; argo/ alay yok, espri <= 2/ders). `SectionStepper` düğümü o an nabız (1 döngü).
- C3: biten bölümün düğümünden 1 şeker yay çizerek `JarProgress` kavanozuna uçar (transform+opacity, 600ms), kavanoz 340ms parlar, stepper düğümü balmumu mührü olarak damgalanır (420ms). Sonra içerik: eski 200ms çıkar, yeni 340ms +12px alttan gelir.
- C4 Piko `mood`: `idle` (süzülme), `think` (soru 8 sn açık: kafa yana), `cheer` (doğru: kanat 600ms), `oops-soft` (yanlış: kafa eğik 300ms, sallanma YOK, "Yaklaştın!"), `wow` (5'li seri: gözler yıldız 700ms), `sleepy` (mola), `point` (ipucu: kafa hedefe döner). `LuguMascot`a `mood` prop (yoksa eklenir). Hikâye bölümünde karakter konuşurken balon rengi karakter anahtarıyla, giriş 200ms soldan/sağdan; seçim sonucu sahne 340ms geçişle değişir.
- C5: bölüm kartı mühürlenir, 4 şeker saçılır, satır "3 yeni kelime öğrendin" (yanlış sayısı YOK), `drop` CTA "Sıradaki: {bölüm}". 15 dk üstünde "mola" kartı (mevcut).
- C6: devasa mühür kavanoz kapağına basılır (900ms), kapak kapanır, kavanoz içindeki şeker sayısı sayarak dolar (new words), yıldızlar 3'e kadar sırayla; tek flaş yok.
- C7 ders sonu: üstte dolu kavanoz (yeni kelime etiketleri şeker olarak, dokununca kelime + ses); `type-display` 3 metrik: yeni kelime, en iyi seri, "geçen derse göre" (>= 3 oturum yoksa "ilk dersin"); "Artık şunu diyebilirsin:" hedeften 1 cümle (örn. "Is he hungry?") + `SpeakButton`; hatıra çıkartması (karakter, ör. Sasha dedektif) kavanoza yapışır; Piko kartı; CTA `wrapper` "Haritaya dön", `drop` "Dersi tekrar et", `drop` "Bir hikâye oyna" (rafa; kilit/zorunluluk yok). Mevcut `CompletionCelebration` bu ekranın yerine geçer.
- Veto kontrol: zaman baskısı yok, kırmızı yok, auto-sonraki yok, çıkış (X) hep görünür, bildirim yok, ses tek tuşla kapanır, her wow atlanabilir.

## D) Ana sayfa + harita: 3 hızlı wow
1. "Bugünkü kavanoz" hero: ders kartı kavanoz silüeti; sayfa açılışında kapak 1 kez aralanır, içinden ders başlığı şekeri parlar; `wrapper` "Derse başla" nefes alır (A2). Basınca kapak kalkar, C1'e geçiş (zemin crossfade 420ms). Şeker Cebi 3 sayı `type-display` ilk girişte 600ms sayar (oturum başına 1).
2. Piko Rehber + hikâye ipucu: sağ altta Piko konum alır, 8 sn boşta kafa çevirir; dokununca günün önerisi (ders ya da "Yeni hikâye: Uzay" -> `/ilham`). Günde 1 öneri, kapatılabilir.
3. Harita Karamel Yolu: yeni düğüm açılınca karamel 340ms akar, düğüm balmumu mührünü kırarak açılır, Piko bir kez zıplar (yalnız yeni açılışta). Bitmiş düğümler küçük mühür taşır; ünite başlığı tente şeridi (bible). Ağır parallax YOK.

## E) Uygulama sırası ve dosya eşlemesi (fe)
1. CandyButton (taban; her şey kullanır): `src/design/components/CandyButton.vue`, `src/design/components/CandyTwist.vue` (SVG sembol), `src/design/index.ts` export, `src/assets/main.css` (`@layer components`: `.candy`, `.candy-burst`, keyframe `lugu-squash`, `lugu-breathe`), `src/design/DesignGallery.vue` (3 varyant x durumlar). Sonra çağrılar: `HomeView.vue`, `LessonPlayer.vue`, `play/RunResults.vue`, `StampQuiz.vue` (Kontrol et), login.
2. Ders oturumu: `lesson/components/LessonIntro.vue` (C1), `SectionIntroCard.vue` (C2), `lesson/useSectionFlow.ts` (tetik/doz/atla; `localStorage` `lugu.wow.seen`), `design/components/JarProgress.vue` (şeker uçuşu C3), `SectionStepper.vue` (mühür damgası), `LuguMascot.vue` (`mood`), `CompletionCelebration.vue` -> `lesson/components/LessonFinale.vue` (C6-C7), `sections/StorySection.vue` (karakter girişi), `AssessmentSection.vue` (C6 tetik), `LessonPlayer.vue` (bağlama).
3. Hikâye Rafı: `inspire/storyTypes.ts`, `inspire/stories.ts` (8 hikâye, B4), `inspire/useStories.ts` (ilerleme, localStorage, hatıra), `inspire/StoryPlayer.vue`, `inspire/StoryShelf.vue`, `InspireView.vue` yeniden yazılır, `worlds.ts` sadeleşir, `AchievementsView.vue` (hatıra rafı + "Hikâye Koleksiyoncusu" rozeti).
4. Ana sayfa/harita: `HomeView.vue` (D1, D2), `MapView.vue` + `MapNodeButton.vue` + `LearningMap.vue` (D3).
5. Son: ses seti kontrolü (`sound.ts` yeni ad gerekmez), reduced-motion ve 375/820/1440 ekran görüntüleri, `checkStyling` her ünite, pedagog son incelemesi (B2 + C dozları).
Not: kod tarafında test yazılmaz (proje kuralı); doğrulama = elle akış + galeri + gerçek ders paketi (`school-life-package`) üzerinde C1-C7 gözle kontrol.
