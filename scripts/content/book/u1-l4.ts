/** Ünite 1.4 — My School Day: Present Simple (he/she/it -s, don't/doesn't, Do/Does…?) and adverbs of frequency. Theme u4-school-bell, host piko. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.4 — My School Day',
  sourceNotes:
    'Kitap Ünite 1 (School Life): Present Simple (olumlu, olumsuz, soru, kısa cevap; he/she/it -s, -es, -ies; has) ve sıklık zarfları (always, usually, often, sometimes, rarely, never). Kelimeler: listen, learn, study, read, speak, ask, answer, attend a class, do homework, take notes, have a break, have lunch, get up, practise. Present progressive kullanılmadı.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Piko’s School Day',
      tagline: 'Piko günlük okul rutinini anlatıyor. Kim ne zaman, ne sıklıkla ne yapar? Sen de kendi gününü anlat!',
      theme: 'School life',
      character: 'piko',
      level: 'A1',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u1l4-routine', text: 'Okul rutini kelimelerini (get up, attend a class, take notes, have lunch, do homework…) söyler.' },
        { id: 'u1l4-simple', text: 'I, you, we, they ile present simple olumlu cümle kurar.' },
        { id: 'u1l4-third', text: 'he / she / it ile fiile -s, -es, -ies ekler (studies, watches, has).' },
        { id: 'u1l4-neg-q', text: 'don’t / doesn’t ile olumsuz cümle kurar; Do / Does …? sorusunu sorar ve kısa cevap verir.' },
        { id: 'u1l4-freq', text: 'always, usually, often, sometimes, rarely, never ile sıklığı doğru yerde söyler.' },
      ],
      grammar: [
        'I / you / we / they + fiil; he / she / it + fiil-s (studies, watches, has)',
        'don’t / doesn’t + fiil',
        'Do / Does + özne + fiil? Yes, she does. / No, I don’t.',
        'always, usually, often, sometimes, rarely, never: fiilden önce, be’den sonra',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-there-is', type: 'choice', prompt: 'Piko points at the school map: “There ___ a gym next to the canteen.”', options: ['are', 'is', 'am'], answer: 1, hint: 'Tek bir spor salonu var.', explain: 'Tek şey için **There is**: There is a gym.' },
        { id: 'rv-there-are', type: 'choice', prompt: 'Sasha counts the benches in the school garden: “There ___ five benches.”', options: ['are', 'is', 'be'], answer: 0, hint: 'Beş bank: birden fazla.', explain: 'Çoğul için **There are**: There are five benches.' },
        { id: 'rv-yes', type: 'choice', prompt: 'Leo asks: “Is there a library on the first floor?” There is one. Momo answers: “Yes, there ___.”', options: ['are', 'isn’t', 'is'], answer: 2, hint: 'Soru Is there ile başladı, cevap da öyle bitsin.', explain: 'Kısa cevap: **Yes, there is.**' },
        { id: 'rv-where', type: 'choice', prompt: 'Dora is lost in the corridor. She asks Momo: “___ is the nurse’s room?”', options: ['Who', 'Why', 'Where'], answer: 2, hint: 'Dora bir yer arıyor.', explain: 'Yer sorarken **Where** deriz.' },
      ],
    },
    vocabulary: [
      { id: 'v-get-up', en: 'get up', tr: 'kalkmak, uyanıp yataktan çıkmak', example: { en: 'I always get up at seven.', tr: 'Ben her zaman yedide kalkarım.' }, difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-attend', en: 'attend a class', tr: 'derse katılmak', example: { en: 'We attend six classes on Monday.', tr: 'Pazartesi altı derse gireriz.' }, difficulty: 2, objectiveId: 'u1l4-routine' },
      { id: 'v-take-notes', en: 'take notes', tr: 'not almak', example: { en: 'Leo often takes notes in class.', tr: 'Leo derste sık sık not alır.' }, context: 'Öğretmen anlatırken önemli şeyleri deftere yazmak.', difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-homework', en: 'do homework', tr: 'ödev yapmak', example: { en: 'Dora does her homework after school.', tr: 'Dora okuldan sonra ödevini yapar.' }, context: 'Ödev için “make” değil “do” deriz.', difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-break', en: 'have a break', tr: 'teneffüs yapmak', example: { en: 'We have a break at ten.', tr: 'Ona teneffüsümüz var.' }, difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-lunch', en: 'have lunch', tr: 'öğle yemeği yemek', example: { en: 'Momo has lunch in the canteen.', tr: 'Momo öğle yemeğini kantinde yer.' }, context: 'Have fiili he/she/it ile has olur.', difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-study', en: 'study', tr: 'ders çalışmak', example: { en: 'Sasha studies English every day.', tr: 'Sasha her gün İngilizce çalışır.' }, context: 'Study he/she/it ile studies olur (y → ies).', difficulty: 2, objectiveId: 'u1l4-routine' },
      { id: 'v-practise', en: 'practise', tr: 'alıştırma yapmak, antrenman yapmak', example: { en: 'You practise tennis after school.', tr: 'Okuldan sonra tenis antrenmanı yaparsın.' }, context: 'İngiliz yazımında fiil practise, isim practice.', difficulty: 3, objectiveId: 'u1l4-routine' },
      { id: 'v-ask', en: 'ask a question', tr: 'soru sormak', example: { en: 'Piko asks a question in every lesson.', tr: 'Piko her derste soru sorar.' }, difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-answer', en: 'answer a question', tr: 'soruyu cevaplamak', example: { en: 'I answer a question in English.', tr: 'Bir soruyu İngilizce cevaplarım.' }, difficulty: 2, objectiveId: 'u1l4-routine' },
      { id: 'v-listen', en: 'listen to the teacher', tr: 'öğretmeni dinlemek', example: { en: 'We listen to the teacher.', tr: 'Öğretmeni dinleriz.' }, context: 'Listen’dan sonra to gelir.', difficulty: 2, objectiveId: 'u1l4-routine' },
      { id: 'v-speak', en: 'speak English', tr: 'İngilizce konuşmak', example: { en: 'They speak English in the club.', tr: 'Kulüpte İngilizce konuşurlar.' }, difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-learn', en: 'learn new words', tr: 'yeni kelimeler öğrenmek', example: { en: 'We learn new words every week.', tr: 'Her hafta yeni kelimeler öğreniriz.' }, difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-read', en: 'read a book', tr: 'kitap okumak', example: { en: 'Leo reads a book at break.', tr: 'Leo teneffüste kitap okur.' }, difficulty: 1, objectiveId: 'u1l4-routine' },
      { id: 'v-always', en: 'always', tr: 'her zaman', example: { en: 'Dora always watches your matches.', tr: 'Dora senin maçlarını her zaman izler.' }, context: 'Yüzde yüz: 100%.', difficulty: 1, objectiveId: 'u1l4-freq' },
      { id: 'v-usually', en: 'usually', tr: 'genellikle', example: { en: 'I usually have lunch at one.', tr: 'Genellikle birde öğle yemeği yerim.' }, context: 'Çoğu zaman: yaklaşık 80%.', difficulty: 2, objectiveId: 'u1l4-freq' },
      { id: 'v-often', en: 'often', tr: 'sık sık', example: { en: 'You often practise with Mr Aydın.', tr: 'Mr Aydın ile sık sık antrenman yaparsın.' }, context: 'Sık sık: yaklaşık 60%.', difficulty: 2, objectiveId: 'u1l4-freq' },
      { id: 'v-sometimes', en: 'sometimes', tr: 'bazen', example: { en: 'Piko is sometimes late.', tr: 'Piko bazen geç kalır.' }, context: 'Ara sıra: yaklaşık 40%.', difficulty: 2, objectiveId: 'u1l4-freq' },
      { id: 'v-rarely', en: 'rarely', tr: 'nadiren', example: { en: 'Sasha rarely forgets her school bag.', tr: 'Sasha okul çantasını nadiren unutur.' }, context: 'Çok az: yaklaşık 10%.', difficulty: 3, objectiveId: 'u1l4-freq' },
      { id: 'v-never', en: 'never', tr: 'hiçbir zaman', example: { en: 'Momo never takes notes. She draws!', tr: 'Momo hiç not almaz. Resim çizer!' }, context: 'Hiç: 0%. Never kendisi olumsuzdur, yanına don’t / doesn’t koyma.', difficulty: 2, objectiveId: 'u1l4-freq' },
    ],
    story: {
      title: 'Piko’s School Day',
      character: 'piko',
      setting: 'A school day from the gate to the tennis court: gate, English class, canteen and tennis',
      scenes: [
        {
          id: 'sc-gate',
          illustration: 'Piko and Sasha at the school gate on a Monday morning; Sasha has a neat school bag, Piko is out of breath.',
          lines: [
            { speaker: 'narrator', en: 'It is Monday morning. Piko and Sasha are at the school gate.', tr: 'Pazartesi sabahı. Piko ve Sasha okul kapısında.' },
            { speaker: 'piko', en: 'I always get up at seven. And you, Sasha?', tr: 'Ben her zaman yedide kalkarım. Ya sen Sasha?' },
            { speaker: 'sasha', en: 'I usually get up at six thirty. I never run to school.', tr: 'Ben genellikle altı buçukta kalkarım. Okula hiç koşmam.' },
            { speaker: 'piko', en: 'Sometimes I am late. Then I run!', tr: 'Ben bazen geç kalırım. O zaman koşarım!' },
            { speaker: 'narrator', en: 'Sasha laughs. She is always early.', tr: 'Sasha gülüyor. O her zaman erken gelir.' },
          ],
        },
        {
          id: 'sc-class',
          illustration: 'English class: Ms Pearl at the whiteboard, Leo writing fast in his notebook, Piko with an empty page.',
          lines: [
            { speaker: 'narrator', en: 'It is English class. Ms Pearl asks: “Do you do your homework, Piko?”', tr: 'İngilizce dersi. Ms Pearl soruyor: “Ödevini yapıyor musun, Piko?”' },
            { speaker: 'piko', en: 'Yes, I do. Sometimes I do it on the bus!', tr: 'Evet, yapıyorum. Bazen otobüste yapıyorum!' },
            { speaker: 'narrator', en: 'Leo often takes notes. He writes very fast.', tr: 'Leo sık sık not alır. Çok hızlı yazar.' },
            { speaker: 'narrator', en: 'Piko doesn’t take notes. He listens to the teacher.', tr: 'Piko not almaz. Öğretmeni dinler.' },
            { speaker: 'sasha', en: 'Piko, take notes, please!', tr: 'Piko, lütfen not al!' },
          ],
        },
        {
          id: 'sc-break',
          illustration: 'The noisy canteen: Momo with a toast, Leo with a bowl of soup, Dora at the counter.',
          lines: [
            { speaker: 'narrator', en: 'It is break time. Momo always has toast in the canteen.', tr: 'Teneffüs zamanı. Momo kantinde her zaman tost yer.' },
            { speaker: 'momo', en: 'We have a break at ten. We have lunch at one.', tr: 'Onda teneffüsümüz var. Birde öğle yemeği yeriz.' },
            { speaker: 'dora', en: 'Do you have lunch at school, Leo?', tr: 'Sen öğle yemeğini okulda mı yersin, Leo?' },
            { speaker: 'leo', en: 'Yes, I do. I often have soup.', tr: 'Evet, yerim. Sık sık çorba içerim.' },
            { speaker: 'momo', en: 'What do you have at break time?', tr: 'Sen teneffüste ne yersin?' },
          ],
          choice: {
            prompt: 'Momo asks: “What do you have at break time?”',
            options: [
              { text: 'I have toast.', feedback: 'Güzel seçim! Tost teneffüsün klasiği, Momo da aynısını yiyor.' },
              { text: 'I have an apple.', feedback: 'Güzel seçim! Elma hem hafif hem enerji verir.' },
            ],
          },
        },
        {
          id: 'sc-tennis',
          illustration: 'The school tennis court in the afternoon: you with a racket, Mr Aydın at the net, Dora on the bench with a bag of snacks.',
          lines: [
            { speaker: 'narrator', en: 'After school, you practise tennis with Mr Aydın.', tr: 'Okuldan sonra Mr Aydın ile tenis antrenmanı yaparsın.' },
            { speaker: 'narrator', en: 'You are the province tennis champion!', tr: 'Sen il tenis şampiyonusun!' },
            { speaker: 'piko', en: 'You usually practise at four. Do you practise every day?', tr: 'Genellikle dörtte antrenman yaparsın. Her gün yapıyor musun?' },
            { speaker: 'narrator', en: 'Dora always watches your matches. She never misses one!', tr: 'Dora senin maçlarını her zaman izler. Hiçbirini kaçırmaz!' },
            { speaker: 'dora', en: 'I always bring snacks for everyone!', tr: 'Ben herkes için her zaman atıştırmalık getiririm!' },
            { speaker: 'narrator', en: 'Mr Aydın says: “Good work! You always try your best.”', tr: 'Mr Aydın diyor ki: “İyi iş! Her zaman elinden gelenin en iyisini yaparsın.”' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-up', type: 'choice', prompt: 'Piko says: “I always get up at seven.” Sasha says: “I usually get up at six thirty.” Who gets up earlier?', options: ['Piko', 'Sasha', 'Leo'], answer: 1, hint: 'Altı buçuk mu daha erken, yedi mi?', explain: 'Altı buçuk yediden erken: **Sasha** earlier.', objectiveId: 'u1l4-routine', vocabId: 'v-get-up' },
        { id: 'st-q-notes', type: 'choice', prompt: 'In English class, Piko listens to the teacher. He ___ take notes.', options: ['don’t', 'doesn’t', 'isn’t'], answer: 1, hint: 'Piko için he diyoruz. He ile hangi yardımcı gelir?', explain: 'he / she / it ile **doesn’t** + fiil: He doesn’t take notes.', objectiveId: 'u1l4-neg-q', vocabId: 'v-take-notes' },
        { id: 'st-q-order', type: 'order', prompt: 'Momo talks about break time. Put her words in order.', tokens: ['at', 'toast', 'always', 'Momo', 'has', 'break.'], answer: ['Momo', 'always', 'has', 'toast', 'at', 'break.'], hint: 'Önce kim, sonra always, sonra fiil.', explain: 'Always fiilden **önce** gelir: Momo always has toast.', objectiveId: 'u1l4-freq', vocabId: 'v-always' },
        { id: 'st-q-lunch', type: 'text', prompt: 'Momo asks Dora: “Does Leo have lunch at school?” Leo has lunch in the canteen. Type the missing word: “Yes, he ___.”', accept: ['does'], hint: 'Soru Does ile başladı. Kısa cevap da aynı kelimeyle biter.', explain: 'Kısa cevap: **Yes, he does.**', objectiveId: 'u1l4-neg-q', vocabId: 'v-lunch' },
        { id: 'st-q-tennis', type: 'choice', prompt: 'Dora is at every match. Dora always ___ your matches.', options: ['watch', 'watchs', 'watches'], answer: 2, hint: 'Dora = she. Watch kelimesi ch ile bitiyor.', explain: 'ch ile biten fiile **-es** gelir: watches.', objectiveId: 'u1l4-third', vocabId: 'v-always' },
        { id: 'st-q-sometimes', type: 'choice', prompt: 'Piko says: “Sometimes I am late.” What does sometimes mean?', options: ['Her zaman', 'Hiçbir zaman', 'Bazen'], answer: 2, hint: 'Piko hep geç kalmıyor, ama bazen kalıyor.', explain: '**sometimes** = bazen.', objectiveId: 'u1l4-freq', vocabId: 'v-sometimes' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-i-you',
          title: 'I, you, we, they: fiil olduğu gibi',
          body: 'Alışkanlıkları ve rutinleri **present simple** ile anlatırız. **I, you, we, they** ile fiil olduğu gibi kalır, eklenti yok.',
          examples: [
            { en: 'I get up at seven.', tr: 'Yedide kalkarım.' },
            { en: 'We have lunch at one.', tr: 'Birde öğle yemeği yeriz.' },
            { en: 'You practise tennis after school.', tr: 'Okuldan sonra tenis antrenmanı yaparsın.' },
          ],
          check: { id: 'ex-check-base', type: 'choice', prompt: 'Sasha and Leo are friends. They ___ English in the club.', options: ['speaks', 'speak', 'to speak'], answer: 1, hint: 'They ile fiil olduğu gibi kalır.', explain: '**They** ile fiil yalın: They speak English.', objectiveId: 'u1l4-simple', vocabId: 'v-speak' },
        },
        {
          id: 'ex-he-she',
          title: 'he, she, it: fiile -s ekle',
          body: '**He, she, it** (ve tek kişi: Piko, Dora, the teacher) ile fiilin sonuna **-s** gelir. Tek kişiyse fiil **-s** ister!',
          examples: [
            { en: 'Piko gets up at seven.', tr: 'Piko yedide kalkar.' },
            { en: 'She asks a question.', tr: 'O bir soru sorar.' },
            { en: 'Leo reads a book.', tr: 'Leo kitap okur.' },
          ],
          check: { id: 'ex-check-s', type: 'choice', prompt: 'Momo is in the canteen. She ___ a toast at break.', options: ['eat', 'eats', 'to eat'], answer: 1, hint: 'Momo = she. Fiilin sonuna ne gelir?', explain: '**She** ile **-s**: She eats.', objectiveId: 'u1l4-third', vocabId: 'v-break' },
        },
        {
          id: 'ex-spelling',
          title: 'Yazım: -es, -ies ve has',
          body: '**s, sh, ch, x, o** ile biten fiile **-es** gelir: watch → **watches**, go → **goes**, do → **does**. Ünsüz + **y** biterse **y** gider, **-ies** gelir: study → **studies**. Have ise özel: **has**.',
          examples: [
            { en: 'Dora watches tennis.', tr: 'Dora tenis izler.' },
            { en: 'Sasha studies every day.', tr: 'Sasha her gün çalışır.' },
            { en: 'Momo has lunch at one.', tr: 'Momo birde öğle yemeği yer.' },
          ],
          check: { id: 'ex-check-spelling', type: 'choice', prompt: 'Sasha studies for the English test. She ___ for an hour.', options: ['studys', 'studies', 'studyes'], answer: 1, hint: 'Study kelimesi ünsüz + y ile bitiyor.', explain: 'Ünsüz + y: y gider, **-ies** gelir: studies.', objectiveId: 'u1l4-third', vocabId: 'v-study' },
        },
        {
          id: 'ex-negative',
          title: 'Olumsuz: don’t ve doesn’t',
          body: '**I, you, we, they** ile **don’t**, **he, she, it** ile **doesn’t** kullan, ardından **yalın fiil** gelir. Dikkat: **doesn’t** varsa fiile **-s** koyma!',
          examples: [
            { en: 'I don’t take notes in art class.', tr: 'Resim dersinde not almam.' },
            { en: 'Piko doesn’t take notes.', tr: 'Piko not almaz.' },
            { en: 'She doesn’t have lunch at school.', tr: 'O öğle yemeğini okulda yemez.' },
          ],
          check: { id: 'ex-check-neg', type: 'choice', prompt: 'Leo has lunch at home today. He ___ have lunch in the canteen.', options: ['don’t', 'isn’t', 'doesn’t'], answer: 2, hint: 'Leo = he. He ile hangi yardımcı gelir?', explain: 'he / she / it ile **doesn’t** + yalın fiil: He doesn’t have.', objectiveId: 'u1l4-neg-q', vocabId: 'v-lunch' },
        },
        {
          id: 'ex-question',
          title: 'Soru: Do ve Does',
          body: '**I, you, we, they** ile **Do** … ? , **he, she, it** ile **Does** … ? kullan; fiil yine **yalın** kalır. Kısa cevap: **Yes, she does. / No, I don’t.**',
          examples: [
            { en: 'Do you have a break at ten?', tr: 'Onda teneffüsün var mı?' },
            { en: 'Does Leo take notes? — Yes, he does.', tr: 'Leo not alır mı? — Evet, alır.' },
            { en: 'Does Dora watch tennis? — No, she doesn’t.', tr: 'Dora tenis izler mi? — Hayır, izlemez.' },
          ],
          check: { id: 'ex-check-question', type: 'choice', prompt: 'Ms Pearl asks about Sasha: “___ she ask a question every lesson?”', options: ['Do', 'Does', 'Is'], answer: 1, hint: 'Sasha = she. Soruda hangi yardımcı gelir?', explain: 'she ile **Does**: Does she ask a question?', objectiveId: 'u1l4-neg-q', vocabId: 'v-ask' },
        },
        {
          id: 'ex-freq',
          title: 'Ne sıklıkla? Sıklık zarfları',
          body: 'Bir şeyi **ne sıklıkla** yaptığını anlatmak için sıklık zarfı kullan: **always** (her zaman), **usually** (genellikle), **often** (sık sık), **sometimes** (bazen), **rarely** (nadiren), **never** (hiçbir zaman).',
          examples: [
            { en: 'You often practise with Mr Aydın.', tr: 'Mr Aydın ile sık sık antrenman yaparsın.' },
            { en: 'Piko sometimes does his homework on the bus.', tr: 'Piko bazen ödevini otobüste yapar.' },
            { en: 'Momo never takes notes.', tr: 'Momo hiç not almaz.' },
          ],
          check: { id: 'ex-check-freq', type: 'choice', prompt: 'Leo says: “I take notes in every lesson.” So Leo ___ takes notes.', options: ['never', 'rarely', 'sometimes', 'always'], answer: 3, hint: 'Her derste: yüzde yüz.', explain: 'Her derste demek **always** demek.', objectiveId: 'u1l4-freq', vocabId: 'v-always' },
        },
        {
          id: 'ex-position',
          title: 'Yeri: fiilden önce, be’den sonra',
          body: 'Sıklık zarfı **ana fiilden önce** gelir: I **always** get up. Ama **be** (am, is, are) ile **be’den sonra** gelir: Sasha is **always** early. Never ile **don’t / doesn’t** kullanma: **Piko never takes notes.**',
          examples: [
            { en: 'Dora always watches your matches.', tr: 'Dora maçlarını her zaman izler.' },
            { en: 'Sasha is always early.', tr: 'Sasha her zaman erken gelir.' },
            { en: 'I usually have lunch at one.', tr: 'Genellikle birde öğle yemeği yerim.' },
          ],
          check: { id: 'ex-check-position', type: 'choice', prompt: 'Momo says that she is late often. Which sentence is correct?', options: ['Momo often is late.', 'Often Momo is late.', 'Momo is often late.'], answer: 2, hint: 'Be fiilinin hemen arkasına koy.', explain: '**Be**’den sonra: Momo is often late.', objectiveId: 'u1l4-freq' },
        },
        {
          id: 'ex-mix',
          title: 'Hepsini birleştir: hangi form?',
          body: 'Önce özneye bak. **I, you, we, they**: yalın fiil, don’t, Do. **He, she, it**: fiil-s, doesn’t, Does. Sonra sıklık zarfını doğru yere koy.',
          examples: [
            { en: 'Dora always has a snack.', tr: 'Dora her zaman bir atıştırmalık yer.' },
            { en: 'They don’t study at the weekend.', tr: 'Hafta sonu ders çalışmazlar.' },
            { en: 'Does she usually practise at four?', tr: 'O genellikle dörtte mi antrenman yapar?' },
          ],
          check: { id: 'ex-check-mix', type: 'choice', prompt: 'Mr Aydın asks about you and your friends: “___ you practise tennis on Friday?”', options: ['Does', 'Do', 'Are', 'Is'], answer: 1, hint: 'You ile hangi yardımcı gelir?', explain: 'you ile **Do**: Do you practise?', objectiveId: 'u1l4-neg-q', vocabId: 'v-practise' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u1l4-simple',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Ms Pearl says to the class: “We ___ notes in English.”', options: ['take', 'takes', 'taken'], answer: 0, hint: 'We ile fiil olduğu gibi kalır.', explain: '**We** ile yalın fiil: We take notes.', objectiveId: 'u1l4-simple', vocabId: 'v-take-notes' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Momo talks about her mornings. Build her sentence.', tokens: ['seven.', 'I', 'get', 'at', 'up'], answer: ['I', 'get', 'up', 'at', 'seven.'], hint: 'Kim → fiil → ne zaman?', explain: 'I get up at seven.', objectiveId: 'u1l4-simple' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Leo says: “We have lunch at one.” What does he mean?', options: ['Birde teneffüsümüz var.', 'Birde öğle yemeği yeriz.', 'Birde derse gireriz.'], answer: 1, hint: 'have lunch = öğle yemeği yemek', explain: '**have lunch** = öğle yemeği yemek.', objectiveId: 'u1l4-simple', vocabId: 'v-lunch' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u1l4-third',
          complete: { id: 'hw-2-complete', type: 'choice', prompt: 'Dora is at home after school. She ___ her homework first.', options: ['do', 'dos', 'does'], answer: 2, hint: 'Dora = she. Do fiili özel yazılır.', explain: '**do** + she → **does**: She does her homework.', objectiveId: 'u1l4-third', vocabId: 'v-homework' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Sasha tells Ms Pearl about Piko. Put the words in order.', tokens: ['a', 'asks', 'question.', 'Piko'], answer: ['Piko', 'asks', 'a', 'question.'], hint: 'Piko tek kişi: fiile -s gelir.', explain: 'Piko asks a question.', objectiveId: 'u1l4-third' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Sasha says: “Piko reads a book at break.” What does she mean?', options: ['Piko teneffüste kitap okur.', 'Piko kitabı kaybetti.', 'Piko kitap yazar.'], answer: 0, hint: 'reads = okur', explain: 'reads a book = kitap okur.', objectiveId: 'u1l4-third', vocabId: 'v-read' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u1l4-third',
          complete: { id: 'hw-3-complete', type: 'text', prompt: 'Sasha loves English. She ___ English every day. (study) Type the correct form.', accept: ['studies'], hint: 'Study kelimesinde y ne olur?', explain: 'Ünsüz + y: **studies**.', objectiveId: 'u1l4-third', vocabId: 'v-study' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Leo describes Dora at the tennis court. Build his sentence.', tokens: ['tennis', 'Dora', 'watches', 'matches.'], answer: ['Dora', 'watches', 'tennis', 'matches.'], hint: 'Watch → watches', explain: 'Dora watches tennis matches.', objectiveId: 'u1l4-third' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Momo says: “Leo has a break at ten.” What does she mean?', options: ['Leo’nun onda teneffüsü var.', 'Leo onda eve gider.', 'Leo onda derse girer.'], answer: 0, hint: 'has a break = teneffüs yapar', explain: '**has a break** = teneffüs yapar.', objectiveId: 'u1l4-third', vocabId: 'v-break' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u1l4-neg-q',
          complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Momo asks Leo: “Do you have lunch at school?” Leo has lunch at home. He says: “I ___ have lunch at school.”', options: ['doesn’t', 'don’t', 'not'], answer: 1, hint: 'I ile hangi yardımcı gelir?', explain: '**I** ile **don’t**: I don’t have lunch at school.', objectiveId: 'u1l4-neg-q', vocabId: 'v-lunch' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Dora tells Piko what she does at break. Build her sentence.', tokens: ['don’t', 'I', 'read', 'at', 'a', 'book', 'break.'], answer: ['I', 'don’t', 'read', 'a', 'book', 'at', 'break.'], hint: 'I → don’t → yalın fiil', explain: 'I don’t read a book at break.', objectiveId: 'u1l4-neg-q' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Dora says: “I don’t read a book at break.” What does she mean?', options: ['Teneffüste kitap okurum.', 'Teneffüste kitap okumam.', 'Teneffüste kitap okur muyum?'], answer: 1, hint: 'don’t = değil / -mam', explain: '**don’t** olumsuz yapar: okumam.', objectiveId: 'u1l4-neg-q', vocabId: 'v-read' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u1l4-neg-q',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Piko listens to the teacher. He ___ take notes.', options: ['don’t', 'doesn’t', 'isn’t'], answer: 1, hint: 'He ile hangi yardımcı gelir?', explain: 'he / she / it ile **doesn’t** + yalın fiil.', objectiveId: 'u1l4-neg-q', vocabId: 'v-take-notes' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Sasha says one thing about Piko. Build her sentence.', tokens: ['take', 'Piko', 'notes.', 'doesn’t'], answer: ['Piko', 'doesn’t', 'take', 'notes.'], hint: 'doesn’t’tan sonra fiile -s koyma.', explain: 'Piko doesn’t take notes.', objectiveId: 'u1l4-neg-q' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Sasha says: “Piko doesn’t take notes.” What does she mean?', options: ['Piko not alır.', 'Piko not almaz.', 'Piko not alacak.'], answer: 1, hint: 'doesn’t = -maz', explain: '**doesn’t** olumsuz yapar: not almaz.', objectiveId: 'u1l4-neg-q' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u1l4-neg-q',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Momo asks Piko and Leo: “___ you have a break at ten?”', options: ['Do', 'Does', 'Are'], answer: 0, hint: 'You ile hangi yardımcı gelir?', explain: 'you ile **Do**: Do you have a break?', objectiveId: 'u1l4-neg-q', vocabId: 'v-break' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Leo asks Piko a question. Put his words in order.', tokens: ['homework?', 'Do', 'your', 'you', 'do'], answer: ['Do', 'you', 'do', 'your', 'homework?'], hint: 'Soru Do ile başlar.', explain: 'Do you do your homework?', objectiveId: 'u1l4-neg-q' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Leo asks: “Do you do your homework?” What does he ask?', options: ['Ödevini yaptın.', 'Ödevini yapıyor musun?', 'Ödev ne zaman?'], answer: 1, hint: 'Do ile başlayan cümle soru.', explain: '**Do** … ? = … mu?', objectiveId: 'u1l4-neg-q', vocabId: 'v-homework' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u1l4-neg-q',
          complete: { id: 'hw-7-complete', type: 'text', prompt: 'Ms Pearl asks: “Does Leo read a book at break?” Leo reads every day. Type the missing word: “Yes, he ___.”', accept: ['does'], hint: 'Soru Does ile başladı.', explain: 'Kısa cevap: **Yes, he does.**', objectiveId: 'u1l4-neg-q', vocabId: 'v-read' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Piko asks about Sasha. Build his question.', tokens: ['a', 'question?', 'Does', 'ask', 'Sasha'], answer: ['Does', 'Sasha', 'ask', 'a', 'question?'], hint: 'Does + özne + yalın fiil', explain: 'Does Sasha ask a question?', objectiveId: 'u1l4-neg-q' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Sasha says: “No, I don’t.” What does she mean?', options: ['Evet, yaparım.', 'Hayır, yapmam.', 'Hayır, yapmıyor.'], answer: 1, hint: 'No = hayır, don’t = yapmam', explain: '**No, I don’t.** = Hayır, yapmam.', objectiveId: 'u1l4-neg-q' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u1l4-freq',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Sasha is early every day. Sasha is ___ early.', options: ['never', 'rarely', 'always'], answer: 2, hint: 'Her gün: yüzde yüz.', explain: 'Her gün demek **always**.', objectiveId: 'u1l4-freq', vocabId: 'v-always' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Momo talks about Sasha. Build her sentence.', tokens: ['always', 'is', 'Sasha', 'early.'], answer: ['Sasha', 'is', 'always', 'early.'], hint: 'Be fiilinden sonra gelir.', explain: 'Be’den sonra: Sasha is always early.', objectiveId: 'u1l4-freq' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Momo says: “I rarely forget my school bag.” What does she mean?', options: ['Çantamı hep unuturum.', 'Çantamı nadiren unuturum.', 'Çantamı hiç unutmam.'], answer: 1, hint: 'rarely = nadiren', explain: '**rarely** = nadiren.', objectiveId: 'u1l4-freq', vocabId: 'v-rarely' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u1l4-routine',
          complete: { id: 'hw-9-complete', type: 'choice', prompt: 'Dora asks about your day. You practise tennis after school. “I ___ tennis after school.”', options: ['practises', 'practise', 'practice'], answer: 1, hint: 'I ile fiil yalın kalır. Fiil mi isim mi? Yazımı hatırla.', explain: '**I** ile yalın fiil: practise (fiil: -ise, isim: practice).', objectiveId: 'u1l4-routine', vocabId: 'v-practise' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Mr Aydın says to you after school. Put the words in order.', tokens: ['tennis', 'You', 'practise', 'usually', 'at', 'four.'], answer: ['You', 'usually', 'practise', 'tennis', 'at', 'four.'], hint: 'Usually fiilden önce gelir.', explain: 'You usually practise tennis at four.', objectiveId: 'u1l4-freq' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Piko says: “You often practise with Mr Aydın.” What does he mean?', options: ['Mr Aydın ile sık sık antrenman yaparsın.', 'Mr Aydın ile hiç antrenman yapmazsın.', 'Mr Aydın ile bazen konuşursun.'], answer: 0, hint: 'often = sık sık', explain: '**often** = sık sık.', objectiveId: 'u1l4-freq', vocabId: 'v-often' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-have', type: 'choice', prompt: 'Ms Pearl says to the class: “We ___ English on Monday and Thursday.”', options: ['has', 'have', 'haves'], answer: 1, objectiveId: 'u1l4-simple' },
        { id: 'as-reads', type: 'choice', prompt: 'Leo is in the library at break. He ___ a book.', options: ['read', 'reads', 'readies'], answer: 1, objectiveId: 'u1l4-third', vocabId: 'v-read' },
        { id: 'as-does', type: 'text', prompt: 'Dora is at home after tennis. She ___ her homework. (do) Type the correct form.', accept: ['does'], objectiveId: 'u1l4-third', vocabId: 'v-homework' },
        { id: 'as-studies', type: 'text', prompt: 'Sasha has an English test on Friday. She ___ every evening. (study) Type the correct form.', accept: ['studies'], objectiveId: 'u1l4-third', vocabId: 'v-study' },
        { id: 'as-watches', type: 'choice', prompt: 'Piko loves tennis. He ___ your matches on Saturday.', options: ['watchs', 'watches', 'watchies'], answer: 1, objectiveId: 'u1l4-third' },
        { id: 'as-neg-she', type: 'choice', prompt: 'Dora is in the gym at lunch time. She ___ have lunch in the canteen.', options: ['don’t', 'doesn’t', 'isn’t'], answer: 1, objectiveId: 'u1l4-neg-q', vocabId: 'v-lunch' },
        { id: 'as-neg-they', type: 'choice', prompt: 'Piko and Momo are in art class. They ___ take notes there.', options: ['doesn’t', 'aren’t', 'don’t'], answer: 2, objectiveId: 'u1l4-neg-q', vocabId: 'v-take-notes' },
        { id: 'as-do-ask', type: 'choice', prompt: 'Ms Pearl asks Leo and Piko: “___ you ask a question every day?”', options: ['Does', 'Do', 'Are'], answer: 1, objectiveId: 'u1l4-neg-q', vocabId: 'v-ask' },
        { id: 'as-short', type: 'choice', prompt: 'Mr Aydın asks: “Does Dora watch your matches?” Dora is at every match. What is the answer?', options: ['Yes, she do.', 'No, she doesn’t.', 'Yes, she does.', 'Yes, she is.'], answer: 2, objectiveId: 'u1l4-neg-q' },
        { id: 'as-order-dora', type: 'order', prompt: 'Piko talks about tennis day. Make his sentence.', tokens: ['watches', 'Dora', 'matches.', 'your', 'always'], answer: ['Dora', 'always', 'watches', 'your', 'matches.'], objectiveId: 'u1l4-freq', vocabId: 'v-always' },
        { id: 'as-meaning', type: 'choice', prompt: 'Piko says: “I never have lunch in the canteen.” What does he mean?', options: ['Her zaman kantinde yemek yerim.', 'Hiçbir zaman kantinde yemek yemem.', 'Bazen kantinde yemek yerim.'], answer: 1, objectiveId: 'u1l4-freq', vocabId: 'v-never' },
        { id: 'as-position', type: 'choice', prompt: 'Sasha is early every day. Which sentence is correct?', options: ['Sasha always is early.', 'Sasha is always early.', 'Always Sasha is early.'], answer: 1, objectiveId: 'u1l4-freq', vocabId: 'v-always' },
      ],
      reading: {
        title: 'Sasha’s School Day',
        paragraphs: [
          'Sasha is a very organised student. She always gets up at six thirty, and she usually has breakfast before school. She is never late. She often arrives before the bell.',
          'At school, Sasha attends six classes. She often takes notes, and she always asks a question in English class. She has a break at ten o’clock. She sometimes has toast, but she rarely has cake.',
          'After school, Sasha does her homework. She doesn’t watch TV on school days. She studies for thirty minutes, and she reads a book before bed. On Fridays, she practises the piano.',
        ],
        questions: [
          { id: 'rd-tf-up', type: 'choice', prompt: 'Sasha always gets up at six thirty.', options: tf, answer: 0, objectiveId: 'u1l4-freq', vocabId: 'v-get-up' },
          { id: 'rd-tf-late', type: 'choice', prompt: 'Sasha is often late for school.', options: tf, answer: 1, objectiveId: 'u1l4-freq' },
          { id: 'rd-tf-cake', type: 'choice', prompt: 'Sasha has cake at break every day.', options: tf, answer: 1, objectiveId: 'u1l4-freq', vocabId: 'v-rarely' },
          { id: 'rd-tf-tv', type: 'choice', prompt: 'Sasha doesn’t watch TV on school days.', options: tf, answer: 0, objectiveId: 'u1l4-neg-q' },
          { id: 'rd-tf-homework', type: 'choice', prompt: 'Sasha never does her homework.', options: tf, answer: 1, objectiveId: 'u1l4-freq', vocabId: 'v-homework' },
          { id: 'rd-fill-has', type: 'choice', prompt: 'Sasha ___ a break at ten o’clock.', options: ['have', 'haves', 'has', 'to have'], answer: 2, objectiveId: 'u1l4-third', vocabId: 'v-break' },
          { id: 'rd-fill-neg', type: 'choice', prompt: 'Sasha ___ watch TV on school days.', options: ['don’t', 'doesn’t', 'isn’t', 'not'], answer: 1, objectiveId: 'u1l4-neg-q' },
          { id: 'rd-fill-never', type: 'choice', prompt: 'Sasha is ___ late for school.', options: ['doesn’t', 'does', 'don’t', 'never'], answer: 3, objectiveId: 'u1l4-freq', vocabId: 'v-never' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-get-up', 'v-attend', 'v-take-notes', 'v-homework', 'v-break', 'v-lunch',
              'v-study', 'v-practise', 'v-ask', 'v-answer', 'v-listen', 'v-speak',
              'rv-there-is', 'rv-there-are', 'rv-yes', 'rv-where',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'caramel-river', escapee: 'piko' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-up', line: { speaker: 'piko', en: 'I always get up at seven.', tr: 'Ben her zaman yedide kalkarım.' }, emphasis: ['get up', 'always'] },
              { id: 'vs-class', line: { speaker: 'sasha', en: 'I attend a class at nine.', tr: 'Dokuzda bir derse katılırım.' }, emphasis: ['attend a class'] },
              { id: 'vs-notes', line: { speaker: 'leo', en: 'I often take notes in class.', tr: 'Derste sık sık not alırım.' }, emphasis: ['take notes', 'often'] },
              {
                id: 'vs-homework',
                line: { speaker: 'momo', en: 'I sometimes do my homework at break!', tr: 'Bazen ödevimi teneffüste yaparım!' },
                emphasis: ['do my homework', 'sometimes'],
                joke: { tr: 'Momo ödevini hiçbir zaman köpeğe yedirmez. Çünkü köpeği yok, ama bahanesi her zaman hazır.' },
              },
              { id: 'vs-break', line: { speaker: 'dora', en: 'We have a break at ten.', tr: 'Onda teneffüsümüz var.' }, emphasis: ['have a break'] },
              { id: 'vs-lunch', line: { speaker: 'leo', en: 'We have lunch at one.', tr: 'Birde öğle yemeği yeriz.' }, emphasis: ['have lunch'] },
              { id: 'vs-never', line: { speaker: 'sasha', en: 'I never forget my school bag.', tr: 'Okul çantamı hiç unutmam.' }, emphasis: ['never'] },
            ],
            vocabRefs: [
              'v-get-up', 'v-attend', 'v-take-notes', 'v-homework', 'v-break', 'v-lunch', 'v-study',
              'v-practise', 'v-ask', 'v-answer', 'v-listen', 'v-speak', 'v-learn', 'v-read',
              'v-always', 'v-usually', 'v-often', 'v-sometimes', 'v-rarely', 'v-never',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-get-up', 'v-attend', 'v-take-notes', 'v-homework', 'v-break', 'v-lunch', 'v-always'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-up', line: { speaker: 'piko', en: 'I always get up at seven. And you, Sasha?', tr: 'Ben her zaman yedide kalkarım. Ya sen Sasha?' }, gate: 'st-q-up' },
              { id: 'ps-late', line: { speaker: 'piko', en: 'Sometimes I am late. Then I run!', tr: 'Bazen geç kalırım. O zaman koşarım!' }, gate: 'st-q-sometimes' },
              { id: 'ps-notes', line: { speaker: 'narrator', en: 'Piko doesn’t take notes. He listens to the teacher.', tr: 'Piko not almaz. Öğretmeni dinler.' }, gate: 'st-q-notes' },
              { id: 'ps-lunch', line: { speaker: 'leo', en: 'Yes, I do. I often have soup.', tr: 'Evet, yerim. Sık sık çorba içerim.' }, gate: 'st-q-lunch' },
              { id: 'ps-tennis', line: { speaker: 'narrator', en: 'After school, you practise tennis with Mr Aydın.', tr: 'Okuldan sonra Mr Aydın ile tenis antrenmanı yaparsın.' } },
              { id: 'ps-dora', line: { speaker: 'narrator', en: 'Dora always watches your matches.', tr: 'Dora senin maçlarını her zaman izler.' }, emphasis: ['always'], gate: 'st-q-tennis' },
            ],
            choice: {
              prompt: 'Momo asks: “What do you have at break time?”',
              options: [
                { text: 'I have toast.', feedback: 'Güzel seçim! Tost teneffüsün klasiği, Momo da aynısını yiyor.' },
                { text: 'I have an apple.', feedback: 'Güzel seçim! Elma hem hafif hem enerji verir.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-s',
                target: 'card-third-person',
                hint: { fine: 'He, she, it ya da tek kişi görürsen fiile -s ekle. I, you, we, they ile eklenti yok.', big: 'Dora watches. Leo reads. Ama: I watch, we read.' },
                joke: { tr: 'Fiillerin kapısında -s bekçisi durur. “He, she, it” gelince kapıyı açar, “I, you, we, they” gelince uyuya kalır.' },
                stepRef: 'ex-he-she',
              },
              {
                id: 'g-doesnt',
                target: 'card-doesnt',
                hint: { fine: 'doesn’t varsa fiilde -s kalmaz: doesn’t take, doesn’t have.', big: 'Piko doesn’t take notes. Piko doesn’t takes notes demezsin.' },
                stepRef: 'ex-negative',
              },
              {
                id: 'g-freq',
                target: 'card-frequency',
                hint: { fine: 'Sıklık zarfı fiilden önce, be’den sonra gelir.', big: 'I always get up. Sasha is always early.' },
                stepRef: 'ex-position',
              },
            ],
            goNoGo: {
              rule: { tr: 'He, she, it ya da tek kişi görürsen dokun (fiil -s alır). I, you, we, they görürsen dokunma!', tapIf: 'he|she|it|tek kişi' },
              warmup: [
                { id: 'w-piko', text: 'Piko', tap: true, why: 'Tek kişi -> fiil -s alır' },
                { id: 'w-i', text: 'I', tap: false, why: 'I -> yalın fiil' },
                { id: 'w-she', text: 'she', tap: true, why: 'she -> fiil -s alır' },
                { id: 'w-we', text: 'we', tap: false, why: 'we -> yalın fiil' },
              ],
              round: [
                { id: 'r-dora', text: 'Dora', tap: true, why: 'Tek kişi -> -s alır' },
                { id: 'r-they', text: 'they', tap: false, why: 'they -> yalın fiil' },
                { id: 'r-pearl', text: 'Ms Pearl', tap: true, why: 'Tek kişi -> -s alır' },
                { id: 'r-you', text: 'you', tap: false, why: 'you -> yalın fiil' },
                { id: 'r-it', text: 'it', tap: true, why: 'it -> -s alır' },
                { id: 'r-two', text: 'Leo and Piko', tap: false, why: 'İki kişi = they -> yalın fiil' },
                { id: 'r-sasha', text: 'Sasha', tap: true, why: 'Tek kişi -> -s alır' },
                { id: 'r-i', text: 'I', tap: false, why: 'I -> yalın fiil' },
                { id: 'r-teacher', text: 'the teacher', tap: true, why: 'Tek kişi -> -s alır' },
                { id: 'r-we', text: 'we', tap: false, why: 'we -> yalın fiil' },
              ],
              onWrongTap: { anim: 'sneeze', line: 'Hapşu! Kim olduğuna bir daha bak: tek kişi mi, yoksa I / you / we / they mi?' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'school-gate', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'homework-desk', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'canteen-tray', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-order', sceneObject: 'notebook', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-8-order', sceneObject: 'school-bell' },
              { ref: 'hw-9-order', sceneObject: 'tennis-racket' },
            ],
            hint: { fine: 'Önce özneye bak: I, you, we, they mi, yoksa he, she, it mi? Sonra sıklık zarfının yerini seç.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-have', 'as-reads', 'as-does', 'as-studies', 'as-watches', 'as-neg-she',
              'as-neg-they', 'as-do-ask', 'as-short', 'as-order-dora', 'as-meaning', 'as-position',
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
            activity: 'story',
            frame: 'I always ___ and I sometimes ___.',
            chips: [
              { id: 'c-get-up', en: 'get up early', tr: 'erken kalkmak', kind: 'verb' },
              { id: 'c-homework', en: 'do homework', tr: 'ödev yapmak', kind: 'verb' },
              { id: 'c-notes', en: 'take notes', tr: 'not almak', kind: 'verb' },
              { id: 'c-lunch', en: 'have lunch', tr: 'öğle yemeği yemek', kind: 'verb' },
              { id: 'c-study', en: 'study English', tr: 'İngilizce çalışmak', kind: 'verb' },
              { id: 'c-ask', en: 'ask a question', tr: 'soru sormak', kind: 'verb' },
              { id: 'c-practise', en: 'practise tennis', tr: 'tenis antrenmanı yapmak', kind: 'verb' },
              { id: 'c-read', en: 'read a book', tr: 'kitap okumak', kind: 'verb' },
            ],
            collection: { title: 'Benim Okul Günüm' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Present simple ile okul rutinlerini anlatmak: I / you / we / they + fiil, he / she / it + fiil-s (-es, -ies, has), don’t / doesn’t, Do / Does soruları ve kısa cevaplar; sıklık zarflarını (always … never) doğru yerde kullanmak. Present progressive kullanılmaz.',
    vocabulary: [
      'get up', 'attend a class', 'take notes', 'do homework', 'have a break', 'have lunch', 'study', 'practise',
      'ask a question', 'answer a question', 'listen to the teacher', 'speak English', 'learn new words', 'read a book',
      'always', 'usually', 'often', 'sometimes', 'rarely', 'never',
    ],
    grammar: [
      'I / you / we / they + yalın fiil; he / she / it + fiil-s (studies, watches, has, does, goes)',
      'don’t / doesn’t + yalın fiil',
      'Do / Does + özne + yalın fiil? Yes, she does. / No, I don’t.',
      'Sıklık zarfı: ana fiilden önce, be’den sonra',
    ],
    expectedDifficulties: [
      'Türkçede fiil özneye göre -s almadığı için he / she / it ile -s unutulur: “She study.”',
      'doesn’t’tan sonra da -s koymak: “He doesn’t takes notes.”',
      'Does sorusunda fiile -s koymak: “Does she studies?”',
      'Sıklık zarfının yerini Türkçedeki gibi cümle başına ya da sonuna koymak: “Always I get up.”',
      'Be fiili ile don’t kullanmak: “I don’t am late.” Be’li cümlede isn’t / aren’t gelir.',
      'Never ile çift olumsuzluk: “I don’t never take notes.”',
      'Yazım: studys, watchs, haves; have → has, do → does özel biçimleri.',
    ],
    commonErrors: [
      { error: 'Dora watch my matches.', correction: 'Dora watches my matches. he / she / it ile -es.' },
      { error: 'Sasha studys every day.', correction: 'Sasha studies every day. Ünsüz + y → -ies.' },
      { error: 'Piko doesn’t takes notes.', correction: 'Piko doesn’t take notes. doesn’t’tan sonra yalın fiil.' },
      { error: 'Does Leo reads a book?', correction: 'Does Leo read a book? Soruda yalın fiil.' },
      { error: 'Sasha always is early.', correction: 'Sasha is always early. Be’den sonra.' },
      { error: 'Momo don’t take notes.', correction: 'Momo doesn’t take notes. Momo = she.' },
    ],
    questionsToAsk: [
      'What time do you get up on school days? (gerçek ya da hayali cevap verebilirsin)',
      'Does Piko take notes in English class? Does Leo?',
      'How often do you have a break? Do you usually have lunch at school?',
      'Does Dora watch your matches? (kurgusal tenis sahnesi)',
      'What do you always, sometimes and never do after school?',
    ],
    speakingPrompts: [
      'My school day: “I always … I usually … I never …”',
      'A friend’s day: “She often takes notes. He doesn’t …” (gerçek isim değil, Lugu karakteri)',
      'Ask and answer: “Do you do homework after school? Yes, I do. / No, I don’t.”',
      'Tennis after school: “I practise at four. Dora always watches my matches.”',
      'Piko’s day: Piko ne zaman kalkar, ne yer, nerede ders çalışır?',
    ],
    rolePlay: {
      situation: 'Piko’nun okul günü röportajı: gazeteci öğrenci Sasha, Piko ve Leo’ya günlük rutinlerini sorar.',
      roles: ['Sasha (gazeteci)', 'Piko (öğrenci)', 'Leo (öğrenci)'],
      steps: [
        'Sasha sorar: “What time do you get up, Piko?” Piko: “I always get up at seven.”',
        'Sasha sorar: “Do you take notes in class?” Piko: “No, I don’t.” Leo: “I often take notes.”',
        'Sasha Leo hakkında sorar: “Does Leo have lunch at school?” Piko: “Yes, he does.”',
        'Sasha sorar: “What do you do after school?” Cevap: “I practise tennis. I sometimes do my homework.”',
        'Roller değişir; öğrenci gazeteci olur ve en az üç Do / Does sorusu sorar.',
      ],
    },
    listening: {
      script:
        'Piko always gets up at seven. He usually has breakfast at home, and he sometimes runs to school. At school, he attends six classes. Leo often takes notes, but Piko doesn’t take notes. He listens to the teacher. Piko often asks a question in English class. At ten o’clock, the students have a break. Momo always has toast, and Dora never has lunch in the canteen. Piko has lunch at one. After school, he does his homework. He rarely forgets it. In the evening, Piko studies English for thirty minutes. He never studies at night.',
      questions: [
        'What time does Piko get up? (At seven.)',
        'Does Piko take notes? (No, he doesn’t.)',
        'Who always has toast at break? (Momo.)',
        'Does Dora have lunch in the canteen? (No, she doesn’t. She never does.)',
        'How long does Piko study English? (Thirty minutes.)',
      ],
    },
    reinforcement: [
      'Üç sütunlu tablo: I-you-we-they / he-she-it / yardımcı (do, does, don’t, doesn’t). Öğrenci cümleleri doğru sütuna yazar.',
      'Sıklık çizgisi: 0%’dan 100%’e never … always; öğrenci kendi rutinini çizgiye yerleştirir.',
      '“Sakın tıklama” sözlü turu: öğretmen özne söyler, öğrenci “-s var / yok” der.',
    ],
    suggestedActivities: [
      'Sınıf anketi: “Do you …?” ile üç arkadaşa soru sor, “He / She …” ile raporla.',
      'Rutin bingosu: always, usually, often, sometimes, rarely, never karelerini rutin cümleleriyle doldur.',
      'Piko’nun günü mini kitapçığı: beş cümle yaz, her cümlede farklı bir sıklık zarfı kullan.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma sorusu: “Do you get up early? Do you like school mornings?” (gerçek ya da hayali cevap verebilirsin)',
        'Isınma sorusu: “What do you usually have at break?”',
        'Karakter seç: “Who always takes notes? Who never takes notes?” (Leo, Piko)',
        'Sıklık skalası: öğretmen bir etkinlik söyler, öğrenci “always / sometimes / never” ile yorumlar.',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Fiil kartları (get up, take notes, do homework, have lunch, practise…): öğrenci kartı görür, “I … every day.” der.',
        'Sıklık zarfları merdiveni: always, usually, often, sometimes, rarely, never; öğrenci her biri için bir cümle söyler.',
        '“Piko’nun günü” sıralaması: sabahtan akşama beş rutini sıraya koy.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen özne söyler (I, Dora, they), öğrenci fiili doğru biçimde söyler (get up / gets up).',
        'Tur 2: olumsuz: “Piko doesn’t take notes. I don’t take notes in art class.”',
        'Tur 3: Do / Does soruları ve kısa cevaplar (Yes, she does. / No, I don’t.). Öğretmen bir karakter düşünür, öğrenci soruyla bulur.',
        'Tur 4: sıklık zarfı yeri: “Sasha is always early. I always get up.”',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Röportaj rol oyunu: öğretmen gazeteci, öğrenci Piko; sonra roller değişir.',
        'Beklenen cümleler: “I always get up at seven. I don’t take notes. Dora always watches my matches.”',
        'Öğretmen notu: Hata olursa sonunda topluca düzelt; rol oyununu bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'Piko always gets up at seven. He usually has breakfast at home, and he sometimes runs to school. At school, he attends six classes. Leo often takes notes, but Piko doesn’t take notes. He listens to the teacher. Piko often asks a question in English class. At ten o’clock, the students have a break. Momo always has toast, and Dora never has lunch in the canteen. Piko has lunch at one. After school, he does his homework. He rarely forgets it. In the evening, Piko studies English for thirty minutes. He never studies at night.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin.',
        'Sorular: What time does Piko get up? Does Piko take notes? Who always has toast? Does Dora have lunch in the canteen?',
        'Öğrenci metinden bir karakter seçip “He / She …” ve bir sıklık zarfıyla tek cümleyle anlatır.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık hatasını (-s unutmak, doesn’t’tan sonra -s, sıklık zarfının yeri) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: he / she / it -s, yazım (studies, watches, has), Do / Does sorusu.',
        '“Sakın tıklama” sözlü turu: yanlışta nazikçe “Yaklaştın!” de, sonra doğru cümleyi birlikte kur.',
      ],
    },
    freeSpeaking: {
      minutes: 8,
      activities: [
        'Konu 1: Benim okul günüm: “I always … I usually … I never …” (gerçek ya da hayali cevap verebilirsin).',
        'Konu 2: Favori karakterin günü: “She often … He doesn’t …”',
        'Konu 3: Okuldan sonra ne yaparsın? Antrenman, ödev, kitap; hangisini ne sıklıkla yaparsın?',
        'Konu 4: Arkadaşına üç Do / Does sorusu sor.',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevaplar hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: “My school day” için altı cümle yaz ya da sesli kaydet: en az üç farklı sıklık zarfı, bir doesn’t ya da don’t cümlesi ve bir Do / Does sorusu kullan. Bu, Ünite 1 günlük rutin çıktındır.',
    },
  },
}
export default lesson
