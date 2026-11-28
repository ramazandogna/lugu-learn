/** Ünite 1.2 — Class Rules: imperatives (Open…, Don’t…, Please…), May I come in?. Theme u4-school-bell, host piko. Plan: docs/curriculum/kitap-mufredati.md */
import type { ContentLesson } from '../publish.ts'

const tf = ['True', 'False']

const lesson: ContentLesson = {
  title: 'Ünite 1.2 — Class Rules',
  sourceNotes:
    'Kitap Ünite 1 (School Life): emir cümleleri (Open…, Don’t…, Please…). Kelimeler: permission, instruction, listener, leader (kitap); rule, raise your hand, line up, be quiet, be on time, student on duty, May I come in? (ek). Kitap çıktısı: okul kurallarını anlatır, talimatları anlar. Tenis unvanı bu derste yok.',
  package: {
    schemaVersion: 1,
    meta: {
      title: 'Class Rules',
      tagline: 'Piko derse geç kaldı! Sınıf kurallarını, nöbetçi öğrenciyi ve “May I come in?” kalıbını öğren.',
      theme: 'School life',
      character: 'piko',
      level: 'A1',
      estimatedMinutes: 50,
      objectives: [
        { id: 'u1l2-positive', text: 'Olumlu emir cümleleri kurar ve anlar: Open your book. Sit down. Line up.' },
        { id: 'u1l2-negative', text: '“Don’t + fiil” ile yasakları söyler ve anlar: Don’t run. Don’t shout.' },
        { id: 'u1l2-please-be', text: 'Please ile kibar talimat verir; be ile emir kurar: Be quiet. Be on time.' },
        { id: 'u1l2-permission', text: '“May I come in?” kalıbıyla izin ister ve izin cevaplarını anlar.' },
        { id: 'u1l2-roles', text: 'Sınıf rollerini söyler: class leader, student on duty, good listener.' },
        { id: 'u1l2-rules', text: 'Sınıf kurallarını ve talimatları okuyup anlar; rule, instruction, permission kelimelerini kullanır.' },
      ],
      grammar: [
        'Olumlu emir: Open your book. Sit down. Line up.',
        'Olumsuz emir: Don’t run. Don’t shout. Don’t be late.',
        'Please ve be ile emir: Please sit down. Be quiet.',
        'İzin isteme (kalıp): May I come in?',
      ],
      themeId: 'u4-school-bell',
    },
    review: {
      questions: [
        { id: 'rv-am', type: 'choice', prompt: 'Piko runs to the door of the classroom: “I ___ late for English!”', options: ['is', 'am', 'are'], answer: 1, hint: 'Piko kendinden bahsediyor: I.', explain: '**I** ile **am** gelir: I am late.', objectiveId: 'u1l2-rules' },
        { id: 'rv-she', type: 'choice', prompt: 'Sasha is the class president. Dora says: “___ is the class president.”', options: ['She', 'He', 'It'], answer: 0, hint: 'Sasha bir kız.', explain: 'Kız için **she**: She is the class president.', objectiveId: 'u1l2-rules' },
        { id: 'rv-they', type: 'choice', prompt: 'Leo and Momo are in the gym. Piko says: “___ are in the gym.”', options: ['We', 'You', 'They'], answer: 2, hint: 'Piko onlardan biri değil, başkalarından söz ediyor.', explain: 'Başkaları için **they**: They are in the gym.', objectiveId: 'u1l2-rules' },
        { id: 'rv-an', type: 'choice', prompt: 'Momo says: “I am ___ excited student today!”', options: ['a', 'an', 'am'], answer: 1, hint: 'excited hangi sesle başlıyor? Ünlü mü, ünsüz mü?', explain: 'Ünlü sesiyle başlayan sözcükten önce **an**: an excited student.', objectiveId: 'u1l2-rules' },
      ],
    },
    vocabulary: [
      { id: 'v-rule', en: 'rule', tr: 'kural', example: { en: 'This is a class rule.', tr: 'Bu bir sınıf kuralı.' }, difficulty: 1, objectiveId: 'u1l2-rules' },
      { id: 'v-instruction', en: 'instruction', tr: 'talimat, yönerge', example: { en: 'Listen to the instruction.', tr: 'Talimatı dinle.' }, context: 'Öğretmenin “yap” ya da “yapma” dediği cümle.', difficulty: 2, objectiveId: 'u1l2-rules' },
      { id: 'v-permission', en: 'permission', tr: 'izin', example: { en: 'Ask for permission first.', tr: 'Önce izin iste.' }, context: 'Bir şeyi yapmadan önce öğretmenden izin istersin.', difficulty: 2, objectiveId: 'u1l2-permission' },
      { id: 'v-may-i-come-in', en: 'May I come in?', tr: 'İçeri girebilir miyim?', example: { en: 'May I come in, Ms Pearl?', tr: 'İçeri girebilir miyim, Ms Pearl?' }, context: 'Hazır kalıp: geç kalınca ya da kapıdan girerken kullanılır.', difficulty: 2, objectiveId: 'u1l2-permission' },
      { id: 'v-raise-hand', en: 'raise your hand', tr: 'elini kaldır', example: { en: 'Raise your hand, please.', tr: 'Lütfen elini kaldır.' }, context: 'Konuşmak istediğinde önce elini kaldırırsın.', difficulty: 2, objectiveId: 'u1l2-positive' },
      { id: 'v-line-up', en: 'line up', tr: 'sıraya gir', example: { en: 'Line up for PE, please.', tr: 'Beden eğitimi için lütfen sıraya girin.' }, difficulty: 1, objectiveId: 'u1l2-positive' },
      { id: 'v-open-book', en: 'open your book', tr: 'kitabını aç', example: { en: 'Open your book on page ten.', tr: 'Kitabını on. sayfada aç.' }, difficulty: 1, objectiveId: 'u1l2-positive' },
      { id: 'v-sit-down', en: 'sit down', tr: 'otur', example: { en: 'Sit down, please.', tr: 'Lütfen otur.' }, difficulty: 1, objectiveId: 'u1l2-positive' },
      { id: 'v-close-door', en: 'close the door', tr: 'kapıyı kapat', example: { en: 'Close the door, please.', tr: 'Lütfen kapıyı kapat.' }, difficulty: 1, objectiveId: 'u1l2-positive' },
      { id: 'v-listen-teacher', en: 'listen to the teacher', tr: 'öğretmeni dinle', example: { en: 'Listen to the teacher.', tr: 'Öğretmeni dinle.' }, context: '“listen to” birlikte kullanılır: listen to + kişi.', difficulty: 2, objectiveId: 'u1l2-positive' },
      { id: 'v-wait-turn', en: 'wait for your turn', tr: 'sıranı bekle', example: { en: 'Wait for your turn at the canteen.', tr: 'Kantinde sıranı bekle.' }, difficulty: 2, objectiveId: 'u1l2-positive' },
      { id: 'v-dont-run', en: 'Don’t run', tr: 'koşma', example: { en: 'Don’t run in the corridor.', tr: 'Koridorda koşma.' }, context: 'Don’t = do not. Yasak bildirir.', difficulty: 1, objectiveId: 'u1l2-negative' },
      { id: 'v-dont-shout', en: 'Don’t shout', tr: 'bağırma', example: { en: 'Don’t shout in the library.', tr: 'Kütüphanede bağırma.' }, difficulty: 2, objectiveId: 'u1l2-negative' },
      { id: 'v-be-quiet', en: 'be quiet', tr: 'sessiz ol', example: { en: 'Be quiet in the library.', tr: 'Kütüphanede sessiz ol.' }, context: 'Emirde “be” kullanılır: Be quiet. (Are quiet değil.)', difficulty: 1, objectiveId: 'u1l2-please-be' },
      { id: 'v-be-on-time', en: 'be on time', tr: 'zamanında ol', example: { en: 'Be on time for the flag ceremony.', tr: 'Bayrak törenine zamanında gel.' }, difficulty: 2, objectiveId: 'u1l2-please-be' },
      { id: 'v-please', en: 'please', tr: 'lütfen', example: { en: 'Please wait here.', tr: 'Lütfen burada bekle.' }, context: 'Cümlenin başına ya da sonuna gelir: Sit down, please.', difficulty: 1, objectiveId: 'u1l2-please-be' },
      { id: 'v-be-polite', en: 'be polite', tr: 'kibar ol', example: { en: 'Be polite to your classmates.', tr: 'Sınıf arkadaşlarına karşı kibar ol.' }, difficulty: 2, objectiveId: 'u1l2-please-be' },
      { id: 'v-student-on-duty', en: 'student on duty', tr: 'nöbetçi öğrenci', example: { en: 'Dora is the student on duty today.', tr: 'Bugün nöbetçi öğrenci Dora.' }, context: 'Sınıfta o gün görevli olan öğrenci.', difficulty: 3, objectiveId: 'u1l2-roles' },
      { id: 'v-leader', en: 'leader', tr: 'lider, önder', example: { en: 'Sasha is a good class leader.', tr: 'Sasha iyi bir sınıf lideri.' }, difficulty: 2, objectiveId: 'u1l2-roles' },
      { id: 'v-listener', en: 'good listener', tr: 'iyi dinleyen kişi', example: { en: 'Leo is a good listener.', tr: 'Leo iyi bir dinleyici.' }, difficulty: 2, objectiveId: 'u1l2-roles' },
    ],
    story: {
      title: 'Piko Is Late',
      character: 'piko',
      setting: 'Class 6-A on a Tuesday: classroom door, rule poster, school corridor, end of the day',
      scenes: [
        {
          id: 'sc-door',
          illustration: 'The door of classroom 6-A. Piko is out of breath at the door with his bag half open. Ms Pearl is at the board.',
          lines: [
            { speaker: 'narrator', en: 'It is Tuesday morning. The bell is loud.', tr: 'Salı sabahı. Zil çok yüksek.' },
            { speaker: 'narrator', en: 'English class is on. Piko is late!', tr: 'İngilizce dersi başladı. Piko geç kaldı!' },
            { speaker: 'piko', en: 'Oh no! I am late! My shoe is on the wrong foot!', tr: 'Eyvah! Geç kaldım! Ayakkabım ters ayağımda!' },
            { speaker: 'piko', en: 'May I come in, Ms Pearl?', tr: 'İçeri girebilir miyim, Ms Pearl?' },
            { speaker: 'narrator', en: 'Ms Pearl says: “Yes, come in. Please sit down. Be on time tomorrow.”', tr: 'Ms Pearl diyor ki: “Evet, gir. Lütfen otur. Yarın zamanında ol.”' },
          ],
        },
        {
          id: 'sc-poster',
          illustration: 'A big poster on the wall: “6-A Class Rules”. Sasha points at it. Dora, Momo and Leo stand around.',
          lines: [
            { speaker: 'narrator', en: 'Ms Pearl says: “Class, look at our new poster.”', tr: 'Ms Pearl diyor ki: “Sınıf, yeni afişimize bakın.”' },
            { speaker: 'sasha', en: 'I am the class leader. Please read our rules.', tr: 'Ben sınıf liderim. Lütfen kurallarımızı okuyun.' },
            { speaker: 'dora', en: 'Rule one: Raise your hand. Rule two: Don’t shout.', tr: 'Birinci kural: Elini kaldır. İkinci kural: Bağırma.' },
            { speaker: 'momo', en: 'Don’t shout? But my voice is very big!', tr: 'Bağırma mı? Ama benim sesim çok gür!' },
            { speaker: 'leo', en: 'Rule three: Listen to your classmates. I am a good listener.', tr: 'Üçüncü kural: Sınıf arkadaşlarını dinle. Ben iyi bir dinleyiciyim.' },
          ],
        },
        {
          id: 'sc-corridor',
          illustration: 'The long school corridor before PE. Students in a messy line, Dora with a clipboard, Mr Aydın at the gym door with a whistle.',
          lines: [
            { speaker: 'narrator', en: 'It is PE time. The class is in the corridor.', tr: 'Beden eğitimi saati. Sınıf koridorda.' },
            { speaker: 'dora', en: 'I am the student on duty today. Please line up!', tr: 'Bugün nöbetçi öğrenci benim. Lütfen sıraya girin!' },
            { speaker: 'momo', en: 'Don’t run, Piko! The floor is wet!', tr: 'Koşma Piko! Zemin ıslak!' },
            { speaker: 'narrator', en: 'Mr Aydın says: “Line up, please. Wait for your turn.”', tr: 'Mr Aydın diyor ki: “Lütfen sıraya girin. Sıranızı bekleyin.”' },
            { speaker: 'piko', en: 'Sorry, Mr Aydın. I am so excited about PE!', tr: 'Pardon Mr Aydın. Beden eğitimi için çok heyecanlıyım!' },
          ],
          choice: {
            prompt: 'What does Piko do now?',
            options: [
              { text: 'Line up and wait for his turn.', feedback: 'Güzel seçim! Sıraya girip beklemek tam da kuralın istediği şey.' },
              { text: 'Say sorry and walk slowly.', feedback: 'Nazik seçim! Özür dilemek ve yavaş yürümek de kurala uyar.' },
            ],
          },
        },
        {
          id: 'sc-end',
          illustration: 'End of the day in 6-A. The rule poster glows in the afternoon light. A duty chart is next to it.',
          lines: [
            { speaker: 'narrator', en: 'It is the end of the day. The poster is on the wall.', tr: 'Günün sonu. Afiş duvarda.' },
            { speaker: 'sasha', en: 'Student on duty: clean the board and close the door.', tr: 'Nöbetçi öğrenci: tahtayı sil ve kapıyı kapat.' },
            { speaker: 'piko', en: 'I am on duty tomorrow. I am ready!', tr: 'Yarın nöbetçi benim. Hazırım!' },
            { speaker: 'leo', en: 'Please be on time, Piko!', tr: 'Lütfen zamanında ol Piko!' },
            { speaker: 'narrator', en: 'The rules are not hard. They are for everyone.', tr: 'Kurallar zor değil. Hepimiz için.' },
          ],
        },
      ],
      questions: [
        { id: 'st-q-late', type: 'choice', prompt: 'Piko is at the door and he is late. What does he ask Ms Pearl?', options: ['Come in, please!', 'May I come in?', 'Where is my seat?'], answer: 1, hint: 'Birinci sahnede Piko öğretmenden izin istiyor.', explain: 'İzin istemek için hazır kalıp: **May I come in?**', objectiveId: 'u1l2-permission', vocabId: 'v-may-i-come-in' },
        { id: 'st-q-order', type: 'order', prompt: 'Ms Pearl answers Piko. Put her words in order.', tokens: ['sit', 'Please', 'down.'], answer: ['Please', 'sit', 'down.'], hint: 'Önce please, sonra emir fiili.', explain: 'Emirde fiil başa yakın gelir: **Please sit down.**', objectiveId: 'u1l2-please-be', vocabId: 'v-sit-down' },
        { id: 'st-q-rule2', type: 'text', prompt: 'Dora reads the poster: “Rule two: ___ shout.” Type the missing word.', accept: ['Don’t', 'Don\'t', 'Dont', 'Do not'], hint: 'Bağırmak yasak. Yasak için iki kelimelik kısaltma.', explain: 'Yasak için **Don’t** + fiil: Don’t shout.', objectiveId: 'u1l2-negative', vocabId: 'v-dont-shout' },
        { id: 'st-q-duty', type: 'choice', prompt: 'It is PE time. Who is the student on duty in the corridor?', options: ['Momo', 'Leo', 'Dora'], answer: 2, hint: 'Üçüncü sahnede “I am the student on duty today.” diyen kim?', explain: 'Nöbetçi öğrenci **Dora**.', objectiveId: 'u1l2-roles', vocabId: 'v-student-on-duty' },
        { id: 'st-q-tf', type: 'choice', prompt: 'In the corridor, Mr Aydın says: “Run to the gym!” Is it true?', options: tf, answer: 1, hint: 'Mr Aydın ne diyor? “Line up, please. Wait for your …”', explain: 'Mr Aydın “Line up, please. Wait for your turn.” diyor; koşmak yok.', objectiveId: 'u1l2-rules', vocabId: 'v-wait-turn' },
        { id: 'st-q-leader', type: 'choice', prompt: 'At the poster, Sasha says: “I am the class ___.”', options: ['listener', 'leader', 'duty'], answer: 1, hint: 'Sınıfı yöneten, öndeki kişi.', explain: 'Sınıfı yöneten kişi **leader**: class leader.', objectiveId: 'u1l2-roles', vocabId: 'v-leader' },
      ],
    },
    explanation: {
      steps: [
        {
          id: 'ex-positive',
          title: 'Emir cümlesi: fiil ile başla',
          body: 'Birinden bir şey yapmasını istiyorsan cümleye **doğrudan fiil** ile başlarsın. “You” demezsin. Tek kişiye de, bütün sınıfa da aynı kalıp.',
          examples: [
            { en: 'Open your book.', tr: 'Kitabını aç.' },
            { en: 'Sit down.', tr: 'Otur.' },
            { en: 'Line up.', tr: 'Sıraya gir.' },
          ],
          check: { id: 'ex-check-positive', type: 'choice', prompt: 'Ms Pearl wants to hear an answer: “___ your hand, please.”', options: ['Raising', 'To raise', 'Raise'], answer: 2, hint: 'Emir cümlesi doğrudan fiille başlar, ek almaz.', explain: 'Emirde fiil yalın kalır: **Raise** your hand.', objectiveId: 'u1l2-positive', vocabId: 'v-raise-hand' },
        },
        {
          id: 'ex-negative',
          title: 'Yasak: Don’t + fiil',
          body: 'Bir şeyi yasaklamak için fiilin önüne **Don’t** koyarsın. Don’t, do not’un kısaltmasıdır. Fiil yine yalın kalır: **Don’t run.**',
          examples: [
            { en: 'Don’t run in the corridor.', tr: 'Koridorda koşma.' },
            { en: 'Don’t shout in the library.', tr: 'Kütüphanede bağırma.' },
            { en: 'Don’t push.', tr: 'İtme.' },
          ],
          check: { id: 'ex-check-negative', type: 'choice', prompt: 'Mr Aydın says in the corridor: “___ run!”', options: ['Not', 'Don’t', 'No'], answer: 1, hint: 'Yasak için hangi iki kelimelik kalıp?', explain: 'Yasak için **Don’t** + fiil: Don’t run!', objectiveId: 'u1l2-negative', vocabId: 'v-dont-run' },
        },
        {
          id: 'ex-please',
          title: 'Kibar olmak: please',
          body: '**Please** emri yumuşatır. Cümlenin başına ya da sonuna gelir: **Please sit down.** ya da **Sit down, please.** Sonda gelirse önüne virgül koyarsın.',
          examples: [
            { en: 'Please sit down.', tr: 'Lütfen otur.' },
            { en: 'Line up, please.', tr: 'Lütfen sıraya girin.' },
            { en: 'Please wait here.', tr: 'Lütfen burada bekle.' },
          ],
          check: { id: 'ex-check-please', type: 'choice', prompt: 'Dora is the student on duty. She wants to ask her classmates nicely.', options: ['Line up!', 'Don’t line up.', 'Please line up.'], answer: 2, hint: 'Hangisinde “lütfen” var?', explain: 'Kibar olmak için **please**: Please line up.', objectiveId: 'u1l2-please-be', vocabId: 'v-please' },
        },
        {
          id: 'ex-be',
          title: 'Be ile emir: Be quiet, Be on time',
          body: 'Bir durumu ya da hâli emredersen fiil yine **be** olur: **Be quiet.** **Be on time.** Olumsuzu: **Don’t be late.** “Are quiet” ya da “Is quiet” demezsin.',
          examples: [
            { en: 'Be quiet in the library.', tr: 'Kütüphanede sessiz ol.' },
            { en: 'Be on time.', tr: 'Zamanında ol.' },
            { en: 'Don’t be late.', tr: 'Geç kalma.' },
          ],
          check: { id: 'ex-check-be', type: 'choice', prompt: 'Ms Pearl wants silence in class: “___ quiet, please.”', options: ['Are', 'Is', 'Be'], answer: 2, hint: 'Emirde am / is / are yerine hangi şekil gelir?', explain: 'Emirde **Be** kullanırız: Be quiet, please.', objectiveId: 'u1l2-please-be', vocabId: 'v-be-quiet' },
        },
        {
          id: 'ex-may',
          title: 'İzin istemek: May I come in?',
          body: 'İzin istemek için hazır kalıp: **May I …?** Kapıda **May I come in?** dersin. Cevap: **Yes, come in.** ya da **Sorry, wait here, please.** Bu derste kalıbı bütün hâliyle öğren.',
          examples: [
            { en: 'May I come in, Ms Pearl?', tr: 'İçeri girebilir miyim, Ms Pearl?' },
            { en: 'May I go to the toilet?', tr: 'Tuvalete gidebilir miyim?' },
            { en: 'Yes, come in.', tr: 'Evet, gir.' },
          ],
          check: { id: 'ex-check-may', type: 'choice', prompt: 'Piko is at the door. He asks: “___ I come in, Ms Pearl?”', options: ['May', 'Are', 'Is'], answer: 0, hint: 'Kapıda öğretmenden izin isteyen hazır kalıbı hatırla.', explain: 'İzin için **May I …?** kalıbı: May I come in?', objectiveId: 'u1l2-permission', vocabId: 'v-may-i-come-in' },
        },
        {
          id: 'ex-roles',
          title: 'Sınıf rolleri: leader, duty, listener',
          body: 'Sınıfta herkesin bir rolü var. **Class leader** sınıfı yönetir, **student on duty** o günün görevlisidir, **good listener** arkadaşını dinler. Rolü söylerken geçen derste öğrendiğin **I am / She is** kalıbı yeter.',
          examples: [
            { en: 'I am the class leader.', tr: 'Ben sınıf liderim.' },
            { en: 'Dora is the student on duty.', tr: 'Dora nöbetçi öğrenci.' },
            { en: 'Be a good listener.', tr: 'İyi bir dinleyici ol.' },
          ],
          check: { id: 'ex-check-roles', type: 'choice', prompt: 'Dora says: “I am the ___ on duty today.”', options: ['student', 'listener', 'leader'], answer: 0, hint: 'Nöbetçi kimdir? “… on duty”', explain: 'Doğru kalıp **student on duty**: nöbetçi öğrenci.', objectiveId: 'u1l2-roles', vocabId: 'v-student-on-duty' },
        },
        {
          id: 'ex-poster',
          title: 'Kural afişini okumak',
          body: 'Kural afişinde iki tür cümle görürsün: yapılacakları söyleyen **olumlu emir** (Raise your hand.) ve yasakları söyleyen **Don’t** cümlesi (Don’t shout.). Bir **instruction** (talimat) verirsin, **permission** (izin) ise istersin.',
          examples: [
            { en: 'Raise your hand.', tr: 'Elini kaldır. (yapılacak)' },
            { en: 'Don’t shout.', tr: 'Bağırma. (yasak)' },
            { en: 'May I open the window?', tr: 'Pencereyi açabilir miyim? (izin)' },
          ],
          check: { id: 'ex-check-poster', type: 'choice', prompt: 'Leo reads a rule on the library door: “___ shout in the library.”', options: ['Be', 'Please', 'Don’t'], answer: 2, hint: 'Kütüphanede bağırmak yasak.', explain: 'Yasak için **Don’t**: Don’t shout in the library.', objectiveId: 'u1l2-rules', vocabId: 'v-dont-shout' },
        },
      ],
    },
    homework: {
      groups: [
        {
          id: 'hw-1',
          objectiveId: 'u1l2-positive',
          complete: { id: 'hw-1-complete', type: 'choice', prompt: 'It is reading time in class. Ms Pearl says: “___ your books, please.”', options: ['Open', 'Close', 'Don’t open'], answer: 0, hint: 'Okuma zamanı: kitaplar kapalı mı olmalı, açık mı?', explain: 'Okumak için kitabı açarız: **Open** your books.', objectiveId: 'u1l2-positive', vocabId: 'v-open-book' },
          order: { id: 'hw-1-order', type: 'order', prompt: 'Ms Pearl writes an instruction on the board. Build it.', tokens: ['please.', 'your', 'Open', 'books,'], answer: ['Open', 'your', 'books,', 'please.'], hint: 'Fiil ile başla, please sona gelsin.', explain: 'Open your books, please.', objectiveId: 'u1l2-positive' },
          meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'Ms Pearl says: “Sit down, please.” What does she mean?', options: ['Lütfen otur.', 'Lütfen ayağa kalk.', 'Lütfen sessiz ol.'], answer: 0, hint: 'sit down = otur', explain: 'sit down = otur. Lütfen otur.', objectiveId: 'u1l2-positive', vocabId: 'v-sit-down' },
        },
        {
          id: 'hw-2',
          objectiveId: 'u1l2-negative',
          complete: { id: 'hw-2-complete', type: 'choice', prompt: 'The floor is wet at school. Momo says to Leo: “___ run in the corridor.”', options: ['No', 'Don’t', 'Not'], answer: 1, hint: 'Koşmak yasak. Hangi kalıp yasak bildirir?', explain: 'Yasak için **Don’t** + fiil: Don’t run.', objectiveId: 'u1l2-negative', vocabId: 'v-dont-run' },
          order: { id: 'hw-2-order', type: 'order', prompt: 'Leo reads a rule at the library door. Put the words in order.', tokens: ['shout', 'in', 'Don’t', 'the', 'library.'], answer: ['Don’t', 'shout', 'in', 'the', 'library.'], hint: 'Don’t → fiil → nerede?', explain: 'Don’t shout in the library.', objectiveId: 'u1l2-negative' },
          meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'Dora says to Piko: “Don’t push!” What does she mean?', options: ['Bekle!', 'Beni it.', 'İtme!'], answer: 2, hint: 'Don’t = yapma', explain: '**Don’t** = yapma: İtme!', objectiveId: 'u1l2-negative' },
        },
        {
          id: 'hw-3',
          objectiveId: 'u1l2-please-be',
          complete: { id: 'hw-3-complete', type: 'text', prompt: 'Momo asks nicely: “Open the window, ___.” Type the missing word.', accept: ['please'], hint: 'Emri yumuşatan kibar kelime. “Lütfen”.', explain: 'Kibar olmak için **please**: Open the window, please.', objectiveId: 'u1l2-please-be', vocabId: 'v-please' },
          order: { id: 'hw-3-order', type: 'order', prompt: 'Ms Pearl wants silence. Put her words in order.', tokens: ['be', 'quiet.', 'Please'], answer: ['Please', 'be', 'quiet.'], hint: 'Please → be → nasıl?', explain: 'Please be quiet.', objectiveId: 'u1l2-please-be' },
          meaning: { id: 'hw-3-meaning', type: 'choice', prompt: 'Mr Aydın says: “Please wait for your turn.” What does he mean?', options: ['Lütfen koşma.', 'Lütfen sıraya gir.', 'Lütfen sıranı bekle.'], answer: 2, hint: 'wait = beklemek', explain: 'wait for your turn = sıranı bekle.', objectiveId: 'u1l2-please-be', vocabId: 'v-wait-turn' },
        },
        {
          id: 'hw-4',
          objectiveId: 'u1l2-please-be',
          complete: { id: 'hw-4-complete', type: 'choice', prompt: 'Ms Pearl says to Piko after class: “___ on time tomorrow, please.”', options: ['Is', 'Are', 'Be'], answer: 2, hint: 'Emirde am / is / are kullanılmaz; fiil yalın hâlini alır.', explain: 'Emirde **Be** kullanırız: Be on time.', objectiveId: 'u1l2-please-be', vocabId: 'v-be-on-time' },
          order: { id: 'hw-4-order', type: 'order', prompt: 'Sasha reminds Piko about the rule. Put her words in order.', tokens: ['late.', 'Don’t', 'be'], answer: ['Don’t', 'be', 'late.'], hint: 'Don’t → be → late', explain: 'Don’t be late.', objectiveId: 'u1l2-please-be' },
          meaning: { id: 'hw-4-meaning', type: 'choice', prompt: 'Leo says to Momo in the library: “Be quiet.” What does he mean?', options: ['Sessiz ol.', 'Konuşmaya başla.', 'Geç kalma.'], answer: 0, hint: 'quiet = sessiz', explain: 'be quiet = sessiz ol.', objectiveId: 'u1l2-please-be', vocabId: 'v-be-quiet' },
        },
        {
          id: 'hw-5',
          objectiveId: 'u1l2-permission',
          complete: { id: 'hw-5-complete', type: 'choice', prompt: 'Leo is at the library door. He asks the librarian: “___ I come in?”', options: ['Am', 'Are', 'May'], answer: 2, hint: 'İzin isteyen kalıbın ilk kelimesi.', explain: 'İzin için **May I …?**: May I come in?', objectiveId: 'u1l2-permission', vocabId: 'v-may-i-come-in' },
          order: { id: 'hw-5-order', type: 'order', prompt: 'Piko is late again. Put his question in order.', tokens: ['in?', 'I', 'May', 'come'], answer: ['May', 'I', 'come', 'in?'], hint: 'Kapıda izin isterken söylediğin hazır kalıp.', explain: 'May I come in?', objectiveId: 'u1l2-permission' },
          meaning: { id: 'hw-5-meaning', type: 'choice', prompt: 'Momo asks Ms Pearl: “May I go to the toilet?” What does she ask?', options: ['Tuvalet nerede?', 'Tuvalete gitme.', 'Tuvalete gidebilir miyim?'], answer: 2, hint: 'May I …? = … -ebilir miyim?', explain: '**May I …?** izin isteme kalıbı: Tuvalete gidebilir miyim?', objectiveId: 'u1l2-permission' },
        },
        {
          id: 'hw-6',
          objectiveId: 'u1l2-permission',
          complete: { id: 'hw-6-complete', type: 'text', prompt: 'Ms Pearl answers Piko’s question: “Yes, ___ in.” Type the missing word.', accept: ['come'], hint: 'Kapıdan içeri girmek: c… ile başlıyor.', explain: 'İzin verirken emir kullanırız: Yes, **come** in.', objectiveId: 'u1l2-permission', vocabId: 'v-may-i-come-in' },
          order: { id: 'hw-6-order', type: 'order', prompt: 'Ms Pearl says yes to Piko. Put her words in order.', tokens: ['in.', 'Yes,', 'come'], answer: ['Yes,', 'come', 'in.'], hint: 'Önce Yes, sonra emir.', explain: 'Yes, come in.', objectiveId: 'u1l2-permission' },
          meaning: { id: 'hw-6-meaning', type: 'choice', prompt: 'Ms Pearl says: “Sorry, wait here, please.” What does she mean?', options: ['Üzgünüm, lütfen burada bekle.', 'Tamam, gir.', 'Üzgünüm, lütfen git.'], answer: 0, hint: 'wait = beklemek, here = burada', explain: '**wait here** = burada bekle.', objectiveId: 'u1l2-permission' },
        },
        {
          id: 'hw-7',
          objectiveId: 'u1l2-roles',
          complete: { id: 'hw-7-complete', type: 'choice', prompt: 'Dora checks the line before PE. She is the student on ___ today.', options: ['time', 'break', 'duty'], answer: 2, hint: 'Nöbetçi öğrenci: student on …', explain: 'Nöbetçi öğrenci: student on **duty**.', objectiveId: 'u1l2-roles', vocabId: 'v-student-on-duty' },
          order: { id: 'hw-7-order', type: 'order', prompt: 'Sasha writes on the duty chart. Put her words in order.', tokens: ['the', 'is', 'Dora', 'student', 'on', 'duty.'], answer: ['Dora', 'is', 'the', 'student', 'on', 'duty.'], hint: 'Dora → is → the student on duty', explain: 'Dora is the student on duty.', objectiveId: 'u1l2-roles' },
          meaning: { id: 'hw-7-meaning', type: 'choice', prompt: 'Sasha says: “I am the class leader.” What does she mean?', options: ['Ben sınıf liderim.', 'Ben nöbetçi öğrenciyim.', 'Ben sınıfa yeni geldim.'], answer: 0, hint: 'leader = lider', explain: 'class leader = sınıf lideri.', objectiveId: 'u1l2-roles', vocabId: 'v-leader' },
        },
        {
          id: 'hw-8',
          objectiveId: 'u1l2-roles',
          complete: { id: 'hw-8-complete', type: 'choice', prompt: 'Sasha talks about Leo: “He is quiet and kind. He is a good ___.”', options: ['leader', 'listener', 'rule'], answer: 1, hint: 'Arkadaşını dinleyen kişi.', explain: 'Dinleyen kişi: **listener**.', objectiveId: 'u1l2-roles', vocabId: 'v-listener' },
          order: { id: 'hw-8-order', type: 'order', prompt: 'Ms Pearl writes a rule on the board. Put the words in order.', tokens: ['to', 'Listen', 'teacher.', 'the'], answer: ['Listen', 'to', 'the', 'teacher.'], hint: 'Fiil ile başla: listen to …', explain: 'Listen to the teacher.', objectiveId: 'u1l2-roles' },
          meaning: { id: 'hw-8-meaning', type: 'choice', prompt: 'Leo says: “Listen to your classmates.” What does he mean?', options: ['Sınıf arkadaşlarını dinle.', 'Sınıf arkadaşlarına bağırma.', 'Sınıf arkadaşlarına yardım et.'], answer: 0, hint: 'listen = dinlemek', explain: 'listen to = dinlemek: Sınıf arkadaşlarını dinle.', objectiveId: 'u1l2-roles', vocabId: 'v-listener' },
        },
        {
          id: 'hw-9',
          objectiveId: 'u1l2-rules',
          complete: { id: 'hw-9-complete', type: 'text', prompt: 'Dora is the student on duty: “Line ___, please.” Type the missing word.', accept: ['up'], hint: 'Sıraya girmek: line + yön kelimesi.', explain: 'Sıraya girmek: line **up**.', objectiveId: 'u1l2-rules', vocabId: 'v-line-up' },
          order: { id: 'hw-9-order', type: 'order', prompt: 'Sasha writes rule one on the poster. Build it.', tokens: ['first.', 'hand', 'your', 'Raise'], answer: ['Raise', 'your', 'hand', 'first.'], hint: 'Fiil ile başla: raise …', explain: 'Raise your hand first.', objectiveId: 'u1l2-rules' },
          meaning: { id: 'hw-9-meaning', type: 'choice', prompt: 'Ms Pearl says: “Raise your hand, please.” What does she mean?', options: ['Lütfen elini yıka.', 'Lütfen ellerini indir.', 'Lütfen elini kaldır.'], answer: 2, hint: 'raise = kaldırmak', explain: 'raise your hand = elini kaldır.', objectiveId: 'u1l2-rules', vocabId: 'v-raise-hand' },
        },
      ],
    },
    assessment: {
      quiz: [
        { id: 'as-be-quiet', type: 'choice', prompt: 'Ms Pearl wants silence before the quiz. She says: “___ quiet, please.”', options: ['Be', 'Is', 'Are', 'Am'], answer: 0, objectiveId: 'u1l2-please-be', vocabId: 'v-be-quiet' },
        { id: 'as-dont-run', type: 'choice', prompt: 'The corridor is full of students. Mr Aydın says: “___ run in the corridor.”', options: ['Not', 'No', 'Don’t'], answer: 2, objectiveId: 'u1l2-negative', vocabId: 'v-dont-run' },
        { id: 'as-may', type: 'text', prompt: 'Leo is at the classroom door. Type the missing word: “___ I come in?”', accept: ['May'], objectiveId: 'u1l2-permission', vocabId: 'v-may-i-come-in' },
        { id: 'as-order-late', type: 'order', prompt: 'Ms Pearl reminds Piko. Put her words in order.', tokens: ['late,', 'be', 'Don’t', 'please.'], answer: ['Don’t', 'be', 'late,', 'please.'], objectiveId: 'u1l2-please-be', vocabId: 'v-be-on-time' },
        { id: 'as-rule-en', type: 'choice', prompt: 'Ms Pearl writes “kural” on the board. What is it in English?', options: ['permission', 'instruction', 'listener', 'rule'], answer: 3, objectiveId: 'u1l2-rules', vocabId: 'v-rule' },
        { id: 'as-polite', type: 'choice', prompt: 'Piko wants permission to open the window. Which sentence is right?', options: ['Open the window!', 'Don’t open the window.', 'May I open the window?'], answer: 2, objectiveId: 'u1l2-permission', vocabId: 'v-permission' },
        { id: 'as-meaning-wait', type: 'choice', prompt: 'Mr Aydın says: “Wait for your turn.” What does he mean?', options: ['Sıranı bekle.', 'Koşma.', 'Sessiz ol.'], answer: 0, objectiveId: 'u1l2-positive', vocabId: 'v-wait-turn' },
        { id: 'as-duty-tr', type: 'choice', prompt: 'Dora says: “I am the student on duty.” What is Dora?', options: ['Sınıf başkanı', 'Yeni öğrenci', 'Nöbetçi öğrenci'], answer: 2, objectiveId: 'u1l2-roles', vocabId: 'v-student-on-duty' },
        { id: 'as-negative-which', type: 'choice', prompt: 'Sasha reads the poster. Which one is a “don’t” rule?', options: ['Be quiet.', 'Don’t shout.', 'Raise your hand.'], answer: 1, objectiveId: 'u1l2-negative', vocabId: 'v-dont-shout' },
        { id: 'as-your', type: 'text', prompt: 'Dora says to Piko at the canteen: “Wait for ___ turn.” Type the missing word.', accept: ['your'], objectiveId: 'u1l2-positive', vocabId: 'v-wait-turn' },
        { id: 'as-on-time', type: 'choice', prompt: 'Piko is late. Ms Pearl says: “Come in, but be ___ next time.”', options: ['on time', 'quiet', 'a rule'], answer: 0, objectiveId: 'u1l2-please-be', vocabId: 'v-be-on-time' },
        { id: 'as-listener-rule', type: 'choice', prompt: 'Leo wants to be a good listener. Which rule is for him?', options: ['Shout in class.', 'Run in the corridor.', 'Listen to your classmates.'], answer: 2, objectiveId: 'u1l2-roles', vocabId: 'v-listener' },
      ],
      reading: {
        title: 'Our Class Rules',
        paragraphs: [
          'Welcome to 6-A! Our class is a team. Rules are important for every team. Please read our rules. They are easy!',
          'Rule one: Be on time. Rule two: Raise your hand. Don’t shout. Rule three: Listen to your classmates and your teacher. Rule four: Don’t run in the corridor. Rule five: Say please and thank you.',
          'Every day, one student is on duty. Today, Dora is the student on duty. Please be kind to her. Ask for permission: “May I come in?” or “May I go to the toilet?” Ms Pearl is our teacher and Sasha is the class leader.',
        ],
        questions: [
          { id: 'rd-tf-time', type: 'choice', prompt: 'Rule one is: “Be on time.”', options: tf, answer: 0, objectiveId: 'u1l2-rules', vocabId: 'v-be-on-time' },
          { id: 'rd-tf-shout', type: 'choice', prompt: 'Rule two is: “Shout in class.”', options: tf, answer: 1, objectiveId: 'u1l2-negative', vocabId: 'v-dont-shout' },
          { id: 'rd-tf-dora', type: 'choice', prompt: 'Dora is the student on duty today.', options: tf, answer: 0, objectiveId: 'u1l2-roles', vocabId: 'v-student-on-duty' },
          { id: 'rd-tf-sasha', type: 'choice', prompt: 'Sasha is the PE teacher.', options: tf, answer: 1, objectiveId: 'u1l2-roles' },
          { id: 'rd-tf-run', type: 'choice', prompt: 'Rule four is: “Don’t run in the corridor.”', options: tf, answer: 0, objectiveId: 'u1l2-negative', vocabId: 'v-dont-run' },
          { id: 'rd-fill-be', type: 'choice', prompt: 'Please ___ on time!', options: ['am', 'be', 'is', 'are'], answer: 1, objectiveId: 'u1l2-please-be', vocabId: 'v-be-on-time' },
          { id: 'rd-fill-may', type: 'choice', prompt: '___ I come in?', options: ['Is', 'May', 'Am', 'Do'], answer: 1, objectiveId: 'u1l2-permission', vocabId: 'v-may-i-come-in' },
          { id: 'rd-fill-hand', type: 'choice', prompt: 'Raise your ___ in class.', options: ['rule', 'turn', 'hand', 'duty'], answer: 2, objectiveId: 'u1l2-rules', vocabId: 'v-raise-hand' },
        ],
      },
    },
    play: {
      sections: {
        review: {
          template: 'time-escape',
          slots: {
            pool: [
              'rv-am', 'rv-she', 'rv-they', 'rv-an',
              'v-rule', 'v-instruction', 'v-permission', 'v-raise-hand', 'v-line-up', 'v-be-quiet',
              'v-be-on-time', 'v-student-on-duty', 'v-listener', 'v-leader',
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
              { id: 'vs-rule', line: { speaker: 'sasha', en: 'This is a class rule.', tr: 'Bu bir sınıf kuralı.' }, emphasis: ['rule'] },
              { id: 'vs-hand', line: { speaker: 'dora', en: 'Raise your hand, please.', tr: 'Lütfen elini kaldır.' }, emphasis: ['Raise your hand'] },
              { id: 'vs-lineup', line: { speaker: 'leo', en: 'Line up, please!', tr: 'Lütfen sıraya girin!' }, emphasis: ['Line up'] },
              { id: 'vs-quiet', line: { speaker: 'momo', en: 'Be quiet in the library.', tr: 'Kütüphanede sessiz ol.' }, emphasis: ['Be quiet'] },
              {
                id: 'vs-time',
                line: { speaker: 'piko', en: 'Be on time, Piko!', tr: 'Zamanında ol, Piko!' },
                emphasis: ['Be on time'],
                joke: { tr: 'Piko kendine kendi sesiyle uyarı veriyor. Bu hâlâ “zamanında olmak” sayılmaz ama niyet güzel.' },
              },
              { id: 'vs-duty', line: { speaker: 'dora', en: 'I am the student on duty.', tr: 'Nöbetçi öğrenci benim.' }, emphasis: ['student on duty'] },
              { id: 'vs-may', line: { speaker: 'piko', en: 'May I come in, please?', tr: 'İçeri girebilir miyim, lütfen?' }, emphasis: ['May I come in'] },
              { id: 'vs-permission', line: { speaker: 'sasha', en: 'Ask for permission first.', tr: 'Önce izin iste.' }, emphasis: ['permission'] },
            ],
            vocabRefs: [
              'v-rule', 'v-instruction', 'v-permission', 'v-may-i-come-in', 'v-raise-hand', 'v-line-up', 'v-open-book', 'v-sit-down',
              'v-close-door', 'v-listen-teacher', 'v-wait-turn', 'v-dont-run', 'v-dont-shout', 'v-be-quiet', 'v-be-on-time',
              'v-please', 'v-be-polite', 'v-student-on-duty', 'v-leader', 'v-listener',
            ],
          },
        },
        vocab_quiz: {
          template: 'stamp-quiz',
          slots: { questions: ['v-rule', 'v-permission', 'v-raise-hand', 'v-line-up', 'v-be-on-time', 'v-student-on-duty', 'v-dont-shout'], showStreak: true, shield: true, hintBudget: 2 },
        },
        story: {
          template: 'scroll-story',
          slots: {
            mode: 'story',
            steps: [
              { id: 'ps-late', line: { speaker: 'narrator', en: 'English class is on. Piko is late!', tr: 'İngilizce dersi başladı. Piko geç kaldı!' } },
              { id: 'ps-may', line: { speaker: 'piko', en: 'May I come in, Ms Pearl?', tr: 'İçeri girebilir miyim, Ms Pearl?' }, gate: 'st-q-late', emphasis: ['May I come in'] },
              { id: 'ps-pearl', line: { speaker: 'narrator', en: 'Ms Pearl says: “Yes, come in. Please sit down.”', tr: 'Ms Pearl diyor ki: “Evet, gir. Lütfen otur.”' }, gate: 'st-q-order' },
              { id: 'ps-rule', line: { speaker: 'dora', en: 'Rule two: Don’t shout.', tr: 'İkinci kural: Bağırma.' }, gate: 'st-q-rule2' },
              { id: 'ps-duty', line: { speaker: 'dora', en: 'I am the student on duty. Please line up!', tr: 'Nöbetçi öğrenci benim. Lütfen sıraya girin!' }, gate: 'st-q-duty' },
              { id: 'ps-end', line: { speaker: 'narrator', en: 'The rules are not hard. They are for everyone.', tr: 'Kurallar zor değil. Hepimiz için.' } },
            ],
            choice: {
              prompt: 'What does Piko do now?',
              options: [
                { text: 'Line up and wait for his turn.', feedback: 'Güzel seçim! Sıraya girip beklemek tam da kuralın istediği şey.' },
                { text: 'Say sorry and walk slowly.', feedback: 'Nazik seçim! Özür dilemek ve yavaş yürümek de kurala uyar.' },
              ],
            },
          },
        },
        explanation: {
          template: 'tap-guide',
          slots: {
            guides: [
              {
                id: 'g-positive',
                target: 'card-open',
                hint: { fine: 'Emir cümlesi doğrudan fiille başlar. “You” demezsin.', big: 'Open your book. Sit down. Line up. Hepsi fiille başlıyor.' },
                stepRef: 'ex-positive',
              },
              {
                id: 'g-dont',
                target: 'card-dont',
                hint: { fine: 'Yasak için fiilin önüne Don’t koy.', big: 'Don’t run. Don’t shout. Don’t be late.' },
                joke: { tr: 'Don’t kural afişinin en popüler kelimesi. Bazı öğrenciler onu hiç okumadan “Do” diye koşmaya başlar.' },
                stepRef: 'ex-negative',
              },
              {
                id: 'g-may',
                target: 'card-may',
                hint: { fine: 'İzin istemek için M harfiyle başlayan hazır kalıp.', big: 'May I come in? Cevap: Yes, come in.' },
                stepRef: 'ex-may',
              },
            ],
            goNoGo: {
              rule: { tr: 'Don’t ile yasaklayan kurala dokun. Olumlu emre dokunma!', tapIf: 'Don’t' },
              warmup: [
                { id: 'w-run', text: 'Don’t run.', tap: true, why: 'Don’t = yasak' },
                { id: 'w-hand', text: 'Raise your hand.', tap: false, why: 'Olumlu emir: yap' },
                { id: 'w-shout', text: 'Don’t shout.', tap: true, why: 'Don’t = yasak' },
                { id: 'w-book', text: 'Open your book.', tap: false, why: 'Olumlu emir: yap' },
              ],
              round: [
                { id: 'r-late', text: 'Don’t be late.', tap: true, why: 'Don’t = yasak' },
                { id: 'r-quiet', text: 'Be quiet.', tap: false, why: 'Olumlu emir: sessiz ol' },
                { id: 'r-line', text: 'Line up, please.', tap: false, why: 'Olumlu emir: sıraya gir' },
                { id: 'r-push', text: 'Don’t push.', tap: true, why: 'Don’t = yasak' },
                { id: 'r-listen', text: 'Listen to the teacher.', tap: false, why: 'Olumlu emir: dinle' },
                { id: 'r-eat', text: 'Don’t eat in class.', tap: true, why: 'Don’t = yasak' },
                { id: 'r-sit', text: 'Sit down.', tap: false, why: 'Olumlu emir: otur' },
                { id: 'r-talk', text: 'Don’t talk.', tap: true, why: 'Don’t = yasak' },
                { id: 'r-door', text: 'Close the door.', tap: false, why: 'Olumlu emir: kapat' },
                { id: 'r-turn', text: 'Wait for your turn.', tap: false, why: 'Olumlu emir: bekle' },
              ],
              onWrongTap: { anim: 'sneeze', line: 'Hapşu! Yasak mı, yapılacak mı? Bir daha bak.' },
            },
          },
        },
        homework: {
          template: 'fill-workshop',
          slots: {
            items: [
              { ref: 'hw-1-order', sceneObject: 'whiteboard', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-2-complete', sceneObject: 'corridor-sign', onComplete: { anim: 'object-wiggle' } },
              { ref: 'hw-3-complete', sceneObject: 'school-bell', onComplete: { anim: 'sentence-glow' } },
              { ref: 'hw-5-order', sceneObject: 'classroom-door', onComplete: { anim: 'sentence-glow', sfx: 'kutlama-kucuk' } },
              { ref: 'hw-7-order', sceneObject: 'duty-chart' },
              { ref: 'hw-9-complete' },
            ],
            hint: { fine: 'Emir cümlesi fiille başlar. Yasaksa Don’t, kibar olacaksa please ekle.' },
          },
        },
        assessment: {
          template: 'stamp-quiz',
          slots: {
            questions: [
              'as-be-quiet', 'as-dont-run', 'as-may', 'as-order-late', 'as-rule-en', 'as-polite',
              'as-meaning-wait', 'as-duty-tr', 'as-negative-which', 'as-your', 'as-on-time', 'as-listener-rule',
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
            frame: 'Our new rule: Be ___ in the ___. Don’t ___!',
            chips: [
              { id: 'c-quiet', en: 'quiet', tr: 'sessiz', kind: 'adj' },
              { id: 'c-polite', en: 'polite', tr: 'kibar', kind: 'adj' },
              { id: 'c-kind', en: 'kind', tr: 'nazik', kind: 'adj' },
              { id: 'c-library', en: 'library', tr: 'kütüphane', kind: 'place' },
              { id: 'c-corridor', en: 'corridor', tr: 'koridor', kind: 'place' },
              { id: 'c-classroom', en: 'classroom', tr: 'sınıf', kind: 'place' },
              { id: 'c-run', en: 'run', tr: 'koşmak', kind: 'verb' },
              { id: 'c-shout', en: 'shout', tr: 'bağırmak', kind: 'verb' },
              { id: 'c-push', en: 'push', tr: 'itmek', kind: 'verb' },
            ],
            collection: { title: 'Kural Kartlarım' },
          },
        },
      ],
    },
  },
  teacherGuide: {
    objective:
      'Emir cümleleri: olumlu (Open your book. Line up.), olumsuz (Don’t run.), please ve be ile (Please sit down. Be quiet.), izin isteme kalıbı (May I come in?). Sınıf kurallarını ve talimatları anlar; class leader, student on duty, good listener rollerini söyler.',
    vocabulary: [
      'rule', 'instruction', 'permission', 'May I come in?', 'raise your hand', 'line up', 'open your book', 'sit down',
      'close the door', 'listen to the teacher', 'wait for your turn', 'Don’t run', 'Don’t shout', 'be quiet', 'be on time',
      'please', 'be polite', 'student on duty', 'leader', 'good listener',
    ],
    grammar: [
      'Olumlu emir: fiil + (nesne): Open your book. Line up.',
      'Olumsuz emir: Don’t + fiil: Don’t run. Don’t be late.',
      'Please cümlenin başında ya da sonunda; emirde be: Be quiet. Be on time.',
      'İzin isteme kalıbı: May I come in? Cevap: Yes, come in. / Sorry, wait here, please.',
    ],
    expectedDifficulties: [
      'Türkçede emir kipi fiile ek getirir (“otur”), İngilizcede fiil yalın kalır; çocuk “You sit down” ya da “Sitting down” gibi fazladan yapı ekleyebilir.',
      'Don’t kalıbını “No run” ya da “Not run” diye kurmak; Türkçe olumsuz ek (-me) fiilin içinde olduğu için ayrı bir sözcük olarak görmek zor gelir.',
      'Be quiet / Be on time’da “be” fiilini atmak (“Quiet!”) ya da are / is kullanmak (“Are quiet”).',
      'May I come in? kalıbını parçalamak ya da “Can I come in?” demek; bu derste kalıp bütün hâliyle çalışılır.',
      '“Listen the teacher” demek; listen to birlikte öğrenilmeli.',
      'Please’i çok doğrudan çevirmek ya da hiç kullanmamak; emir tonu sert kalabilir.',
    ],
    commonErrors: [
      { error: 'You open your book.', correction: 'Open your book. Emirde “you” kullanılmaz.' },
      { error: 'No run in the corridor.', correction: 'Don’t run in the corridor. Yasak için Don’t + fiil.' },
      { error: 'Are quiet, please.', correction: 'Be quiet, please. Emirde be kullanılır.' },
      { error: 'I come in?', correction: 'May I come in? İzin için hazır kalıp.' },
      { error: 'Listen the teacher.', correction: 'Listen to the teacher. listen + to.' },
      { error: 'Don’t late.', correction: 'Don’t be late. late bir sıfat, önüne be gerekir.' },
    ],
    questionsToAsk: [
      'Sınıfında üç kural söyle: ikisi “Don’t”, biri olumlu emir olsun.',
      'Geç kaldın. Kapıda ne dersin? (May I come in?)',
      'Who is the student on duty today? (kurgusal; Dora ya da Piko)',
      'Ms Pearl ne der: “Raise your hand” mı, “Shout” mu?',
    ],
    speakingPrompts: [
      'Class rules: “Be on time. Raise your hand. Don’t shout.”',
      'Permission: “May I come in? May I go to the toilet?”',
      'Corridor: “Line up, please. Don’t run.”',
      'Roles: “I am the class leader. She is the student on duty.”',
      'My rule poster: “Be kind. Be quiet in the library. Don’t push.” (gerçek ya da hayalî sınıf)',
    ],
    rolePlay: {
      situation: 'Geç kalan bir öğrenci derse girer; sonra sınıfça kurallar konuşulur ve nöbetçi öğrenci koridorda sırayı düzenler.',
      roles: ['Piko (geç kalan öğrenci)', 'Ms Pearl (öğretmen)', 'Dora (nöbetçi öğrenci)', 'Mr Aydın (beden eğitimi öğretmeni)'],
      steps: [
        'Piko kapıda: “May I come in, Ms Pearl?” Ms Pearl: “Yes, come in. Please sit down. Be on time tomorrow.”',
        'Ms Pearl kural afişini gösterir; öğrenci üç kuralı okur: “Raise your hand. Don’t shout. Listen to your classmates.”',
        'Dora (nöbetçi): “Please line up!” Mr Aydın: “Don’t run. Wait for your turn.” Öğrenci doğru cümleyle yanıt verir (Sorry, Mr Aydın.).',
        'Roller değişir; öğrenci nöbetçi öğrenci olur ve en az üç emir cümlesi verir (en az biri Don’t olsun).',
      ],
    },
    listening: {
      script:
        'Welcome to 6-A. Here are our class rules. Rule one: Be on time. Rule two: Raise your hand. Don’t shout. Rule three: Listen to your classmates. Be a good listener. Rule four: Don’t run in the corridor. Line up for PE, please. Dora is the student on duty today. She is at the door. If you are late, ask: May I come in? Say please and thank you. Sasha is the class leader. She is happy with our rules. Don’t forget them!',
      questions: [
        'What is rule one? (Be on time.)',
        'Is shouting OK in class? (No, it isn’t. Don’t shout.)',
        'Who is the student on duty today? (Dora is.)',
        'What do you ask when you are late? (May I come in?)',
        'Who is the class leader? (Sasha is.)',
      ],
    },
    reinforcement: [
      'Kart oyunu: bir yanda “Open / Sit down / Line up”, diğer yanda “Don’t run / Don’t shout”; öğrenci kartı çevirir ve cümleyi söyler.',
      'Simon says benzeri oyun: öğretmen emir verir, öğrenci “Please” ile başlıyorsa yapar. Don’t emirlerinde yapmaz.',
      'May I …? zinciri: öğrenci üç farklı izin sorusu kurar (come in, go to the toilet, open the window).',
    ],
    suggestedActivities: [
      'Sınıf kural afişi: öğrenci 5 kural yazar (iki Don’t, bir Be, iki olumlu) ve resimler.',
      'Nöbetçi öğrenci görev kartı: “Clean the board. Close the door. Please line up.” gibi 4 talimat.',
      'Okul kapısı rol oyunu: izin isteme ve izin verme/reddetme cevapları.',
    ],
  },
  speakingPlan: {
    warmUp: {
      minutes: 5,
      activities: [
        'Selamlaşma: “Good morning! Are you ready?” (Yes, I am. / No, I am not.)',
        'Isınma emirleri: öğretmen “Stand up. Sit down. Raise your hand.” der, öğrenci yapar ve tekrar eder.',
        'Hızlı soru: “Is the classroom quiet?” (Yes, it is. / No, it isn’t.)',
      ],
    },
    vocabulary: {
      minutes: 10,
      activities: [
        'Kelime kartları: rule, instruction, permission, student on duty; öğrenci kartı söyler ve bir örnek cümle kurar.',
        'Hareketli kelimeler: line up, open your book, sit down, close the door; öğretmen söyler, öğrenci yapar ve emir cümlesini söyler.',
        'Zıt çiftler: Be quiet / Don’t shout; öğrenci iki emri aynı duruma yazar.',
      ],
    },
    grammar: {
      minutes: 10,
      activities: [
        'Tur 1: Olumlu emirler: öğretmen bir durum söyler (kapı açık), öğrenci “Close the door, please.” der.',
        'Tur 2: Olumsuz emirler: öğretmen bir durum söyler (koridorda koşan öğrenci), öğrenci “Don’t run.” der.',
        'Tur 3: Be ile emir: “Be quiet. Be on time. Don’t be late.” Öğrenci üç durumda doğru cümleyi seçer.',
        'Tur 4: May I …? soruları ve cevapları: Yes, come in. / Sorry, wait here, please.',
      ],
    },
    rolePlay: {
      minutes: 10,
      activities: [
        'Geç kalan öğrenci rol oyunu: öğretmen Ms Pearl, öğrenci Piko; kapıda izin isteme ve içeri girme. Sonra roller değişir.',
        'Beklenen cümleler: “May I come in? Yes, come in. Please sit down. Be on time tomorrow.”',
        'Nöbetçi öğrenci sahnesi: öğrenci sırayı düzenler: “Please line up! Don’t run!”',
        'Öğretmen notu: Hata olursa rol oyunu bitince topluca düzelt; akışı bölme.',
      ],
    },
    listening: {
      minutes: 8,
      script:
        'Welcome to 6-A. Here are our class rules. Rule one: Be on time. Rule two: Raise your hand. Don’t shout. Rule three: Listen to your classmates. Be a good listener. Rule four: Don’t run in the corridor. Line up for PE, please. Dora is the student on duty today. She is at the door. If you are late, ask: May I come in? Say please and thank you. Sasha is the class leader. She is happy with our rules. Don’t forget them!',
      activities: [
        'Metni iki kez oku; ilkinde sadece dinlesin, ikincide duyduğu kuralları not alsın.',
        'Sorular: What is rule one? Who is the student on duty? What do you ask when you are late?',
        'Öğrenci metinden bir “Don’t” kuralı ve bir olumlu kural seçip tekrar eder.',
      ],
    },
    weaknessReinforcement: {
      minutes: 8,
      activities: [
        'Öğrencinin en sık yaptığı hatayı (“You” ile emir kurmak, Don’t yerine No/Not, be’yi atmak) üç kısa cümleyle tekrar ettir.',
        'Kanıt yoksa dersin beklenen zorlukları: Don’t + fiil, Be quiet’da be, May I come in? kalıbının bütünlüğü.',
        '“Sakın dokunma” turunu sözlü oyna: öğretmen emir söyler, öğrenci “yasak” ya da “yap” der. Hatada nazikçe “Yaklaştın!” de, sonra birlikte düzelt.',
      ],
    },
    freeSpeaking: {
      minutes: 7,
      activities: [
        'Konu 1: Sınıfında hangi kurallar var? “Be on time. Don’t shout.” (gerçek ya da hayalî sınıf)',
        'Konu 2: Kütüphane kuralları: “Be quiet. Don’t run.”',
        'Konu 3: Kantinde kuralların ne? “Wait for your turn. Don’t push.”',
        'Konu 4: Nöbetçi öğrenci olsan ne derdin? “Please line up. Close the door.”',
        'Öğretmen kuralı: isim, soyisim, adres, okul adı ve telefon sorma; cevap gerçek hayattan olmak zorunda değil, hayal edilebilir.',
      ],
    },
    closingTask: {
      task:
        'Hafta ödevi: “My Class Rules” afişi hazırla. En az 5 kural yaz (ikisi Don’t, biri Be, biri please ile) ve bir tanesi için “May I …?” sorusu ekle. Gerçek ya da hayalî bir sınıf olabilir; yaz ya da sesli kaydet.',
    },
  },
}
export default lesson
