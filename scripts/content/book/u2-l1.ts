/** Ünite 2.1 — Study Habits: How often…? + adverbs of manner (slowly, carefully, well/badly). Theme u1-morning, host piko. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 2.1 — Study Habits',
  sourceNotes:
    'Kitap Ünite 2 (Classroom Life): How often…? (every day, once / twice / three times a week, at the weekend), adverbs of manner (slowly, carefully, quietly, quickly, well, badly). Kitap kelimeleri: habit, research, brush (teeth), rest; ek: routine, exercise, practice / practise, revise, healthy, diary. Sağlıklı çalışma alışkanlıkları: plan, kısa mola, uyku.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Piko’s Study Plan',
      tagline: 'Piko hiç plan yapmıyor ve hep yorgun! Ne sıklıkla, nasıl çalışmalı? Sen de planını yap.',
      theme: 'Classroom life',
      character: 'piko',
      level: 'A1-A2',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u2l1-howoften', text: '“How often …?” sorusunu sorar ve cevaplar.' },
        { id: 'u2l1-phrases', text: 'every day, once / twice / three times a week, at the weekend ifadelerini kullanır.' },
        { id: 'u2l1-manner', text: 'slowly, carefully, quietly, quickly gibi tarz zarflarını eylemden sonra kullanır.' },
        { id: 'u2l1-adjadv', text: 'Sıfat ile zarfı ayırır (careful / carefully) ve good → well, bad → badly kullanır.' },
        { id: 'u2l1-habits', text: 'Çalışma alışkanlığı kelimelerini (habit, routine, revise, rest, healthy, diary) söyler.' },
      ],
      grammar: [
        'How often do you …? — Every day. / Once a week. / Twice a week. / Three times a week.',
        'Adverbs of manner: slow → slowly, careful → carefully, quiet → quietly, quick → quickly',
        'Adjective or adverb: She is careful. She works carefully. / good → well, bad → badly',
      ],
      themeId: 'u1-morning',
    },
    review: {
      questions: [
        { id: 'rv-does', type: 'choice', prompt: 'Ms Pearl asks about Piko: “What ___ he do after school?”', options: ['do', 'does', 'is'], answer: 1, hint: 'Soruda he ile hangi yardımcı fiil gelir?', explain: '**He / she / it** ile **does** gelir: What does he do?', objectiveId: 'u2l1-howoften' },
        { id: 'rv-usually', type: 'choice', prompt: 'Sasha says about Leo: “He ___ draws in the art room.”', options: ['is usually', 'usual', 'usually'], answer: 2, hint: 'Sıklık zarfı ana fiilin önüne gelir.', explain: 'Sıklık zarfı ana fiilden **önce** gelir: He **usually** draws.', objectiveId: 'u2l1-phrases' },
        { id: 'rv-doesnt', type: 'choice', prompt: 'Momo says about Dora: “She ___ eat in the library.”', options: ['doesn’t', 'don’t', 'isn’t'], answer: 0, hint: 'Dora için she diyoruz. Fiil çekimli değil, yardımcı fiil olumsuz.', explain: '**She** ile **doesn’t** gelir: She doesn’t eat.', objectiveId: 'u2l1-phrases' },
        { id: 'rv-now', type: 'choice', prompt: 'Look! Sasha ___ in the library right now.', options: ['reads', 'is reading', 'read'], answer: 1, hint: 'Şu anda olan bir şey: is + fiil-ing.', explain: 'Şu an için **is reading**: Sasha is reading.', objectiveId: 'u2l1-habits' },
      ],
    },
    vocabulary: [
      { id: 'v-habit', en: 'habit', tr: 'alışkanlık', example: { en: 'Reading every day is a good habit.', tr: 'Her gün okumak iyi bir alışkanlık.' }, difficulty: 2, objectiveId: 'u2l1-habits' },
      { id: 'v-routine', en: 'morning routine', tr: 'sabah rutini', example: { en: 'Piko has a short morning routine.', tr: 'Piko’nun kısa bir sabah rutini var.' }, context: 'Her gün aynı sırayla yaptığın işler.', difficulty: 2, objectiveId: 'u2l1-habits' },
      { id: 'v-research', en: 'do research', tr: 'araştırma yapmak', example: { en: 'Sasha does research in the library.', tr: 'Sasha kütüphanede araştırma yapıyor.' }, context: 'Proje için bilgi aramak.', difficulty: 2, objectiveId: 'u2l1-habits' },
      { id: 'v-brush', en: 'brush your teeth', tr: 'dişlerini fırçalamak', example: { en: 'I brush my teeth every day.', tr: 'Her gün dişlerimi fırçalarım.' }, difficulty: 1, objectiveId: 'u2l1-habits' },
      { id: 'v-rest', en: 'have a rest', tr: 'dinlenmek', example: { en: 'Piko has a rest at the weekend.', tr: 'Piko hafta sonu dinleniyor.' }, context: 'Kısa bir mola da “a short rest”tir.', difficulty: 1, objectiveId: 'u2l1-habits' },
      { id: 'v-exercise', en: 'exercise', tr: 'egzersiz yapmak', example: { en: 'Dora exercises three times a week.', tr: 'Dora haftada üç kez egzersiz yapıyor.' }, difficulty: 1, objectiveId: 'u2l1-habits' },
      { id: 'v-practise', en: 'practise (verb)', tr: 'pratik yapmak, çalışmak', example: { en: 'Leo practises drawing twice a week.', tr: 'Leo haftada iki kez resim çalışıyor.' }, context: 'İngiliz yazımında fiil: practise (s ile).', difficulty: 2, objectiveId: 'u2l1-habits' },
      { id: 'v-practice', en: 'practice (noun)', tr: 'alıştırma, antrenman', example: { en: 'Leo’s drawing practice is short.', tr: 'Leo’nun resim alıştırması kısa.' }, context: 'İsim: practice (c ile).', difficulty: 3, objectiveId: 'u2l1-habits' },
      { id: 'v-revise', en: 'revise for a test', tr: 'sınava tekrar yapmak', example: { en: 'Sasha revises for the English test.', tr: 'Sasha İngilizce sınavına tekrar yapıyor.' }, difficulty: 2, objectiveId: 'u2l1-habits' },
      { id: 'v-healthy', en: 'healthy', tr: 'sağlıklı', example: { en: 'Sleep is a healthy habit.', tr: 'Uyku sağlıklı bir alışkanlık.' }, difficulty: 1, objectiveId: 'u2l1-habits' },
      { id: 'v-diary', en: 'keep a diary', tr: 'günlük tutmak', example: { en: 'Momo keeps a diary.', tr: 'Momo günlük tutuyor.' }, context: 'Diary = günlük (defter).', difficulty: 2, objectiveId: 'u2l1-habits' },
      { id: 'v-every-day', en: 'every day', tr: 'her gün', example: { en: 'I read every day.', tr: 'Her gün okurum.' }, difficulty: 1, objectiveId: 'u2l1-phrases' },
      { id: 'v-once', en: 'once a week', tr: 'haftada bir', example: { en: 'Leo goes to the library once a week.', tr: 'Leo haftada bir kütüphaneye gidiyor.' }, difficulty: 1, objectiveId: 'u2l1-phrases' },
      { id: 'v-twice', en: 'twice a week', tr: 'haftada iki kez', example: { en: 'Piko revises twice a week.', tr: 'Piko haftada iki kez tekrar yapıyor.' }, difficulty: 1, objectiveId: 'u2l1-phrases' },
      { id: 'v-three-times', en: 'three times a week', tr: 'haftada üç kez', example: { en: 'Sasha exercises three times a week.', tr: 'Sasha haftada üç kez egzersiz yapıyor.' }, context: 'Üç ve sonrası: sayı + times.', difficulty: 2, objectiveId: 'u2l1-phrases' },
      { id: 'v-weekend', en: 'at the weekend', tr: 'hafta sonu', example: { en: 'Piko rests at the weekend.', tr: 'Piko hafta sonu dinleniyor.' }, difficulty: 1, objectiveId: 'u2l1-phrases' },
      { id: 'v-slowly', en: 'slowly', tr: 'yavaşça', example: { en: 'Piko writes slowly.', tr: 'Piko yavaş yazıyor.' }, difficulty: 1, objectiveId: 'u2l1-manner' },
      { id: 'v-carefully', en: 'carefully', tr: 'dikkatle', example: { en: 'Sasha reads the question carefully.', tr: 'Sasha soruyu dikkatle okuyor.' }, difficulty: 2, objectiveId: 'u2l1-manner' },
      { id: 'v-quietly', en: 'quietly', tr: 'sessizce', example: { en: 'Leo speaks quietly in the library.', tr: 'Leo kütüphanede sessizce konuşuyor.' }, difficulty: 2, objectiveId: 'u2l1-manner' },
      { id: 'v-quickly', en: 'quickly', tr: 'çabucak, hızlıca', example: { en: 'Momo eats quickly at break time.', tr: 'Momo teneffüste hızlı yiyor.' }, difficulty: 2, objectiveId: 'u2l1-manner' },
      { id: 'v-well', en: 'well', tr: 'iyi (zarf)', example: { en: 'Sasha speaks English well.', tr: 'Sasha İngilizceyi iyi konuşuyor.' }, context: 'Good’un zarfı well’dir; “goodly” yoktur.', difficulty: 3, objectiveId: 'u2l1-adjadv' },
      { id: 'v-badly', en: 'badly', tr: 'kötü (zarf)', example: { en: 'Piko sleeps badly after a late night.', tr: 'Piko geç yattığı gece kötü uyuyor.' }, difficulty: 3, objectiveId: 'u2l1-adjadv' },
    ],
    story: {
      title: 'Piko’s Study Plan',
      character: 'piko',
      setting: 'A classroom, the school library and Piko’s desk at home, over two weeks',
      scenes: [
        {
          id: 'sc-plan',
          illustration: 'Ms Pearl at the board that says STUDY HABITS; Piko, Sasha and Momo at their desks with notebooks.',
          lines: [
            { speaker: 'narrator', en: 'Ms Pearl says: “Today we talk about study habits. How often do you revise?”', tr: 'Ms Pearl diyor ki: “Bugün çalışma alışkanlıklarını konuşuyoruz. Ne sıklıkla tekrar yapıyorsunuz?”' },
            { speaker: 'piko', en: 'I revise twice a week. I never make a plan.', tr: 'Haftada iki kez tekrar yaparım. Hiç plan yapmam.' },
            { speaker: 'sasha', en: 'I make a plan every Sunday. I write it carefully.', tr: 'Ben her pazar plan yaparım. Onu dikkatle yazarım.' },
            { speaker: 'momo', en: 'I do my homework quickly. Then I make mistakes!', tr: 'Ödevimi çabuk yaparım. Sonra hata yaparım!' },
            { speaker: 'narrator', en: 'Ms Pearl smiles: “A good habit is a small habit.”', tr: 'Ms Pearl gülümsüyor: “İyi alışkanlık küçük bir alışkanlıktır.”' },
          ],
        },
        {
          id: 'sc-library',
          illustration: 'The school library at break time: Dora with a tennis magazine, Sasha with a planner, Piko yawning.',
          lines: [
            { speaker: 'narrator', en: 'It is break time. The friends are in the library.', tr: 'Teneffüs zamanı. Arkadaşlar kütüphanede.' },
            { speaker: 'dora', en: 'How often do you practise tennis?', tr: 'Ne sıklıkla tenis çalışıyorsun?' },
            { speaker: 'narrator', en: 'You smile. “Three times a week. I practise carefully, and I rest on Sunday.”', tr: 'Gülümsüyorsun. “Haftada üç kez. Dikkatle çalışırım, pazar günü dinlenirim.”' },
            { speaker: 'sasha', en: 'Rest is part of a good routine.', tr: 'Dinlenmek iyi bir rutinin parçası.' },
            { speaker: 'piko', en: 'I never rest. I study until midnight every day!', tr: 'Ben hiç dinlenmem. Her gün gece yarısına kadar çalışırım!' },
          ],
        },
        {
          id: 'sc-tired',
          illustration: 'Piko with dark circles at his desk next day; Ms Pearl writes three healthy tips on the board.',
          lines: [
            { speaker: 'narrator', en: 'The next day Piko is tired. He sleeps badly every night.', tr: 'Ertesi gün Piko yorgun. Her gece kötü uyuyor.' },
            { speaker: 'piko', en: 'I study a lot, but I forget everything!', tr: 'Çok çalışıyorum ama her şeyi unutuyorum!' },
            { speaker: 'narrator', en: 'Ms Pearl says: “Make a plan. Take a short break. Sleep well.”', tr: 'Ms Pearl diyor ki: “Plan yap. Kısa mola ver. İyi uyu.”' },
            { speaker: 'leo', en: 'Sleep is a healthy habit, Piko. Brush your teeth and go to bed!', tr: 'Uyku sağlıklı bir alışkanlık Piko. Dişlerini fırçala ve yat!' },
          ],
          choice: {
            prompt: 'What does Piko do tonight?',
            options: [
              { text: 'He makes a short study plan.', feedback: 'Güzel seçim! Plan, alışkanlığın ilk adımı.' },
              { text: 'He takes a short break and goes to bed early.', feedback: 'Güzel seçim! Dinlenmiş beyin daha iyi hatırlar.' },
            ],
          },
        },
        {
          id: 'sc-diary',
          illustration: 'A week later: Piko writes in a new diary on a tidy desk; a calendar shows three circled days.',
          lines: [
            { speaker: 'narrator', en: 'A week later, Piko has a new diary and a study plan.', tr: 'Bir hafta sonra Piko’nun yeni bir günlüğü ve bir çalışma planı var.' },
            { speaker: 'piko', en: 'I revise three times a week now. I work slowly and carefully.', tr: 'Artık haftada üç kez tekrar yapıyorum. Yavaş ve dikkatli çalışıyorum.' },
            { speaker: 'momo', en: 'And I do my homework quietly, not quickly!', tr: 'Ben de ödevimi sessizce yapıyorum, aceleyle değil!' },
            { speaker: 'leo', en: 'Piko sleeps well now. He is not tired at school.', tr: 'Piko artık iyi uyuyor. Okulda yorgun değil.' },
            { speaker: 'sasha', en: 'Great routine, Piko!', tr: 'Harika rutin, Piko!' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-revise', type: 'choice', prompt: 'In the classroom, how often does Piko revise?', options: ['Every day', 'Twice a week', 'Three times a week'], answer: 1, hint: 'İlk sahnede Piko’nun cevabına bak.', explain: 'Piko diyor ki: “I revise **twice a week**.”', objectiveId: 'u2l1-howoften', vocabId: 'v-twice' },
        { id: 'st-q-tennis', type: 'choice', prompt: 'Dora asks: “How often do you practise tennis?” What do you answer?', options: ['Once a week.', 'Every day.', 'Three times a week.'], answer: 2, hint: 'Kütüphane sahnesinde senin cevabını oku.', explain: 'Senin cevabın: “**Three times a week.**”', objectiveId: 'u2l1-howoften', vocabId: 'v-three-times' },
        { id: 'st-q-order', type: 'order', prompt: 'Leo tells Sasha about Piko. Put his words in order.', tokens: ['and', 'Piko', 'carefully.', 'works', 'slowly'], answer: ['Piko', 'works', 'slowly', 'and', 'carefully.'], hint: 'Kim → ne yapıyor → nasıl?', explain: 'Zarflar eylemden sonra gelir: Piko works **slowly** and **carefully**.', objectiveId: 'u2l1-manner', vocabId: 'v-carefully' },
        { id: 'st-q-quickly', type: 'text', prompt: 'Momo does her homework ___, so she makes mistakes. Type the word.', accept: ['quickly'], hint: 'quick sıfatının zarf hali.', explain: 'quick + ly = **quickly**: eylemi anlatır.', objectiveId: 'u2l1-manner', vocabId: 'v-quickly' },
        { id: 'st-q-sleep', type: 'choice', prompt: 'Piko is tired because he sleeps well.', options: tf, answer: 1, hint: 'Üçüncü sahnede Piko’nun uykusuna bak.', explain: 'Piko **kötü** uyuyor: “He sleeps badly.” O yüzden yorgun.', objectiveId: 'u2l1-adjadv', vocabId: 'v-badly' },
        { id: 'st-q-diary', type: 'choice', prompt: 'A week later, what does Piko have?', options: ['A new teacher', 'A new diary', 'A new bag'], answer: 1, hint: 'Son sahnenin ilk satırına bak.', explain: 'Piko’nun artık yeni bir **diary** (günlük) ve planı var.', objectiveId: 'u2l1-habits', vocabId: 'v-diary' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-howoften',
          title: 'Ne sıklıkla? How often…?',
          body: 'Bir şeyi **ne sıklıkla** yaptığını sormak için **How often** dersin. Soru present simple ile kurulur: How often **do** you …? / How often **does** he …?',
          examples: [
            { en: 'How often do you revise?', tr: 'Ne sıklıkla tekrar yapıyorsun?' },
            { en: 'How often does Piko brush his teeth?', tr: 'Piko ne sıklıkla dişlerini fırçalıyor?' },
            { en: 'I revise twice a week.', tr: 'Haftada iki kez tekrar yaparım.' },
          ],
          check: { id: 'ex-check-howoften', type: 'choice', prompt: 'Ms Pearl asks Momo: “___ do you brush your teeth?” “Every day.”', options: ['How old', 'How often', 'How many'], answer: 1, hint: 'Cevap bir sıklık: every day.', explain: 'Sıklığı **How often** sorar.', objectiveId: 'u2l1-howoften', vocabId: 'v-brush' },
        },
        {
          id: 'ex-phrases',
          title: 'Sıklık kalıpları',
          body: 'Bir kez: **once a week**. İki kez: **twice a week**. Üç ve sonrası: sayı + **times** a week. Her gün: **every day**. Hafta sonu: **at the weekend**.',
          examples: [
            { en: 'I read every day.', tr: 'Her gün okurum.' },
            { en: 'Leo goes to the library once a week.', tr: 'Leo haftada bir kütüphaneye gider.' },
            { en: 'Sasha exercises three times a week.', tr: 'Sasha haftada üç kez egzersiz yapar.' },
            { en: 'Piko rests at the weekend.', tr: 'Piko hafta sonu dinlenir.' },
          ],
          check: { id: 'ex-check-phrases', type: 'choice', prompt: 'Piko revises on Monday, Wednesday and Friday. He revises ___.', options: ['once a week', 'twice a week', 'three times a week'], answer: 2, hint: 'Kaç gün saydın?', explain: 'Üç gün = **three times a week**.', objectiveId: 'u2l1-phrases', vocabId: 'v-three-times' },
        },
        {
          id: 'ex-position',
          title: 'Sıklık kalıbı nereye gelir?',
          body: 'Sıklık kalıpları (every day, twice a week…) genelde cümlenin **sonuna** gelir. Hatırla: always ve usually gibi zarflar fiilin **önüne** gelir.',
          examples: [
            { en: 'I brush my teeth every day.', tr: 'Her gün dişlerimi fırçalarım.' },
            { en: 'She revises twice a week.', tr: 'O haftada iki kez tekrar yapar.' },
            { en: 'He usually rests at the weekend.', tr: 'O genelde hafta sonu dinlenir.' },
          ],
          check: { id: 'ex-check-position', type: 'choice', prompt: 'Sasha writes in her planner. Which sentence is correct?', options: ['I every day brush my teeth.', 'I brush every day my teeth.', 'I brush my teeth every day.'], answer: 2, hint: 'Kalıp sona gider: kim → ne yapıyor → ne sıklıkta.', explain: 'Sıklık kalıbı sonda: I brush my teeth **every day**.', objectiveId: 'u2l1-phrases', vocabId: 'v-every-day' },
        },
        {
          id: 'ex-manner',
          title: 'Nasıl yapıyor? -ly zarfları',
          body: 'Bir işin **nasıl** yapıldığını anlatmak için sıfata **-ly** ekle: slow → **slowly**, careful → **carefully**. Zarf eylemden sonra gelir.',
          examples: [
            { en: 'Piko walks slowly.', tr: 'Piko yavaş yürür.' },
            { en: 'Sasha writes carefully.', tr: 'Sasha dikkatle yazar.' },
            { en: 'Leo speaks quietly.', tr: 'Leo sessiz konuşur.' },
            { en: 'Momo runs quickly.', tr: 'Momo hızlı koşar.' },
          ],
          check: { id: 'ex-check-manner', type: 'choice', prompt: 'Momo runs to the canteen. She runs ___.', options: ['quick', 'quickly', 'is quick'], answer: 1, hint: 'Koşmak bir eylem. Eylemi anlatan kelime -ly ile biter.', explain: 'Eylemi anlatan zarf: runs **quickly**.', objectiveId: 'u2l1-manner', vocabId: 'v-quickly' },
        },
        {
          id: 'ex-adjadv',
          title: 'Sıfat mı, zarf mı?',
          body: '**Sıfat** kişiyi ya da nesneyi anlatır (is careful). **Zarf** eylemi anlatır (works carefully). Be fiilinden sonra sıfat, iş yapan fiilden sonra zarf kullan.',
          examples: [
            { en: 'She is careful.', tr: 'O dikkatli.' },
            { en: 'She works carefully.', tr: 'O dikkatle çalışır.' },
            { en: 'He is quiet. He speaks quietly.', tr: 'O sessiz. Sessizce konuşur.' },
          ],
          check: { id: 'ex-check-adjadv', type: 'choice', prompt: 'Sasha is a careful girl. She writes ___.', options: ['carefully', 'careful', 'care'], answer: 0, hint: 'Writes bir eylem, zarf lazım.', explain: 'Eylemden sonra zarf: writes **carefully**.', objectiveId: 'u2l1-adjadv', vocabId: 'v-carefully' },
        },
        {
          id: 'ex-irregular',
          title: 'Özel zarflar: well ve badly',
          body: '**good** sıfatının zarfı **well** olur (“goodly” yok!). **bad** sıfatının zarfı **badly**. Dora good player ise Dora plays well.',
          examples: [
            { en: 'Leo is a good drawer. He draws well.', tr: 'Leo iyi bir ressam. İyi çizer.' },
            { en: 'Piko sleeps badly at night.', tr: 'Piko geceleri kötü uyur.' },
            { en: 'Sasha speaks English well.', tr: 'Sasha İngilizceyi iyi konuşur.' },
          ],
          check: { id: 'ex-check-irregular', type: 'choice', prompt: 'Dora is a good student. She works ___.', options: ['good', 'goodly', 'badly', 'well'], answer: 3, hint: 'Good’un zarfı özel bir kelime.', explain: '**good** → **well**: She works well.', objectiveId: 'u2l1-adjadv', vocabId: 'v-well' },
        },
        {
          id: 'ex-practise',
          title: 'practise ve practice',
          body: 'İngiliz yazımında **practise** fiildir (pratik yapmak). **practice** isimdir (alıştırma). Fiilde **s**, isimde **c**.',
          examples: [
            { en: 'I practise English every day.', tr: 'Her gün İngilizce çalışırım.' },
            { en: 'Leo’s drawing practice is on Monday.', tr: 'Leo’nun resim alıştırması pazartesi.' },
            { en: 'She practises twice a week.', tr: 'O haftada iki kez çalışır.' },
          ],
          check: { id: 'ex-check-practise', type: 'choice', prompt: 'Sasha says: “I ___ English every day.” (verb)', options: ['practice', 'practise', 'practises'], answer: 1, hint: 'I ile çekimsiz fiil; fiilde s yazılır.', explain: 'Fiil: I **practise**. İsim: practice.', objectiveId: 'u2l1-habits', vocabId: 'v-practise' },
        },
        {
          id: 'ex-healthy',
          title: 'Sağlıklı çalışma alışkanlıkları',
          body: 'Üç kural: **plan yap**, **kısa mola ver**, **iyi uyu**. Şimdi öğrendiklerini birleştir: sıklık + zarf ile alışkanlığını anlat.',
          examples: [
            { en: 'I make a plan every Sunday.', tr: 'Her pazar plan yaparım.' },
            { en: 'I take a short break and rest.', tr: 'Kısa bir mola verir ve dinlenirim.' },
            { en: 'I sleep well and I am healthy.', tr: 'İyi uyurum ve sağlıklıyım.' },
          ],
          check: { id: 'ex-check-healthy', type: 'choice', prompt: 'Ms Pearl asks: “Which one is a healthy study habit?”', options: ['Study all night.', 'Sleep late every day.', 'Take a short break.'], answer: 2, hint: 'Beyin de dinlenmek ister.', explain: 'Kısa mola: **take a short break**.', objectiveId: 'u2l1-habits', vocabId: 'v-healthy' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u2l1-howoften',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Piko asks Sasha: “___ do you make a plan?” “Every Sunday.”', options: ['How often', 'How much', 'How old'], answer: 0, hint: 'Cevap bir sıklık.', explain: 'Sıklığı **How often** sorar.', objectiveId: 'u2l1-howoften', vocabId: 'v-routine' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Ms Pearl asks the class a question. Put her words in order.', tokens: ['you', 'often', 'How', 'revise?', 'do'], answer: ['How', 'often', 'do', 'you', 'revise?'], hint: 'How often → do → you → fiil.', explain: '**How often** do you revise?', objectiveId: 'u2l1-howoften' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Momo asks Leo: “How often do you rest?” What does she ask?', options: ['Nerede dinleniyorsun?', 'Ne sıklıkla dinleniyorsun?', 'Neden dinleniyorsun?'], answer: 1, hint: 'How often = ne sıklıkla', explain: '**How often** = ne sıklıkla.', objectiveId: 'u2l1-howoften', vocabId: 'v-rest' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u2l1-phrases',
          complete: { id: 'hw-2-complete', type: 'choice', prompt: 'Leo has art club on Tuesday and Thursday. He has art club ___.', options: ['once a week', 'three times a week', 'twice a week'], answer: 2, hint: 'İki gün var.', explain: 'İki kez = **twice a week**.', objectiveId: 'u2l1-phrases', vocabId: 'v-twice' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Dora writes in her planner. Build her sentence.', tokens: ['times', 'three', 'I', 'a', 'week.', 'exercise'], answer: ['I', 'exercise', 'three', 'times', 'a', 'week.'], hint: 'Kim → ne yapıyor → ne sıklıkla?', explain: 'I exercise **three times a week**.', objectiveId: 'u2l1-phrases' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Sasha writes: “I revise once a week.” What does she mean?', options: ['Haftada bir tekrar yapıyorum.', 'Her gün tekrar yapıyorum.', 'Haftada üç kez tekrar yapıyorum.'], answer: 0, hint: 'once = bir kez', explain: '**once a week** = haftada bir.', objectiveId: 'u2l1-phrases', vocabId: 'v-once' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u2l1-phrases',
          complete: { id: 'hw-3-complete', type: 'text', prompt: 'Piko has a rest on Saturday and Sunday. Type the missing word: “Piko rests ___ the weekend.”', accept: ['at'], hint: 'Hafta sonu için küçük bir ilgi kelimesi.', explain: '**at the weekend**: hafta sonu.', objectiveId: 'u2l1-phrases', vocabId: 'v-weekend' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Leo writes a note. Put the words in order.', tokens: ['weekend.', 'rests', 'at', 'She', 'the'], answer: ['She', 'rests', 'at', 'the', 'weekend.'], hint: 'Kim → ne yapıyor → ne zaman?', explain: 'She rests **at the weekend**.', objectiveId: 'u2l1-phrases' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Ms Pearl says: “Read every day.” What does she mean?', options: ['Haftada bir oku.', 'Her gün oku.', 'Hafta sonu oku.'], answer: 1, hint: 'every day = her gün', explain: '**every day** = her gün.', objectiveId: 'u2l1-phrases', vocabId: 'v-every-day' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u2l1-manner',
          complete: { id: 'hw-4-complete', type: 'text', prompt: 'Leo is quiet in the library. He speaks ___. Type the word.', accept: ['quietly'], hint: 'quiet + ly', explain: 'quiet + ly = **quietly**.', objectiveId: 'u2l1-manner', vocabId: 'v-quietly' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Sasha describes Piko. Put her words in order.', tokens: ['slowly', 'in', 'walks', 'Piko', 'the', 'library.'], answer: ['Piko', 'walks', 'slowly', 'in', 'the', 'library.'], hint: 'Zarf, fiilin hemen arkasında.', explain: 'Piko walks **slowly** in the library.', objectiveId: 'u2l1-manner' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Dora says: “Leo speaks quietly.” What does she mean?', options: ['Leo yavaş konuşuyor.', 'Leo hızlı konuşuyor.', 'Leo sessizce konuşuyor.'], answer: 2, hint: 'quiet = sessiz', explain: 'quietly = **sessizce**.', objectiveId: 'u2l1-manner', vocabId: 'v-quietly' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u2l1-adjadv',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Ms Pearl says: “Sasha is a ___ student. She works carefully.”', options: ['carefully', 'careful', 'care'], answer: 1, hint: 'Student bir isim; ismi anlatan kelime sıfat.', explain: 'İsmi anlatan sıfat: a **careful** student.', objectiveId: 'u2l1-adjadv', vocabId: 'v-carefully' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Momo talks about Sasha. Build her sentence.', tokens: ['careful', 'Sasha', 'is', 'a', 'girl.'], answer: ['Sasha', 'is', 'a', 'careful', 'girl.'], hint: 'Sıfat, ismin önüne gelir.', explain: 'Sasha is a **careful** girl.', objectiveId: 'u2l1-adjadv' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Piko says: “Momo runs quickly.” What does he mean?', options: ['Momo hızlı bir kız.', 'Momo hızlı koşuyor.', 'Momo yavaş koşuyor.'], answer: 1, hint: 'runs bir eylem; quickly onu anlatır.', explain: 'Zarf eylemi anlatır: runs **quickly** = hızlı koşuyor.', objectiveId: 'u2l1-adjadv', vocabId: 'v-quickly' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u2l1-adjadv',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Dora is a good player. She plays ___.', options: ['well', 'good', 'goodly'], answer: 0, hint: 'Good’un zarfı özel.', explain: '**good** → **well**: She plays well.', objectiveId: 'u2l1-adjadv', vocabId: 'v-well' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Leo whispers to Piko. Put his words in order.', tokens: ['badly', 'sleeps', 'night.', 'at', 'He'], answer: ['He', 'sleeps', 'badly', 'at', 'night.'], hint: 'Kim → ne yapıyor → nasıl → ne zaman?', explain: 'He sleeps **badly** at night.', objectiveId: 'u2l1-adjadv' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Momo says: “I draw badly.” What does she mean?', options: ['Güzel çiziyorum.', 'Hızlı çiziyorum.', 'Kötü çiziyorum.'], answer: 2, hint: 'badly = kötü', explain: 'badly = **kötü**.', objectiveId: 'u2l1-adjadv', vocabId: 'v-badly' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u2l1-habits',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Leo says: “My drawing ___ is at four o’clock.” (noun)', options: ['practise', 'practice', 'practises'], answer: 1, hint: 'İsimde c, fiilde s.', explain: 'İsim: drawing **practice**.', objectiveId: 'u2l1-habits', vocabId: 'v-practice' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Sasha says her habit. Put the words in order.', tokens: ['English', 'I', 'every', 'practise', 'day.'], answer: ['I', 'practise', 'English', 'every', 'day.'], hint: 'Kim → fiil → ne → ne sıklıkla?', explain: 'I **practise** English every day.', objectiveId: 'u2l1-habits' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Sasha says: “I practise English every day.” What does she mean?', options: ['Her gün İngilizce çalışırım.', 'İngilizce sınavım var.', 'İngilizceyi sevmem.'], answer: 0, hint: 'practise = pratik yapmak, every day = her gün', explain: '**practise** = pratik yapmak, **every day** = her gün.', objectiveId: 'u2l1-habits', vocabId: 'v-practise' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u2l1-habits',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Piko brushes his teeth every morning and night. It is a good ___.', options: ['research', 'habit', 'diary'], answer: 1, hint: 'Her gün yapılan şey.', explain: 'Düzenli yapılan şey bir **habit** (alışkanlık).', objectiveId: 'u2l1-habits', vocabId: 'v-habit' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Piko writes in his diary. Build his sentence.', tokens: ['teeth', 'I', 'my', 'brush', 'day.', 'every'], answer: ['I', 'brush', 'my', 'teeth', 'every', 'day.'], hint: 'I → brush → my teeth → every day.', explain: 'I brush my teeth **every day**.', objectiveId: 'u2l1-habits' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Ms Pearl says: “Sasha does research in the library.” What does she mean?', options: ['Sasha kütüphanede araştırma yapıyor.', 'Sasha kütüphanede uyuyor.', 'Sasha kütüphanede yemek yiyor.'], answer: 0, hint: 'research = araştırma', explain: '**do research** = araştırma yapmak.', objectiveId: 'u2l1-habits', vocabId: 'v-research' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u2l1-howoften',
          complete: { id: 'hw-9-complete', type: 'text', prompt: 'Mr Aydın asks: “How often do you practise tennis?” You say: “Three ___ a week.” Type the missing word.', accept: ['times'], hint: 'Üç ve sonrası için bir kelime.', explain: 'Üç ve sonrası: sayı + **times**.', objectiveId: 'u2l1-howoften', vocabId: 'v-practise' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'You answer Mr Aydın. Build your sentence.', tokens: ['tennis', 'three', 'practise', 'I', 'week.', 'a', 'times'], answer: ['I', 'practise', 'tennis', 'three', 'times', 'a', 'week.'], hint: 'I → practise → tennis → sıklık.', explain: 'I practise tennis **three times a week**.', objectiveId: 'u2l1-howoften' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Mr Aydın says: “Practise carefully.” What does he mean?', options: ['Çabuk çalış.', 'Dikkatle çalış.', 'Her gün çalış.'], answer: 1, hint: 'careful = dikkatli', explain: 'carefully = **dikkatle**.', objectiveId: 'u2l1-manner', vocabId: 'v-carefully' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-howoften', type: 'choice', prompt: 'Ms Pearl asks: “___ does Momo revise?” Momo says: “Once a week.”', options: ['What', 'How old', 'How often', 'How many'], answer: 2, objectiveId: 'u2l1-howoften' },
        { id: 'as-twice', type: 'choice', prompt: 'Leo goes to the library on Monday and Thursday. He goes ___.', options: ['once a week', 'twice a week', 'every day'], answer: 1, objectiveId: 'u2l1-phrases', vocabId: 'v-twice' },
        { id: 'as-every-day', type: 'choice', prompt: 'Sasha brushes her teeth on all seven days of the week. She brushes them ___.', options: ['every day', 'once a week', 'at the weekend'], answer: 0, objectiveId: 'u2l1-phrases', vocabId: 'v-every-day' },
        { id: 'as-slowly', type: 'text', prompt: 'Piko is slow. He walks ___. Type the word.', accept: ['slowly'], objectiveId: 'u2l1-manner', vocabId: 'v-slowly' },
        { id: 'as-carefully', type: 'choice', prompt: 'Momo is a careful artist. She draws ___.', options: ['carefully', 'careful', 'cares'], answer: 0, objectiveId: 'u2l1-adjadv', vocabId: 'v-carefully' },
        { id: 'as-well', type: 'choice', prompt: 'Leo is a good drawer. He draws ___.', options: ['good', 'well', 'goodly', 'best'], answer: 1, objectiveId: 'u2l1-adjadv', vocabId: 'v-well' },
        { id: 'as-order', type: 'order', prompt: 'Piko writes in his diary. Make his sentence.', tokens: ['week.', 'times', 'revises', 'three', 'Piko', 'a'], answer: ['Piko', 'revises', 'three', 'times', 'a', 'week.'], objectiveId: 'u2l1-phrases', vocabId: 'v-revise' },
        { id: 'as-habit', type: 'choice', prompt: 'Ms Pearl writes “habit” on the board. What does it mean?', options: ['günlük', 'dinlenme', 'araştırma', 'alışkanlık'], answer: 3, objectiveId: 'u2l1-habits', vocabId: 'v-habit' },
        { id: 'as-practise', type: 'choice', prompt: 'Sasha says: “I ___ English every day.”', options: ['practice', 'practises', 'practise'], answer: 2, objectiveId: 'u2l1-habits', vocabId: 'v-practise' },
        { id: 'as-healthy', type: 'choice', prompt: 'Which one does Ms Pearl say is a healthy habit?', options: ['Sleep well.', 'Study all night.', 'Never take a break.'], answer: 0, objectiveId: 'u2l1-habits', vocabId: 'v-healthy' },
        { id: 'as-quietly', type: 'text', prompt: 'Leo is quiet. He speaks very ___ in the library. Type the word.', accept: ['quietly'], objectiveId: 'u2l1-manner', vocabId: 'v-quietly' },
        { id: 'as-meaning', type: 'choice', prompt: 'Dora says: “Piko revises twice a week.” What does she mean?', options: ['Piko her gün tekrar yapıyor.', 'Piko haftada iki kez tekrar yapıyor.', 'Piko haftada bir tekrar yapıyor.'], answer: 1, objectiveId: 'u2l1-phrases', vocabId: 'v-revise' },
      ],
      reading: {
        title: 'Healthy Study Habits',
        paragraphs: [
          'Do you want healthy study habits? Start with a plan. Sasha makes a plan every Sunday, and she writes it carefully. She revises three times a week.',
          'Take short breaks. Piko works for twenty minutes, and then he rests. He doesn’t study quickly. He studies slowly and well. At the weekend, he exercises with his friends.',
          'Sleep is important too. Momo goes to bed late, and she is tired at school. Now she brushes her teeth and sleeps early. She keeps a diary and writes in it twice a week. A good routine is a healthy routine.',
        ],
        questions: [
          { id: 'rd-tf-plan', type: 'choice', prompt: 'Sasha makes a plan every day.', options: tf, answer: 1, objectiveId: 'u2l1-phrases' },
          { id: 'rd-tf-revise', type: 'choice', prompt: 'Sasha revises three times a week.', options: tf, answer: 0, objectiveId: 'u2l1-phrases', vocabId: 'v-three-times' },
          { id: 'rd-tf-quickly', type: 'choice', prompt: 'Piko studies quickly.', options: tf, answer: 1, objectiveId: 'u2l1-manner', vocabId: 'v-quickly' },
          { id: 'rd-tf-exercise', type: 'choice', prompt: 'Piko exercises at the weekend.', options: tf, answer: 0, objectiveId: 'u2l1-phrases', vocabId: 'v-exercise' },
          { id: 'rd-tf-diary', type: 'choice', prompt: 'Momo writes in her diary every day.', options: tf, answer: 1, objectiveId: 'u2l1-habits', vocabId: 'v-diary' },
          { id: 'rd-fill-careful', type: 'choice', prompt: 'Sasha writes her plan ___.', options: ['careful', 'care', 'carefully', 'carefulness'], answer: 2, objectiveId: 'u2l1-adjadv', vocabId: 'v-carefully' },
          { id: 'rd-fill-rest', type: 'choice', prompt: 'Piko works for twenty minutes, and then he ___.', options: ['rest', 'rests', 'restly', 'is rest'], answer: 1, objectiveId: 'u2l1-habits', vocabId: 'v-rest' },
          { id: 'rd-fill-healthy', type: 'choice', prompt: 'A good routine is a ___ routine.', options: ['health', 'healthily', 'heal', 'healthy'], answer: 3, objectiveId: 'u2l1-habits', vocabId: 'v-healthy' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-habit', 'v-brush', 'v-rest', 'v-exercise', 'v-revise', 'v-healthy',
              'v-every-day', 'v-once', 'v-twice', 'v-weekend', 'v-slowly', 'v-quietly',
              'rv-does', 'rv-usually', 'rv-doesnt', 'rv-now',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'honey-slime', escapee: 'piko' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-habit', line: { speaker: 'piko', en: 'I have a habit: I revise twice a week.', tr: 'Bir alışkanlığım var: haftada iki kez tekrar yaparım.' }, emphasis: ['habit', 'twice a week'] },
              { id: 'vs-brush', line: { speaker: 'sasha', en: 'I brush my teeth every day.', tr: 'Her gün dişlerimi fırçalarım.' }, emphasis: ['brush', 'every day'] },
              {
                id: 'vs-rest',
                line: { speaker: 'leo', en: 'I have a rest at the weekend.', tr: 'Hafta sonu dinlenirim.' },
                emphasis: ['rest', 'at the weekend'],
                joke: { tr: 'Alarm saati “haftada bir” çalmaz, her gün çalar. Sevilmeyen bir alışkanlık!' },
              },
              { id: 'vs-research', line: { speaker: 'sasha', en: 'I do research once a week.', tr: 'Haftada bir araştırma yaparım.' }, emphasis: ['research', 'once a week'] },
              { id: 'vs-quick', line: { speaker: 'momo', en: 'I run quickly. Piko walks slowly.', tr: 'Ben hızlı koşarım. Piko yavaş yürür.' }, emphasis: ['quickly', 'slowly'] },
              { id: 'vs-care', line: { speaker: 'sasha', en: 'I write carefully and speak quietly.', tr: 'Dikkatle yazar, sessizce konuşurum.' }, emphasis: ['carefully', 'quietly'] },
              { id: 'vs-well', line: { speaker: 'piko', en: 'I sleep well, not badly. I am healthy!', tr: 'İyi uyurum, kötü değil. Sağlıklıyım!' }, emphasis: ['well', 'badly'] },
              { id: 'vs-diary', line: { speaker: 'leo', en: 'I keep a diary three times a week.', tr: 'Haftada üç kez günlük tutarım.' }, emphasis: ['diary', 'three times a week'] },
            ],
            vocabRefs: [
              'v-habit', 'v-routine', 'v-research', 'v-brush', 'v-rest', 'v-exercise', 'v-practise', 'v-practice',
              'v-revise', 'v-healthy', 'v-diary', 'v-every-day', 'v-once', 'v-twice', 'v-three-times', 'v-weekend',
              'v-slowly', 'v-carefully', 'v-quietly', 'v-quickly', 'v-well', 'v-badly',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-habit', 'v-brush', 'v-rest', 'v-revise', 'v-healthy', 'v-slowly'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-ask', line: { speaker: 'narrator', en: 'Ms Pearl asks: “How often do you revise?”', tr: 'Ms Pearl soruyor: “Ne sıklıkla tekrar yapıyorsunuz?”' }, emphasis: ['How often'] },
              { id: 'ps-piko', line: { speaker: 'piko', en: 'I revise twice a week. I never make a plan.', tr: 'Haftada iki kez tekrar yaparım. Hiç plan yapmam.' }, gate: 'st-q-revise' },
              { id: 'ps-dora', line: { speaker: 'dora', en: 'How often do you practise tennis?', tr: 'Ne sıklıkla tenis çalışıyorsun?' }, gate: 'st-q-tennis' },
              { id: 'ps-tired', line: { speaker: 'narrator', en: 'Piko is tired. He sleeps badly every night.', tr: 'Piko yorgun. Her gece kötü uyuyor.' } },
              { id: 'ps-tips', line: { speaker: 'narrator', en: 'Ms Pearl says: “Make a plan. Take a short break. Sleep well.”', tr: 'Ms Pearl: “Plan yap. Kısa mola ver. İyi uyu.”' }, emphasis: ['short break'] },
              { id: 'ps-diary', line: { speaker: 'piko', en: 'I revise three times a week now. I work slowly and carefully.', tr: 'Artık haftada üç kez tekrar yapıyorum. Yavaş ve dikkatli çalışıyorum.' }, emphasis: ['slowly', 'carefully'] },
            ],
            choice: {
              prompt: 'What does Piko do tonight?',
              options: [
                { text: 'He makes a short study plan.', feedback: 'Güzel seçim! Plan, alışkanlığın ilk adımı.' },
                { text: 'He takes a short break and goes to bed early.', feedback: 'Güzel seçim! Dinlenmiş beyin daha iyi hatırlar.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-howoften',
                target: 'card-how-often',
                hint: { fine: 'Sıklığı sormak için How often. Cevapta once, twice ya da sayı + times a week de.', big: 'How often do you revise? Cevap: Twice a week.' },
                stepRef: 'ex-howoften',
              },
              {
                id: 'g-adverb',
                target: 'word-slowly',
                hint: { fine: 'Eylemi anlatan kelimeye -ly ekle: slow, slowly.', big: 'Piko walks slowly. Zarf eylemden sonra gelir.' },
                joke: { tr: 'Sıfat “careful” insanı anlatır. Zarf “carefully” ise -ly terliğini giyip eylemin peşinden gider.' },
                stepRef: 'ex-manner',
              },
              {
                id: 'g-adjadv',
                target: 'card-adjective',
                hint: { fine: 'Be fiilinden sonra sıfat, iş yapan fiilden sonra zarf.', big: 'She is careful. She works carefully. Good için zarf: well.' },
                stepRef: 'ex-adjadv',
              },
            ],
            goNoGo: {
              rule: { tr: 'Eylemi anlatan zarf (slowly, well…) görürsen dokun. Sıfat görürsen dokunma!', tapIf: 'adverb' },
              warmup: [
                { id: 'w-slowly', text: 'slowly', tap: true, why: 'slowly bir zarf (-ly)' },
                { id: 'w-slow', text: 'slow', tap: false, why: 'slow bir sıfat' },
                { id: 'w-carefully', text: 'carefully', tap: true, why: 'carefully eylemi anlatan zarf' },
                { id: 'w-quiet', text: 'quiet', tap: false, why: 'quiet bir sıfat' },
              ],
              round: [
                { id: 'r-quickly', text: 'quickly', tap: true, why: 'quick + ly = zarf' },
                { id: 'r-careful', text: 'careful', tap: false, why: 'careful sıfat' },
                { id: 'r-well', text: 'well', tap: true, why: 'good’un zarfı well' },
                { id: 'r-good', text: 'good', tap: false, why: 'good sıfat' },
                { id: 'r-quietly', text: 'quietly', tap: true, why: 'quiet + ly = zarf' },
                { id: 'r-healthy', text: 'healthy', tap: false, why: 'healthy sıfat (-y ile biter, zarf değil)' },
                { id: 'r-badly', text: 'badly', tap: true, why: 'bad + ly = zarf' },
                { id: 'r-bad', text: 'bad', tap: false, why: 'bad sıfat' },
                { id: 'r-works', text: 'works carefully', tap: true, why: 'carefully eylemi anlatır' },
                { id: 'r-is', text: 'is quick', tap: false, why: 'is quick: be + sıfat' },
              ],
              onWrongTap: { anim: 'candy-pop', line: 'Pop! Bu sefer -ly zarfı bekliyordum.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'study-planner', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'wall-calendar', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'library-shelf', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-complete', sceneObject: 'desk-lamp' },
              { ref: 'hw-6-complete', sceneObject: 'school-bell', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-9-order' },
            ],
            hint: { fine: 'Ne sıklıkla? Nasıl? Önce cümlenin eylemini bul, sonra sıklık kalıbını ya da -ly zarfını seç.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-howoften', 'as-twice', 'as-every-day', 'as-slowly', 'as-carefully', 'as-well',
              'as-order', 'as-habit', 'as-practise', 'as-healthy', 'as-quietly', 'as-meaning',
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
            frame: 'I ___ every day. I work ___ and I am ___.',
            chips: [
              { id: 'c-revise', en: 'revise', tr: 'tekrar yapmak', kind: 'verb' },
              { id: 'c-exercise', en: 'exercise', tr: 'egzersiz yapmak', kind: 'verb' },
              { id: 'c-practise', en: 'practise', tr: 'pratik yapmak', kind: 'verb' },
              { id: 'c-rest', en: 'rest', tr: 'dinlenmek', kind: 'verb' },
              { id: 'c-slowly', en: 'slowly', tr: 'yavaşça', kind: 'adj' },
              { id: 'c-carefully', en: 'carefully', tr: 'dikkatle', kind: 'adj' },
              { id: 'c-quietly', en: 'quietly', tr: 'sessizce', kind: 'adj' },
              { id: 'c-healthy', en: 'healthy', tr: 'sağlıklı', kind: 'adj' },
            ],
            collection: { title: 'Çalışma Planlarım' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      '“How often …?” sorusunu sorma ve cevaplama (every day, once / twice / three times a week, at the weekend); tarz zarfları (slowly, carefully, quietly, quickly, well, badly); sıfat ile zarf ayrımı. Çalışma alışkanlıkları kelimeleri ve sağlıklı çalışma rutini (plan, kısa mola, uyku).',
    vocabulary: [
      'habit', 'morning routine', 'do research', 'brush your teeth', 'have a rest', 'exercise', 'practise (verb)', 'practice (noun)',
      'revise for a test', 'healthy', 'keep a diary', 'every day', 'once a week', 'twice a week', 'three times a week', 'at the weekend',
      'slowly', 'carefully', 'quietly', 'quickly', 'well', 'badly',
    ],
    grammar: [
      'How often do / does …? — Every day. / Once a week. / Twice a week. / Three times a week.',
      'Sıklık kalıbı cümle sonunda; always / usually fiilden önce',
      'Sıfat + -ly = zarf: slow → slowly, careful → carefully; good → well, bad → badly',
      'Be + sıfat (She is careful.) / Eylem + zarf (She works carefully.)',
    ],
    expectedDifficulties: [
      'Türkçede sıfat ve zarf aynı biçimde kullanılır (“yavaş yürüyor”, “yavaş çocuk”); “Piko walks slow.” demeye eğilim olur.',
      '“good” sıfatından “goodly” türetmek; well’i hatırlamak zor gelir.',
      'twice yerine “two times”, once yerine “one time” demek; üç ve sonrası için times’ı unutmak.',
      'Sıklık kalıbını fiilin önüne koymak: “I every day brush my teeth.”',
      'practise / practice yazımını karıştırmak (fiil mi isim mi?).',
      'How often sorusunda do / does yerine fiili çekmek: “How often you revise?”',
    ],
    commonErrors: [
      { error: 'Piko walks slow.', correction: 'Piko walks slowly. Eylemi anlatan kelime -ly zarfı olur.' },
      { error: 'She plays good.', correction: 'She plays well. good’un zarfı well.' },
      { error: 'I revise two times a week.', correction: 'I revise twice a week. İki kez için twice.' },
      { error: 'How often you practise English?', correction: 'How often do you practise English? Soruda do gelir.' },
      { error: 'I brush every day my teeth.', correction: 'I brush my teeth every day. Sıklık kalıbı sona gelir.' },
      { error: 'I practice English every day.', correction: 'I practise English every day. Fiil: practise; isim: practice.' },
    ],
    questionsToAsk: [
      'How often do you revise for English?',
      'How often do you brush your teeth?',
      'Do you work slowly or quickly? (gerçek ya da hayali cevap verebilirsin)',
      'How often do you rest at the weekend?',
    ],
    speakingPrompts: [
      'Study habits: “I revise twice a week. I work carefully.”',
      'Healthy routine: “I make a plan every Sunday. I sleep well.”',
      'Sports: “I exercise three times a week.”',
      'A Lugu character: “Piko studies slowly. Momo runs quickly.”',
      'Diary: “I keep a diary once a week.” (içeriği paylaşmak zorunda değilsin)',
    ],
    rolePlay: {
      situation: 'Sınıf anketi: Ms Pearl çalışma alışkanlıkları hakkında “How often …?” sorularıyla anket yapıyor, öğrenci Piko’ya ve Sasha’ya sorular soruyor.',
      roles: ['Ms Pearl (öğretmen, ankete başlar)', 'Öğrenci (sen ya da hayali bir öğrenci)', 'Piko (plan yapmaz, yorgun)', 'Sasha (plan yapar, düzenli)'],
      steps: [
        'Ms Pearl sorar: “How often do you revise?” Öğrenci gerçek ya da hayali bir cevap verir: “Twice a week.”',
        'Öğrenci Piko’ya sorar: “How often do you sleep well?” Piko cevaplar: “Not often.”',
        'Öğrenci Sasha’ya “How often do you make a plan?” diye sorar; Sasha “Every Sunday. I write it carefully.” der.',
        'Roller değişir; öğrenci Piko’ya üç sağlıklı alışkanlık önerir: plan, kısa mola, uyku.',
      ],
    },
    listening: {
      script:
        'Sasha has a study routine. She makes a plan every Sunday, and she writes it carefully. She revises three times a week, and she works quietly in the library. She takes a short break every hour. At the weekend, she has a rest. Piko is different. He never makes a plan. He studies late every night, and he sleeps badly. He is tired at school. Now Ms Pearl helps him. He makes a short plan, he takes breaks, and he sleeps well. He is very happy, and he keeps a diary.',
      questions: [
        'How often does Sasha make a plan? (Every Sunday.)',
        'How often does Sasha revise? (Three times a week.)',
        'How does Sasha write her plan? (Carefully.)',
        'Does Piko sleep well at first? (No, he sleeps badly.)',
        'What does Piko keep now? (A diary.)',
      ],
    },
    reinforcement: [
      'Sıklık merdiveni: öğretmen bir haftalık takvim çizer; öğrenci günleri işaretler ve once / twice / three times a week / every day cümlelerini söyler.',
      'Sıfat-zarf çiftleri: slow / slowly, careful / carefully, quiet / quietly, good / well; öğrenci iki cümle kurar (“He is slow. He walks slowly.”).',
      'practise ve practice kartları: fiil mi isim mi? Öğrenci kartı doğru cümleye koyar.',
    ],
    suggestedActivities: [
      'Alışkanlık anketi: öğrenci üç “How often …?” sorusu hazırlar ve öğretmene sorar.',
      'Pandomim: öğretmen bir eylemi yavaş / hızlı / sessiz yapar, öğrenci “You walk slowly.” der.',
      'Haftalık çalışma planı posteri: öğrenci günleri ve sıklık kalıplarıyla kendi (gerçek ya da hayali) planını yazar.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma sorusu: “How often do you brush your teeth?” (Every day.)',
        'Isınma sorusu: “How often do you have English?” (gerçek ya da hayali cevap)',
        'Karakter seç: “Who is your favourite: Piko, Sasha, Momo, Dora or Leo?” (“He is funny.”)',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Sıklık kalıpları kartları (every day, once a week, twice a week, three times a week, at the weekend): öğretmen bir takvim gösterir, öğrenci cümle kurar.',
        'Zarf oyunu: öğretmen eylemi pandomimle yapar (walk, write, speak), öğrenci “slowly / quickly / quietly / carefully” der.',
        'Kısa kelime kartları: habit, routine, revise, rest, healthy, diary; öğrenci her biriyle bir cümle kurar.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen cevabı verir (“Twice a week.”), öğrenci soruyu kurar (“How often do you revise?”).',
        'Tur 2: sıfat / zarf: öğretmen “careful, quiet, good”, öğrenci zarfı ve bir cümleyi söyler (“She works carefully.”).',
        'Tur 3: “She is careful. She works carefully.” kalıbıyla iki Lugu karakterini anlat.',
        'Hatırlatma (1 dk): good → well, bad → badly ve practise / practice farkı.',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Sınıf anketi rol oyunu: Ms Pearl ankete başlar, öğrenci Piko ve Sasha’ya “How often …?” sorusunu sorar; sonra roller değişir.',
        'Beklenen cümleler: “How often do you revise? — Twice a week.” “She works carefully.” “He sleeps badly.”',
        'Öğretmen notu: Hata olursa sonunda topluca düzelt; rol oyununu bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'Sasha has a study routine. She makes a plan every Sunday, and she writes it carefully. She revises three times a week, and she works quietly in the library. She takes a short break every hour. At the weekend, she has a rest. Piko is different. He never makes a plan. He studies late every night, and he sleeps badly. He is tired at school. Now Ms Pearl helps him. He makes a short plan, he takes breaks, and he sleeps well. He is very happy, and he keeps a diary.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin.',
        'Sorular: How often does Sasha make a plan? How often does she revise? How does Piko sleep at first? What does Piko keep now?',
        'Öğrenci Sasha ya da Piko’yu seçip bir sıklık ve bir zarfla tek cümleyle anlatır.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık yaptığı hatayı (slow / slowly, good / well, two times / twice) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: sıfat-zarf ayrımı, well, twice / once, soruda do / does.',
        '“Sakın tıklama” sözlü turu: öğretmen kelime söyler, öğrenci “zarf mı sıfat mı?” der. Yanlışta nazikçe “Yaklaştın!” de, sonra doğrusunu birlikte kur.',
      ],
    },
    freeSpeaking: {
      minutes: 8,
      activities: [
        'Konu 1: Çalışma rutinin. “I revise … I work …” (gerçek ya da hayali cevap verebilirsin)',
        'Konu 2: Sağlıklı bir gün: “I sleep well. I exercise … I rest at the weekend.”',
        'Konu 3: Bir Lugu karakteri için çalışma planı öner (Piko’ya üç tavsiye).',
        'Konu 4: Spor ya da hobi: “How often do you practise …?” (kendi seçeceğin bir etkinlik)',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: Kitaptaki “study habits” çıktısına bağlı olarak, bir haftalık çalışma planını (gerçek ya da hayali) yaz ya da sesli kaydet: en az üç alışkanlık, her biri için bir sıklık (twice a week…) ve bir -ly zarfı.',
    },
  },
}
export default lesson
