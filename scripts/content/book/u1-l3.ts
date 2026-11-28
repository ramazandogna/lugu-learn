/** Ünite 1.3 — School Tour: There is / There are (+ Is there…? / Are there…?) and WH- questions with be. Theme u4-school-bell, host momo. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.3 — School Tour',
  sourceNotes:
    'Kitap Ünite 1 (School Life): There is / There are, Is there / Are there soruları ve kısa cevaplar; What, Where, When, Who, Why, How soruları (yalnız be ile). Kelimeler: okul yerleri (library, canteen, gym, science lab, art room, principal’s office, nurse’s room, school garden) ve yer tarifi (next to, on the first floor). Kültür: farklı okul türleri (yatılı, köy, spor, online). Present simple ve progressive kullanılmadı.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Momo’s Big School Tour',
      tagline: 'Momo okul turunda rehber! Haritaya bak, “There is…” ile yerleri bul, “Where? When? Who?” ile sorular sor.',
      theme: 'School life',
      character: 'momo',
      level: 'A1',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u1l3-places', text: 'Okul yerlerini (kütüphane, kantin, spor salonu, fen laboratuvarı…) ve yer tarifi kalıplarını söyler.' },
        { id: 'u1l3-there', text: 'There is / There are ile okulda neler olduğunu anlatır; There isn’t / There aren’t ile olmayanı söyler.' },
        { id: 'u1l3-yesno', text: '“Is there…? / Are there…?” sorularını sorar ve “Yes, there is. / No, there aren’t.” diye cevaplar.' },
        { id: 'u1l3-wh', text: 'What, Where, When, Who, Why ve How ile be fiilli sorular sorar ve cevaplar.' },
        { id: 'u1l3-schools', text: 'Yatılı, köy, spor ve online okul gibi farklı okul türlerini kısa bir metinden anlar.' },
      ],
      grammar: [
        'There is + tekil / There are + çoğul; There isn’t / There aren’t',
        'Is there…? / Are there…? Yes, there is. / No, there aren’t.',
        'What, Where, When, Who, Why, How + be',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-be', type: 'choice', prompt: 'Leo whispers to Momo in the library: “___ quiet, please.”', options: ['Is', 'Be', 'Are'], answer: 1, hint: 'Emirde am / is / are kullanılmaz; fiil yalın hâlini alır.', explain: 'Emirde **Be** kullanırız: Be quiet, please.' },
        { id: 'rv-an', type: 'choice', prompt: 'Momo shows a door and says: “This is ___ art room.”', options: ['a', 'an', 'the'], answer: 1, hint: 'Art kelimesi hangi sesle başlıyor?', explain: 'Sesli harfle başlayan kelimeden önce **an** gelir: an art room.' },
        { id: 'rv-the', type: 'choice', prompt: 'Sasha says: “___ principal is Mrs Demir.” There is only one principal.', options: ['A', 'The', 'An'], answer: 1, hint: 'Okulda tek bir müdür var. Hangisi olduğunu herkes biliyor.', explain: 'Herkesin bildiği tek kişi için **the** deriz: The principal.' },
        { id: 'rv-imp', type: 'choice', prompt: 'Mrs Demir says to the students in the corridor: “___ run, please.”', options: ['Doesn’t', 'Not', 'Don’t'], answer: 2, hint: 'Yasak koyan emir cümlesi: Don’t + fiil.', explain: 'Yasak için **Don’t** + fiil: Don’t run.' },
      ],
    },
    vocabulary: [
      { id: 'v-library', en: 'library', tr: 'kütüphane', example: { en: 'The library is on the first floor.', tr: 'Kütüphane birinci katta.' }, difficulty: 1, objectiveId: 'u1l3-places' },
      { id: 'v-canteen', en: 'canteen', tr: 'kantin', example: { en: 'There is toast in the canteen.', tr: 'Kantinde tost var.' }, difficulty: 1, objectiveId: 'u1l3-places' },
      { id: 'v-gym', en: 'gym', tr: 'spor salonu', example: { en: 'There is a big court in the gym.', tr: 'Spor salonunda büyük bir saha var.' }, difficulty: 1, objectiveId: 'u1l3-places' },
      { id: 'v-science-lab', en: 'science lab', tr: 'fen laboratuvarı', example: { en: 'The science lab is next to the library.', tr: 'Fen laboratuvarı kütüphanenin yanında.' }, difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-art-room', en: 'art room', tr: 'resim atölyesi', example: { en: 'There are ten easels in the art room.', tr: 'Resim atölyesinde on tane şövale var.' }, context: 'Resim dersinin yapıldığı oda.', difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-principal-office', en: 'principal’s office', tr: 'müdür odası', example: { en: 'Mrs Demir is in the principal’s office.', tr: 'Mrs Demir müdür odasında.' }, difficulty: 3, objectiveId: 'u1l3-places' },
      { id: 'v-nurse-room', en: 'nurse’s room', tr: 'revir', example: { en: 'The nurse’s room is next to the stairs.', tr: 'Revir merdivenlerin yanında.' }, context: 'Hasta ya da yaralı öğrencinin gittiği oda.', difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-school-garden', en: 'school garden', tr: 'okul bahçesi', example: { en: 'There are five benches in the school garden.', tr: 'Okul bahçesinde beş bank var.' }, difficulty: 1, objectiveId: 'u1l3-places' },
      { id: 'v-corridor', en: 'corridor', tr: 'koridor', example: { en: 'There are three doors in the corridor.', tr: 'Koridorda üç kapı var.' }, difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-stairs', en: 'stairs', tr: 'merdiven', example: { en: 'The stairs are next to the canteen.', tr: 'Merdiven kantinin yanında.' }, context: 'Stairs hep çoğul gelir: The stairs are…', difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-notice-board', en: 'notice board', tr: 'duyuru panosu', example: { en: 'There is a poster on the notice board.', tr: 'Duyuru panosunda bir afiş var.' }, difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-computer-room', en: 'computer room', tr: 'bilgisayar odası', example: { en: 'There are twelve computers in the computer room.', tr: 'Bilgisayar odasında on iki bilgisayar var.' }, difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-map', en: 'school map', tr: 'okul haritası', example: { en: 'Look at the school map, please.', tr: 'Lütfen okul haritasına bak.' }, difficulty: 1, objectiveId: 'u1l3-places' },
      { id: 'v-next-to', en: 'next to', tr: 'yanında', example: { en: 'The gym is next to the canteen.', tr: 'Spor salonu kantinin yanında.' }, context: 'Bir yerin nerede olduğunu tarif ederken kullanırsın.', difficulty: 2, objectiveId: 'u1l3-places' },
      { id: 'v-first-floor', en: 'on the first floor', tr: 'birinci katta', example: { en: 'The art room is on the first floor.', tr: 'Resim atölyesi birinci katta.' }, difficulty: 3, objectiveId: 'u1l3-places' },
      { id: 'v-boarding', en: 'boarding school', tr: 'yatılı okul', example: { en: 'There is a dormitory in a boarding school.', tr: 'Yatılı okulda yurt var.' }, context: 'Öğrencilerin okulda kaldığı okul türü.', difficulty: 3, objectiveId: 'u1l3-schools' },
      { id: 'v-village', en: 'village school', tr: 'köy okulu', example: { en: 'A village school is small.', tr: 'Köy okulu küçüktür.' }, difficulty: 2, objectiveId: 'u1l3-schools' },
      { id: 'v-sports-school', en: 'sports school', tr: 'spor okulu', example: { en: 'There are many courts in a sports school.', tr: 'Spor okulunda çok sayıda saha var.' }, difficulty: 2, objectiveId: 'u1l3-schools' },
      { id: 'v-online', en: 'online school', tr: 'çevrim içi okul', example: { en: 'An online school is on a screen.', tr: 'Çevrim içi okul ekranda.' }, difficulty: 3, objectiveId: 'u1l3-schools' },
      { id: 'v-dormitory', en: 'dormitory', tr: 'yurt', example: { en: 'There are twenty beds in the dormitory.', tr: 'Yurtta yirmi yatak var.' }, difficulty: 3, objectiveId: 'u1l3-schools' },
    ],
    story: {
      title: 'Momo’s Big School Tour',
      character: 'momo',
      setting: 'A school tour: garden, library, science lab, canteen, gym and corridor',
      scenes: [
        {
          id: 'sc-garden',
          illustration: 'Momo in a funny hat holds a big paper map in the school garden; Piko looks at the school building behind the gate.',
          lines: [
            { speaker: 'narrator', en: 'Today is the school tour. Momo is the guide.', tr: 'Bugün okul turu var. Rehber Momo.' },
            { speaker: 'momo', en: 'Hello, tourists! This is our school map.', tr: 'Merhaba turistler! Bu bizim okul haritamız.' },
            { speaker: 'piko', en: 'Wow! The school is big. Where is the library?', tr: 'Vay! Okul çok büyük. Kütüphane nerede?' },
            { speaker: 'momo', en: 'It is on the first floor, next to the science lab.', tr: 'Birinci katta, fen laboratuvarının yanında.' },
            { speaker: 'narrator', en: 'There is a school garden next to the gate. There are five benches in it.', tr: 'Kapının yanında bir okul bahçesi var. İçinde beş bank var.' },
          ],
        },
        {
          id: 'sc-library',
          illustration: 'A quiet library with tall shelves and two computers; Sasha waves from the open door of the science lab next door.',
          lines: [
            { speaker: 'narrator', en: 'The library is quiet. There are many books on the shelves.', tr: 'Kütüphane sessiz. Rafta çok kitap var.' },
            { speaker: 'dora', en: 'Is there a computer in the library?', tr: 'Kütüphanede bilgisayar var mı?' },
            { speaker: 'momo', en: 'Yes, there is. There are two computers.', tr: 'Evet, var. İki bilgisayar var.' },
            { speaker: 'piko', en: 'Who is in the science lab?', tr: 'Fen laboratuvarında kim var?' },
            { speaker: 'sasha', en: 'I am! There are six big tables and a new screen here.', tr: 'Ben! Burada altı büyük masa ve yeni bir ekran var.' },
          ],
        },
        {
          id: 'sc-canteen',
          illustration: 'A busy canteen with a toast counter and many students; a clock on the wall shows ten past ten.',
          lines: [
            { speaker: 'narrator', en: 'It is break time. The canteen is noisy.', tr: 'Teneffüs zamanı. Kantin gürültülü.' },
            { speaker: 'leo', en: 'When is break time, Momo?', tr: 'Teneffüs ne zaman, Momo?' },
            { speaker: 'momo', en: 'It is at ten past ten. Now!', tr: 'Ona on geçe. Şimdi!' },
            { speaker: 'piko', en: 'Why is the canteen so noisy?', tr: 'Kantin neden bu kadar gürültülü?' },
            { speaker: 'momo', en: 'Because there are many hungry students here!', tr: 'Çünkü burada çok sayıda aç öğrenci var!' },
            { speaker: 'dora', en: 'Is there a net in the gym? Is it big?', tr: 'Spor salonunda file var mı? Büyük mü?' },
          ],
          choice: {
            prompt: 'Break time is at ten past ten. Where should the group go first?',
            options: [
              { text: 'Go to the canteen.', feedback: 'Güzel seçim! Teneffüste kantin kalabalık ama tost sıcak.' },
              { text: 'Go to the gym.', feedback: 'Güzel seçim! Spor salonu geniş ve açık. Kantine sonra gidersiniz.' },
            ],
          },
        },
        {
          id: 'sc-office',
          illustration: 'A corridor with three doors; Momo opens the nurse’s room door by mistake and Mrs Demir waits at the principal’s office door.',
          lines: [
            { speaker: 'narrator', en: 'The group is in the corridor. There are three doors.', tr: 'Grup koridorda. Üç kapı var.' },
            { speaker: 'momo', en: 'Oops! Is this the principal’s office?', tr: 'Hoppala! Burası müdür odası mı?' },
            { speaker: 'piko', en: 'No, it isn’t! Look, it is the nurse’s room.', tr: 'Hayır, değil! Bak, burası revir.' },
            { speaker: 'narrator', en: 'Mrs Demir is at the next door. She says: “Welcome! How is the tour?”', tr: 'Mrs Demir yandaki kapıda. “Hoş geldiniz! Tur nasıl?” diyor.' },
            { speaker: 'momo', en: 'It is great, Mrs Demir! But I am lost!', tr: 'Harika Mrs Demir! Ama ben kayboldum!' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-lib', type: 'choice', prompt: 'Piko asks Momo: “Where is the library?” What is Momo’s answer?', options: ['In the school garden.', 'Next to the canteen.', 'On the first floor.'], answer: 2, hint: 'Momo haritaya bakıyor. Kütüphane kaçıncı katta?', explain: 'Momo: “It is **on the first floor**, next to the science lab.”', objectiveId: 'u1l3-wh', vocabId: 'v-first-floor' },
        { id: 'st-q-computer', type: 'choice', prompt: 'Dora asks: “Is there a computer in the library?” Is there one?', options: ['Yes, there is.', 'No, there isn’t.', 'Yes, there are.'], answer: 0, hint: 'Momo “two computers” diyor.', explain: 'Momo: “Yes, there is. There are two computers.”', objectiveId: 'u1l3-yesno', vocabId: 'v-library' },
        { id: 'st-q-why', type: 'choice', prompt: 'Piko asks: “Why is the canteen so noisy?” Momo answers:', options: ['Because the gym is closed.', 'Because there are many hungry students.', 'Because the library is quiet.'], answer: 1, hint: 'Kantinde teneffüs zamanı kimler var?', explain: '**Why** sorusuna **Because** ile cevap verilir.', objectiveId: 'u1l3-wh', vocabId: 'v-canteen' },
        { id: 'st-q-order', type: 'order', prompt: 'Momo shows the library shelves. Put her words in order.', tokens: ['on', 'There', 'books', 'many', 'are', 'the', 'shelves.'], answer: ['There', 'are', 'many', 'books', 'on', 'the', 'shelves.'], hint: 'Çoğul bir şey var: There ___ …', explain: 'Çoğul için **There are**: There are many books on the shelves.', objectiveId: 'u1l3-there' },
        { id: 'st-q-who', type: 'text', prompt: 'Piko asks Momo: “___ is the principal?” Mrs Demir is the principal. Type the question word.', accept: ['Who'], hint: 'Kişi sorarken hangi soru kelimesi kullanılır?', explain: 'Kişiyi sorarken **Who** deriz: Who is the principal?', objectiveId: 'u1l3-wh', vocabId: 'v-principal-office' },
        { id: 'st-q-nurse', type: 'choice', prompt: 'Momo opens the wrong door in the corridor. What room is it?', options: ['The principal’s office', 'The art room', 'The nurse’s room'], answer: 2, hint: 'Piko “Look, it is the …” diyor.', explain: 'Piko: “No, it isn’t! It is the **nurse’s room**.”', objectiveId: 'u1l3-places', vocabId: 'v-nurse-room' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-there-is',
          title: 'Okulda ne var? There is',
          body: 'Bir yerde **tek bir şey** olduğunu söylemek için **There is** dersin. Şimdi haritaya bak: kütüphane tek, bahçe tek. “…var” demenin yolu bu: **There is a …**.',
          examples: [
            { en: 'There is a library.', tr: 'Bir kütüphane var.' },
            { en: 'There is a garden next to the gate.', tr: 'Kapının yanında bir bahçe var.' },
            { en: 'There is an art room.', tr: 'Bir resim atölyesi var.' },
          ],
          check: { id: 'ex-check-is', type: 'choice', prompt: 'Momo points at one clock on the wall: “There ___ a clock in the classroom.”', options: ['are', 'is', 'be'], answer: 1, hint: 'Tek bir saat var.', explain: 'Tek şey için **There is**: There is a clock.', objectiveId: 'u1l3-there', vocabId: 'v-map' },
        },
        {
          id: 'ex-there-are',
          title: 'Birden fazlaysa: There are',
          body: 'Bir yerde **birden fazla** şey varsa **There are** dersin. Sayıyı söyleyebilirsin: two, five, ten. Ya da **many** (çok) diyebilirsin.',
          examples: [
            { en: 'There are five benches.', tr: 'Beş bank var.' },
            { en: 'There are many books.', tr: 'Çok kitap var.' },
            { en: 'There are three doors.', tr: 'Üç kapı var.' },
          ],
          check: { id: 'ex-check-are', type: 'choice', prompt: 'Sasha counts the tables in the art room: “There ___ four tables.”', options: ['is', 'be', 'are'], answer: 2, hint: 'Dört masa: birden fazla.', explain: 'Çoğul için **There are**: There are four tables.', objectiveId: 'u1l3-there', vocabId: 'v-art-room' },
        },
        {
          id: 'ex-negative',
          title: 'Yoksa: isn’t ve aren’t',
          body: 'Bir şey yoksa **There isn’t a …** (tek) ya da **There aren’t …** (çoğul) dersin. “Not” kelimesi kapıcıya yapışır: is + not = **isn’t**, are + not = **aren’t**.',
          examples: [
            { en: 'There isn’t a pool in our school.', tr: 'Okulumuzda havuz yok.' },
            { en: 'There aren’t two gyms.', tr: 'İki spor salonu yok.' },
            { en: 'There isn’t a lift.', tr: 'Asansör yok.' },
          ],
          check: { id: 'ex-check-neg', type: 'choice', prompt: 'Piko looks for a swimming pool, but there is no pool. “There ___ a pool.”', options: ['is', 'isn’t', 'aren’t'], answer: 1, hint: 'Havuz yok ve tek bir havuzdan söz ediliyor.', explain: 'Tek ve yok: **There isn’t** a pool.', objectiveId: 'u1l3-there' },
        },
        {
          id: 'ex-question',
          title: 'Soru: Is there…? Are there…?',
          body: 'Soru için kapıcı öne geçer: **Is there** a …? / **Are there** …? Kısa cevap: **Yes, there is.** / **No, there isn’t.** Çoğulda: **Yes, there are.** / **No, there aren’t.**',
          examples: [
            { en: 'Is there a canteen? — Yes, there is.', tr: 'Kantin var mı? — Evet, var.' },
            { en: 'Are there computers? — Yes, there are.', tr: 'Bilgisayarlar var mı? — Evet, var.' },
            { en: 'Is there a pool? — No, there isn’t.', tr: 'Havuz var mı? — Hayır, yok.' },
          ],
          check: { id: 'ex-check-question', type: 'choice', prompt: 'Leo asks Momo about the school garden: “___ there a bench?”', options: ['Is', 'Are', 'Am'], answer: 0, hint: 'Tek bir bank soruluyor.', explain: 'Tek şey için **Is there** a bench?', objectiveId: 'u1l3-yesno', vocabId: 'v-school-garden' },
        },
        {
          id: 'ex-where-what',
          title: 'What ve Where',
          body: '**What** “ne?” demek. **Where** “nerede?” demek. İkisi de be ile gelir: **What is** this? **Where is** the gym? Cevapta yer için **next to** ve **on the first floor** kullan.',
          examples: [
            { en: 'What is this? — It is the notice board.', tr: 'Bu ne? — Duyuru panosu.' },
            { en: 'Where is the gym? — It is next to the canteen.', tr: 'Spor salonu nerede? — Kantinin yanında.' },
            { en: 'Where are the stairs?', tr: 'Merdivenler nerede?' },
          ],
          check: { id: 'ex-check-where', type: 'choice', prompt: 'Dora asks Momo: “___ is the gym?” Momo: “It is next to the canteen.”', options: ['When', 'Where', 'Who'], answer: 1, hint: 'Cevap bir yer söylüyor: next to the canteen.', explain: 'Yer sorarken **Where** deriz: Where is the gym?', objectiveId: 'u1l3-wh', vocabId: 'v-gym' },
        },
        {
          id: 'ex-when-who',
          title: 'When ve Who',
          body: '**When** “ne zaman?” demek, cevabı saat ya da gün. **Who** “kim?” demek, cevabı kişi. Bunlar da be ile gelir: **When is** break time? **Who is** the principal?',
          examples: [
            { en: 'When is break time? — It is at ten past ten.', tr: 'Teneffüs ne zaman? — Ona on geçe.' },
            { en: 'Who is the PE teacher? — It is Mr Aydın.', tr: 'Beden eğitimi öğretmeni kim? — Mr Aydın.' },
            { en: 'When is the art lesson? — It is on Friday.', tr: 'Resim dersi ne zaman? — Cuma günü.' },
          ],
          check: { id: 'ex-check-who', type: 'choice', prompt: 'Sasha asks about Mr Aydın: “___ is the PE teacher?” Momo: “It is Mr Aydın.”', options: ['When', 'What', 'Who'], answer: 2, hint: 'Cevap bir kişi: Mr Aydın.', explain: 'Kişiyi sorarken **Who** deriz.', objectiveId: 'u1l3-wh' },
        },
        {
          id: 'ex-why-how',
          title: 'Why ve How',
          body: '**Why** “neden?” demek; cevap **Because** ile başlar. **How** “nasıl?” demek: How is the tour? **How many** “kaç tane?” demek: **How many** desks **are there**?',
          examples: [
            { en: 'Why is Momo sad? — Because she is lost.', tr: 'Momo neden üzgün? — Çünkü kaybolmuş.' },
            { en: 'How is the canteen? — It is noisy!', tr: 'Kantin nasıl? — Gürültülü!' },
            { en: 'How many desks are there? — There are ten.', tr: 'Kaç sıra var? — On tane var.' },
          ],
          check: { id: 'ex-check-why', type: 'choice', prompt: 'Momo is sad. Piko asks: “___ is she sad?” Leo answers: “Because she is lost.”', options: ['How', 'Who', 'Why'], answer: 2, hint: 'Cevap “Because” ile başlıyor.', explain: '**Because** ile cevaplanan soru **Why** sorusudur.', objectiveId: 'u1l3-wh' },
        },
        {
          id: 'ex-mix',
          title: 'Hangi soru kelimesi?',
          body: 'Cevaba bak, soru kelimesini bul: yer → **Where**, zaman → **When**, kişi → **Who**, neden → **Why**, nasıl → **How**, şey → **What**. Sorunun sonunda her zaman be vardır: is, are.',
          examples: [
            { en: 'It is at nine. → When is the lesson?', tr: 'Dokuzda. → Ders ne zaman?' },
            { en: 'It is in the library. → Where is Leo?', tr: 'Kütüphanede. → Leo nerede?' },
            { en: 'It is Ms Pearl. → Who is the teacher?', tr: 'Ms Pearl. → Öğretmen kim?' },
          ],
          check: { id: 'ex-check-mix', type: 'choice', prompt: 'Leo says: “It is at ten past ten.” Which question is it?', options: ['Where is break time?', 'When is break time?', 'Who is break time?'], answer: 1, hint: 'Cevap bir saat söylüyor.', explain: 'Saat ya da gün için **When** sorulur.', objectiveId: 'u1l3-wh' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u1l3-there',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Momo points at the school garden: “___ a garden next to the gate.”', options: ['There are', 'There is', 'They are'], answer: 1, hint: 'Tek bir bahçe var.', explain: 'Tek şey için **There is**: There is a garden.', objectiveId: 'u1l3-there', vocabId: 'v-school-garden' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Momo writes on the map. Build her sentence.', tokens: ['gate.', 'is', 'to', 'a', 'There', 'next', 'garden', 'the'], answer: ['There', 'is', 'a', 'garden', 'next', 'to', 'the', 'gate.'], hint: 'There is → ne var? → nerede?', explain: 'There is a garden next to the gate.', objectiveId: 'u1l3-there' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Momo says: “There is a gym.” What does it mean?', options: ['Spor salonu nerede?', 'Bir spor salonu var.', 'Spor salonu büyük.'], answer: 1, hint: 'There is = var', explain: '**There is** = var: Bir spor salonu var.', objectiveId: 'u1l3-there', vocabId: 'v-gym' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u1l3-there',
          complete: { id: 'hw-2-complete', type: 'text', prompt: 'Piko counts the benches in the school garden: “There ___ five benches.” Type the missing word.', accept: ['are'], hint: 'Beş bank: birden fazla.', explain: 'Çoğul için **There are** five benches.', objectiveId: 'u1l3-there', vocabId: 'v-school-garden' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Sasha counts in the computer room. Put her words in order.', tokens: ['computers.', 'are', 'twelve', 'There'], answer: ['There', 'are', 'twelve', 'computers.'], hint: 'There are + sayı + şey', explain: 'There are twelve computers.', objectiveId: 'u1l3-there' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Sasha says: “There are twelve computers.” What does she mean?', options: ['On iki bilgisayar var.', 'Bilgisayar nerede?', 'Bir bilgisayar var.'], answer: 0, hint: 'twelve = on iki', explain: 'twelve = on iki. On iki bilgisayar var.', objectiveId: 'u1l3-there', vocabId: 'v-computer-room' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u1l3-there',
          complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Leo looks at the school plan. There is no swimming pool. “There ___ a swimming pool.”', options: ['is', 'aren’t', 'isn’t'], answer: 2, hint: 'Havuz yok, ve tek bir havuz.', explain: 'Tek ve yok: **There isn’t** a swimming pool.', objectiveId: 'u1l3-there' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Dora checks the art room. Build her sentence.', tokens: ['in', 'a', 'There', 'the', 'isn’t', 'art', 'computer', 'room.'], answer: ['There', 'isn’t', 'a', 'computer', 'in', 'the', 'art', 'room.'], hint: 'There isn’t + a + şey', explain: 'There isn’t a computer in the art room.', objectiveId: 'u1l3-there' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Dora says: “There isn’t a pool.” What does she mean?', options: ['Havuz var.', 'Havuz yok.', 'Havuz nerede?'], answer: 1, hint: 'isn’t = yok / değil', explain: '**There isn’t** = yok: Havuz yok.', objectiveId: 'u1l3-there' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u1l3-yesno',
          complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Dora asks Momo about the school: “___ there a gym?”', options: ['Are', 'Am', 'Is'], answer: 2, hint: 'Tek bir spor salonu soruluyor.', explain: 'Tek şey için **Is there** a gym?', objectiveId: 'u1l3-yesno', vocabId: 'v-gym' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Leo asks Momo a question. Put his words in order.', tokens: ['a', 'Is', 'canteen?', 'there'], answer: ['Is', 'there', 'a', 'canteen?'], hint: 'Soru is ile başlar.', explain: 'Is there a canteen?', objectiveId: 'u1l3-yesno' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Leo asks: “Is there a canteen?” What does he ask?', options: ['Kantin var.', 'Kantin nerede?', 'Kantin var mı?'], answer: 2, hint: 'Is ile başlayan cümle soru.', explain: '**Is there** … ? = var mı?', objectiveId: 'u1l3-yesno', vocabId: 'v-canteen' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u1l3-yesno',
          complete: { id: 'hw-5-complete', type: 'text', prompt: 'Piko asks: “Are there computers in the library?” Momo says: “Yes, there ___.” Type the missing word.', accept: ['are'], hint: 'Soru çoğul: Are there…? Cevap da çoğul.', explain: 'Çoğul soruya: Yes, there **are**.', objectiveId: 'u1l3-yesno', vocabId: 'v-library' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Sasha asks about the science lab. Build her question.', tokens: ['lab?', 'tables', 'in', 'there', 'Are', 'the'], answer: ['Are', 'there', 'tables', 'in', 'the', 'lab?'], hint: 'Çoğul soru: Are there…?', explain: 'Are there tables in the lab?', objectiveId: 'u1l3-yesno' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Momo says: “No, there aren’t.” What does she mean?', options: ['Hayır, yok.', 'Evet, var.', 'Hayır, değil.'], answer: 0, hint: 'There aren’t = yok', explain: '**No, there aren’t.** = Hayır, yok.', objectiveId: 'u1l3-yesno' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u1l3-wh',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Sasha is lost in the corridor. She asks Momo: “___ is the nurse’s room?”', options: ['What', 'Where', 'Who'], answer: 1, hint: 'Sasha bir yer arıyor.', explain: 'Yer sorarken **Where** deriz.', objectiveId: 'u1l3-wh', vocabId: 'v-nurse-room' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Sasha asks again. Put her words in order.', tokens: ['room?', 'is', 'nurse’s', 'the', 'Where'], answer: ['Where', 'is', 'the', 'nurse’s', 'room?'], hint: 'Where → is → ne?', explain: 'Where is the nurse’s room?', objectiveId: 'u1l3-wh' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Momo says: “It is next to the stairs.” What does she mean?', options: ['Merdivenin yanında.', 'Merdivenin üstünde.', 'Merdiven yok.'], answer: 0, hint: 'next to = yanında', explain: 'next to = yanında.', objectiveId: 'u1l3-wh', vocabId: 'v-next-to' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u1l3-wh',
          complete: { id: 'hw-7-complete', type: 'text', prompt: 'Leo asks Ms Pearl: “___ is the English lesson?” Ms Pearl: “It is at nine.” Type the question word.', accept: ['When'], hint: 'Cevap bir saat: at nine.', explain: 'Zaman sorarken **When** deriz.', objectiveId: 'u1l3-wh' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Dora asks about the teacher in the gym. Build her question.', tokens: ['PE', 'is', 'the', 'Who', 'teacher?'], answer: ['Who', 'is', 'the', 'PE', 'teacher?'], hint: 'Kişi soruyor: Who…', explain: 'Who is the PE teacher?', objectiveId: 'u1l3-wh' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Piko asks: “When is break time?” What does he ask?', options: ['Teneffüs nerede?', 'Teneffüs ne zaman?', 'Teneffüs nasıl?'], answer: 1, hint: 'When = ne zaman', explain: '**When** = ne zaman.', objectiveId: 'u1l3-wh', vocabId: 'v-canteen' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u1l3-wh',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'The gym is closed today. Piko asks: “___ is Dora sad?” Momo: “Because the gym is closed.”', options: ['How', 'What', 'Why', 'Where'], answer: 2, hint: 'Cevap “Because” ile başlıyor.', explain: '**Because** ile cevaplanan soru: **Why**.', objectiveId: 'u1l3-wh', vocabId: 'v-gym' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Momo counts the desks. Build Piko’s question.', tokens: ['there?', 'desks', 'How', 'are', 'many'], answer: ['How', 'many', 'desks', 'are', 'there?'], hint: 'How many + çoğul isim + are there?', explain: 'How many desks are there?', objectiveId: 'u1l3-wh' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Leo asks Momo: “Why is the gym closed?” What does he ask?', options: ['Spor salonu nerede?', 'Spor salonu neden kapalı?', 'Spor salonu kaç kişilik?'], answer: 1, hint: 'Why = neden', explain: '**Why** = neden.', objectiveId: 'u1l3-wh', vocabId: 'v-gym' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u1l3-schools',
          complete: { id: 'hw-9-complete', type: 'choice', prompt: 'Ms Pearl shows a school with a dormitory: “This is a ___ school.”', options: ['online', 'village', 'boarding'], answer: 2, hint: 'Yurt var, öğrenciler okulda kalıyor.', explain: 'Yurtlu okul: **boarding school** (yatılı okul).', objectiveId: 'u1l3-schools', vocabId: 'v-boarding' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Ms Pearl writes on the board. Put the words in order.', tokens: ['in', 'dormitory', 'There', 'a', 'is', 'a', 'boarding', 'school.'], answer: ['There', 'is', 'a', 'dormitory', 'in', 'a', 'boarding', 'school.'], hint: 'There is → ne var? → nerede?', explain: 'There is a dormitory in a boarding school.', objectiveId: 'u1l3-schools' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Momo says: “It is a village school.” What does she mean?', options: ['Bu bir köy okulu.', 'Bu bir spor okulu.', 'Bu bir yatılı okul.'], answer: 0, hint: 'village = köy', explain: 'village school = köy okulu.', objectiveId: 'u1l3-schools', vocabId: 'v-village' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-courts', type: 'choice', prompt: 'Leo looks at the sports hall. It has two courts. “There ___ two courts.”', options: ['is', 'are', 'am'], answer: 1, objectiveId: 'u1l3-there' },
        { id: 'as-nurse', type: 'choice', prompt: 'Sasha reads a sign in the corridor: “There ___ a nurse’s room on this floor.”', options: ['is', 'are', 'be'], answer: 0, objectiveId: 'u1l3-there', vocabId: 'v-nurse-room' },
        { id: 'as-computer-text', type: 'text', prompt: 'Momo checks the art room. There is no computer. “There ___ a computer in the art room.” Type the missing word.', accept: ['isn’t', 'isn\'t', 'is not'], objectiveId: 'u1l3-there', vocabId: 'v-art-room' },
        { id: 'as-stairs', type: 'choice', prompt: 'Piko counts the stairs and asks: “___ there twenty stairs?”', options: ['Is', 'Are', 'Am'], answer: 1, objectiveId: 'u1l3-yesno', vocabId: 'v-stairs' },
        { id: 'as-short', type: 'choice', prompt: 'Leo asks: “Is there a canteen?” There is one. What does Momo answer?', options: ['Yes, there are.', 'No, there isn’t.', 'Yes, there is.'], answer: 2, objectiveId: 'u1l3-yesno', vocabId: 'v-canteen' },
        { id: 'as-who', type: 'choice', prompt: 'Mr Aydın is the PE teacher. Leo asks: “___ is the PE teacher?”', options: ['Where', 'Who', 'When', 'Why'], answer: 1, objectiveId: 'u1l3-wh' },
        { id: 'as-when', type: 'choice', prompt: 'Mrs Demir asks: “___ is the school bell?” Momo: “It is at 8.30.”', options: ['Where', 'What', 'Who', 'When'], answer: 3, objectiveId: 'u1l3-wh' },
        { id: 'as-order-art', type: 'order', prompt: 'Dora is lost. Make her question.', tokens: ['art', 'is', 'room?', 'the', 'Where'], answer: ['Where', 'is', 'the', 'art', 'room?'], objectiveId: 'u1l3-wh', vocabId: 'v-art-room' },
        { id: 'as-order-lab', type: 'order', prompt: 'Sasha asks Momo about the science lab. Make her question.', tokens: ['computers', 'Are', 'lab?', 'in', 'there', 'the'], answer: ['Are', 'there', 'computers', 'in', 'the', 'lab?'], objectiveId: 'u1l3-yesno', vocabId: 'v-science-lab' },
        { id: 'as-meaning', type: 'choice', prompt: 'Dora says: “There isn’t a pool in our school.” What does she mean?', options: ['Okulumuzda havuz var.', 'Havuz nerede?', 'Okulumuzda havuz yok.'], answer: 2, objectiveId: 'u1l3-there' },
        { id: 'as-online', type: 'choice', prompt: 'Ms Pearl shows a school on a screen. There is no building, only a teacher and students online. What is it?', options: ['A boarding school', 'An online school', 'A village school', 'A sports school'], answer: 1, objectiveId: 'u1l3-schools', vocabId: 'v-online' },
        { id: 'as-how', type: 'text', prompt: 'Piko asks Momo: “___ is the canteen today?” Momo: “It is great!” Type the question word.', accept: ['How'], objectiveId: 'u1l3-wh' },
      ],
      reading: {
        title: 'Four Kinds of Schools',
        paragraphs: [
          'Not all schools are the same. A boarding school is a school with a dormitory. There are beds, a dining hall and a study room for the students. The students are at school day and night, and the teachers are close.',
          'A village school is small. There are only fourteen students, and there is one classroom for two grades. The teacher is a friend to everyone. There is a big garden behind the school, and it is a great place for a lesson.',
          'A sports school is big. There is a big gym and there are many courts. There are tennis courts, a swimming pool and a football field. Some schools are online. There is no building! There is a screen, a teacher and many students in different cities. Every school is different, and every school is special.',
        ],
        questions: [
          { id: 'rd-tf-dorm', type: 'choice', prompt: 'A boarding school has a dormitory.', options: tf, answer: 0, objectiveId: 'u1l3-schools', vocabId: 'v-dormitory' },
          { id: 'rd-tf-village', type: 'choice', prompt: 'A village school is big.', options: tf, answer: 1, objectiveId: 'u1l3-schools', vocabId: 'v-village' },
          { id: 'rd-tf-beds', type: 'choice', prompt: 'There are beds in a boarding school.', options: tf, answer: 0, objectiveId: 'u1l3-there', vocabId: 'v-boarding' },
          { id: 'rd-tf-online', type: 'choice', prompt: 'There is a big building in an online school.', options: tf, answer: 1, objectiveId: 'u1l3-schools', vocabId: 'v-online' },
          { id: 'rd-tf-tennis', type: 'choice', prompt: 'There are tennis courts in the sports school.', options: tf, answer: 0, objectiveId: 'u1l3-schools', vocabId: 'v-sports-school' },
          { id: 'rd-fill-are', type: 'choice', prompt: 'In a boarding school, there ___ beds and a study room.', options: ['is', 'are', 'am', 'be'], answer: 1, objectiveId: 'u1l3-there' },
          { id: 'rd-fill-there', type: 'choice', prompt: 'A village school is small. ___ are only fourteen students.', options: ['Where', 'Who', 'There', 'Why'], answer: 2, objectiveId: 'u1l3-there' },
          { id: 'rd-fill-is', type: 'choice', prompt: 'There is no building in an online school. ___ is a screen and a teacher.', options: ['Where', 'Who', 'When', 'There'], answer: 3, objectiveId: 'u1l3-there' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-library', 'v-canteen', 'v-gym', 'v-science-lab', 'v-art-room', 'v-principal-office',
              'v-nurse-room', 'v-school-garden', 'v-corridor', 'v-stairs', 'v-notice-board', 'v-computer-room',
              'rv-be', 'rv-an', 'rv-the', 'rv-imp',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'honey-slime', escapee: 'momo' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-library', line: { speaker: 'momo', en: 'This is the library. It is quiet.', tr: 'Burası kütüphane. Sessiz.' }, emphasis: ['library'] },
              { id: 'vs-lab', line: { speaker: 'sasha', en: 'The science lab is next to the library.', tr: 'Fen laboratuvarı kütüphanenin yanında.' }, emphasis: ['science lab', 'next to'] },
              { id: 'vs-canteen', line: { speaker: 'leo', en: 'The canteen is noisy at break time.', tr: 'Kantin teneffüste gürültülü.' }, emphasis: ['canteen'] },
              { id: 'vs-gym', line: { speaker: 'dora', en: 'The gym is big. There is a court.', tr: 'Spor salonu büyük. Bir saha var.' }, emphasis: ['gym'] },
              { id: 'vs-art', line: { speaker: 'leo', en: 'The art room is on the first floor.', tr: 'Resim atölyesi birinci katta.' }, emphasis: ['art room', 'on the first floor'] },
              {
                id: 'vs-office',
                line: { speaker: 'momo', en: 'The principal’s office is in the corridor.', tr: 'Müdür odası koridorda.' },
                emphasis: ['principal’s office', 'corridor'],
                joke: { tr: 'Momo haritayı ters tutuyor: “Müdür odası burada, bahçe de tavanda!” Haritayı çevir, Momo.' },
              },
              { id: 'vs-nurse', line: { speaker: 'piko', en: 'The nurse’s room is next to the stairs.', tr: 'Revir merdivenlerin yanında.' }, emphasis: ['nurse’s room', 'stairs'] },
            ],
            vocabRefs: [
              'v-library', 'v-canteen', 'v-gym', 'v-science-lab', 'v-art-room', 'v-principal-office', 'v-nurse-room',
              'v-school-garden', 'v-corridor', 'v-stairs', 'v-notice-board', 'v-computer-room', 'v-map', 'v-next-to',
              'v-first-floor', 'v-boarding', 'v-village', 'v-sports-school', 'v-online', 'v-dormitory',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-library', 'v-canteen', 'v-gym', 'v-science-lab', 'v-art-room', 'v-nurse-room', 'v-next-to'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-map', line: { speaker: 'momo', en: 'Hello, tourists! This is our school map.', tr: 'Merhaba turistler! Bu bizim okul haritamız.' } },
              { id: 'ps-where', line: { speaker: 'piko', en: 'Where is the library?', tr: 'Kütüphane nerede?' }, gate: 'st-q-lib' },
              { id: 'ps-computers', line: { speaker: 'momo', en: 'Yes, there is. There are two computers.', tr: 'Evet, var. İki bilgisayar var.' }, emphasis: ['There are'], gate: 'st-q-computer' },
              { id: 'ps-why', line: { speaker: 'piko', en: 'Why is the canteen so noisy?', tr: 'Kantin neden bu kadar gürültülü?' }, gate: 'st-q-why' },
              { id: 'ps-door', line: { speaker: 'momo', en: 'Oops! Is this the principal’s office?', tr: 'Hoppala! Burası müdür odası mı?' } },
              { id: 'ps-lost', line: { speaker: 'momo', en: 'It is great, Mrs Demir! But I am lost!', tr: 'Harika Mrs Demir! Ama ben kayboldum!' } },
            ],
            choice: {
              prompt: 'Break time is at ten past ten. Where should the group go first?',
              options: [
                { text: 'Go to the canteen.', feedback: 'Güzel seçim! Teneffüste kantin kalabalık ama tost sıcak.' },
                { text: 'Go to the gym.', feedback: 'Güzel seçim! Spor salonu geniş ve açık. Kantine sonra gidersiniz.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-there',
                target: 'card-there-is',
                hint: { fine: 'Tek bir şey varsa There is, birden fazla varsa There are. Önce say: kaç tane?', big: 'Bir bahçe: There is. Beş bank: There are.' },
                joke: { tr: 'There is ve There are kapıda sıra bekler. Tek kişi gelirse “is”, kalabalık gelirse “are” içeri girer.' },
                stepRef: 'ex-there-is',
              },
              {
                id: 'g-question',
                target: 'card-is-there',
                hint: { fine: 'Soruda is ya da are öne geçer: Is there…? Are there…?', big: 'Is there a gym? Cevap: Yes, there is. ya da No, there isn’t.' },
                stepRef: 'ex-question',
              },
              {
                id: 'g-wh',
                target: 'card-wh-words',
                hint: { fine: 'Cevaba bak: yer mi, zaman mı, kişi mi? Soru kelimesini cevap söyler.', big: 'Where = nerede, When = ne zaman, Who = kim.' },
                stepRef: 'ex-mix',
              },
            ],
            goNoGo: {
              rule: { tr: 'Çoğul görürsen (There are) dokun. Tek bir şey ise (There is) dokunma!', tapIf: 'plural' },
              warmup: [
                { id: 'w-library', text: 'a library', tap: false, why: 'Tek -> There is' },
                { id: 'w-labs', text: 'three labs', tap: true, why: 'Çoğul -> There are' },
                { id: 'w-art', text: 'an art room', tap: false, why: 'Tek -> There is' },
                { id: 'w-gyms', text: 'two gyms', tap: true, why: 'Çoğul -> There are' },
              ],
              round: [
                { id: 'r-garden', text: 'a school garden', tap: false, why: 'Tek -> There is' },
                { id: 'r-benches', text: 'five benches', tap: true, why: 'Çoğul -> There are' },
                { id: 'r-board', text: 'a notice board', tap: false, why: 'Tek -> There is' },
                { id: 'r-books', text: 'many books', tap: true, why: 'Çoğul -> There are' },
                { id: 'r-nurse', text: 'a nurse’s room', tap: false, why: 'Tek -> There is' },
                { id: 'r-desks', text: 'ten desks', tap: true, why: 'Çoğul -> There are' },
                { id: 'r-corridor', text: 'a corridor', tap: false, why: 'Tek -> There is' },
                { id: 'r-computers', text: 'two computers', tap: true, why: 'Çoğul -> There are' },
                { id: 'r-clock', text: 'a clock', tap: false, why: 'Tek -> There is' },
                { id: 'r-doors', text: 'four doors', tap: true, why: 'Çoğul -> There are' },
              ],
              onWrongTap: { anim: 'candy-pop', line: 'Pop! Sayıya bir daha bak: tek mi, çoğul mu?' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'school-garden-gate', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'garden-bench', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'gym-door', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-6-order', sceneObject: 'nurse-room-sign', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-7-order', sceneObject: 'school-bell' },
              { ref: 'hw-8-order', sceneObject: 'school-map' },
            ],
            hint: { fine: 'Kaç tane var? Tek ise There is, çoğul ise There are. Soru kelimesi için cevaba bak.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-courts', 'as-nurse', 'as-computer-text', 'as-stairs', 'as-short', 'as-who',
              'as-when', 'as-order-art', 'as-order-lab', 'as-meaning', 'as-online', 'as-how',
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
            frame: 'In my dream school, there is a ___ next to the ___.',
            chips: [
              { id: 'c-gym', en: 'gym', tr: 'spor salonu', kind: 'place' },
              { id: 'c-library', en: 'library', tr: 'kütüphane', kind: 'place' },
              { id: 'c-art-room', en: 'art room', tr: 'resim atölyesi', kind: 'place' },
              { id: 'c-garden', en: 'school garden', tr: 'okul bahçesi', kind: 'place' },
              { id: 'c-lab', en: 'science lab', tr: 'fen laboratuvarı', kind: 'place' },
              { id: 'c-canteen', en: 'canteen', tr: 'kantin', kind: 'place' },
              { id: 'c-computer-room', en: 'computer room', tr: 'bilgisayar odası', kind: 'place' },
              { id: 'c-nurse', en: 'nurse’s room', tr: 'revir', kind: 'place' },
            ],
            collection: { title: 'Hayalimdeki Okul Haritası' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'There is / There are (olumlu, olumsuz, soru ve kısa cevap) ile okul yerlerini tanıtmak; What, Where, When, Who, Why, How soru kelimelerini yalnız be fiiliyle kullanmak; farklı okul türlerini (yatılı, köy, spor, online) okuyarak tanımak.',
    vocabulary: [
      'library', 'canteen', 'gym', 'science lab', 'art room', 'principal’s office', 'nurse’s room', 'school garden',
      'corridor', 'stairs', 'notice board', 'computer room', 'next to', 'on the first floor',
      'boarding school', 'village school', 'sports school', 'online school', 'dormitory',
    ],
    grammar: [
      'There is + tekil / There are + çoğul',
      'There isn’t / There aren’t',
      'Is there…? / Are there…? Yes, there is. / No, there aren’t.',
      'What / Where / When / Who / Why / How + is / are',
    ],
    expectedDifficulties: [
      'Türkçede “var” tek kelime olduğu için tekil ve çoğul ayrımı unutulur: “There is two computers.”',
      '“There” ile “They” karışır: “They are a library” demek.',
      'Soruda sırayı çevirmeyi unutmak: “There is a gym?” yerine “Is there a gym?”.',
      'Kısa cevapta “Yes, there is” yerine “Yes, it is” ya da “Yes, there” demek.',
      'Where ve When karışır (ikisi de “…da/de” gibi hissedilir); cevaba bakmak gerekir.',
      'Why sorusuna Because ile cevap vermeyi unutmak.',
      'a / an seçimini yazıya göre yapmak: “a art room”.',
    ],
    commonErrors: [
      { error: 'There is five benches.', correction: 'There are five benches. Çoğul için are.' },
      { error: 'They are a gym in the school.', correction: 'There is a gym in the school. “Var” demek için There.' },
      { error: 'There is a canteen? — Yes, there.', correction: 'Is there a canteen? — Yes, there is.' },
      { error: 'When is the library?', correction: 'Where is the library? Yer için Where, zaman için When.' },
      { error: 'Why is she sad? — She is lost.', correction: 'Cevap “Because she is lost.” ile başlar.' },
      { error: 'There isn’t computers.', correction: 'There aren’t computers. Çoğulda aren’t.' },
    ],
    questionsToAsk: [
      'Is there a library in a school? Is there a pool in every school?',
      'Where is the canteen on our school map? (kurgusal Lugu okul haritası)',
      'When is break time? Who is the principal in the story?',
      'How many doors are there in the corridor?',
      'Is there a swimming pool in a sports school? (gerçek ya da hayali cevap verebilirsin)',
    ],
    speakingPrompts: [
      'My dream school: “There is a … There are …”',
      'School tour: “This is the library. It is on the first floor.”',
      'Ask and answer: “Is there a gym? Yes, there is.”',
      'Who? When? Where? Why? How? Bir karakter hakkında altı soru sor.',
      'A different school: yatılı, köy, spor ya da online okul; “There is…” ile tek cümle.',
    ],
    rolePlay: {
      situation: 'Okul turu: Momo (rehber) yeni gelen ziyaretçilere okulu gezdirir; ziyaretçiler soru sorar.',
      roles: ['Momo (rehber)', 'Piko (ziyaretçi)', 'Dora (ziyaretçi)'],
      steps: [
        'Momo karşılar: “Hello! This is our school map.”',
        'Ziyaretçi sorar: “Where is the library?” Momo: “It is on the first floor.”',
        'Ziyaretçi sorar: “Is there a canteen? Are there computers?” Momo kısa cevap verir.',
        'Ziyaretçi sorar: “When is break time? Who is the principal?”',
        'Roller değişir; öğrenci rehber olur ve en az üç yeri tanıtır.',
      ],
    },
    listening: {
      script:
        'Welcome to our school! This is the school garden. There are five benches in it. The library is on the first floor. It is quiet, and there are many books on the shelves. Is there a computer in the library? Yes, there is. There are two computers. The science lab is next to the library. The canteen is on the ground floor. It is noisy at break time because there are many hungry students. Break time is at ten past ten. The gym is big. There is a net and a court in it. The principal is Mrs Demir. Her office is in the corridor, next to the nurse’s room.',
      questions: [
        'How many benches are there in the school garden? (Five.)',
        'Where is the library? (It is on the first floor.)',
        'Is there a computer in the library? (Yes, there is.)',
        'When is break time? (At ten past ten.)',
        'Who is the principal? (Mrs Demir.)',
      ],
    },
    reinforcement: [
      'Okul haritası çiz: öğrenci her odanın yanına “There is a …” / “There are … ” cümlesi yazar.',
      'Evet / hayır kartları: öğretmen “Is there a …?” sorar, öğrenci kısa cevap verir.',
      'Soru kelimesi eşleştirme: cevap kartını (“at nine”, “Mrs Demir”, “because it is noisy”) doğru soru kelimesiyle eşleştir.',
    ],
    suggestedActivities: [
      'Sınıfta gerçek tur: öğrenci rehber olur, sınıftaki beş şeyi “There is / There are” ile tanıtır.',
      'Bul bakalım oyunu: öğretmen gizli bir yer düşünür; öğrenci Is there…? ve Where is…? ile bulur.',
      'Farklı okullar posteri: bir okul türü seç, o okulda neler olduğunu üç cümleyle yaz.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma sorusu: “Is there a library in a school? Is there a pool?” (kısa cevap: Yes, there is. / No, there isn’t.)',
        'Isınma sorusu: “How is the school day today? Is it great?”',
        'Karakter seç: “Who is the guide today?” (Momo. Momo is the guide.)',
        'Sınıfta ya da ekranda üç şey say: “There are three …”',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları (library, canteen, gym, science lab, art room, nurse’s room…): öğrenci kartı görür, “It is the …” der.',
        '“Where is …?” oyunu: öğretmen bir yer söyler, öğrenci “It is next to the …” ya da “It is on the first floor.” der.',
        'Okul türleri: boarding, village, sports, online; öğrenci her biri için “There is a …” ile bir cümle söyler.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen tek ve çoğul kartlar gösterir (a gym / two gyms); öğrenci There is / There are der.',
        'Tur 2: olumsuz cümleler: “There isn’t a pool. There aren’t two libraries.”',
        'Tur 3: Is there…? Are there…? Öğretmen gizli bir okul düşünür, öğrenci soruyla bulur.',
        'Tur 4: soru kelimeleri: öğretmen cevap söyler (“at nine”, “Mrs Demir”), öğrenci doğru soruyu sorar.',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Okul turu rol oyunu: öğrenci Momo (rehber), öğretmen ziyaretçi; sonra roller değişir.',
        'Beklenen cümleler: “This is the library. It is on the first floor. There are many books.” “Is there a gym? Yes, there is.”',
        'Öğretmen notu: Hata olursa sonunda topluca düzelt; rol oyununu bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'Welcome to our school! This is the school garden. There are five benches in it. The library is on the first floor. It is quiet, and there are many books on the shelves. Is there a computer in the library? Yes, there is. There are two computers. The science lab is next to the library. The canteen is on the ground floor. It is noisy at break time because there are many hungry students. Break time is at ten past ten. The gym is big. There is a net and a court in it. The principal is Mrs Demir. Her office is in the corridor, next to the nurse’s room.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin.',
        'Sorular: How many benches are there? Where is the library? When is break time? Who is the principal?',
        'Öğrenci metinden bir yeri seçip “There is / There are …” ile anlatır.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık hatasını (tekil / çoğul, soruda sıra, Where / When karışması) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: There is / There are seçimi, Is there sorusu, Why ve Because.',
        '“Sakın tıklama” sözlü turu: öğretmen “two gyms” der, öğrenci “There are” der; yanlışta nazikçe “Yaklaştın!” de, birlikte düzelt.',
      ],
    },
    freeSpeaking: {
      minutes: 8,
      activities: [
        'Konu 1: Hayalimdeki okul: “There is a … There are …” (gerçek ya da hayali cevap verebilirsin).',
        'Konu 2: Farklı okul türleri: yatılı, köy, spor, online; hangisinde ne var?',
        'Konu 3: Okul turu rehberi ol: üç yeri tanıt, bir soru sor.',
        'Konu 4: Altı soru kelimesiyle bir Lugu karakteri hakkında soru üret.',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevaplar hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: Hayalindeki okulu tanıt. “There is …” ve “There are …” ile beş cümle yaz ya da sesli kaydet; bir “Is there…?” ve bir “Where / When / Who …?” sorusu ekle. Bu, Ünite 1 okul turu çıktındır.',
    },
  },
}
export default lesson
