/** Ünite 1.6 — Celebrations & Our School Post: millî günler, Ünite 1 karışık tekrar, okul gönderisi (school post), okul rutinleri posteri. Theme u4-school-bell, host sasha. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.6 — Celebrations & Our School Post',
  sourceNotes:
    'Kitap Ünite 1 (School Life) finali: millî günler (Republic Day, National Sovereignty and Children’s Day, Youth and Sports Day, Teachers’ Day), tören kelimeleri (ceremony, flag, national anthem, poem, costume, certificate, trophy, champion); Ünite 1 karışık tekrar (be, a/an/the, imperatives, there is/are, WH-, present simple + frequency, present progressive, object pronouns); yazma: school post; proje: okul rutinleri posteri; yansıtma ve değerlendirme.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Sasha and the Youth and Sports Day Ceremony',
      tagline: '19 Mayıs töreni başlıyor! Sasha ile kutla, okul gönderini yaz ve büyük anı kaçırma.',
      theme: 'School life',
      character: 'sasha',
      level: 'A1',
      estimatedMinutes: 55,
      objectives: [
        { id: 'u1l6-days', text: 'Millî günleri ve tarihlerini söyler: “Republic Day is on 29 October.”' },
        { id: 'u1l6-vocab', text: 'Tören kelimelerini (ceremony, flag, national anthem, poem, trophy, champion) kullanır.' },
        { id: 'u1l6-present', text: 'Alışkanlığı (present simple) ve şu anı (present progressive) ayırt eder; nesne zamirlerini kullanır.' },
        { id: 'u1l6-basics', text: 'Ünite 1’i tekrar eder: be, there is / are, WH- soruları ve emir cümleleri.' },
        { id: 'u1l6-post', text: 'Kısa bir okul gönderisi (school post) planlar ve yazar.' },
      ],
      grammar: [
        'Tarihler: on 29 October; Ünite 1 karışık tekrar',
        'Present simple (her yıl) ve present progressive (şu anda)',
        'There is / There are; WH- soruları; emirler (Raise…, Don’t run…)',
        'Object pronouns: for her, help us, proud of you',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-now', type: 'choice', prompt: 'Dora is on the radio: “Piko ___ the boxes right now.”', options: ['carries', 'is carrying', 'carry'], answer: 1, hint: '“Right now” şu anı gösterir.', explain: 'Şu an için **is + carrying**: Piko is carrying the boxes.', objectiveId: 'u1l6-present' },
        { id: 'rv-spell', type: 'text', prompt: 'Leo is ___ at his desk. (sit) Type the word.', accept: ['sitting'], hint: 'sit kısa bir kelime. Son harf ne olur?', explain: 'sit → t ikilenir: **sitting**.', objectiveId: 'u1l6-present' },
        { id: 'rv-obj', type: 'choice', prompt: 'Ms Pearl is helping Dora and me. She is helping ___.', options: ['us', 'them', 'we'], answer: 0, hint: 'Ms Pearl, konuşan kişiyi de içine alan “biz”den bahsediyor.', explain: 'Fiilden sonra “biz” **us** olur: She is helping us.', objectiveId: 'u1l6-present' },
        { id: 'rv-neg', type: 'choice', prompt: 'Momo is walking slowly. She ___ running.', options: ['aren’t', 'don’t', 'isn’t'], answer: 2, hint: 'Momo için she. -ing ile hangi olumsuz yardımcı?', explain: '**She** ile **isn’t**: She isn’t running.', objectiveId: 'u1l6-present' },
        { id: 'rv-q', type: 'choice', prompt: 'Piko asks Sasha: “___ you waiting for the bell?”', options: ['Are', 'Is', 'Do'], answer: 0, hint: 'You ile -ing’in yardımcısı.', explain: '**You** ile **Are**: Are you waiting for the bell?', objectiveId: 'u1l6-present' },
      ],
    },
    vocabulary: [
      { id: 'v-ceremony', en: 'ceremony', tr: 'tören', example: { en: 'The ceremony starts at ten.', tr: 'Tören saat onda başlıyor.' }, difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-celebrate', en: 'celebrate', tr: 'kutlamak', example: { en: 'We celebrate Republic Day every year.', tr: 'Cumhuriyet Bayramı’nı her yıl kutlarız.' }, difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-flag', en: 'raise the flag', tr: 'bayrağı göndere çekmek', example: { en: 'Two students are raising the flag.', tr: 'İki öğrenci bayrağı çekiyor.' }, context: 'Tören sırasında “bayrağı çekmek” için raise the flag dersin.', difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-anthem', en: 'sing the national anthem', tr: 'millî marşı (İstiklal Marşı’nı) okumak', example: { en: 'Everyone is singing the national anthem.', tr: 'Herkes millî marşı okuyor.' }, difficulty: 3, objectiveId: 'u1l6-vocab' },
      { id: 'v-poem', en: 'read a poem', tr: 'şiir okumak', example: { en: 'Leo is reading a poem on the stage.', tr: 'Leo sahnede şiir okuyor.' }, difficulty: 1, objectiveId: 'u1l6-vocab' },
      { id: 'v-costume', en: 'costume', tr: 'kostüm', example: { en: 'Momo is wearing a funny costume.', tr: 'Momo komik bir kostüm giyiyor.' }, difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-festival', en: 'festival', tr: 'şenlik, festival', example: { en: 'There is a spring festival at our school.', tr: 'Okulumuzda bir bahar şenliği var.' }, difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-certificate', en: 'certificate', tr: 'başarı belgesi', example: { en: 'Mrs Demir is giving you a certificate.', tr: 'Mrs Demir sana bir başarı belgesi veriyor.' }, difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-trophy', en: 'trophy', tr: 'kupa', example: { en: 'The trophy is on the table.', tr: 'Kupa masanın üstünde.' }, difficulty: 1, objectiveId: 'u1l6-vocab' },
      { id: 'v-champion', en: 'champion', tr: 'şampiyon', example: { en: 'You are our province tennis champion!', tr: 'Sen bizim il tenis şampiyonumuzsun! (Küçük Kız İl Birincisi)' }, context: 'Spor müsabakasında birinci olan kişi.', difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-republic', en: 'Republic Day (29 October)', tr: 'Cumhuriyet Bayramı (29 Ekim)', example: { en: 'Republic Day is on 29 October.', tr: 'Cumhuriyet Bayramı 29 Ekim’de.' }, context: 'Tarihle birlikte “on” kullanılır: on 29 October.', difficulty: 2, objectiveId: 'u1l6-days' },
      { id: 'v-children', en: 'National Sovereignty and Children’s Day (23 April)', tr: 'Ulusal Egemenlik ve Çocuk Bayramı (23 Nisan)', example: { en: 'Children’s Day is on 23 April.', tr: 'Çocuk Bayramı 23 Nisan’da.' }, difficulty: 3, objectiveId: 'u1l6-days' },
      { id: 'v-youth', en: 'Youth and Sports Day (19 May)', tr: 'Gençlik ve Spor Bayramı (19 Mayıs)', example: { en: 'Youth and Sports Day is on 19 May.', tr: 'Gençlik ve Spor Bayramı 19 Mayıs’ta.' }, difficulty: 3, objectiveId: 'u1l6-days' },
      { id: 'v-teachers', en: 'Teachers’ Day (24 November)', tr: 'Öğretmenler Günü (24 Kasım)', example: { en: 'We celebrate Teachers’ Day on 24 November.', tr: 'Öğretmenler Günü’nü 24 Kasım’da kutlarız.' }, difficulty: 2, objectiveId: 'u1l6-days' },
      { id: 'v-stage', en: 'stage', tr: 'sahne', example: { en: 'You are walking to the stage.', tr: 'Sahneye yürüyorsun.' }, difficulty: 1, objectiveId: 'u1l6-vocab' },
      { id: 'v-audience', en: 'audience', tr: 'izleyiciler, seyirci', example: { en: 'The audience is clapping.', tr: 'İzleyiciler alkışlıyor.' }, difficulty: 3, objectiveId: 'u1l6-vocab' },
      { id: 'v-proud', en: 'be proud of someone', tr: 'biriyle gurur duymak', example: { en: 'We are proud of you!', tr: 'Seninle gurur duyuyoruz!' }, context: 'proud of + nesne zamiri: proud of him, proud of you.', difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-post', en: 'school post', tr: 'okul gönderisi', example: { en: 'Sasha is writing a school post.', tr: 'Sasha bir okul gönderisi yazıyor.' }, context: 'Okulun sayfasına yazılan kısa haber ya da duyuru.', difficulty: 1, objectiveId: 'u1l6-post' },
      { id: 'v-first', en: 'first place', tr: 'birincilik', example: { en: 'Dora is happy because you are in first place.', tr: 'Dora mutlu çünkü sen birincisin.' }, difficulty: 2, objectiveId: 'u1l6-vocab' },
      { id: 'v-poster', en: 'school routines poster', tr: 'okul rutinleri posteri', example: { en: 'I am making a school routines poster.', tr: 'Bir okul rutinleri posteri hazırlıyorum.' }, difficulty: 2, objectiveId: 'u1l6-post' },
    ],
    story: {
      title: 'Sasha and the Youth and Sports Day Ceremony',
      character: 'sasha',
      setting: 'The school garden on 19 May: flags, a stage and the Youth and Sports Day ceremony',
      scenes: [
        {
          id: 'sc-morning',
          illustration: 'The school garden in May: red flags on poles, a wooden stage, chairs in rows; Sasha with a list, Momo in a costume.',
          lines: [
            { speaker: 'narrator', en: 'It is 19 May. Today is Youth and Sports Day.', tr: '19 Mayıs. Bugün Gençlik ve Spor Bayramı.' },
            { speaker: 'sasha', en: 'Look! There are flags everywhere. There is a big stage, too.', tr: 'Bak! Her yerde bayrak var. Büyük bir sahne de var.' },
            { speaker: 'piko', en: 'What time is the ceremony?', tr: 'Tören saat kaçta?' },
            { speaker: 'sasha', en: 'It starts at ten. Please sit in your lines.', tr: 'Ona başlıyor. Lütfen sıralarına otur.' },
            { speaker: 'momo', en: 'Look at my costume! Please don’t laugh.', tr: 'Kostümüme bak! Lütfen gülme.' },
          ],
        },
        {
          id: 'sc-ceremony',
          illustration: 'The whole school stands; two students raise a flag; Mrs Demir stands at the microphone; Leo holds a poem.',
          lines: [
            { speaker: 'narrator', en: 'The ceremony is starting. Everybody is standing.', tr: 'Tören başlıyor. Herkes ayakta.' },
            { speaker: 'narrator', en: 'Two students are raising the flag. Everyone is singing the national anthem.', tr: 'İki öğrenci bayrağı çekiyor. Herkes millî marşı okuyor.' },
            { speaker: 'leo', en: 'Now I am reading my poem. Please listen to me!', tr: 'Şimdi şiirimi okuyorum. Lütfen beni dinleyin!' },
            { speaker: 'dora', en: 'Leo is reading very well. Everyone is listening to him.', tr: 'Leo çok güzel okuyor. Herkes onu dinliyor.' },
            { speaker: 'narrator', en: 'Mr Aydın is standing near the stage. He is smiling at us.', tr: 'Mr Aydın sahnenin yanında duruyor. Bize gülümsüyor.' },
          ],
        },
        {
          id: 'sc-title',
          illustration: 'Mrs Demir at the microphone, a gold trophy and a certificate on a table; the whole school claps; Mr Aydın smiles and Dora cheers.',
          lines: [
            { speaker: 'narrator', en: 'Now Mrs Demir is speaking. The whole school is quiet.', tr: 'Şimdi Mrs Demir konuşuyor. Bütün okul sessiz.' },
            { speaker: 'narrator', en: 'Mrs Demir says: “Please come to the stage. We have a trophy and a certificate.”', tr: 'Mrs Demir diyor ki: “Lütfen sahneye gelin. Bir kupamız ve bir başarı belgemiz var.”' },
            { speaker: 'narrator', en: 'Mrs Demir says: “You are the province champion in the Junior Girls’ category of the 2026-2027 School Sports Local Tennis Competition!”', tr: 'Mrs Demir diyor ki: “2026-2027 Eğitim Öğretim Yılı Okul Sporları Mahalli Tenis Müsabakaları Küçük Kız İl Birincisi!”' },
            { speaker: 'narrator', en: 'Everyone is clapping. You are walking to the stage.', tr: 'Herkes alkışlıyor. Sen sahneye yürüyorsun.' },
            { speaker: 'dora', en: 'Mr Aydın is smiling, and I am cheering! That is our champion!', tr: 'Mr Aydın gülümsüyor, ben de tezahürat yapıyorum! İşte bizim şampiyonumuz!' },
            { speaker: 'narrator', en: 'Mrs Demir is giving you the trophy. You are proud and happy.', tr: 'Mrs Demir sana kupayı veriyor. Gururlu ve mutlusun.' },
          ],
          choice: {
            prompt: 'You are on the stage with the trophy. What do you do?',
            options: [
              { text: 'You say thank you to Mr Aydın and Dora.', feedback: 'Çok güzel! Antrenörüne ve arkadaşına teşekkür etmek bu anı daha da özel yapar.' },
              { text: 'You show the trophy to the audience and smile.', feedback: 'Harika! Herkes seninle gurur duyuyor, gülümse ve kupayı göster.' },
            ],
          },
        },
        {
          id: 'sc-post',
          illustration: 'After the ceremony: Sasha writes in a notebook on the garden steps; Momo, Piko, Leo and Dora gather around.',
          lines: [
            { speaker: 'sasha', en: 'Our school post needs this story. I am writing it right now.', tr: 'Okul gönderimize bu hikâye lazım. Şimdi onu yazıyorum.' },
            { speaker: 'piko', en: 'What is the title?', tr: 'Başlık ne?' },
            { speaker: 'sasha', en: 'Youth and Sports Day at Our School. First, what happens every year? Then, what is happening now?', tr: '“Okulumuzda Gençlik ve Spor Bayramı.” Önce, her yıl ne olur? Sonra, şu an ne oluyor?' },
            { speaker: 'momo', en: 'Please write: Momo is wearing a funny costume!', tr: 'Lütfen yaz: Momo komik bir kostüm giyiyor!' },
            { speaker: 'dora', en: 'And you? Are you writing a school post, too?', tr: 'Ya sen? Sen de bir okul gönderisi yazıyor musun?' },
            { speaker: 'narrator', en: 'The bell is ringing. It is a beautiful day to celebrate.', tr: 'Zil çalıyor. Kutlamak için güzel bir gün.' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-date', type: 'choice', prompt: 'Sasha says: “Today is Youth and Sports Day.” What is the date?', options: ['23 April', '19 May', '29 October'], answer: 1, hint: 'İlk sahnenin ilk satırına bak.', explain: 'Gençlik ve Spor Bayramı **19 May**’dır.', objectiveId: 'u1l6-days', vocabId: 'v-youth' },
        { id: 'st-q-order', type: 'order', prompt: 'Dora whispers about the principal. Put her words in order.', tokens: ['is', 'Mrs', 'Demir', 'speaking', 'now.'], answer: ['Mrs', 'Demir', 'is', 'speaking', 'now.'], hint: 'Kim → is → fiil-ing → ne zaman?', explain: 'Mrs Demir **is speaking** now.', objectiveId: 'u1l6-present', vocabId: 'v-ceremony' },
        { id: 'st-q-dora', type: 'choice', prompt: 'At the ceremony, Dora is sitting quietly and doesn’t say anything.', options: tf, answer: 1, hint: 'Üçüncü sahnede Dora’nın sözlerine bak.', explain: 'Dora sessiz değil, tezahürat yapıyor: “I am cheering!”', objectiveId: 'u1l6-present', vocabId: 'v-audience' },
        { id: 'st-q-clap', type: 'text', prompt: 'Everyone is ___ for you. (clap) Type the word.', accept: ['clapping'], hint: 'clap kısa bir kelime: son harf ne olur?', explain: 'clap → p ikilenir: **clapping**.', objectiveId: 'u1l6-present', vocabId: 'v-audience' },
        { id: 'st-q-title', type: 'choice', prompt: 'Mrs Demir calls you to the stage. What title does she announce?', options: ['Best poem reader', 'Class president', 'Province tennis champion'], answer: 2, hint: 'Üçüncü sahnede Mrs Demir kimi tebrik ediyor?', explain: 'Sen il tenis şampiyonusun: **the province champion** in the Junior Girls’ category.', objectiveId: 'u1l6-vocab', vocabId: 'v-champion' },
        { id: 'st-q-pron', type: 'choice', prompt: 'Sasha says: “The audience is proud of ___.” (She means you.)', options: ['I', 'your', 'you'], answer: 2, hint: 'Edattan sonra “sen” hangi biçimde kalır?', explain: '“Sen” fiil ve edattan sonra da **you** olarak kalır: proud of you.', objectiveId: 'u1l6-present', vocabId: 'v-proud' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-days',
          title: 'Millî günler ve tarihler',
          body: 'Tarihle birlikte **on** kullanırız: **on** 29 October. Dört büyük gün: Republic Day (29 October), National Sovereignty and Children’s Day (23 April), Youth and Sports Day (19 May), Teachers’ Day (24 November).',
          examples: [
            { en: 'Republic Day is on 29 October.', tr: 'Cumhuriyet Bayramı 29 Ekim’de.' },
            { en: 'Children’s Day is on 23 April.', tr: 'Çocuk Bayramı 23 Nisan’da.' },
            { en: 'When is Teachers’ Day? It is on 24 November.', tr: 'Öğretmenler Günü ne zaman? 24 Kasım’da.' },
          ],
          check: { id: 'ex-check-days', type: 'choice', prompt: 'Momo asks: “When is Youth and Sports Day?” Sasha: “It is ___ 19 May.”', options: ['in', 'at', 'on'], answer: 2, hint: 'Tarihin önüne hangi küçük kelime gelir?', explain: 'Tarihle **on** kullanılır: on 19 May.', objectiveId: 'u1l6-days', vocabId: 'v-youth' },
        },
        {
          id: 'ex-every',
          title: 'Her yıl olanlar: present simple',
          body: 'Her yıl tekrar eden şeyleri Ünite 1.4’teki gibi anlatırız. I / you / we / they ile düz fiil, he / she / it ile **-s**.',
          examples: [
            { en: 'We celebrate Republic Day every year.', tr: 'Cumhuriyet Bayramı’nı her yıl kutlarız.' },
            { en: 'The school raises the flag at ten.', tr: 'Okul saat onda bayrağı çeker.' },
            { en: 'Leo always reads a poem.', tr: 'Leo her zaman bir şiir okur.' },
          ],
          check: { id: 'ex-check-every', type: 'choice', prompt: 'Every year, Mrs Demir ___ a speech at the ceremony.', options: ['make', 'makes', 'is making'], answer: 1, hint: 'Her yıl olan bir şey. Mrs Demir için he/she/it.', explain: 'Her yıl tekrar ediyorsa **-s**: Mrs Demir makes a speech.', objectiveId: 'u1l6-present', vocabId: 'v-ceremony' },
        },
        {
          id: 'ex-now',
          title: 'Şu anda olanlar: -ing',
          body: 'Törende şu anda olanı anlatmak için **am / is / are + -ing**. “Look!” ve “right now” görünce -ing düşün.',
          examples: [
            { en: 'Everyone is clapping.', tr: 'Herkes alkışlıyor.' },
            { en: 'You are walking to the stage.', tr: 'Sahneye yürüyorsun.' },
            { en: 'Mr Aydın isn’t sitting. He is standing.', tr: 'Mr Aydın oturmuyor. Ayakta duruyor.' },
          ],
          check: { id: 'ex-check-now', type: 'choice', prompt: 'Dora: “Look! Mr Aydın ___ at us.”', options: ['smiles', 'smile', 'is smiling'], answer: 2, hint: '“Look!” dedi. Şu anda mı oluyor?', explain: '“Look!” şu anı gösterir: Mr Aydın **is smiling**.', objectiveId: 'u1l6-present', vocabId: 'v-ceremony' },
        },
        {
          id: 'ex-which',
          title: 'Hangisi? Her yıl mı, şu an mı?',
          body: 'Karar sorusu: **Şu anda mı oluyor?** Evet ise **-ing**. “Every year”, “always”, “every day” varsa düz fiil ya da **-s**.',
          examples: [
            { en: 'We celebrate Teachers’ Day every year.', tr: 'Öğretmenler Günü’nü her yıl kutlarız.' },
            { en: 'We are celebrating right now.', tr: 'Şu anda kutluyoruz.' },
            { en: 'The students always sing the anthem.', tr: 'Öğrenciler her zaman millî marşı okur.' },
          ],
          check: { id: 'ex-check-which', type: 'choice', prompt: 'Sasha: “Every Monday, we ___ the flag. And look! We ___ it now!”', options: ['raise / are raising', 'are raising / raise', 'raise / raise'], answer: 0, hint: '“Every Monday” alışkanlık, “look!” şu an.', explain: 'Alışkanlık için **raise**, şu an için **are raising**.', objectiveId: 'u1l6-present', vocabId: 'v-flag' },
        },
        {
          id: 'ex-there',
          title: 'Törende ne var? There is / There are',
          body: 'Tek bir şey için **There is**, birden fazla şey için **There are**. Soru: **Is there** a stage? Cevap: **Yes, there is.** / **No, there isn’t.**',
          examples: [
            { en: 'There is a big stage.', tr: 'Büyük bir sahne var.' },
            { en: 'There are red flags in the garden.', tr: 'Bahçede kırmızı bayraklar var.' },
            { en: 'Is there a trophy? Yes, there is.', tr: 'Kupa var mı? Evet, var.' },
          ],
          check: { id: 'ex-check-there', type: 'choice', prompt: 'Piko looks at the garden. “There ___ many chairs.”', options: ['is', 'are', 'am'], answer: 1, hint: 'Çok sayıda sandalye var.', explain: 'Çoğul için **There are**: There are many chairs.', objectiveId: 'u1l6-basics', vocabId: 'v-stage' },
        },
        {
          id: 'ex-wh',
          title: 'Soru kelimeleri: What, When, Where, Who',
          body: 'Bilgi almak için WH- sorularını kullan: **What time** is the ceremony? **Where** is the stage? **Who** is the champion? **When** is Republic Day?',
          examples: [
            { en: 'What time is the ceremony?', tr: 'Tören saat kaçta?' },
            { en: 'Where is the trophy?', tr: 'Kupa nerede?' },
            { en: 'Who is reading a poem?', tr: 'Kim şiir okuyor?' },
          ],
          check: { id: 'ex-check-wh', type: 'choice', prompt: 'Momo points at the stage. “___ is the trophy? — It is on the table.”', options: ['Who', 'Where', 'When'], answer: 1, hint: 'Cevap bir yer bildiriyor: on the table.', explain: 'Yer sorusu için **Where**: Where is the trophy?', objectiveId: 'u1l6-basics', vocabId: 'v-trophy' },
        },
        {
          id: 'ex-imp',
          title: 'Emirler ve nesne zamirleri',
          body: 'Tören kuralları emirle söylenir: **Raise** the flag. **Don’t** run. **Please** be quiet. Fiilden ya da edattan sonra **me, you, him, her, it, us, them** gelir.',
          examples: [
            { en: 'Please be quiet.', tr: 'Lütfen sessiz ol.' },
            { en: 'Don’t run on the stage.', tr: 'Sahnede koşma.' },
            { en: 'Clap for her. Help them.', tr: 'Onu alkışla. Onlara yardım et.' },
          ],
          check: { id: 'ex-check-imp', type: 'choice', prompt: 'Leo is reading his poem. Mr Aydın whispers: “Please listen to ___.”', options: ['he', 'him', 'his'], answer: 1, hint: 'Edattan sonra erkek için hangi biçim?', explain: 'Edattan sonra “o (erkek)” **him** olur: listen to him.', objectiveId: 'u1l6-basics', vocabId: 'v-poem' },
        },
        {
          id: 'ex-post',
          title: 'Okul gönderisi nasıl yazılır?',
          body: 'Üç parça yeter: **1)** Başlık ve gün (Youth and Sports Day is on 19 May). **2)** Her yıl ne olur? (present simple). **3)** Şu an ne oluyor? (-ing). En sonda bir duygu cümlesi yaz: **We are proud of …**.',
          examples: [
            { en: 'Youth and Sports Day is on 19 May.', tr: 'Gençlik ve Spor Bayramı 19 Mayıs’ta.' },
            { en: 'Every year, we raise the flag.', tr: 'Her yıl bayrağı çekeriz.' },
            { en: 'Right now, everyone is clapping.', tr: 'Şu anda herkes alkışlıyor.' },
          ],
          check: { id: 'ex-check-post', type: 'choice', prompt: 'Sasha writes the last sentence of the school post. Which one is best?', options: ['We are proud of our school.', 'Are we proud?', 'We proud school.'], answer: 0, hint: 'Duygu cümlesi: We are proud of …', explain: 'Gönderiyi **We are proud of …** gibi bir duygu cümlesiyle bitirirsin.', objectiveId: 'u1l6-post', vocabId: 'v-post' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u1l6-days',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Mrs Demir says: “Republic Day is ___ 29 October.”', options: ['in', 'on', 'at'], answer: 1, hint: 'Tarihin önüne hangi kelime gelir?', explain: 'Tarihle **on** kullanılır: on 29 October.', objectiveId: 'u1l6-days', vocabId: 'v-republic' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Sasha writes on the board. Build her sentence.', tokens: ['on', 'Republic Day', '29 October.', 'is'], answer: ['Republic Day', 'is', 'on', '29 October.'], hint: 'Hangi gün → is → on → tarih', explain: 'Republic Day is on 29 October.', objectiveId: 'u1l6-days' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Leo reads the board: “Youth and Sports Day is on 19 May.” What does it mean?', options: ['Gençlik ve Spor Bayramı 19 Mayıs’ta.', 'Çocuk Bayramı 23 Nisan’da.', 'Cumhuriyet Bayramı 29 Ekim’de.'], answer: 0, hint: 'Youth and Sports Day = Gençlik ve Spor Bayramı', explain: 'Youth and Sports Day = Gençlik ve Spor Bayramı, 19 Mayıs.', objectiveId: 'u1l6-days', vocabId: 'v-youth' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u1l6-days',
          complete: { id: 'hw-2-complete', type: 'choice', prompt: 'Piko asks Ms Pearl: “When is Teachers’ Day?” She answers: “It is on ___.”', options: ['23 April', '24 November', '19 May'], answer: 1, hint: 'Öğretmenler Günü sonbaharın sonunda.', explain: 'Öğretmenler Günü **24 November**’dır.', objectiveId: 'u1l6-days', vocabId: 'v-teachers' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Piko writes a card for Ms Pearl. Put his words in order.', tokens: ['is', '24 November.', 'Teachers’ Day', 'on'], answer: ['Teachers’ Day', 'is', 'on', '24 November.'], hint: 'Hangi gün → is → on → tarih', explain: 'Teachers’ Day is on 24 November.', objectiveId: 'u1l6-days' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Dora says: “Children’s Day is on 23 April.” What does she mean?', options: ['Cumhuriyet Bayramı 29 Ekim’de.', 'Çocuk Bayramı 23 Nisan’da.', 'Öğretmenler Günü 24 Kasım’da.'], answer: 1, hint: 'Children’s Day = Çocuk Bayramı', explain: 'Children’s Day = Çocuk Bayramı, 23 Nisan.', objectiveId: 'u1l6-days', vocabId: 'v-children' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u1l6-present',
          complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Sasha says: “We ___ Republic Day every year.”', options: ['celebrate', 'are celebrating', 'celebrates'], answer: 0, hint: '“Every year” alışkanlık gösterir. We ile hangi biçim?', explain: 'Her yıl ve **we** ile düz fiil: We celebrate Republic Day every year.', objectiveId: 'u1l6-present', vocabId: 'v-celebrate' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Sasha writes in her school post. Build her sentence.', tokens: ['year.', 'We', 'every', 'Republic Day', 'celebrate'], answer: ['We', 'celebrate', 'Republic Day', 'every', 'year.'], hint: 'Kim → fiil → ne → ne zaman', explain: 'We celebrate Republic Day every year.', objectiveId: 'u1l6-present' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Sasha writes: “We celebrate Republic Day every year.” What does it mean?', options: ['Cumhuriyet Bayramı’nı her yıl kutlarız.', 'Cumhuriyet Bayramı’nı şu an kutluyoruz.', 'Cumhuriyet Bayramı’nı kutlamadık.'], answer: 0, hint: 'every year = her yıl', explain: 'every year = her yıl; alışkanlık anlatılıyor.', objectiveId: 'u1l6-present', vocabId: 'v-celebrate' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u1l6-present',
          complete: { id: 'hw-4-complete', type: 'text', prompt: 'Look! The students are ___ the flag. (raise) Type the word.', accept: ['raising'], hint: 'raise e ile bitiyor. E’ye ne olur?', explain: 'raise → e düşer: **raising**.', objectiveId: 'u1l6-present', vocabId: 'v-flag' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Dora reports from the ceremony. Put her words in order.', tokens: ['raising', 'are', 'The students', 'the flag.'], answer: ['The students', 'are', 'raising', 'the flag.'], hint: 'Kim → are → raising → ne?', explain: 'The students are raising the flag.', objectiveId: 'u1l6-present' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Dora says: “The students are raising the flag.” What does it mean?', options: ['Öğrenciler bayrağı çekiyor.', 'Öğrenciler bayrağı çekecek.', 'Öğrenciler bayrağı çekti.'], answer: 0, hint: 'raise the flag = bayrağı çekmek; -ing = şu an', explain: 'Şu anda oluyor: Öğrenciler bayrağı çekiyor.', objectiveId: 'u1l6-present', vocabId: 'v-flag' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u1l6-basics',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Sasha counts the flags on the stage. “There ___ three flags.”', options: ['is', 'are', 'isn’t'], answer: 1, hint: 'Üç bayrak: tek mi, çok mu?', explain: 'Çoğul için **There are**: There are three flags.', objectiveId: 'u1l6-basics', vocabId: 'v-stage' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Sasha counts again. Put her words in order.', tokens: ['flags', 'are', 'There', 'three', 'on the stage.'], answer: ['There', 'are', 'three', 'flags', 'on the stage.'], hint: 'There are → sayı → isim → nerede', explain: 'There are three flags on the stage.', objectiveId: 'u1l6-basics' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Leo asks: “Is there a trophy on the table?” What does he mean?', options: ['Masanın üstünde kupa var mı?', 'Kupa nerede?', 'Kupa kimin?'], answer: 0, hint: 'Is there … ? = … var mı?', explain: 'Is there …? = … var mı?', objectiveId: 'u1l6-basics', vocabId: 'v-trophy' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u1l6-basics',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Piko asks Sasha: “___ is the ceremony?” Sasha: “At ten.”', options: ['Where', 'What time', 'Who'], answer: 1, hint: 'Cevap bir saat: At ten.', explain: 'Saat sorusu: **What time** is the ceremony?', objectiveId: 'u1l6-basics', vocabId: 'v-ceremony' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Momo asks Mr Aydın. Make her question.', tokens: ['ceremony?', 'is', 'What time', 'the'], answer: ['What time', 'is', 'the', 'ceremony?'], hint: 'Soru kelimesi → is → the → ne?', explain: 'What time is the ceremony?', objectiveId: 'u1l6-basics' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Dora asks: “Who is reading a poem?” What does she mean?', options: ['Şiir nerede?', 'Kim şiir okuyor?', 'Şiir ne zaman?'], answer: 1, hint: 'Who = kim', explain: 'Who = kim. Kim şiir okuyor?', objectiveId: 'u1l6-basics', vocabId: 'v-poem' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u1l6-basics',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Mr Aydın sees Momo near the stage. He says: “___ run on the stage!”', options: ['Don’t', 'Please', 'Are'], answer: 0, hint: 'Sahnede koşmak yasak.', explain: 'Yasak için **Don’t**: Don’t run on the stage.', objectiveId: 'u1l6-basics', vocabId: 'v-stage' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Mr Aydın speaks to Momo. Put his words in order.', tokens: ['on', 'Don’t', 'the stage.', 'run'], answer: ['Don’t', 'run', 'on', 'the stage.'], hint: 'Emir: Don’t + fiil', explain: 'Don’t run on the stage.', objectiveId: 'u1l6-basics' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Mrs Demir says: “Please be quiet.” What does she mean?', options: ['Lütfen sessiz ol.', 'Lütfen gel.', 'Lütfen otur.'], answer: 0, hint: 'quiet = sessiz', explain: 'Please be quiet = Lütfen sessiz ol.', objectiveId: 'u1l6-basics' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u1l6-present',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Leo is reading a poem. Everyone is clapping for ___.', options: ['he', 'his', 'him'], answer: 2, hint: 'Edattan sonra erkek için hangi biçim?', explain: 'Edattan sonra “o (erkek)” **him**: clapping for him.', objectiveId: 'u1l6-present', vocabId: 'v-poem' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Dora says about the champion. Build her sentence.', tokens: ['clapping', 'her.', 'are', 'for', 'We'], answer: ['We', 'are', 'clapping', 'for', 'her.'], hint: 'We are clapping + for + o (kız)', explain: 'We are clapping for her.', objectiveId: 'u1l6-present' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Sasha says: “Mrs Demir is giving them certificates.” What does it mean?', options: ['Bize başarı belgesi veriyor.', 'Onlara başarı belgesi veriyor.', 'Bana başarı belgesi veriyor.'], answer: 1, hint: 'them = onlar(a)', explain: 'them = onlara. Onlara başarı belgesi veriyor.', objectiveId: 'u1l6-present', vocabId: 'v-certificate' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u1l6-post',
          complete: { id: 'hw-9-complete', type: 'text', prompt: 'Sasha writes about the ceremony. It is a school ___. Type the missing word.', accept: ['post'], hint: 'Okulun sayfasına yazılan gönderi.', explain: 'school **post** = okul gönderisi.', objectiveId: 'u1l6-post', vocabId: 'v-post' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Piko reads over her shoulder. Put his words in order.', tokens: ['a school post.', 'writing', 'is', 'Sasha'], answer: ['Sasha', 'is', 'writing', 'a school post.'], hint: 'Kim → is → writing → ne?', explain: 'Sasha is writing a school post.', objectiveId: 'u1l6-post' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Momo reads the post: “We are proud of our school.” What does it mean?', options: ['Okulumuzla gurur duyuyoruz.', 'Okulumuzu seviyoruz.', 'Okulumuz çok büyük.'], answer: 0, hint: 'proud of = gurur duymak', explain: 'We are proud of … = … ile gurur duyuyoruz.', objectiveId: 'u1l6-post', vocabId: 'v-proud' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-date-republic', type: 'choice', prompt: 'Ms Pearl writes “29 October” on the board. Which day is it?', options: ['Republic Day', 'Teachers’ Day', 'Youth and Sports Day'], answer: 0, objectiveId: 'u1l6-days', vocabId: 'v-republic' },
        { id: 'as-date-children', type: 'choice', prompt: 'Dora asks: “When is National Sovereignty and Children’s Day?”', options: ['19 May', '24 November', '23 April'], answer: 2, objectiveId: 'u1l6-days', vocabId: 'v-children' },
        { id: 'as-anthem', type: 'text', prompt: 'At the ceremony, the students sing the national ___. Type the missing word.', accept: ['anthem'], objectiveId: 'u1l6-vocab', vocabId: 'v-anthem' },
        { id: 'as-every', type: 'choice', prompt: 'Sasha says: “Every year, our school ___ Youth and Sports Day.”', options: ['is celebrating', 'celebrates', 'celebrating'], answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-celebrate' },
        { id: 'as-now', type: 'choice', prompt: 'Momo shouts: “Listen! Leo ___ his poem right now!”', options: ['reads', 'is reading', 'read'], answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-poem' },
        { id: 'as-there', type: 'choice', prompt: 'Piko asks: “Is there a stage in the garden?” Sasha answers: “Yes, ___.”', options: ['it is', 'there are', 'there is'], answer: 2, objectiveId: 'u1l6-basics', vocabId: 'v-stage' },
        { id: 'as-order-where', type: 'order', prompt: 'Leo asks Dora a question about the stage. Make it.', tokens: ['is', 'the', 'Where', 'stage?'], answer: ['Where', 'is', 'the', 'stage?'], objectiveId: 'u1l6-basics', vocabId: 'v-stage' },
        { id: 'as-imperative', type: 'choice', prompt: 'Mrs Demir says: “___ quiet, please. The poem is starting.”', options: ['Is', 'Be', 'Are'], answer: 1, objectiveId: 'u1l6-basics' },
        { id: 'as-obj', type: 'choice', prompt: 'Everybody is clapping for you on the stage. They are proud of ___.', options: ['your', 'you', 'yours'], answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-proud' },
        { id: 'as-order-clap', type: 'order', prompt: 'Dora cheers. Put her words in order.', tokens: ['clapping', 'is', 'Everyone', 'for', 'the champion.'], answer: ['Everyone', 'is', 'clapping', 'for', 'the champion.'], objectiveId: 'u1l6-present', vocabId: 'v-champion' },
        { id: 'as-meaning', type: 'choice', prompt: 'Momo asks: “Are you writing a school post?” What does she mean?', options: ['Okul gönderisi yazıyor musun?', 'Okul gönderisi okuyor musun?', 'Okul gönderisini beğendin mi?'], answer: 0, objectiveId: 'u1l6-post', vocabId: 'v-post' },
        { id: 'as-champion', type: 'choice', prompt: 'Sasha writes “şampiyon” on the board. What is it in English?', options: ['certificate', 'festival', 'costume', 'champion'], answer: 3, objectiveId: 'u1l6-vocab', vocabId: 'v-champion' },
      ],
      reading: {
        title: 'Our School Post: Youth and Sports Day',
        paragraphs: [
          'Youth and Sports Day is on 19 May. Every year, our school celebrates it in the garden. There are red flags on the stage, and many students wear costumes. First, we raise the flag and sing the national anthem.',
          'This year, the ceremony is very special. Leo is reading a poem now, and everybody is listening to him. Mr Aydın is standing near the stage, and Dora is waiting for the next part. What is Mrs Demir doing? She is calling a student to the stage!',
          'Our class has a champion! She is the province champion in the Junior Girls’ category of the School Sports Local Tennis Competition. Everyone is clapping, and she is walking to the stage. Mrs Demir is giving her the trophy and a certificate. We are proud of her!',
        ],
        questions: [
          { id: 'rd-tf-date', type: 'choice', prompt: 'Youth and Sports Day is on 23 April.', options: tf, answer: 1, objectiveId: 'u1l6-days', vocabId: 'v-youth' },
          { id: 'rd-tf-flags', type: 'choice', prompt: 'There are red flags on the stage.', options: tf, answer: 0, objectiveId: 'u1l6-basics', vocabId: 'v-stage' },
          { id: 'rd-tf-leo', type: 'choice', prompt: 'Leo is singing the national anthem now.', options: tf, answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-anthem' },
          { id: 'rd-tf-demir', type: 'choice', prompt: 'Mrs Demir is calling a student to the stage.', options: tf, answer: 0, objectiveId: 'u1l6-present', vocabId: 'v-stage' },
          { id: 'rd-tf-trophy', type: 'choice', prompt: 'Mr Aydın is giving the trophy to the champion.', options: tf, answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-trophy' },
          { id: 'rd-fill-every', type: 'choice', prompt: 'Every year, our school ___ Youth and Sports Day.', options: ['celebrate', 'celebrates', 'is celebrating', 'celebrating'], answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-celebrate' },
          { id: 'rd-fill-walk', type: 'choice', prompt: 'Everyone is clapping, and she is ___ to the stage.', options: ['walks', 'walking', 'walkking', 'walk'], answer: 1, objectiveId: 'u1l6-present', vocabId: 'v-stage' },
          { id: 'rd-fill-her', type: 'choice', prompt: 'The champion is in our class. We are proud of ___.', options: ['she', 'hers', 'him', 'her'], answer: 3, objectiveId: 'u1l6-present', vocabId: 'v-proud' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-ceremony', 'v-celebrate', 'v-flag', 'v-poem', 'v-costume', 'v-trophy', 'v-stage', 'v-post',
              'rv-now', 'rv-spell', 'rv-obj', 'rv-neg', 'rv-q',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'caramel-river', escapee: 'sasha' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-days', line: { speaker: 'sasha', en: 'Youth and Sports Day is on 19 May.', tr: 'Gençlik ve Spor Bayramı 19 Mayıs’ta.' }, emphasis: ['Youth and Sports Day'] },
              { id: 'vs-ceremony', line: { speaker: 'piko', en: 'The ceremony starts at ten.', tr: 'Tören saat onda başlıyor.' }, emphasis: ['ceremony'] },
              { id: 'vs-flag', line: { speaker: 'leo', en: 'Two students are raising the flag.', tr: 'İki öğrenci bayrağı çekiyor.' }, emphasis: ['raising the flag'] },
              { id: 'vs-poem', line: { speaker: 'leo', en: 'Now I am reading my poem.', tr: 'Şimdi şiirimi okuyorum.' }, emphasis: ['poem'] },
              {
                id: 'vs-costume',
                line: { speaker: 'momo', en: 'My costume is very funny.', tr: 'Kostümüm çok komik.' },
                emphasis: ['costume'],
                joke: { tr: 'Momo kostümle sahneye çıkınca seyirci “Bu kimin kostümü?” dedi. Momo: “Benimki, içinde de ben varım!”' },
              },
              { id: 'vs-certificate', line: { speaker: 'sasha', en: 'The certificate and the trophy are here.', tr: 'Başarı belgesi ve kupa burada.' }, emphasis: ['certificate', 'trophy'] },
              { id: 'vs-champion', line: { speaker: 'dora', en: 'You are our province tennis champion!', tr: 'Sen bizim il tenis şampiyonumuzsun! (Küçük Kız İl Birincisi)' }, emphasis: ['champion'] },
              { id: 'vs-proud', line: { speaker: 'dora', en: 'We are proud of you!', tr: 'Seninle gurur duyuyoruz!' }, emphasis: ['proud of'] },
            ],
            vocabRefs: [
              'v-ceremony', 'v-celebrate', 'v-flag', 'v-anthem', 'v-poem', 'v-costume', 'v-festival', 'v-certificate', 'v-trophy', 'v-champion',
              'v-republic', 'v-children', 'v-youth', 'v-teachers', 'v-stage', 'v-audience', 'v-proud', 'v-post', 'v-first', 'v-poster',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-ceremony', 'v-flag', 'v-poem', 'v-certificate', 'v-trophy', 'v-champion', 'v-stage', 'v-proud'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-morning', line: { speaker: 'narrator', en: 'It is 19 May. Today is Youth and Sports Day.', tr: '19 Mayıs. Bugün Gençlik ve Spor Bayramı.' }, gate: 'st-q-date' },
              { id: 'ps-anthem', line: { speaker: 'narrator', en: 'Everyone is singing the national anthem.', tr: 'Herkes millî marşı okuyor.' }, emphasis: ['singing'] },
              { id: 'ps-call', line: { speaker: 'narrator', en: 'Mrs Demir says: “Please come to the stage.”', tr: 'Mrs Demir diyor ki: “Lütfen sahneye gelin.”' } },
              {
                id: 'ps-title',
                line: { speaker: 'narrator', en: 'Mrs Demir says: “You are the province tennis champion!”', tr: '“2026-2027 Eğitim Öğretim Yılı Okul Sporları Mahalli Tenis Müsabakaları Küçük Kız İl Birincisi!”' },
                emphasis: ['province tennis champion'],
                gate: 'st-q-title',
              },
              { id: 'ps-clap', line: { speaker: 'narrator', en: 'Everyone is clapping. You are walking to the stage.', tr: 'Herkes alkışlıyor. Sen sahneye yürüyorsun.' }, emphasis: ['clapping', 'walking'], gate: 'st-q-clap' },
              { id: 'ps-dora', line: { speaker: 'dora', en: 'Mr Aydın is smiling, and I am cheering!', tr: 'Mr Aydın gülümsüyor, ben de tezahürat yapıyorum!' }, gate: 'st-q-dora' },
            ],
            choice: {
              prompt: 'You are on the stage with the trophy. What do you do?',
              options: [
                { text: 'You say thank you to Mr Aydın and Dora.', feedback: 'Çok güzel! Antrenörüne ve arkadaşına teşekkür etmek bu anı daha da özel yapar.' },
                { text: 'You show the trophy to the audience and smile.', feedback: 'Harika! Herkes seninle gurur duyuyor, gülümse ve kupayı göster.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-every',
                target: 'card-every-year',
                hint: { fine: '“Every year”, “always”, “every Monday” görürsen alışkanlık: düz fiil ya da -s.', big: 'We celebrate Republic Day every year. Her yıl olan şey için -ing kullanma.' },
                stepRef: 'ex-every',
              },
              {
                id: 'g-now',
                target: 'card-right-now',
                hint: { fine: '“Look!”, “now” ya da “right now” görürsen am / is / are + -ing.', big: 'Everyone is clapping. Şu anda olan şey için -ing kullan.' },
                joke: { tr: 'Alkış “clapping” diye yazılır. P harfi de çok alkışlamış, o yüzden iki tane!' },
                stepRef: 'ex-now',
              },
              {
                id: 'g-which',
                target: 'card-which',
                hint: { fine: 'Kendine sor: şu anda mı oluyor?', big: 'Evet ise -ing, hayır ise present simple.' },
                stepRef: 'ex-which',
              },
              {
                id: 'g-post',
                target: 'card-school-post',
                hint: { fine: 'Okul gönderisi: başlık ve gün, her yıl ne olur, şu an ne oluyor, bir duygu cümlesi.', big: 'Son cümle: We are proud of …' },
                stepRef: 'ex-post',
              },
            ],
            goNoGo: {
              rule: { tr: 'Şu anda oluyorsa (-ing) dokun. Her yıl olan şeye dokunma!', tapIf: '-ing' },
              warmup: [
                { id: 'w-clap', text: 'Everyone is clapping.', tap: true, why: 'Şu an -> -ing' },
                { id: 'w-year', text: 'We celebrate it every year.', tap: false, why: 'Every year -> present simple' },
                { id: 'w-poem', text: 'Leo is reading a poem.', tap: true, why: 'Şu an -> -ing' },
                { id: 'w-bell', text: 'The ceremony starts at ten.', tap: false, why: 'Program -> present simple' },
              ],
              round: [
                { id: 'r-flag', text: 'They are raising the flag.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-teachers', text: 'We celebrate Teachers’ Day.', tap: false, why: 'Alışkanlık -> present simple' },
                { id: 'r-walk', text: 'You are walking to the stage.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-always', text: 'Leo always reads a poem.', tap: false, why: 'Always -> present simple' },
                { id: 'r-smile', text: 'Mr Aydın is smiling.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-practise', text: 'You practise tennis after school.', tap: false, why: 'Rutin -> present simple' },
                { id: 'r-cheer', text: 'Dora is cheering.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-monday', text: 'We sing the anthem on Mondays.', tap: false, why: 'Her Pazartesi -> present simple' },
                { id: 'r-give', text: 'Mrs Demir is giving you the trophy.', tap: true, why: 'Şu an -> -ing' },
                { id: 'r-sing', text: 'Everyone is singing.', tap: true, why: 'Şu an -> -ing' },
              ],
              onWrongTap: { anim: 'candy-pop', line: 'Pop! Bu sefer törende başka bir şey oluyor.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'school-flag', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-3-complete', sceneObject: 'school-bell', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'stage-curtain', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-complete', sceneObject: 'garden-chairs' },
              { ref: 'hw-8-order', sceneObject: 'trophy', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-9-order' },
            ],
            hint: { fine: 'Her yıl mı, şu an mı? Tarihte on, çoğulda There are, soruda doğru soru kelimesi.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-date-republic', 'as-date-children', 'as-anthem', 'as-every', 'as-now', 'as-there',
              'as-order-where', 'as-imperative', 'as-obj', 'as-order-clap', 'as-meaning', 'as-champion',
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
            frame: 'Every day we ___. Right now, we are ___ at school.',
            chips: [
              { id: 'c-line-up', en: 'line up', tr: 'sıraya girmek', kind: 'verb' },
              { id: 'c-take-notes', en: 'take notes', tr: 'not almak', kind: 'verb' },
              { id: 'c-have-break', en: 'have a break', tr: 'teneffüs yapmak', kind: 'verb' },
              { id: 'c-have-lunch', en: 'have lunch', tr: 'öğle yemeği yemek', kind: 'verb' },
              { id: 'c-clapping', en: 'clapping', tr: 'alkışlıyor', kind: 'verb' },
              { id: 'c-flag', en: 'the flag', tr: 'bayrak', kind: 'noun' },
              { id: 'c-trophy', en: 'the trophy', tr: 'kupa', kind: 'noun' },
              { id: 'c-garden', en: 'school garden', tr: 'okul bahçesi', kind: 'place' },
            ],
            collection: { title: 'Okul Rutinleri Posterim' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Millî günleri (Republic Day, National Sovereignty and Children’s Day, Youth and Sports Day, Teachers’ Day) ve tören kelimelerini öğrenme; Ünite 1 dil bilgisini karışık tekrar etme (be, there is / are, WH-, emirler, present simple + zarflar, present progressive, nesne zamirleri); kısa bir okul gönderisi (school post) yazma; okul rutinleri posteri.',
    vocabulary: [
      'ceremony', 'celebrate', 'raise the flag', 'sing the national anthem', 'read a poem', 'costume', 'festival', 'certificate',
      'trophy', 'champion', 'Republic Day (29 October)', 'National Sovereignty and Children’s Day (23 April)',
      'Youth and Sports Day (19 May)', 'Teachers’ Day (24 November)', 'stage', 'audience', 'be proud of someone', 'school post',
      'first place', 'school routines poster',
    ],
    grammar: [
      'Tarihler: on 29 October',
      'Present simple (her yıl, always, every day) ve present progressive (şu anda, look!)',
      'There is / There are; WH- soruları (What time, Where, Who, When)',
      'Emirler (Raise the flag. Don’t run. Please be quiet.) ve nesne zamirleri (for her, help us, proud of you)',
    ],
    expectedDifficulties: [
      'Tarihte “on” yerine “in” ya da “at” kullanmak: “in 29 October”.',
      'Alışkanlık ile şu an ayrımı: “We are celebrating Republic Day every year.” ya da “Look! Leo reads.”',
      'Millî gün adlarını İngilizcede uzun ve yabancı bulmak; “National Sovereignty and Children’s Day” kısaltılmış biçimi “Children’s Day” ile karıştırılabilir.',
      'Nesne zamirleri: “proud of she”, “clap for he”.',
      'There is / There are seçimi ve is yerine are, are yerine is.',
      'Yazma görevinde cümleleri Türkçe sırayla kurmak: “Every year the flag we raise.”',
    ],
    commonErrors: [
      { error: 'Republic Day is in 29 October.', correction: 'Republic Day is on 29 October. (tarihle on)' },
      { error: 'Everyone is clap for her.', correction: 'Everyone is clapping for her. (is + -ing)' },
      { error: 'We proud of she.', correction: 'We are proud of her. (are eksik, edattan sonra her)' },
      { error: 'There is three flags on the stage.', correction: 'There are three flags on the stage. (çoğul: There are)' },
      { error: 'Look! Leo reads a poem.', correction: 'Look! Leo is reading a poem. (“Look!” şu an)' },
      { error: 'Where time is the ceremony?', correction: 'What time is the ceremony? (saat için What time)' },
    ],
    questionsToAsk: [
      'When is Republic Day? When is Teachers’ Day?',
      'What do you do at a ceremony? (raise the flag, sing the national anthem, read a poem)',
      'What is happening on the stage right now in the story?',
      'Is there a trophy on the table? What is Mrs Demir giving the champion?',
      'What is in a school post? (başlık ve gün, her yıl ne olur, şu an ne oluyor, duygu cümlesi)',
    ],
    speakingPrompts: [
      'Millî gün: “Republic Day is on 29 October. We celebrate it every year.”',
      'Tören: “Look! Two students are raising the flag. Everyone is singing the anthem.”',
      'Mini haber: “Right now, Leo is reading a poem. We are listening to him.”',
      'Gurur cümlesi: “We are proud of our school.” / “We are proud of her.”',
      'Poster sunumu: “Every day I get up at seven. Right now, I am …”',
    ],
    rolePlay: {
      situation: 'Gençlik ve Spor Bayramı töreni: müdür sahneden bir ödül verir, haberci öğrenci canlı yayında anlatır, seyirciler alkışlar.',
      roles: ['Mrs Demir (müdür)', 'Sasha (okul gönderisi yazarı)', 'Dora (seyirci)', 'Şampiyon öğrenci (hayali)'],
      steps: [
        'Sasha açar: “It is 19 May. Today is Youth and Sports Day. What time is the ceremony?”',
        'Mrs Demir sahneye çağırır: “Please come to the stage. We have a trophy and a certificate.”',
        'Dora tezahürat yapar: “Everyone is clapping! I am cheering! We are proud of you!”',
        'Roller değişir; öğrenci Sasha olur ve ceremony hakkında en az dört cümlelik bir okul gönderisi okur.',
      ],
    },
    listening: {
      script:
        'Today is 19 May, Youth and Sports Day. Every year, our school celebrates it in the garden. There are many flags on the stage. The ceremony starts at ten. Now two students are raising the flag, and everyone is singing the national anthem. Leo is reading a poem. Mr Aydın is standing near the stage and he is smiling. Mrs Demir is giving a trophy and a certificate to the winner. Everyone is clapping for her. We are very proud of her.',
      questions: [
        'What day is it today? (Youth and Sports Day, 19 May.)',
        'What time does the ceremony start? (At ten.)',
        'What are the students doing now? (They are raising the flag and singing the anthem.)',
        'Who is reading a poem? (Leo.)',
        'What is Mrs Demir giving the winner? (A trophy and a certificate.)',
      ],
    },
    reinforcement: [
      'Tarih kartları: öğretmen “29 October” der, öğrenci “Republic Day is on 29 October.” der; sonra roller değişir.',
      'Şimdi mi, her yıl mı? Öğretmen bir cümle söyler (“We raise the flag every Monday.” / “We are raising the flag now.”), öğrenci doğru zaman kartını gösterir.',
      'Zamir tablosu: me, him, her, us, them. Öğretmen “We are proud of …” başlatır, öğrenci tamamlar.',
    ],
    suggestedActivities: [
      'Okul gönderisi atölyesi: önce dört kutucuk (başlık ve gün, her yıl, şu an, duygu); öğrenci her kutuya bir cümle yazar.',
      'Okul rutinleri posteri: öğrenci bir okul gününü çizer (get up, take notes, have a break, have lunch) ve “Every day … Right now …” cümleleriyle etiketler.',
      'Tören yayını: sınıf radyosu; öğrenci mikrofon gibi bir kalem tutup “Right now, …” cümleleriyle törenden canlı yayın yapar.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma sorusu: “What is your favourite national day? Why?” (tek cümleyle cevap yeter; hayali cevap verebilirsin)',
        'Isınma sorusu: “Is there a ceremony at your school on Mondays?” (Yes, there is. / No, there isn’t.)',
        'Karakter seç: “What is Sasha doing right now?” (Sasha is writing a school post.)',
        'Tarih oyunu: öğretmen “23 April” der, öğrenci hangi gün olduğunu söyler.',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları (ceremony, flag, poem, costume, trophy, certificate, champion, stage): öğrenci kartı görür, “It is a …” der.',
        'Millî günler: dört tarih kartı; öğrenci “Teachers’ Day is on 24 November.” gibi cümle kurar.',
        'Tören eşleştirme: raise the flag, sing the national anthem, read a poem; öğrenci doğru eylemi “We …” ile söyler.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: present simple: “Every year, we …” ile üç cümle.',
        'Tur 2: present progressive: törenin resmine bakıp “Look! … is …ing.” ile üç cümle.',
        'Tur 3: There is / There are ve WH-: “What time is the ceremony? Where is the stage?”',
        'Tur 4: emirler ve nesne zamirleri: “Please be quiet. Clap for her.”',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Tören rol oyunu: öğretmen Mrs Demir, öğrenci Sasha / Dora; sonra roller değişir.',
        'Beklenen cümleler: “Please come to the stage.” “Everyone is clapping.” “We are proud of you.”',
        'Öğretmen notu: Hata olursa sonunda topluca düzelt; rol oyunu akışını bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'Today is 19 May, Youth and Sports Day. Every year, our school celebrates it in the garden. There are many flags on the stage. The ceremony starts at ten. Now two students are raising the flag, and everyone is singing the national anthem. Leo is reading a poem. Mr Aydın is standing near the stage and he is smiling. Mrs Demir is giving a trophy and a certificate to the winner. Everyone is clapping for her. We are very proud of her.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin.',
        'Sorular: What day is it? What time does the ceremony start? Who is reading a poem? What is Mrs Demir giving the winner?',
        'Öğrenci metinden bir kişiyi seçip “She / He is …ing.” ile anlatır.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık hatasını (on / in, -ing ile is atlama, her yıl ile şu an karışması) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: tarihte on, alışkanlık ile şu an ayrımı, proud of + nesne zamiri.',
        'Yanlışta nazikçe “Yaklaştın!” de; sonra doğru cümleyi birlikte kur.',
      ],
    },
    freeSpeaking: {
      minutes: 8,
      activities: [
        'Konu 1: Okulunda bir millî gün nasıl kutlanır? “We raise the flag. We sing the anthem.”',
        'Konu 2: Şu anda bir törende ne oluyor? “Look! Everyone is …”',
        'Konu 3: Bir ödül töreninde ne hissedersin? “I am proud. I am happy.”',
        'Konu 4: Okul günün: “Every day I … Right now, I am …”',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: Kendi okul gönderini (school post) yaz: başlık ve gün (on …), her yıl ne olur (present simple), şu an ne oluyor (-ing) ve bir duygu cümlesi (We are proud of …); toplam 6-8 cümle. Sonra Okul Rutinleri Posteri’ni hazırla: “Every day …” ve “Right now …” cümleleriyle bir okul gününü anlat. Yazını ve posterini yansıtma sorusuyla bitir: “What is my favourite part of school?”',
    },
  },
}
export default lesson
