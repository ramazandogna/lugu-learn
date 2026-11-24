# LUGU PLAY — Tasarım Kitabı

Durum: bağlayıcı. Uygulayıcılar (`fe-1`, `fe-2`) bu kitaba uyar; sapma lider onayı ister.
Kaynaklar: `.team/play/{pedagog,sanatci,cilgin,ui-audit,kesif}.md`. Çatışmada sıra: pedagog vetosu > bu kitap > sanatçı > cilgin.
Metafor: **Kavanoz Kütüphanesi** (Piko baykuş kütüphaneci; kelime = sarılı şeker; ünite = kavanoz; doğru = balmumu mühür; para birimi = şeker).
Şart 1: kavanoz bir ROZET silüetidir (ders kartı, ilerleme, koleksiyon, kelime kartı arkası). Ekranlar sade yüzey kalır. Şart 2: şeker rengi dekordur; metin zemini yalnız `--color-canvas/surface`.
Kural 0 (Değişmez): reduced-motion sakinleştirir, ses kısık + tek tuşla kapanır, renk tek başına anlam taşımaz (ikon+metin), dokunma hedefi >= 44px, flaş <= 3 Hz, AI düğmeleri "Yakında".

## A. Ölçek (tek, tüm ekranlar)

Token adları kit rolleriyle aynı kalır; eksikler eklenir. Öğrenci değeri / admin değeri. Admin, `<AdminShell>` kökünde `.admin` sınıfıyla (veya `data-area="admin"`) üstüne yazar.

### A1. Radius (kural: dış = iç + ~padding/2; eğriler çakışmaz)
| token | öğrenci | admin | kullanım |
|---|---|---|---|
| `--radius-cell` | 4 | 4 | tablo hücresi, kbd |
| `--radius-control` | 12 | 8 | buton (lg dahil), input, select, textarea, parola, seçenek, çip, nav öğesi. HEPSİ AYNI. |
| `--radius-tile` (yeni) | 16 | 10 | kart içindeki yüzey (OrderBoard alanı, ipucu kutusu, iç kart) |
| `--radius-card` | 24 | 14 | sayfa kartı, balon, diyalog |
| `--radius-shell` | 32 | 20 | tam ekran sahne, sheet, ders paneli |
| `rounded-full` | | | rozet, XP, taş düğüm, avatar |
Kural: yüzey >= 80x80 -> card/tile; etkileşim kontrolü -> control; hap -> full. Kit bileşenleri (BaseButton/BaseInput/PasswordInput/BaseSelect) `--radius-card` yerine `--radius-control` kullanacak: `main.css`'te `@layer components` içinde override (kit'e rol istemek ikinci yol; override önce).

### A2. Boşluk (4px taban)
`--space-1..12 = 4, 8, 12, 16, 24, 32, 48` (Tailwind `1,2,3,4,6,8,12`). `5` (20px) ve `10` yasak.
Kart padding `p-4` mobil / `p-6` >= sm. Kart içi `gap-4`; ilişkili çift `gap-2`; bölümler `gap-6`; sayfa kenarı `px-4 md:px-6`; form alanları `gap-4`, etiket-alan `gap-1.5`. Dokunma `min-h-11`.
Alt boşluk: `pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))]`. Yeni: `--header-h:64px`, `--tabbar-h:72px`, `--glass:color-mix(in oklab,var(--color-canvas) 88%,transparent)`.

### A3. Tipografi
Yardımcılar `type-*` (`main.css` `@utility`); `text-xs/sm/base/lg/xl/2xl...` doğrudan YASAK (grep ile zorlanır).
| token | boyut/ağırlık/lh | font | kullanım |
|---|---|---|---|
| `type-display` (yeni) | 48 / 600 / 1.1 tabular | Fredoka | sayaç, büyük sayı, skor |
| `type-hero` | clamp 28->40 | Fredoka | karşılama, ünite başlığı |
| `type-title` | clamp 22->28 | Fredoka | sayfa/kart başlığı |
| `type-section` | 20 | Fredoka | bölüm başlığı |
| `type-task` | 18 / 700 / 1.4 | Nunito | soru metni, ders anahtar cümlesi |
| `type-body` (yeni) | **16** / 400 / 1.55 | Nunito | öğrenci gövdesi (asgari; ders metni `type-task` 18) |
| `type-small` (yeni) | 14 | Nunito | yalnız meta/yardımcı; asla tek başına talimat |
| `type-eyebrow` | 12 / 800, .08em | Nunito | üst etiket; `lang="tr"`, `text-transform` yerine `capitalize` (İ/I) |
| `type-code` (yeni) | 14 mono | | kod/kimlik |
Admin: gövde 14, başlıklar Nunito. Cümle <= 12 kelime, satır <= 60 karakter, öğrenci metninde `text-wrap: pretty`. Okuma güçlüğü anahtarı: `data-readable="on"` -> `font-family: system-ui` + lh 1.7 (ayar tuşu, bölüm F ilerleme/ayarlar).

### A4. Gölge (sıcak `--shadow-color:#4a3412`; `.dark` #000)
| token | değer | kullanım |
|---|---|---|
| `--shadow-field` (yeni) | `inset 0 1px 2px color-mix(ink 8%)` | input, select, textarea |
| `--shadow-press` (= eski `--shadow-control`) | `0 3px 0 ink/16%`; basılı `--shadow-press-down: 0 1px 0` | YALNIZ basılabilir: buton, çip. Input'ta yok. |
| `--shadow-card` | kit | pasif kart |
| `--shadow-raised` | kit | hover/basış kart, balon, sticky çubuk |
| `--shadow-overlay` | kit | diyalog, popover, toast |
| `--lip-sm:3px`, `--lip-lg:5px` | | düğüm taşı = lg, buton = sm |
`--node-size: 4.5rem`.

### A5. Hareket
| token | ms | easing | kullanım |
|---|---|---|---|
| `--duration-fast` | 150 | `--ease-standard` | hover, renk, basış |
| `--duration-base` | 200 | standard | durum değişimi, çip |
| `--duration-slow` | 340 | `--ease-sheet` | panel, kart flip, yol dolması |
| `--duration-slower` | 420 | sheet | sahne geçişi, mühür |
| `--duration-celebrate` | 900 | `--ease-pop` | kutlama, nabız |
| `--duration-idle` | 3600 | ease-in-out | boşta süzülme |
| `--stagger` | 60 | | kelime kelime belirme (<= 12 kelime) |
`--ease-standard: cubic-bezier(.2,0,0,1)`, `--ease-sheet: cubic-bezier(.32,.72,0,1)`, `--ease-pop: cubic-bezier(.34,1.56,.64,1)`. `--press-scale: .97` (her yerde tek değer). Reduced-motion: tüm süreler 0 (celebrate + idle + 3 yeni `animate-*` dahil), nabız/süzülme kapalı, vurgu sabit.

### A6. İkon, z-index, kırılım
- İkon: `--icon-sm/md/lg/xl = 16/20/24/32`; stroke 2 (aktif 2.4). 14/18/28/34/36/44 kalkar.
- z-index: `--z-base 0, --z-raised 10, --z-header 20, --z-tabbar 30, --z-popover 40, --z-overlay 50 (diyalog/sheet), --z-vignette 55 (lav, pointer-events:none), --z-toast 60`. Sihirli `z-[..]` yasak.
- Kırılım: öğrenci `md` (768) = tab bar -> üst nav; admin `lg` (1024) = drawer -> sidebar; içerik `sm` yalnız 2 kolon. Test genişlikleri 375 / 820 / 1440.

### A7. `main.css`'e ekleme yolu
1. `@theme` içinde: `--radius-control: 12px; --radius-tile: 16px; --radius-card: 24px;` (admin: aşağıdaki blok) + `--ease-*`, `--duration-fast/base/slow/slower`, `--space-*`, `--z-*`, `--icon-*`, `--shadow-field/press/press-down`, `--lip-*`, `--stagger`.
2. `@theme` bloğunu bozma; yeni `:root` bloğunda `--press-scale:.97`, `--header-h`, `--tabbar-h`, `--glass`.
3. `[data-area="admin"] { --radius-control:8px; --radius-tile:10px; --radius-card:14px; --radius-shell:20px; --color-canvas:#F6F7F9; --color-surface:#fff; --color-ink:#1B2430; --color-primary:#2F6FEB; --color-on-primary:#fff; }` (mavi beyaz üstü 4.57; grafit/F6F7F9 14.6).
4. `@utility type-*`, `surface-interactive`, `focus-ring`, `btn-press` (bölüm C) `@layer components` içinde.
5. Reduced-motion bloğunu genişlet: `:root{--duration-celebrate:0ms;--duration-idle:0ms;--duration-slow:0ms}` + `[class*="animate-"]{animation:none}`.
6. Yeni semantik renkler (her iki modda): `--color-warning-ink:#8A5A00` (beyaz 5.93), `--color-accent-ink:#B24A22` (beyaz 5.39), `--color-field-edge:#8E84A3` (beyaz 3.51; `.dark` için #8F86AA kullanılır, 3:1 doğrulanır), `--color-retry-wash` = `--color-wash`.

## B. Tema sistemi

### B1. Rol ayrımı (AA zorunlu)
Her tema 3 primary rolü + zemin rolleri taşır; metin zemini yalnız `--bg/--surface`.
- `--primary-fill`: dolgu/dekor (üstüne yalnız `--on-primary`).
- `--primary-ink`: metin/ikon/kenar; `--bg` üstünde >= 4.5:1.
- `--on-primary`: dolgu üstü metin; >= 4.5:1.
- `--accent`, `--extra1`, `--extra2`: yalnız dolgu/dekor; ÜSTÜNE METİN KOYULMAZ.
Eşleme: `--color-primary` := `--primary-ink` (metin/kenar kullanımları), `--color-primary-fill` yeni; BaseButton primary dolgusu `--primary-fill`, metni `--on-primary`. Durum renkleri (success/danger/warning/info/retry) üniteden bağımsız, temalanmaz.

### B2. Token setleri (hex; oranlar hesaplandı, uygulayıcı `checkStyling` ile bir kez daha doğrular)
| token | Temel (kit varsayılan) | Ü1 "Sabah Şekeri" | Ü2 "Gece Fırını" | Ü3 "Neon Şeker Sokağı" |
|---|---|---|---|---|
| `--bg` (canvas) | #FDF7EE | #FFF1F5 | #1F1830 | #E4F4FF |
| `--surface` | #FFFFFF | #FFFFFF | #2E2445 | #FFFFFF |
| `--ink` | #251D3A | #4A1D35 | #FFF3E0 | #12344D |
| `--primary-fill` | #43399E | #B8326A | #FFB347 | #177A86 |
| `--primary-ink` | #43399E | #B8326A | #FFB347 | #136E79 |
| `--on-primary` | #FFFFFF | #FFFFFF | #1F1830 | #FFFFFF |
| `--accent` (dekor) | #F08159 | #FFB3CF | #F7D9A8 | #FF8FB1 |
| `--extra1` | #F6B92B | #FFE27A | #6B3F2A | #FFD93D |
| `--extra2` | #EFEBFB (wash) | #BFEBDD | #C9B8FF | #7A6CFF |
| `--wash` | #EFEBFB | #FFE3EC | #3A2E58 | #CDEBFA |
| doku (%6-8, metin altında yok) | yok | pudra noktası + soluk dişli | un tozu + ahşap damar | tente şerit + asfalt parıltısı |
| ambient (tek) | Piko süzülme | dönen dişli | yükselen buhar | tramvay (60 sn) |
AA notu: Ü1 ink/bg 12.6, primary-ink/bg 5.17, beyaz/fill 5.67; vurgu çizgisi #E8508A yalnız dekor (3.2). Ü2 ink/bg 15.6, ink/surface 13.2, primary/bg 9.57, on-primary/fill 9.57; accent üstüne metin YOK. Ü3 ink/bg 11.5, primary-ink/bg 5.29, beyaz/fill 5.04; #2BB3C0 yalnız dekor. Temel: ink/canvas 15.0. `--wash` oranları metin taşımadığı için serbest; wash üstüne metin gelirse `--ink`.
`.dark` ekseni ayrı: ünite teması `data-unit`, `.dark` bağımsız. Ü2 zaten koyu; kullanıcı `.dark` seçmişse Ü2 değişmez (ek token yok). Ü1/Ü3 + `.dark`: temel `.dark` zeminleri kullanılır, yalnız `--primary-*` ünite rengine açık varyantla (Ü1 #FF8FBA, Ü3 #5FD0DC; oran >= 4.5 doğrula).
Ünite teması yalnız renk + doku + ambient; radius/boşluk/tipografi DEĞİŞMEZ.

### B3. Seçim mekanizması
- Veri: `LessonPackage.meta.themeId: 'base'|'u1-morning'|'u2-night-oven'|'u3-neon-street'` (opsiyonel; yoksa `meta.theme` serbest metninden DEĞİL, `base`). Ünite satırında `unit.theme_id` (varsa) paket temasını geçersiz kılar.
- Uygulama: `<StudentShell>` ve ders oynatıcı kökü `data-unit="<id>"` yazar (`unitThemeAttrs(themeId)` yardımcısı `src/design/unitThemes.ts`). CSS: `[data-unit="u1-morning"]{--color-canvas:#FFF1F5; ...}` (B2 tablosu birebir) `main.css`'te `@layer theme`.
- Karakter teması `[data-character]` renk rollerini ezmeye devam eder; öncelik: ünite teması > karakter teması yalnız `--char-*` rozetleri için (ünite zeminini karakter bozmaz). Uygulayıcı çakışmayı `characterThemeStyle` çıktısından `--color-primary*` kaldırarak çözer.
- Harita ve ana sayfa ünite başlığı kendi `data-unit` alt ağacıdır; ekranlar arası geçişte `--duration-slower` ile zemin crossfade.
- Admin ekranları `data-unit` almaz.

## C. Bileşen kuralları

Genel: basış anı `:active` + `pointerdown` (hover masaüstü bonus). Odak tek dil: `focus-ring` = `outline 2px var(--primary-ink); offset 2px`. Seçili durumda kenar kalınlığı sabit (2px, rengi değişir; layout shift yok). Ekranda boşta nefes YALNIZ Piko'da.

### C1. Buton
- 4 varyant: `primary | secondary | quiet | danger` (`ghost` kalkar = quiet; `link` metin içi bağlantıdır). Ekran başına 1 primary. İptal = quiet, Geri = secondary.
- Boyut: öğrenci `md` (h-11) / `lg` (h-14, YALNIZ ekranın ana CTA'sı). Admin: sabit `md` h-10; `sm` yalnız tablo içi; `xs` kalkar. Yarıçap tüm boyutlarda `--radius-control`.
- Durumlar (Jöle Düğme, skew YOK):
  - boşta: sabit (nefes yok), `--shadow-press`.
  - hover/pointerdown: `scale(--press-scale)`, lip 3->1px, `--duration-fast`; bırakınca `--ease-pop` ~180 ms yaylanma.
  - başarı (yalnız primary, 1 kez): 4 şeker damlası 600 ms + `pop` sesi; ekran başına en çok 1 büyük hareket.
  - devre dışı: `opacity .5`, `aria-disabled`, "Yakında" rozetli AI düğmeleri tıklanamaz + odaklanır, `title`/`aria-label` "Yakında".
  - yükleniyor: metin kalır, spinner 20px, `aria-busy`.
- A11y: `<button>` gerçek eleman; ikonlu butonda `aria-label`; hedef >= 44.

### C2. Input (Jelibon Alan)
Opak `--surface`, kenar `--color-field-edge` 1.5px (3:1), `--shadow-field`, `--radius-control`, h-11 (lg form h-12). Odak: `focus-ring` + kenar `--primary-ink`. Hata: kenar `--color-warning-ink`, alanın ALTINDA ikon (TriangleAlert) + metin, `aria-describedby` + `aria-invalid`; kart 150 ms x2 yatay sallanma (reduced-motion: yok). Etiket her zaman görünür (placeholder etiket yerine geçmez). Parola göz ikonu = Piko gözü (dekor, `aria-label` "Parolayı göster").

### C3. Kart
- `surface` (pasif): `--radius-card`, `--shadow-card`, hair kenar.
- `surface-interactive` (tıklanabilir): hover/pointerdown `translateY(-2px)` + `--shadow-raised`; active `scale(--press-scale)`; `focus-ring`. `<RouterLink>`/`<button>`, pasif kartla görsel ayrım ZORUNLU.
- Kavanoz Raf Kartı: YALNIZ ders/ünite kartı (ana sayfa + harita): kavanoz silüeti rozet (tek SVG `<symbol id="jar">`), pointerdown'da 4px kalkma. Boşta sallanma yok.
- Kart içi: yüzey = tile, kontrol = control. Kart içi kart yasak (tile kullan).

### C4. Seçenek (Balmumu Mühür) `AnswerOption`
- Native radio `sr-only` (klavye/okuyucu için kalır; `role=radiogroup`). Görünür: control/tile boyutu kart, min-h-14, 1 sütun mobil.
- Durumlar: boşta (surface+field-edge) / hover-pointerdown (`scale .97`) / seçili (kenar `--primary-ink` 2px + dolgu wash) / mühürlendi (cevap sonrası, aşağıda) / diğer (soluk, disabled).
- Mühür: tek dokunuşla 420 ms `--ease-sheet`, mühür daire `scale .6 -> 1` + hafif dönüş; basılı tut YOK.
- Doğru: bal-yeşil zemin + `Check` ikon + metin "Doğru"; çocuğun seçtiği yanlış: `--color-retry-wash` + `RotateCcw` + üstünde küçük "senin seçimin" (kırmızı DEĞİL, sallanma YOK, 300 ms solma); doğru şık AYNI ANDA yumuşak mühürlenir. Yanlışın altında 1 satır neden ("she + is, çünkü tek kişi"). Dil: "Yaklaştın!", "İlginç seçim, bak:". Yasak: "yanlış", "hata yaptın", "yine mi?".
- Ses: doğru `dogru`, yanlış `yanlis-yumusak` (bölüm E). `aria-live="polite"` sonuç metni.

### C5. İlerleme (Şeker Zinciri)
Boncuk dizisi, <= 12 boncuk (fazlası çubuk + sayı). Dolu = dolgu + kontur, boş = yalnız kontur (renk tek başına değil). Yeni dolan boncuk `--ease-pop` 200 ms. Etiket görünür metin ("Bölüm 3/7"); `role=progressbar` + `aria-valuenow`. Yol/harita: Karamel Yol dolması `--duration-slow`. Mastery: yüzde değil "7 adımın 4'ü".

### C6. Streak (iki AYRI mekanik)
- Günlük (Şeker Zinciri halka): ana sayfa 3 cepten biri; gün = 04:00-04:00; günde 1 sayım (en az 5 soru, 2-3 dk); dondurma otomatik (haftada 2, birikim <= 3) = buzlu şeker kabuğu + "Piko zinciri dondurdu"; kırılınca CEZA YOK: "Geri geldin! Rekorun duruyor (en uzun: 12)"; ilk oyunda x2 şeker + "Geri Dönüş" rozeti (ayda 1). Kilometre taşı 7/14/30. Kırmızı, kırık kalp, geri sayım YOK.
- Test-içi (Karamel Akışı): damla sayacı + çarpan rozeti (5 doğru x2, 10 doğru x3; tavan x3). Yanlışta SIFIRLANMAZ: yarıya iner veya kalkan (testte 1, 5 doğruda yenilenir). Kırılma "pof" < 600 ms, sarsıntı yok. Bitişte "en iyi seri" vurgulanır. Alev/ısı metaforu YOK. Streak ikonu LUGU ikonu (yeşil değil).

### C7. Boş / yükleniyor
Tam sayfa: `EmptyScene`/`LoadingScene` (Piko'lu; `LoadState`'e `scene` prop). Liste/kart: skeleton veya kit `EmptyState`. Admin: yalnız skeleton/EmptyState (mascot yok). Boş durumda bir sonraki eylem düğmesi zorunlu. Ton sözlüğü: `danger | success | warning | info` (`error` ve `alert` kalkar). Skeleton hareketi reduced-motion'da sabit.

### C8. İpucu balonu (`CharacterBubble` sade)
`surface` + sol kenarda karakter rengi şerit (accent 2px kenar kalkar), `--radius-card`, kuyruk `--bubble-edge` değişkeninden. İpucu kademeleri: (1) soru gelince yok, (2) 8 sn sonra "bana tıkla" belirir, (3) tıklayınca ince ipucu (cevap vermez), (4) 2. tıkta büyük ipucu (şık 4 -> 2). Hak: ders 3, test/mühür 1-2. Puan cezası yok; ipucusuz çözene küçük ekstra yıldız. Metin <= 2 cümle, kapatılabilir, `role=status`.

### C9. "Bana tıkla" işareti (Parlayan Şeker)
Ekranda aynı anda <= 1. Nabız 1.2 sn periyot, 3 döngü sonra durur, sönük "hâlâ buradayım" kalır. Aynı işaret aynı gün 2. kez gösterilmez; bilinen yerde kapalı. Hedef >= 48px, `<button aria-label="İpucu aç">`. Reduced-motion: nabız yok, statik parlak halka + ikon. Renk tek başına değil: ikon (Sparkles) + "bana tıkla" etiketi.

### C10. Metin (düz paragraf yok)
Anahtar cümle `type-task`/`type-hero`; kelime kelime belirir (`--stagger` 60 ms, <= 12 kelime); anahtar kelime renk + ağırlık + altı çizgi (sallanma yok, tek vurgu). Ders başına <= 2 espri; espri cevabı vermez. Her İngilizce metne sesli okuma (yavaş/normal). Reduced-motion: kelimeler hemen görünür.

## D. Ambient hareket

| nesne | nerede | sınır |
|---|---|---|
| Piko süzülme (`--animate-bob`, 3.6 sn) | köşe, giriş, ana sayfa | ekranda tek idle nefes; 8 sn boşta kafa çevirme |
| ünite ambienti (B2 tablosu) | ünite zemini | ünite başına TEK; opaklık 6-8%, metin altında yok; tramvay/buhar >= 18 sn döngü; vitrin ışığı 0.3 Hz yumuşak |
| süzülen şekerler | giriş, ana sayfa boş alan | <= 5 öğe, imleç/parmağa çekim YOK |
| bana tıkla işareti | C9 | aynı anda 1 |
Ekran başına: 1 büyük hareket (hero/kutlama/mühür) + en çok 2 küçük; idle sayılmaz ama Piko dışında idle nefes yok. Animasyonlar `transform/opacity`, `will-change` yalnız aktifken; sekme gizliyse (`visibilitychange`) durur. Reduced-motion: ambient durur (ilk kare sabit), kutlama 0 ms, nabız yerine sabit vurgu; ses ayarı ayrı eksen. Zamanlı oyunda (lav) ambient kapalı.

## E. Ses (Web Audio, lisanslı dosya yok)

`src/play/audio/engine.ts`: tek `AudioContext`, ilk kullanıcı dokunuşunda `resume()`; `masterGain 0.5` -> `destination`; kanallar `sfx`, `music`, `voice` ayrı GainNode (varsayılan sfx 1, music 0, voice 1). Her ses <= 1 sn, `gain.setValueAtTime(g,t); exponentialRampToValueAtTime(0.0001,t+dur)` ile bitir (tıklama/pop önlenir), osc `stop(t+dur+0.02)`. Mute: ayarlar + her oyun başlığında tek tuş (`Volume2/VolumeX`, `aria-pressed`); durum `localStorage` (try/catch). `prefers-reduced-motion` sesi kapatmaz. Ses tek başına bilgi taşımaz.
| ad | dalga | frekans | süre | gain | not |
|---|---|---|---|---|---|
| `tik` (oturma) | square->sine | 880->440 | 60 ms | .15 | hızlı decay |
| `muhur` | sine + noise | 140->70 + lowpass 1200 gürültü | 120+40 ms | .2 | thump |
| `dogru` | triangle arpej | 523,659,784 | 3x70 ms | .12 | |
| `yanlis-yumusak` | sine | 330->262 | 200 ms | .10 | lowpass 900, melodik "boop" |
| `pop` (şeker/başarı) | sine sweep | 600->1200 | 80 ms | .15 | |
| `whoosh` | bandpass noise | 400->2000 | 200 ms | .10 | geçiş |
| `kutlama-kucuk` | triangle pentatonik | C5 D5 E5 G5 A5 | 5x60 ms | .12 | sık |
| `kutlama-buyuk` | sine+triangle | C5 E5 G5 C6 + HP 6 kHz 80 ms | 600 ms | .12 | NADİR (ünite/rozet) |
| `seri-pof` | sine | 300->150 | 120 ms | .08 | lowpass 600 |
| `piko` | sine + 6 Hz vibrato | 392->330 | 180 ms | .10 | |
| `lav-tik` | square | 220 | 30 ms | .05 | OPSİYONEL, varsayılan KAPALI, saniyede 1 |
| `hover-basis` | sine | 1000 | 20 ms | .06 | varsayılan KAPALI (mobil basış gürültüsü) |
Titreşim varsayılan kapalı, açıkken <= 50 ms. Seçenek ikisi: `sfx`, `tick` ayarları.

## F. Ekran ekran yön

Her ekran: tek odak, ekran başına 1 primary, `type-body` >= 16.
1. **Giriş**: tek odaklı. Piko balonu kartın üst kenarına yapışık; form kartı `surface-raised`, "Mühürlü Mektup" yalnız klape: gönderince klape kapanır + mühür 340 ms, sonra geçiş. Input'lar C2, primary lg, hata alt satır ikon+metin, kart sallanma 150 ms x2. Dipnot kartın içinde. Balon/kart/dipnot tek hiyerarşi (ui-audit 8).
2. **Öğrenci ana sayfa**: "bugünkü kavanoz" tek büyük Raf Kartı (tek CTA lg); eyebrow tek satır "Program · Ders 3"; ilerleme çubuğu görünür etiketli; "Haritamı aç" kart dışında. Şeker Cebi = 3 metrik (günlük zincir, yeni kelime, en iyi seri), `type-display` sayı, tıklanabilir cepler `surface-interactive`. Piko Rehber tek tuş. "İngilizce ile neler yapabilirsin?" girişi ana sayfadan. AI düğmeleri "Yakında".
3. **Harita**: Karamel Yol dikey, ünite başlığı tente şeridi; mevcut düğüm büyük + nabız halka (3 döngü); tamamlananlar arası yol 340 ms dolar; Piko yalnız yeni düğüm açılınca zıplar. Kilitli düğüm: sarsıntı yok, "Önce önceki dersi bitir" ipucu. Düğüm `--node-size`, lip lg.
4. **Ders oynatıcı**: üstte sabit Şeker Zinciri "Bölüm n/7"; sabit alt eylem çubuğu safe-area'lı; bölüm = şablon (patterns.md); doğal bitiş noktası (otomatik sonraki oyun yok); 15 dk'da nazik mola kartı, kapatılabilir; ses ve duraklat tuşu her an görünür.
5. **Test sonu / kıyas** (Kavanoz Sonucu): isabet sayısı `type-display`; kavanoz dolumu; mastery "adım"; "en iyi seri"; önceki denemeyle kıyas: son 5 deneme çubuk (yalnız kendi geçmişi), en çok karışan kelimeler "birlikte oynayalım" çerçevesiyle, hız. Yanlış sayısı skor olarak yok; "yeni öğrenilen" var. Tek "sonraki küçük adım" butonu. Kırmızı düşüş yok.
6. **İlerleme sayfası**: ana ekranda <= 3 metrik; "geçen haftaki sen" iki kavanoz (veri >= 3 oturum, yoksa "ilk haftan, çizgi yeni başlıyor"); rozetler (<= 40 toplam, ünite başına 6-8, net kriter); seviye (<= 20); çizgi grafik yalnız "Detay" sekmesi, son 5 deneme; düşüş çerçevesi ileriye ("Bu hafta zor kelimeler çıktı, birlikte oynayalım").
7. **Hayal kur** (Şeker Dükkânı Kur): kapalı çip havuzu, doğru/yanlış yok, skor yok, koleksiyon; sıra bozuksa Piko "olur!"; 5-8 dk; paylaşım opsiyonel (akran puanı yok).
8. **İlham ekranı** (Dünya Kavanozları): 8 kavanoz, aynı silüet, KİLİT YOK; dokununca 20-40 sn mini sahne; simülasyon, gerçek yabancı iletişimi yok; "senin seviyen" bağı.
9. **Admin** (ayrı, ciddi): `[data-area="admin"]` grafit/mavi (#1B2430 ink, #F6F7F9 zemin, #2F6FEB vurgu), şeker teması/Piko/ses yok. Sakin Tablo: satır h-11, sticky başlık, hover ince çizgi + sol şerit, zebra yok, durum rozeti ikon+metin; tablet'te kart listesi. Sakin Sayı Kartları: büyük tabular sayı + önceki dönemle fark (ok + metin) + 12 noktalı sparkline; düşen dersler vurgulu liste. Tek `md` buton. Komut çubuğu sonraki sürüm.

## G. ui-audit eşlemesi (P1/P2/P3 -> kural)
| # | öncelik | kapanış |
|---|---|---|
| 1 | P1 | A1 control 12 hepsi aynı + A7.1 kit override |
| 2 | P1 | A4 `--shadow-press` yalnız basılabilir, `--shadow-field` input |
| 3 | P1 | C4 `AnswerOption`, native radio sr-only |
| 4 | P1 | A7.6 `--color-warning-ink`; C4 yanlış = retry tonu + RotateCcw |
| 5 | P1 | A7.6 `--color-field-edge`; C2 |
| 6 | P1 | C3 `surface-interactive` + mobil `:active` |
| 7 | P2 | C genel: tek `focus-ring`, sabit 2px kenar |
| 8 | P2 | F.1 giriş tek hiyerarşi |
| 9 | P2 | C8 balon sade, `--bubble-edge` |
| 10 | P2 | A1 tile rolü, kart içi kart yasak (C3) |
| 11 | P2 | A1 kural + grep lint |
| 12 | P2 | C1 boyut kuralı (admin md h-10, xs kalkar) |
| 13 | P2 | C1 4 varyant |
| 14 | P2 | F.2 ana sayfa kartı |
| 15 | P2 | A3 `type-display/code`, sabit `text-*` yasak |
| 16 | P2 | A3 `type-body` 16, eyebrow `capitalize` |
| 17 | P2 | A7.6 `--color-accent-ink` |
| 18 | P3 | C5 dolu/boş şekil farkı |
| 19 | P3 | A4 `--lip-*`, `--node-size` |
| 20 | P3 | A6 ikon ölçeği |
| 21 | P3 | A5 easing/süre token |
| 22 | P3 | C7 boş/yükleniyor kuralı |
| 23 | P3 | C7 ton sözlüğü |
| 24 | P3 | A2 `--header-h/--tabbar-h/--glass` |
| 25 | P3 | A2 safe-area alt boşluk |
| 26 | P3 | C genel: çip durumları (`chip-placed` wash+ince kenar, `chip-pool` yüzey+lip), yerleşme `--ease-pop` 180 ms, ses `tik` |
| 27 | P3 | C1: çıplak `<button>` yasak, `BaseButton variant="row"` |
| 28 | P3 | A6 kırılım sözleşmesi |

## H. Lav kırmızısı (zamanlı oyun görsel kuralı; kararı lider kapattı)
- Kullanıcı isteği "1 sn'de ekran kıpkırmızı". Çözüm: kademe 10->1 boyunca radial vinyet alpha 0 -> 0.55 (doğrusal, 10 kademe), `radial-gradient(ellipse at center, transparent 55%, var(--danger-edge) 100%)`, merkez yarıçap 55% -> 45%. `--danger-edge: #C4423A`. Katman `fixed inset-0 pointer-events-none z-[var(--z-vignette)]`.
- Kademe 1 (son sn): ek olarak tüm ekrana kırmızı tint alpha ~0.35 + tek tur 1 Hz nabız (alpha .55->.40->.55, 900 ms `--duration-celebrate`), sonra sabit. Flaş yok (<= 1 Hz).
- Soru kartı opak `surface-raised` + metin `--ink`: okunur kalır. Zamanlayıcı rakamı + `Hourglass` + "2 sn kaldı" HER ZAMAN görünür (renk tek başına değil); Karamel Nehri yüksekliği ikinci gösterge.
- Kolay mod: kırmızı yok, yalnız ince ilerleme çubuğu; ödül farkı yok. Reduced-motion: kademeye göre SABİT vinyet, nabız yok. Süre dolunca "canavar yakaladı" yok: Piko kaçar, puan düşmez, kazanılan şeker kalır. Yalnız öğrenilmiş içerikte; yeni konu/ilk test asla zamanlı olmaz. Duraklat tuşu her an. Günde <= 3 tur, 4.'de mola kartı.
- Pedagog notu: tam dolgu pedagog vetosuyla çakıştı; "kıpkırmızı hissi" kenar vinyeti + tint ile sağlanır. Kullanıcıya raporda belirtilir.

## I. AT listesi (uygulanmaz)
Gökyüzü Adaları, Magnet Kavanoz, Alev Şeker, Kavanoz Kapağı, Sakız Düğme, Bal Canavarı, Kavanoza At, Jelibon Seç, Sarılı Şeker Kart, Tahta Etiket Kart, Şeker Kalem Girdisi, Kavanoz Kapısı, Piko Parmağı, Raf Çevirme, Piko Uçar, Eriyen Şeker, Kelime Tepsi, Damga Masası, Postacı Piko, Zincir Hikâye, Şeker Gezegenler, Piko Valizi, Harf Jeliboni, Yürüyen Piko, imlece çekilen şeker.
