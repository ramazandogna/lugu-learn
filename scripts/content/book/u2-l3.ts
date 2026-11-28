/** Ünite 2.3 — The Numbers Game: cardinal 100–500, ordinal 1st–50th (dates, ranking, floors, pages). Theme u3-neon-street, host sasha. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

/** Typed-number answers: digit and word forms, with hyphen / "and" variants. */
const vary = (...xs: string[]): string[] => [
  ...new Set(
    xs.flatMap((x) => {
      const noAnd = x.replace(' and ', ' ')
      return [x, x.replace(/-/g, ' '), noAnd, noAnd.replace(/-/g, ' ')]
    }),
  ),
]

const lesson: ContentLesson = {
  title: 'Ünite 2.3 — The Numbers Game',
  sourceNotes:
    'Kitap Ünite 2 (Classroom Life): 100–500 arası sayılar (British "and": one hundred and twenty-five; forty yazımı) ve 1st–50th sıra sayıları (first, second, third, fifth, ninth, twelfth, twentieth, twenty-first, thirtieth, fortieth, fiftieth; yazılışları 1st 2nd 3rd 4th 21st 22nd 23rd). Kullanım: sayfa/oda numarası, kütüphane kitap sayısı, tarih, sıralama, kat. Proje: A Game with Numbers. Tenis: il birinciliği sıralama tablosu.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Sasha and the Numbers Game',
      tagline: 'Sasha kütüphane için bir sayı oyunu kuruyor! 100–500 arası sayıları ve sıra sayılarını öğren, sıralama tablosunda yerini bul.',
      theme: 'Classroom life',
      character: 'sasha',
      level: 'A2',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u2l3-hundreds', text: '100–500 arası sayıları okur ve söyler (one hundred, two hundred and fifty…).' },
        { id: 'u2l3-and', text: 'Yüzlük sayılarda İngiliz “and” kuralını ve tire/forty yazımını doğru kullanır.' },
        { id: 'u2l3-ordinals', text: '1st–50th sıra sayılarını söyler ve yazar (first, second, third, fifth, ninth, twelfth, twentieth, thirtieth, fortieth, fiftieth).' },
        { id: 'u2l3-written', text: 'Sıra sayılarının yazılışını (1st 2nd 3rd 4th 21st 22nd 23rd) ve 21–29 bileşiklerini kurar.' },
        { id: 'u2l3-uses', text: 'Sayfa, oda, kat, tarih ve sıralamada doğru sayıyı seçer (the 29th of October, the second floor).' },
        { id: 'u2l3-game', text: 'Sayılarla basit bir oyun tasarlar ve kurallarını İngilizce anlatır.' },
      ],
      grammar: [
        'Cardinal numbers 100–500: one hundred and twenty-five',
        'Ordinal numbers 1st–50th: first, second, third … fiftieth',
        'Dates: the 29th of October',
        'Cardinal (how many?) ile ordinal (which one?) farkı',
      ],
      themeId: 'u3-neon-street',
    },
    review: {
      questions: [
        { id: 'rv-often', type: 'choice', prompt: 'Sasha asks: “How often do you visit the library?” Piko goes there on Monday and Thursday every week. He says: “I go ___ a week.”', options: ['once', 'twice', 'three times'], answer: 1, hint: 'Haftada iki gün: Pazartesi ve Perşembe.', explain: 'İki kez için **twice a week** deriz.', objectiveId: 'u2l3-uses' },
        { id: 'rv-manner', type: 'choice', prompt: 'Mr Aydın says: “Dora usually ___ tennis after school.”', options: ['play', 'plays', 'is playing'], answer: 1, hint: 'Usually bir alışkanlık; Dora için he/she/it kuralı.', explain: '**Usually** ile present simple: Dora **plays**.', objectiveId: 'u2l3-uses' },
        { id: 'rv-now', type: 'choice', prompt: 'Look! Momo ___ the books on the shelf right now.', options: ['is sorting', 'sorts', 'sort'], answer: 0, hint: 'Şu anda oluyor: right now.', explain: '**Right now** ile **is sorting** (şimdiki zaman) kullanılır.', objectiveId: 'u2l3-uses' },
        { id: 'rv-poss', type: 'choice', prompt: 'Dora and Leo carry ___ books to the table.', options: ['they', 'their', 'them'], answer: 1, hint: 'Kimin kitapları? İyelik sıfatı gerekiyor.', explain: 'Dora ve Leo’nun kitapları: **their** books.', objectiveId: 'u2l3-uses' },
      ],
    },
    vocabulary: [
      { id: 'v-hundred', en: 'one hundred', tr: 'yüz', example: { en: 'The library has one hundred new books.', tr: 'Kütüphanede yüz yeni kitap var.' }, context: 'Hundred hiçbir zaman -s almaz: two hundred, five hundred.', difficulty: 1, objectiveId: 'u2l3-hundreds' },
      { id: 'v-125', en: 'one hundred and twenty-five', tr: 'yüz yirmi beş', example: { en: 'Open your book at page one hundred and twenty-five.', tr: 'Kitabını yüz yirmi beşinci sayfada aç.' }, context: 'İngiliz İngilizcesinde yüzlükten sonra “and” gelir.', difficulty: 2, objectiveId: 'u2l3-and' },
      { id: 'v-250', en: 'two hundred and fifty', tr: 'iki yüz elli', example: { en: 'The library has two hundred and fifty story books.', tr: 'Kütüphanede iki yüz elli hikâye kitabı var.' }, difficulty: 2, objectiveId: 'u2l3-hundreds' },
      { id: 'v-440', en: 'four hundred and forty', tr: 'dört yüz kırk', example: { en: 'Leo has four hundred and forty stickers.', tr: 'Leo’nun dört yüz kırk çıkartması var.' }, context: 'Dikkat: forty, “fourty” değil, u yok!', difficulty: 3, objectiveId: 'u2l3-and' },
      { id: 'v-500', en: 'five hundred', tr: 'beş yüz', example: { en: 'Five hundred points is the top score.', tr: 'Beş yüz puan en yüksek skor.' }, difficulty: 1, objectiveId: 'u2l3-hundreds' },
      { id: 'v-first', en: 'first (1st)', tr: 'birinci', example: { en: 'You are first in the province!', tr: 'İlde birincisin!' }, difficulty: 1, objectiveId: 'u2l3-ordinals' },
      { id: 'v-second', en: 'second (2nd)', tr: 'ikinci', example: { en: 'Dora is in the second row.', tr: 'Dora ikinci sırada.' }, difficulty: 1, objectiveId: 'u2l3-ordinals' },
      { id: 'v-third', en: 'third (3rd)', tr: 'üçüncü', example: { en: 'The science lab is on the third floor.', tr: 'Fen laboratuvarı üçüncü katta.' }, difficulty: 1, objectiveId: 'u2l3-ordinals' },
      { id: 'v-fifth', en: 'fifth (5th)', tr: 'beşinci', example: { en: 'It is the fifth question in the quiz.', tr: 'Bu, sınavdaki beşinci soru.' }, context: 'five → fifth: ve harfleri f olur.', difficulty: 2, objectiveId: 'u2l3-ordinals' },
      { id: 'v-ninth', en: 'ninth (9th)', tr: 'dokuzuncu', example: { en: 'Today is the ninth of May.', tr: 'Bugün dokuz Mayıs.' }, context: 'nine → ninth: sondaki e düşer.', difficulty: 2, objectiveId: 'u2l3-ordinals' },
      { id: 'v-twelfth', en: 'twelfth (12th)', tr: 'on ikinci', example: { en: 'The twelfth page has a big map.', tr: 'On ikinci sayfada büyük bir harita var.' }, context: 'twelve → twelfth: ve harfleri f olur.', difficulty: 3, objectiveId: 'u2l3-ordinals' },
      { id: 'v-twentieth', en: 'twentieth (20th)', tr: 'yirminci', example: { en: 'Momo is twentieth in the line.', tr: 'Momo sırada yirminci.' }, context: 'twenty → twentieth: y harfi -ieth olur.', difficulty: 2, objectiveId: 'u2l3-ordinals' },
      { id: 'v-21st', en: 'twenty-first (21st)', tr: 'yirmi birinci', example: { en: 'The school concert is on the twenty-first of June.', tr: 'Okul konseri yirmi bir Haziran’da.' }, context: 'Yalnız son sayı sıra sayısı olur: twenty-first, twenty-second, twenty-third.', difficulty: 3, objectiveId: 'u2l3-written' },
      { id: 'v-fortieth', en: 'fortieth (40th)', tr: 'kırkıncı', example: { en: 'This is the fortieth page of the book.', tr: 'Bu, kitabın kırkıncı sayfası.' }, context: 'forty → fortieth (fourtieth değil).', difficulty: 3, objectiveId: 'u2l3-ordinals' },
      { id: 'v-fiftieth', en: 'fiftieth (50th)', tr: 'ellinci', example: { en: 'It is our school’s fiftieth birthday.', tr: 'Bu, okulumuzun ellinci doğum günü.' }, difficulty: 3, objectiveId: 'u2l3-ordinals' },
      { id: 'v-place', en: 'first place', tr: 'birincilik', example: { en: 'Mr Aydın gives the trophy for first place.', tr: 'Mr Aydın birincilik kupasını veriyor.' }, context: 'Yarışmada sıra için “place” kullanılır: second place, third place.', difficulty: 2, objectiveId: 'u2l3-uses' },
      { id: 'v-ranking', en: 'ranking table', tr: 'sıralama tablosu', example: { en: 'The ranking table is on the gym wall.', tr: 'Sıralama tablosu spor salonunun duvarında.' }, difficulty: 2, objectiveId: 'u2l3-uses' },
      { id: 'v-score', en: 'score', tr: 'skor, puan', example: { en: 'Your score is four hundred and eighty.', tr: 'Skorun dört yüz seksen.' }, difficulty: 1, objectiveId: 'u2l3-uses' },
      { id: 'v-row', en: 'row', tr: 'sıra (yan yana dizilmiş)', example: { en: 'Piko sits in the first row.', tr: 'Piko birinci sırada oturuyor.' }, difficulty: 2, objectiveId: 'u2l3-uses' },
      { id: 'v-floor', en: 'floor', tr: 'kat', example: { en: 'Room 205 is on the second floor.', tr: '205 numaralı oda ikinci katta.' }, context: 'Zemin kat = ground floor; ondan sonraki kat first floor.', difficulty: 2, objectiveId: 'u2l3-uses' },
      { id: 'v-page', en: 'page', tr: 'sayfa', example: { en: 'Look at page one hundred and twenty-five.', tr: 'Yüz yirmi beşinci sayfaya bak.' }, difficulty: 1, objectiveId: 'u2l3-uses' },
    ],
    story: {
      title: 'The Numbers Game',
      character: 'sasha',
      setting: 'A school: the library, the corridors, the gym with the ranking table',
      scenes: [
        {
          id: 'sc-library',
          illustration: 'Sasha and Piko in a bright library; long shelves of story books with number cards and Ms Pearl at the desk.',
          lines: [
            { speaker: 'narrator', en: 'It is break time. Sasha and Piko are in the library.', tr: 'Teneffüs zamanı. Sasha ve Piko kütüphanede.' },
            { speaker: 'sasha', en: 'Look! The library has two hundred and fifty story books.', tr: 'Bak! Kütüphanede iki yüz elli hikâye kitabı var.' },
            { speaker: 'piko', en: 'In my book, page one hundred and twenty-five is the best page!', tr: 'Kitabımda yüz yirmi beşinci sayfa en güzel sayfa!' },
            { speaker: 'narrator', en: 'Ms Pearl says: “Every book has a number card. Please keep them in order.”', tr: 'Ms Pearl şöyle diyor: “Her kitabın bir numara kartı var. Lütfen onları sırada tutun.”' },
            { speaker: 'sasha', en: 'Numbers, numbers! I have an idea: a number game!', tr: 'Sayılar, sayılar! Bir fikrim var: bir sayı oyunu!' },
          ],
        },
        {
          id: 'sc-floors',
          illustration: 'Leo draws a school map on a big sheet: three floors, room numbers on small doors.',
          lines: [
            { speaker: 'narrator', en: 'Leo draws a map of the school for the game.', tr: 'Leo oyun için okulun haritasını çiziyor.' },
            { speaker: 'leo', en: 'The canteen is on the ground floor. The library is on the first floor.', tr: 'Kantin zemin katta. Kütüphane birinci katta.' },
            { speaker: 'sasha', en: 'Room two hundred and five is on the second floor. It is the English room.', tr: '205 numaralı oda ikinci katta. O, İngilizce odası.' },
            { speaker: 'piko', en: 'And Room three hundred and twelve is the science lab. It is on the third floor.', tr: 'Üç yüz on iki numaralı oda fen laboratuvarı. Üçüncü katta.' },
            { speaker: 'leo', en: 'Look! The first number of the room is the floor!', tr: 'Bak! Oda numarasının ilk rakamı katı gösteriyor!' },
          ],
        },
        {
          id: 'sc-gym',
          illustration: 'The sunny gym: a big ranking table on the wall, a shiny trophy on a bench, Mr Aydın with a clipboard.',
          lines: [
            { speaker: 'narrator', en: 'Mr Aydın is in the gym. The tennis ranking table is on the wall.', tr: 'Mr Aydın spor salonunda. Tenis sıralama tablosu duvarda.' },
            { speaker: 'dora', en: 'Look at the table! It has places and points.', tr: 'Tabloya bak! Sıralar ve puanlar var.' },
            { speaker: 'narrator', en: 'First place: you, four hundred and eighty points. Second place: four hundred and sixty-five points.', tr: 'Birincilik: sen, dört yüz seksen puan. İkincilik: dört yüz altmış beş puan.' },
            { speaker: 'narrator', en: 'Mr Aydın smiles and says: “You are first in the province!”', tr: 'Mr Aydın gülümseyip şöyle diyor: “İlde birincisin!”' },
            { speaker: 'dora', en: 'First place! You are the province tennis champion!', tr: 'Birincilik! Sen ilin tenis şampiyonusun!' },
            { speaker: 'momo', en: 'And the trophy is on the bench. It is so shiny!', tr: 'Kupa da bankta. Çok parlak!' },
          ],
        },
        {
          id: 'sc-game',
          illustration: 'The five friends around a table with number cards and a calendar: Sasha explains the rules.',
          lines: [
            { speaker: 'sasha', en: 'Here are the rules. Pick a card and read the number.', tr: 'İşte kurallar. Bir kart seç ve sayıyı oku.' },
            { speaker: 'piko', en: 'My card says: Republic Day is the twenty-ninth of October!', tr: 'Kartımda şöyle yazıyor: Cumhuriyet Bayramı yirmi dokuz Ekim!' },
            { speaker: 'dora', en: 'Mine is Teachers’ Day: the twenty-fourth of November.', tr: 'Benimki Öğretmenler Günü: yirmi dört Kasım.' },
            { speaker: 'momo', en: 'I have the fortieth card. It is forty, not fourty!', tr: 'Bende kırkıncı kart var. Kırk, “fourty” değil!' },
            { speaker: 'sasha', en: 'Ten points for a right answer. Five hundred is the top score!', tr: 'Doğru cevaba on puan. Beş yüz en yüksek skor!' },
          ],
          choice: {
            prompt: 'Which card do you pick first?',
            options: [
              { text: 'A date card: the 23rd of April.', feedback: 'Güzel seçim! 23 Nisan için “the twenty-third of April” dersin.' },
              { text: 'A page card: page 125.', feedback: 'Güzel seçim! Sayfa 125: “page one hundred and twenty-five”.' },
            ],
          },
        },
      ],
      questions: [
        { id: 'st-q-books', type: 'choice', prompt: 'Sasha looks at the shelves. How many story books does the library have?', options: ['One hundred and twenty-five', 'Two hundred and fifty', 'Five hundred'], answer: 1, hint: 'İlk sahnede Sasha kitapları sayıyor.', explain: 'Kütüphanede **two hundred and fifty** (250) kitap var.', objectiveId: 'u2l3-hundreds', vocabId: 'v-250' },
        { id: 'st-q-room', type: 'choice', prompt: 'Piko asks Leo: “On which floor is Room 205?”', options: ['The first floor.', 'The third floor.', 'The second floor.'], answer: 2, hint: 'Oda numarasının ilk rakamı katı gösteriyor.', explain: '205: ilk rakam 2, yani **the second floor**.', objectiveId: 'u2l3-uses', vocabId: 'v-floor' },
        { id: 'st-q-points', type: 'text', prompt: 'Dora reads the ranking table. Type your points (a number or words).', accept: vary('480', 'four hundred and eighty', '480 points', 'four hundred and eighty points'), hint: 'Birincilik satırına bak: dört yüz seksen.', explain: 'Dört yüz seksen: **480** (four hundred and eighty).', objectiveId: 'u2l3-hundreds', vocabId: 'v-ranking' },
        { id: 'st-q-place', type: 'choice', prompt: 'Mr Aydın smiles at you: “You are ___ in the province!”', options: ['second', 'third', 'first', 'fifth'], answer: 2, hint: 'En çok puan kimde? Birincilik.', explain: 'En çok puan sende: **first** place.', objectiveId: 'u2l3-ordinals', vocabId: 'v-first' },
        { id: 'st-q-order', type: 'order', prompt: 'Piko reads his card to the group. Put his words in order.', tokens: ['is', 'twenty-ninth', 'Day', 'the', 'Republic', 'of', 'October.'], answer: ['Republic', 'Day', 'is', 'the', 'twenty-ninth', 'of', 'October.'], hint: 'Önce bayramın adı, sonra is, sonra tarih.', explain: 'Tarih: the **twenty-ninth** of October.', objectiveId: 'u2l3-uses', vocabId: 'v-first' },
        { id: 'st-q-spell', type: 'choice', prompt: 'Momo shows her card: “I have the ___ card.” (40th)', options: ['fourtieth', 'fortieth', 'fourthieth'], answer: 1, hint: 'Momo’nun cümlesinde forty’nin yazılışı var.', explain: 'forty → **fortieth** (u yok).', objectiveId: 'u2l3-ordinals', vocabId: 'v-fortieth' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-hundreds',
          title: 'Yüzlükler: hundred -s almaz',
          body: 'Kütüphanede rafları sayıyorsun. **100, 200, 300, 400, 500** için sayı + **hundred** dersin. İki yüz bile olsa **hundred** hiç -s almaz.',
          examples: [
            { en: '100 = one hundred', tr: 'yüz' },
            { en: '200 = two hundred', tr: 'iki yüz' },
            { en: '500 = five hundred', tr: 'beş yüz' },
          ],
          check: { id: 'ex-check-hundreds', type: 'choice', prompt: 'Sasha counts her stickers: “I have three ___ stickers.” (300)', options: ['hundreds', 'hundred', 'hundred of'], answer: 1, hint: 'Hundred’a -s eklenir mi?', explain: '**Three hundred**: hundred hiçbir zaman -s almaz.', objectiveId: 'u2l3-hundreds', vocabId: 'v-hundred' },
        },
        {
          id: 'ex-and',
          title: 'İngiliz “and”: hundred and …',
          body: 'Yüzlükten sonra küçük sayı gelirse araya **and** koyarız (İngiliz İngilizcesi). 125 = one hundred **and** twenty-five. Yalnız tam yüzlükte (200) **and** yok.',
          examples: [
            { en: '125 = one hundred and twenty-five', tr: 'yüz yirmi beş' },
            { en: '250 = two hundred and fifty', tr: 'iki yüz elli' },
            { en: '345 = three hundred and forty-five', tr: 'üç yüz kırk beş' },
          ],
          check: { id: 'ex-check-and', type: 'text', prompt: 'Ms Pearl reads out page 245. Type the missing word: “two hundred ___ forty-five.”', accept: ['and'], hint: 'Yüzlük ile küçük sayı arasındaki küçük kelime.', explain: 'Yüzlükten sonra **and**: two hundred **and** forty-five.', objectiveId: 'u2l3-and', vocabId: 'v-125' },
        },
        {
          id: 'ex-tens',
          title: '21–99: tire ve forty',
          body: '**21–99** arası sayılar tireyle yazılır: twenty-**one**, forty-**five**. Ve **forty** (40) hep “u”suz yazılır: fourteen’de u var ama forty’de yok!',
          examples: [
            { en: '45 = forty-five', tr: 'kırk beş' },
            { en: '440 = four hundred and forty', tr: 'dört yüz kırk' },
            { en: '480 = four hundred and eighty', tr: 'dört yüz seksen' },
          ],
          check: { id: 'ex-check-tens', type: 'choice', prompt: 'Leo writes 40 on the whiteboard. Which spelling is correct?', options: ['fourty', 'forty', 'fortty'], answer: 1, hint: 'Hep “u”suz yazılan sayı.', explain: '40 = **forty** (fourty yazılmaz).', objectiveId: 'u2l3-and', vocabId: 'v-440' },
        },
        {
          id: 'ex-ordinal-basic',
          title: 'Sıra sayıları: first, second, third',
          body: 'Birinci, ikinci, üçüncü özel: **first, second, third**. Ötekiler çoğunlukla **-th** alır: fourth, sixth. Dikkat: five → **fifth**, nine → **ninth**, twelve → **twelfth**.',
          examples: [
            { en: '1st = first, 2nd = second, 3rd = third', tr: 'birinci, ikinci, üçüncü' },
            { en: '4th = fourth, 5th = fifth', tr: 'dördüncü, beşinci' },
            { en: '9th = ninth, 12th = twelfth', tr: 'dokuzuncu, on ikinci' },
          ],
          check: { id: 'ex-check-ordinal-basic', type: 'choice', prompt: 'Momo is number 3 in the line. She says: “I am ___.”', options: ['three', 'third', 'threeth'], answer: 1, hint: 'Sıra sayılarında 3 özel bir kelime.', explain: '3. için **third** deriz.', objectiveId: 'u2l3-ordinals', vocabId: 'v-third' },
        },
        {
          id: 'ex-ordinal-tens',
          title: 'Onluklar: twentieth, thirtieth, fortieth',
          body: 'Onluklarda **y → ieth**: twenty → **twentieth**, thirty → **thirtieth**, forty → **fortieth**, fifty → **fiftieth**. Yazılışları 20th, 30th, 40th, 50th.',
          examples: [
            { en: '20th = twentieth', tr: 'yirminci' },
            { en: '30th = thirtieth', tr: 'otuzuncu' },
            { en: '40th = fortieth, 50th = fiftieth', tr: 'kırkıncı, ellinci' },
          ],
          check: { id: 'ex-check-ordinal-tens', type: 'choice', prompt: 'Piko is number 30 in the long line. He is ___.', options: ['thirtyth', 'thirty', 'thirtieth'], answer: 2, hint: 'y harfi -ieth olur.', explain: 'thirty → **thirtieth**.', objectiveId: 'u2l3-ordinals', vocabId: 'v-twentieth' },
        },
        {
          id: 'ex-21st',
          title: '21st, 22nd, 23rd: sadece son kelime değişir',
          body: 'Bileşik sayılarda yalnız **son** kelime sıra sayısı olur: twenty-**first**, twenty-**second**, twenty-**third**. Yazılışı: **21st, 22nd, 23rd, 24th**.',
          examples: [
            { en: '21st = twenty-first', tr: 'yirmi birinci' },
            { en: '22nd = twenty-second', tr: 'yirmi ikinci' },
            { en: '23rd = twenty-third, 24th = twenty-fourth', tr: 'yirmi üçüncü, yirmi dördüncü' },
          ],
          check: { id: 'ex-check-21st', type: 'choice', prompt: 'Sasha writes “23rd” on a card. How do you read it?', options: ['twenty-three', 'twenty-third', 'third twenty'], answer: 1, hint: 'Yalnız son kelime sıra sayısı olur.', explain: '23rd = **twenty-third**.', objectiveId: 'u2l3-written', vocabId: 'v-21st' },
        },
        {
          id: 'ex-dates',
          title: 'Tarihler: the 29th of October',
          body: 'Tarihte **sıra sayısı** kullanırız: **the 29th of October** (the twenty-ninth of October). 29 Ekim, 23 Nisan, 19 Mayıs, 24 Kasım hep sıra sayısıyla söylenir.',
          examples: [
            { en: 'Republic Day is on the 29th of October.', tr: 'Cumhuriyet Bayramı 29 Ekim’de.' },
            { en: 'Youth and Sports Day is on the 19th of May.', tr: 'Gençlik ve Spor Bayramı 19 Mayıs’ta.' },
            { en: 'Teachers’ Day is on the 24th of November.', tr: 'Öğretmenler Günü 24 Kasım’da.' },
          ],
          check: { id: 'ex-check-dates', type: 'choice', prompt: 'Ms Pearl says: “Youth and Sports Day is on the ___ of May.” (19th)', options: ['nineteen', 'ninth', 'nineteenth'], answer: 2, hint: 'Tarihte sıra sayısı kullanılır.', explain: '19. gün: the **nineteenth** of May.', objectiveId: 'u2l3-uses', vocabId: 'v-ninth' },
        },
        {
          id: 'ex-which-one',
          title: 'Kaç tane? ile Hangisi?',
          body: '**Kaç tane?** (How many?) → **cardinal**: 480 points. **Kaçıncı / hangisi?** (Which one?) → **ordinal**: the 3rd floor, **first place**. Oda ve sayfa numaraları sayı gibi okunur: Room 205 = two hundred and five.',
          examples: [
            { en: 'You are first with 480 points.', tr: '480 puanla birincisin.' },
            { en: 'The art room is on the third floor.', tr: 'Resim odası üçüncü katta.' },
            { en: 'Room 205 is on the second floor.', tr: '205 numaralı oda ikinci katta.' },
          ],
          check: { id: 'ex-check-which', type: 'choice', prompt: 'Mr Aydın asks: “How many points do you have?” You answer: “I have ___ points.”', options: ['fourth hundred and twenty', 'four hundred and twenty', 'forty hundred twenty'], answer: 1, hint: 'Kaç tane? sorusuna miktar sayısı cevap verir.', explain: 'Miktar için **four hundred and twenty**.', objectiveId: 'u2l3-uses', vocabId: 'v-score' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u2l3-hundreds',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Sasha counts one shelf: there are 200 books. “There are two ___ books.”', options: ['hundred', 'hundreds', 'hundredth'], answer: 0, hint: 'Hundred -s almaz.', explain: '**Two hundred**: -s yok.', objectiveId: 'u2l3-hundreds', vocabId: 'v-hundred' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Sasha writes on the board. Build her sentence.', tokens: ['books.', 'hundred', 'are', 'There', 'two'], answer: ['There', 'are', 'two', 'hundred', 'books.'], hint: 'There are + sayı + isim.', explain: 'There are **two hundred** books.', objectiveId: 'u2l3-hundreds' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Piko says: “I have three hundred stickers.” What does he mean?', options: ['30 çıkartmam var.', '300 çıkartmam var.', '13 çıkartmam var.'], answer: 1, hint: 'hundred = yüz', explain: 'three hundred = üç yüz = 300.', objectiveId: 'u2l3-hundreds', vocabId: 'v-hundred' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u2l3-and',
          complete: { id: 'hw-2-complete', type: 'text', prompt: 'Ms Pearl reads page 125. Type the missing word: “Page one hundred ___ twenty-five.”', accept: ['and'], hint: 'Yüzlükten sonraki küçük bağlaç.', explain: 'Yüzlükten sonra **and** gelir.', objectiveId: 'u2l3-and', vocabId: 'v-125' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Piko reads his page number. Put his words in order.', tokens: ['and', 'Page', 'is', 'one', 'twenty-five', 'hundred', 'easy.'], answer: ['Page', 'one', 'hundred', 'and', 'twenty-five', 'is', 'easy.'], hint: 'Sayı: yüz, and, yirmi beş.', explain: 'Page one hundred **and** twenty-five.', objectiveId: 'u2l3-and' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Sasha says: “The book has two hundred and fifty pages.” How many pages?', options: ['205', '250', '520'], answer: 1, hint: 'two hundred = 200, fifty = 50', explain: '200 + 50 = **250**.', objectiveId: 'u2l3-and', vocabId: 'v-250' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u2l3-and',
          complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Momo writes 40 on the board. “___”', options: ['fourty', 'forty', 'fortie'], answer: 1, hint: 'Hep “u”suz yazılır.', explain: '40 = **forty**.', objectiveId: 'u2l3-and', vocabId: 'v-440' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Leo counts his cards. Build his sentence.', tokens: ['cards.', 'I', 'have', 'forty'], answer: ['I', 'have', 'forty', 'cards.'], hint: 'I have + sayı + isim.', explain: 'I have **forty** cards.', objectiveId: 'u2l3-and' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Leo says: “I have four hundred and forty stickers.” Which number is it?', options: ['404', '414', '440'], answer: 2, hint: 'four hundred = 400, forty = 40', explain: '400 + 40 = **440**.', objectiveId: 'u2l3-and', vocabId: 'v-440' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u2l3-ordinals',
          complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Dora is number 1 in the line. She is ___.', options: ['one', 'first', 'oneth'], answer: 1, hint: 'Sıra sayısı lazım.', explain: '1. = **first**.', objectiveId: 'u2l3-ordinals', vocabId: 'v-first' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Sasha points at the line. Build her sentence.', tokens: ['line.', 'first', 'the', 'is', 'Dora', 'in'], answer: ['Dora', 'is', 'first', 'in', 'the', 'line.'], hint: 'Kim? → is → kaçıncı → nerede?', explain: 'Dora is **first** in the line.', objectiveId: 'u2l3-ordinals' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Piko says: “I am second in the row.” What does he mean?', options: ['Ben ikinci sıradayım.', 'Ben iki sıradayım.', 'Ben üçüncü sıradayım.'], answer: 0, hint: 'second = ikinci', explain: 'second = ikinci.', objectiveId: 'u2l3-ordinals', vocabId: 'v-second' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u2l3-ordinals',
          complete: { id: 'hw-5-complete', type: 'text', prompt: 'Leo opens the book at the ___ page. (5th) Type the word.', accept: ['fifth'], hint: 'five → ? (ve f olur)', explain: 'five → **fifth**.', objectiveId: 'u2l3-ordinals', vocabId: 'v-fifth' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Ms Pearl reads the quiz. Put her words in order.', tokens: ['hard.', 'question', 'fifth', 'The', 'is'], answer: ['The', 'fifth', 'question', 'is', 'hard.'], hint: 'The + sıra sayısı + isim.', explain: 'The **fifth** question is hard.', objectiveId: 'u2l3-ordinals' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Momo says: “It is the ninth page.” What does she mean?', options: ['Dokuz sayfa.', 'On dokuzuncu sayfa.', 'Dokuzuncu sayfa.'], answer: 2, hint: 'ninth = dokuzuncu', explain: 'ninth = dokuzuncu.', objectiveId: 'u2l3-ordinals', vocabId: 'v-ninth' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u2l3-ordinals',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Momo is number 20 in the long line. She is ___.', options: ['twentyth', 'twentieth', 'twenty'], answer: 1, hint: 'y harfi -ieth olur.', explain: 'twenty → **twentieth**.', objectiveId: 'u2l3-ordinals', vocabId: 'v-twentieth' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Dora counts the line. Build her sentence.', tokens: ['line.', 'twentieth', 'Momo', 'is', 'in', 'the'], answer: ['Momo', 'is', 'twentieth', 'in', 'the', 'line.'], hint: 'Kim? → is → kaçıncı → nerede?', explain: 'Momo is **twentieth** in the line.', objectiveId: 'u2l3-ordinals' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Mr Aydın says: “This is the thirtieth match.” Which number is it?', options: ['30. maç', '3. maç', '13. maç'], answer: 0, hint: 'thirtieth = otuzuncu', explain: 'thirtieth = otuzuncu (30th).', objectiveId: 'u2l3-ordinals', vocabId: 'v-fortieth' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u2l3-written',
          complete: { id: 'hw-7-complete', type: 'text', prompt: 'Sasha writes 22nd on a card. Type it in words: “the ___” (22nd)', accept: vary('twenty-second'), hint: 'Yalnız son kelime sıra sayısı olur.', explain: '22nd = **twenty-second**.', objectiveId: 'u2l3-written', vocabId: 'v-21st' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Ms Pearl announces the concert. Put her words in order.', tokens: ['is', 'twenty-first', 'The', 'of', 'on', 'concert', 'the', 'June.'], answer: ['The', 'concert', 'is', 'on', 'the', 'twenty-first', 'of', 'June.'], hint: 'Tarih: the + sıra sayısı + of + ay.', explain: 'On the **twenty-first** of June.', objectiveId: 'u2l3-written' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Leo writes “23rd” on the card. How do you read it?', options: ['twenty-three', 'twenty-third', 'third twenty'], answer: 1, hint: 'Son kelime third olur.', explain: '23rd = **twenty-third**.', objectiveId: 'u2l3-written', vocabId: 'v-21st' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u2l3-uses',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Ms Pearl says: “Teachers’ Day is on the ___ of November.” (24th)', options: ['twenty-four', 'twenty-fourth', 'fourth twenty'], answer: 1, hint: 'Tarihte sıra sayısı kullanılır.', explain: 'the **twenty-fourth** of November.', objectiveId: 'u2l3-uses', vocabId: 'v-21st' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Sasha reads a date card. Put her words in order.', tokens: ['twenty-third', 'Day', 'April.', 'the', 'and', 'Sovereignty', 'is', 'National', 'of', 'on', 'Children’s'], answer: ['National', 'Sovereignty', 'and', 'Children’s', 'Day', 'is', 'on', 'the', 'twenty-third', 'of', 'April.'], hint: 'Önce bayramın adı, sonra tarih.', explain: 'On the **twenty-third** of April.', objectiveId: 'u2l3-uses' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Piko says: “It is the 29th of October.” Which day is it?', options: ['19 Mayıs', '29 Ekim', '24 Kasım'], answer: 1, hint: 'October = Ekim', explain: 'the 29th of October = 29 Ekim.', objectiveId: 'u2l3-uses', vocabId: 'v-ninth' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u2l3-uses',
          complete: { id: 'hw-9-complete', type: 'choice', prompt: 'Piko says: “Room 205 is on the ___ floor.”', options: ['two', 'second', 'twenty'], answer: 1, hint: 'Hangi kat? Sıra sayısı.', explain: 'Kat için sıra sayısı: the **second** floor.', objectiveId: 'u2l3-uses', vocabId: 'v-floor' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Leo labels the map. Build his sentence.', tokens: ['floor.', 'the', 'is', 'on', 'The', 'first', 'library'], answer: ['The', 'library', 'is', 'on', 'the', 'first', 'floor.'], hint: 'Yer → is → on the → kat.', explain: 'The library is on the **first** floor.', objectiveId: 'u2l3-uses' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Sasha says: “Room 312 is the science lab.” Which floor is it on?', options: ['2. kat', '3. kat', '1. kat'], answer: 1, hint: 'İlk rakam katı gösterir.', explain: '312 → ilk rakam 3: the third floor.', objectiveId: 'u2l3-uses', vocabId: 'v-floor' },
        },
        {
          id: 'hw-10',
          objectiveId: 'u2l3-uses',
          complete: { id: 'hw-10-complete', type: 'text', prompt: 'Mr Aydın reads: “First place: you.” Type the missing word: “You are ___ in the province!”', accept: ['first'], hint: 'En çok puan: birinci.', explain: 'Birincilik için **first**.', objectiveId: 'u2l3-uses', vocabId: 'v-place' },
          order: { id: 'hw-10-order', type: 'order', prompt: 'Dora reads your score. Put her words in order.', tokens: ['points.', 'You', 'four', 'hundred', 'have', 'and', 'eighty'], answer: ['You', 'have', 'four', 'hundred', 'and', 'eighty', 'points.'], hint: 'You have + sayı + points.', explain: 'You have **four hundred and eighty** points.', objectiveId: 'u2l3-uses' },
          meaning: { id: 'hw-10-meaning', type: 'choice', prompt: 'Mr Aydın says: “Dora is second with 465 points.” What does he mean?', options: ['Dora ikinci, 4065 puanı var.', 'Dora birinci, 465 puanı var.', 'Dora ikinci, 465 puanı var.'], answer: 2, hint: 'second = ikinci', explain: 'Dora ikinci, **465** puanı var.', objectiveId: 'u2l3-uses', vocabId: 'v-ranking' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-300', type: 'choice', prompt: 'Piko writes 300 on the board. Which word is right?', options: ['three hundreds', 'three hundred', 'third hundred', 'thirty hundred'], answer: 1, objectiveId: 'u2l3-hundreds', vocabId: 'v-hundred' },
        { id: 'as-245', type: 'text', prompt: 'Ms Pearl says: “Room two hundred and forty-five.” Type the room number.', accept: vary('245', 'two hundred and forty-five'), objectiveId: 'u2l3-and', vocabId: 'v-125' },
        { id: 'as-spell-440', type: 'choice', prompt: 'Leo writes 440 in words. Choose the correct spelling.', options: ['four hundred and fourty', 'four hundred and fortey', 'four hundred and forty'], answer: 2, objectiveId: 'u2l3-and', vocabId: 'v-440' },
        { id: 'as-250', type: 'text', prompt: 'Sasha puts card 250 on a book. Type 250 in words.', accept: vary('250', 'two hundred and fifty'), objectiveId: 'u2l3-hundreds', vocabId: 'v-250' },
        { id: 'as-first-place', type: 'choice', prompt: 'Mr Aydın points at the ranking table. You have the most points. You are in ___ place.', options: ['one', 'onest', 'first', 'oneth'], answer: 2, objectiveId: 'u2l3-ordinals', vocabId: 'v-place' },
        { id: 'as-22nd', type: 'choice', prompt: 'Dora writes “22nd” on the calendar. How do you say it?', options: ['twenty-two', 'twenty-second', 'twenty-twoth', 'second twenty'], answer: 1, objectiveId: 'u2l3-written', vocabId: 'v-21st' },
        { id: 'as-ninth', type: 'text', prompt: 'It is the 9th of May. Type the word: “the ___ of May”', accept: ['ninth'], objectiveId: 'u2l3-ordinals', vocabId: 'v-ninth' },
        { id: 'as-twelfth', type: 'text', prompt: 'Momo opens the book at the 12th page. Type 12th in words: “the ___ page”', accept: ['twelfth'], objectiveId: 'u2l3-ordinals', vocabId: 'v-twelfth' },
        { id: 'as-floor', type: 'choice', prompt: 'Piko is in Room 312. Which floor is he on?', options: ['The second floor.', 'The first floor.', 'The third floor.'], answer: 2, objectiveId: 'u2l3-uses', vocabId: 'v-floor' },
        { id: 'as-date', type: 'choice', prompt: 'Leo asks: “Which date is Republic Day?”', options: ['The 23rd of April.', 'The 29th of October.', 'The 19th of May.', 'The 24th of November.'], answer: 1, objectiveId: 'u2l3-uses', vocabId: 'v-21st' },
        { id: 'as-order-trophy', type: 'order', prompt: 'Mr Aydın gives you the trophy. Put his words in order.', tokens: ['province!', 'are', 'first', 'in', 'You', 'the'], answer: ['You', 'are', 'first', 'in', 'the', 'province!'], objectiveId: 'u2l3-uses', vocabId: 'v-place' },
        { id: 'as-fiftieth', type: 'choice', prompt: 'Dora says: “It is the fiftieth page.” What does she mean?', options: ['Bu 15. sayfa.', 'Bu 50. sayfa.', 'Bu 500. sayfa.'], answer: 1, objectiveId: 'u2l3-ordinals', vocabId: 'v-fiftieth' },
      ],
      reading: {
        title: 'Sasha’s Number Game',
        paragraphs: [
          'Sasha has a new game for the school library. It is called the Number Game. The library has two hundred and fifty story books, and every book has a number card.',
          'The first player picks a card and reads the number. The second player finds the book on the shelf. A right answer is ten points. The best players have four hundred points or more.',
          'Today the game is on the twenty-fourth of November, Teachers’ Day. Piko is first with four hundred and ten points. Dora is second with three hundred and ninety points. Momo is third, but she is happy: it is her first game!',
        ],
        questions: [
          { id: 'rd-tf-books', type: 'choice', prompt: 'The library has two hundred story books.', options: tf, answer: 1, objectiveId: 'u2l3-hundreds', vocabId: 'v-250' },
          { id: 'rd-tf-card', type: 'choice', prompt: 'Every book has a number card.', options: tf, answer: 0, objectiveId: 'u2l3-uses', vocabId: 'v-page' },
          { id: 'rd-tf-second', type: 'choice', prompt: 'The second player finds the book on the shelf.', options: tf, answer: 0, objectiveId: 'u2l3-ordinals', vocabId: 'v-second' },
          { id: 'rd-tf-piko', type: 'choice', prompt: 'Piko is second in the game.', options: tf, answer: 1, objectiveId: 'u2l3-ordinals', vocabId: 'v-first' },
          { id: 'rd-tf-day', type: 'choice', prompt: 'The game is on Teachers’ Day.', options: tf, answer: 0, objectiveId: 'u2l3-uses' },
          { id: 'rd-fill-dora', type: 'choice', prompt: 'Dora is ___ with three hundred and ninety points.', options: ['two', 'twice', 'secondth', 'second'], answer: 3, objectiveId: 'u2l3-ordinals', vocabId: 'v-second' },
          { id: 'rd-fill-day', type: 'choice', prompt: 'The game is on the ___ of November.', options: ['twenty-four', 'fortieth', 'twenty-fourth', 'fourth'], answer: 2, objectiveId: 'u2l3-written', vocabId: 'v-21st' },
          { id: 'rd-fill-momo', type: 'choice', prompt: 'Momo is ___. It is her first game.', options: ['three', 'third', 'thirty', 'threeth'], answer: 1, objectiveId: 'u2l3-ordinals', vocabId: 'v-third' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-hundred', 'v-250', 'v-500', 'v-first', 'v-second', 'v-third', 'v-place', 'v-score', 'v-floor', 'v-page',
              'rv-often', 'rv-manner', 'rv-now', 'rv-poss',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'honey-slime', escapee: 'sasha' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-250', line: { speaker: 'sasha', en: 'The library has two hundred and fifty books.', tr: 'Kütüphanede iki yüz elli kitap var.' }, emphasis: ['two hundred and fifty'] },
              { id: 'vs-125', line: { speaker: 'piko', en: 'Open your book at page one hundred and twenty-five.', tr: 'Kitabını yüz yirmi beşinci sayfada aç.' }, emphasis: ['page', 'one hundred and twenty-five'] },
              {
                id: 'vs-forty',
                line: { speaker: 'leo', en: 'I have four hundred and forty stickers!', tr: 'Dört yüz kırk çıkartmam var!' },
                emphasis: ['forty'],
                joke: { tr: 'Fourteen’de “u” var, forty’de yok. Sanki o harf kırk gün tatile çıkmış.' },
              },
              { id: 'vs-first', line: { speaker: 'dora', en: 'I am first in the row!', tr: 'Sırada birinciyim!' }, emphasis: ['first', 'row'] },
              { id: 'vs-floor', line: { speaker: 'sasha', en: 'Room 205 is on the second floor.', tr: '205 numaralı oda ikinci katta.' }, emphasis: ['floor'] },
              { id: 'vs-ninth', line: { speaker: 'momo', en: 'It is the ninth of May. And the twelfth page!', tr: 'Dokuz Mayıs. Bir de on ikinci sayfa!' }, emphasis: ['ninth', 'twelfth'] },
              { id: 'vs-rank', line: { speaker: 'dora', en: 'Look at the ranking table. Who has the best score?', tr: 'Sıralama tablosuna bak. En iyi skor kimde?' }, emphasis: ['ranking table', 'score'] },
            ],
            vocabRefs: [
              'v-hundred', 'v-125', 'v-250', 'v-440', 'v-500', 'v-first', 'v-second', 'v-third', 'v-fifth', 'v-ninth', 'v-twelfth',
              'v-twentieth', 'v-21st', 'v-fortieth', 'v-fiftieth', 'v-place', 'v-ranking', 'v-score', 'v-row', 'v-floor', 'v-page',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-250', 'v-440', 'v-first', 'v-fifth', 'v-twentieth', 'v-floor', 'v-ranking'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-books', line: { speaker: 'sasha', en: 'The library has two hundred and fifty story books.', tr: 'Kütüphanede iki yüz elli hikâye kitabı var.' }, gate: 'st-q-books' },
              { id: 'ps-room', line: { speaker: 'sasha', en: 'Room two hundred and five is on the second floor.', tr: '205 numaralı oda ikinci katta.' }, gate: 'st-q-room' },
              { id: 'ps-table', line: { speaker: 'dora', en: 'Look at the table! It has places and points.', tr: 'Tabloya bak! Sıralar ve puanlar var.' } },
              { id: 'ps-first', line: { speaker: 'narrator', en: 'Mr Aydın says: “You are first in the province!”', tr: 'Mr Aydın: “İlde birincisin!”' }, emphasis: ['first'], gate: 'st-q-place' },
              { id: 'ps-trophy', line: { speaker: 'momo', en: 'And the trophy is on the bench. It is so shiny!', tr: 'Kupa da bankta. Çok parlak!' } },
              { id: 'ps-rules', line: { speaker: 'sasha', en: 'Ten points for a right answer. Five hundred is the top score!', tr: 'Doğru cevaba on puan. Beş yüz en yüksek skor!' } },
            ],
            choice: {
              prompt: 'Which card do you pick first?',
              options: [
                { text: 'A date card: the 23rd of April.', feedback: 'Güzel seçim! 23 Nisan için “the twenty-third of April” dersin.' },
                { text: 'A page card: page 125.', feedback: 'Güzel seçim! Sayfa 125: “page one hundred and twenty-five”.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-hundred',
                target: 'sign-hundred',
                hint: { fine: 'Yüzlükten sonra küçük sayı gelirse araya and girer. Hundred -s almaz.', big: 'one hundred and twenty-five: yüz, and, yirmi beş. Two hundred, never two hundreds.' },
                stepRef: 'ex-and',
              },
              {
                id: 'g-ordinal',
                target: 'sign-ordinal',
                hint: { fine: 'Sıra sayıları çoğunlukla -th alır. Birinci, ikinci, üçüncü özel kelimeler.', big: 'first, second, third. Beş, dokuz, on iki: fifth, ninth, twelfth.' },
                joke: { tr: 'Fifth’te “v” kayboluyor. “Five”ın v’si sıra sayısına geçince f’ye dönüşüyor: yani tembel harf.' },
                stepRef: 'ex-ordinal-basic',
              },
              {
                id: 'g-date',
                target: 'sign-date',
                hint: { fine: 'Tarih söylerken sıra sayısı kullanırız.', big: 'the 29th of October = the twenty-ninth of October.' },
                stepRef: 'ex-dates',
              },
            ],
            goNoGo: {
              rule: { tr: 'Sıra sayısı (first, second, 29th…) görürsen dokun. Miktar sayısı (one, two hundred, 250…) görürsen dokunma!', tapIf: 'ordinal' },
              warmup: [
                { id: 'w-third', text: 'third', tap: true, why: 'Üçüncü: sıra sayısı' },
                { id: 'w-200', text: 'two hundred', tap: false, why: 'İki yüz: miktar sayısı' },
                { id: 'w-fifth', text: 'fifth', tap: true, why: 'Beşinci: sıra sayısı' },
                { id: 'w-forty', text: 'forty', tap: false, why: 'Kırk: miktar sayısı' },
              ],
              round: [
                { id: 'r-first', text: 'first', tap: true, why: 'Birinci: sıra sayısı' },
                { id: 'r-500', text: 'five hundred', tap: false, why: 'Beş yüz: miktar' },
                { id: 'r-twelfth', text: 'twelfth', tap: true, why: 'On ikinci: sıra sayısı' },
                { id: 'r-125', text: 'one hundred and twenty-five', tap: false, why: 'Yüz yirmi beş: miktar' },
                { id: 'r-29th', text: 'the 29th', tap: true, why: '29.: sıra sayısı' },
                { id: 'r-250', text: '250', tap: false, why: '250: miktar' },
                { id: 'r-twentieth', text: 'twentieth', tap: true, why: 'Yirminci: sıra sayısı' },
                { id: 'r-two', text: 'two', tap: false, why: 'İki: miktar' },
                { id: 'r-ninth', text: 'ninth', tap: true, why: 'Dokuzuncu: sıra sayısı' },
                { id: 'r-440', text: 'four hundred and forty', tap: false, why: 'Dört yüz kırk: miktar' },
              ],
              onWrongTap: { anim: 'candy-pop', line: 'Pop! Bu sefer sayı sıra değil, miktar söylüyordu.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'library-shelf', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'page-card', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'ranking-table', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-6-complete', sceneObject: 'line-board' },
              { ref: 'hw-9-order', sceneObject: 'school-map', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-10-order', sceneObject: 'trophy' },
            ],
            hint: { fine: 'Kaç tane mi, kaçıncı mı? Önce soruyu düşün: miktar için hundred, sıra için first, second…' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-300', 'as-245', 'as-spell-440', 'as-250', 'as-first-place', 'as-22nd',
              'as-ninth', 'as-twelfth', 'as-floor', 'as-date', 'as-order-trophy', 'as-fiftieth',
            ],
            hintBudget: 0,
            explain: false,
          },
        },
      },
      extras: [
        {
          template: 'imagine',
          slots: {
            activity: 'scene',
            frame: 'In my number game, the ___ player has ___ points and gets the ___.',
            chips: [
              { id: 'c-first', en: 'first', tr: 'birinci', kind: 'adj' },
              { id: 'c-second', en: 'second', tr: 'ikinci', kind: 'adj' },
              { id: 'c-third', en: 'third', tr: 'üçüncü', kind: 'adj' },
              { id: 'c-100', en: 'one hundred', tr: 'yüz', kind: 'noun' },
              { id: 'c-250', en: 'two hundred and fifty', tr: 'iki yüz elli', kind: 'noun' },
              { id: 'c-440', en: 'four hundred and forty', tr: 'dört yüz kırk', kind: 'noun' },
              { id: 'c-500', en: 'five hundred', tr: 'beş yüz', kind: 'noun' },
              { id: 'c-trophy', en: 'trophy', tr: 'kupa', kind: 'noun' },
              { id: 'c-library', en: 'library', tr: 'kütüphane', kind: 'place' },
              { id: 'c-gym', en: 'gym', tr: 'spor salonu', kind: 'place' },
            ],
            collection: { title: 'Sayı Oyunu Kartlarım' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      '100–500 arası sayıları (British “and” ile: one hundred and twenty-five; forty yazımı) ve 1st–50th sıra sayılarını söyleme/yazma; sayfa, oda, kat, tarih ve sıralamada kullanma. Kaç tane? (cardinal) ile kaçıncı? (ordinal) ayrımı. Proje: sayılarla bir oyun tasarlama.',
    vocabulary: [
      'one hundred', 'one hundred and twenty-five', 'two hundred and fifty', 'four hundred and forty', 'five hundred',
      'first', 'second', 'third', 'fifth', 'ninth', 'twelfth', 'twentieth', 'twenty-first', 'fortieth', 'fiftieth',
      'first place', 'ranking table', 'score', 'row', 'floor', 'page',
    ],
    grammar: [
      'Cardinal numbers 100–500: hundred -s almaz; hundred and + 1–99',
      'Ordinal numbers 1st–50th: first, second, third, -th, fifth, ninth, twelfth, -ieth',
      'Tarih: the 29th of October',
      'Cardinal (how many?) ile ordinal (which one?)',
    ],
    expectedDifficulties: [
      'Türkçede “yüz” ile “iki yüz” arasında -s yoktur; “two hundreds” demek yaygın bir hatadır.',
      '“and” kuralı Türkçede yok; “one hundred twenty-five” (and’siz) çocuklara doğal gelir. Amerikan kullanımında kabul edilir; derste İngiliz “and” hedeflenir ama and’siz de anlamlıdır.',
      'forty yazımı: fourteen’deki u, forty’ye taşınır (“fourty”).',
      'Sıra sayısında düzensizler: fifth (five), ninth (nine), twelfth (twelve); third’ü “threeth” yapmak.',
      'Bileşik sıra sayısında her kelimeye -th eklemek (“twenty-firstth”, “twentieth-first”).',
      'Tarihte “the 29th of October” yerine “29 October” ya da “October 29” demek; Türkçedeki “29 Ekim” alışkanlığı.',
      'Floor numaralandırması: İngiliz “first floor” zemin üstü kattır; Türkçedeki “zemin kat” = ground floor.',
    ],
    commonErrors: [
      { error: 'I have two hundreds stickers.', correction: 'I have two hundred stickers. Hundred -s almaz.' },
      { error: 'one hundred twenty-five (British derste)', correction: 'one hundred and twenty-five. Araya and gelir.' },
      { error: 'fourty', correction: 'forty (u yok). 40th = fortieth.' },
      { error: 'I am threeth.', correction: 'I am third. 1st first, 2nd second, 3rd third özel kelimelerdir.' },
      { error: 'the twenty-firstth of June', correction: 'the twenty-first of June. Yalnız son kelime sıra sayısı olur.' },
      { error: 'Republic Day is on 29 October.', correction: 'Republic Day is on the 29th of October. Tarihte sıra sayısı.' },
    ],
    questionsToAsk: [
      'How many story books does our class library have? (kurgusal sayı ver: two hundred and fifty)',
      'Which floor is the science lab on? What is its room number?',
      'What is the date of Republic Day? And Teachers’ Day?',
      'Who is first in the ranking table? How many points does she have?',
    ],
    speakingPrompts: [
      'Number game: “Card forty-five. It is the forty-fifth page.”',
      'Dates: “Republic Day is on the twenty-ninth of October.”',
      'Floors: “The library is on the first floor. Room 205 is on the second floor.”',
      'Ranking: “You are first with four hundred and eighty points. Dora is second.”',
      'My game: “The first player has ten points. Five hundred is the top score.”',
    ],
    rolePlay: {
      situation: 'Spor salonundaki sıralama tablosu: Mr Aydın ve Dora, öğrencinin il birinciliğini kutlayıp tabloyu birlikte okur.',
      roles: ['Mr Aydın (antrenör)', 'Dora (arkadaş)', 'Öğrenci (you, tenisçi)'],
      steps: [
        'Dora sorar: “Who is first in the ranking table?” Öğrenci tabloya bakıp “I am first!” der (gerçek ya da hayali).',
        'Mr Aydın sorar: “How many points do you have?” Cevap: “I have four hundred and eighty points.”',
        'Dora tabloyu okur: “Second place: four hundred and sixty-five points. Third place: four hundred and thirty.”',
        'Roller değişir; öğrenci Mr Aydın olur ve üç sıra ile puanı yüksek sesle okur.',
      ],
    },
    listening: {
      script:
        'It is Thursday. Sasha is in the school library. The library has two hundred and fifty story books. Sasha reads a number card: one hundred and twenty-five. Then she asks Piko, “Which floor is the library on?” Piko answers, “The first floor. It is Room one hundred and four.” In the gym, Mr Aydın reads the ranking table. The first player has four hundred and eighty points. The second player has four hundred and sixty-five points. The third player has four hundred and thirty points. Today is the twenty-ninth of October. It is Republic Day, and the whole school is happy.',
      questions: [
        'How many story books does the library have? (250)',
        'What number is on the card? (125)',
        'Which floor is the library on? (the first floor)',
        'How many points does the second player have? (465)',
        'What is the date today? (the 29th of October, Republic Day)',
      ],
    },
    reinforcement: [
      'Sayı kartları: 100–500 arası kartı öğrenci çevirir, öğretmen “and” ile okur; öğrenci yazılışını tahtaya yazar (forty’yi özellikle yazdır).',
      'Sıra çizgisi: öğrenci sınıf eşyalarını 1.–20. sıraya dizip “The pencil case is fifth.” der.',
      'Sayıyı kelimeye çevir: öğretmen 245, 312, 440 söyler; öğrenci “two hundred and forty-five” gibi yazar.',
    ],
    suggestedActivities: [
      'Sayı Bingo: 5x5 tablo, öğretmen 100–500 arası sayıları okur; öğrenci kelimeyle okur ve işaretler.',
      'Takvim oyunu: öğrenci üç millî günün tarihini “the 23rd of April” biçiminde söyler.',
      'Okul kat haritası: oda numaralarından kat bulma (Room 205 → second floor).',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma: “How many students are in the class?” (kurgusal ya da gerçek; sayıyı İngilizce söyle).',
        'Isınma: öğretmen 100, 200, 300 sayar; öğrenci devam eder (400, 500).',
        'Isınma: “What is the date today?” (the 29th of October gibi örnek cümleyle).',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları: one hundred and twenty-five, two hundred and fifty, four hundred and forty; öğrenci hem rakamı hem kelimeyi söyler.',
        'Sıra sayısı zinciri: first, second, third … twelfth; öğrenci düzensizleri (fifth, ninth, twelfth) tahtada işaretler.',
        'Floor, page, row, place, score kelimeleriyle “The library is on the first floor.” cümleleri.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen bir miktar söyler (340), öğrenci “three hundred and forty” der.',
        'Tur 2: öğretmen bir sıra söyler (23rd), öğrenci “twenty-third” der.',
        'Tur 3: Kaç tane mi, kaçıncı mı? Öğretmen soru sorar (“How many points?” / “Which floor?”), öğrenci doğru sayı türüyle cevap verir.',
        'Tarih tur: “Republic Day is on the twenty-ninth of October.” “Youth and Sports Day is on the nineteenth of May.”',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Spor salonu rol oyunu: Mr Aydın, Dora ve öğrenci sıralama tablosunu okur.',
        'Beklenen cümleler: “You are first in the province!” “You have four hundred and eighty points.” “Dora is second.”',
        'Öğretmen notu: Rol oyunu sırasında düzeltme yapma; sonunda üç cümleyi birlikte düzelt.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'It is Thursday. Sasha is in the school library. The library has two hundred and fifty story books. Sasha reads a number card: one hundred and twenty-five. Then she asks Piko, “Which floor is the library on?” Piko answers, “The first floor. It is Room one hundred and four.” In the gym, Mr Aydın reads the ranking table. The first player has four hundred and eighty points. The second player has four hundred and sixty-five points. The third player has four hundred and thirty points. Today is the twenty-ninth of October. It is Republic Day, and the whole school is happy.',
      activities: [
        'Metni iki kez oku; ilkinde yalnız dinlesin, ikincisinde sayıları not alsın.',
        'Sorular: How many books? What number is on the card? Which floor? How many points does the second player have? What is the date?',
        'Öğrenci üç sayıyı (250, 125, 465) kelimeyle yazar.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık hatasını (two hundreds, fourty, threeth, and’siz yüzlük) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa beklenen zorluklar: hundred -s almaz, forty yazımı, fifth / ninth / twelfth, tarihte sıra sayısı.',
        'Yanlışta nazikçe “Yaklaştın!” de; sayıyı birlikte tahtada kelimeye çevir.',
      ],
    },
    freeSpeaking: {
      minutes: 9,
      activities: [
        'Konu 1: Okul kütüphanesinde kaç kitap var? (hayal edebilirsin) “The library has … books.”',
        'Konu 2: Okulunun katları: “The … is on the … floor.” (oda adı sorulmaz, genel yer adı yeter)',
        'Konu 3: Üç millî günün tarihini söyle.',
        'Konu 4: Sıralama tablosu hayal et: “The first player has … points.”',
        'Konu 5: Kendi sayı oyununu anlat (aşağıdaki kapanış görevine hazırlık).',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı sorma; cevaplar gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Kitap projesi “A Game with Numbers”: Öğrenci 100–500 arası sayılar ve sıra sayılarıyla kendi sayı oyununu tasarlar (kartlar, puanlar, sıralama). İngilizce 5 cümlelik kural yazar ya da sesli kaydeder: “Pick a card. The first player reads the number. A right answer is ten points. Five hundred is the top score. The winner gets the trophy.” Kendi oyun kartlarından üç sayıyı kelimeyle yazar.',
    },
  },
}
export default lesson
