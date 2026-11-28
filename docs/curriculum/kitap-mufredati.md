# Kitap Müfredatı — 4 Tema (6. sınıf, 11-12 yaş, A1-A2)

Kaynak: öğrencinin ders kitabındaki iki içindekiler sayfası (ünite başlıkları, dil bilgisi, proje türleri kitaptan; bazı kelimeler konuyu çalıştırmak için eklenmiş tamamlayıcı örnekler, aşağıda "kitap" / "ek" diye ayrıldı).

Durum:

| Ünite | Tema | Durum | Kod |
|---|---|---|---|
| 1 | School Life | **Yapıldı** — 6 ders | `scripts/content/book/u1-l*.ts` |
| 2 | Classroom Life | **Yapıldı** — 4 ders | `scripts/content/book/u2-l*.ts` |
| 3 | Personal Life | Planlandı (bu doküman) | — |
| 4 | Family Life | Planlandı (bu doküman) | — |

Yayın: `LUGU_ADMIN_PASSWORD=... pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/book.ts [--assign LUGU-XXXX]`
Doğrulama (ağ yok): `pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/book.ts --check`
Müfredat adı: **6. Sınıf İngilizce — Kitap Müfredatı**. Yayınlanmış bir sürüme yeni ders eklenemez: Ünite 3-4 yapıldığında yeni müfredat sürümü açılır (ders dosyaları `LESSON_FILES` listesine eklenir).

## Öğrenciye özel not

Öğrencinin unvanı: **2026-2027 Eğitim Öğretim Yılı Okul Sporları Mahalli Tenis Müsabakaları Küçük Kız İl Birincisi.**
Derslerde öğrenci "you" olarak geçer (adı, okulu, şehri yazılmaz). Unvana değinilen yerler:

| Ders | Yer | Nasıl |
|---|---|---|
| 1.1 | Tanışma | Ms Pearl sınıfa "Our tennis player!" diye tanıtır; öğrenci "I am a tennis player." cümlesini kurar |
| 1.4 | Günlük rutin | "You practise tennis after school." / "Dora always watches your matches." |
| 1.6 | **Büyük an** — 19 Mayıs / ödül töreni | Müdür sahnede unvanı okur; öğrenci kupa ile sahneye çıkar (present progressive); Türkçe unvan birebir |
| 2.3 | Sıra sayıları | "You are first in the province!" — 1st place, kupa, sıralama tablosu |
| 2.4 | Günlük (diary) | Maç günü günlüğü: "You are tired, aren't you? — Yes, but I'm happy!" |

## Karakterler ve sabit kadro (tüm dersler)

- Sınıf arkadaşları (Lugu karakterleri, öğrenciyle aynı yaşta): **Piko** (he, meraklı), **Leo** (he, sakin, resim sever), **Sasha** (she, düzenli, sınıf başkanı adayı), **Dora** (she, sporcu, tenis arkadaşı), **Momo** (she, komik, biraz sakar).
- Yetişkinler (kurgusal): **Ms Pearl** (İngilizce öğretmeni, sınıf öğretmeni), **Mrs Demir** (okul müdürü / principal), **Mr Aydın** (beden eğitimi öğretmeni, tenis antrenörü).
- Gerçekçi okul hayatı: Pazartesi bayrak töreni, ders programı, teneffüs, kantinde tost-simit, nöbetçi öğrenci, sınıf başkanı seçimi, kulüpler, kütüphane, fen laboratuvarı, spor salonu, okul bahçesi.

## Ders sırası ve dil bilgisi ilerlemesi

Kural: bir ders, yalnız kendi hedef dil bilgisini ve önceki derslerde öğretileni kullanır.

| # | Ders | Hedef dil bilgisi | Kelime (kitap / ek) | Kitap çıktısı | Tema |
|---|---|---|---|---|---|
| 1.1 | New Term, New Class | Personal pronouns + am/is/are; a / an / the | teacher, student, principal, term, leader, manager, listener / classmate, class president, English teacher, PE teacher, timetable | Kendini ve okulunu tanıtır; okul çalışanlarının görevleri | `u4-school-bell` |
| 1.2 | Class Rules | Imperatives: Open…, Don't…, Please… | permission, instruction, listener, leader / rule, raise your hand, line up, be quiet, be on time, student on duty, May I come in? (kalıp) | Okul kurallarını anlatır; talimatları anlar | `u4-school-bell` |
| 1.3 | School Tour | There is / There are (+ Is there…? / Are there…?); WH- questions (What, Where, When, Who, Why, How) — be ile | — / library, canteen, gym, science lab, art room, principal's office, nurse's room, school garden | Okul hakkında soru sorar/cevaplar; **kültür: farklı okul türleri** | `u4-school-bell` |
| 1.4 | My School Day | Present Simple (+ he/she/it -s, don't/doesn't, Do/Does…?); adverbs of frequency | listen, learn, study, read, write, speak, ask, answer / attend a class, do homework, take notes, have a break, have lunch, get up, practise | Günlük okul rutinlerini açıklar | `u4-school-bell` |
| 1.5 | Right Now at School | Present Progressive (+ - ?); object pronouns me/you/him/her/it/us/them | instruction / clap, draw, carry, help, explain, check, share, wait | Şu an yapılan aktiviteleri anlatır | `u4-school-bell` |
| 1.6 | Celebrations & Our School Post | National days; Ünite 1 karışık tekrar (simple + progressive, there is, WH, imperatives) | — / ceremony, celebrate, flag, national anthem, poem, costume, festival, certificate, trophy, champion, Republic Day, Children's Day, Youth and Sports Day, Teachers' Day | Millî günler; **yazma: school post**; **proje: okul rutinleri posteri** (imagine); yansıtma + değerlendirme | `u4-school-bell` |
| 2.1 | Study Habits | How often…? (every day, once / twice a week, three times a week); adverbs of manner (slowly, carefully, quietly, quickly, well) | habit, research, brush, rest / routine, exercise, practice, practise, revise, healthy | Ne sıklıkla yaptığını söyler; günlük çalışma rutinleri | `u1-morning` |
| 2.2 | A Busy Classroom | Present Simple vs Present Progressive (every day / now); possessive adjectives my…their | level, sort, learning / activity, experiment, project, group work, worksheet, homework | Alışkanlık ile şu anki eylemi ayırt eder; sınıf aktiviteleri | `u4-school-bell` |
| 2.3 | The Numbers Game | Cardinal 100–500; ordinal 1st–50th (dates, ranking, floors) | — / hundred, first…fiftieth, place, score, row, floor, page | 100-500 sayıları okur; 1-50 sıra sayılarını kullanır; **proje: sayılarla oyun** | `u3-neon-street` |
| 2.4 | My Learning Diary | Question tags (be + present simple); Ünite 2 tekrar | diary / museum, science centre, public library, zoo, planetarium | **Yazma: diary**; **kültür: okul dışındaki öğrenme yerleri**; değerlendirme | `u2-night-oven` |

Her ders 7 bölüm (review → vocabulary → vocab_quiz → story → explanation → homework → assessment) + imagine; ders içeriği şablon planı `docs/play/authoring-log.md` "Ek-1" satırının kopyası.

---

# Ünite 3 — PERSONAL LIFE (Kişisel Yaşam) — planlandı

Amaç: öğrenci kendi fiziksel özelliklerini, dış görünüşünü, kıyafetlerini ve kişilik özelliklerini tanımlar; insanları karşılaştırır.

## 3.1. Alt konular
- Body parts — Vücut bölümleri
- Physical appearance and clothes — Fiziksel görünüş ve kıyafetler
- Personality and Character — Kişilik ve karakter

## 3.2. Dil bilgisi
1. **Have / Has got** — sahip olunan özellik/eşya. I/You/We/They **have got**; He/She/It **has got**.
   - I have got blue eyes. — Mavi gözlerim var.
   - She has got long hair. — Uzun saçları var.
   - He has got a small nose. — Küçük bir burnu var.
2. **WH- Questions ve Whose** — kime ait?
   - Whose bag is this? — Bu kimin çantası?
   - Whose shoes are these? — Bunlar kimin ayakkabıları?
   - What colour is your hair? — Saçının rengi ne?
3. **Comparative adjectives** — tall → taller, short → shorter, small → smaller, beautiful → more beautiful.
   - Ali is taller than Mehmet. / My bag is smaller than your bag.
4. **Superlative adjectives** — tall → the tallest, small → the smallest, beautiful → the most beautiful, good → the best, bad → the worst.
   - She is the tallest girl in the class. / This is the most beautiful dress.
   - Kitapta düzenli ve düzensiz (good/better/best, bad/worse/worst) biçimler hedefleniyor.

## 3.3. Kelime bilgisi
**A. Body parts and physical appearance:** head (baş), hair (saç), eye (göz), ear (kulak), nose (burun), mouth (ağız), face (yüz), neck (boyun), arm (kol), hand (el), leg (bacak), foot (ayak), tall (uzun boylu), short (kısa boylu), thin (ince/zayıf), strong (güçlü), beautiful (güzel), young (genç), old (yaşlı).

**B. Clothes:** T-shirt (tişört), shirt (gömlek), trousers (pantolon), jeans (kot pantolon), dress (elbise), skirt (etek), jacket (ceket), coat (palto), shoes (ayakkabı), boots (bot), hat (şapka), socks (çorap).

**C. Personality and character:** character (karakter), personality (kişilik), sense (his/duygu) — *kitap*; kind (nazik), friendly (arkadaş canlısı), funny (komik), helpful (yardımsever), honest (dürüst), shy (utangaç), clever (zeki), hard-working (çalışkan), polite (kibar), generous (cömert) — *ek*. Pedagojik not: "lazy" gibi olumsuz sıfatlar yalnız kurgusal karakter/nesne için kullanılır, öğrenciye ya da arkadaşına yakıştırılmaz.

## 3.4. Diğer beceriler ve proje
- Listening: kişisel yaşam hakkında dinleme, bilgi birleştirme.
- Reading: fiziksel özelliklerle ilgili metinler.
- Speaking: kişileri tanımlama, fikir ifade etme.
- Writing: **e-posta**.
- Culture: giyim tarzları.
- Project: **Personal Poster** — fiziksel görünüş ve kişiliği anlatan poster.

## 3.5. Ünite sonunda öğrenci
1. Kendi fiziksel görünüşünü anlatır. 2. Başka insanları tanımlar. 3. Vücut bölümlerini söyler. 4. Kıyafetleri tanır. 5. Kişilik özelliklerini açıklar. 6. İki kişiyi karşılaştırır. 7. En üstün özelliği ifade eder. 8. Kendisi veya başka biri hakkında e-posta yazar.

## 3.6. Önerilen ders bölümlemesi (yapılırken)
| # | Ders | Dil bilgisi | Not |
|---|---|---|---|
| 3.1 | Body and Face | have / has got (+ - ?) | vücut bölümleri; beden yerine "robot/karakter" çizimiyle, beden imajı hassasiyeti: kilo/görünüş yargısı yok |
| 3.2 | What Are You Wearing? | Whose…?; What colour…? + present progressive tekrar | kıyafetler; kayıp eşya kutusu (lost and found) sahnesi |
| 3.3 | Who Is Taller? | comparatives (-er, more, better, worse) | karşılaştırma nesneler/karakterler üzerinden; tenis raketi, top, kort |
| 3.4 | The Best Team | superlatives (-est, the most, the best, the worst) | sınıf rekorları; turnuvada "the best player" anı |
| 3.5 | Personality & My Email | kişilik sıfatları + ünite tekrarı | yazma: e-posta; proje: personal poster (imagine `character`) |

---

# Ünite 4 — FAMILY LIFE (Aile Hayatı) — planlandı

Amaç: aile üyeleri, meslekleri, çalışma yerleri, iş rutinleri ve farklı ev türleri; gelecek planları.

## 4.1. Alt konular
- Family members' jobs, working places, and job routines — Aile üyelerinin meslekleri, çalışma yerleri ve iş rutinleri
- Different types of family homes and houses — Farklı aile evleri ve konut türleri

## 4.2. Dil bilgisi
1. **Present Progressive for future** — planlanmış etkinlik.
   - I am visiting my grandmother tomorrow. — Yarın büyükannemi ziyaret ediyorum.
   - We are going to the cinema tonight. — Bu akşam sinemaya gidiyoruz.
2. **Present Simple for future** — programlanmış olaylar.
   - The school starts at 9 tomorrow. / The train leaves at 8. / My father works on Monday.
3. **When / While** — zaman bağlaçları. Kitap örnekleri past continuous içeriyor (I was studying when my mother came.); öğrencinin seviyesine uygun basit biçimle çalışılmalı:
   - When I come home, I do my homework.
   - While my mother cooks, I set the table.
4. **Which** — seçenekler arasından seçim.
   - Which house do you like? / Which job does your father have? / Which room is yours?
5. **Reflexive pronouns** — myself (kendim), yourself (kendin), himself (kendisi, erkek), herself (kendisi, kadın), itself (kendi), ourselves (kendimiz), yourselves (kendiniz), themselves (kendileri).
   - I do my homework myself. / She cooks by herself. / They clean the house themselves.

## 4.3. Kelime bilgisi
**A. Family members and jobs:** mother, father, brother, sister, grandmother, grandfather; author (yazar), boss (patron), businessman (iş insanı), cook (aşçı) — *kitap*; teacher, doctor, engineer, nurse, farmer, driver — *ek*.

**B. Working places:** office (ofis), hospital (hastane), school (okul), restaurant (restoran), factory (fabrika), farm (çiftlik), shop (mağaza), kitchen (mutfak).

**C. Job routines:** work (çalışmak), cook (yemek yapmak), teach (öğretmek), drive (araç kullanmak), help (yardım etmek), write (yazmak), read (okumak), clean (temizlemek), build (inşa etmek), serve (hizmet etmek).

**D. Types of family homes and houses:** address (adres), apartment (apartman dairesi), bin (çöp kutusu) — *kitap*; house (ev), home (ev/yuva), flat (daire), garden (bahçe), bedroom (yatak odası), living room (oturma odası), kitchen (mutfak), bathroom (banyo) — *ek*.

## 4.4. Diğer beceriler ve proje
- Listening: aile ve ev hayatı.
- Reading: aile, meslekler ve evler.
- Speaking: konular hakkında konuşma.
- Writing: **blog yazısı**.
- Culture: meslekler ve binalar.
- Project: **A Booklet** — aile üyelerinin işleri, çalışma yerleri ve günlük rutinleri.

## 4.5. Ünite sonunda öğrenci
1. Aile üyelerini tanıtır. 2. Aile bireylerinin mesleklerini anlatır. 3. İnsanların nerede çalıştığını söyler. 4. Günlük iş rutinlerini açıklar. 5. Farklı ev türlerini tanır. 6. Ev ve odalar hakkında konuşur. 7. Gelecekteki planları ifade eder. 8. Ailesi hakkında kısa bir blog yazısı yazar.

## 4.6. Önerilen ders bölümlemesi ve hassasiyet notu
| # | Ders | Dil bilgisi |
|---|---|---|
| 4.1 | Jobs and Workplaces | present simple tekrar + Which…? |
| 4.2 | A Day at Work | when / while (present simple biçimi) |
| 4.3 | Homes and Houses | there is/are tekrar + Which room…? |
| 4.4 | Weekend Plans | present progressive / present simple for future |
| 4.5 | I Can Do It Myself & My Blog | reflexive pronouns + ünite tekrarı; proje: booklet |

Hassasiyet: öğrencinin gerçek ailesi hakkında soru sorulmaz (sistem kuralı: kişisel veri yok). Aile ve meslek cümleleri kurgusal karakter aileleri (ör. Dora'nın ailesi) üzerinden kurulur; konuşma derslerinde "hayal edebilirsin" seçeneği verilir. Her aile yapısı normal kabul edilir (tek ebeveyn, büyükanneyle yaşama vb.).

---

# Dört ünitenin karşılaştırması

| Ünite | Ana konu | Önemli dil bilgisi | Yazma |
|---|---|---|---|
| 1. School Life | Okul hayatı | Present Simple, Present Progressive, Articles, Pronouns, WH Questions, Imperatives, There is/are, Object pronouns, Frequency adverbs | School Post |
| 2. Classroom Life | Sınıf hayatı | Present Simple vs Progressive, Question Tags, Possessives, Adverbs, How often | Diary |
| 3. Personal Life | Kişisel yaşam | Have/Has got, Whose, Comparatives, Superlatives | Email |
| 4. Family Life | Aile hayatı | Future arrangements, When/While, Which, Reflexive Pronouns | Blog |

Pedagojik değerlendirme:
1. Ünite 1 ve 2 birbirini tamamlar: Ünite 1'de present simple ve progressive ayrı ayrı öğretilir, Ünite 2'de farkları çalışılır. Ünite 1 oturmadan Ünite 2'ye geçilmemeli (haritada sıra kilidi bunu sağlar).
2. Ünite 3 dil bilgisinde sıçrama içerir (karşılaştırma ve üstünlük).
3. Ünite 4 daha kapsamlı iletişim ister (aile, meslek, gelecek planları).
