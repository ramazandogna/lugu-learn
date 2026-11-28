/** Ünite 2.2 — A Busy Classroom: present simple vs present progressive + possessive adjectives (my…their). Theme u4-school-bell, host leo. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 2.2 — A Busy Classroom',
  sourceNotes:
    'Kitap Ünite 2 (Classroom Life): present simple (alışkanlık) ile present progressive (şu an) farkı; state verbs (like, know) -ing almaz; possessive adjectives (my, your, his, her, its, our, their). Kitap kelimeleri: level, sort, learning; ek: activity, experiment, project, group work, worksheet, homework. Fen laboratuvarı proje günü.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Project Day in the Science Lab',
      tagline: 'Cuma proje günü! Leo laboratuvarda: ne her gün yapılır, ne şu an yapılıyor? Hepsini ayır.',
      theme: 'Classroom life',
      character: 'leo',
      level: 'A1-A2',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u2l2-habit', text: 'Alışkanlıkları present simple ile anlatır (every day, usually).' },
        { id: 'u2l2-now', text: 'Şu an olanı present progressive ile anlatır (now, right now, at the moment).' },
        { id: 'u2l2-signals', text: 'İşaret kelimelerinden (every day / right now) doğru zamanı seçer.' },
        { id: 'u2l2-state', text: 'like, know, love gibi durum fiillerini -ing almadan kullanır.' },
        { id: 'u2l2-possessive', text: 'my, your, his, her, its, our, their ile sahipliği söyler; iyelik ile özne zamirini ayırır.' },
        { id: 'u2l2-activities', text: 'Sınıf etkinliği kelimelerini (activity, experiment, project, worksheet, group work…) söyler.' },
      ],
      grammar: [
        'Present simple (habit): He usually draws. — every day, usually, always, often',
        'Present progressive (now): He is drawing. — now, right now, at the moment, Look!',
        'State verbs (like, know, love) are not used with -ing: I like science. / She knows the answer.',
        'Possessive adjectives: my, your, his, her, its, our, their + noun',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-howoften', type: 'choice', prompt: 'Ms Pearl asks Leo: “___ do you draw?” “Twice a week.”', options: ['How old', 'How many', 'How often'], answer: 2, hint: 'Cevap bir sıklık: twice a week.', explain: 'Sıklığı **How often** sorar.', objectiveId: 'u2l2-habit' },
        { id: 'rv-twice', type: 'choice', prompt: 'Sasha revises on Monday and Friday. She revises ___.', options: ['once a week', 'twice a week', 'every day'], answer: 1, hint: 'İki gün var.', explain: 'İki kez = **twice a week**.', objectiveId: 'u2l2-habit' },
        { id: 'rv-quietly', type: 'choice', prompt: 'Momo is a quiet girl in the library. She speaks ___.', options: ['quietly', 'quiet', 'quietness'], answer: 0, hint: 'Speaks bir eylem; eylemi anlatan -ly zarfı.', explain: 'Eylemden sonra zarf: speaks **quietly**.', objectiveId: 'u2l2-habit' },
        { id: 'rv-well', type: 'choice', prompt: 'Leo is a good artist. He draws ___.', options: ['good', 'well', 'goodly'], answer: 1, hint: 'Good’un zarfı özel bir kelime.', explain: '**good** → **well**: He draws well.', objectiveId: 'u2l2-habit' },
      ],
    },
    vocabulary: [
      { id: 'v-activity', en: 'activity', tr: 'etkinlik', example: { en: 'Today’s activity is an experiment.', tr: 'Bugünkü etkinlik bir deney.' }, difficulty: 1, objectiveId: 'u2l2-activities' },
      { id: 'v-experiment', en: 'experiment', tr: 'deney', example: { en: 'The group does an experiment in the science lab.', tr: 'Grup fen laboratuvarında bir deney yapıyor.' }, difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-project', en: 'project', tr: 'proje', example: { en: 'Our project is about plants.', tr: 'Projemiz bitkiler hakkında.' }, difficulty: 1, objectiveId: 'u2l2-activities' },
      { id: 'v-level', en: 'level', tr: 'seviye', example: { en: 'This worksheet has three levels.', tr: 'Bu çalışma kâğıdının üç seviyesi var.' }, context: 'Kolaydan zora: level one, level two…', difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-sort', en: 'sort the cards', tr: 'kartları ayırmak, sınıflandırmak', example: { en: 'Momo sorts the cards into two groups.', tr: 'Momo kartları iki gruba ayırıyor.' }, difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-learning', en: 'learning', tr: 'öğrenme', example: { en: 'Learning is fun in a group.', tr: 'Grupta öğrenmek eğlenceli.' }, context: 'Learn fiilinden gelen isim.', difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-group-work', en: 'group work', tr: 'grup çalışması', example: { en: 'Group work is my favourite activity.', tr: 'Grup çalışması en sevdiğim etkinlik.' }, difficulty: 1, objectiveId: 'u2l2-activities' },
      { id: 'v-worksheet', en: 'worksheet', tr: 'çalışma kâğıdı', example: { en: 'Sasha has a new worksheet.', tr: 'Sasha’nın yeni bir çalışma kâğıdı var.' }, difficulty: 1, objectiveId: 'u2l2-activities' },
      { id: 'v-homework', en: 'homework', tr: 'ödev', example: { en: 'Our homework is a short report.', tr: 'Ödevimiz kısa bir rapor.' }, difficulty: 1, objectiveId: 'u2l2-activities' },
      { id: 'v-right-now', en: 'right now', tr: 'şu anda', example: { en: 'They are working right now.', tr: 'Şu anda çalışıyorlar.' }, context: 'Present progressive işaret kelimesi.', difficulty: 1, objectiveId: 'u2l2-signals' },
      { id: 'v-at-moment', en: 'at the moment', tr: 'şu sıralar, şu anda', example: { en: 'Piko is measuring the water at the moment.', tr: 'Piko şu anda suyu ölçüyor.' }, context: 'Right now gibi, şu an için.', difficulty: 2, objectiveId: 'u2l2-signals' },
      { id: 'v-usually', en: 'usually', tr: 'genellikle', example: { en: 'Leo usually draws in art class.', tr: 'Leo genellikle resim dersinde çizim yapar.' }, context: 'Present simple işaret kelimesi; fiilden önce gelir.', difficulty: 1, objectiveId: 'u2l2-signals' },
      { id: 'v-mix', en: 'mix water and sand', tr: 'su ve kumu karıştırmak', example: { en: 'Momo mixes water and sand.', tr: 'Momo su ve kumu karıştırıyor.' }, difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-measure', en: 'measure', tr: 'ölçmek', example: { en: 'Piko measures the plant every day.', tr: 'Piko bitkiyi her gün ölçüyor.' }, difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-lab-coat', en: 'lab coat', tr: 'laboratuvar önlüğü', example: { en: 'Dora wears her white lab coat.', tr: 'Dora beyaz laboratuvar önlüğünü giyiyor.' }, difficulty: 1, objectiveId: 'u2l2-activities' },
      { id: 'v-safety-glasses', en: 'safety glasses', tr: 'koruyucu gözlük', example: { en: 'Everybody wears safety glasses in the lab.', tr: 'Laboratuvarda herkes koruyucu gözlük takar.' }, difficulty: 2, objectiveId: 'u2l2-activities' },
      { id: 'v-result', en: 'result', tr: 'sonuç', example: { en: 'The group writes the result of the experiment.', tr: 'Grup deneyin sonucunu yazıyor.' }, difficulty: 2, objectiveId: 'u2l2-activities' },
    ],
    story: {
      title: 'Project Day in the Science Lab',
      character: 'leo',
      setting: 'Ms Pearl’s class on a Friday: the classroom and the science lab',
      scenes: [
        {
          id: 'sc-friday',
          illustration: 'A bright classroom on Friday morning; lab coats hang on the chairs, Ms Pearl holds a stack of worksheets.',
          lines: [
            { speaker: 'narrator', en: 'It is Friday. Every Friday, the class has a project day.', tr: 'Bugün cuma. Her cuma sınıfın proje günü var.' },
            { speaker: 'narrator', en: 'Ms Pearl says: “Today our activity is an experiment. Please wear your lab coats.”', tr: 'Ms Pearl diyor ki: “Bugünkü etkinliğimiz bir deney. Lütfen önlüklerinizi giyin.”' },
            { speaker: 'leo', en: 'I usually draw in this lesson. Today I am in the lab!', tr: 'Bu derste genelde resim yaparım. Bugün laboratuvardayım!' },
            { speaker: 'sasha', en: 'Our group is the plant group. I am the leader.', tr: 'Bizim grup bitki grubu. Lider benim.' },
            { speaker: 'momo', en: 'I like experiments, but I always spill the water!', tr: 'Deneyleri severim ama suyu hep dökerim!' },
          ],
        },
        {
          id: 'sc-lab',
          illustration: 'The science lab: Piko with a measuring jug, Momo mixing sand and water, Leo with cards on the table.',
          lines: [
            { speaker: 'narrator', en: 'Now the class is in the science lab. Everybody wears safety glasses.', tr: 'Şimdi sınıf fen laboratuvarında. Herkes koruyucu gözlük takıyor.' },
            { speaker: 'piko', en: 'I am measuring the water right now. I know the numbers!', tr: 'Şu anda suyu ölçüyorum. Sayıları biliyorum!' },
            { speaker: 'momo', en: 'I am mixing water and sand. Oops! My cup is empty!', tr: 'Su ve kumu karıştırıyorum. Eyvah! Bardağım boş!' },
            { speaker: 'leo', en: 'I am sorting the cards. Our worksheet has three levels.', tr: 'Kartları ayırıyorum. Çalışma kâğıdımızın üç seviyesi var.' },
            { speaker: 'sasha', en: 'Don’t worry, Momo. We have another cup.', tr: 'Merak etme Momo. Başka bir bardağımız var.' },
          ],
        },
        {
          id: 'sc-pearl',
          illustration: 'Ms Pearl bends over the group’s table; Dora’s group writes at the next table.',
          lines: [
            { speaker: 'narrator', en: 'Ms Pearl walks around the lab. She is looking at their worksheet.', tr: 'Ms Pearl laboratuvarda dolaşıyor. Onların çalışma kâğıdına bakıyor.' },
            { speaker: 'narrator', en: 'She says: “Your group is doing level two. Good work!”', tr: 'Diyor ki: “Grubunuz ikinci seviyeyi yapıyor. Aferin!”' },
            { speaker: 'dora', en: 'We are writing our results at the moment.', tr: 'Şu anda sonuçlarımızı yazıyoruz.' },
            { speaker: 'piko', en: 'Their plan is easy, but our plan is better!', tr: 'Onların planı kolay ama bizimki daha iyi!' },
          ],
          choice: {
            prompt: 'What does Leo do now?',
            options: [
              { text: 'He draws the plant for the poster.', feedback: 'Güzel seçim! Resim Leo’nun gücü, grup da kazanıyor.' },
              { text: 'He helps Momo with the water.', feedback: 'Güzel seçim! Grup çalışması yardımlaşmaktır.' },
            ],
          },
        },
        {
          id: 'sc-end',
          illustration: 'The lab at the end of the lesson: tidy tables, a poster of a plant, Ms Pearl at the door.',
          lines: [
            { speaker: 'narrator', en: 'Break time is near. Everybody cleans their desks.', tr: 'Teneffüs yaklaşıyor. Herkes sırasını temizliyor.' },
            { speaker: 'sasha', en: 'Group work is hard, but learning is fun.', tr: 'Grup çalışması zor ama öğrenmek eğlenceli.' },
            { speaker: 'narrator', en: 'Ms Pearl says: “Your homework is a short report. Write about your experiment.”', tr: 'Ms Pearl diyor ki: “Ödeviniz kısa bir rapor. Deneyinizi yazın.”' },
            { speaker: 'leo', en: 'I usually forget my homework on Friday, but not today!', tr: 'Cuma günleri ödevimi genelde unuturum ama bugün unutmam!' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-usual', type: 'choice', prompt: 'What does Leo usually do in this lesson?', options: ['He measures water.', 'He writes results.', 'He draws.'], answer: 2, hint: 'İlk sahnede Leo ne diyor? “usually” alışkanlık demek.', explain: '“I **usually** draw in this lesson.”: alışkanlık, present simple.', objectiveId: 'u2l2-habit', vocabId: 'v-usually' },
        { id: 'st-q-now', type: 'choice', prompt: 'Right now, Piko is measuring the water.', options: tf, answer: 0, hint: 'Laboratuvar sahnesinde Piko’ya bak.', explain: '“I **am measuring** the water right now.”: şu an, present progressive.', objectiveId: 'u2l2-now', vocabId: 'v-measure' },
        { id: 'st-q-level', type: 'text', prompt: 'Ms Pearl says: “Your group is doing level ___.” Type the number word.', accept: ['two', '2'], hint: 'Üçüncü sahnede Ms Pearl’ın sözüne bak.', explain: 'Grup **level two**, yani ikinci seviyeyi yapıyor.', objectiveId: 'u2l2-activities', vocabId: 'v-level' },
        { id: 'st-q-order', type: 'order', prompt: 'Dora talks about her group. Put her words in order.', tokens: ['at', 'writing', 'are', 'We', 'results', 'the', 'our', 'moment.'], answer: ['We', 'are', 'writing', 'our', 'results', 'at', 'the', 'moment.'], hint: 'We → are → fiil-ing → our + isim → zaman.', explain: 'We **are writing our** results **at the moment**.', objectiveId: 'u2l2-now', vocabId: 'v-result' },
        { id: 'st-q-leader', type: 'choice', prompt: 'Who is the leader of the plant group?', options: ['Momo', 'Piko', 'Sasha'], answer: 2, hint: 'İlk sahnede kim “I am the leader” diyor?', explain: 'Sasha: “I am the leader.”', objectiveId: 'u2l2-activities', vocabId: 'v-project' },
        { id: 'st-q-homework', type: 'choice', prompt: 'What is the homework?', options: ['A poster', 'A short report', 'A new worksheet'], answer: 1, hint: 'Son sahnede Ms Pearl’ın sözüne bak.', explain: 'Ödev: “a short **report**”.', objectiveId: 'u2l2-activities', vocabId: 'v-homework' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-habit',
          title: 'Alışkanlık: present simple',
          body: 'Her gün, her hafta tekrar eden şeyler için **present simple** kullanırsın. **He / she / it** ile fiile **-s** eklenir. Yanında genelde **every day, usually, always** gibi kelimeler olur.',
          examples: [
            { en: 'Leo usually draws in art class.', tr: 'Leo genelde resim dersinde çizim yapar.' },
            { en: 'Sasha makes a plan every Sunday.', tr: 'Sasha her pazar plan yapar.' },
            { en: 'We have science on Friday.', tr: 'Cuma günü fen dersimiz var.' },
          ],
          check: { id: 'ex-check-habit', type: 'choice', prompt: 'Ms Pearl says: “Piko usually ___ his homework at five.”', options: ['is doing', 'do', 'does'], answer: 2, hint: 'Usually bir alışkanlık; Piko için he/she/it kuralı.', explain: 'Alışkanlıkta present simple: Piko usually **does**.', objectiveId: 'u2l2-habit', vocabId: 'v-homework' },
        },
        {
          id: 'ex-now',
          title: 'Şu an: present progressive',
          body: 'Şu anda olan bir şey için **am / is / are + fiil-ing** kullanırsın. Konuşurken gözünle görüyorsan: **Look!** ile başla.',
          examples: [
            { en: 'Look! Momo is mixing water and sand.', tr: 'Bak! Momo su ve kumu karıştırıyor.' },
            { en: 'I am sorting the cards.', tr: 'Kartları ayırıyorum.' },
            { en: 'They are writing their results.', tr: 'Sonuçlarını yazıyorlar.' },
          ],
          check: { id: 'ex-check-now', type: 'choice', prompt: 'Look! Momo ___ water and sand.', options: ['mixes', 'is mixing', 'mix'], answer: 1, hint: 'Look! şu an demek.', explain: 'Şu an için **is mixing**.', objectiveId: 'u2l2-now', vocabId: 'v-mix' },
        },
        {
          id: 'ex-signal',
          title: 'İşaret kelimeleri',
          body: 'Cümledeki küçük kelimeler zamanı söyler. **every day, usually, always, often** = alışkanlık, present simple. **now, right now, at the moment, Look!** = şu an, present progressive.',
          examples: [
            { en: 'Piko measures the plant every day.', tr: 'Piko bitkiyi her gün ölçer.' },
            { en: 'Piko is measuring the plant right now.', tr: 'Piko şu anda bitkiyi ölçüyor.' },
            { en: 'Dora is writing at the moment.', tr: 'Dora şu anda yazıyor.' },
          ],
          check: { id: 'ex-check-signal', type: 'choice', prompt: 'Which words tell you: “This is happening NOW”?', options: ['usually', 'every day', 'right now'], answer: 2, hint: 'Hangisi şu anı gösteriyor?', explain: '**right now** = şu an, present progressive.', objectiveId: 'u2l2-signals', vocabId: 'v-right-now' },
        },
        {
          id: 'ex-choose',
          title: 'Aynı fiil, iki zaman',
          body: 'Aynı fiili iki biçimde kullanabilirsin. İşaret kelimesine bak: tekrar eden bir şey mi, şu an olan bir şey mi?',
          examples: [
            { en: 'Sasha writes notes every day.', tr: 'Sasha her gün not yazar.' },
            { en: 'Sasha is writing notes now.', tr: 'Sasha şimdi not yazıyor.' },
            { en: 'Leo usually draws. Today he is sorting cards.', tr: 'Leo genelde çizim yapar. Bugün kart ayırıyor.' },
          ],
          check: { id: 'ex-check-choose', type: 'choice', prompt: 'Dora ___ her results at the moment.', options: ['is writing', 'writes', 'write'], answer: 0, hint: 'At the moment şu an demek.', explain: 'Şu an: Dora **is writing**.', objectiveId: 'u2l2-signals', vocabId: 'v-at-moment' },
        },
        {
          id: 'ex-state',
          title: 'Durum fiilleri -ing almaz',
          body: '**like, know, love, want** gibi fiiller bir eylem değil, bir durumu söyler. Şu an bile olsa **-ing almazlar**: I **like** science. (“I am liking” denmez.)',
          examples: [
            { en: 'Momo likes experiments.', tr: 'Momo deneyleri sever.' },
            { en: 'Piko knows the answer.', tr: 'Piko cevabı biliyor.' },
            { en: 'I love group work.', tr: 'Grup çalışmasını severim.' },
          ],
          check: { id: 'ex-check-state', type: 'choice', prompt: 'Piko looks at the question. He ___ the answer.', options: ['is knowing', 'knows', 'is know'], answer: 1, hint: 'Know bir durum fiili; -ing yok.', explain: '**know** -ing almaz: Piko **knows** the answer.', objectiveId: 'u2l2-state' },
        },
        {
          id: 'ex-possessive',
          title: 'Kimin? my, your, his, her',
          body: 'Bir şeyin **kime ait** olduğunu söylemek için ismin önüne **iyelik sıfatı** koyarsın: **my** (benim), **your** (senin), **his** (onun, erkek), **her** (onun, kız).',
          examples: [
            { en: 'This is my worksheet.', tr: 'Bu benim çalışma kâğıdım.' },
            { en: 'Where is your lab coat?', tr: 'Senin önlüğün nerede?' },
            { en: 'His cup is empty. Her cup is full.', tr: 'Onun (erkek) bardağı boş. Onun (kız) bardağı dolu.' },
          ],
          check: { id: 'ex-check-possessive', type: 'choice', prompt: 'Piko says: “I have a lab coat. ___ lab coat is white.”', options: ['My', 'I', 'Me'], answer: 0, hint: 'İsmin önüne sahiplik bildiren kelime gelir.', explain: 'Benim önlüğüm = **my** lab coat.', objectiveId: 'u2l2-possessive', vocabId: 'v-lab-coat' },
        },
        {
          id: 'ex-poss-pron',
          title: 'its, our, their ve zamirlerle fark',
          body: '**its** (onun, eşya ya da hayvan), **our** (bizim), **their** (onların). **Özne zamiri** (I, he, we, they) eylemi yapan kişidir. **İyelik sıfatı** (my, his, our, their) isimden önce gelir: **They** work. **Their** project is big.',
          examples: [
            { en: 'The plant is green. Its leaves are small.', tr: 'Bitki yeşil. Yaprakları küçük.' },
            { en: 'We are a group. Our project is about plants.', tr: 'Biz bir grubuz. Projemiz bitkiler hakkında.' },
            { en: 'They are in the lab. Their coats are white.', tr: 'Onlar laboratuvarda. Önlükleri beyaz.' },
          ],
          check: { id: 'ex-check-poss-pron', type: 'choice', prompt: 'Momo and Piko have a plant. ___ plant is small.', options: ['Them', 'Their', 'They'], answer: 1, hint: 'Plant bir isim; önüne sahiplik gelir.', explain: 'İsmin önünde **their**: Their plant.', objectiveId: 'u2l2-possessive' },
        },
        {
          id: 'ex-mix',
          title: 'Hepsini birleştir',
          body: 'Şimdi hepsi bir arada: alışkanlığı present simple ile, şu anı present progressive ile söyle; sahipliği my … their ile ekle.',
          examples: [
            { en: 'We usually do group work on Friday.', tr: 'Cuma günleri genelde grup çalışması yaparız.' },
            { en: 'Right now we are doing our experiment.', tr: 'Şu anda deneyimizi yapıyoruz.' },
            { en: 'Sasha likes her group.', tr: 'Sasha grubunu sever.' },
          ],
          check: { id: 'ex-check-mix', type: 'choice', prompt: 'Look! Sasha and Leo ___ their experiment now.', options: ['do', 'are doing', 'does'], answer: 1, hint: 'Look ve now şu an demek.', explain: 'Şu an için **are doing**.', objectiveId: 'u2l2-now', vocabId: 'v-experiment' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u2l2-habit',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Ms Pearl says: “Piko ___ his homework every day.”', options: ['does', 'do', 'is doing'], answer: 0, hint: 'Every day alışkanlık; Piko = he.', explain: 'Alışkanlık, he ile: Piko **does**.', objectiveId: 'u2l2-habit', vocabId: 'v-homework' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Sasha talks about Leo. Put her words in order.', tokens: ['draws', 'Leo', 'in', 'usually', 'art', 'class.'], answer: ['Leo', 'usually', 'draws', 'in', 'art', 'class.'], hint: 'Usually fiilin önüne gelir.', explain: 'Leo **usually draws** in art class.', objectiveId: 'u2l2-habit' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Momo says: “Sasha does her homework every day.” What does she mean?', options: ['Sasha ödevini şimdi yapıyor.', 'Sasha ödevini her gün yapar.', 'Sasha ödevini sevmez.'], answer: 1, hint: 'every day = her gün', explain: '**every day** alışkanlık: her gün yapar.', objectiveId: 'u2l2-habit', vocabId: 'v-homework' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u2l2-now',
          complete: { id: 'hw-2-complete', type: 'text', prompt: 'Look! Momo is ___ water and sand. (mix) Type the word.', accept: ['mixing'], hint: 'is + fiil-ing. mix + ing.', explain: 'Şu an: is **mixing**.', objectiveId: 'u2l2-now', vocabId: 'v-mix' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Sasha watches Piko. Put her words in order.', tokens: ['the', 'is', 'Piko', 'right', 'measuring', 'water', 'now.'], answer: ['Piko', 'is', 'measuring', 'the', 'water', 'right', 'now.'], hint: 'Kim → is → fiil-ing → ne → right now.', explain: 'Piko **is measuring** the water **right now**.', objectiveId: 'u2l2-now' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Leo says: “Dora is writing her results at the moment.” What does he mean?', options: ['Dora sonuçlarını şu anda yazıyor.', 'Dora sonuçlarını her gün yazar.', 'Dora sonuçlarını yazmayı sever.'], answer: 0, hint: 'at the moment = şu anda', explain: '**at the moment** = şu anda.', objectiveId: 'u2l2-now', vocabId: 'v-result' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u2l2-signals',
          complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Look at Piko in the lab. He is measuring water ___.', options: ['every day', 'usually', 'right now'], answer: 2, hint: 'Is measuring şu an demek.', explain: 'Present progressive ile **right now** gelir.', objectiveId: 'u2l2-signals', vocabId: 'v-right-now' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Dora points at the group. Put her words in order.', tokens: ['working', 'are', 'They', 'now.', 'right'], answer: ['They', 'are', 'working', 'right', 'now.'], hint: 'They → are → fiil-ing → right now.', explain: 'They **are working right now**.', objectiveId: 'u2l2-signals' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Ms Pearl says: “Leo usually draws in art class.” What does she mean?', options: ['Leo şu anda çiziyor.', 'Leo genellikle resim dersinde çizim yapar.', 'Leo resim dersini sevmez.'], answer: 1, hint: 'usually = genellikle', explain: '**usually** = genellikle: alışkanlık.', objectiveId: 'u2l2-signals', vocabId: 'v-usually' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u2l2-state',
          complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Momo smiles in the lab. She ___ experiments.', options: ['is liking', 'likes', 'is like'], answer: 1, hint: 'Like bir durum fiili; -ing almaz.', explain: '**like** -ing almaz: Momo **likes** experiments.', objectiveId: 'u2l2-state', vocabId: 'v-experiment' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Sasha talks about Piko. Put her words in order.', tokens: ['answer.', 'Piko', 'the', 'knows'], answer: ['Piko', 'knows', 'the', 'answer.'], hint: 'Kim → knows → ne?', explain: 'Piko **knows** the answer.', objectiveId: 'u2l2-state' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Leo says: “Sasha knows the plan.” What does he mean?', options: ['Sasha planı öğreniyor.', 'Sasha planı yazıyor.', 'Sasha planı biliyor.'], answer: 2, hint: 'know = bilmek', explain: '**know** = bilmek.', objectiveId: 'u2l2-state', vocabId: 'v-project' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u2l2-possessive',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Leo asks Sasha: “Is this ___ worksheet?”', options: ['you', 'your', 'yours'], answer: 1, hint: 'Worksheet bir isim; önüne sahiplik gelir.', explain: 'Senin = **your**: your worksheet.', objectiveId: 'u2l2-possessive', vocabId: 'v-worksheet' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Piko shows his lab coat. Put his words in order.', tokens: ['my', 'is', 'lab', 'coat.', 'This'], answer: ['This', 'is', 'my', 'lab', 'coat.'], hint: 'This is → my → isim.', explain: 'This is **my** lab coat.', objectiveId: 'u2l2-possessive' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Ms Pearl asks Momo: “Where is your worksheet?” What does she ask?', options: ['Çalışma kâğıdın nerede?', 'Çalışma kâğıdı kimde?', 'Çalışma kâğıdın var mı?'], answer: 0, hint: 'your = senin', explain: '**your** = senin: Senin çalışma kâğıdın nerede?', objectiveId: 'u2l2-possessive', vocabId: 'v-worksheet' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u2l2-possessive',
          complete: { id: 'hw-6-complete', type: 'text', prompt: 'Sasha has a plant. ___ plant is green. Type the word.', accept: ['Her'], hint: 'Sasha bir kız; onun = ?', explain: 'Kız için **her**: Her plant.', objectiveId: 'u2l2-possessive', vocabId: 'v-project' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Momo points at Dora’s group. Put her words in order.', tokens: ['group', 'next', 'Her', 'is', 'our', 'to', 'group.'], answer: ['Her', 'group', 'is', 'next', 'to', 'our', 'group.'], hint: 'Her / our + isim.', explain: '**Her** group is next to **our** group.', objectiveId: 'u2l2-possessive' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Piko looks at the plant: “Its leaves are small.” What does he mean?', options: ['Yaprakları büyük.', 'Yaprakları küçük.', 'Bitkisi küçük.'], answer: 1, hint: 'its = onun (eşya/hayvan), leaves = yapraklar', explain: '**its** leaves = yaprakları: küçük.', objectiveId: 'u2l2-possessive' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u2l2-possessive',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Momo and Piko are in the lab. ___ lab coats are white.', options: ['Their', 'They', 'Them'], answer: 0, hint: 'Lab coats bir isim; önüne sahiplik gelir.', explain: 'Onların = **their**: Their lab coats.', objectiveId: 'u2l2-possessive', vocabId: 'v-lab-coat' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Leo talks about his group. Put his words in order.', tokens: ['doing', 'Our', 'is', 'group', 'the', 'experiment.'], answer: ['Our', 'group', 'is', 'doing', 'the', 'experiment.'], hint: 'Our + isim → is doing.', explain: '**Our** group is doing the experiment.', objectiveId: 'u2l2-possessive' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Dora says: “Their project is about plants.” What does she mean?', options: ['Bizim projemiz bitkiler hakkında.', 'Onların projesi bitkiler hakkında.', 'Senin projen bitkiler hakkında.'], answer: 1, hint: 'their = onların', explain: '**their** = onların.', objectiveId: 'u2l2-possessive', vocabId: 'v-project' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u2l2-activities',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Ms Pearl gives the class a ___ with ten questions.', options: ['result', 'level', 'worksheet'], answer: 2, hint: 'Kâğıdın üstünde sorular var.', explain: 'Sorulu kâğıt = **worksheet**.', objectiveId: 'u2l2-activities', vocabId: 'v-worksheet' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Leo describes his job. Put his words in order.', tokens: ['cards.', 'the', 'sorts', 'Leo'], answer: ['Leo', 'sorts', 'the', 'cards.'], hint: 'Kim → sorts → ne?', explain: 'Leo **sorts** the cards.', objectiveId: 'u2l2-activities' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Sasha says: “Piko measures the water.” What does she mean?', options: ['Piko suyu ölçüyor.', 'Piko suyu karıştırıyor.', 'Piko suyu döküyor.'], answer: 0, hint: 'measure = ölçmek', explain: '**measure** = ölçmek.', objectiveId: 'u2l2-activities', vocabId: 'v-measure' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u2l2-now',
          complete: { id: 'hw-9-complete', type: 'choice', prompt: 'Leo usually draws, but today he ___ an experiment.', options: ['does', 'is doing', 'do'], answer: 1, hint: 'Today = bugün, şu an yapılan.', explain: 'Bugün, şu an: he **is doing**.', objectiveId: 'u2l2-now', vocabId: 'v-activity' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Ms Pearl looks at the class. Put her words in order.', tokens: ['are', 'Today', 'their', 'they', 'doing', 'experiment.'], answer: ['Today', 'they', 'are', 'doing', 'their', 'experiment.'], hint: 'Today → they are doing → their + isim.', explain: 'Today they **are doing their** experiment.', objectiveId: 'u2l2-now' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Sasha says: “Group work is hard, but learning is fun.” What does she mean?', options: ['Grup çalışması eğlenceli.', 'Grup çalışması zor ama öğrenmek eğlenceli.', 'Öğrenmek zor.'], answer: 1, hint: 'hard = zor, fun = eğlenceli', explain: '**hard** = zor, **fun** = eğlenceli.', objectiveId: 'u2l2-activities', vocabId: 'v-learning' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-habit', type: 'choice', prompt: 'Leo ___ in the art room every Tuesday.', options: ['draws', 'is drawing', 'draw'], answer: 0, objectiveId: 'u2l2-habit' },
        { id: 'as-now', type: 'choice', prompt: 'Listen! Dora ___ in the lab right now.', options: ['talk', 'talks', 'is talking'], answer: 2, objectiveId: 'u2l2-now' },
        { id: 'as-signal', type: 'choice', prompt: 'Which phrase goes with a habit?', options: ['at the moment', 'right now', 'every Friday'], answer: 2, objectiveId: 'u2l2-signals', vocabId: 'v-usually' },
        { id: 'as-know', type: 'text', prompt: 'Piko looks at the question. Type the verb: “Piko ___ the answer. (know)”', accept: ['knows'], objectiveId: 'u2l2-state' },
        { id: 'as-love', type: 'choice', prompt: 'Piko ___ science. It is his favourite lesson.', options: ['loves', 'love', 'is loving'], answer: 0, objectiveId: 'u2l2-state' },
        { id: 'as-her', type: 'choice', prompt: 'Dora has a notebook. ___ notebook is blue.', options: ['His', 'Its', 'She', 'Her'], answer: 3, objectiveId: 'u2l2-possessive' },
        { id: 'as-our', type: 'choice', prompt: 'Sasha says: “We are a group. ___ project is about plants.”', options: ['We', 'Us', 'Our', 'Their'], answer: 2, objectiveId: 'u2l2-possessive', vocabId: 'v-project' },
        { id: 'as-order', type: 'order', prompt: 'Look! Make Leo’s sentence about Momo.', tokens: ['her', 'is', 'Momo', 'sand', 'mixing', 'in', 'cup.'], answer: ['Momo', 'is', 'mixing', 'sand', 'in', 'her', 'cup.'], objectiveId: 'u2l2-now', vocabId: 'v-mix' },
        { id: 'as-its', type: 'choice', prompt: 'Sasha looks at the plant: “The plant is green. ___ leaves are small.”', options: ['Its', 'It', 'His', 'Their'], answer: 0, objectiveId: 'u2l2-possessive' },
        { id: 'as-meaning', type: 'choice', prompt: 'Ms Pearl says: “Your homework is a short report.” What does she mean?', options: ['Ödeviniz bir poster.', 'Ödeviniz uzun bir sınav.', 'Ödeviniz kısa bir rapor.'], answer: 2, objectiveId: 'u2l2-activities', vocabId: 'v-homework' },
        { id: 'as-measuring', type: 'text', prompt: 'Right now Sasha ___ the water. Type the two missing words. (measure)', accept: ['is measuring', '’s measuring', '\'s measuring'], objectiveId: 'u2l2-now', vocabId: 'v-measure' },
        { id: 'as-experiment', type: 'choice', prompt: 'Sasha writes “deney” on the board. What is it in English?', options: ['worksheet', 'level', 'project', 'experiment'], answer: 3, objectiveId: 'u2l2-activities', vocabId: 'v-experiment' },
      ],
      reading: {
        title: 'Project Day at Our School',
        paragraphs: [
          'Every Friday, our class has a project day. Ms Pearl gives each group a worksheet and an activity. Today our activity is an experiment in the science lab.',
          'Right now, Sasha’s group is measuring water. Sasha is the leader. Piko is writing the numbers, and Momo is mixing water and sand. Her cup is full, and she is very careful today.',
          'Dora’s group is at the next table. They usually finish early, but today they are working slowly. Everybody likes the project because learning is fun. Their homework is a short report.',
        ],
        questions: [
          { id: 'rd-tf-friday', type: 'choice', prompt: 'The class has a project day every Friday.', options: tf, answer: 0, objectiveId: 'u2l2-habit', vocabId: 'v-project' },
          { id: 'rd-tf-piko', type: 'choice', prompt: 'Piko is mixing water and sand.', options: tf, answer: 1, objectiveId: 'u2l2-now', vocabId: 'v-mix' },
          { id: 'rd-tf-leader', type: 'choice', prompt: 'Momo is the leader of the group.', options: tf, answer: 1, objectiveId: 'u2l2-now' },
          { id: 'rd-tf-dora', type: 'choice', prompt: 'Dora’s group usually finishes early.', options: tf, answer: 0, objectiveId: 'u2l2-habit', vocabId: 'v-usually' },
          { id: 'rd-tf-homework', type: 'choice', prompt: 'Their homework is a poster.', options: tf, answer: 1, objectiveId: 'u2l2-activities', vocabId: 'v-homework' },
          { id: 'rd-fill-measure', type: 'choice', prompt: 'Right now, Sasha’s group ___ water.', options: ['measure', 'measures', 'is measuring', 'measuring'], answer: 2, objectiveId: 'u2l2-now', vocabId: 'v-measure' },
          { id: 'rd-fill-her', type: 'choice', prompt: 'Momo is mixing water and sand. ___ cup is full.', options: ['Her', 'She', 'Hers', 'Their'], answer: 0, objectiveId: 'u2l2-possessive' },
          { id: 'rd-fill-likes', type: 'choice', prompt: 'Everybody ___ the project because learning is fun.', options: ['like', 'is liking', 'is like', 'likes'], answer: 3, objectiveId: 'u2l2-state' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'v-activity', 'v-experiment', 'v-project', 'v-level', 'v-sort', 'v-worksheet',
              'v-homework', 'v-right-now', 'v-at-moment', 'v-usually', 'v-measure', 'v-result',
              'rv-howoften', 'rv-twice', 'rv-quietly', 'rv-well',
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
              { id: 'vs-activity', line: { speaker: 'leo', en: 'Our activity today is an experiment.', tr: 'Bugünkü etkinliğimiz bir deney.' }, emphasis: ['activity', 'experiment'] },
              { id: 'vs-project', line: { speaker: 'sasha', en: 'Our project is about plants.', tr: 'Projemiz bitkiler hakkında.' }, emphasis: ['project'] },
              { id: 'vs-level', line: { speaker: 'piko', en: 'This worksheet has three levels.', tr: 'Bu çalışma kâğıdının üç seviyesi var.' }, emphasis: ['worksheet', 'levels'] },
              {
                id: 'vs-sort',
                line: { speaker: 'momo', en: 'I sort the cards into two groups.', tr: 'Kartları iki gruba ayırıyorum.' },
                emphasis: ['sort'],
                joke: { tr: 'Laboratuvar deneyi güvenli ama Momo’nun elindeki bardak için kimse söz veremez!' },
              },
              { id: 'vs-group', line: { speaker: 'leo', en: 'Group work makes learning fun.', tr: 'Grup çalışması öğrenmeyi eğlenceli yapar.' }, emphasis: ['Group work', 'learning'] },
              { id: 'vs-measure', line: { speaker: 'piko', en: 'I measure the water and write the result.', tr: 'Suyu ölçüyorum ve sonucu yazıyorum.' }, emphasis: ['measure', 'result'] },
              { id: 'vs-coat', line: { speaker: 'dora', en: 'I wear my lab coat and safety glasses.', tr: 'Önlüğümü ve koruyucu gözlüğümü takıyorum.' }, emphasis: ['lab coat', 'safety glasses'] },
              { id: 'vs-homework', line: { speaker: 'leo', en: 'Our homework is a short report.', tr: 'Ödevimiz kısa bir rapor.' }, emphasis: ['homework'] },
            ],
            vocabRefs: [
              'v-activity', 'v-experiment', 'v-project', 'v-level', 'v-sort', 'v-learning', 'v-group-work', 'v-worksheet',
              'v-homework', 'v-right-now', 'v-at-moment', 'v-usually', 'v-mix', 'v-measure', 'v-lab-coat', 'v-safety-glasses', 'v-result',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-activity', 'v-experiment', 'v-level', 'v-sort', 'v-worksheet', 'v-measure'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-friday', line: { speaker: 'narrator', en: 'It is Friday. Today the class has project day.', tr: 'Bugün cuma. Sınıfın proje günü var.' } },
              { id: 'ps-leo', line: { speaker: 'leo', en: 'I usually draw in this lesson. Today I am in the lab!', tr: 'Bu derste genelde resim yaparım. Bugün laboratuvardayım!' }, emphasis: ['usually', 'am in'], gate: 'st-q-usual' },
              { id: 'ps-piko', line: { speaker: 'piko', en: 'I am measuring the water right now. I know the numbers!', tr: 'Şu anda suyu ölçüyorum. Sayıları biliyorum!' }, emphasis: ['am measuring', 'right now'], gate: 'st-q-now' },
              { id: 'ps-momo', line: { speaker: 'momo', en: 'I am mixing water and sand. Oops, my cup is empty!', tr: 'Su ve kumu karıştırıyorum. Eyvah, bardağım boş!' }, emphasis: ['my cup'] },
              { id: 'ps-dora', line: { speaker: 'dora', en: 'We are writing our results at the moment.', tr: 'Şu anda sonuçlarımızı yazıyoruz.' }, emphasis: ['at the moment'] },
              { id: 'ps-end', line: { speaker: 'sasha', en: 'Group work is hard, but learning is fun.', tr: 'Grup çalışması zor ama öğrenmek eğlenceli.' } },
            ],
            choice: {
              prompt: 'What does Leo do now?',
              options: [
                { text: 'He draws the plant for the poster.', feedback: 'Güzel seçim! Resim Leo’nun gücü, grup da kazanıyor.' },
                { text: 'He helps Momo with the water.', feedback: 'Güzel seçim! Grup çalışması yardımlaşmaktır.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-habit',
                target: 'card-every-day',
                hint: { fine: 'every day, usually, always: tekrar eden şey. Present simple kullan, he/she ile -s ekle.', big: 'Leo usually draws. Alışkanlık, bu yüzden draws.' },
                stepRef: 'ex-habit',
              },
              {
                id: 'g-now',
                target: 'card-right-now',
                hint: { fine: 'now, right now, at the moment, Look!: şu an. am / is / are + fiil-ing kullan.', big: 'Leo is drawing right now. Şu an, bu yüzden is drawing.' },
                joke: { tr: 'Present simple “hep böyle!” der, present progressive “ama şu an bak!” diye elini kaldırır.' },
                stepRef: 'ex-now',
              },
              {
                id: 'g-possessive',
                target: 'card-my-your',
                hint: { fine: 'my, your, his, her, its, our, their ismin önüne gelir: my lab coat.', big: 'They özne, their iyelik: They work. Their project is big.' },
                stepRef: 'ex-possessive',
              },
            ],
            goNoGo: {
              rule: { tr: 'Şu an olan bir cümle görürsen dokun. Her gün olan bir cümleyse dokunma!', tapIf: 'now' },
              warmup: [
                { id: 'w-leo-now', text: 'Leo is drawing right now.', tap: true, why: 'right now: şu an' },
                { id: 'w-leo-every', text: 'Leo draws every day.', tap: false, why: 'every day: alışkanlık' },
                { id: 'w-look', text: 'Look! Piko is measuring.', tap: true, why: 'Look! + is measuring: şu an' },
                { id: 'w-always', text: 'Sasha always wears her lab coat.', tap: false, why: 'always: alışkanlık' },
              ],
              round: [
                { id: 'r-mixing', text: 'Sasha is mixing the water now.', tap: true, why: 'now: şu an' },
                { id: 'r-homework', text: 'Piko does his homework every day.', tap: false, why: 'every day: alışkanlık' },
                { id: 'r-measuring', text: 'Momo is measuring the plant right now.', tap: true, why: 'right now: şu an' },
                { id: 'r-draws', text: 'Leo usually draws in art class.', tap: false, why: 'usually: alışkanlık' },
                { id: 'r-sorting', text: 'Look! The group is sorting the cards.', tap: true, why: 'Look! + is sorting: şu an' },
                { id: 'r-friday', text: 'We work in groups every Friday.', tap: false, why: 'every Friday: alışkanlık' },
                { id: 'r-writing', text: 'At the moment, they are writing their results.', tap: true, why: 'at the moment: şu an' },
                { id: 'r-coat', text: 'Dora always wears her lab coat.', tap: false, why: 'always: alışkanlık' },
                { id: 'r-checking', text: 'Ms Pearl is checking the worksheets.', tap: true, why: 'is checking: şu an' },
                { id: 'r-monday', text: 'The class usually has science on Monday.', tap: false, why: 'usually: alışkanlık' },
              ],
              onWrongTap: { anim: 'sneeze', line: 'Hapşu! Bu sefer “şu an” cümlesini bekliyordum.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-complete', sceneObject: 'lab-table', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'beaker', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-4-complete', sceneObject: 'microscope', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-complete', sceneObject: 'worksheet-desk' },
              { ref: 'hw-7-complete', sceneObject: 'lab-coat-hook', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-9-order' },
            ],
            hint: { fine: 'Önce işaret kelimesine bak: her gün mü, şu an mı? Sonra doğru zamanı ya da my / our / their’i seç.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-habit', 'as-now', 'as-signal', 'as-know', 'as-love', 'as-her',
              'as-our', 'as-order', 'as-its', 'as-meaning', 'as-measuring', 'as-experiment',
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
            frame: 'Right now, our group is ___ the ___.',
            chips: [
              { id: 'c-measuring', en: 'measuring', tr: 'ölçüyor', kind: 'verb' },
              { id: 'c-mixing', en: 'mixing', tr: 'karıştırıyor', kind: 'verb' },
              { id: 'c-sorting', en: 'sorting', tr: 'ayırıyor', kind: 'verb' },
              { id: 'c-writing', en: 'writing', tr: 'yazıyor', kind: 'verb' },
              { id: 'c-water', en: 'water', tr: 'su', kind: 'noun' },
              { id: 'c-cards', en: 'cards', tr: 'kartlar', kind: 'noun' },
              { id: 'c-results', en: 'results', tr: 'sonuçlar', kind: 'noun' },
              { id: 'c-plant', en: 'plant', tr: 'bitki', kind: 'noun' },
            ],
            collection: { title: 'Proje Günü Defterim' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Alışkanlık (present simple, every day / usually) ile şu an (present progressive, now / right now / at the moment) ayrımı; durum fiilleri (like, know, love) -ing almaz; iyelik sıfatları my, your, his, her, its, our, their ve özne zamiriyle farkı. Sınıf etkinliği kelimeleri.',
    vocabulary: [
      'activity', 'experiment', 'project', 'level', 'sort the cards', 'learning', 'group work', 'worksheet', 'homework',
      'right now', 'at the moment', 'usually', 'mix water and sand', 'measure', 'lab coat', 'safety glasses', 'result',
    ],
    grammar: [
      'Present simple: alışkanlık (every day, usually, always, often); he / she / it + -s',
      'Present progressive: şu an (now, right now, at the moment, Look!); am / is / are + fiil-ing',
      'Durum fiilleri (like, know, love, want) -ing almaz',
      'Possessive adjectives: my, your, his, her, its, our, their + isim',
    ],
    expectedDifficulties: [
      'Türkçede “-iyor” hem alışkanlığı hem şu anı karşılar (“Resim yapıyorum”); öğrenci her ikisi için present progressive kullanmaya eğilimlidir.',
      '“I am knowing / liking” gibi durum fiillerine -ing eklemek.',
      'his / her ayrımı: Türkçede “onun” cinsiyetsiz olduğu için sahibin cinsiyetine bakmayı unutmak.',
      'Özne zamiri ile iyelik sıfatını karıştırmak: “They project is big.”',
      'its yazımında kesme işareti (it’s) ile karışması.',
      'Üçüncü tekil kişide present simple -s unutmak: “Leo usually draw.”',
    ],
    commonErrors: [
      { error: 'I am liking science.', correction: 'I like science. Durum fiilleri -ing almaz.' },
      { error: 'Leo is drawing every Friday.', correction: 'Leo draws every Friday. Every Friday alışkanlık, present simple.' },
      { error: 'Look! Momo mixes water.', correction: 'Look! Momo is mixing water. Look! şu an demek.' },
      { error: 'They project is about plants.', correction: 'Their project is about plants. İsimden önce their.' },
      { error: 'Sasha has a plant. His plant is green.', correction: 'Her plant is green. Kız için her.' },
      { error: 'The plant is green. It’s leaves are small.', correction: 'Its leaves are small. İyelikte kesme işareti yok.' },
    ],
    questionsToAsk: [
      'What do you usually do in English class? (gerçek ya da hayali cevap)',
      'What is Sasha doing in the lab right now?',
      'Is “I am knowing the answer” correct? Why not?',
      'Whose worksheet is this? (my / your / his / her)',
    ],
    speakingPrompts: [
      'Habit: “Leo usually draws in art class.”',
      'Now: “Piko is measuring the water right now.”',
      'Contrast: “I usually do group work, but today I am doing an experiment.”',
      'Ownership: “This is my worksheet. Their project is about plants.”',
      'State verb: “I like science. I know the answer.”',
    ],
    rolePlay: {
      situation: 'Proje günü: Ms Pearl laboratuvarda gruplara dolaşıp ne yaptıklarını ve her zaman neler yaptıklarını soruyor.',
      roles: ['Ms Pearl (öğretmen)', 'Sasha (grup lideri)', 'Piko (ölçüm yapan)', 'Öğrenci (sen ya da hayali bir öğrenci)'],
      steps: [
        'Ms Pearl sorar: “What are you doing right now?” Öğrenci: “I am sorting the cards.”',
        'Ms Pearl sorar: “What do you usually do on Friday?” Öğrenci: “I usually do group work.”',
        'Öğrenci Sasha’ya sorar: “Is this your worksheet?” Sasha: “Yes, it is. It is my worksheet.”',
        'Roller değişir; öğrenci Ms Pearl olur ve iki gruba “What is your group doing?” diye sorar.',
      ],
    },
    listening: {
      script:
        'It is Friday, and it is project day. Leo usually draws in art class, but today he is in the science lab. Sasha is the leader of her group. She is checking the worksheet right now. Piko is measuring the water, and Momo is mixing water and sand. Her cup is full today. Dora’s group is at the next table. They are writing their results at the moment. Every Friday, the class has a project. Everybody likes it, because learning in a group is fun. Their homework is a short report.',
      questions: [
        'What does Leo usually do? (He draws.)',
        'What is Piko doing right now? (He is measuring the water.)',
        'Who is the leader of the group? (Sasha.)',
        'What is Dora’s group doing at the moment? (They are writing their results.)',
        'What is the homework? (A short report.)',
      ],
    },
    reinforcement: [
      'İki sütunlu tablo: “every day” ve “right now”. Öğrenci verilen cümleleri doğru sütuna yazar ve fiili düzeltir.',
      'Pandomim: öğretmen bir eylemi yapar, öğrenci “You are mixing.” der; sonra “You usually mix on Friday.” ile alışkanlığa çevirir.',
      'İyelik kartları: my, your, his, her, its, our, their kartlarını sınıf eşyalarıyla eşleştir (“This is our worksheet.”).',
    ],
    suggestedActivities: [
      'Sınıf fotoğrafı betimlemesi: öğrenci bir sınıf resmine bakıp beş “is / are + fiil-ing” cümlesi ve iki alışkanlık cümlesi yazar.',
      'Mini deney: bardakta su ve kum karıştır; öğrenci ne yaptığını sesli anlatır (“I am mixing …”).',
      'Doğru-yanlış turu: öğretmen “I am knowing…” gibi bozuk cümleler söyler, öğrenci düzeltir.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Isınma sorusu: “What do you usually do on Friday?” (gerçek ya da hayali cevap)',
        'Isınma sorusu: “What is the teacher doing right now?” (Ms Pearl ya da hayali bir öğretmen)',
        'Karakter seç: “Who is your favourite: Piko, Sasha, Momo, Dora or Leo?” (“He is funny.”)',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları (activity, experiment, project, worksheet, group work…): öğrenci kartı görür, bir cümleyle anlatır.',
        'Laboratuvar pandomimi: öğretmen measure, mix, sort eylemlerini yapar; öğrenci “You are measuring.” der.',
        'İşaret kelimesi kartları: every day, usually, right now, at the moment; öğrenci kartı zaman çizgisine koyar.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen bir cümleyi söyler (“Leo draws every day.”), öğrenci “şimdi” için çevirir (“Leo is drawing now.”).',
        'Tur 2: durum fiilleri: öğrenci like, know, love ile üç cümle kurar; öğretmen “-ing?” diye sorar.',
        'Tur 3: my / your / his / her / its / our / their: öğretmen bir eşyayı gösterir, öğrenci sahibini söyler.',
        'Hatırlatma (1 dk): sıklık kalıpları (twice a week) ve zarflar (slowly, well) 2.1’den.',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Proje günü rol oyunu: Ms Pearl gruplara sorar, öğrenci Sasha ya da Piko olur; sonra roller değişir.',
        'Beklenen cümleler: “What are you doing right now? — We are mixing water and sand.” “What do you usually do? — I usually draw.”',
        'Öğretmen notu: Hata olursa sonunda topluca düzelt; rol oyununu bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'It is Friday, and it is project day. Leo usually draws in art class, but today he is in the science lab. Sasha is the leader of her group. She is checking the worksheet right now. Piko is measuring the water, and Momo is mixing water and sand. Her cup is full today. Dora’s group is at the next table. They are writing their results at the moment. Every Friday, the class has a project. Everybody likes it, because learning in a group is fun. Their homework is a short report.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin.',
        'Sorular: What does Leo usually do? What is Piko doing right now? Who is the leader? What is the homework?',
        'Öğrenci bir kişiyi seçip hem alışkanlığını hem şu an yaptığını söyler.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık yaptığı hatayı (alışkanlık / şu an karışması, durum fiilinde -ing, his / her) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: işaret kelimesini görüp doğru zamanı seçmek, like / know ile -ing kullanmamak.',
        '“Sakın tıklama” sözlü turu: öğretmen cümle söyler, öğrenci “now mı, every day mi?” der. Yanlışta nazikçe “Yaklaştın!” de, sonra doğrusunu birlikte kur.',
      ],
    },
    freeSpeaking: {
      minutes: 8,
      activities: [
        'Konu 1: Sınıfında her gün neler olur? “We usually … every day.” (gerçek ya da hayali cevap verebilirsin)',
        'Konu 2: Şu an sınıfta ne oluyor? “My friend is …” (bir Lugu karakteri ya da “my friend”)',
        'Konu 3: Bir proje günü planla: “Our project is about … Our group is …”',
        'Konu 4: En sevdiğin etkinlik: “I like … I know …” (durum fiilleri)',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı, telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: Bir sınıf etkinliği (gerçek ya da hayali) hakkında altı cümle yaz ya da sesli kaydet: iki alışkanlık (usually / every …), iki şu an cümlesi (right now / at the moment), iki iyelik cümlesi (my / our / their).',
    },
  },
}
export default lesson
