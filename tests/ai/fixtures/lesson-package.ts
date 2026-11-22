/**
 * A complete, pedagogically reviewed A1–A2 lesson: daily routines with the
 * present simple. Used as the mocked model output in tests, and doubles as
 * demo content (it passes `LessonPackage` and the deterministic QA).
 */
import type { z } from 'zod'
import type { LessonPackage } from '@/domain/content.ts'

type PackageInput = z.input<typeof LessonPackage>

const tf = ['True', 'False']

export const lessonPackageFixture: PackageInput = {
  schemaVersion: 1,
  meta: {
    title: "Piko's Busy Monday",
    tagline: "Piko'nun yoğun pazartesi gününde günlük rutinleri anlatmayı öğren!",
    theme: 'Daily routines',
    character: 'piko',
    level: 'A1–A2',
    estimatedMinutes: 60,
    objectives: [
      { id: 'obj-routines', text: 'Günlük rutinlerini I / you / we ile anlatır (Present Simple).' },
      { id: 'obj-third-person', text: 'Başkasının rutinini he / she ile anlatır (-s / -es, has, does, goes).' },
      { id: 'obj-time', text: 'Zaman ifadelerini kullanır: at seven o’clock, after school, every Monday, in the evening.' },
    ],
    grammar: [
      'Present simple: I / you / we + base verb',
      'Present simple: he / she + -s / -es (has, does, goes)',
      'Time expressions: at + clock time, after school, every + day, in the evening',
    ],
  },
  review: {
    questions: [
      { id: 'rv-be-friend', type: 'choice', prompt: 'Sasha ___ my friend.', options: ['is', 'am', 'are'], answer: 0, hint: 'He / she / it ile hangi “be” kullanılır?', explain: 'Tek bir kişi (she) için **is** kullanırız.' },
      { id: 'rv-nice-to-meet', type: 'choice', prompt: 'What is “Nice to meet you” in Turkish?', options: ['Tanıştığımıza memnun oldum.', 'Görüşürüz.', 'Nasılsın?'], answer: 0, explain: 'Biriyle ilk kez tanışınca söyleriz.' },
    ],
  },
  vocabulary: [
    { id: 'v-wake-up', en: 'wake up', tr: 'uyanmak', example: { en: 'I wake up at seven o’clock.', tr: 'Saat yedide uyanırım.' }, context: 'Uykudan uyandığın an için kullanılır.', difficulty: 1, objectiveId: 'obj-routines' },
    { id: 'v-get-up', en: 'get up', tr: '(yataktan) kalkmak', example: { en: 'I get up after my alarm rings.', tr: 'Alarmım çaldıktan sonra kalkarım.' }, context: 'Uyandıktan sonra yataktan çıkmak.', difficulty: 2, objectiveId: 'obj-routines' },
    { id: 'v-have-breakfast', en: 'have breakfast', tr: 'kahvaltı yapmak', example: { en: 'We have breakfast at half past seven.', tr: 'Yedi buçukta kahvaltı yaparız.' }, context: 'İngilizcede kahvaltıyı “yapmayız”, “have” ederiz.', difficulty: 1, objectiveId: 'obj-routines' },
    { id: 'v-brush-teeth', en: 'brush my teeth', tr: 'dişlerimi fırçalamak', example: { en: 'I brush my teeth after breakfast.', tr: 'Kahvaltıdan sonra dişlerimi fırçalarım.' }, context: 'He / she ile: “brushes his / her teeth”.', difficulty: 2, objectiveId: 'obj-routines' },
    { id: 'v-get-dressed', en: 'get dressed', tr: 'giyinmek', example: { en: 'I get dressed in five minutes.', tr: 'Beş dakikada giyinirim.' }, context: 'Kıyafetlerini giymek.', difficulty: 2, objectiveId: 'obj-routines' },
    { id: 'v-catch-the-bus', en: 'catch the bus', tr: 'otobüse yetişmek', example: { en: 'Sasha catches the bus at eight.', tr: 'Sasha sekizde otobüse yetişir.' }, context: 'Otobüsü kaçırmadan binmek.', difficulty: 3, objectiveId: 'obj-third-person' },
    { id: 'v-go-to-school', en: 'go to school', tr: 'okula gitmek', example: { en: 'We go to school by bus.', tr: 'Okula otobüsle gideriz.' }, context: '“the” kullanmadan: go to school.', difficulty: 1, objectiveId: 'obj-routines' },
    { id: 'v-be-late-for', en: 'be late for', tr: '…e/a geç kalmak', example: { en: 'Momo is late for school again.', tr: 'Momo yine okula geç kaldı.' }, context: 'Bir yere ya da etkinliğe geç kalmak: late for school, late for the bus.', difficulty: 3, objectiveId: 'obj-third-person' },
    { id: 'v-have-lunch', en: 'have lunch', tr: 'öğle yemeği yemek', example: { en: 'Dora has lunch at half past twelve.', tr: 'Dora on iki buçukta öğle yemeği yer.' }, context: 'Öğle yemeği için “have” kullanılır.', difficulty: 1, objectiveId: 'obj-third-person' },
    { id: 'v-after-school', en: 'after school', tr: 'okuldan sonra', example: { en: 'I play games after school.', tr: 'Okuldan sonra oyun oynarım.' }, context: 'Genellikle cümlenin sonunda gelir.', difficulty: 1, objectiveId: 'obj-time' },
    { id: 'v-do-homework', en: 'do my homework', tr: 'ödevimi yapmak', example: { en: 'I do my homework in my room.', tr: 'Ödevimi odamda yaparım.' }, context: 'Ödev için “make” değil, “do” kullanılır.', difficulty: 2, objectiveId: 'obj-routines' },
    { id: 'v-play-football', en: 'play football', tr: 'futbol oynamak', example: { en: 'Leo and Piko play football every Monday.', tr: 'Leo ve Piko her pazartesi futbol oynar.' }, context: 'Sporlarla “play” kullanılır, “the” gerekmez.', difficulty: 1, objectiveId: 'obj-time' },
    { id: 'v-take-a-shower', en: 'take a shower', tr: 'duş almak', example: { en: 'I take a shower in the evening.', tr: 'Akşam duş alırım.' }, context: 'Türkçedeki “almak” gibi “take” kullanılır.', difficulty: 2, objectiveId: 'obj-time' },
    { id: 'v-watch-tv', en: 'watch TV', tr: 'televizyon izlemek', example: { en: 'My sister watches TV after dinner.', tr: 'Kız kardeşim akşam yemeğinden sonra televizyon izler.' }, context: 'He / she ile: watches.', difficulty: 1, objectiveId: 'obj-third-person' },
    { id: 'v-go-to-bed', en: 'go to bed', tr: 'yatmak', example: { en: 'I go to bed at ten o’clock.', tr: 'Saat onda yatarım.' }, context: 'Uyumak için yatağa gitmek.', difficulty: 1, objectiveId: 'obj-time' },
  ],
  story: {
    title: "Piko's Busy Monday",
    character: 'piko',
    setting: 'Piko’s home, the bus stop and school on a Monday',
    scenes: [
      {
        id: 'sc-morning',
        illustration: 'Piko jumps out of bed, alarm clock showing 7:00, school bag on the floor.',
        lines: [
          { speaker: 'narrator', en: "It is Monday. Piko wakes up at seven o'clock.", tr: 'Bugün pazartesi. Piko saat yedide uyanıyor.' },
          { speaker: 'piko', en: 'Oh no! I usually get up at half past six!', tr: 'Eyvah! Genelde altı buçukta kalkarım!' },
          { speaker: 'sasha', en: 'Good morning, Piko! Do you want to walk to the bus stop with me?', tr: 'Günaydın Piko! Benimle otobüs durağına yürümek ister misin?' },
          { speaker: 'piko', en: 'Yes! But first I have breakfast and brush my teeth.', tr: 'Evet! Ama önce kahvaltı yapıp dişlerimi fırçalıyorum.' },
          { speaker: 'narrator', en: 'Piko gets dressed very fast. His T-shirt is on back to front!', tr: 'Piko çok hızlı giyiniyor. Tişörtü ters!' },
        ],
        choice: {
          prompt: 'Piko is late. What should he do?',
          options: [
            { text: 'Have a quick breakfast.', feedback: 'Güzel seçim! Kısa bir kahvaltı bile güne enerjiyle başlamanı sağlar.' },
            { text: 'Run to the bus stop now.', feedback: 'Hızlı ama aç kalabilir! Yine de otobüse yetişmek de önemli.' },
          ],
        },
      },
      {
        id: 'sc-bus-stop',
        illustration: 'Sasha and Piko running to a bus stop; Momo behind them with one red and one blue shoe.',
        lines: [
          { speaker: 'narrator', en: 'Sasha and Piko run to the bus stop.', tr: 'Sasha ve Piko otobüs durağına koşuyor.' },
          { speaker: 'sasha', en: 'Quick! We can catch the bus!', tr: 'Çabuk! Otobüse yetişebiliriz!' },
          { speaker: 'momo', en: 'Wait for me! I am late for the bus again!', tr: 'Beni bekleyin! Otobüse yine geç kaldım!' },
          { speaker: 'piko', en: 'Momo, your shoes are different colours!', tr: 'Momo, ayakkabıların farklı renkte!' },
          { speaker: 'momo', en: 'Oh! I get dressed in the dark.', tr: 'Ah! Karanlıkta giyiniyorum.' },
          { speaker: 'narrator', en: 'They catch the bus and go to school together.', tr: 'Otobüse yetişiyorlar ve birlikte okula gidiyorlar.' },
        ],
      },
      {
        id: 'sc-school',
        illustration: 'School canteen at lunchtime; Dora and Piko at a table, Leo holding a football.',
        lines: [
          { speaker: 'dora', en: 'Hi, Piko! I have lunch at half past twelve. What about you?', tr: 'Selam Piko! Ben on iki buçukta öğle yemeği yerim. Ya sen?' },
          { speaker: 'piko', en: 'Me too. And after school, I play football with Leo.', tr: 'Ben de. Okuldan sonra da Leo ile futbol oynarım.' },
          { speaker: 'leo', en: 'Yes, we play football every Monday. Then I do my homework.', tr: 'Evet, her pazartesi futbol oynarız. Sonra ödevimi yaparım.' },
          { speaker: 'dora', en: 'Piko, do you do your homework after football?', tr: 'Piko, sen ödevini futboldan sonra mı yaparsın?' },
          { speaker: 'piko', en: "Yes, I do. I'm tired, but I finish it!", tr: 'Evet. Yorgunum ama bitiririm!' },
        ],
        choice: {
          prompt: 'When do you do your homework?',
          options: [
            { text: 'Right after school.', feedback: 'Harika! Ödevini erkenden bitirirsen akşam boş zamanın olur.' },
            { text: 'In the evening.', feedback: 'Olur! Önce biraz dinlenmek de iyi gelebilir.' },
            { text: 'After dinner.', feedback: 'Tamam! Yeter ki yatmadan önce bitsin.' },
          ],
        },
      },
      {
        id: 'sc-evening',
        illustration: 'Piko in pyjamas on the sofa with a towel on his head, a clock showing 9:30.',
        lines: [
          { speaker: 'narrator', en: 'In the evening, Piko takes a shower.', tr: 'Akşam Piko duş alıyor.' },
          { speaker: 'piko', en: 'Now I watch TV for half an hour.', tr: 'Şimdi yarım saat televizyon izliyorum.' },
          { speaker: 'narrator', en: 'At half past nine, Piko goes to bed.', tr: 'Dokuz buçukta Piko yatıyor.' },
          { speaker: 'piko', en: 'Tomorrow I wake up on time. Good night!', tr: 'Yarın zamanında uyanacağım. İyi geceler!' },
        ],
      },
    ],
    questions: [
      { id: 'st-wake-time', type: 'choice', prompt: 'What time does Piko wake up on Monday?', options: ["At six o'clock", 'At half past six', "At seven o'clock"], answer: 2, hint: 'İlk sahnenin ilk cümlesine bak.', explain: "Piko saat yedide uyanıyor: “Piko wakes up at seven o'clock.”", objectiveId: 'obj-time', vocabId: 'v-wake-up' },
      { id: 'st-momo-late', type: 'choice', prompt: 'Momo is late for the bus.', options: tf, answer: 0, hint: 'Momo durakta ne diyor?', explain: 'Momo “I am late for the bus again!” diyor.', objectiveId: 'obj-third-person', vocabId: 'v-be-late-for' },
      { id: 'st-order-football', type: 'order', prompt: 'Put the words in order.', tokens: ['football', 'Piko', 'school.', 'plays', 'after'], answer: ['Piko', 'plays', 'football', 'after', 'school.'], hint: 'Kim? → Ne yapar? → Ne zaman?', explain: 'He / she ile fiile -s gelir: Piko **plays**.', objectiveId: 'obj-third-person', vocabId: 'v-play-football' },
    ],
  },
  explanation: {
    steps: [
      {
        id: 'ex-routines',
        title: 'Her gün yaptıklarımız',
        body: 'Her gün ya da genellikle yaptığımız şeyleri **Present Simple** ile anlatırız. **I, you, we** ile fiil hiç değişmez.',
        examples: [
          { en: 'I get up at seven.', tr: 'Yedide kalkarım.' },
          { en: 'You have breakfast with your family.', tr: 'Ailenle kahvaltı yaparsın.' },
          { en: 'We go to school by bus.', tr: 'Okula otobüsle gideriz.' },
        ],
        check: { id: 'ex-check-have', type: 'choice', prompt: 'I ___ breakfast at half past seven.', options: ['have', 'has', 'having'], answer: 0, hint: 'Özne “I”. Fiil değişir mi?', explain: '**I** ile fiil yalın kalır: I **have** breakfast.', objectiveId: 'obj-routines', vocabId: 'v-have-breakfast' },
      },
      {
        id: 'ex-he-she',
        title: 'He / she: fiile -s ekle',
        body: 'Başka biri (he, she, Piko, my sister) için fiile **-s** ekleriz. -ch, -sh ile biten fiillere **-es** gelir. Üç özel fiil: have → **has**, do → **does**, go → **goes**.',
        examples: [
          { en: 'Piko gets up late.', tr: 'Piko geç kalkar.' },
          { en: 'Sasha watches TV.', tr: 'Sasha televizyon izler.' },
          { en: 'Dora has lunch at school.', tr: 'Dora öğle yemeğini okulda yer.' },
          { en: 'Leo does his homework.', tr: 'Leo ödevini yapar.' },
        ],
        check: { id: 'ex-check-does', type: 'choice', prompt: 'Leo ___ his homework after football.', options: ['do', 'does', 'doing'], answer: 1, hint: 'Leo = he. “do” nasıl değişir?', explain: 'He / she ile do → **does**.', objectiveId: 'obj-third-person', vocabId: 'v-do-homework' },
      },
      {
        id: 'ex-time',
        title: 'Ne zaman?',
        body: 'Saatlerle **at** kullanırız: at seven o’clock. Ayrıca: **after school**, **every Monday**, **in the evening**. Bunlar genelde cümlenin sonuna gelir.',
        examples: [
          { en: 'I wake up at seven o’clock.', tr: 'Saat yedide uyanırım.' },
          { en: 'We play football every Monday.', tr: 'Her pazartesi futbol oynarız.' },
          { en: 'She takes a shower in the evening.', tr: 'Akşam duş alır.' },
        ],
        check: { id: 'ex-check-every', type: 'choice', prompt: 'They play football ___ Monday.', options: ['every', 'at', 'in'], answer: 0, hint: '“Her pazartesi” demek istiyoruz.', explain: '“Her” anlamında **every** kullanırız: every Monday.', objectiveId: 'obj-time' },
      },
    ],
  },
  homework: {
    groups: [
      {
        id: 'hw-1',
        objectiveId: 'obj-routines',
        complete: { id: 'hw-1-complete', type: 'choice', prompt: "I ___ breakfast at seven o'clock.", options: ['have', 'has', 'do'], answer: 0, hint: 'Özne “I”.', explain: 'I + yalın fiil: I **have** breakfast.', objectiveId: 'obj-routines', vocabId: 'v-have-breakfast' },
        order: { id: 'hw-1-order', type: 'order', prompt: 'Put the words in order.', tokens: ['breakfast', 'I', 'at', "o'clock.", 'seven', 'have'], answer: ['I', 'have', 'breakfast', 'at', 'seven', "o'clock."], hint: 'Kim? → Ne yapar? → Ne zaman?', explain: 'Zaman ifadesi sona gelir.', objectiveId: 'obj-routines' },
        meaning: { id: 'hw-1-meaning', type: 'choice', prompt: "What does it mean? “I have breakfast at seven o'clock.”", options: ['Saat yedide kahvaltı yaparım.', 'Saat yedide uyanırım.', 'Saat yedide okula giderim.'], answer: 0, hint: '“have breakfast” ne demekti?', explain: 'have breakfast = kahvaltı yapmak.', objectiveId: 'obj-routines', vocabId: 'v-have-breakfast' },
      },
      {
        id: 'hw-2',
        objectiveId: 'obj-third-person',
        complete: { id: 'hw-2-complete', type: 'text', prompt: 'Sasha ___ (catch) the bus at eight.', accept: ['catches'], hint: '-ch ile biten fiil + he/she → ?', explain: 'catch → **catches** (-ch ile bittiği için -es).', objectiveId: 'obj-third-person', vocabId: 'v-catch-the-bus' },
        order: { id: 'hw-2-order', type: 'order', prompt: 'Put the words in order.', tokens: ['the', 'catches', 'Sasha', 'at', 'bus', 'eight.'], answer: ['Sasha', 'catches', 'the', 'bus', 'at', 'eight.'], hint: 'Cümle “Sasha” ile başlar.', explain: 'Sasha + catches + the bus + at eight.', objectiveId: 'obj-third-person' },
        meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'What does it mean? “Sasha catches the bus at eight.”', options: ['Sasha sekizde otobüse yetişir.', 'Sasha sekizde otobüsü kaçırır.', 'Sasha sekizde okula yürür.'], answer: 0, hint: '“catch the bus” = otobüse …', explain: 'catch the bus = otobüse yetişmek.', objectiveId: 'obj-third-person', vocabId: 'v-catch-the-bus' },
      },
      {
        id: 'hw-3',
        objectiveId: 'obj-third-person',
        complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Momo ___ late for school.', options: ['is', 'are', 'am'], answer: 0, hint: 'Momo = he.', explain: 'He / she ile **is**: Momo is late.', objectiveId: 'obj-third-person', vocabId: 'v-be-late-for' },
        order: { id: 'hw-3-order', type: 'order', prompt: 'Put the words in order.', tokens: ['late', 'Momo', 'school.', 'for', 'is'], answer: ['Momo', 'is', 'late', 'for', 'school.'], hint: 'be late for + yer.', explain: 'Momo is late for school.', objectiveId: 'obj-third-person' },
        meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'What does it mean? “Momo is late for school.”', options: ['Momo okula geç kalıyor.', 'Momo okulu çok seviyor.', 'Momo okula erken geliyor.'], answer: 0, hint: '“late” = geç.', explain: 'be late for = …e geç kalmak.', objectiveId: 'obj-third-person', vocabId: 'v-be-late-for' },
      },
      {
        id: 'hw-4',
        objectiveId: 'obj-time',
        complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Leo does his homework ___ school.', options: ['after', 'at', 'on'], answer: 0, hint: '“Okuldan sonra” demek istiyoruz.', explain: 'after school = okuldan sonra.', objectiveId: 'obj-time', vocabId: 'v-after-school' },
        order: { id: 'hw-4-order', type: 'order', prompt: 'Put the words in order.', tokens: ['homework', 'Leo', 'after', 'his', 'does', 'school.'], answer: ['Leo', 'does', 'his', 'homework', 'after', 'school.'], hint: 'Kim? → Ne yapar? → Ne zaman?', explain: 'Leo does his homework after school.', objectiveId: 'obj-time' },
        meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'What does it mean? “Leo does his homework after school.”', options: ['Leo ödevini okuldan sonra yapar.', 'Leo ödevini okulda yapar.', 'Leo okuldan sonra futbol oynar.'], answer: 0, hint: 'after school = ?', explain: 'does his homework = ödevini yapar.', objectiveId: 'obj-time', vocabId: 'v-do-homework' },
      },
      {
        id: 'hw-5',
        objectiveId: 'obj-routines',
        complete: { id: 'hw-5-complete', type: 'choice', prompt: 'We ___ football every Monday.', options: ['play', 'plays', 'playing'], answer: 0, hint: 'Özne “we”.', explain: 'We + yalın fiil: we **play**.', objectiveId: 'obj-routines', vocabId: 'v-play-football' },
        order: { id: 'hw-5-order', type: 'order', prompt: 'Put the words in order.', tokens: ['every', 'play', 'We', 'Monday.', 'football'], answer: ['We', 'play', 'football', 'every', 'Monday.'], hint: '“every Monday” sona gelir.', explain: 'We play football every Monday.', objectiveId: 'obj-routines' },
        meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'What does it mean? “We play football every Monday.”', options: ['Her pazartesi futbol oynarız.', 'Her pazartesi televizyon izleriz.', 'Pazartesi günleri futbol oynamayız.'], answer: 0, hint: 'every Monday = ?', explain: 'every Monday = her pazartesi.', objectiveId: 'obj-routines', vocabId: 'v-play-football' },
      },
      {
        id: 'hw-6',
        objectiveId: 'obj-time',
        complete: { id: 'hw-6-complete', type: 'text', prompt: 'Piko ___ (go) to bed at half past nine.', accept: ['goes'], hint: 'go + he/she → ?', explain: 'go → **goes**.', objectiveId: 'obj-time', vocabId: 'v-go-to-bed' },
        order: { id: 'hw-6-order', type: 'order', prompt: 'Put the words in order.', tokens: ['to', 'Piko', 'half', 'goes', 'bed', 'at', 'nine.', 'past'], answer: ['Piko', 'goes', 'to', 'bed', 'at', 'half', 'past', 'nine.'], hint: '“at half past nine” bir bütün.', explain: 'Piko goes to bed at half past nine.', objectiveId: 'obj-time' },
        meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'What does it mean? “Piko goes to bed at half past nine.”', options: ['Piko dokuz buçukta yatar.', 'Piko dokuzda uyanır.', 'Piko dokuz buçukta duş alır.'], answer: 0, hint: 'go to bed = ?', explain: 'go to bed = yatmak; half past nine = dokuz buçuk.', objectiveId: 'obj-time', vocabId: 'v-go-to-bed' },
      },
    ],
  },
  assessment: {
    quiz: [
      { id: 'as-shower', type: 'choice', prompt: 'Dora ___ a shower every evening.', options: ['takes', 'take', 'taking', 'is take'], answer: 0, objectiveId: 'obj-third-person', vocabId: 'v-take-a-shower' },
      { id: 'as-go-school', type: 'choice', prompt: 'I ___ to school by bus.', options: ['go', 'goes', 'going'], answer: 0, objectiveId: 'obj-routines', vocabId: 'v-go-to-school' },
      { id: 'as-get-dressed', type: 'choice', prompt: 'What is “get dressed” in Turkish?', options: ['giyinmek', 'uyanmak', 'duş almak', 'yatmak'], answer: 0, objectiveId: 'obj-routines', vocabId: 'v-get-dressed' },
      { id: 'as-catch-bus', type: 'choice', prompt: 'What is “otobüse yetişmek” in English?', options: ['catch the bus', 'be late for', 'go to school', 'get up'], answer: 0, objectiveId: 'obj-third-person', vocabId: 'v-catch-the-bus' },
      { id: 'as-watches', type: 'choice', prompt: 'My brother ___ TV after dinner.', options: ['watches', 'watch', 'watching'], answer: 0, objectiveId: 'obj-third-person', vocabId: 'v-watch-tv' },
      { id: 'as-correct-sentence', type: 'choice', prompt: 'Choose the correct sentence.', options: ["She has lunch at one o'clock.", "She have lunch at one o'clock.", "She haves lunch at one o'clock."], answer: 0, objectiveId: 'obj-third-person', vocabId: 'v-have-lunch' },
      { id: 'as-teeth', type: 'text', prompt: 'Write the missing word: I brush my ___ every morning.', accept: ['teeth'], objectiveId: 'obj-routines', vocabId: 'v-brush-teeth' },
      { id: 'as-order-gets-up', type: 'order', prompt: 'Make a sentence about Leo’s morning.', tokens: ['every', 'gets', 'day.', 'Leo', 'up', 'early'], answer: ['Leo', 'gets', 'up', 'early', 'every', 'day.'], objectiveId: 'obj-third-person', vocabId: 'v-get-up' },
      { id: 'as-at-eight', type: 'choice', prompt: "We have breakfast ___ eight o'clock.", options: ['at', 'on', 'in'], answer: 0, objectiveId: 'obj-time' },
      { id: 'as-evening', type: 'choice', prompt: 'Which one do you usually do in the evening?', options: ['go to bed', 'wake up', 'have breakfast'], answer: 0, objectiveId: 'obj-time', vocabId: 'v-go-to-bed' },
    ],
    reading: {
      title: 'A Day with Dora',
      paragraphs: [
        'Dora is Piko’s friend. She is very sporty. Every day, she wakes up at six o’clock and gets up quickly. She takes a shower and has breakfast with her dad.',
        'Dora goes to school by bus. She is never late for school. She has lunch with Sasha at half past twelve.',
        'After school, Dora plays football with Leo and Piko. In the evening, she does her homework. She watches TV for a short time, and she goes to bed at ten o’clock.',
      ],
      questions: [
        { id: 'rd-tf-wake', type: 'choice', prompt: 'Dora wakes up at six o’clock.', options: tf, answer: 0, objectiveId: 'obj-time' },
        { id: 'rd-tf-breakfast', type: 'choice', prompt: 'Dora has breakfast with her mum.', options: tf, answer: 1, objectiveId: 'obj-third-person' },
        { id: 'rd-tf-late', type: 'choice', prompt: 'Dora is often late for school.', options: tf, answer: 1, objectiveId: 'obj-third-person' },
        { id: 'rd-tf-football', type: 'choice', prompt: 'Dora plays football after school.', options: tf, answer: 0, objectiveId: 'obj-time' },
        { id: 'rd-tf-bed', type: 'choice', prompt: 'Dora goes to bed at nine o’clock.', options: tf, answer: 1, objectiveId: 'obj-time' },
        { id: 'rd-fill-bus', type: 'choice', prompt: 'Dora goes to school ___ bus.', options: ['by', 'on', 'with', 'in'], answer: 0, objectiveId: 'obj-routines' },
        { id: 'rd-fill-lunch', type: 'choice', prompt: 'She has lunch with ___ at half past twelve.', options: ['Sasha', 'Leo', 'Momo', 'Piko'], answer: 0, objectiveId: 'obj-third-person' },
        { id: 'rd-fill-homework', type: 'choice', prompt: 'In the evening, she ___ her homework.', options: ['does', 'makes', 'plays', 'takes'], answer: 0, objectiveId: 'obj-third-person' },
      ],
    },
  },
}
