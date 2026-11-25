/**
 * "School Life" lesson: he / she / it + is / isn't, and "Is he ...?" (A1, ages 8-15).
 * Theme `u4-school-bell`, character sasha. Only content slots differ from the Unit 1 reference plan
 * (docs/play/patterns.md section 10). Data only: `school-life.ts` saves and publishes it.
 * Every question sits in a scene with a named character; hints and explanations speak to "sen".
 */
import type { z } from 'zod'
import type { LessonPackage, SpeakingPlan, TeacherGuide } from '@/domain/content.ts'

type PackageInput = z.input<typeof LessonPackage>

const tf = ['True', 'False']
const pron = ['He', 'She', 'It']

export const schoolLifePackageInput: PackageInput = {
  schemaVersion: 1,
  meta: {
    title: 'Sasha and the Missing Sandwich',
    tagline: 'Leo’nun sandviçi kayıp! Sasha ile okulu gez, he, she ve it ile şüphelileri bul.',
    theme: 'School life',
    character: 'sasha',
    level: 'A1',
    estimatedMinutes: 45,
    objectives: [
      { id: 'obj-who', text: 'Erkek için he, kız için she, eşya ve hayvan için it kullanır.' },
      { id: 'obj-is', text: 'he / she / it ile is ve isn’t cümleleri kurar.' },
      { id: 'obj-question', text: '“Is he / she / it …?” sorusunu sorar ve “Yes, he is. / No, she isn’t.” diye cevaplar.' },
      { id: 'obj-school', text: 'Okul hayatı kelimelerini (sınıf, kantin, kütüphane, okul eşyaları) söyler.' },
      { id: 'obj-remind', text: 'I am ve you are kalıbını hatırlar (sadece tekrar).' },
    ],
    grammar: [
      'he / she / it + is / isn’t',
      'Is he / she / it …? Yes, he is. / No, she isn’t.',
      'Hatırlatma: I am, you are',
    ],
    themeId: 'u4-school-bell',
  },
  review: {
    questions: [
      { id: 'rv-i-am', type: 'choice', prompt: 'Leo points at himself and says: “I ___ Leo.”', options: ['am', 'is', 'are'], answer: 0, hint: 'Konuşan kişi kendinden bahsediyor: I.', explain: '**I** ile **am** gelir: I am Leo.', objectiveId: 'obj-remind' },
      { id: 'rv-you-are', type: 'choice', prompt: 'Sasha looks at Piko and says: “You ___ in the library!”', options: ['are', 'is', 'am'], answer: 0, hint: 'Sasha karşısındaki kişiyle konuşuyor: you.', explain: '**You** ile **are** gelir: You are in the library.', objectiveId: 'obj-remind' },
      { id: 'rv-you-friend', type: 'choice', prompt: 'Momo tells Dora: “___ are my friend!”', options: ['You', 'He', 'She'], answer: 0, hint: 'Momo karşısındaki kişiye “sen” diyor.', explain: '“Are” ile **you** gelir: You are my friend.', objectiveId: 'obj-remind' },
    ],
  },
  vocabulary: [
    { id: 'v-classroom', en: 'classroom', tr: 'sınıf', example: { en: 'Leo is in the classroom.', tr: 'Leo sınıfta.' }, difficulty: 1, objectiveId: 'obj-school' },
    { id: 'v-playground', en: 'playground', tr: 'oyun bahçesi', example: { en: 'Dora is in the playground.', tr: 'Dora oyun bahçesinde.' }, difficulty: 1, objectiveId: 'obj-school' },
    { id: 'v-canteen', en: 'canteen', tr: 'kantin', example: { en: 'The canteen is noisy at break time.', tr: 'Kantin teneffüste gürültülü.' }, context: 'Okulda yemek ve atıştırmalık alınan yer.', difficulty: 1, objectiveId: 'obj-school' },
    { id: 'v-library', en: 'library', tr: 'kütüphane', example: { en: 'Sasha is in the library.', tr: 'Sasha kütüphanede.' }, difficulty: 1, objectiveId: 'obj-school' },
    { id: 'v-teacher', en: 'teacher', tr: 'öğretmen', example: { en: 'The teacher is at the whiteboard.', tr: 'Öğretmen tahtanın başında.' }, difficulty: 1, objectiveId: 'obj-school' },
    { id: 'v-school-bag', en: 'school bag', tr: 'okul çantası', example: { en: 'Leo opens his school bag.', tr: 'Leo okul çantasını açıyor.' }, difficulty: 1, objectiveId: 'obj-school' },
    { id: 'v-pencil-case', en: 'pencil case', tr: 'kalem kutusu', example: { en: 'Sasha has a blue pencil case.', tr: 'Sasha’nın mavi bir kalem kutusu var.' }, difficulty: 2, objectiveId: 'obj-school' },
    { id: 'v-whiteboard', en: 'whiteboard', tr: 'beyaz tahta', example: { en: 'The whiteboard is new.', tr: 'Beyaz tahta yeni.' }, difficulty: 2, objectiveId: 'obj-school' },
    { id: 'v-chess-club', en: 'chess club', tr: 'satranç kulübü', example: { en: 'Piko is in the chess club.', tr: 'Piko satranç kulübünde.' }, context: '“Kulüpte olmak” için “in the … club” dersin.', difficulty: 3, objectiveId: 'obj-school' },
    { id: 'v-break-time', en: 'break time', tr: 'teneffüs', example: { en: 'It is break time!', tr: 'Teneffüs zamanı!' }, context: 'Zamandan söz ederken “It is …” ile başlarsın.', difficulty: 2, objectiveId: 'obj-school' },
    { id: 'v-hungry', en: 'hungry', tr: 'aç', example: { en: 'Leo is hungry.', tr: 'Leo aç.' }, difficulty: 1, objectiveId: 'obj-is' },
    { id: 'v-noisy', en: 'noisy', tr: 'gürültülü', example: { en: 'The playground is noisy.', tr: 'Oyun bahçesi gürültülü.' }, difficulty: 2, objectiveId: 'obj-is' },
    { id: 'v-quiet', en: 'quiet', tr: 'sessiz', example: { en: 'The library is quiet.', tr: 'Kütüphane sessiz.' }, difficulty: 2, objectiveId: 'obj-is' },
    { id: 'v-funny', en: 'funny', tr: 'komik', example: { en: 'Momo is funny.', tr: 'Momo komik.' }, difficulty: 2, objectiveId: 'obj-is' },
  ],
  story: {
    title: 'The Missing Sandwich',
    character: 'sasha',
    setting: 'A school at break time: classroom, canteen, library and playground',
    scenes: [
      {
        id: 'sc-classroom',
        illustration: 'Leo and Sasha in a bright classroom, an open school bag on the desk and a whiteboard behind them.',
        lines: [
          { speaker: 'narrator', en: 'It is break time. Leo is in the classroom.', tr: 'Teneffüs zamanı. Leo sınıfta.' },
          { speaker: 'leo', en: 'I am so hungry! My sandwich isn’t in my school bag!', tr: 'Çok açım! Sandviçim okul çantamda değil!' },
          { speaker: 'sasha', en: 'Don’t worry, Leo. I am a detective today. You are my helper.', tr: 'Merak etme Leo. Bugün dedektifim. Sen de yardımcımsın.' },
          { speaker: 'narrator', en: 'Sasha has a pencil case. She is at the whiteboard.', tr: 'Sasha’nın bir kalem kutusu var. O, beyaz tahtanın başında.' },
          { speaker: 'sasha', en: 'Clue one: the teacher isn’t here. She is at the canteen.', tr: 'Birinci ipucu: öğretmen burada değil. O, kantinde.' },
        ],
      },
      {
        id: 'sc-canteen',
        illustration: 'A noisy canteen: Momo drops a tray, the teacher sits at a table with a cup of tea, crumbs on the floor.',
        lines: [
          { speaker: 'narrator', en: 'The canteen is noisy. Momo drops a tray!', tr: 'Kantin gürültülü. Momo bir tepsi düşürüyor!' },
          { speaker: 'momo', en: 'Oops! I am clumsy, but I am not a thief!', tr: 'Hoppala! Sakarım ama hırsız değilim!' },
          { speaker: 'narrator', en: 'The teacher is at a table. She isn’t hungry. She has tea.', tr: 'Öğretmen bir masada. O aç değil. Çay içiyor.' },
          { speaker: 'sasha', en: 'Look! A crumb. It is a clue!', tr: 'Bak! Bir kırıntı. Bu bir ipucu!' },
          { speaker: 'sasha', en: 'The crumbs go to the library. Come on, Leo!', tr: 'Kırıntılar kütüphaneye gidiyor. Hadi Leo!' },
        ],
      },
      {
        id: 'sc-library',
        illustration: 'A very quiet library: Piko plays chess and shouts at a table, Dora reads, a sleepy school cat is under a chair.',
        lines: [
          { speaker: 'narrator', en: 'The library is quiet. Piko is at the chess club table. He is noisy!', tr: 'Kütüphane sessiz. Piko satranç kulübü masasında. O gürültülü!' },
          { speaker: 'piko', en: 'Checkmate! I am the best in the chess club!', tr: 'Şah mat! Satranç kulübünün en iyisi benim!' },
          { speaker: 'dora', en: 'Shh, Piko! Sasha, look under the chair. Is it a cat?', tr: 'Şşt, Piko! Sasha, sandalyenin altına bak. Bu bir kedi mi?' },
          { speaker: 'sasha', en: 'Yes, it is! It is the school cat, and it has crumbs!', tr: 'Evet! Bu okulun kedisi ve kırıntıları var!' },
          { speaker: 'narrator', en: 'The cat is sleepy. It isn’t a thief now. It is a very full cat.', tr: 'Kedi uykulu. Artık hırsız değil. Karnı çok tok bir kedi.' },
        ],
        choice: {
          prompt: 'What should Sasha do now?',
          options: [
            { text: 'Tell Leo the good news.', feedback: 'Güzel seçim! Bir dedektif önce arkadaşına haber verir.' },
            { text: 'Give the cat a snack.', feedback: 'Nazik seçim! Kedi de aç ama sandviç Leo’nun, ona dokunma.' },
          ],
        },
      },
      {
        id: 'sc-playground',
        illustration: 'Leo, Dora, Piko, Momo and Sasha laugh in the playground; the school cat naps on a bench.',
        lines: [
          { speaker: 'narrator', en: 'Break time is not over. Everyone is in the playground.', tr: 'Teneffüs bitmedi. Herkes oyun bahçesinde.' },
          { speaker: 'leo', en: 'The cat is the thief? That is funny!', tr: 'Hırsız kedi mi? Bu çok komik!' },
          { speaker: 'dora', en: 'Sasha is a great detective. She is fast!', tr: 'Sasha harika bir dedektif. O çok hızlı!' },
          { speaker: 'sasha', en: 'Leo is he. Dora is she. The cat is it. And you? You are my team!', tr: 'Leo “he”. Dora “she”. Kedi “it”. Ya sen? Sen benim takımımsın!' },
        ],
      },
    ],
    questions: [
      { id: 'st-q-bag', type: 'choice', prompt: 'Leo opens his school bag, and his sandwich is in it.', options: tf, answer: 1, hint: 'Leo ilk sahnede ne diyor? “isn’t in my school bag” ne demek?', explain: 'Sandviç çantada **değil**: “My sandwich isn’t in my school bag.”', objectiveId: 'obj-is', vocabId: 'v-school-bag' },
      { id: 'st-q-thief', type: 'choice', prompt: 'In the library, Dora looks under the chair. Who is the thief?', options: ['The school cat', 'Momo', 'Piko'], answer: 0, hint: 'Kırıntılar kimde?', explain: 'Sandviç kırıntıları kedide: “It is the school cat.”', objectiveId: 'obj-question', vocabId: 'v-library' },
      { id: 'st-q-order', type: 'order', prompt: 'Sasha whispers in the library. Put her words in order.', tokens: ['is', 'The', 'quiet.', 'library'], answer: ['The', 'library', 'is', 'quiet.'], hint: 'Önce “kim”, sonra is, sonra nasıl.', explain: 'The library **is** quiet.', objectiveId: 'obj-is', vocabId: 'v-quiet' },
      { id: 'st-q-cat', type: 'choice', prompt: 'Sasha talks about the school cat: “___ is sleepy and full.”', options: pron, answer: 2, hint: 'Kedi bir hayvan: he mi, she mi, it mi?', explain: 'Hayvanlar için **it** deriz: It is sleepy.', objectiveId: 'obj-who' },
    ],
  },
  explanation: {
    steps: [
      {
        id: 'ex-who',
        title: 'Kim he, kim she, kim it?',
        body: 'Teneffüs zili çaldı, bahçeye bakıyorsun. Erkek biri için **he**, kız biri için **she** dersin. Eşya ve hayvan için **it** dersin: çanta, tahta, kedi.',
        examples: [
          { en: 'He is Leo.', tr: 'O, Leo. (erkek)' },
          { en: 'She is Dora.', tr: 'O, Dora. (kız)' },
          { en: 'It is a pencil case.', tr: 'O, bir kalem kutusu. (eşya)' },
        ],
        check: { id: 'ex-check-who', type: 'choice', prompt: 'Sasha points at the whiteboard: “___ is new.”', options: pron, answer: 2, hint: 'Tahta kız mı, erkek mi, yoksa bir eşya mı?', explain: 'Tahta bir eşya, o yüzden **it**: It is new.', objectiveId: 'obj-who', vocabId: 'v-whiteboard' },
      },
      {
        id: 'ex-is',
        title: 'Üçünün kapıcısı: is',
        body: '**He**, **she** ve **it** aynı kulübe girer. Kulübün kapıcısı **is**. Yani: **he is**, **she is**, **it is**.',
        examples: [
          { en: 'He is hungry.', tr: 'O aç.' },
          { en: 'She is in the library.', tr: 'O kütüphanede.' },
          { en: 'It is noisy.', tr: 'O gürültülü.' },
        ],
        check: { id: 'ex-check-is', type: 'choice', prompt: 'Piko is at the canteen. He ___ hungry.', options: ['is', 'are', 'am'], answer: 0, hint: 'Piko için “he” dedik. He’nin kapıcısı kim?', explain: '**He** ile **is** gelir: He is hungry.', objectiveId: 'obj-is', vocabId: 'v-hungry' },
      },
      {
        id: 'ex-isnt',
        title: 'Kapıcıya “hayır” dersek: isn’t',
        body: 'Bir şey öyle değilse **isn’t** yazarsın: is + not. Kütüphane gürültülü değil mi? O zaman: **It isn’t noisy.**',
        examples: [
          { en: 'She isn’t noisy.', tr: 'O gürültülü değil.' },
          { en: 'He isn’t in the classroom.', tr: 'O sınıfta değil.' },
          { en: 'It isn’t a cat.', tr: 'O bir kedi değil.' },
        ],
        check: { id: 'ex-check-isnt', type: 'choice', prompt: 'Sasha is in the library, and the library is very quiet. It ___ noisy.', options: ['is', 'isn’t', 'aren’t'], answer: 1, hint: 'Kütüphane sessiz. Gürültülü mü?', explain: 'Sessiz demek gürültülü **değil** demek: It **isn’t** noisy.', objectiveId: 'obj-is', vocabId: 'v-noisy' },
      },
      {
        id: 'ex-question',
        title: 'Soru: Is he …? Is she …?',
        body: 'Soru sormak için kapıcı öne geçer: **Is** he …? Cevap kısa: **Yes, he is.** ya da **No, he isn’t.**',
        examples: [
          { en: 'Is she in the playground?', tr: 'O oyun bahçesinde mi?' },
          { en: 'Yes, she is.', tr: 'Evet, öyle.' },
          { en: 'No, it isn’t.', tr: 'Hayır, değil.' },
        ],
        check: { id: 'ex-check-question', type: 'choice', prompt: 'Momo asks about the teacher: “___ she in the classroom?”', options: ['Is', 'Are', 'Am'], answer: 0, hint: 'Cümlenin başına he, she, it’in kapıcısı geçer.', explain: 'Soruda kapıcı öne geçer: **Is** she in the classroom?', objectiveId: 'obj-question', vocabId: 'v-teacher' },
      },
      {
        id: 'ex-remind',
        title: 'Hatırlatma: I am, you are',
        body: 'Eski dostlar unutulmasın: **I** ile **am**, **you** ile **are** gelir. Bu derste sadece he, she, it ile **is** var.',
        examples: [
          { en: 'I am Sasha.', tr: 'Ben Sasha’yım.' },
          { en: 'You are my helper.', tr: 'Sen benim yardımcımsın.' },
        ],
        check: { id: 'ex-check-remind', type: 'choice', prompt: 'Sasha says to Leo: “I ___ a detective, and you ___ my helper.”', options: ['am / are', 'is / are', 'am / is'], answer: 0, hint: 'I’ın arkadaşı am, you’nun arkadaşı are.', explain: '**I am**, **you are**: I am a detective, and you are my helper.', objectiveId: 'obj-remind' },
      },
    ],
  },
  homework: {
    groups: [
      {
        id: 'hw-1',
        objectiveId: 'obj-who',
        complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Sasha points at Dora in the library: “___ is in the library.”', options: pron, answer: 1, hint: 'Dora bir kız.', explain: 'Dora kız, o yüzden **she**: She is in the library.', objectiveId: 'obj-who', vocabId: 'v-library' },
        order: { id: 'hw-1-order', type: 'order', prompt: 'Sasha writes a note on the whiteboard. Build her sentence.', tokens: ['library.', 'the', 'is', 'in', 'She'], answer: ['She', 'is', 'in', 'the', 'library.'], hint: 'Kim? → is → nerede?', explain: 'She is in the library.', objectiveId: 'obj-who' },
        meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Leo reads Sasha’s note: “She is in the library.” What does it mean?', options: ['O kütüphanede.', 'O kantinde.', 'O sınıfta.'], answer: 0, hint: 'library = kütüphane', explain: 'library = kütüphane. O kütüphanede.', objectiveId: 'obj-who', vocabId: 'v-library' },
      },
      {
        id: 'hw-2',
        objectiveId: 'obj-who',
        complete: { id: 'hw-2-complete', type: 'text', prompt: 'Leo is hungry. Type the missing word: “___ is in the canteen.”', accept: ['He'], hint: 'Leo bir erkek: he mi, she mi?', explain: 'Leo erkek, o yüzden **He** is in the canteen.', objectiveId: 'obj-who', vocabId: 'v-canteen' },
        order: { id: 'hw-2-order', type: 'order', prompt: 'Momo shouts in the canteen. Put her words in order.', tokens: ['canteen.', 'He', 'in', 'is', 'the'], answer: ['He', 'is', 'in', 'the', 'canteen.'], hint: 'Önce kim, sonra is.', explain: 'He is in the canteen.', objectiveId: 'obj-who' },
        meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Momo points at Leo: “He is in the canteen.” What does she mean?', options: ['O kantinde.', 'O oyun bahçesinde.', 'O kütüphanede.'], answer: 0, hint: 'canteen = kantin', explain: 'canteen = kantin. O kantinde.', objectiveId: 'obj-who', vocabId: 'v-canteen' },
      },
      {
        id: 'hw-3',
        objectiveId: 'obj-is',
        complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Momo looks at the playground at break time: “___ is noisy.”', options: pron, answer: 2, hint: 'Oyun bahçesi bir yer. Yer = eşya gibi düşün.', explain: 'Yerler ve eşyalar için **it**: It is noisy.', objectiveId: 'obj-is', vocabId: 'v-noisy' },
        order: { id: 'hw-3-order', type: 'order', prompt: 'Piko reports from the playground. Build his sentence.', tokens: ['noisy.', 'It', 'is'], answer: ['It', 'is', 'noisy.'], hint: 'It → is → nasıl?', explain: 'It is noisy.', objectiveId: 'obj-is' },
        meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Piko says: “It is noisy.” What does he mean?', options: ['Gürültülü.', 'Sessiz.', 'Aç.'], answer: 0, hint: 'noisy = gürültülü', explain: 'noisy = gürültülü.', objectiveId: 'obj-is', vocabId: 'v-noisy' },
      },
      {
        id: 'hw-4',
        objectiveId: 'obj-is',
        complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Sasha is in the library. She ___ noisy. (Sasha is very quiet!)', options: ['is', 'isn’t', 'are'], answer: 1, hint: 'Sasha sessiz. Gürültülü mü?', explain: 'Sasha sessiz, yani gürültülü **değil**: She **isn’t** noisy.', objectiveId: 'obj-is', vocabId: 'v-noisy' },
        order: { id: 'hw-4-order', type: 'order', prompt: 'Dora whispers about Sasha. Put the words in order.', tokens: ['noisy.', 'isn’t', 'She'], answer: ['She', 'isn’t', 'noisy.'], hint: 'She → isn’t → nasıl?', explain: 'She isn’t noisy.', objectiveId: 'obj-is' },
        meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Dora whispers: “She isn’t noisy.” What does it mean?', options: ['O gürültülü değil.', 'O gürültülü.', 'O aç değil.'], answer: 0, hint: 'isn’t = değil', explain: 'isn’t = değil: O gürültülü değil.', objectiveId: 'obj-is', vocabId: 'v-noisy' },
      },
      {
        id: 'hw-5',
        objectiveId: 'obj-question',
        complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Sasha asks about Piko: “___ he in the classroom?”', options: ['Is', 'Are', 'Am'], answer: 0, hint: 'He’nin kapıcısı is. Soruda başa geçer.', explain: 'Soruda kapıcı öne geçer: **Is** he in the classroom?', objectiveId: 'obj-question', vocabId: 'v-classroom' },
        order: { id: 'hw-5-order', type: 'order', prompt: 'Leo asks Sasha a question. Put his words in order.', tokens: ['classroom?', 'in', 'he', 'the', 'Is'], answer: ['Is', 'he', 'in', 'the', 'classroom?'], hint: 'Soru is ile başlar.', explain: 'Is he in the classroom?', objectiveId: 'obj-question' },
        meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Leo asks: “Is he in the classroom?” What does he ask?', options: ['O sınıfta mı?', 'O sınıfta.', 'Sınıf büyük mü?'], answer: 0, hint: 'Is ile başlıyor, bu bir soru.', explain: '**Is** ile başlayan cümle soru: O sınıfta mı?', objectiveId: 'obj-question', vocabId: 'v-classroom' },
      },
      {
        id: 'hw-6',
        objectiveId: 'obj-question',
        complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Piko asks: “Is Dora in the playground?” Dora is there. Sasha answers: “Yes, ___ is.”', options: ['she', 'he', 'it'], answer: 0, hint: 'Dora için hangi kelimeyi kullanırsın?', explain: 'Dora kız, o yüzden **she**: Yes, she is.', objectiveId: 'obj-question', vocabId: 'v-playground' },
        order: { id: 'hw-6-order', type: 'order', prompt: 'Sasha answers Piko. Build her short answer.', tokens: ['is.', 'Yes,', 'she'], answer: ['Yes,', 'she', 'is.'], hint: 'Önce Yes, sonra kim, sonra is.', explain: 'Yes, she is.', objectiveId: 'obj-question' },
        meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Sasha says: “Yes, she is.” What does she mean?', options: ['Evet, öyle.', 'Hayır, değil.', 'Belki öyle.'], answer: 0, hint: 'Yes = evet', explain: 'Yes = evet: Evet, öyle.', objectiveId: 'obj-question' },
      },
    ],
  },
  assessment: {
    quiz: [
      { id: 'as-piko-noisy', type: 'choice', prompt: 'Piko runs into the classroom. ___ is noisy!', options: pron, answer: 0, objectiveId: 'obj-who' },
      { id: 'as-lib-quiet', type: 'choice', prompt: 'Dora looks at the library. ___ is quiet.', options: pron, answer: 2, objectiveId: 'obj-who', vocabId: 'v-library' },
      { id: 'as-teacher', type: 'choice', prompt: 'Ms Pearl waves from the whiteboard. ___ is the teacher.', options: pron, answer: 1, objectiveId: 'obj-who', vocabId: 'v-teacher' },
      { id: 'as-leo-funny', type: 'text', prompt: 'Leo is in the chess club. Type the missing word: “___ is funny.”', accept: ['He'], objectiveId: 'obj-who', vocabId: 'v-chess-club' },
      { id: 'as-momo-isnt', type: 'choice', prompt: 'Momo is in the playground, not in the canteen. She ___ in the canteen.', options: ['is', 'isn’t', 'am'], answer: 1, objectiveId: 'obj-is', vocabId: 'v-canteen' },
      { id: 'as-kantin', type: 'choice', prompt: 'Sasha writes “kantin” on the whiteboard. What is it in English?', options: ['canteen', 'classroom', 'playground', 'library'], answer: 0, objectiveId: 'obj-school', vocabId: 'v-canteen' },
      { id: 'as-order-club', type: 'order', prompt: 'Sasha asks about Leo. Make her question.', tokens: ['club?', 'the', 'Is', 'chess', 'in', 'he'], answer: ['Is', 'he', 'in', 'the', 'chess', 'club?'], objectiveId: 'obj-question', vocabId: 'v-chess-club' },
      { id: 'as-cat-answer', type: 'choice', prompt: 'Sasha asks: “Is the school cat hungry?” The cat is eating fast. Choose Leo’s answer.', options: ['Yes, it is.', 'Yes, he is.', 'No, she isn’t.'], answer: 0, objectiveId: 'obj-question' },
      { id: 'as-meaning', type: 'choice', prompt: 'Piko says: “She isn’t in the library.” What does Piko mean?', options: ['O kütüphanede değil.', 'O kütüphanede.', 'Kütüphane sessiz değil.'], answer: 0, objectiveId: 'obj-is', vocabId: 'v-library' },
      { id: 'as-bag', type: 'text', prompt: 'Leo’s sandwich is in his school ___. Type the missing word.', accept: ['bag'], objectiveId: 'obj-school', vocabId: 'v-school-bag' },
    ],
    reading: {
      title: 'Dora’s Break Time',
      paragraphs: [
        'It is break time. Dora is in the playground. She is hungry, and the canteen is noisy today. It is not a quiet place!',
        'Leo is in the library. He is quiet and he has a book. Piko is at the chess club. He is funny, but he isn’t quiet.',
        'Ms Pearl is the teacher. She is in the classroom. The whiteboard is clean. It is ready for the next lesson. Is Dora in the classroom? No, she isn’t. But the bell is ringing, and break time is over!',
      ],
      questions: [
        { id: 'rd-tf-dora', type: 'choice', prompt: 'Dora is in the library at break time.', options: tf, answer: 1, objectiveId: 'obj-is' },
        { id: 'rd-tf-hungry', type: 'choice', prompt: 'Dora is hungry.', options: tf, answer: 0, objectiveId: 'obj-is', vocabId: 'v-hungry' },
        { id: 'rd-tf-leo', type: 'choice', prompt: 'Leo is noisy in the library.', options: tf, answer: 1, objectiveId: 'obj-is', vocabId: 'v-noisy' },
        { id: 'rd-tf-piko', type: 'choice', prompt: 'Piko is in the chess club.', options: tf, answer: 0, objectiveId: 'obj-who', vocabId: 'v-chess-club' },
        { id: 'rd-tf-teacher', type: 'choice', prompt: 'Ms Pearl is in the classroom.', options: tf, answer: 0, objectiveId: 'obj-who', vocabId: 'v-teacher' },
        { id: 'rd-fill-dora', type: 'choice', prompt: 'Dora is in the playground. ___ is hungry.', options: ['She', 'He', 'It', 'You'], answer: 0, objectiveId: 'obj-who' },
        { id: 'rd-fill-canteen', type: 'choice', prompt: 'The canteen is noisy today. ___ is not a quiet place.', options: ['It', 'He', 'She', 'I'], answer: 0, objectiveId: 'obj-who', vocabId: 'v-canteen' },
        { id: 'rd-fill-leo', type: 'choice', prompt: 'Leo is in the library. He ___ noisy.', options: ['isn’t', 'aren’t', 'am', 'not'], answer: 0, objectiveId: 'obj-is', vocabId: 'v-noisy' },
      ],
    },
  },
  play: {
    sections: {
      review: {
        template: 'time-escape',
        slots: {
          pool: [
            'v-classroom', 'v-playground', 'v-canteen', 'v-library', 'v-teacher', 'v-school-bag',
            'v-pencil-case', 'v-whiteboard', 'v-break-time', 'v-hungry', 'v-noisy', 'v-quiet',
            'rv-i-am', 'rv-you-are', 'rv-you-friend',
          ],
          seconds: { bank: 10, perCorrect: 3, cap: 10 },
          chase: { chaser: 'caramel-river', escapee: 'leo' },
          easyDefault: false,
        },
      },
      vocabulary: {
        template: 'scroll-story',
        slots: {
          mode: 'vocab-reveal',
          steps: [
            { id: 'vs-classroom', line: { speaker: 'sasha', en: 'This is the classroom.', tr: 'Burası sınıf.' }, emphasis: ['classroom'] },
            { id: 'vs-canteen', line: { speaker: 'momo', en: 'The canteen is noisy!', tr: 'Kantin gürültülü!' }, emphasis: ['canteen', 'noisy'] },
            { id: 'vs-library', line: { speaker: 'sasha', en: 'The library is quiet.', tr: 'Kütüphane sessiz.' }, emphasis: ['library', 'quiet'] },
            { id: 'vs-bag', line: { speaker: 'leo', en: 'My school bag is here.', tr: 'Okul çantam burada.' }, emphasis: ['school bag'] },
            {
              id: 'vs-case',
              line: { speaker: 'sasha', en: 'It is my pencil case.', tr: 'Bu benim kalem kutum.' },
              emphasis: ['pencil case'],
              joke: { tr: 'Kalem kutusu “it”tir. Ona “she” desen fermuarını kapatıp küser.' },
            },
            { id: 'vs-club', line: { speaker: 'piko', en: 'I am in the chess club.', tr: 'Ben satranç kulübündeyim.' }, emphasis: ['chess club'] },
            { id: 'vs-hungry', line: { speaker: 'leo', en: 'It is break time, and I am hungry!', tr: 'Teneffüs zamanı ve ben açım!' }, emphasis: ['break time', 'hungry'] },
          ],
          vocabRefs: [
            'v-classroom', 'v-playground', 'v-canteen', 'v-library', 'v-teacher', 'v-school-bag', 'v-pencil-case',
            'v-whiteboard', 'v-chess-club', 'v-break-time', 'v-hungry', 'v-noisy', 'v-quiet', 'v-funny',
          ],
        },
      },
      vocab_quiz: {
        template: 'stamp-quiz',
        slots: { questions: ['v-classroom', 'v-canteen', 'v-library', 'v-school-bag', 'v-hungry', 'v-noisy'], showStreak: true, shield: true, hintBudget: 2 },
      },
      story: {
        template: 'scroll-story',
        slots: {
          mode: 'story',
          steps: [
            { id: 'ps-break', line: { speaker: 'narrator', en: 'It is break time. Leo is in the classroom.', tr: 'Teneffüs zamanı. Leo sınıfta.' } },
            { id: 'ps-bag', line: { speaker: 'leo', en: 'My sandwich isn’t in my school bag!', tr: 'Sandviçim okul çantamda değil!' }, gate: 'st-q-bag' },
            { id: 'ps-momo', line: { speaker: 'momo', en: 'I am clumsy, but I am not a thief!', tr: 'Sakarım ama hırsız değilim!' } },
            { id: 'ps-library', line: { speaker: 'sasha', en: 'Shh! The library is quiet.', tr: 'Şşt! Kütüphane sessiz.' } },
            { id: 'ps-cat', line: { speaker: 'sasha', en: 'Yes, it is! It is the school cat!', tr: 'Evet! Bu okulun kedisi!' }, emphasis: ['it'] },
            { id: 'ps-team', line: { speaker: 'sasha', en: 'Leo is he. Dora is she. The cat is it.', tr: 'Leo “he”. Dora “she”. Kedi “it”.' }, emphasis: ['he', 'she'] },
          ],
          choice: {
            prompt: 'What should Sasha do now?',
            options: [
              { text: 'Tell Leo the good news.', feedback: 'Güzel seçim! Bir dedektif önce arkadaşına haber verir.' },
              { text: 'Give the cat a snack.', feedback: 'Nazik seçim! Kedi de aç ama sandviç Leo’nun, ona dokunma.' },
            ],
          },
        },
      },
      explanation: {
        template: 'tap-guide',
        slots: {
          guides: [
            {
              id: 'g-who',
              target: 'pronoun-she',
              hint: { fine: 'Erkek için he, kız için she, eşya ve hayvan için it. Önce kime baktığına karar ver.', big: 'Dora bir kız. Onun için he, she, it’ten hangisini kullanırsın?' },
              joke: { tr: 'He, she, it kulübüne girer; kapıcı is kartı ister. “I” girmeye kalkarsa: “Sen am kartlısın, yan kapı!”' },
              stepRef: 'ex-who',
            },
            {
              id: 'g-it',
              target: 'object-bag',
              hint: { fine: 'Çanta, tahta, kalem kutusu: hepsi eşya.', big: 'Eşya ve hayvan için tek kelime var: it.' },
              stepRef: 'ex-is',
            },
            {
              id: 'g-question',
              target: 'card-question',
              hint: { fine: 'Soruda is öne geçer: Is he …?', big: 'Is he in the classroom? Cevap: Yes, he is. ya da No, he isn’t.' },
              stepRef: 'ex-question',
            },
          ],
          goNoGo: {
            rule: { tr: 'Kız (she) ya da eşya (it) görürsen dokun. Erkek (he) görürsen dokunma!', tapIf: 'she|it' },
            warmup: [
              { id: 'w-dora', text: 'Dora', tap: true, why: 'Dora kız -> she' },
              { id: 'w-leo', text: 'Leo', tap: false, why: 'Leo erkek -> he' },
              { id: 'w-board', text: 'the whiteboard', tap: true, why: 'Tahta eşya -> it' },
              { id: 'w-piko', text: 'Piko', tap: false, why: 'Piko erkek -> he' },
            ],
            round: [
              { id: 'r-sasha', text: 'Sasha', tap: true, why: 'Sasha kız -> she' },
              { id: 'r-he', text: 'he', tap: false, why: 'he erkek demek' },
              { id: 'r-canteen', text: 'the canteen', tap: true, why: 'Kantin bir yer -> it' },
              { id: 'r-piko', text: 'Piko', tap: false, why: 'Piko erkek -> he' },
              { id: 'r-pearl', text: 'Ms Pearl', tap: true, why: 'Ms Pearl öğretmen, kız -> she' },
              { id: 'r-case', text: 'the pencil case', tap: true, why: 'Kalem kutusu eşya -> it' },
              { id: 'r-leo', text: 'Leo', tap: false, why: 'Leo erkek -> he' },
              { id: 'r-dora', text: 'Dora', tap: true, why: 'Dora kız -> she' },
              { id: 'r-cat', text: 'the school cat', tap: true, why: 'Hayvan -> it' },
              { id: 'r-boy', text: 'the boy', tap: false, why: 'Oğlan erkek -> he' },
            ],
            onWrongTap: { anim: 'sneeze', line: 'Hapşu! Bu sefer kapıdan “he” girdi.' },
          },
        },
      },
      homework: {
        template: 'fill-workshop',
        slots: {
          items: [
            { ref: 'hw-1-complete', sceneObject: 'library-shelf', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
            { ref: 'hw-2-complete', sceneObject: 'canteen-tray', onComplete: { anim: 'object-wiggle' } },
            { ref: 'hw-3-complete', sceneObject: 'school-bell', onComplete: { anim: 'sentence-glow' } },
            { ref: 'hw-4-complete', sceneObject: 'pencil-case' },
            { ref: 'hw-5-order', sceneObject: 'whiteboard', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
            { ref: 'hw-6-order' },
          ],
          hint: { fine: 'Kız mı, erkek mi, eşya mı? He, she ya da it’e karar ver, sonra is gelsin.' },
        },
      },
      assessment: {
        template: 'stamp-quiz',
        slots: {
          questions: [
            'as-piko-noisy', 'as-lib-quiet', 'as-teacher', 'as-leo-funny', 'as-momo-isnt',
            'as-kantin', 'as-order-club', 'as-cat-answer', 'as-meaning', 'as-bag',
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
          activity: 'character',
          frame: 'My school robot is ___ and ___. It is in the ___.',
          chips: [
            { id: 'c-hungry', en: 'hungry', tr: 'aç', kind: 'adj' },
            { id: 'c-noisy', en: 'noisy', tr: 'gürültülü', kind: 'adj' },
            { id: 'c-quiet', en: 'quiet', tr: 'sessiz', kind: 'adj' },
            { id: 'c-funny', en: 'funny', tr: 'komik', kind: 'adj' },
            { id: 'c-library', en: 'library', tr: 'kütüphane', kind: 'place' },
            { id: 'c-canteen', en: 'canteen', tr: 'kantin', kind: 'place' },
            { id: 'c-playground', en: 'playground', tr: 'oyun bahçesi', kind: 'place' },
            { id: 'c-classroom', en: 'classroom', tr: 'sınıf', kind: 'place' },
          ],
          collection: { title: 'Okul Canavarlarım' },
        },
      },
    ],
  },
}

export const schoolLifeTeacherGuide: TeacherGuide = {
  objective:
    'he / she / it ayrımı (erkek, kız, eşya-hayvan), is / isn’t ile cümle kurma ve “Is he …? Yes, he is.” soru-cevap kalıbı; okul hayatı kelimeleriyle. I am / you are yalnızca hatırlatma.',
  vocabulary: [
    'classroom', 'playground', 'canteen', 'library', 'teacher', 'school bag', 'pencil case',
    'whiteboard', 'chess club', 'break time', 'hungry', 'noisy', 'quiet', 'funny',
  ],
  grammar: ['he / she / it + is / isn’t', 'Is he / she / it …? Yes, he is. / No, she isn’t.', 'Hatırlatma: I am, you are'],
  expectedDifficulties: [
    'Türkçede “o” cinsiyetsiz olduğu için he / she ayrımı unutulur; “o” görünce hep “he” demeye eğilim olur.',
    'Eşya ve hayvanlara “he / she” demek (“The cat is she”); it kalıbı geç oturur.',
    '“He is” yerine “He are” ya da “He am” demek; I am / you are ile karışma.',
    'Soruda kapıcıyı öne almayı unutmak: “He is in the classroom?” yerine “Is he in the classroom?”.',
    'Kısa cevapta fiili atlamak: “Yes, he.” yerine “Yes, he is.” demek gerekir.',
  ],
  commonErrors: [
    { error: 'She are in the library.', correction: 'She is in the library. (she → is)' },
    { error: 'The cat is he.', correction: 'The cat is it. Hayvan ve eşya için it.' },
    { error: 'Is he hungry? — Yes, he isn’t.', correction: 'Yes, he is. / No, he isn’t. “Yes” ile is, “No” ile isn’t gelir.' },
    { error: 'He in the classroom?', correction: 'Is he in the classroom? Soruda is öne geçer.' },
    { error: 'It is noisy library.', correction: 'The library is noisy. / It is noisy. (isimden önce the ve doğru sıra)' },
  ],
  questionsToAsk: [
    'Sınıfında “it” diyebileceğin üç şey say (örneğin: whiteboard, school bag, pencil case).',
    'Bir Lugu karakterini seç ve söyle: “He is …” ya da “She is …”.',
    'Is the library noisy? Is the canteen noisy? Cevapla.',
    'Is the teacher he or she? (kurgusal öğretmen Ms Pearl üzerinden)',
  ],
  speakingPrompts: [
    'Best friend: “My friend is he / she. He / She is funny.” (gerçek isim söyletme; “my friend” ya da bir Lugu karakteri yeter.)',
    'Our classroom: “It is noisy. It isn’t quiet.”',
    'Favourite teacher: “The teacher is kind. She / He is in the classroom.”',
    'Break time: “It is break time. I am hungry. The canteen is …”',
    'Clubs: “Is there a chess club? Is it funny?” (kulüp: chess club; kişisel bilgi sorulmaz)',
  ],
  rolePlay: {
    situation: 'Kayıp sandviç dedektifliği: Sasha (dedektif) ve Leo (aç öğrenci) okulda şüphelileri sorgular.',
    roles: ['Sasha (dedektif)', 'Leo (sandviçi kayıp)', 'Momo (sakar şüpheli)'],
    steps: [
      'Leo ne kaybettiğini söyler: “My sandwich isn’t in my school bag!”',
      'Sasha sorar: “Is she / he in the canteen?” Momo cevaplar: “Yes, she is. / No, he isn’t.”',
      'Sasha kırıntıları bulur: “Is it a cat? Yes, it is!”',
      'Roller değişir; öğrenci dedektif olur ve en az üç Is he / she / it …? sorusu sorar.',
    ],
  },
  listening: {
    script:
      'It is break time. Dora is in the playground. She is hungry, but the canteen is very noisy. Leo is in the library. He is quiet and he is reading a book. Piko is in the chess club. He is funny, but he is not quiet. Momo is at the canteen. She is funny too, but she is clumsy! The teacher is in the classroom. She is at the whiteboard. It is clean. The school cat is under a chair. It is sleepy.',
    questions: [
      'Is Dora in the library? (No, she isn’t. She is in the playground.)',
      'Is the canteen quiet? (No, it isn’t.)',
      'Who is quiet, Leo or Piko? (Leo is quiet.)',
      'Where is the teacher? (She is in the classroom.)',
    ],
  },
  reinforcement: [
    'Üç sütunlu tablo: he / she / it. Öğrenci sınıftaki her şeyi doğru sütuna yazar, sonra “… is …” cümlesi kurar.',
    'Evet / hayır kartları: öğretmen “Is it …?” sorar, öğrenci kısa cevap verir (Yes, it is. / No, it isn’t.).',
    '“Sakın tıklama” turunu sözlü oyna: öğretmen isim söyler, öğrenci he / she / it der.',
  ],
  suggestedActivities: [
    'Kimdir bu? oyunu: öğretmen bir karakterin özelliklerini söyler, öğrenci “Is he … ?” diye tahmin eder.',
    'Sınıf eşyalarına post-it: “It is a …” yaz, öğrenci eşyaya dokunup okur.',
    'Okul tur rehberi: öğrenci “This is the library. It is quiet.” diyerek 4 yer tanıtır.',
  ],
}

export const schoolLifeSpeakingPlan: SpeakingPlan = {
  warmUp: {
    minutes: 5,
    activities: [
      'Isınma sorusu: “How is the school today? Is it noisy or quiet?” (tek cümleyle cevap yeter)',
      'Isınma sorusu: “Is the classroom big?” (Yes, it is. / No, it isn’t.)',
      'Isınma sorusu: “Is your school bag heavy today?” (kişisel bilgi sorulmaz; sadece eşya)',
      'Karakter seç: “Who is your favourite: Piko, Sasha, Momo, Dora or Leo?” (he / she ile cevap: “He is funny.”)',
    ],
  },
  vocabulary: {
    minutes: 10,
    activities: [
      'Kelime kartları (classroom, canteen, library, school bag, pencil case…): öğrenci kartı görür, “It is a …” der.',
      '“Where is Leo?” oyunu: öğretmen yer söyler (canteen, library, playground), öğrenci “He is in the …” der.',
      'Zıt çiftler: noisy / quiet; öğrenci iki yeri bu iki kelimeyle anlatır.',
    ],
  },
  grammar: {
    minutes: 10,
    activities: [
      'Tur 1: öğretmen bir isim ya da eşya söyler (Dora, Leo, the whiteboard), öğrenci he / she / it der.',
      'Tur 2: öğrenci “She is …” / “He isn’t …” ile iki olumlu ve iki olumsuz cümle kurar.',
      'Tur 3: Is he / she / it …? Öğretmen bir karakter düşünür, öğrenci “Is she in the library?” gibi sorularla bulur.',
      'Hatırlatma (1 dk): I am / you are ile tek cümle (I am a detective. You are my helper.)',
    ],
  },
  rolePlay: {
    minutes: 10,
    activities: [
      'Dedektif Sasha rol oyunu: kayıp sandviç. Öğretmen Leo, öğrenci Sasha; sonra roller değişir.',
      'Beklenen cümleler: “Is it in the library? Yes, it is. / No, it isn’t.” “Is she hungry?” “He is funny.”',
      'Öğretmen notu: Hata olursa sonunda topluca düzelt; rol oyunu akışını bölme.',
    ],
  },
  listening: {
    minutes: 8,
    script:
      'It is break time. Dora is in the playground. She is hungry, but the canteen is very noisy. Leo is in the library. He is quiet and he is reading a book. Piko is in the chess club. He is funny, but he is not quiet. Momo is at the canteen. She is funny too, but she is clumsy! The teacher is in the classroom. She is at the whiteboard. It is clean. The school cat is under a chair. It is sleepy.',
    activities: [
      'Metni iki kez oku; ilkinde sadece dinlesin.',
      'Sorular: Is Dora in the library? Is the canteen quiet? Who is quiet? Where is the teacher?',
      'Öğrenci metindeki bir kişiyi seçip he / she ile tek cümleyle anlatır.',
    ],
  },
  weaknessReinforcement: {
    minutes: 8,
    activities: [
      'Öğrencinin en sık yaptığı hatayı (he / she karışması, it yerine he, soruda is’i öne almamak) üç kısa cümleyle tekrar ettir.',
      'Kanıt yoksa dersin beklenen zorlukları: he / she ayrımı, hayvan ve eşya için it, soruda is’in yeri.',
      '“Sakın tıklama” sözlü turu: yanlışta nazikçe “Yaklaştın!” de, sonra doğru cümleyi birlikte kur.',
    ],
  },
  freeSpeaking: {
    minutes: 7,
    activities: [
      'Konu 1: En iyi arkadaşın (gerçek isim yok; “my friend” veya bir Lugu karakteri). “He / She is …”',
      'Konu 2: Sınıfında ne var? “It is a … It is …” (whiteboard, school bag, pencil case)',
      'Konu 3: Favori öğretmenin ne yapıyor? “The teacher is in the classroom. She / He is …”',
      'Konu 4: Okul kantini nasıl? “The canteen is … It is noisy / quiet.” (kantin, teneffüs)',
      'Konu 5: Kulüp seç: chess club ya da başka bir kulüp. “Is it funny? Is it quiet?”',
      'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
    ],
  },
  closingTask: {
    task:
      'Hafta ödevi: Bir okul eşyasını ve bir Lugu karakterini seç, “He / She is …” ve “It is …” ile üç cümle yaz ya da sesli kaydet; bir de “Is he / she / it …?” sorusu ekle.',
  },
}
