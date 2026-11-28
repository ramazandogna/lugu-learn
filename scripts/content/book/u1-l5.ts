/** Ünite 1.5 — Right Now at School: present progressive (+ - ?) and object pronouns. Theme u4-school-bell, host dora. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.5 — Right Now at School',
  sourceNotes:
    'Kitap Ünite 1 (School Life): present progressive (am/is/are + -ing; olumsuz, soru, kısa cevap; yazım: writing, running, sitting) ve object pronouns (me, you, him, her, it, us, them); instruction, clap, draw, carry, help, explain, check, share, wait. Şu an yapılan okul aktivitelerini anlatma.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Dora and the Live School Radio',
      tagline: 'Dora okul radyosunda canlı yayında! Şu anda kim ne yapıyor? -ing ile anlat.',
      theme: 'School life',
      character: 'dora',
      level: 'A1',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u1l5-ing', text: 'am / is / are + -ing ile şu anda yapılan eylemi anlatır.' },
        { id: 'u1l5-spell', text: '-ing yazımını doğru yapar: writing, running, sitting.' },
        { id: 'u1l5-neg-q', text: 'Olumsuz cümle kurar, “Are you …ing?” sorar ve kısa cevap verir.' },
        { id: 'u1l5-obj', text: 'me, you, him, her, it, us, them ile “The teacher is helping us.” gibi cümle kurar.' },
        { id: 'u1l5-vocab', text: 'Okulda şu an olan işleri anlatan fiil öbeklerini (carry the boxes, check the answers) kullanır.' },
      ],
      grammar: [
        'am / is / are + verb-ing (şu anda)',
        'I am not / He isn’t / They aren’t + verb-ing; Is she …ing? Yes, she is.',
        'Yazım: write → writing, run → running, sit → sitting',
        'Object pronouns: me, you, him, her, it, us, them',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-does', type: 'choice', prompt: 'Ms Pearl says: “Leo ___ his homework every day.”', options: ['do', 'does', 'doing'], answer: 1, hint: 'Leo için he diyoruz. Her gün yapılan işte he/she/it ile hangi yardımcı gelir?', explain: '**He / she / it** ile **does** gelir: Leo does his homework every day.', objectiveId: 'u1l5-vocab' },
        { id: 'rv-dont', type: 'choice', prompt: 'Momo says: “I ___ like early mornings.”', options: ['don’t', 'doesn’t', 'isn’t'], answer: 0, hint: 'Cümlede I var. I ile hangi olumsuz yardımcı gelir?', explain: '**I / you / we / they** ile **don’t** gelir: I don’t like early mornings.', objectiveId: 'u1l5-vocab' },
        { id: 'rv-do-you', type: 'choice', prompt: 'Piko asks Sasha: “___ you study after school?”', options: ['Are', 'Do', 'Does'], answer: 1, hint: 'Alışkanlık sorusu: you ile hangisi başa gelir?', explain: 'Alışkanlık sorusunda **Do you** …? deriz: Do you study after school?', objectiveId: 'u1l5-vocab' },
        { id: 'rv-never', type: 'choice', prompt: 'Dora says about Leo: “He is never late. He ___ comes on time.”', options: ['sometimes', 'always', 'never'], answer: 1, hint: 'Geç kalmıyorsa her zaman zamanında gelir.', explain: 'Hep zamanında geliyorsa **always** deriz: He always comes on time.', objectiveId: 'u1l5-vocab' },
      ],
    },
    vocabulary: [
      { id: 'v-clap', en: 'clap for someone', tr: 'birini alkışlamak', example: { en: 'Piko is clapping for Leo.', tr: 'Piko, Leo’yu alkışlıyor.' }, difficulty: 1, objectiveId: 'u1l5-vocab' },
      { id: 'v-draw', en: 'draw a poster', tr: 'poster çizmek', example: { en: 'Leo is drawing a poster.', tr: 'Leo bir poster çiziyor.' }, difficulty: 1, objectiveId: 'u1l5-vocab' },
      { id: 'v-carry', en: 'carry the boxes', tr: 'kutuları taşımak', example: { en: 'Piko is carrying the boxes.', tr: 'Piko kutuları taşıyor.' }, difficulty: 2, objectiveId: 'u1l5-vocab' },
      { id: 'v-help', en: 'help', tr: 'yardım etmek', example: { en: 'The teacher is helping us.', tr: 'Öğretmen bize yardım ediyor.' }, difficulty: 1, objectiveId: 'u1l5-obj' },
      { id: 'v-explain', en: 'explain the rule', tr: 'kuralı açıklamak', example: { en: 'Ms Pearl is explaining the rule.', tr: 'Ms Pearl kuralı açıklıyor.' }, difficulty: 2, objectiveId: 'u1l5-vocab' },
      { id: 'v-check', en: 'check the answers', tr: 'cevapları kontrol etmek', example: { en: 'Sasha is checking the answers.', tr: 'Sasha cevapları kontrol ediyor.' }, difficulty: 2, objectiveId: 'u1l5-vocab' },
      { id: 'v-share', en: 'share a book', tr: 'kitabı paylaşmak', example: { en: 'Dora and Momo are sharing a book.', tr: 'Dora ve Momo bir kitabı paylaşıyor.' }, context: 'share fiili e ile biter: sharing.', difficulty: 2, objectiveId: 'u1l5-spell' },
      { id: 'v-wait', en: 'wait for the bell', tr: 'zili beklemek', example: { en: 'We are waiting for the bell.', tr: 'Zili bekliyoruz.' }, context: '“Beklemek” için wait for dersin.', difficulty: 2, objectiveId: 'u1l5-vocab' },
      { id: 'v-instruction', en: 'instruction', tr: 'talimat', example: { en: 'Ms Pearl is giving an instruction.', tr: 'Ms Pearl bir talimat veriyor.' }, difficulty: 2, objectiveId: 'u1l5-vocab' },
      { id: 'v-write', en: 'write on the board', tr: 'tahtaya yazmak', example: { en: 'Sasha is writing on the board.', tr: 'Sasha tahtaya yazıyor.' }, context: 'write sondaki e’yi atar: writing.', difficulty: 1, objectiveId: 'u1l5-spell' },
      { id: 'v-run', en: 'run in the corridor', tr: 'koridorda koşmak', example: { en: 'Momo is running in the corridor.', tr: 'Momo koridorda koşuyor.' }, context: 'Okulda koridorda koşmak yasaktır; run son harfi ikiler: running.', difficulty: 2, objectiveId: 'u1l5-spell' },
      { id: 'v-sit', en: 'sit at the desk', tr: 'sırada oturmak', example: { en: 'Leo is sitting at the desk.', tr: 'Leo sırada oturuyor.' }, context: 'sit son harfi ikiler: sitting.', difficulty: 2, objectiveId: 'u1l5-spell' },
      { id: 'v-right-now', en: 'right now', tr: 'şu anda', example: { en: 'Piko is eating toast right now.', tr: 'Piko şu anda tost yiyor.' }, context: '“Right now” görünce -ing düşün.', difficulty: 1, objectiveId: 'u1l5-ing' },
      { id: 'v-corridor', en: 'corridor', tr: 'koridor', example: { en: 'The corridor is full of students.', tr: 'Koridor öğrencilerle dolu.' }, difficulty: 1, objectiveId: 'u1l5-vocab' },
      { id: 'v-busy', en: 'busy', tr: 'meşgul, hareketli', example: { en: 'The school is busy this morning.', tr: 'Okul bu sabah çok hareketli.' }, difficulty: 1, objectiveId: 'u1l5-vocab' },
      { id: 'v-listen', en: 'listen to the teacher', tr: 'öğretmeni dinlemek', example: { en: 'We are listening to the teacher.', tr: 'Öğretmeni dinliyoruz.' }, context: '“Dinlemek” için listen to dersin; to unutulmasın.', difficulty: 2, objectiveId: 'u1l5-vocab' },
      { id: 'v-tidy', en: 'tidy up the art room', tr: 'resim odasını toplamak', example: { en: 'Momo is tidying up the art room.', tr: 'Momo resim odasını topluyor.' }, difficulty: 3, objectiveId: 'u1l5-vocab' },
      { id: 'v-open', en: 'open the window', tr: 'pencereyi açmak', example: { en: 'Who is opening the window?', tr: 'Pencereyi kim açıyor?' }, difficulty: 1, objectiveId: 'u1l5-vocab' },
    ],
    story: {
      title: 'Dora and the Live School Radio',
      character: 'dora',
      setting: 'A busy Monday morning at school: classroom, corridor and the bell',
      scenes: [
        {
          id: 'sc-radio',
          illustration: 'Dora stands at the classroom door with a notebook; behind her the class is busy and Piko carries three boxes.',
          lines: [
            { speaker: 'narrator', en: 'It is 10 o’clock. The school is very busy.', tr: 'Saat 10. Okul çok hareketli.' },
            { speaker: 'dora', en: 'Hello, school radio! This is Dora. I am reporting right now!', tr: 'Merhaba okul radyosu! Ben Dora. Şu anda canlı yayındayım!' },
            { speaker: 'dora', en: 'I am standing at the classroom door. Everyone is working.', tr: 'Sınıfın kapısında duruyorum. Herkes çalışıyor.' },
            { speaker: 'piko', en: 'Dora, wait for me! I am carrying the boxes.', tr: 'Dora, beni bekle! Kutuları taşıyorum.' },
            { speaker: 'narrator', en: 'Piko is carrying three boxes. He is walking slowly.', tr: 'Piko üç kutu taşıyor. Yavaş yürüyor.' },
          ],
        },
        {
          id: 'sc-class',
          illustration: 'Ms Pearl at the whiteboard, Sasha writing a list, Leo drawing a big poster at his desk.',
          lines: [
            { speaker: 'narrator', en: 'Ms Pearl is explaining a new rule. Everybody is listening.', tr: 'Ms Pearl yeni bir kuralı açıklıyor. Herkes dinliyor.' },
            { speaker: 'narrator', en: 'Ms Pearl says: “I am giving you an instruction. Please check the answers.”', tr: 'Ms Pearl diyor ki: “Size bir talimat veriyorum. Lütfen cevapları kontrol edin.”' },
            { speaker: 'sasha', en: 'I am writing the rules on the board.', tr: 'Kuralları tahtaya yazıyorum.' },
            { speaker: 'leo', en: 'I am drawing a poster for the class. Do you like it?', tr: 'Sınıf için bir poster çiziyorum. Beğendin mi?' },
            { speaker: 'dora', en: 'The teacher is helping us. She is helping me, too!', tr: 'Öğretmen bize yardım ediyor. Bana da yardım ediyor!' },
          ],
        },
        {
          id: 'sc-corridor',
          illustration: 'Momo runs in the corridor with a pile of papers; papers fly everywhere; Mr Aydın raises one hand.',
          lines: [
            { speaker: 'narrator', en: 'Oh no! Momo is running in the corridor with a pile of papers.', tr: 'Eyvah! Momo bir yığın kâğıtla koridorda koşuyor.' },
            { speaker: 'momo', en: 'Oops! I am not walking. I am running! Please help me!', tr: 'Hoppala! Yürümüyorum, koşuyorum! Lütfen bana yardım edin!' },
            { speaker: 'narrator', en: 'Mr Aydın says: “Stop, Momo! Don’t run in the corridor.”', tr: 'Mr Aydın diyor ki: “Dur, Momo! Koridorda koşma.”' },
            { speaker: 'narrator', en: 'The papers are flying everywhere. Piko is laughing.', tr: 'Kâğıtlar her yere uçuyor. Piko gülüyor.' },
            { speaker: 'dora', en: 'Piko, are you helping her? No? Then I am helping her!', tr: 'Piko, ona yardım ediyor musun? Hayır mı? O zaman ben ona yardım ediyorum!' },
          ],
          choice: {
            prompt: 'What is Dora doing now?',
            options: [
              { text: 'She is picking up the papers with Momo.', feedback: 'Güzel seçim! Birlikte toplamak işi hızlandırır.' },
              { text: 'She is telling Momo: “Walk, please!”', feedback: 'Doğru kural! Momo sonra yavaş yürüyecek ve kâğıtları da toplayacak.' },
            ],
          },
        },
        {
          id: 'sc-bell',
          illustration: 'The corridor is tidy again; the class stands at the door; the school bell rings.',
          lines: [
            { speaker: 'narrator', en: 'The bell is ringing. The students are waiting for the teacher.', tr: 'Zil çalıyor. Öğrenciler öğretmeni bekliyor.' },
            { speaker: 'dora', en: 'Are you tired? No, we aren’t! We are busy and happy.', tr: 'Yorgun musunuz? Hayır, değiliz! Meşgulüz ve mutluyuz.' },
            { speaker: 'sasha', en: 'Look! Ms Pearl is clapping for us.', tr: 'Bak! Ms Pearl bizi alkışlıyor.' },
            { speaker: 'dora', en: 'That is all from school radio. This is right now at school!', tr: 'Okul radyosundan bu kadar. İşte okulda şu an!' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-box', type: 'choice', prompt: 'Piko calls Dora in the first scene. What is he carrying?', options: ['A poster', 'The boxes', 'The papers'], answer: 1, hint: 'Piko: “I am carrying …”. Ne taşıyor?', explain: 'Piko kutuları taşıyor: “I am carrying the boxes.”', objectiveId: 'u1l5-ing', vocabId: 'v-carry' },
        { id: 'st-q-order', type: 'order', prompt: 'Dora reports from the classroom. Put her words in order.', tokens: ['is', 'the', 'rule.', 'Ms', 'Pearl', 'explaining'], answer: ['Ms', 'Pearl', 'is', 'explaining', 'the', 'rule.'], hint: 'Kim → is → fiil + ing → ne?', explain: 'Ms Pearl **is explaining** the rule.', objectiveId: 'u1l5-ing', vocabId: 'v-explain' },
        { id: 'st-q-leo', type: 'choice', prompt: 'Sasha is writing on the board. Leo is writing on the board, too.', options: tf, answer: 1, hint: 'Leo sahnede ne yapıyor? Sasha ile aynı şeyi mi?', explain: 'Leo yazmıyor, çiziyor: “I am drawing a poster.”', objectiveId: 'u1l5-ing', vocabId: 'v-draw' },
        { id: 'st-q-run', type: 'text', prompt: 'Momo is ___ in the corridor. (run) Type the word.', accept: ['running'], hint: 'run kısa bir kelime: sondaki harf ne olur?', explain: 'run **n** harfini ikiler: **running**.', objectiveId: 'u1l5-spell', vocabId: 'v-run' },
        { id: 'st-q-pron', type: 'choice', prompt: 'Dora says about Ms Pearl: “She is helping ___, too!” (Dora talks about herself.)', options: ['I', 'me', 'my'], answer: 1, hint: 'Fiilden sonra gelen “ben” hangi biçime döner?', explain: 'Fiilden sonra **me** gelir: She is helping me.', objectiveId: 'u1l5-obj', vocabId: 'v-help' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-now',
          title: 'Şu anda olan şey: -ing',
          body: 'Dora canlı yayında. Şu anda olan bir şeyi anlatmak için **am / is / are + fiil-ing** kullanırız. “Right now”, “now”, “at the moment” bu kalıbın işaretidir.',
          examples: [
            { en: 'Piko is carrying the boxes.', tr: 'Piko kutuları taşıyor.' },
            { en: 'I am talking right now.', tr: 'Şu anda konuşuyorum.' },
            { en: 'The bell is ringing.', tr: 'Zil çalıyor.' },
          ],
          check: { id: 'ex-check-now', type: 'choice', prompt: 'Dora talks to the radio: “Leo ___ a poster right now.”', options: ['draws', 'is drawing', 'draw'], answer: 1, hint: '“Right now” şu anı gösterir. Hangi kalıp şu anı anlatır?', explain: 'Şu an için **is + drawing**: Leo is drawing a poster right now.', objectiveId: 'u1l5-ing', vocabId: 'v-draw' },
        },
        {
          id: 'ex-form',
          title: 'Kime hangi yardımcı?',
          body: 'Eski dostlar yine burada: **I am**, **he / she / it is**, **you / we / they are**. Fiile **-ing** eklersin, yardımcı fiil aynı kalır.',
          examples: [
            { en: 'I am waiting for the bell.', tr: 'Zili bekliyorum.' },
            { en: 'She is helping us.', tr: 'O bize yardım ediyor.' },
            { en: 'You are clapping for Momo.', tr: 'Sen Momo’yu alkışlıyorsun.' },
            { en: 'They are sharing a book.', tr: 'Onlar bir kitabı paylaşıyor.' },
          ],
          check: { id: 'ex-check-form', type: 'choice', prompt: 'Sasha and Dora are in the library. They ___ sharing a book.', options: ['is', 'am', 'are'], answer: 2, hint: 'İki kişi var: they. They ile hangi yardımcı gelir?', explain: '**They** ile **are** gelir: They are sharing a book.', objectiveId: 'u1l5-ing', vocabId: 'v-share' },
        },
        {
          id: 'ex-spell',
          title: '-ing yazımı: üç küçük numara',
          body: 'Çoğu fiile direkt **-ing** eklenir: help → helping. **e** ile bitiyorsa e düşer: write → **writing**. Kısa bir sesli ve bir sessizle bitiyorsa sessiz harf ikilenir: run → **running**, sit → **sitting**.',
          examples: [
            { en: 'help → helping', tr: 'direkt -ing' },
            { en: 'write → writing', tr: 'e düşer' },
            { en: 'run → running', tr: 'n ikilenir' },
            { en: 'sit → sitting', tr: 't ikilenir' },
          ],
          check: { id: 'ex-check-spell', type: 'choice', prompt: 'Sasha writes on the board. Which one is correct?', options: ['Sasha is writeing.', 'Sasha is writting.', 'Sasha is writing.'], answer: 2, hint: 'write e ile bitiyor. E’ye ne olur?', explain: 'write → e düşer: **writing**.', objectiveId: 'u1l5-spell', vocabId: 'v-write' },
        },
        {
          id: 'ex-neg',
          title: 'Olumsuz: not ekle',
          body: 'Şu an olmayan şey için yardımcıya **not** eklersin: **am not**, **isn’t**, **aren’t**. Fiil yine **-ing** alır.',
          examples: [
            { en: 'I am not running.', tr: 'Koşmuyorum.' },
            { en: 'Piko isn’t laughing.', tr: 'Piko gülmüyor.' },
            { en: 'We aren’t waiting.', tr: 'Beklemiyoruz.' },
          ],
          check: { id: 'ex-check-neg', type: 'choice', prompt: 'Momo is walking now. She ___ running.', options: ['isn’t', 'aren’t', 'am not'], answer: 0, hint: 'Momo için she. Koşmuyor, yürüyor.', explain: '**She** ile **isn’t**: She isn’t running.', objectiveId: 'u1l5-neg-q', vocabId: 'v-run' },
        },
        {
          id: 'ex-question',
          title: 'Soru ve kısa cevap',
          body: 'Soru için yardımcı öne geçer: **Are** you waiting? **Is** she writing? Kısa cevapta fiil tekrar edilmez: **Yes, she is.** / **No, I’m not.**',
          examples: [
            { en: 'Is Leo drawing?', tr: 'Leo çiziyor mu?' },
            { en: 'Yes, he is.', tr: 'Evet, çiziyor.' },
            { en: 'Are you running? No, I’m not.', tr: 'Koşuyor musun? Hayır.' },
          ],
          check: { id: 'ex-check-question', type: 'choice', prompt: 'Dora asks Piko: “___ you carrying the boxes?”', options: ['Do', 'Is', 'Are'], answer: 2, hint: 'You ile -ing’in yardımcısı hangisi?', explain: '**You** ile **Are**: Are you carrying the boxes?', objectiveId: 'u1l5-neg-q', vocabId: 'v-carry' },
        },
        {
          id: 'ex-wh',
          title: 'What are you doing?',
          body: 'Ne yaptığını sormak için **What + am / is / are + özne + doing?** deriz. Cevap bir -ing cümlesi olur.',
          examples: [
            { en: 'What is Sasha doing?', tr: 'Sasha ne yapıyor?' },
            { en: 'She is checking the answers.', tr: 'Cevapları kontrol ediyor.' },
            { en: 'What are they doing?', tr: 'Onlar ne yapıyor?' },
          ],
          check: { id: 'ex-check-wh', type: 'choice', prompt: 'Dora looks at Momo and Piko. “What ___ they doing?”', options: ['is', 'are', 'does'], answer: 1, hint: 'They ile hangi yardımcı?', explain: '**They** ile **are**: What are they doing?', objectiveId: 'u1l5-neg-q', vocabId: 'v-busy' },
        },
        {
          id: 'ex-obj',
          title: 'Fiilden sonra: me, you, him, her, it, us, them',
          body: 'Fiilden sonra “ben” **me**, “o (erkek)” **him**, “o (kız)” **her**, “biz” **us**, “onlar” **them** olur. **You** ve **it** aynı kalır.',
          examples: [
            { en: 'The teacher is helping us.', tr: 'Öğretmen bize yardım ediyor.' },
            { en: 'I am clapping for him.', tr: 'Onu alkışlıyorum.' },
            { en: 'Momo is waiting for them.', tr: 'Momo onları bekliyor.' },
          ],
          check: { id: 'ex-check-obj', type: 'choice', prompt: 'Ms Pearl helps Dora and Sasha. She is helping ___.', options: ['they', 'them', 'us'], answer: 1, hint: 'Ms Pearl iki kişiden bahsediyor ve onlardan ayrı. Fiilden sonra “onlar” nasıl olur?', explain: 'Fiilden sonra “onlar” **them** olur: She is helping them.', objectiveId: 'u1l5-obj', vocabId: 'v-help' },
        },
        {
          id: 'ex-vs',
          title: 'Şimdi mi, her gün mü?',
          body: 'Büyük soru: **şu an** mı oluyor? O zaman **-ing**. Her gün ya da sık sık oluyorsa Ünite 1.4’teki gibi **-s / do / does**.',
          examples: [
            { en: 'Leo is drawing right now.', tr: 'Leo şu anda çiziyor.' },
            { en: 'Leo draws every day.', tr: 'Leo her gün çizer.' },
            { en: 'Dora is reading now. She reads at night.', tr: 'Dora şu an okuyor. Geceleri okur.' },
          ],
          check: { id: 'ex-check-vs', type: 'choice', prompt: 'Dora: “Look! Momo ___ in the corridor!”', options: ['runs', 'is running', 'run'], answer: 1, hint: '“Look!” dediğine göre bu olay şu anda mı oluyor?', explain: '“Look!” şu anı gösterir: Momo **is running**.', objectiveId: 'u1l5-ing', vocabId: 'v-corridor' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u1l5-ing',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Sasha is at the board. “I ___ writing the rules.”', options: ['is', 'are', 'am'], answer: 2, hint: 'Konuşan Sasha: I.', explain: '**I** ile **am**: I am writing the rules.', objectiveId: 'u1l5-ing', vocabId: 'v-write' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Sasha speaks to the class. Build her sentence.', tokens: ['writing', 'am', 'I', 'the rules.'], answer: ['I', 'am', 'writing', 'the rules.'], hint: 'I → am → fiil-ing → ne?', explain: 'I am writing the rules.', objectiveId: 'u1l5-ing' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Leo reads Sasha’s note: “I am writing the rules.” What does it mean?', options: ['Kuralları yazıyorum.', 'Kuralları okuyorum.', 'Kuralları yazdım.'], answer: 0, hint: 'write = yazmak, -ing = şu anda.', explain: 'write = yazmak. Şu anda yazıyorum.', objectiveId: 'u1l5-ing', vocabId: 'v-write' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u1l5-spell',
          complete: { id: 'hw-2-complete', type: 'text', prompt: 'Piko is in the corridor. He is ___ fast. (run) Type the word.', accept: ['running'], hint: 'run + ing: sondaki n’ye dikkat.', explain: 'run → n ikilenir: **running**.', objectiveId: 'u1l5-spell', vocabId: 'v-run' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Dora reports from the corridor. Put her words in order.', tokens: ['is', 'running', 'Piko', 'fast.'], answer: ['Piko', 'is', 'running', 'fast.'], hint: 'Kim → is → running → nasıl?', explain: 'Piko is running fast.', objectiveId: 'u1l5-spell' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Mr Aydın sees Piko and says: “He is running.” What does it mean?', options: ['O koşuyor.', 'O yürüyor.', 'O oturuyor.'], answer: 0, hint: 'run = koşmak', explain: 'run = koşmak. O koşuyor.', objectiveId: 'u1l5-spell', vocabId: 'v-run' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u1l5-spell',
          complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Leo is at his desk. He is ___ and drawing.', options: ['sitting', 'siting', 'sitiing'], answer: 0, hint: 'sit kısa bir kelime. Sondaki t ne olur?', explain: 'sit → t ikilenir: **sitting**.', objectiveId: 'u1l5-spell', vocabId: 'v-sit' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Momo points at Leo. Build her sentence.', tokens: ['at', 'is', 'Leo', 'sitting', 'the desk.'], answer: ['Leo', 'is', 'sitting', 'at', 'the desk.'], hint: 'Kim → is → sitting → nerede?', explain: 'Leo is sitting at the desk.', objectiveId: 'u1l5-spell' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Momo says: “Leo is sitting at the desk.” What does she mean?', options: ['Leo sırada oturuyor.', 'Leo sıradan kalkıyor.', 'Leo sırada oturuyordu.'], answer: 0, hint: 'sit = oturmak', explain: 'sit = oturmak. Leo sırada oturuyor.', objectiveId: 'u1l5-spell', vocabId: 'v-sit' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u1l5-spell',
          complete: { id: 'hw-4-complete', type: 'text', prompt: 'Dora and Momo are ___ a book. (share) Type the word.', accept: ['sharing'], hint: 'share e ile bitiyor. E’ye ne olur?', explain: 'share → e düşer: **sharing**.', objectiveId: 'u1l5-spell', vocabId: 'v-share' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Dora tells the radio. Put her words in order.', tokens: ['a book.', 'sharing', 'are', 'We'], answer: ['We', 'are', 'sharing', 'a book.'], hint: 'We → are → sharing → ne?', explain: 'We are sharing a book.', objectiveId: 'u1l5-spell' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Dora says: “We are sharing a book.” What does it mean?', options: ['Bir kitabı okuyoruz.', 'Bir kitabı paylaşıyoruz.', 'Bir kitap alıyoruz.'], answer: 1, hint: 'share = paylaşmak', explain: 'share = paylaşmak. Bir kitabı paylaşıyoruz.', objectiveId: 'u1l5-spell', vocabId: 'v-share' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u1l5-neg-q',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Momo is walking slowly now. She ___ running.', options: ['aren’t', 'isn’t', 'am not'], answer: 1, hint: 'Momo için she. Koşmuyor.', explain: '**She** ile **isn’t**: She isn’t running.', objectiveId: 'u1l5-neg-q', vocabId: 'v-run' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Dora explains on the radio. Build her sentence.', tokens: ['running', 'isn’t', 'She', 'now.'], answer: ['She', 'isn’t', 'running', 'now.'], hint: 'She → isn’t → running → ne zaman?', explain: 'She isn’t running now.', objectiveId: 'u1l5-neg-q' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Dora says: “They aren’t waiting.” What does it mean?', options: ['Onlar bekliyor.', 'Onlar beklemiyor.', 'Onlar bekledi.'], answer: 1, hint: 'aren’t = are not', explain: 'aren’t = are not. Onlar beklemiyor.', objectiveId: 'u1l5-neg-q', vocabId: 'v-wait' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u1l5-neg-q',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Dora asks Leo: “___ you drawing a poster?”', options: ['Is', 'Are', 'Do'], answer: 1, hint: 'You ile -ing’in yardımcısı.', explain: '**You** ile **Are**: Are you drawing a poster?', objectiveId: 'u1l5-neg-q', vocabId: 'v-draw' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Piko asks about Sasha. Put his words in order.', tokens: ['Sasha', 'writing?', 'Is'], answer: ['Is', 'Sasha', 'writing?'], hint: 'Soru yardımcıyla başlar.', explain: 'Is Sasha writing?', objectiveId: 'u1l5-neg-q' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Piko asks: “Are you waiting for me?” What does he mean?', options: ['Beni mi bekliyorsun?', 'Beni mi çağırıyorsun?', 'Beni mi arıyorsun?'], answer: 0, hint: 'wait for = beklemek', explain: 'wait for = beklemek. Beni mi bekliyorsun?', objectiveId: 'u1l5-neg-q', vocabId: 'v-wait' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u1l5-neg-q',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Dora asks: “Is Piko carrying the boxes?” He is. Leo answers: “Yes, he ___.”', options: ['does', 'is', 'carries'], answer: 1, hint: 'Kısa cevapta -ing’li fiili tekrar etmezsin; sorudaki yardımcıyı kullanırsın.', explain: 'Kısa cevapta yardımcı tekrar edilir: Yes, he **is**.', objectiveId: 'u1l5-neg-q', vocabId: 'v-carry' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Momo answers Dora. Build her short answer.', tokens: ['No,', 'not.', 'I’m'], answer: ['No,', 'I’m', 'not.'], hint: 'No → I’m → not', explain: 'No, I’m not.', objectiveId: 'u1l5-neg-q' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Dora asks: “Are you running?” Momo answers: “No, I’m not.” What does she mean?', options: ['Koşuyorum.', 'Koşmuyorum.', 'Koşmadım.'], answer: 1, hint: 'I’m not = I am not', explain: 'I’m not = I am not. Koşmuyorum.', objectiveId: 'u1l5-neg-q', vocabId: 'v-run' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u1l5-obj',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Ms Pearl is teaching Dora and Leo. She is helping ___.', options: ['us', 'them', 'we'], answer: 1, hint: 'Ms Pearl Dora ve Leo’dan bahsediyor; onlar onun için “onlar”.', explain: 'Fiilden sonra “onlar” **them**: She is helping them.', objectiveId: 'u1l5-obj', vocabId: 'v-help' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Dora speaks on the radio. Put her words in order.', tokens: ['us.', 'teacher', 'helping', 'The', 'is'], answer: ['The', 'teacher', 'is', 'helping', 'us.'], hint: 'Kim → is → helping → kime?', explain: 'The teacher is helping us.', objectiveId: 'u1l5-obj' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Dora says: “The teacher is helping us.” What does it mean?', options: ['Öğretmen bize yardım ediyor.', 'Öğretmen bizi çağırıyor.', 'Öğretmen onlara yardım ediyor.'], answer: 0, hint: 'us = bize / bizi', explain: 'us = bize. Öğretmen bize yardım ediyor.', objectiveId: 'u1l5-obj', vocabId: 'v-help' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u1l5-obj',
          complete: { id: 'hw-9-complete', type: 'text', prompt: 'Leo is drawing. Sasha says: “Look at ___. He is drawing a poster.” (Type him, her or it.)', accept: ['him'], hint: 'Leo bir erkek. Fiilden/edattan sonra he’nin biçimi?', explain: 'He → **him**: Look at him.', objectiveId: 'u1l5-obj', vocabId: 'v-draw' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Piko speaks to Dora. Build his sentence.', tokens: ['for', 'clapping', 'I', 'her.', 'am'], answer: ['I', 'am', 'clapping', 'for', 'her.'], hint: 'I am clapping + for + o (kız)', explain: 'I am clapping for her.', objectiveId: 'u1l5-obj' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Piko says: “Please wait for me.” What does it mean?', options: ['Lütfen beni bekle.', 'Lütfen bizi bekle.', 'Lütfen onu bekle.'], answer: 0, hint: 'me = ben(i)', explain: 'me = beni. Lütfen beni bekle.', objectiveId: 'u1l5-obj', vocabId: 'v-wait' },
        },
        {
          id: 'hw-10',
          objectiveId: 'u1l5-vocab',
          complete: { id: 'hw-10-complete', type: 'choice', prompt: 'Sasha asks Leo: “What ___ you doing?” Leo: “I am drawing a poster.”', options: ['is', 'do', 'are'], answer: 2, hint: 'You ile -ing’in yardımcısı.', explain: '**You** ile **are**: What are you doing?', objectiveId: 'u1l5-vocab', vocabId: 'v-draw' },
          order: { id: 'hw-10-order', type: 'order', prompt: 'Dora asks Momo and Piko. Make her question.', tokens: ['are', 'What', 'doing?', 'you'], answer: ['What', 'are', 'you', 'doing?'], hint: 'What → are → you → doing?', explain: 'What are you doing?', objectiveId: 'u1l5-vocab' },
          meaning: { id: 'hw-10-meaning', type: 'choice', prompt: 'Dora asks Sasha: “What is she doing?” What does it mean?', options: ['O nerede?', 'O ne yapıyor?', 'O kim?'], answer: 1, hint: 'What … doing? = ne yapıyor?', explain: 'What is she doing? = O ne yapıyor?', objectiveId: 'u1l5-vocab', vocabId: 'v-busy' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-piko-box', type: 'choice', prompt: 'Piko is in the corridor. He ___ the boxes right now.', options: ['is carrying', 'carries', 'are carrying'], answer: 0, objectiveId: 'u1l5-ing', vocabId: 'v-carry' },
        { id: 'as-we-wait', type: 'choice', prompt: 'The bell rings in a minute. We ___ for it.', options: ['is waiting', 'are waiting', 'am waiting'], answer: 1, objectiveId: 'u1l5-ing', vocabId: 'v-wait' },
        { id: 'as-write-text', type: 'text', prompt: 'Ms Pearl is ___ a word on the board. (write) Type the word.', accept: ['writing'], objectiveId: 'u1l5-spell', vocabId: 'v-write' },
        { id: 'as-sit-choice', type: 'choice', prompt: 'Dora looks at Momo and Leo. They are ___ at the same desk.', options: ['siting', 'sitting', 'sittting'], answer: 1, objectiveId: 'u1l5-spell', vocabId: 'v-sit' },
        { id: 'as-neg-leo', type: 'choice', prompt: 'Leo is drawing, not writing. He ___ writing.', options: ['aren’t', 'am not', 'isn’t'], answer: 2, objectiveId: 'u1l5-neg-q' },
        { id: 'as-question', type: 'choice', prompt: 'Sasha asks Dora: “___ Ms Pearl explaining the rule?”', options: ['Are', 'Is', 'Does'], answer: 1, objectiveId: 'u1l5-neg-q', vocabId: 'v-explain' },
        { id: 'as-short', type: 'choice', prompt: 'Piko asks Momo: “Are you laughing?” Momo is not laughing. Her answer:', options: ['No, I’m not.', 'No, I don’t.', 'Yes, I’m not.'], answer: 0, objectiveId: 'u1l5-neg-q' },
        { id: 'as-order-check', type: 'order', prompt: 'Sasha speaks to the class. Make her sentence.', tokens: ['answers.', 'the', 'checking', 'am', 'I'], answer: ['I', 'am', 'checking', 'the', 'answers.'], objectiveId: 'u1l5-ing', vocabId: 'v-check' },
        { id: 'as-obj-me', type: 'choice', prompt: 'Momo can’t carry the papers. Dora says: “Please give ___ the papers. I am helping you.”', options: ['I', 'me', 'my'], answer: 1, objectiveId: 'u1l5-obj' },
        { id: 'as-obj-him', type: 'text', prompt: 'Piko is tired. Dora says: “I am helping ___.” (Type him, her or them.)', accept: ['him'], objectiveId: 'u1l5-obj', vocabId: 'v-help' },
        { id: 'as-meaning', type: 'choice', prompt: 'Momo says: “They aren’t listening to me.” What does she mean?', options: ['Onlar beni dinlemiyor.', 'Onlar beni dinliyor.', 'Onlar beni bekliyor.'], answer: 0, objectiveId: 'u1l5-obj', vocabId: 'v-listen' },
        { id: 'as-kutu', type: 'choice', prompt: 'Ms Pearl writes “talimat” on the board. What is it in English?', options: ['instruction', 'corridor', 'poster', 'answer'], answer: 0, objectiveId: 'u1l5-vocab', vocabId: 'v-instruction' },
      ],
      reading: {
        title: 'Our School Radio',
        paragraphs: [
          'It is 10 o’clock, and the school is very busy. Dora is standing in the corridor with her notebook. She is talking to the school radio. “Good morning! Right now, everyone is working,” she says.',
          'In the classroom, Ms Pearl is explaining a new rule, and the students are listening to her. Sasha is writing on the board. Leo is sitting at his desk and drawing a poster. Piko is carrying the boxes to the art room, but he isn’t running.',
          'Momo is not in the classroom. She is in the corridor, and she is tidying up the papers. Mr Aydın is helping her. “Thank you!” Momo says to him. Then the bell rings. Is the school quiet now? No, it isn’t. Everybody is clapping for the teachers!',
        ],
        questions: [
          { id: 'rd-tf-corridor', type: 'choice', prompt: 'Dora is talking in the corridor.', options: tf, answer: 0, objectiveId: 'u1l5-ing', vocabId: 'v-corridor' },
          { id: 'rd-tf-pearl', type: 'choice', prompt: 'Ms Pearl is explaining a new rule.', options: tf, answer: 0, objectiveId: 'u1l5-ing', vocabId: 'v-explain' },
          { id: 'rd-tf-sasha', type: 'choice', prompt: 'Sasha is drawing a poster.', options: tf, answer: 1, objectiveId: 'u1l5-ing', vocabId: 'v-draw' },
          { id: 'rd-tf-piko', type: 'choice', prompt: 'Piko is running to the art room.', options: tf, answer: 1, objectiveId: 'u1l5-neg-q', vocabId: 'v-run' },
          { id: 'rd-tf-aydin', type: 'choice', prompt: 'Mr Aydın is helping Momo.', options: tf, answer: 0, objectiveId: 'u1l5-obj', vocabId: 'v-help' },
          { id: 'rd-fill-sit', type: 'choice', prompt: 'Leo is ___ at his desk.', options: ['sitting', 'sits', 'sit', 'is sit'], answer: 0, objectiveId: 'u1l5-spell', vocabId: 'v-sit' },
          { id: 'rd-fill-obj', type: 'choice', prompt: 'Momo says to Mr Aydın: “Thank you!” She says it to ___.', options: ['her', 'them', 'him', 'us'], answer: 2, objectiveId: 'u1l5-obj' },
          { id: 'rd-fill-quiet', type: 'choice', prompt: 'The bell is ringing. The school ___ quiet.', options: ['are', 'am', 'isn’t', 'don’t'], answer: 2, objectiveId: 'u1l5-neg-q', vocabId: 'v-busy' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-clap', 'v-draw', 'v-carry', 'v-help', 'v-explain', 'v-check', 'v-wait', 'v-instruction',
              'v-write', 'v-right-now', 'v-corridor', 'v-busy', 'rv-does', 'rv-dont', 'rv-do-you', 'rv-never',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'honey-slime', escapee: 'dora' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-now', line: { speaker: 'dora', en: 'The school is busy right now!', tr: 'Okul şu anda çok hareketli!' }, emphasis: ['busy', 'right now'] },
              { id: 'vs-carry', line: { speaker: 'piko', en: 'I am carrying the boxes.', tr: 'Kutuları taşıyorum.' }, emphasis: ['carrying the boxes'] },
              { id: 'vs-write', line: { speaker: 'sasha', en: 'I am writing on the board.', tr: 'Tahtaya yazıyorum.' }, emphasis: ['writing on the board'] },
              { id: 'vs-draw', line: { speaker: 'leo', en: 'I am drawing a poster.', tr: 'Bir poster çiziyorum.' }, emphasis: ['drawing a poster'] },
              {
                id: 'vs-run',
                line: { speaker: 'momo', en: 'I am running in the corridor!', tr: 'Koridorda koşuyorum!' },
                emphasis: ['running'],
                joke: { tr: 'Koşan Momo’ya “n” harfi yetişemedi, o yüzden running iki tane n ister.' },
              },
              { id: 'vs-check', line: { speaker: 'sasha', en: 'We are checking the answers.', tr: 'Cevapları kontrol ediyoruz.' }, emphasis: ['checking the answers'] },
              { id: 'vs-wait', line: { speaker: 'dora', en: 'We are waiting for the bell.', tr: 'Zili bekliyoruz.' }, emphasis: ['waiting for the bell'] },
              { id: 'vs-help', line: { speaker: 'leo', en: 'The teacher is helping us.', tr: 'Öğretmen bize yardım ediyor.' }, emphasis: ['helping us'] },
            ],
            vocabRefs: [
              'v-clap', 'v-draw', 'v-carry', 'v-help', 'v-explain', 'v-check', 'v-share', 'v-wait', 'v-instruction',
              'v-write', 'v-run', 'v-sit', 'v-right-now', 'v-corridor', 'v-busy', 'v-listen', 'v-tidy', 'v-open',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-carry', 'v-explain', 'v-check', 'v-wait', 'v-instruction', 'v-corridor', 'v-help'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-radio', line: { speaker: 'dora', en: 'Hello, school radio! I am reporting right now!', tr: 'Merhaba okul radyosu! Şu anda canlı yayındayım!' } },
              { id: 'ps-box', line: { speaker: 'piko', en: 'Dora, wait for me! I am carrying the boxes.', tr: 'Dora, beni bekle! Kutuları taşıyorum.' }, gate: 'st-q-box' },
              { id: 'ps-class', line: { speaker: 'sasha', en: 'I am writing the rules on the board.', tr: 'Kuralları tahtaya yazıyorum.' }, emphasis: ['writing'], gate: 'st-q-leo' },
              { id: 'ps-help', line: { speaker: 'dora', en: 'The teacher is helping us. She is helping me, too!', tr: 'Öğretmen bize yardım ediyor. Bana da yardım ediyor!' }, emphasis: ['us', 'me'], gate: 'st-q-pron' },
              { id: 'ps-run', line: { speaker: 'momo', en: 'Oops! I am not walking. I am running!', tr: 'Hoppala! Yürümüyorum, koşuyorum!' }, gate: 'st-q-run' },
              { id: 'ps-end', line: { speaker: 'dora', en: 'That is all from school radio. This is right now at school!', tr: 'Okul radyosundan bu kadar. İşte okulda şu an!' } },
            ],
            choice: {
              prompt: 'What is Dora doing now?',
              options: [
                { text: 'She is picking up the papers with Momo.', feedback: 'Güzel seçim! Birlikte toplamak işi hızlandırır.' },
                { text: 'She is telling Momo: “Walk, please!”', feedback: 'Doğru kural! Momo sonra yavaş yürüyecek ve kâğıtları da toplayacak.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-ing',
                target: 'card-now',
                hint: { fine: '“Right now”, “look!” ve “at the moment” görürsen am / is / are + -ing düşün.', big: 'Şu anda oluyor mu? O zaman Piko is carrying, I am writing.' },
                joke: { tr: 'Zil çalarken herkes “-ing” der. Bu yüzden zile “ringing” derler.' },
                stepRef: 'ex-now',
              },
              {
                id: 'g-spell',
                target: 'card-spelling',
                hint: { fine: 'write → writing (e düşer). run → running, sit → sitting (son harf ikilenir).', big: 'Önce fiile bak: e ile mi bitiyor, kısa bir sesli + sessizle mi?' },
                stepRef: 'ex-spell',
              },
              {
                id: 'g-question',
                target: 'card-question',
                hint: { fine: 'Soruda yardımcı öne geçer: Are you waiting? Is she writing?', big: 'Kısa cevap: Yes, she is. / No, I’m not.' },
                stepRef: 'ex-question',
              },
              {
                id: 'g-obj',
                target: 'card-object',
                hint: { fine: 'Fiilden sonra: me, you, him, her, it, us, them.', big: 'The teacher is helping us. Bu “us” fiilden sonra geliyor.' },
                stepRef: 'ex-obj',
              },
            ],
            goNoGo: {
              rule: { tr: 'Şu anda oluyorsa (-ing) dokun. Her gün olan şeye dokunma!', tapIf: '-ing' },
              warmup: [
                { id: 'w-box', text: 'Piko is carrying boxes now.', tap: true, why: 'Now -> -ing' },
                { id: 'w-draw', text: 'Leo draws every day.', tap: false, why: 'Every day -> -s' },
                { id: 'w-write', text: 'Sasha is writing right now.', tap: true, why: 'Right now -> -ing' },
                { id: 'w-bell', text: 'The bell rings at 8:30.', tap: false, why: 'Her zaman -> -s' },
              ],
              round: [
                { id: 'r-clap', text: 'Everyone is clapping.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-study', text: 'I study after school.', tap: false, why: 'Alışkanlık -> present simple' },
                { id: 'r-wait', text: 'We are waiting for the bell.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-start', text: 'The lesson starts at nine.', tap: false, why: 'Program -> present simple' },
                { id: 'r-run', text: 'Momo is running!', tap: true, why: 'Look! -> -ing' },
                { id: 'r-lunch', text: 'Dora has lunch at noon.', tap: false, why: 'Her gün -> -s' },
                { id: 'r-help', text: 'The teacher is helping us.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-always', text: 'Piko always takes notes.', tap: false, why: 'Always -> present simple' },
                { id: 'r-share', text: 'They are sharing a book.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-sit', text: 'Leo is sitting at his desk.', tap: true, why: 'Şu an -> -ing' },
              ],
              onWrongTap: { anim: 'sneeze', line: 'Hapşu! Bu sefer zil başka bir şey söyledi.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'whiteboard', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'school-bell', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-3-complete', sceneObject: 'school-desk', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-complete', sceneObject: 'corridor-sign' },
              { ref: 'hw-6-order', sceneObject: 'radio-microphone', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-8-order' },
            ],
            hint: { fine: 'Şu an mı oluyor? O zaman am / is / are + -ing. Fiile bak: e düşer mi, son harf ikilenir mi?' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-piko-box', 'as-we-wait', 'as-write-text', 'as-sit-choice', 'as-neg-leo', 'as-question',
              'as-short', 'as-order-check', 'as-obj-me', 'as-obj-him', 'as-meaning', 'as-kutu',
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
            frame: 'Right now, my school robot is ___ in the ___.',
            chips: [
              { id: 'c-carrying', en: 'carrying boxes', tr: 'kutu taşıyor', kind: 'verb' },
              { id: 'c-drawing', en: 'drawing a poster', tr: 'poster çiziyor', kind: 'verb' },
              { id: 'c-writing', en: 'writing', tr: 'yazıyor', kind: 'verb' },
              { id: 'c-clapping', en: 'clapping', tr: 'alkışlıyor', kind: 'verb' },
              { id: 'c-waiting', en: 'waiting for the bell', tr: 'zili bekliyor', kind: 'verb' },
              { id: 'c-corridor', en: 'corridor', tr: 'koridor', kind: 'place' },
              { id: 'c-classroom', en: 'classroom', tr: 'sınıf', kind: 'place' },
              { id: 'c-art-room', en: 'art room', tr: 'resim odası', kind: 'place' },
            ],
            collection: { title: 'Okulda Şu An' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Present progressive (am / is / are + -ing; olumsuz, soru, kısa cevap), -ing yazımı (writing, running, sitting) ve object pronouns (me, you, him, her, it, us, them); okulda şu an olan işleri anlatma.',
    vocabulary: [
      'clap for someone', 'draw a poster', 'carry the boxes', 'help', 'explain the rule', 'check the answers', 'share a book', 'wait for the bell',
      'instruction', 'write on the board', 'run in the corridor', 'sit at the desk', 'right now', 'corridor', 'busy', 'listen to the teacher',
      'tidy up the art room', 'open the window',
    ],
    grammar: [
      'am / is / are + verb-ing (şu anda)',
      'I am not / He isn’t / They aren’t + verb-ing; Is she …ing? Yes, she is. / No, I’m not.',
      'Yazım: write → writing, run → running, sit → sitting',
      'Object pronouns: me, you, him, her, it, us, them',
    ],
    expectedDifficulties: [
      'Türkçede şimdiki zaman ek ile kurulduğu için “is” unutulur: “Piko carrying boxes.” yerine “Piko is carrying boxes.”',
      'Şu an ile her gün ayrımı: “Look! Momo runs.” gibi -ing yerine düz fiil kullanmak.',
      'Yazımda e düşmesi ve harf ikilemesi: “writeing”, “runing”, “siting”.',
      'Nesne zamirleri: “The teacher is helping we.” ya da “I am clapping for he.” Fiilden/edattan sonra me, him, us, them gerekir.',
      'Soru ve olumsuzda yardımcı fiili yanlış seçmek: “Do you waiting?” ya da “She doesn’t running.”',
      'Kısa cevabı eksik ya da yanlış kurmak: “Yes, I do.” ya da “Yes, I waiting.” demek. Doğru kısa cevap “Yes, I am.” (uzun hâli “Yes, I am waiting.” de doğrudur).',
    ],
    commonErrors: [
      { error: 'She writeing on the board.', correction: 'She is writing on the board. (is + e düşer)' },
      { error: 'Momo is runing.', correction: 'Momo is running. (run → n ikilenir)' },
      { error: 'The teacher is helping we.', correction: 'The teacher is helping us. (fiilden sonra us)' },
      { error: 'Do you waiting for the bell?', correction: 'Are you waiting for the bell? (-ing ile are / is / am)' },
      { error: 'He isn’t draws now.', correction: 'He isn’t drawing now. (isn’t + -ing)' },
      { error: 'Are you running? — Yes, I running.', correction: 'Yes, I am. (kısa cevapta yardımcı)' },
    ],
    questionsToAsk: [
      'What is Dora doing right now in the story?',
      'Look at the picture: What is the teacher doing? Who is she helping?',
      'Are you sitting or standing right now? (gerçek ya da hayali cevap verebilir)',
      'What is Ms Pearl doing? Is she helping us?',
      'Is Momo running? Is she walking? Why is it a problem?',
    ],
    speakingPrompts: [
      'Okul radyosu: “Hello, school radio! Right now, Leo is …”',
      'Koridor: “Momo is running. She isn’t walking.”',
      'Kısa cevap: “Are you writing? Yes, I am. / No, I’m not.”',
      'Nesne zamiri: “The teacher is helping us. I am clapping for him.”',
      'Resim anlatma: sınıf resmine bakıp en az üç cümle: “He is … She is … They are …”',
    ],
    rolePlay: {
      situation: 'Okul radyosu canlı yayını: Dora, koridordan ve sınıftan şu anda olanları anlatır; arkadaşları ne yaptıklarını söyler.',
      roles: ['Dora (radyo sunucusu)', 'Piko (kutu taşıyan)', 'Momo (koridorda koşan)', 'Mr Aydın (beden eğitimi öğretmeni)'],
      steps: [
        'Dora yayını açar: “Hello, school radio! I am reporting right now!”',
        'Dora Piko’ya sorar: “What are you doing?” Piko: “I am carrying the boxes.”',
        'Momo koridorda koşar. Mr Aydın: “Don’t run!” Dora: “Is she running? Yes, she is.”',
        'Dora yardım eder: “I am helping her.” Roller değişir; öğrenci radyo sunucusu olur ve en az dört -ing cümlesi söyler.',
      ],
    },
    listening: {
      script:
        'It is ten o’clock and the school is very busy. I am in the corridor. Piko is carrying three boxes to the art room. He is walking slowly. In the classroom, Ms Pearl is explaining a rule. The students are listening to her. Sasha is writing on the board, and Leo is drawing a poster. Momo is running in the corridor, but Mr Aydın says, stop! Now Dora is helping Momo with the papers. The bell is ringing. Everyone is clapping for the teachers.',
      questions: [
        'Where is the speaker? (In the corridor.)',
        'What is Piko carrying? (Three boxes.)',
        'Who is writing on the board? (Sasha.)',
        'Is Leo writing? (No, he isn’t. He is drawing a poster.)',
        'Who is helping Momo? (Dora is helping her.)',
      ],
    },
    reinforcement: [
      'Mimik oyunu: öğrenci bir eylemi sessizce yapar, öğretmen “Are you writing?” diye sorar; öğrenci “Yes, I am. / No, I’m not.” der.',
      '-ing yazım kartları: write, run, sit, share, help, draw. Öğrenci kartı çevirip yazımı söyler; kural: e düşer, kısa sesli + sessiz ikilenir.',
      'Zamir tablosu: I → me, he → him, she → her, we → us, they → them. Öğretmen cümle başlatır: “The teacher is helping …”; öğrenci tamamlar.',
    ],
    suggestedActivities: [
      'Sınıf radyosu: öğrenciler sırayla “Right now, … is …ing” diyerek sınıfta olanları duyurur.',
      'Resimde farklar: iki okul koridoru resmi; öğrenci ne yapıldığını -ing ile karşılaştırır.',
      'Zarf kartları: “right now”, “at the moment”, “look!” kartlarıyla -ing cümlesi kurma yarışı.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma sorusu: “What is the weather like right now? Is it sunny?” (tek cümleyle cevap yeter)',
        'Isınma sorusu: “Is your teacher talking now?” (hayali cevap verebilirsin)',
        'Karakter seç: “What is Dora doing right now?” (Dora is …ing)',
        'Mimik: öğretmen bir eylem yapar, öğrenci “You are …ing.” der.',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Eylem kartları (clap, draw, carry, help, explain, check, share, wait): öğrenci kartı görür, “I am …ing.” der.',
        '“What is he doing?” oyunu: öğretmen bir karakterin resmini gösterir; öğrenci cümle kurar.',
        'Yazım yarışı: write, run, sit, share kartları; öğrenci -ing biçimini yüksek sesle heceler.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen “Right now …” der, öğrenci “I am …ing” ile cümle kurar.',
        'Tur 2: olumsuz: “Momo isn’t walking. She is running.”',
        'Tur 3: soru-cevap: “Are you waiting? Yes, I am. / No, I’m not.”',
        'Tur 4: nesne zamirleri: “The teacher is helping us.” (me, him, her, them ile birer cümle)',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Okul radyosu rol oyunu: öğretmen Piko / Momo, öğrenci Dora; sonra roller değişir.',
        'Beklenen cümleler: “What are you doing? I am carrying the boxes.” “Is she running? Yes, she is.”',
        'Öğretmen notu: Hata olursa sonunda topluca düzelt; yayın akışını bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'It is ten o’clock and the school is very busy. I am in the corridor. Piko is carrying three boxes to the art room. He is walking slowly. In the classroom, Ms Pearl is explaining a rule. The students are listening to her. Sasha is writing on the board, and Leo is drawing a poster. Momo is running in the corridor, but Mr Aydın says, stop! Now Dora is helping Momo with the papers. The bell is ringing. Everyone is clapping for the teachers.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin.',
        'Sorular: What is Piko carrying? Who is writing? Is Leo writing? Who is helping Momo?',
        'Öğrenci metinden bir kişiyi seçip “She / He is …ing.” ile anlatır.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık hatasını (is atlamak, -ing yazımı, we yerine us) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: is / are seçimi, e düşmesi ve harf ikilenmesi, me / him / us / them.',
        'Yanlışta nazikçe “Yaklaştın!” de; sonra doğru cümleyi birlikte kur.',
      ],
    },
    freeSpeaking: {
      minutes: 8,
      activities: [
        'Konu 1: Sınıfta şu anda ne oluyor? “The teacher is … Students are …”',
        'Konu 2: Teneffüste bahçede kim ne yapıyor? “Dora is … Piko is …”',
        'Konu 3: Okul koridoru nasıl? “Is it busy? Is anyone running?”',
        'Konu 4: Arkadaşına nasıl yardım edersin? “I am helping him / her.”',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: Okulda şu anda olan bir sahneyi seç (koridor, sınıf ya da bahçe) ve “right now” ile en az beş cümle yaz ya da sesli kaydet: iki olumlu (-ing), bir olumsuz (isn’t / aren’t) ve bir cümlede me, him, her, us ya da them kullan.',
    },
  },
}
export default lesson
