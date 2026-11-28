/** Ünite 1.1 — New Term, New Class: personal pronouns + am/is/are, a / an / the. Theme u4-school-bell, host sasha. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.1 — New Term, New Class',
  sourceNotes:
    'Kitap Ünite 1 (School Life): kişi zamirleri + am/is/are, a / an / the. Kelimeler: teacher, student, principal, term, leader, manager, listener (kitap); classmate, class president, English teacher, PE teacher, timetable (ek). Kitap çıktısı: kendini ve okulunu tanıtır, okul çalışanlarının görevlerini söyler. Tenis unvanı: Ms Pearl öğrenciyi "our tennis player" diye tanıtır.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'New Term, New Class',
      tagline: 'Yeni dönemin ilk günü! Bayrak töreni, ders programı, yeni sınıf arkadaşların ve kendini tanıtma anı seni bekliyor.',
      theme: 'School life',
      character: 'sasha',
      level: 'A1',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u1l1-be', text: 'I, you, he, she, it, we, they ile am / is / are kullanır.' },
        { id: 'u1l1-neg-q', text: 'am not / isn’t / aren’t ile olumsuz cümle kurar; “Are you …? Is she …?” sorularını sorar ve cevaplar.' },
        { id: 'u1l1-articles', text: 'a, an ve the sözcüklerini doğru seçer (sesine göre a / an, bilinen şey için the).' },
        { id: 'u1l1-roles', text: 'Okul çalışanlarını ve görevlerini söyler: principal, English teacher, PE teacher, class president, leader, manager, listener.' },
        { id: 'u1l1-intro', text: 'Kendini ve sınıfını tanıtır: “I am a tennis player. We are in 6-A.”' },
        { id: 'u1l1-school', text: 'Yeni dönem kelimelerini kullanır: term, timetable, classmate, flag ceremony.' },
      ],
      grammar: [
        'I am, you are, he / she / it is, we / you / they are',
        'am not, isn’t, aren’t; Are you …? Is she …? Yes, I am. / No, she isn’t.',
        'a / an (sese göre) ve the (bilinen şey)',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-she-is', type: 'choice', prompt: 'Sasha points at Dora in the playground: “___ is in the playground.”', options: ['He', 'She', 'It'], answer: 1, hint: 'Dora bir kız. Kız için hangisi?', explain: 'Kız için **she**, yanına **is** gelir: She is in the playground.', objectiveId: 'u1l1-be' },
        { id: 'rv-it-is', type: 'choice', prompt: 'Momo looks at the canteen and says: “___ is noisy!”', options: ['It', 'He', 'She'], answer: 0, hint: 'Kantin bir yer, yani bir şey.', explain: 'Yer ve eşya için **it** deriz: It is noisy.', objectiveId: 'u1l1-be' },
        { id: 'rv-isnt', type: 'choice', prompt: 'Leo is in the library, not in the canteen. “He ___ in the canteen.”', options: ['is', 'isn’t', 'are'], answer: 1, hint: 'Leo kantinde mi? Değil.', explain: 'Değil demek için **isn’t** yazarız: He isn’t in the canteen.', objectiveId: 'u1l1-be' },
        { id: 'rv-is-q', type: 'choice', prompt: 'Piko asks about Ms Pearl: “___ she in the classroom?”', options: ['Are', 'Is', 'Am'], answer: 1, hint: 'She ile hangi kapıcı gelir? Soruda başa geçer.', explain: 'Soruda kapıcı öne geçer: **Is** she in the classroom?', objectiveId: 'u1l1-be' },
      ],
    },
    vocabulary: [
      { id: 'v-new-term', en: 'new term', tr: 'yeni dönem', example: { en: 'It is the first day of the new term.', tr: 'Yeni dönemin ilk günü.' }, context: 'Okullar eylülde ve şubatta yeni bir döneme (term) başlar.', difficulty: 1, objectiveId: 'u1l1-school' },
      { id: 'v-first-day', en: 'first day', tr: 'ilk gün', example: { en: 'Today is the first day.', tr: 'Bugün ilk gün.' }, difficulty: 1, objectiveId: 'u1l1-school' },
      { id: 'v-flag-ceremony', en: 'flag ceremony', tr: 'bayrak töreni', example: { en: 'The flag ceremony is on Monday morning.', tr: 'Bayrak töreni pazartesi sabahı.' }, context: 'Pazartesi sabahları okul bahçesinde yapılır.', difficulty: 2, objectiveId: 'u1l1-school' },
      { id: 'v-timetable', en: 'timetable', tr: 'ders programı', example: { en: 'The timetable is on the wall.', tr: 'Ders programı duvarda.' }, difficulty: 2, objectiveId: 'u1l1-school' },
      { id: 'v-desk', en: 'desk', tr: 'sıra, masa', example: { en: 'My desk is next to the window.', tr: 'Sıram pencerenin yanında.' }, difficulty: 1, objectiveId: 'u1l1-school' },
      { id: 'v-classmate', en: 'classmate', tr: 'sınıf arkadaşı', example: { en: 'Dora is my classmate.', tr: 'Dora benim sınıf arkadaşım.' }, difficulty: 1, objectiveId: 'u1l1-intro' },
      { id: 'v-student', en: 'student', tr: 'öğrenci', example: { en: 'You are a new student in 6-A.', tr: 'Sen 6-A’da yeni bir öğrencisin.' }, context: '“a student”: s sesi ünsüz olduğu için a gelir.', difficulty: 1, objectiveId: 'u1l1-roles' },
      { id: 'v-teacher', en: 'teacher', tr: 'öğretmen', example: { en: 'Ms Pearl is our teacher.', tr: 'Ms Pearl bizim öğretmenimiz.' }, difficulty: 1, objectiveId: 'u1l1-roles' },
      { id: 'v-english-teacher', en: 'English teacher', tr: 'İngilizce öğretmeni', example: { en: 'Ms Pearl is an English teacher.', tr: 'Ms Pearl bir İngilizce öğretmeni.' }, context: 'English sesli harfle başlar: an English teacher.', difficulty: 2, objectiveId: 'u1l1-articles' },
      { id: 'v-class-teacher', en: 'class teacher', tr: 'sınıf rehber öğretmeni', example: { en: 'She is also our class teacher.', tr: 'O aynı zamanda sınıf rehber öğretmenimiz.' }, difficulty: 2, objectiveId: 'u1l1-roles' },
      { id: 'v-pe-teacher', en: 'PE teacher', tr: 'beden eğitimi öğretmeni', example: { en: 'Mr Aydın is the PE teacher.', tr: 'Mr Aydın beden eğitimi öğretmeni.' }, context: 'PE “pi-i” diye okunur, ünsüz sesiyle başlar: a PE teacher.', difficulty: 2, objectiveId: 'u1l1-roles' },
      { id: 'v-principal', en: 'principal', tr: 'okul müdürü', example: { en: 'Mrs Demir is the principal of our school.', tr: 'Mrs Demir okulumuzun müdürü.' }, difficulty: 2, objectiveId: 'u1l1-roles' },
      { id: 'v-class-president', en: 'class president', tr: 'sınıf başkanı', example: { en: 'Sasha is the class president.', tr: 'Sasha sınıf başkanı.' }, difficulty: 2, objectiveId: 'u1l1-roles' },
      { id: 'v-leader', en: 'leader', tr: 'lider, önder', example: { en: 'A good leader is kind.', tr: 'İyi bir lider nazik olur.' }, difficulty: 2, objectiveId: 'u1l1-roles' },
      { id: 'v-manager', en: 'manager', tr: 'yönetici, sorumlu', example: { en: 'The canteen manager is friendly.', tr: 'Kantin sorumlusu cana yakın.' }, context: 'Bir yerin ya da takımın işlerinden sorumlu kişi.', difficulty: 3, objectiveId: 'u1l1-roles' },
      { id: 'v-listener', en: 'listener', tr: 'iyi dinleyen kişi', example: { en: 'Leo is a good listener.', tr: 'Leo iyi bir dinleyici.' }, difficulty: 2, objectiveId: 'u1l1-roles' },
      { id: 'v-tennis-player', en: 'tennis player', tr: 'tenisçi', example: { en: 'You are a tennis player.', tr: 'Sen bir tenisçisin.' }, difficulty: 1, objectiveId: 'u1l1-intro' },
      { id: 'v-welcome', en: 'Welcome!', tr: 'Hoş geldin!', example: { en: 'Welcome to our class!', tr: 'Sınıfımıza hoş geldin!' }, context: 'Yeni gelen birini karşılarken söylenir.', difficulty: 1, objectiveId: 'u1l1-intro' },
      { id: 'v-excited', en: 'excited', tr: 'heyecanlı', example: { en: 'We are excited about the new term.', tr: 'Yeni dönem için heyecanlıyız.' }, difficulty: 2, objectiveId: 'u1l1-intro' },
      { id: 'v-nervous', en: 'nervous', tr: 'tedirgin, gergin', example: { en: 'I am a little nervous today.', tr: 'Bugün biraz tedirginim.' }, context: 'Yeni bir şeyin öncesinde hissedilen gerginlik; çok doğal bir duygu.', difficulty: 2, objectiveId: 'u1l1-intro' },
    ],
    story: {
      title: 'The First Monday',
      character: 'sasha',
      setting: 'The first Monday of the new term: flag ceremony, class 6-A, timetable, canteen',
      scenes: [
        {
          id: 'sc-flag',
          illustration: 'Monday morning in the school garden: rows of students, a big flag, Mrs Demir at the microphone, Sasha, Dora and Momo waving at you.',
          lines: [
            { speaker: 'narrator', en: 'It is Monday morning. It is the first day of the new term.', tr: 'Pazartesi sabahı. Yeni dönemin ilk günü.' },
            { speaker: 'narrator', en: 'The students are in the school garden for the flag ceremony.', tr: 'Öğrenciler bayrak töreni için okul bahçesinde.' },
            { speaker: 'narrator', en: 'Mrs Demir says: “Good morning, students! Welcome to the new term!”', tr: 'Mrs Demir diyor ki: “Günaydın öğrenciler! Yeni döneme hoş geldiniz!”' },
            { speaker: 'sasha', en: 'Psst! I am Sasha. You are in our line. You are in 6-A, right?', tr: 'Pst! Ben Sasha. Sen bizim sıradasın. 6-A’dasın, değil mi?' },
            { speaker: 'momo', en: 'I am Momo. I am early today. It is a miracle!', tr: 'Ben Momo. Bugün erkenim. Bu bir mucize!' },
            { speaker: 'dora', en: 'Hi, I am Dora. We are all in 6-A. We are your classmates!', tr: 'Selam, ben Dora. Hepimiz 6-A’dayız. Biz senin sınıf arkadaşlarınız!' },
          ],
        },
        {
          id: 'sc-class',
          illustration: 'Classroom 6-A: a colourful timetable on the wall, Ms Pearl at the board, Leo drawing in his notebook, Piko at the next desk.',
          lines: [
            { speaker: 'narrator', en: 'The classroom is bright. The timetable is on the wall.', tr: 'Sınıf aydınlık. Ders programı duvarda.' },
            { speaker: 'leo', en: 'English is first today. Ms Pearl is our English teacher.', tr: 'Bugün ilk ders İngilizce. Ms Pearl bizim İngilizce öğretmenimiz.' },
            { speaker: 'piko', en: 'She is also our class teacher. Mr Aydın is our PE teacher.', tr: 'O aynı zamanda sınıf rehber öğretmenimiz. Mr Aydın da beden eğitimi öğretmenimiz.' },
            { speaker: 'narrator', en: 'Ms Pearl says: “Good morning, 6-A! I am your English teacher.”', tr: 'Ms Pearl diyor ki: “Günaydın 6-A! Ben sizin İngilizce öğretmeninizim.”' },
            { speaker: 'momo', en: 'Wow, the timetable is full. Monday is long!', tr: 'Vay, ders programı dolu. Pazartesi çok uzun!' },
          ],
        },
        {
          id: 'sc-tennis',
          illustration: 'Ms Pearl stands next to you at the front of the class. Everyone smiles. Dora gives you a thumbs up.',
          lines: [
            { speaker: 'narrator', en: 'Ms Pearl says: “Class, we have a new classmate today.”', tr: 'Ms Pearl diyor ki: “Sınıf, bugün yeni bir sınıf arkadaşımız var.”' },
            { speaker: 'narrator', en: 'Ms Pearl says: “This is our tennis player! She is first in the province.”', tr: 'Ms Pearl diyor ki: “Bu bizim tenisçimiz! O, ilde birinci.”' },
            { speaker: 'dora', en: 'Tennis? Wow! I am a tennis player too. We are a team!', tr: 'Tenis mi? Vay! Ben de tenisçiyim. Biz bir takımız!' },
            { speaker: 'piko', en: 'Are you nervous? I am nervous on the first day, too.', tr: 'Tedirgin misin? Ben de ilk gün tedirginim.' },
            { speaker: 'narrator', en: 'You are a little nervous, but you are happy, too.', tr: 'Biraz tedirginsin ama mutlusun da.' },
          ],
          choice: {
            prompt: 'What do you say to the class?',
            options: [
              { text: 'I am a tennis player. Nice to meet you!', feedback: 'Harika! Kendini tanıtmak için “I am …” yeter.' },
              { text: 'Thank you! I am excited.', feedback: 'Çok güzel! Teşekkür edip duygunu söylemek de çok doğal.' },
            ],
          },
        },
        {
          id: 'sc-break',
          illustration: 'The busy canteen at break time: toast, simit and tea, the five friends at one table.',
          lines: [
            { speaker: 'narrator', en: 'It is break time. The canteen is full of students.', tr: 'Teneffüs zamanı. Kantin öğrencilerle dolu.' },
            { speaker: 'sasha', en: 'I am the class president. We are a good team!', tr: 'Ben sınıf başkanıyım. Biz iyi bir takımız!' },
            { speaker: 'leo', en: 'I am a good listener. I am not noisy.', tr: 'Ben iyi bir dinleyiciyim. Gürültücü değilim.' },
            { speaker: 'momo', en: 'The canteen manager is very kind. The toast is hot!', tr: 'Kantin sorumlusu çok nazik. Tost sıcak!' },
            { speaker: 'sasha', en: 'You are one of us now. Welcome to 6-A!', tr: 'Artık bizdensin. 6-A’ya hoş geldin!' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-where', type: 'choice', prompt: 'At the flag ceremony, Mrs Demir is at the microphone. Where are the students?', options: ['In the canteen', 'In the school garden', 'In the library'], answer: 1, hint: 'İlk sahnenin ikinci satırına bak: öğrenciler nerede?', explain: 'Bayrak töreni için öğrenciler **school garden**’da: “They are in the school garden.”', objectiveId: 'u1l1-school', vocabId: 'v-flag-ceremony' },
        { id: 'st-q-pearl', type: 'text', prompt: 'Ms Pearl says: “I ___ your English teacher.” Type the missing word.', accept: ['am'], hint: 'Konuşan kişi kendinden bahsediyor: I.', explain: '**I** ile **am** gelir: I am your English teacher.', objectiveId: 'u1l1-be', vocabId: 'v-english-teacher' },
        { id: 'st-q-pe', type: 'choice', prompt: 'Leo reads the timetable. Who is the PE teacher?', options: ['Ms Pearl', 'Mrs Demir', 'Mr Aydın'], answer: 2, hint: 'Piko ikinci sahnede söylüyor: “Mr … is our PE teacher.”', explain: 'Beden eğitimi öğretmeni **Mr Aydın**.', objectiveId: 'u1l1-roles', vocabId: 'v-pe-teacher' },
        { id: 'st-q-order', type: 'order', prompt: 'Piko asks you a question on the first day. Put his words in order.', tokens: ['you', 'nervous?', 'Are'], answer: ['Are', 'you', 'nervous?'], hint: 'Soruda am / is / are başa geçer.', explain: 'Soruda kapıcı öne geçer: **Are** you nervous?', objectiveId: 'u1l1-neg-q', vocabId: 'v-nervous' },
        { id: 'st-q-tennis', type: 'choice', prompt: 'Dora says: “I am ___ tennis player too.”', options: ['an', 'a', 'is'], answer: 1, hint: 'tennis, t sesiyle başlıyor: ünsüz mü, ünlü mü?', explain: 'Ünsüz sesiyle başlayan sözcükten önce **a**: a tennis player.', objectiveId: 'u1l1-articles', vocabId: 'v-tennis-player' },
        { id: 'st-q-manager', type: 'choice', prompt: 'Momo is at the canteen: “The canteen manager is very kind.” Is it true?', options: tf, answer: 0, hint: 'Son sahnede Momo ne diyor? kind = nazik', explain: 'Momo kantin sorumlusu için “very kind” diyor, yani doğru.', objectiveId: 'u1l1-roles', vocabId: 'v-manager' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-i-you',
          title: 'Ben ve sen: I am, you are',
          body: 'Yeni sınıfa girdin ve kendini tanıtıyorsun. Kendin için **I**, karşındaki için **you** dersin. **I** ile **am**, **you** ile **are** gelir. Kısaltması: I’m, you’re.',
          examples: [
            { en: 'I am Sasha.', tr: 'Ben Sasha’yım.' },
            { en: 'You are in 6-A.', tr: 'Sen 6-A’dasın.' },
            { en: 'I’m excited!', tr: 'Heyecanlıyım!' },
          ],
          check: { id: 'ex-check-i-you', type: 'choice', prompt: 'Dora says to you: “You ___ our new classmate.”', options: ['is', 'are', 'am'], answer: 1, hint: 'Dora karşısındaki kişiyle konuşuyor: you.', explain: '**You** ile **are** gelir: You are our new classmate.', objectiveId: 'u1l1-be' },
        },
        {
          id: 'ex-he-she-it',
          title: 'Başkaları: he, she, it',
          body: 'Bir erkek için **he**, bir kız için **she**, bir şey için **it** dersin. Üçüyle de **is** gelir. Kısaltması: he’s, she’s, it’s.',
          examples: [
            { en: 'He is the PE teacher.', tr: 'O, beden eğitimi öğretmeni.' },
            { en: 'She is the principal.', tr: 'O, okul müdürü.' },
            { en: 'It is a new timetable.', tr: 'O, yeni bir ders programı.' },
          ],
          check: { id: 'ex-check-he-she', type: 'choice', prompt: 'Piko points at Mr Aydın: “___ is the PE teacher.”', options: ['She', 'He', 'It'], answer: 1, hint: 'Mr Aydın bir erkek.', explain: 'Erkek için **he**: He is the PE teacher.', objectiveId: 'u1l1-be', vocabId: 'v-pe-teacher' },
        },
        {
          id: 'ex-we-they',
          title: 'Birden fazla kişi: we, you, they',
          body: 'Kendin de aralarındaysan **we**, başkalarıysa **they** dersin. **We**, **you** ve **they** ile hep **are** gelir.',
          examples: [
            { en: 'We are classmates.', tr: 'Biz sınıf arkadaşlarıyız.' },
            { en: 'You are students.', tr: 'Siz öğrencisiniz.' },
            { en: 'They are in the canteen.', tr: 'Onlar kantinde.' },
          ],
          check: { id: 'ex-check-we-they', type: 'choice', prompt: 'Leo and Piko are in the canteen. Sasha says: “___ are hungry.”', options: ['They', 'We', 'She'], answer: 0, hint: 'Sasha konuşuyor ama Leo ve Piko’dan bahsediyor. Sasha onlardan biri değil.', explain: 'Başkaları için **they**: They are hungry.', objectiveId: 'u1l1-be' },
        },
        {
          id: 'ex-negative',
          title: 'Değil demek: am not, isn’t, aren’t',
          body: 'Bir şey öyle değilse **not** eklersin. **I am not**, **he / she / it isn’t**, **we / you / they aren’t**. Kısaltma yalnız is ve are için: isn’t, aren’t.',
          examples: [
            { en: 'I am not late.', tr: 'Geç kalmadım.' },
            { en: 'Ms Pearl isn’t the principal.', tr: 'Ms Pearl müdür değil.' },
            { en: 'We aren’t in the library.', tr: 'Biz kütüphanede değiliz.' },
          ],
          check: { id: 'ex-check-negative', type: 'choice', prompt: 'Momo is in the canteen. She ___ in the classroom.', options: ['isn’t', 'is', 'aren’t'], answer: 0, hint: 'Momo sınıfta mı? Değil.', explain: 'Sınıfta değil: She **isn’t** in the classroom.', objectiveId: 'u1l1-neg-q' },
        },
        {
          id: 'ex-question',
          title: 'Soru sormak: Are you …? Is she …?',
          body: 'Soru için am / is / are cümlenin başına geçer: **Are** you …? **Is** she …? Cevap kısa: **Yes, I am.** ya da **No, she isn’t.** Kısa cevapta fiili atma.',
          examples: [
            { en: 'Are you in 6-A?', tr: '6-A’da mısın?' },
            { en: 'Yes, I am.', tr: 'Evet, öyleyim.' },
            { en: 'Is Ms Pearl the principal? No, she isn’t.', tr: 'Ms Pearl müdür mü? Hayır, değil.' },
          ],
          check: { id: 'ex-check-question', type: 'choice', prompt: 'Sasha asks you on the first day: “___ you a new student?”', options: ['Are', 'Is', 'Am'], answer: 0, hint: 'You ile hangi kapıcı gelir?', explain: 'You ile **are**, soruda başa geçer: **Are** you a new student?', objectiveId: 'u1l1-neg-q', vocabId: 'v-student' },
        },
        {
          id: 'ex-a-an',
          title: 'a mı, an mı? Yazıya değil, sese bak',
          body: 'Ünsüz sesiyle başlayan sözcükten önce **a**, ünlü sesiyle başlayandan önce **an** gelir. Harfe değil sese bak: **an English** teacher, **a** PE teacher (PE “pi” diye okunur), **a** uniform (“yu” diye okunur).',
          examples: [
            { en: 'a student', tr: 'bir öğrenci' },
            { en: 'an English teacher', tr: 'bir İngilizce öğretmeni' },
            { en: 'a PE teacher', tr: 'bir beden eğitimi öğretmeni' },
          ],
          check: { id: 'ex-check-a-an', type: 'choice', prompt: 'Ms Pearl is ___ English teacher.', options: ['a', 'the', 'an'], answer: 2, hint: 'English hangi sesle başlıyor? “İng…”', explain: 'English ünlü sesiyle başlar: **an** English teacher.', objectiveId: 'u1l1-articles', vocabId: 'v-english-teacher' },
        },
        {
          id: 'ex-the',
          title: 'the: ikimizin de bildiği şey',
          body: 'Bir şeyden ilk kez söz ediyorsan **a / an**, ikimiz de hangisi olduğunu biliyorsak **the** dersin. Okulda tek müdür var: **the** principal. Tek sınıf başkanı var: **the** class president.',
          examples: [
            { en: 'Sasha is a student. She is the class president.', tr: 'Sasha bir öğrenci. O, sınıf başkanı.' },
            { en: 'The timetable is on the wall.', tr: 'Ders programı duvarda. (hangisi olduğu belli)' },
            { en: 'Mrs Demir is the principal.', tr: 'Mrs Demir okulun müdürü.' },
          ],
          check: { id: 'ex-check-the', type: 'choice', prompt: 'Our school has only one principal. Dora says: “Mrs Demir is ___ principal.”', options: ['a', 'an', 'the'], answer: 2, hint: 'Okulda tek müdür var, hangisi olduğu belli.', explain: 'Hangisi olduğu belliyse **the**: the principal.', objectiveId: 'u1l1-articles', vocabId: 'v-principal' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u1l1-intro',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'Ms Pearl writes on the board: “Introduce yourself: I ___ a tennis player.”', options: ['is', 'am', 'are'], answer: 1, hint: 'Kendinden bahsediyorsun: I.', explain: '**I** ile **am** gelir: I am a tennis player.', objectiveId: 'u1l1-intro', vocabId: 'v-tennis-player' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Ms Pearl asks you to introduce yourself. Build your sentence.', tokens: ['tennis', 'am', 'a', 'I', 'player.'], answer: ['I', 'am', 'a', 'tennis', 'player.'], hint: 'Kim? → am → a + ne?', explain: 'I am a tennis player.', objectiveId: 'u1l1-intro' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Dora reads your name card: “I am a tennis player.” What does it mean?', options: ['Sen bir tenisçisin.', 'Ben bir tenisçiyim.', 'O bir tenisçi.'], answer: 1, hint: 'I = ben', explain: '**I am** = ben ... yım/im: Ben bir tenisçiyim.', objectiveId: 'u1l1-intro', vocabId: 'v-tennis-player' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u1l1-be',
          complete: { id: 'hw-2-complete', type: 'text', prompt: 'Momo says to you: “You ___ in 6-A now!” Type the missing word.', accept: ['are'], hint: 'You ile hangi kelime gelir? Kısaltması “’re”.', explain: '**You** ile **are** gelir: You are in 6-A now.', objectiveId: 'u1l1-be' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Momo writes a welcome note for you. Put the words in order.', tokens: ['are', 'You', 'now!', 'in', '6-A'], answer: ['You', 'are', 'in', '6-A', 'now!'], hint: 'Kim? → are → nerede?', explain: 'You are in 6-A now!', objectiveId: 'u1l1-be' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Momo says: “You are in 6-A now!” What does she mean?', options: ['Artık 6-A’dayız.', 'Artık 6-A’dayım.', 'Artık 6-A’dasın.'], answer: 2, hint: 'You = sen', explain: '**You are** = sensin: Artık 6-A’dasın.', objectiveId: 'u1l1-be' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u1l1-roles',
          complete: { id: 'hw-3-complete', type: 'choice', prompt: 'Dora points at Mr Aydın in the gym: “___ is the PE teacher.”', options: ['He', 'She', 'It'], answer: 0, hint: 'Mr Aydın bir erkek.', explain: 'Erkek için **he**: He is the PE teacher.', objectiveId: 'u1l1-roles', vocabId: 'v-pe-teacher' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Leo tells you about Ms Pearl. Build his sentence.', tokens: ['is', 'Ms', 'teacher.', 'class', 'the', 'Pearl'], answer: ['Ms', 'Pearl', 'is', 'the', 'class', 'teacher.'], hint: 'Ms Pearl → is → the class teacher', explain: 'Ms Pearl is the class teacher.', objectiveId: 'u1l1-roles' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Leo says: “She is our class teacher.” What does he mean?', options: ['O bizim sınıf rehber öğretmenimiz.', 'O bizim okul müdürümüz.', 'O bizim sınıf başkanımız.'], answer: 0, hint: 'class teacher = sınıf rehber öğretmeni', explain: 'class teacher = sınıf rehber öğretmeni.', objectiveId: 'u1l1-roles', vocabId: 'v-class-teacher' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u1l1-be',
          complete: { id: 'hw-4-complete', type: 'text', prompt: 'Piko says to Leo: “We ___ classmates.” Type the missing word.', accept: ['are'], hint: 'We, you ve they ile aynı kelime gelir.', explain: '**We** ile **are** gelir: We are classmates.', objectiveId: 'u1l1-be', vocabId: 'v-classmate' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Sasha points at Dora and Momo in the canteen. Put her words in order.', tokens: ['canteen.', 'are', 'in', 'They', 'the'], answer: ['They', 'are', 'in', 'the', 'canteen.'], hint: 'Onlar → are → nerede?', explain: 'They are in the canteen.', objectiveId: 'u1l1-be' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Sasha says: “They are in the canteen.” What does she mean?', options: ['Biz kantindeyiz.', 'Onlar kantinde.', 'Siz kantindesiniz.'], answer: 1, hint: 'They = onlar', explain: '**They are** = onlar ... lar: Onlar kantinde.', objectiveId: 'u1l1-be' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u1l1-neg-q',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Momo is early on Monday. She says: “I ___ late today!”', options: ['am not', 'isn’t', 'aren’t'], answer: 0, hint: 'I ile hangi olumsuz biçim gelir? Kısaltması yok.', explain: '**I** için **am not** yazarız: I am not late.', objectiveId: 'u1l1-neg-q' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Ms Pearl says something about Mrs Demir. Put the words in order.', tokens: ['isn’t', 'the', 'Pearl', 'Ms', 'principal.'], answer: ['Ms', 'Pearl', 'isn’t', 'the', 'principal.'], hint: 'Ms Pearl → isn’t → the principal', explain: 'Ms Pearl isn’t the principal.', objectiveId: 'u1l1-neg-q' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Leo says: “We aren’t late.” What does he mean?', options: ['Sen geç değilsin.', 'Biz geç değiliz.', 'O geç değil.'], answer: 1, hint: 'We = biz, aren’t = değil', explain: '**We aren’t** = biz ... değiliz: Biz geç değiliz.', objectiveId: 'u1l1-neg-q' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u1l1-neg-q',
          complete: { id: 'hw-6-complete', type: 'choice', prompt: 'Piko asks you: “___ you a new student?”', options: ['Is', 'Am', 'Are'], answer: 2, hint: 'You ile hangi kapıcı gelir? Soruda başa geçer.', explain: '**You** ile **are**: **Are** you a new student?', objectiveId: 'u1l1-neg-q', vocabId: 'v-student' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Dora asks you a question. Put her words in order.', tokens: ['6-A?', 'you', 'in', 'Are'], answer: ['Are', 'you', 'in', '6-A?'], hint: 'Soru am / is / are ile başlar.', explain: 'Are you in 6-A?', objectiveId: 'u1l1-neg-q' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Dora asks: “Is Sasha the class president?” What does she ask?', options: ['Sasha sınıf başkanı mı?', 'Sasha sınıf başkanı.', 'Sasha sınıf başkanı değil.'], answer: 0, hint: 'Is ile başlıyor: bu bir soru.', explain: '**Is** ile başlayan cümle soru: Sasha sınıf başkanı mı?', objectiveId: 'u1l1-neg-q', vocabId: 'v-class-president' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u1l1-articles',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Dora says: “Mr Aydın is ___ PE teacher.” (PE: “pi-i”)', options: ['an', 'a', 'am'], answer: 1, hint: 'PE hangi sesle başlıyor? “pi…”', explain: 'PE “pi” diye okunur, ünsüz sesi: **a** PE teacher.', objectiveId: 'u1l1-articles', vocabId: 'v-pe-teacher' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Ms Pearl writes a sentence about Sasha. Build it.', tokens: ['is', 'Sasha', 'a', 'student.'], answer: ['Sasha', 'is', 'a', 'student.'], hint: 'Kim → is → a + ne?', explain: 'Sasha is a student.', objectiveId: 'u1l1-articles' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Ms Pearl says: “Piko is an excited student.” What does she mean?', options: ['Piko heyecanlı bir öğrenci.', 'Piko sınıf başkanı.', 'Piko tedirgin bir öğrenci.'], answer: 0, hint: 'excited = heyecanlı', explain: 'excited = heyecanlı. **An** excited student: ünlü sesi.', objectiveId: 'u1l1-articles', vocabId: 'v-excited' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u1l1-articles',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Piko points at the timetable on the wall: “___ timetable is new.”', options: ['A', 'An', 'The'], answer: 2, hint: 'İkisi de hangi ders programından söz edildiğini biliyor.', explain: 'Hangisi olduğu belli: **The** timetable is new.', objectiveId: 'u1l1-articles', vocabId: 'v-timetable' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Momo talks about the class leader. Put her words in order.', tokens: ['class', 'Sasha', 'is', 'president.', 'the'], answer: ['Sasha', 'is', 'the', 'class', 'president.'], hint: 'Sasha → is → the + ne?', explain: 'Sasha is the class president.', objectiveId: 'u1l1-articles' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Momo says: “Sasha is the class president.” What does she mean?', options: ['Sasha sınıf başkanı.', 'Sasha İngilizce öğretmeni.', 'Sasha okul müdürü.'], answer: 0, hint: 'class president = sınıf başkanı', explain: 'class president = sınıf başkanı.', objectiveId: 'u1l1-articles', vocabId: 'v-class-president' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u1l1-roles',
          complete: { id: 'hw-9-complete', type: 'choice', prompt: 'Mrs Demir is the boss of the whole school. She is the ___.', options: ['classmate', 'timetable', 'principal'], answer: 2, hint: 'Okulun en üst yöneticisi kim?', explain: 'Okulun müdürü: **principal**.', objectiveId: 'u1l1-roles', vocabId: 'v-principal' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Leo points at Mrs Demir in the garden. Put his words in order.', tokens: ['principal.', 'is', 'Mrs', 'the', 'Demir'], answer: ['Mrs', 'Demir', 'is', 'the', 'principal.'], hint: 'Mrs Demir → is → the principal', explain: 'Mrs Demir is the principal.', objectiveId: 'u1l1-roles' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Momo says: “Leo is a good listener.” What does she mean?', options: ['Leo iyi bir lider.', 'Leo iyi bir dinleyici.', 'Leo iyi bir sorumlu.'], answer: 1, hint: 'listener = dinleyen kişi', explain: 'listener = dinleyen kişi: Leo iyi bir dinleyici.', objectiveId: 'u1l1-roles', vocabId: 'v-listener' },
        },
        {
          id: 'hw-10',
          objectiveId: 'u1l1-school',
          complete: { id: 'hw-10-complete', type: 'choice', prompt: 'Momo looks at the ___ on the wall: “English is first on Monday.”', options: ['timetable', 'principal', 'listener'], answer: 0, hint: 'Derslerin gün gün yazıldığı kâğıt.', explain: 'Dersleri gösteren program: **timetable**.', objectiveId: 'u1l1-school', vocabId: 'v-timetable' },
          order: { id: 'hw-10-order', type: 'order', prompt: 'Sasha talks about the new term. Put her words in order.', tokens: ['first', 'It', 'is', 'day.', 'the'], answer: ['It', 'is', 'the', 'first', 'day.'], hint: 'It → is → the first day', explain: 'It is the first day.', objectiveId: 'u1l1-school' },
          meaning: { id: 'hw-10-meaning', type: 'choice', prompt: 'Sasha says: “The flag ceremony is on Monday.” What does she mean?', options: ['Ders programı Pazartesi.', 'Bayrak töreni pazartesi.', 'Sınav pazartesi.'], answer: 1, hint: 'flag ceremony = bayrak töreni', explain: 'flag ceremony = bayrak töreni.', objectiveId: 'u1l1-school', vocabId: 'v-flag-ceremony' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-principal', type: 'choice', prompt: 'Mrs Demir is at the flag ceremony. She is the school ___.', options: ['listener', 'classmate', 'principal'], answer: 2, objectiveId: 'u1l1-roles', vocabId: 'v-principal' },
        { id: 'as-you-are', type: 'choice', prompt: 'Sasha looks at you and says: “___ are our new classmate!”', options: ['You', 'I', 'He', 'She'], answer: 0, objectiveId: 'u1l1-be' },
        { id: 'as-i-am', type: 'text', prompt: 'Piko is excited on Monday. Type the missing word: “I ___ so excited!”', accept: ['am'], objectiveId: 'u1l1-be', vocabId: 'v-excited' },
        { id: 'as-we-are', type: 'choice', prompt: 'Sasha, Dora and Momo are friends. Sasha says: “Dora, Momo and I are a team. ___ are friends.”', options: ['They', 'We', 'She'], answer: 1, objectiveId: 'u1l1-be' },
        { id: 'as-an', type: 'choice', prompt: 'Momo says: “I am ___ excited student today.”', options: ['a', 'an', 'the'], answer: 1, objectiveId: 'u1l1-articles', vocabId: 'v-excited' },
        { id: 'as-order-q', type: 'order', prompt: 'Leo asks Piko about the teacher. Make his question.', tokens: ['the', 'Is', 'teacher?', 'Ms', 'class', 'Pearl'], answer: ['Is', 'Ms', 'Pearl', 'the', 'class', 'teacher?'], objectiveId: 'u1l1-neg-q', vocabId: 'v-class-teacher' },
        { id: 'as-isnt', type: 'choice', prompt: 'Dora is in the gym, not in the canteen. “She ___ in the canteen.”', options: ['aren’t', 'am not', 'isn’t'], answer: 2, objectiveId: 'u1l1-neg-q' },
        { id: 'as-timetable-en', type: 'choice', prompt: 'Ms Pearl writes “ders programı” on the board. What is it in English?', options: ['principal', 'term', 'timetable', 'manager'], answer: 2, objectiveId: 'u1l1-school', vocabId: 'v-timetable' },
        { id: 'as-meaning-neg', type: 'choice', prompt: 'Piko says: “They aren’t in the library.” What does Piko mean?', options: ['Onlar kütüphanede.', 'Onlar kütüphanede değil.', 'Biz kütüphanede değiliz.'], answer: 1, objectiveId: 'u1l1-neg-q' },
        { id: 'as-short-answer', type: 'choice', prompt: 'Piko asks you: “Are you in 6-A?” You are in 6-A. Choose your answer.', options: ['Yes, you are.', 'Yes, I is.', 'Yes, I am.'], answer: 2, objectiveId: 'u1l1-neg-q' },
        { id: 'as-she-text', type: 'text', prompt: 'Sasha is the class president. Type the missing word: “___ is the leader of 6-A.”', accept: ['She'], objectiveId: 'u1l1-roles', vocabId: 'v-leader' },
        { id: 'as-tennis-meaning', type: 'choice', prompt: 'Ms Pearl says: “She is our tennis player.” What does she mean?', options: ['O bizim tenisçimiz.', 'O bizim öğretmenimiz.', 'O okulun müdürü.'], answer: 0, objectiveId: 'u1l1-intro', vocabId: 'v-tennis-player' },
      ],
      reading: {
        title: 'Welcome to 6-A!',
        paragraphs: [
          'Hello, everyone! I am Sasha, the class president of 6-A. It is the first day of the new term. We are excited and a little nervous. Welcome to our class!',
          'Our English teacher is Ms Pearl. She is our class teacher, too. Mr Aydın is the PE teacher. He is also a tennis coach. Mrs Demir is the principal of our school. She is very kind.',
          'We have a new classmate today. She is a tennis player! Dora is a tennis player, too. Leo is a good listener, and Momo is very funny. The timetable is on the wall. English is first on Monday. We are a team!',
        ],
        questions: [
          { id: 'rd-tf-principal', type: 'choice', prompt: 'Sasha is the principal of the school.', options: tf, answer: 1, objectiveId: 'u1l1-roles', vocabId: 'v-principal' },
          { id: 'rd-tf-excited', type: 'choice', prompt: 'The students of 6-A are excited about the new term.', options: tf, answer: 0, objectiveId: 'u1l1-school', vocabId: 'v-excited' },
          { id: 'rd-tf-pe', type: 'choice', prompt: 'Mr Aydın is the PE teacher.', options: tf, answer: 0, objectiveId: 'u1l1-roles', vocabId: 'v-pe-teacher' },
          { id: 'rd-tf-momo', type: 'choice', prompt: 'Momo is a tennis player.', options: tf, answer: 1, objectiveId: 'u1l1-intro', vocabId: 'v-tennis-player' },
          { id: 'rd-tf-timetable', type: 'choice', prompt: 'The timetable is on the wall.', options: tf, answer: 0, objectiveId: 'u1l1-school', vocabId: 'v-timetable' },
          { id: 'rd-fill-an', type: 'choice', prompt: 'Ms Pearl is ___ English teacher.', options: ['a', 'the', 'an', 'am'], answer: 2, objectiveId: 'u1l1-articles', vocabId: 'v-english-teacher' },
          { id: 'rd-fill-she', type: 'choice', prompt: 'Mrs Demir is the principal. ___ is very kind.', options: ['He', 'She', 'It', 'They'], answer: 1, objectiveId: 'u1l1-be' },
          { id: 'rd-fill-they', type: 'choice', prompt: 'Sasha, Dora, Leo and Momo are in 6-A. ___ are classmates.', options: ['They', 'We', 'He', 'It'], answer: 0, objectiveId: 'u1l1-be', vocabId: 'v-classmate' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'rv-she-is', 'rv-it-is', 'rv-isnt', 'rv-is-q',
              'v-new-term', 'v-first-day', 'v-flag-ceremony', 'v-timetable', 'v-desk', 'v-classmate',
              'v-student', 'v-teacher', 'v-principal', 'v-welcome',
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
              { id: 'vs-term', line: { speaker: 'sasha', en: 'It is the first day of the new term.', tr: 'Yeni dönemin ilk günü.' }, emphasis: ['new term'] },
              { id: 'vs-flag', line: { speaker: 'leo', en: 'The flag ceremony is on Monday.', tr: 'Bayrak töreni pazartesi.' }, emphasis: ['flag ceremony'] },
              {
                id: 'vs-timetable',
                line: { speaker: 'momo', en: 'The timetable is on the wall.', tr: 'Ders programı duvarda.' },
                emphasis: ['timetable'],
                joke: { tr: 'Ders programı pazartesi sabahı en çok bakılan, en az sevilen kâğıttır.' },
              },
              { id: 'vs-english', line: { speaker: 'dora', en: 'Ms Pearl is an English teacher.', tr: 'Ms Pearl bir İngilizce öğretmeni.' }, emphasis: ['English teacher'] },
              { id: 'vs-pe', line: { speaker: 'sasha', en: 'Mr Aydın is the PE teacher.', tr: 'Mr Aydın beden eğitimi öğretmeni.' }, emphasis: ['PE teacher'] },
              { id: 'vs-principal', line: { speaker: 'leo', en: 'Mrs Demir is the principal.', tr: 'Mrs Demir okul müdürü.' }, emphasis: ['principal'] },
              { id: 'vs-president', line: { speaker: 'piko', en: 'Sasha is the class president.', tr: 'Sasha sınıf başkanı.' }, emphasis: ['class president'] },
              { id: 'vs-listener', line: { speaker: 'sasha', en: 'Leo is a good listener.', tr: 'Leo iyi bir dinleyici.' }, emphasis: ['listener'] },
            ],
            vocabRefs: [
              'v-new-term', 'v-first-day', 'v-flag-ceremony', 'v-timetable', 'v-desk', 'v-classmate', 'v-student', 'v-teacher',
              'v-english-teacher', 'v-class-teacher', 'v-pe-teacher', 'v-principal', 'v-class-president', 'v-leader',
              'v-manager', 'v-listener', 'v-tennis-player', 'v-welcome', 'v-excited', 'v-nervous',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-timetable', 'v-principal', 'v-class-president', 'v-classmate', 'v-pe-teacher', 'v-listener', 'v-flag-ceremony'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-monday', line: { speaker: 'narrator', en: 'It is Monday. It is the first day of the new term.', tr: 'Pazartesi. Yeni dönemin ilk günü.' } },
              { id: 'ps-garden', line: { speaker: 'narrator', en: 'The students are in the school garden.', tr: 'Öğrenciler okul bahçesinde.' }, gate: 'st-q-where' },
              { id: 'ps-pearl', line: { speaker: 'narrator', en: 'Ms Pearl says: “I am your English teacher.”', tr: 'Ms Pearl diyor ki: “Ben sizin İngilizce öğretmeninizim.”' }, gate: 'st-q-pearl' },
              { id: 'ps-tennis', line: { speaker: 'narrator', en: 'Ms Pearl says: “This is our tennis player!”', tr: 'Ms Pearl diyor ki: “Bu bizim tenisçimiz!”' }, emphasis: ['tennis player'] },
              { id: 'ps-dora', line: { speaker: 'dora', en: 'I am a tennis player too. We are a team!', tr: 'Ben de tenisçiyim. Biz bir takımız!' }, gate: 'st-q-tennis' },
              { id: 'ps-welcome', line: { speaker: 'sasha', en: 'You are one of us now. Welcome to 6-A!', tr: 'Artık bizdensin. 6-A’ya hoş geldin!' } },
            ],
            choice: {
              prompt: 'What do you say to the class?',
              options: [
                { text: 'I am a tennis player. Nice to meet you!', feedback: 'Harika! Kendini tanıtmak için “I am …” yeter.' },
                { text: 'Thank you! I am excited.', feedback: 'Çok güzel! Teşekkür edip duygunu söylemek de çok doğal.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-be',
                target: 'card-i-you',
                hint: { fine: 'Kendin için I, karşındaki için you. Hangi kelime onlarla gelir?', big: 'I ile am, you ile are. He, she, it ile is gelir.' },
                stepRef: 'ex-i-you',
              },
              {
                id: 'g-an',
                target: 'card-an',
                hint: { fine: 'Harfe değil, sese bak: ünlü sesi için an, ünsüz sesi için a.', big: 'an English teacher, a PE teacher: PE “pi” diye okunur.' },
                joke: { tr: 'PE’ye “an” desen, “Ben pi diye okunurum, a’yı çağır!” diye itiraz eder.' },
                stepRef: 'ex-a-an',
              },
              {
                id: 'g-question',
                target: 'card-question',
                hint: { fine: 'Soruda am / is / are başa geçer.', big: 'Are you in 6-A? Cevap: Yes, I am. ya da No, I’m not.' },
                stepRef: 'ex-question',
              },
            ],
            goNoGo: {
              rule: { tr: 'Sözcük ünlü sesiyle başlıyorsa (an) dokun. Ünsüz sesiyle başlıyorsa (a) dokunma!', tapIf: 'an' },
              warmup: [
                { id: 'w-english', text: 'English teacher', tap: true, why: 'English ünlü sesiyle başlar -> an' },
                { id: 'w-student', text: 'student', tap: false, why: 's ünsüz sesi -> a' },
                { id: 'w-old', text: 'old classroom', tap: true, why: 'old ünlü sesiyle başlar -> an' },
                { id: 'w-timetable', text: 'timetable', tap: false, why: 't ünsüz sesi -> a' },
              ],
              round: [
                { id: 'r-eraser', text: 'eraser', tap: true, why: 'eraser ünlü sesiyle başlar -> an' },
                { id: 'r-notebook', text: 'notebook', tap: false, why: 'n ünsüz sesi -> a' },
                { id: 'r-art', text: 'art room', tap: true, why: 'art ünlü sesiyle başlar -> an' },
                { id: 'r-president', text: 'class president', tap: false, why: 'class ünsüz sesiyle başlar -> a' },
                { id: 'r-umbrella', text: 'umbrella', tap: true, why: 'umbrella ünlü sesiyle başlar -> an' },
                { id: 'r-pe', text: 'PE teacher', tap: false, why: 'PE “pi” diye okunur, ünsüz sesi -> a' },
                { id: 'r-uniform', text: 'uniform', tap: false, why: 'uniform “yu” diye başlar, ünsüz sesi -> a' },
                { id: 'r-excited', text: 'excited student', tap: true, why: 'excited ünlü sesiyle başlar -> an' },
                { id: 'r-leader', text: 'leader', tap: false, why: 'l ünsüz sesi -> a' },
                { id: 'r-idea', text: 'idea', tap: true, why: 'idea ünlü sesiyle başlar -> an' },
              ],
              onWrongTap: { anim: 'candy-pop', line: 'Pop! Harfe değil, sese kulak ver.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-order', sceneObject: 'name-card', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'school-bell', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-3-complete', sceneObject: 'whiteboard', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-order', sceneObject: 'school-flag' },
              { ref: 'hw-7-complete', sceneObject: 'tennis-racket', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-8-order' },
            ],
            hint: { fine: 'Kim konuşuyor, kimden söz ediliyor? Önce I / you / he / she / we / they’e karar ver, sonra am, is ya da are gelsin.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-principal', 'as-you-are', 'as-i-am', 'as-we-are', 'as-an', 'as-order-q',
              'as-isnt', 'as-timetable-en', 'as-meaning-neg', 'as-short-answer', 'as-she-text', 'as-tennis-meaning',
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
            frame: 'My new classmate is a ___. She is ___. We are in the ___.',
            chips: [
              { id: 'c-leader', en: 'leader', tr: 'lider', kind: 'noun' },
              { id: 'c-listener', en: 'listener', tr: 'dinleyici', kind: 'noun' },
              { id: 'c-student', en: 'student', tr: 'öğrenci', kind: 'noun' },
              { id: 'c-excited', en: 'excited', tr: 'heyecanlı', kind: 'adj' },
              { id: 'c-funny', en: 'funny', tr: 'komik', kind: 'adj' },
              { id: 'c-kind', en: 'kind', tr: 'nazik', kind: 'adj' },
              { id: 'c-classroom', en: 'classroom', tr: 'sınıf', kind: 'place' },
              { id: 'c-garden', en: 'school garden', tr: 'okul bahçesi', kind: 'place' },
            ],
            collection: { title: 'Sınıf Arkadaşlarım' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Yeni dönemin ilk gününde kendini ve sınıfını tanıtmak: I am / you are / he, she, it is / we, you, they are; olumsuz (am not, isn’t, aren’t) ve soru (Are you …? Is she …?) biçimleri; a / an / the seçimi. Okul çalışanlarını görevleriyle söyler: principal, English teacher, PE teacher, class president, leader, manager, listener.',
    vocabulary: [
      'new term', 'first day', 'flag ceremony', 'timetable', 'desk', 'classmate', 'student', 'teacher', 'English teacher',
      'class teacher', 'PE teacher', 'principal', 'class president', 'leader', 'manager', 'listener', 'tennis player',
      'Welcome!', 'excited', 'nervous',
    ],
    grammar: [
      'I am, you are, he / she / it is, we / you / they are (kısaltmalar: I’m, you’re, he’s, she’s, it’s, we’re, they’re)',
      'am not, isn’t, aren’t; Are you …? Is she …? Yes, I am. / No, she isn’t.',
      'a / an (sese göre), the (bilinen, tek şey)',
    ],
    expectedDifficulties: [
      'Türkçede “-im, -sin, -iz” ekleri fiilsiz çalıştığı için çocuk “I student” ya da “She a teacher” gibi be fiilini atlar.',
      'he / she ayrımı: Türkçede “o” tek kelime, bu yüzden Ms Pearl için “he” demeye eğilim olur.',
      'a / an seçimini yazıya göre yapmak: “an PE teacher”, “a uniform” (sese bak kuralı).',
      'we ile they karışır: konuşan kişi grubun içindeyse we, değilse they.',
      'Kısa cevapta fiili atmak (“Yes, I.”) ya da uygun olmayan bir fiil kullanmak (“Yes, I is.”).',
      'Türkçede “the” karşılığı olmadığı için the gereksiz yere atlanır: “Mrs Demir is principal.”',
    ],
    commonErrors: [
      { error: 'I student.', correction: 'I am a student. Be fiili (am) ve a gerekir.' },
      { error: 'She are the principal.', correction: 'She is the principal. (she → is)' },
      { error: 'We is classmates.', correction: 'We are classmates. (we → are)' },
      { error: 'Mr Aydın is an PE teacher.', correction: 'Mr Aydın is a PE teacher. PE “pi” diye okunur, ünsüz sesi.' },
      { error: 'You in 6-A?', correction: 'Are you in 6-A? Soruda are öne geçer.' },
      { error: 'Yes, I are.', correction: 'Yes, I am. Kısa cevapta da I ile am.' },
    ],
    questionsToAsk: [
      'Ms Pearl, Mr Aydın ve Mrs Demir kim? Her biri için “He / She is …” cümlesi kur.',
      'Are you excited or nervous on the first day? (gerçek ya da hayali cevap verilebilir)',
      'Is the timetable on the wall or on the desk?',
      'Sınıfında “the” ile söyleyeceğin tek bir kişi ya da şey var mı? (the principal, the board)',
    ],
    speakingPrompts: [
      'Introduce yourself: “I am a tennis player. I am excited today.” (gerçek ya da hayali bir kimlik olabilir; isim söylemek zorunda değilsin)',
      'Our class: “We are in 6-A. We are classmates.”',
      'Our school: “Mrs Demir is the principal. Mr Aydın is a PE teacher.”',
      'First day feelings: “I am excited. I am not nervous.”',
      'A friend: “She is a good listener.” (bir Lugu karakteri üzerinden)',
    ],
    rolePlay: {
      situation: 'Yeni dönemin ilk günü: öğrenci yeni sınıfa girer; Ms Pearl öğrenciyi sınıfa tanıtır, sınıf arkadaşları kendilerini tanıtır.',
      roles: ['Ms Pearl (öğretmen)', 'Yeni öğrenci (tenisçi)', 'Sasha (sınıf başkanı)', 'Momo (komik sınıf arkadaşı)'],
      steps: [
        'Ms Pearl: “Good morning, 6-A! This is our tennis player.” Yeni öğrenci: “Hello! I am a tennis player.”',
        'Sasha: “I am the class president. Are you nervous?” Yeni öğrenci: “A little. / No, I am excited.”',
        'Momo: “Is Ms Pearl the principal?” Öğrenci: “No, she isn’t. She is the English teacher.”',
        'Roller değişir; öğrenci Ms Pearl olur ve en az üç kişiyi “This is …” ve “He / She is …” ile tanıtır.',
      ],
    },
    listening: {
      script:
        'It is Monday morning. It is the first day of the new term. The students are in the school garden for the flag ceremony. Mrs Demir is the principal. She is at the flag. Then the students are in the classroom. Ms Pearl is the English teacher. She is also the class teacher. Mr Aydın is the PE teacher. He is in the gym. The timetable is on the wall. English is first. Dora and Momo are in the classroom. They are excited. A new classmate is at the door. She is a tennis player. Sasha is the class president. She is happy.',
      questions: [
        'Where are the students at the flag ceremony? (They are in the school garden.)',
        'Who is the principal? (Mrs Demir is.)',
        'Is Mr Aydın the English teacher? (No, he isn’t. He is the PE teacher.)',
        'Is English first on the timetable? (Yes, it is.)',
        'Who is a tennis player? (The new classmate is.)',
      ],
    },
    reinforcement: [
      'Zamir tablosu: I-am, you-are, he/she/it-is, we/you/they-are sütunları; öğrenci sınıftaki kişileri doğru sütuna yerleştirip cümle kurar.',
      'a / an kartları: öğretmen sözcüğü okur (PE teacher, uniform, eraser), öğrenci “a” ya da “an” der ve sesi söyler.',
      'Kısa cevap oyunu: “Are you …?” sorularına Yes, I am. / No, I’m not. diye hızlı cevap.',
    ],
    suggestedActivities: [
      'Kimlik kartı: öğrenci 4 cümleyle (I am …, I am a …, I am not …, I am …) bir kart yazar; gerçek ya da hayalî olabilir.',
      'Ders programı tanıtımı: “The timetable is on the wall. English is first.” gibi 3 cümle.',
      'Okul çalışanları eşleştirme: principal, PE teacher, class president kartlarını görevleriyle eşleştir.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Selamlaşma: “Good morning! How are you today?” (I am fine / I am excited / I am a little nervous)',
        'Isınma sorusu: “Is it the first day of the term?” (Yes, it is.)',
        'Karakter seç: “Who is your favourite: Piko, Sasha, Momo, Dora or Leo?” (“She / He is funny.” ile cevap)',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları: principal, PE teacher, class president, timetable, flag ceremony; öğrenci “It is a …” ya da “He / She is the …” der.',
        '“Who is this?” oyunu: öğretmen bir görev söyler (principal), öğrenci kişiyi bulur (Mrs Demir).',
        'Duygu kelimeleri: excited / nervous; öğrenci iki cümleyle ilk gün hissini anlatır.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: öğretmen bir kişi ya da grup söyler (Sasha, Leo and Piko, you), öğrenci I / he / she / they ve am / is / are ile cümle kurar.',
        'Tur 2: Olumsuz cümleler: “Ms Pearl isn’t the principal.” “I am not late.”',
        'Tur 3: Soru-cevap: “Are you in 6-A? Is she the class teacher?” Kısa cevaplarla.',
        'Tur 4: a / an / the: öğretmen sözcük söyler (English teacher, PE teacher, principal), öğrenci doğru sözcüğü seçer ve nedenini söyler.',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'İlk gün rol oyunu: öğretmen Ms Pearl, öğrenci yeni sınıf arkadaşı; “This is our tennis player.” ile tanıtım, sonra Sasha, Momo, Dora ile karşılıklı tanışma.',
        'Beklenen cümleler: “I am a tennis player. We are in 6-A. Are you nervous? No, I am excited.”',
        'Öğretmen notu: Hata olursa rol oyunu bitince topluca düzelt; akışı bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'It is Monday morning. It is the first day of the new term. The students are in the school garden for the flag ceremony. Mrs Demir is the principal. She is at the flag. Then the students are in the classroom. Ms Pearl is the English teacher. She is also the class teacher. Mr Aydın is the PE teacher. He is in the gym. The timetable is on the wall. English is first. Dora and Momo are in the classroom. They are excited. A new classmate is at the door. She is a tennis player. Sasha is the class president. She is happy.',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin, ikincide kişileri ve yerlerini not alsın.',
        'Sorular: Where are the students? Who is the principal? Is Mr Aydın the English teacher? Who is a tennis player?',
        'Öğrenci metindeki bir kişiyi seçip “He / She is …” ile tek cümleyle anlatır.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık yaptığı hatayı (be fiilini atmak, he / she karışması, a / an) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: am / is / are seçimi, a / an’ı sese göre seçmek, soruda am / is / are’i öne almak.',
        '“Sakın dokunma” turunu sözlü oyna: öğretmen sözcük söyler, öğrenci a ya da an der. Hatada nazikçe “Yaklaştın!” de, sonra birlikte düzelt.',
      ],
    },
    freeSpeaking: {
      minutes: 7,
      activities: [
        'Konu 1: Kendini tanıt (gerçek ya da hayalî): “I am … I am a … I am excited.”',
        'Konu 2: Sınıfın nasıl? “We are in 6-A. The timetable is on the wall.”',
        'Konu 3: En sevdiğin ders hangisi? “English is my favourite. It is first on Monday.”',
        'Konu 4: Okul çalışanları: “Mrs Demir is the principal. She is kind.”',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı ve telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: “Meet the New Student” kartı hazırla. Kendini 4 cümleyle tanıt (I am …, I am a …, I am excited / nervous, We are in …) ve sınıfından bir kişiyi “He / She is …” ile tanıt. Gerçek ya da hayalî olabilir; yaz ya da sesli kaydet.',
    },
  },
}
export default lesson
