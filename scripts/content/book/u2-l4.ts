/** Ünite 2.4 — My Learning Diary: question tags (be + present simple), diary writing, learning places outside school, Unit 2 review. Theme u2-night-oven, host dora. Plan: docs/curriculum/kitap-mufredati.md */
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

/** Contractions: accept the straight and the curly apostrophe. */
const ap = (...xs: string[]): string[] => [...new Set(xs.flatMap((x) => [x, x.replace(/’/g, "'")]))]

const lesson: ContentLesson = {
  title: 'Ünite 2.4 — My Learning Diary',
  sourceNotes:
    'Kitap Ünite 2 (Classroom Life): question tags (be ve present simple ile; I am → aren’t I), yazma: diary (tarih, duygular, olanlar, planlar), kültür: okul dışındaki öğrenme yerleri (museum, science centre, public library, zoo, planetarium), Ünite 2 tekrarı. Tenis: maç günü günlüğü.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Dora and the Learning Diary',
      tagline: 'Dora maç gününü günlüğüne yazıyor! “You are tired, aren’t you?” gibi soru ekleriyle konuş, kendi günlüğünü yaz.',
      theme: 'Classroom life',
      character: 'dora',
      level: 'A2',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u2l4-tag-be', text: 'be ile soru eki kurar: “You are tired, aren’t you?” / “It isn’t late, is it?”' },
        { id: 'u2l4-tag-simple', text: 'Present simple ile soru eki kurar: “She likes English, doesn’t she?” / “They don’t study at night, do they?”' },
        { id: 'u2l4-iam', text: '“I am late, aren’t I?” kalıbını ve soru ekine kısa cevap vermeyi (Yes, I am. / No, I’m not.) bilir.' },
        { id: 'u2l4-diary', text: 'Günlük yazısının bölümlerini bilir: tarih, duygular, olanlar, planlar.' },
        { id: 'u2l4-places', text: 'Okul dışındaki öğrenme yerlerini söyler (museum, science centre, public library, zoo, planetarium).' },
        { id: 'u2l4-review', text: 'Ünite 2’yi tekrar eder: sayılar ve sıra sayıları, şimdiki zaman, iyelik sıfatları, zarflar.' },
      ],
      grammar: [
        'Question tags with be: You are tired, aren’t you? / It isn’t late, is it?',
        'Question tags with present simple: She likes English, doesn’t she? / They don’t study at night, do they?',
        'I am … , aren’t I?',
        'Diary: date, feelings, what happens, plans',
      ],
      themeId: 'u2-night-oven',
    },
    review: {
      questions: [
        { id: 'rv-num', type: 'choice', prompt: 'Dora reads the number on her museum ticket: 250. How do you say it?', options: ['two hundreds fifty', 'second hundred and fifty', 'two hundred and fifty'], answer: 2, hint: 'Hundred -s almaz; yüzlükten sonra and gelir.', explain: '250 = **two hundred and fifty**.', objectiveId: 'u2l4-review' },
        { id: 'rv-ord', type: 'text', prompt: 'Dora is first in the line, and Leo is 2nd. Type 2nd in words: “Leo is ___.”', accept: ['second'], hint: '2. için özel bir kelime var.', explain: '2nd = **second**.', objectiveId: 'u2l4-review' },
        { id: 'rv-date', type: 'choice', prompt: 'Teachers’ Day is on the 24th of November. Piko says: “It is the ___ of November.”', options: ['twenty-fourth', 'twenty-four', 'fourth twenty'], answer: 0, hint: 'Tarihte sıra sayısı kullanılır.', explain: 'Tarih için sıra sayısı: the **twenty-fourth**.', objectiveId: 'u2l4-review' },
        { id: 'rv-rank', type: 'choice', prompt: 'Mr Aydın points at the ranking table. Dora has the second-best score. She is in ___ place.', options: ['two', 'second', 'twice'], answer: 1, hint: 'Sıralamada sıra sayısı gelir.', explain: 'Sıralamada **second place** deriz.', objectiveId: 'u2l4-review' },
      ],
    },
    vocabulary: [
      { id: 'v-diary', en: 'diary', tr: 'günlük', example: { en: 'Dora writes in her diary every night.', tr: 'Dora her gece günlüğüne yazıyor.' }, difficulty: 1, objectiveId: 'u2l4-diary' },
      { id: 'v-diary-entry', en: 'diary entry', tr: 'günlük yazısı', example: { en: 'Today I write a diary entry about my day.', tr: 'Bugün günümle ilgili bir günlük yazısı yazıyorum.' }, context: 'Günlükteki tek bir günün yazısı.', difficulty: 2, objectiveId: 'u2l4-diary' },
      { id: 'v-dear-diary', en: 'Dear Diary', tr: 'Sevgili Günlük', example: { en: 'Dear Diary, today is a big day.', tr: 'Sevgili Günlük, bugün büyük bir gün.' }, context: 'Günlük yazısı genelde böyle başlar.', difficulty: 1, objectiveId: 'u2l4-diary' },
      { id: 'v-feelings', en: 'feelings', tr: 'duygular', example: { en: 'I write about my feelings in my diary.', tr: 'Günlüğüme duygularımı yazıyorum.' }, difficulty: 2, objectiveId: 'u2l4-diary' },
      { id: 'v-plan', en: 'plan', tr: 'plan', example: { en: 'My plan for Sunday is the science centre.', tr: 'Pazar planım bilim merkezi.' }, difficulty: 1, objectiveId: 'u2l4-diary' },
      { id: 'v-tired', en: 'tired', tr: 'yorgun', example: { en: 'You are tired after the match, aren’t you?', tr: 'Maçtan sonra yorgunsun, değil mi?' }, difficulty: 1, objectiveId: 'u2l4-diary' },
      { id: 'v-nervous', en: 'nervous', tr: 'gergin, heyecanlı (endişeli)', example: { en: 'Leo is nervous before the quiz.', tr: 'Leo sınavdan önce gergin.' }, difficulty: 2, objectiveId: 'u2l4-diary' },
      { id: 'v-excited', en: 'excited', tr: 'heyecanlı (neşeli)', example: { en: 'We are excited about the trip.', tr: 'Gezi için heyecanlıyız.' }, difficulty: 2, objectiveId: 'u2l4-diary' },
      { id: 'v-proud', en: 'proud', tr: 'gururlu', example: { en: 'Dora is proud of her friend.', tr: 'Dora arkadaşıyla gurur duyuyor.' }, context: '“proud of …” kalıbıyla kullanılır.', difficulty: 2, objectiveId: 'u2l4-diary' },
      { id: 'v-museum', en: 'museum', tr: 'müze', example: { en: 'The museum has a new exhibition.', tr: 'Müzede yeni bir sergi var.' }, difficulty: 1, objectiveId: 'u2l4-places' },
      { id: 'v-science-centre', en: 'science centre', tr: 'bilim merkezi', example: { en: 'The science centre is great, isn’t it?', tr: 'Bilim merkezi harika, değil mi?' }, context: 'İngiliz yazımı: centre (center değil).', difficulty: 2, objectiveId: 'u2l4-places' },
      { id: 'v-public-library', en: 'public library', tr: 'halk kütüphanesi', example: { en: 'The public library is open to everyone.', tr: 'Halk kütüphanesi herkese açık.' }, difficulty: 2, objectiveId: 'u2l4-places' },
      { id: 'v-zoo', en: 'zoo', tr: 'hayvanat bahçesi', example: { en: 'At the zoo, a guide shows us the animals.', tr: 'Hayvanat bahçesinde bir rehber bize hayvanları gösteriyor.' }, difficulty: 1, objectiveId: 'u2l4-places' },
      { id: 'v-planetarium', en: 'planetarium', tr: 'planetaryum', example: { en: 'The planetarium has stars on the ceiling.', tr: 'Planetaryumda tavanda yıldızlar var.' }, difficulty: 3, objectiveId: 'u2l4-places' },
      { id: 'v-exhibition', en: 'exhibition', tr: 'sergi', example: { en: 'The exhibition has old maps and coins.', tr: 'Sergide eski haritalar ve paralar var.' }, difficulty: 3, objectiveId: 'u2l4-places' },
      { id: 'v-ticket', en: 'ticket', tr: 'bilet', example: { en: 'Dora has the tickets for the science centre.', tr: 'Dora’da bilim merkezi biletleri var.' }, difficulty: 1, objectiveId: 'u2l4-places' },
      { id: 'v-learn-new', en: 'learn something new', tr: 'yeni bir şey öğrenmek', example: { en: 'You learn something new at a museum.', tr: 'Müzede yeni bir şey öğrenirsin.' }, context: 'Okul dışında öğrenmenin en güzel yanı.', difficulty: 2, objectiveId: 'u2l4-places' },
      { id: 'v-closed', en: 'closed', tr: 'kapalı', example: { en: 'The planetarium is closed on Monday.', tr: 'Planetaryum Pazartesi günü kapalı.' }, difficulty: 1, objectiveId: 'u2l4-places' },
    ],
    story: {
      title: 'Dora’s Diary',
      character: 'dora',
      setting: 'The tennis court, the classroom, a trip talk and Dora’s room at night',
      scenes: [
        {
          id: 'sc-court',
          illustration: 'A sunny tennis court after a match: you and Dora sit on a bench, rackets beside you, Mr Aydın walking over.',
          lines: [
            { speaker: 'narrator', en: 'The tennis final is over. You sit on the bench with Dora.', tr: 'Tenis finali bitti. Dora ile bankta oturuyorsun.' },
            { speaker: 'dora', en: 'You are tired, aren’t you?', tr: 'Yorgunsun, değil mi?' },
            { speaker: 'narrator', en: 'You smile and say: “Yes, but I’m happy!”', tr: 'Gülümseyip şöyle diyorsun: “Evet, ama mutluyum!”' },
            { speaker: 'dora', en: 'A long match isn’t easy, is it?', tr: 'Uzun bir maç kolay değil, değil mi?' },
            { speaker: 'dora', en: 'I have an idea. Write about today in your diary!', tr: 'Bir fikrim var. Bugünü günlüğüne yaz!' },
          ],
        },
        {
          id: 'sc-class',
          illustration: 'The classroom on Monday: Ms Pearl at the whiteboard with a poster of a diary page; Momo with a doubtful face.',
          lines: [
            { speaker: 'narrator', en: 'It is Monday. Ms Pearl is at the whiteboard.', tr: 'Pazartesi. Ms Pearl tahtanın başında.' },
            { speaker: 'narrator', en: 'Ms Pearl says: “A diary entry has the date, feelings, news and plans.”', tr: 'Ms Pearl: “Günlük yazısında tarih, duygular, haberler ve planlar olur.”' },
            { speaker: 'momo', en: 'A diary is boring, isn’t it?', tr: 'Günlük sıkıcı, değil mi?' },
            { speaker: 'dora', en: 'No, it isn’t! Ms Pearl likes diaries, doesn’t she?', tr: 'Hayır, değil! Ms Pearl günlükleri sever, değil mi?' },
            { speaker: 'narrator', en: 'Ms Pearl smiles: “Yes, I do. I write every night.”', tr: 'Ms Pearl gülümsüyor: “Evet, severim. Her gece yazarım.”' },
          ],
        },
        {
          id: 'sc-trip',
          illustration: 'The school corridor with a poster of a science centre and a planetarium dome; Leo and Piko look at the opening times.',
          lines: [
            { speaker: 'narrator', en: 'Ms Pearl says: “Learning isn’t only at school. Visit a museum, a zoo or a planetarium.”', tr: 'Ms Pearl: “Öğrenme yalnız okulda olmaz. Müzeyi, hayvanat bahçesini ya da planetaryumu gez.”' },
            { speaker: 'piko', en: 'You love science, don’t you, Leo?', tr: 'Sen fen bilimini seversin, değil mi Leo?' },
            { speaker: 'leo', en: 'Yes, I do. The planetarium isn’t open on Monday, is it?', tr: 'Evet. Planetaryum Pazartesi açık değil, değil mi?' },
            { speaker: 'narrator', en: 'Ms Pearl says: “No, it isn’t. It is closed on Monday.”', tr: 'Ms Pearl: “Hayır, değil. Pazartesi kapalı.”' },
            { speaker: 'dora', en: 'On Sunday we visit the science centre. I have the tickets!', tr: 'Pazar günü bilim merkezine gidiyoruz. Biletler bende!' },
          ],
        },
        {
          id: 'sc-night',
          illustration: 'Dora’s room at night under a warm lamp: an open diary, a pen, a tennis ball on the desk, a phone with a message from Momo.',
          lines: [
            { speaker: 'narrator', en: 'It is night. Dora writes in her diary.', tr: 'Gece oldu. Dora günlüğüne yazıyor.' },
            { speaker: 'dora', en: 'Dear Diary, today is a big day. I am excited!', tr: 'Sevgili Günlük, bugün büyük bir gün. Heyecanlıyım!' },
            { speaker: 'dora', en: 'I am up late, aren’t I? It is late, isn’t it?', tr: 'Geç saate kadar uyanığım, değil mi? Saat geç, değil mi?' },
            { speaker: 'momo', en: 'You aren’t sleepy, are you?', tr: 'Uykun yok, değil mi?' },
            { speaker: 'dora', en: 'No, I’m not. I am proud of my friend!', tr: 'Hayır, yok. Arkadaşımla gurur duyuyorum!' },
          ],
          choice: {
            prompt: 'What does Dora write next in her diary?',
            options: [
              { text: 'My feelings: I am proud of my friend.', feedback: 'Güzel seçim! Duygular günlüğün kalbidir.' },
              { text: 'My plan: On Sunday I visit the science centre.', feedback: 'Güzel seçim! Plan günlüğün sonuna yakışır.' },
            ],
          },
        },
      ],
      questions: [
        { id: 'st-q-tag', type: 'choice', prompt: 'On the bench, Dora looks at you: “You are tired, ___ you?”', options: ['are', 'aren’t', 'don’t'], answer: 1, hint: 'Cümle olumlu: You are. Soru eki zıt olur.', explain: 'Olumlu cümle + olumsuz ek: You are tired, **aren’t** you?', objectiveId: 'u2l4-tag-be', vocabId: 'v-tired' },
        { id: 'st-q-answer', type: 'choice', prompt: 'You are tired, but you are happy. What do you say to Dora?', options: ['No, I don’t.', 'Yes, it is.', 'Yes, but I’m happy!'], answer: 2, hint: 'Önce soruya gerçeğe göre cevap ver, sonra duygunu ekle.', explain: 'Yorgunsan **Yes, I am**; sonra “but I’m happy!” ekleyebilirsin.', objectiveId: 'u2l4-iam', vocabId: 'v-tired' },
        { id: 'st-q-diary', type: 'choice', prompt: 'Ms Pearl says: “A diary entry has the date, feelings, news and ___.”', options: ['plans', 'tickets', 'floors'], answer: 0, hint: 'Pazar için ne yapacaksın? Günlüğün sonuna yazılan şey.', explain: 'Günlükte tarih, duygular, haberler ve **plans** (planlar) olur.', objectiveId: 'u2l4-diary', vocabId: 'v-plan' },
        { id: 'st-q-order', type: 'order', prompt: 'Dora asks about Ms Pearl. Put her words in order.', tokens: ['diaries,', 'likes', 'Ms', 'doesn’t', 'Pearl', 'she?'], answer: ['Ms', 'Pearl', 'likes', 'diaries,', 'doesn’t', 'she?'], hint: 'Önce cümle, virgül, sonra soru eki.', explain: 'Olumlu present simple + **doesn’t she?**', objectiveId: 'u2l4-tag-simple', vocabId: 'v-diary' },
        { id: 'st-q-planetarium', type: 'choice', prompt: 'Leo asks Ms Pearl: “The planetarium isn’t open on Monday, ___ it?”', options: ['is', 'isn’t', 'does'], answer: 0, hint: 'Cümle olumsuz: isn’t. Ek olumlu olur.', explain: 'Olumsuz cümle + olumlu ek: isn’t open, **is** it?', objectiveId: 'u2l4-tag-be', vocabId: 'v-planetarium' },
        { id: 'st-q-iam', type: 'text', prompt: 'Dora yawns in her room: “I am up late, ___ I?” Type the tag.', accept: ap('aren’t'), hint: 'I am için özel bir ek var; amn’t yok.', explain: '**I am … , aren’t I?** kalıbı.', objectiveId: 'u2l4-iam' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-idea',
          title: 'Soru eki: “değil mi?”',
          body: 'Bir şeyi bildiğini söyler, sonra teyit istersin: Türkçedeki **“…, değil mi?”**. İngilizcede cümlenin sonuna küçük bir soru gelir: **You are tired, aren’t you?**',
          examples: [
            { en: 'You are tired, aren’t you?', tr: 'Yorgunsun, değil mi?' },
            { en: 'It is late, isn’t it?', tr: 'Geç oldu, değil mi?' },
            { en: 'The museum is open, isn’t it?', tr: 'Müze açık, değil mi?' },
          ],
          check: { id: 'ex-check-idea', type: 'choice', prompt: 'Dora says: “You are tired, aren’t you?” What does she mean?', options: ['Yorgun musun?', 'Yorgun değilsin.', 'Yorgunsun, değil mi?'], answer: 2, hint: 'Bildiğini söyleyip teyit istiyor.', explain: 'Soru eki “**…, değil mi?**” demektir.', objectiveId: 'u2l4-tag-be', vocabId: 'v-tired' },
        },
        {
          id: 'ex-be-pos',
          title: 'Olumlu cümle → olumsuz ek',
          body: 'Cümle **olumluysa** soru eki **olumsuz** olur. be fiilini olumsuza çeviririz: is → **isn’t**, are → **aren’t**. Sonra özneyi yazarız: she, he, it, you, they.',
          examples: [
            { en: 'Piko is late, isn’t he?', tr: 'Piko geç kaldı, değil mi?' },
            { en: 'You are tired, aren’t you?', tr: 'Yorgunsun, değil mi?' },
            { en: 'The zoo is big, isn’t it?', tr: 'Hayvanat bahçesi büyük, değil mi?' },
          ],
          check: { id: 'ex-check-be-pos', type: 'choice', prompt: 'Momo says: “Piko is in the library, ___ he?”', options: ['is', 'isn’t', 'doesn’t'], answer: 1, hint: 'Cümle olumlu; ek zıt olur.', explain: 'Olumlu + olumsuz ek: is → **isn’t** he?', objectiveId: 'u2l4-tag-be' },
        },
        {
          id: 'ex-be-neg',
          title: 'Olumsuz cümle → olumlu ek',
          body: 'Cümle **olumsuzsa** soru eki **olumlu** olur: **It isn’t late, is it?** Eki de aynı fiille kurarız: isn’t → is, aren’t → are.',
          examples: [
            { en: 'It isn’t late, is it?', tr: 'Geç değil, değil mi?' },
            { en: 'You aren’t sleepy, are you?', tr: 'Uykun yok, değil mi?' },
            { en: 'The museum isn’t closed, is it?', tr: 'Müze kapalı değil, değil mi?' },
          ],
          check: { id: 'ex-check-be-neg', type: 'text', prompt: 'Leo asks Ms Pearl: “The zoo isn’t closed, ___ it?” Type the tag.', accept: ['is'], hint: 'Olumsuz cümlenin eki olumludur.', explain: 'Olumsuz + olumlu ek: isn’t closed, **is** it?', objectiveId: 'u2l4-tag-be', vocabId: 'v-closed' },
        },
        {
          id: 'ex-simple-pos',
          title: 'Present simple (olumlu) → don’t / doesn’t',
          body: 'Present simple olumluysa ek **olumsuz** olur ama fiil yerine **do** yardımcısı kullanılır: I/you/we/they → **don’t**, he/she/it → **doesn’t**.',
          examples: [
            { en: 'She likes English, doesn’t she?', tr: 'İngilizceyi sever, değil mi?' },
            { en: 'You study at night, don’t you?', tr: 'Geceleri çalışırsın, değil mi?' },
            { en: 'Leo draws well, doesn’t he?', tr: 'Leo iyi çizer, değil mi?' },
          ],
          check: { id: 'ex-check-simple-pos', type: 'choice', prompt: 'Dora talks about Momo: “Momo likes tennis, ___ she?”', options: ['doesn’t', 'isn’t', 'don’t'], answer: 0, hint: 'Momo = she. Present simple: do yardımcısı.', explain: 'she + present simple: **doesn’t she?**', objectiveId: 'u2l4-tag-simple' },
        },
        {
          id: 'ex-simple-neg',
          title: 'Present simple (olumsuz) → do / does',
          body: 'Present simple olumsuzsa ek **olumlu** olur: **do** ya da **does**. **They don’t study at night, do they?** **She doesn’t like cold tea, does she?**',
          examples: [
            { en: 'They don’t study at night, do they?', tr: 'Geceleri ders çalışmazlar, değil mi?' },
            { en: 'She doesn’t like cold tea, does she?', tr: 'Soğuk çay sevmez, değil mi?' },
            { en: 'You don’t play at night, do you?', tr: 'Geceleri oynamazsın, değil mi?' },
          ],
          check: { id: 'ex-check-simple-neg', type: 'choice', prompt: 'Ms Pearl says: “Piko and Leo don’t write long entries, ___ they?”', options: ['don’t', 'do', 'are'], answer: 1, hint: 'Olumsuz cümle; ek olumlu.', explain: 'don’t → **do** they?', objectiveId: 'u2l4-tag-simple' },
        },
        {
          id: 'ex-i-am',
          title: 'Özel durum: I am … , aren’t I?',
          body: '**I am** ile ek **amn’t I** olmaz; bunun yerine **aren’t I?** deriz. **I am late, aren’t I?** Olumsuz cümlede normal: I’m not late, am I?',
          examples: [
            { en: 'I am late, aren’t I?', tr: 'Geç kaldım, değil mi?' },
            { en: 'I am right, aren’t I?', tr: 'Haklıyım, değil mi?' },
            { en: 'I’m not late, am I?', tr: 'Geç kalmadım, değil mi?' },
          ],
          check: { id: 'ex-check-i-am', type: 'choice', prompt: 'Dora looks at the clock: “I am late, ___ I?”', options: ['amn’t', 'am', 'aren’t'], answer: 2, hint: 'I am için özel ek.', explain: '**I am … , aren’t I?**', objectiveId: 'u2l4-iam' },
        },
        {
          id: 'ex-answers',
          title: 'Soru ekine nasıl cevap verilir?',
          body: 'Cevabı **gerçeğe göre** verirsin: öyleyse **Yes**, değilse **No**. Cevaptaki fiil de ekteki gibi: **Yes, I am. / No, I’m not. / Yes, she does.** Cevabı soru ekinden değil, gerçekten seç.',
          examples: [
            { en: 'You are tired, aren’t you? Yes, I am.', tr: 'Yorgunsun, değil mi? Evet, yorgunum.' },
            { en: 'You are tired, aren’t you? No, I’m not.', tr: 'Hayır, yorgun değilim.' },
            { en: 'She likes tennis, doesn’t she? Yes, she does.', tr: 'Evet, sever.' },
          ],
          check: { id: 'ex-check-answers', type: 'choice', prompt: 'Ms Pearl asks: “You aren’t tired, are you?” You are very tired. What do you answer?', options: ['No, I’m not.', 'Yes, I am.', 'Yes, I’m not.'], answer: 1, hint: 'Gerçek durum: yorgunsun.', explain: 'Yorgunsan **Yes, I am.**', objectiveId: 'u2l4-iam', vocabId: 'v-tired' },
        },
        {
          id: 'ex-subject',
          title: 'Ekteki özne: she, he, it, they',
          body: 'Ekteki kelime cümlenin öznesinin yerine geçer: kız → **she**, erkek → **he**, eşya ve yer → **it**, birden fazla kişi/şey → **they**. İsim değil, zamir yazılır.',
          examples: [
            { en: 'Dora is nice, isn’t she?', tr: 'Dora nazik, değil mi?' },
            { en: 'The museum is big, isn’t it?', tr: 'Müze büyük, değil mi?' },
            { en: 'Piko and Leo are in the zoo, aren’t they?', tr: 'Piko ile Leo hayvanat bahçesinde, değil mi?' },
          ],
          check: { id: 'ex-check-subject', type: 'choice', prompt: 'Momo asks: “Piko and Leo are at the planetarium, aren’t ___?”', options: ['he', 'you', 'they'], answer: 2, hint: 'İki kişi var.', explain: 'Birden fazla kişi: **they**.', objectiveId: 'u2l4-tag-be', vocabId: 'v-planetarium' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u2l4-tag-be',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Dora watches your match: “You are tired, ___ you?”', options: ['are', 'aren’t', 'don’t'], answer: 1, hint: 'Olumlu cümle; ek olumsuz.', explain: 'You are → **aren’t** you?', objectiveId: 'u2l4-tag-be', vocabId: 'v-tired' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Dora asks you. Put her words in order.', tokens: ['aren’t', 'tired,', 'you?', 'You', 'are'], answer: ['You', 'are', 'tired,', 'aren’t', 'you?'], hint: 'Önce cümle, sonra ek.', explain: 'You are tired, **aren’t** you?', objectiveId: 'u2l4-tag-be' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Dora says: “You are tired, aren’t you?” What does she mean?', options: ['Yorgunsun, değil mi?', 'Yorgun musun?', 'Yorgun değilsin.'], answer: 0, hint: 'Teyit istiyor.', explain: '“**…, değil mi?**” = soru eki.', objectiveId: 'u2l4-tag-be', vocabId: 'v-tired' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u2l4-tag-be',
          complete: { id: 'hw-2-complete', type: 'choice', prompt: 'Mr Aydın says: “It isn’t late, ___ it?”', options: ['isn’t', 'is', 'does'], answer: 1, hint: 'Olumsuz cümlenin eki olumlu.', explain: 'isn’t → **is** it?', objectiveId: 'u2l4-tag-be' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Mr Aydın talks about the match. Put his words in order.', tokens: ['long,', 'match', 'isn’t', 'The', 'is', 'it?'], answer: ['The', 'match', 'isn’t', 'long,', 'is', 'it?'], hint: 'Olumsuz cümle + olumlu ek.', explain: 'The match isn’t long, **is** it?', objectiveId: 'u2l4-tag-be' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Mr Aydın says: “It isn’t late, is it?” What does he mean?', options: ['Geç oldu, değil mi?', 'Geç mi?', 'Geç değil, değil mi?'], answer: 2, hint: 'isn’t = değil', explain: '“Geç **değil**, değil mi?”', objectiveId: 'u2l4-tag-be' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u2l4-tag-be',
          complete: { id: 'hw-3-complete', type: 'text', prompt: 'Momo asks: “Leo and Piko are in the gym, ___ they?” Type the tag.', accept: ap('aren’t'), hint: 'Olumlu cümle; are → ?', explain: 'are → **aren’t** they?', objectiveId: 'u2l4-tag-be' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Leo talks about the museum. Put his words in order.', tokens: ['open,', 'is', 'isn’t', 'it?', 'The', 'museum'], answer: ['The', 'museum', 'is', 'open,', 'isn’t', 'it?'], hint: 'Önce cümle, sonra ek.', explain: 'The museum is open, **isn’t** it?', objectiveId: 'u2l4-tag-be', vocabId: 'v-museum' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Leo says: “The zoo is big, isn’t it?” What does he mean?', options: ['Hayvanat bahçesi büyük, değil mi?', 'Hayvanat bahçesi büyük değil.', 'Hayvanat bahçesi nerede?'], answer: 0, hint: 'zoo = hayvanat bahçesi', explain: 'Hayvanat bahçesi büyük, **değil mi?**', objectiveId: 'u2l4-tag-be', vocabId: 'v-zoo' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u2l4-tag-simple',
          complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Dora talks about Ms Pearl: “She likes English, ___ she?”', options: ['don’t', 'doesn’t', 'isn’t'], answer: 1, hint: 'she + present simple', explain: 'she → **doesn’t** she?', objectiveId: 'u2l4-tag-simple' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Dora asks about Ms Pearl. Put her words in order.', tokens: ['English,', 'likes', 'doesn’t', 'She', 'she?'], answer: ['She', 'likes', 'English,', 'doesn’t', 'she?'], hint: 'Cümle + ek.', explain: 'She likes English, **doesn’t** she?', objectiveId: 'u2l4-tag-simple' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Dora says: “She likes English, doesn’t she?” What does she mean?', options: ['İngilizceyi sever mi?', 'İngilizceyi sevmez.', 'İngilizceyi sever, değil mi?'], answer: 2, hint: 'Teyit istiyor.', explain: '“İngilizceyi sever, **değil mi?**”', objectiveId: 'u2l4-tag-simple' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u2l4-tag-simple',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Piko says: “They don’t study at night, ___ they?”', options: ['don’t', 'does', 'do'], answer: 2, hint: 'Olumsuz cümle; ek olumlu.', explain: 'don’t → **do** they?', objectiveId: 'u2l4-tag-simple' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Piko asks Leo. Put his words in order.', tokens: ['at', 'They', 'do', 'don’t', 'night,', 'study', 'they?'], answer: ['They', 'don’t', 'study', 'at', 'night,', 'do', 'they?'], hint: 'Olumsuz cümle + do they?', explain: 'They don’t study at night, **do** they?', objectiveId: 'u2l4-tag-simple' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Piko says: “They don’t study at night, do they?” What does he mean?', options: ['Geceleri ders çalışırlar, değil mi?', 'Geceleri ders çalışmazlar, değil mi?', 'Geceleri çalışmazlar.'], answer: 1, hint: 'don’t = çalışmaz', explain: '“Çalışmazlar, **değil mi?**”', objectiveId: 'u2l4-tag-simple' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u2l4-iam',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Dora looks at the clock: “I am late, ___ I?”', options: ['amn’t', 'aren’t', 'isn’t'], answer: 1, hint: 'I am için özel ek.', explain: '**I am … , aren’t I?**', objectiveId: 'u2l4-iam' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Dora checks her watch. Put her words in order.', tokens: ['late,', 'aren’t', 'I', 'I?', 'am'], answer: ['I', 'am', 'late,', 'aren’t', 'I?'], hint: 'I am + sıfat, aren’t I?', explain: 'I am late, **aren’t** I?', objectiveId: 'u2l4-iam' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Momo says: “I am right, aren’t I?” What does she mean?', options: ['Haklı mıyım?', 'Haklıyım, değil mi?', 'Haklı değilim.'], answer: 1, hint: 'right = haklı', explain: '“Haklıyım, **değil mi?**”', objectiveId: 'u2l4-iam' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u2l4-iam',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Ms Pearl says: “You like science, don’t you?” You love it. You answer: “Yes, ___.”', options: ['I do', 'I am', 'I don’t'], answer: 0, hint: 'Cevaptaki fiil, ekteki gibi: do.', explain: 'don’t you? → **Yes, I do.**', objectiveId: 'u2l4-iam' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'You answer Ms Pearl. Put the words in order.', tokens: ['do.', 'I', 'Yes,'], answer: ['Yes,', 'I', 'do.'], hint: 'Yes, özne, fiil.', explain: 'Yes, I do.', objectiveId: 'u2l4-iam' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Dora asks: “You are tired, aren’t you?” You say: “No, I’m not.” What do you mean?', options: ['Yorgun değilim.', 'Yorgunum.', 'Yorgun musun?'], answer: 0, hint: 'No, I’m not = hayır, değilim', explain: '“No, I’m not” = **yorgun değilim**.', objectiveId: 'u2l4-iam', vocabId: 'v-tired' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u2l4-places',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'You can see stars and planets on a big round ceiling at the ___.', options: ['zoo', 'planetarium', 'museum'], answer: 1, hint: 'Yıldızlar tavanda.', explain: 'Yıldız ve gezegenler: **planetarium**.', objectiveId: 'u2l4-places', vocabId: 'v-planetarium' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Leo reads a sign. Put the words in order.', tokens: ['open', 'public', 'The', 'to', 'library', 'is', 'everyone.'], answer: ['The', 'public', 'library', 'is', 'open', 'to', 'everyone.'], hint: 'The public library is …', explain: 'The public library is **open to everyone**.', objectiveId: 'u2l4-places', vocabId: 'v-public-library' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Piko says: “The science centre is great.” What does he mean?', options: ['Bilim merkezi büyük.', 'Bilim merkezi harika.', 'Bilim merkezi kapalı.'], answer: 1, hint: 'great = harika', explain: 'science centre = bilim merkezi; great = harika.', objectiveId: 'u2l4-places', vocabId: 'v-science-centre' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u2l4-diary',
          complete: { id: 'hw-9-complete', type: 'choice', prompt: 'Ms Pearl says: “A diary entry starts with the ___.” (13th of March)', options: ['date', 'plan', 'ticket'], answer: 0, hint: 'Hangi gün? Satırın başına yazılır.', explain: 'Günlük **date** (tarih) ile başlar.', objectiveId: 'u2l4-diary', vocabId: 'v-diary-entry' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Dora starts her diary. Put her words in order.', tokens: ['day.', 'Dear', 'Diary,', 'a', 'big', 'today', 'is'], answer: ['Dear', 'Diary,', 'today', 'is', 'a', 'big', 'day.'], hint: 'Önce Dear Diary.', explain: '**Dear Diary,** today is a big day.', objectiveId: 'u2l4-diary', vocabId: 'v-dear-diary' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Dora writes: “I am proud of my friend.” What does she mean?', options: ['Arkadaşımla gurur duyuyorum.', 'Arkadaşım yorgun.', 'Arkadaşım geç kaldı.'], answer: 0, hint: 'proud = gururlu', explain: 'proud of = gurur duymak.', objectiveId: 'u2l4-diary', vocabId: 'v-proud' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-museum-open', type: 'choice', prompt: 'Ms Pearl says: “The museum is open today, ___ it?”', options: ['is', 'isn’t', 'does'], answer: 1, objectiveId: 'u2l4-tag-be', vocabId: 'v-museum' },
        { id: 'as-leo-class', type: 'text', prompt: 'Momo says: “Leo isn’t in class, ___ he?” Type the tag.', accept: ['is'], objectiveId: 'u2l4-tag-be' },
        { id: 'as-dora-noisy', type: 'choice', prompt: 'Piko asks: “Dora doesn’t like noisy places, ___ she?”', options: ['does', 'doesn’t', 'is'], answer: 0, objectiveId: 'u2l4-tag-simple' },
        { id: 'as-library', type: 'choice', prompt: 'Ms Pearl asks you: “You study at the public library, ___ you?”', options: ['do', 'don’t', 'aren’t'], answer: 1, objectiveId: 'u2l4-tag-simple', vocabId: 'v-public-library' },
        { id: 'as-order-planetarium', type: 'order', prompt: 'Leo talks about the planetarium. Put his words in order.', tokens: ['planetarium,', 'She', 'she?', 'likes', 'the', 'doesn’t'], answer: ['She', 'likes', 'the', 'planetarium,', 'doesn’t', 'she?'], objectiveId: 'u2l4-tag-simple', vocabId: 'v-planetarium' },
        { id: 'as-nervous', type: 'text', prompt: 'Dora is nervous before the quiz: “I am nervous, ___ I?” Type the tag.', accept: ap('aren’t'), objectiveId: 'u2l4-iam', vocabId: 'v-nervous' },
        { id: 'as-zoo', type: 'choice', prompt: 'Momo says: “Piko and Leo visit the zoo, ___ they?”', options: ['doesn’t', 'aren’t', 'don’t'], answer: 2, objectiveId: 'u2l4-tag-simple', vocabId: 'v-zoo' },
        { id: 'as-answer-no', type: 'choice', prompt: 'Ms Pearl asks: “You aren’t tired, are you?” You feel fine. What do you say?', options: ['No, I’m not.', 'Yes, I’m not.', 'No, I am.'], answer: 0, objectiveId: 'u2l4-iam', vocabId: 'v-tired' },
        { id: 'as-where-old', type: 'choice', prompt: 'You want to learn about old maps and coins. Where do you go?', options: ['To the zoo.', 'To the museum.', 'To the planetarium.'], answer: 1, objectiveId: 'u2l4-places', vocabId: 'v-exhibition' },
        { id: 'as-diary-part', type: 'choice', prompt: 'Dora writes “I am proud and happy” in her diary. Which part is it?', options: ['The date', 'The tickets', 'The feelings', 'The plan'], answer: 2, objectiveId: 'u2l4-diary', vocabId: 'v-feelings' },
        { id: 'as-date-word', type: 'text', prompt: 'Review: Dora writes the 23rd of April in words. Type: “the ___ of April”', accept: vary('twenty-third'), objectiveId: 'u2l4-review' },
        { id: 'as-poss', type: 'choice', prompt: 'Review: Piko writes in ___ diary every night.', options: ['him', 'his', 'he'], answer: 1, objectiveId: 'u2l4-review', vocabId: 'v-diary' },
      ],
      reading: {
        title: 'Dora’s Diary',
        paragraphs: [
          'Saturday, 13th of March. Dear Diary, right now I am sitting on a bench at the tennis court. The school tennis final is over, and I am so proud of my friend. I am always nervous before her matches, but today I am only happy!',
          'Mr Aydın is holding the trophy, and everybody is clapping. He says: “You are first in the province!” My friend is tired, but she is smiling. “You are tired, aren’t you?” I ask. “Yes, but I’m happy!” she answers.',
          'Tomorrow is Sunday. I rest at home in the morning. In the afternoon, I go to the science centre with my friends. It is a great plan, isn’t it? Bye for now, Diary! Dora',
        ],
        questions: [
          { id: 'rd-tf-saturday', type: 'choice', prompt: 'The diary is for Saturday.', options: tf, answer: 0, objectiveId: 'u2l4-diary', vocabId: 'v-diary-entry' },
          { id: 'rd-tf-dora', type: 'choice', prompt: 'Dora is proud of her friend.', options: tf, answer: 0, objectiveId: 'u2l4-diary' },
          { id: 'rd-tf-sad', type: 'choice', prompt: 'At the end, Dora’s friend is sad.', options: tf, answer: 1, objectiveId: 'u2l4-diary', vocabId: 'v-tired' },
          { id: 'rd-tf-centre', type: 'choice', prompt: 'On Sunday afternoon, Dora goes to the science centre.', options: tf, answer: 0, objectiveId: 'u2l4-places', vocabId: 'v-science-centre' },
          { id: 'rd-tf-second', type: 'choice', prompt: 'Mr Aydın says Dora’s friend is second in the province.', options: tf, answer: 1, objectiveId: 'u2l4-review' },
          { id: 'rd-fill-tag', type: 'choice', prompt: 'At the end, Dora says to her friend: “You are tired, ___ you?”', options: ['are', 'don’t', 'isn’t', 'aren’t'], answer: 3, objectiveId: 'u2l4-tag-be' },
          { id: 'rd-fill-to', type: 'choice', prompt: 'In the afternoon, Dora goes ___ the science centre.', options: ['in', 'at', 'to', 'on'], answer: 2, objectiveId: 'u2l4-places', vocabId: 'v-science-centre' },
          { id: 'rd-fill-rests', type: 'choice', prompt: 'On Sunday morning, Dora ___ at home.', options: ['rest', 'rests', 'resting', 'to rest'], answer: 1, objectiveId: 'u2l4-review' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-diary', 'v-diary-entry', 'v-feelings', 'v-plan', 'v-tired', 'v-nervous', 'v-excited', 'v-proud', 'v-museum', 'v-zoo',
              'rv-num', 'rv-ord', 'rv-date', 'rv-rank',
            ],
            seconds: { bank: 10, perCorrect: 3, cap: 10 },
            chase: { chaser: 'caramel-river', escapee: 'dora' },
            easyDefault: false,
          },
        },
        vocabulary: {
          template: 'scroll-story',
          slots: {
            mode: 'vocab-reveal',
            steps: [
              { id: 'vs-diary', line: { speaker: 'dora', en: 'I write in my diary every night.', tr: 'Her gece günlüğüme yazarım.' }, emphasis: ['diary'] },
              { id: 'vs-feel', line: { speaker: 'dora', en: 'Today I am tired, but I am proud.', tr: 'Bugün yorgunum ama gururluyum.' }, emphasis: ['tired', 'proud'] },
              { id: 'vs-museum', line: { speaker: 'leo', en: 'The museum has a new exhibition.', tr: 'Müzede yeni bir sergi var.' }, emphasis: ['museum', 'exhibition'] },
              { id: 'vs-science', line: { speaker: 'piko', en: 'The science centre is great, isn’t it?', tr: 'Bilim merkezi harika, değil mi?' }, emphasis: ['science centre'] },
              {
                id: 'vs-planetarium',
                line: { speaker: 'sasha', en: 'The planetarium has stars on the ceiling.', tr: 'Planetaryumda tavanda yıldızlar var.' },
                emphasis: ['planetarium'],
                joke: { tr: 'Planetaryumda yıldızlar tavandadır; yağmur yağmaz, şemsiye de gerekmez.' },
              },
              { id: 'vs-library', line: { speaker: 'momo', en: 'The public library is open to everyone.', tr: 'Halk kütüphanesi herkese açık.' }, emphasis: ['public library'] },
              { id: 'vs-zoo', line: { speaker: 'leo', en: 'At the zoo, a guide shows us the animals.', tr: 'Hayvanat bahçesinde bir rehber hayvanları gösteriyor.' }, emphasis: ['zoo'] },
            ],
            vocabRefs: [
              'v-diary', 'v-diary-entry', 'v-dear-diary', 'v-feelings', 'v-plan', 'v-tired', 'v-nervous', 'v-excited', 'v-proud',
              'v-museum', 'v-science-centre', 'v-public-library', 'v-zoo', 'v-planetarium', 'v-exhibition', 'v-ticket', 'v-learn-new', 'v-closed',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-diary', 'v-tired', 'v-proud', 'v-museum', 'v-science-centre', 'v-planetarium', 'v-ticket'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-final', line: { speaker: 'narrator', en: 'The tennis final is over. You sit with Dora.', tr: 'Tenis finali bitti. Dora ile oturuyorsun.' } },
              { id: 'ps-tag', line: { speaker: 'dora', en: 'You are tired, aren’t you?', tr: 'Yorgunsun, değil mi?' }, emphasis: ['aren’t you'], gate: 'st-q-tag' },
              { id: 'ps-happy', line: { speaker: 'narrator', en: 'You smile and say: “Yes, but I’m happy!”', tr: 'Gülümseyip: “Evet, ama mutluyum!” diyorsun.' }, gate: 'st-q-answer' },
              { id: 'ps-plan', line: { speaker: 'narrator', en: 'Ms Pearl says: “A diary has the date, feelings, news and plans.”', tr: 'Ms Pearl: “Günlükte tarih, duygular, haberler ve planlar olur.”' }, gate: 'st-q-diary' },
              { id: 'ps-planet', line: { speaker: 'leo', en: 'The planetarium isn’t open on Monday, is it?', tr: 'Planetaryum Pazartesi açık değil, değil mi?' }, gate: 'st-q-planetarium' },
              { id: 'ps-night', line: { speaker: 'dora', en: 'Dear Diary, today is a big day!', tr: 'Sevgili Günlük, bugün büyük bir gün!' } },
            ],
            choice: {
              prompt: 'What does Dora write next in her diary?',
              options: [
                { text: 'My feelings: I am proud of my friend.', feedback: 'Güzel seçim! Duygular günlüğün kalbidir.' },
                { text: 'My plan: On Sunday I visit the science centre.', feedback: 'Güzel seçim! Plan günlüğün sonuna yakışır.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-flip',
                target: 'card-flip',
                hint: { fine: 'Cümle olumluysa ek olumsuz, olumsuzsa ek olumlu olur.', big: 'You are tired, aren’t you? / It isn’t late, is it?' },
                joke: { tr: 'Soru eki cümlenin “tersi” gibidir: biri “evet” derse, öteki “ya hayır?” diye sorar.' },
                stepRef: 'ex-be-pos',
              },
              {
                id: 'g-do',
                target: 'card-do',
                hint: { fine: 'Present simple ekinde fiil yerine do / does / don’t / doesn’t gelir.', big: 'She likes English, doesn’t she? They don’t study at night, do they?' },
                stepRef: 'ex-simple-pos',
              },
              {
                id: 'g-iam',
                target: 'card-iam',
                hint: { fine: 'I am için amn’t yoktur.', big: 'I am late, aren’t I?' },
                stepRef: 'ex-i-am',
              },
            ],
            goNoGo: {
              rule: { tr: 'Cümle olumsuzsa (isn’t, don’t, doesn’t…) dokun: ek olumlu olur. Olumluysa dokunma!', tapIf: 'negative' },
              warmup: [
                { id: 'w-tired', text: 'You are tired', tap: false, why: 'Olumlu cümle: ek olumsuz (aren’t you?)' },
                { id: 'w-late', text: 'It isn’t late', tap: true, why: 'Olumsuz cümle: ek olumlu (is it?)' },
                { id: 'w-likes', text: 'She likes tennis', tap: false, why: 'Olumlu cümle: ek olumsuz (doesn’t she?)' },
                { id: 'w-study', text: 'They don’t study at night', tap: true, why: 'Olumsuz cümle: ek olumlu (do they?)' },
              ],
              round: [
                { id: 'r-zoo', text: 'The zoo is big', tap: false, why: 'Olumlu: isn’t it?' },
                { id: 'r-piko', text: 'Piko isn’t here', tap: true, why: 'Olumsuz: is he?' },
                { id: 'r-momo', text: 'Momo draws well', tap: false, why: 'Olumlu: doesn’t she?' },
                { id: 'r-tea', text: 'You don’t like cold tea', tap: true, why: 'Olumsuz: do you?' },
                { id: 'r-iam', text: 'I am late', tap: false, why: 'Olumlu: aren’t I?' },
                { id: 'r-museum', text: 'The museum isn’t open', tap: true, why: 'Olumsuz: is it?' },
                { id: 'r-leo', text: 'Leo doesn’t play tennis', tap: true, why: 'Olumsuz: does he?' },
                { id: 'r-friends', text: 'Dora and Leo are friends', tap: false, why: 'Olumlu: aren’t they?' },
                { id: 'r-ticket', text: 'The ticket isn’t expensive', tap: true, why: 'Olumsuz: is it?' },
                { id: 'r-writes', text: 'She writes every night', tap: false, why: 'Olumlu: doesn’t she?' },
              ],
              onWrongTap: { anim: 'sneeze', line: 'Hapşu! Bu cümlenin eki ters kutuptaydı.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'tennis-bench', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'clock', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'diary-page', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-complete', sceneObject: 'night-lamp' },
              { ref: 'hw-6-order', sceneObject: 'pen', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-9-order' },
            ],
            hint: { fine: 'Cümle olumlu mu, olumsuz mu? Eki ters kutuptan seç; I am için aren’t I.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-museum-open', 'as-leo-class', 'as-dora-noisy', 'as-library', 'as-order-planetarium', 'as-nervous',
              'as-zoo', 'as-answer-no', 'as-where-old', 'as-diary-part', 'as-date-word', 'as-poss',
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
            frame: 'Dear Diary, today I am ___. On Sunday I visit the ___.',
            chips: [
              { id: 'c-tired', en: 'tired', tr: 'yorgun', kind: 'adj' },
              { id: 'c-excited', en: 'excited', tr: 'heyecanlı', kind: 'adj' },
              { id: 'c-proud', en: 'proud', tr: 'gururlu', kind: 'adj' },
              { id: 'c-nervous', en: 'nervous', tr: 'gergin', kind: 'adj' },
              { id: 'c-museum', en: 'museum', tr: 'müze', kind: 'place' },
              { id: 'c-science', en: 'science centre', tr: 'bilim merkezi', kind: 'place' },
              { id: 'c-zoo', en: 'zoo', tr: 'hayvanat bahçesi', kind: 'place' },
              { id: 'c-planetarium', en: 'planetarium', tr: 'planetaryum', kind: 'place' },
              { id: 'c-library', en: 'public library', tr: 'halk kütüphanesi', kind: 'place' },
              { id: 'c-cheer', en: 'cheer', tr: 'tezahürat yapmak', kind: 'verb' },
            ],
            collection: { title: 'Günlük Sayfalarım' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Soru ekleri (question tags): be ile (You are tired, aren’t you? / It isn’t late, is it?), present simple ile (She likes English, doesn’t she? / They don’t study at night, do they?), I am → aren’t I; kısa cevap. Yazma: günlük (tarih, duygular, olanlar, planlar). Kültür: okul dışında öğrenme yerleri. Ünite 2 tekrarı (sayılar ve sıra sayıları, şimdiki zaman, iyelik, zarflar).',
    vocabulary: [
      'diary', 'diary entry', 'Dear Diary', 'feelings', 'plan', 'tired', 'nervous', 'excited', 'proud',
      'museum', 'science centre', 'public library', 'zoo', 'planetarium', 'exhibition', 'ticket', 'learn something new', 'closed',
    ],
    grammar: [
      'Question tags with be: olumlu → olumsuz ek, olumsuz → olumlu ek',
      'Question tags with present simple: don’t / doesn’t / do / does',
      'I am … , aren’t I?',
      'Soru ekine kısa cevap: Yes, I am. / No, I’m not. / Yes, she does.',
    ],
    expectedDifficulties: [
      'Türkçede soru eki tek kalıptır (“değil mi?”); İngilizcede fiil ve özneye göre değişmesi zordur.',
      'Olumlu/olumsuz zıtlığını unutmak: “You are tired, are you?” gibi aynı kutupta ek kurmak.',
      'Present simple’da be fiilini yanlış ek olarak seçmek: “She likes tennis, isn’t she?”',
      'Ekte özne yerine isim yazmak: “Piko is late, isn’t Piko?” (zamir gerekir: isn’t he?).',
      '“I am” için “amn’t I” demek; doğrusu aren’t I.',
      'Soru ekine cevapta Türkçe düşünmek: “You aren’t tired, are you?” → “Hayır” diyerek “No, I am” demek; cevabı gerçeğe göre vermek gerekir.',
    ],
    commonErrors: [
      { error: 'You are tired, are you?', correction: 'You are tired, aren’t you? Olumlu cümle → olumsuz ek.' },
      { error: 'She likes tennis, isn’t she?', correction: 'She likes tennis, doesn’t she? Present simple’da do yardımcısı.' },
      { error: 'They don’t study at night, don’t they?', correction: 'They don’t study at night, do they? Olumsuz cümle → olumlu ek.' },
      { error: 'I am late, amn’t I?', correction: 'I am late, aren’t I?' },
      { error: 'Piko is late, isn’t Piko?', correction: 'Piko is late, isn’t he? Ekte zamir kullan.' },
      { error: 'You aren’t tired, are you? — No, I am.', correction: 'Yorgunsan: Yes, I am. Yorgun değilsen: No, I’m not.' },
    ],
    questionsToAsk: [
      'You are tired after a long day, aren’t you? (kısa cevap: Yes, I am. / No, I’m not.)',
      'Ms Pearl likes English, doesn’t she?',
      'Which place do you like: a museum, a zoo or a planetarium? Why?',
      'What do you write in a diary: the date, feelings, news or plans?',
    ],
    speakingPrompts: [
      'Tags: “It is a nice day, isn’t it?” “The museum isn’t closed, is it?”',
      'Present simple tags: “You like science, don’t you?” “She doesn’t like noisy places, does she?”',
      'My diary: “Dear Diary, today I am … . I … . Tomorrow I …”',
      'Learning places: “At the science centre you learn something new.”',
      'Review: “It is the twenty-third of April. I have two hundred and fifty stickers.”',
    ],
    rolePlay: {
      situation: 'Maç sonrası bankta: Dora ve öğrenci maçı konuşur, ardından günlük yazmaya karar verirler.',
      roles: ['Dora (arkadaş, tenisçi)', 'Öğrenci (you, tenisçi)', 'Mr Aydın (antrenör)'],
      steps: [
        'Dora sorar: “You are tired, aren’t you?” Öğrenci cevap verir: “Yes, but I’m happy!” (ya da “No, I’m not.”).',
        'Mr Aydın sorar: “It isn’t late, is it?” Öğrenci gerçek ya da hayali cevap verir.',
        'Dora sorar: “You write a diary, don’t you?” Öğrenci “Yes, I do. / No, I don’t.” der ve bir cümleyle günlük planını söyler.',
        'Roller değişir; öğrenci Dora olur ve üç soru eki kurar.',
      ],
    },
    listening: {
      script:
        'It is Sunday evening. Dora is in her room, and she writes in her diary. Today is the fourteenth of March. She is tired, but she is happy. In the morning she rests at home. In the afternoon she visits the science centre with Piko and Leo. The science centre has a big planetarium. It isn’t open on Monday, so they go on Sunday. Piko likes the stars, doesn’t he? Yes, he does! Dora writes: “Dear Diary, I am proud of my friends.” Then she says goodnight.',
      questions: [
        'What day is it today? (Sunday, the 14th of March)',
        'How does Dora feel? (She is tired, but she is happy.)',
        'Where does Dora go in the afternoon? (To the science centre.)',
        'Is the planetarium open on Monday? (No, it isn’t.)',
        'Does Piko like the stars? (Yes, he does.)',
      ],
    },
    reinforcement: [
      'Ters kutup kartları: öğretmen olumlu cümle okur, öğrenci olumsuz eki ekler; sonra tersi.',
      'Üç sütunlu tablo: be / do / does; her sütuna beş cümle ve soru eki yazdır.',
      'Günlük iskeleti: Date / Feelings / What happens / Plans başlıklarıyla öğrenci her başlığa bir cümle yazar.',
    ],
    suggestedActivities: [
      'Soru eki ping-pong: öğrenci ve öğretmen sırayla cümle söyler, karşı taraf eki ekler.',
      'Müze, bilim merkezi, hayvanat bahçesi, planetaryum, halk kütüphanesi kartları: öğrenci “At the … you …” cümlesi kurar.',
      'Gezi planı posteri: hangi yeri hangi gün ziyaret edeceğini (tarih ve sıra sayısıyla) yazar.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma: “It is a nice day, isn’t it?” (öğrenci Yes, it is. ya da No, it isn’t. der)',
        'Isınma: “You like English, don’t you?” (kısa cevap)',
        'Isınma: Bugünün tarihini söyle (“Today is the … of …”).',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları: diary, feelings, plan, tired, proud; öğrenci her kartla bir cümle kurar.',
        'Öğrenme yerleri: museum, science centre, public library, zoo, planetarium; “At the … you can …” cümleleri.',
        'Duygu kelimeleri: nervous, excited, proud, tired; hangisi hangi anda?',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: be ile ek: öğretmen olumlu cümle söyler (“You are tired”), öğrenci eki ekler (“aren’t you?”).',
        'Tur 2: olumsuz cümle: “It isn’t late” → “is it?”.',
        'Tur 3: present simple: “She likes English” → “doesn’t she?”, “They don’t study at night” → “do they?”.',
        'Tur 4: I am late, aren’t I? ve kısa cevaplar: Yes, I am. / No, I’m not.',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Maç sonrası bank rol oyunu: Dora, Mr Aydın ve öğrenci; “You are tired, aren’t you? — Yes, but I’m happy!”',
        'Beklenen cümleler: “It isn’t late, is it?” “She likes tennis, doesn’t she?” “I am proud, aren’t I?”',
        'Öğretmen notu: Rol oyununu bölme; hataları sonunda topluca düzelt.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'It is Sunday evening. Dora is in her room, and she writes in her diary. Today is the fourteenth of March. She is tired, but she is happy. In the morning she rests at home. In the afternoon she visits the science centre with Piko and Leo. The science centre has a big planetarium. It isn’t open on Monday, so they go on Sunday. Piko likes the stars, doesn’t he? Yes, he does! Dora writes: “Dear Diary, I am proud of my friends.” Then she says goodnight.',
      activities: [
        'Metni iki kez oku; ilkinde yalnız dinlesin, ikincisinde tarihi ve yerleri not alsın.',
        'Sorular: What day is it? How does Dora feel? Where does she go? Is the planetarium open on Monday? Does Piko like the stars?',
        'Öğrenci metinden iki soru eki cümlesi bulup tekrar eder.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık hatasını (aynı kutupta ek, be / do karışması, amn’t I) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa beklenen zorluklar: olumlu → olumsuz ek, present simple’da do yardımcısı, ekte zamir.',
        'Yanlışta nazikçe “Yaklaştın!” de; cümleyi birlikte doğru kur.',
      ],
    },
    freeSpeaking: {
      minutes: 9,
      activities: [
        'Konu 1: Bugünün günlüğü: tarih, duygu, bir olay, bir plan (hayal edebilirsin).',
        'Konu 2: Okul dışında hangi yeri gezmek istersin? museum, zoo, planetarium… Bir soru eki ile arkadaşına sor.',
        'Konu 3: Bir maç günü ya da yarışma günü (gerçek ya da hayali): “I am tired, but I am happy.”',
        'Konu 4: Ünite 2 tekrarı: “How often do you …?” “It is the twenty-third of April.”',
        'Konu 5: Soru eki oyunu: öğretmen bir bilgi söyler, öğrenci “…, isn’t it?” ile teyit ister.',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı sorma; cevaplar gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Kitap yazma çıktısı “diary”: Öğrenci bir günü anlatan kısa bir günlük yazısı yazar (6–8 cümle): tarih (“Saturday, 13th of March”), duygular, günün olayı, bir plan ve en az iki soru eki (“It is late, isn’t it?”). Örnek: bir maç günü: “Dear Diary, today is the match day. I am tired, but I am happy!” Gerçek ya da hayali olabilir; isim, okul ya da adres yazma.',
    },
  },
}
export default lesson
