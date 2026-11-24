/**
 * Unit 2 demo package (Yummy Breakfast, theme `u2-night-oven`). Same shape as the Unit 1 fixture:
 * vocabulary, a short story with one decision, a guided explanation, homework groups, an assessment
 * and a reading, plus a play plan (time-escape review, scroll-story vocabulary and story, stamp-quiz).
 * Only the content and theme change; engines and limits stay the same (docs/play/patterns.md section 10).
 */
import type { z } from 'zod'
import type { LessonPackage, TeacherGuide } from '@/domain/content.ts'

type PackageInput = z.input<typeof LessonPackage>

const tf = ['True', 'False']

export const unit2PackageInput: PackageInput = {
  schemaVersion: 1,
  meta: {
    title: 'Momo and the Night Oven',
    tagline: 'Momo gece fırınında ekmek pişirirken kahvaltıda ne yediğini anlat!',
    theme: 'Food and breakfast',
    character: 'momo',
    level: 'A1–A2',
    estimatedMinutes: 45,
    objectives: [
      { id: 'obj-food', text: 'Kahvaltı yiyeceklerini ve içeceklerini İngilizce adlandırır.' },
      { id: 'obj-likes', text: '“I like / I don’t like” ile neyi sevdiğini anlatır.' },
      { id: 'obj-quantity', text: 'some / a / an ile miktarı belirtir.' },
    ],
    grammar: ['I like / I don’t like + isim', 'some (sayılamayan isimler), a / an (sayılabilen tekil isimler)'],
    themeId: 'u2-night-oven',
  },
  review: { questions: [] },
  vocabulary: [
    { id: 'v-bread', en: 'bread', tr: 'ekmek', example: { en: 'Momo bakes fresh bread at night.', tr: 'Momo gece taze ekmek pişirir.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-honey', en: 'honey', tr: 'bal', example: { en: 'I put honey on my bread.', tr: 'Ekmeğimin üstüne bal sürerim.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-cheese', en: 'cheese', tr: 'peynir', example: { en: 'I like cheese for breakfast.', tr: 'Kahvaltıda peynir severim.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-olives', en: 'olives', tr: 'zeytin', example: { en: 'Momo has green olives.', tr: 'Momo’da yeşil zeytin var.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-jam', en: 'jam', tr: 'reçel', example: { en: 'Piko likes strawberry jam.', tr: 'Piko çilek reçelini sever.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-milk', en: 'milk', tr: 'süt', example: { en: 'We drink milk at breakfast.', tr: 'Kahvaltıda süt içeriz.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-eggs', en: 'eggs', tr: 'yumurta', example: { en: 'Momo cooks two eggs.', tr: 'Momo iki yumurta pişirir.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-tea', en: 'tea', tr: 'çay', example: { en: 'I drink tea in the morning.', tr: 'Sabahları çay içerim.' }, difficulty: 1, objectiveId: 'obj-food' },
    { id: 'v-spread-jam', en: 'spread jam', tr: 'reçel sürmek', example: { en: 'Spread jam on the bread.', tr: 'Ekmeğe reçel sür.' }, difficulty: 2, objectiveId: 'obj-food' },
    { id: 'v-make-breakfast', en: 'make breakfast', tr: 'kahvaltı hazırlamak', example: { en: 'Momo makes breakfast for Piko.', tr: 'Momo Piko için kahvaltı hazırlar.' }, context: 'Kahvaltıyı “make” ile hazırlarız, “have” ile yeriz.', difficulty: 2, objectiveId: 'obj-food' },
  ],
  story: {
    title: 'The Night Oven',
    character: 'momo',
    setting: 'A small bakery at night and a kitchen in the morning',
    scenes: [
      {
        id: 'sc-night',
        illustration: 'Momo in a small bakery at midnight, bread in the oven.',
        lines: [
          { speaker: 'narrator', en: 'It is midnight. Momo is in her small bakery.', tr: 'Gece yarısı. Momo küçük fırınında.' },
          { speaker: 'momo', en: 'I bake bread at night. I like warm bread!', tr: 'Gece ekmek pişiririm. Sıcak ekmeği severim!' },
        ],
      },
      {
        id: 'sc-morning',
        illustration: 'Piko arrives at the kitchen table, jam and cheese on the table.',
        lines: [
          { speaker: 'narrator', en: 'In the morning, Piko comes for breakfast.', tr: 'Sabah Piko kahvaltıya gelir.' },
          { speaker: 'piko', en: 'I like jam and cheese. Do you have some honey?', tr: 'Reçel ve peynir severim. Biraz balın var mı?' },
          { speaker: 'momo', en: 'Yes! I have some honey and some olives.', tr: 'Evet! Biraz balım ve biraz zeytinim var.' },
        ],
        choice: {
          prompt: 'What should Piko eat?',
          options: [
            { text: 'Bread with jam.', feedback: 'Güzel seçim! Reçelli ekmek tatlı bir başlangıç.' },
            { text: 'Olives and cheese.', feedback: 'Olur! Zeytin ve peynir de harika bir kahvaltı.' },
          ],
        },
      },
    ],
    questions: [
      { id: 'st-bake-time', type: 'choice', prompt: 'When does Momo bake bread?', options: ['In the morning', 'At night', 'At noon'], answer: 1, hint: 'İlk sahnenin ikinci cümlesine bak.', explain: 'Momo ekmeği gece pişirir: “I bake bread at night.”', objectiveId: 'obj-food', vocabId: 'v-bread' },
      { id: 'st-piko-likes', type: 'choice', prompt: 'Piko likes jam and cheese.', options: tf, answer: 0, hint: 'Piko sabah ne diyor?', explain: 'Piko: “I like jam and cheese.”', objectiveId: 'obj-likes', vocabId: 'v-jam' },
      { id: 'st-order-honey', type: 'order', prompt: 'Put the words in order.', tokens: ['some', 'honey', 'has', 'Momo'], answer: ['Momo', 'has', 'some', 'honey'], hint: 'Kim? → Ne var? → Ne kadar?', explain: 'Momo has some honey.', objectiveId: 'obj-quantity', vocabId: 'v-honey' },
    ],
  },
  explanation: {
    steps: [
      {
        id: 'ex-like',
        title: 'I like / I don’t like',
        body: 'Bir şeyi sevdiğini anlatmak için **I like** kullanırsın. Sevmediğinde **I don’t like** dersin.',
        examples: [
          { en: 'I like honey.', tr: 'Balı severim.' },
          { en: 'I don’t like olives.', tr: 'Zeytini sevmem.' },
        ],
        check: { id: 'ex-check-like', type: 'choice', prompt: 'I ___ tea.', options: ['like', 'likes', 'liking'], answer: 0, hint: 'Özne “I”. Fiil değişir mi?', explain: '**I** ile fiil yalın kalır: I **like** tea.', objectiveId: 'obj-likes', vocabId: 'v-tea' },
      },
      {
        id: 'ex-some',
        title: 'some, a, an',
        body: 'Sayılamayan şeylerde (bread, milk, honey) **some** kullanırız. Sayılabilen tekil şeylerde **a / an** gelir.',
        examples: [
          { en: 'I have some milk.', tr: 'Biraz süt içerim.' },
          { en: 'I eat an egg.', tr: 'Bir yumurta yerim.' },
        ],
        check: { id: 'ex-check-some', type: 'choice', prompt: 'Momo has ___ bread.', options: ['some', 'a', 'an'], answer: 0, hint: 'Bread sayılamaz.', explain: 'Bread sayılamayan bir isim: **some** bread.', objectiveId: 'obj-quantity', vocabId: 'v-bread' },
      },
    ],
  },
  homework: {
    groups: [
      {
        id: 'hw-1',
        objectiveId: 'obj-likes',
        complete: { id: 'hw-1-complete', type: 'choice', prompt: 'I ___ cheese.', options: ['like', 'likes', 'liking'], answer: 0, hint: 'Özne “I”.', explain: 'I **like** cheese.', objectiveId: 'obj-likes', vocabId: 'v-cheese' },
        order: { id: 'hw-1-order', type: 'order', prompt: 'Put the words in order.', tokens: ['bread.', 'cheese', 'like', 'I', 'and'], answer: ['I', 'like', 'cheese', 'and', 'bread.'], hint: 'Özne önce gelir.', explain: 'I like cheese and bread.', objectiveId: 'obj-likes' },
        meaning: { id: 'hw-1-meaning', type: 'choice', prompt: 'What does it mean? “I like cheese.”', options: ['Peynir severim.', 'Peynir yemem.', 'Peynir alırım.'], answer: 0, hint: 'like = sevmek', explain: 'like = sevmek.', objectiveId: 'obj-likes', vocabId: 'v-cheese' },
      },
      {
        id: 'hw-2',
        objectiveId: 'obj-quantity',
        complete: { id: 'hw-2-complete', type: 'text', prompt: 'Momo has ___ milk.', accept: ['some'], hint: 'Milk sayılamaz.', explain: 'Milk sayılamaz: **some** milk.', objectiveId: 'obj-quantity', vocabId: 'v-milk' },
        order: { id: 'hw-2-order', type: 'order', prompt: 'Put the words in order.', tokens: ['some', 'eggs.', 'Momo', 'has'], answer: ['Momo', 'has', 'some', 'eggs.'], hint: 'Kim? → Ne var? → Ne kadar?', explain: 'Momo has some eggs.', objectiveId: 'obj-quantity' },
        meaning: { id: 'hw-2-meaning', type: 'choice', prompt: 'What does it mean? “Momo has some eggs.”', options: ['Momo’da biraz yumurta var.', 'Momo yumurtayı sevmez.', 'Momo bir fırın yapar.'], answer: 0, hint: 'has = var / sahip olmak', explain: 'has = sahip olmak; some eggs = biraz yumurta.', objectiveId: 'obj-quantity', vocabId: 'v-eggs' },
      },
    ],
  },
  assessment: {
    quiz: [
      { id: 'as-jam', type: 'choice', prompt: 'What is “reçel” in English?', options: ['jam', 'milk', 'tea', 'honey'], answer: 0, objectiveId: 'obj-food', vocabId: 'v-jam' },
      { id: 'as-tea', type: 'choice', prompt: 'I ___ tea in the morning.', options: ['drink', 'drinks', 'drinking'], answer: 0, objectiveId: 'obj-likes', vocabId: 'v-tea' },
      { id: 'as-olives', type: 'text', prompt: 'Write the missing word: I like green ___.', accept: ['olives'], objectiveId: 'obj-food', vocabId: 'v-olives' },
      { id: 'as-egg', type: 'choice', prompt: 'Momo has ___ egg.', options: ['a', 'an', 'some'], answer: 1, objectiveId: 'obj-quantity', vocabId: 'v-eggs' },
    ],
    reading: {
      title: 'Momo’s Bakery',
      paragraphs: [
        'Momo has a small bakery. She bakes bread at night, when the town is quiet.',
        'In the morning she has breakfast with her friends. They eat bread, cheese and honey, and they drink some tea.',
      ],
      questions: [
        { id: 'rd-tf-night', type: 'choice', prompt: 'Momo bakes bread in the morning.', options: tf, answer: 1, objectiveId: 'obj-food' },
        { id: 'rd-fill-honey', type: 'choice', prompt: 'They eat bread, cheese and ___.', options: ['honey', 'jam', 'tea', 'milk'], answer: 0, objectiveId: 'obj-food' },
      ],
    },
  },
  play: {
    sections: {
      review: {
        template: 'time-escape',
        slots: {
          pool: ['v-bread', 'v-honey', 'v-cheese', 'v-jam'],
          seconds: { bank: 10, perCorrect: 3, cap: 10 },
          chase: { chaser: 'caramel-river', escapee: 'momo' },
          easyDefault: false,
        },
      },
      vocabulary: {
        template: 'scroll-story',
        slots: {
          mode: 'vocab-reveal',
          steps: [
            { id: 'vs-bread', line: { speaker: 'momo', en: 'I bake bread at night.', tr: 'Gece ekmek pişiririm.' }, emphasis: ['bake'] },
            { id: 'vs-spread', line: { speaker: 'momo', en: 'Spread jam on the bread!', tr: 'Ekmeğe reçel sür!' }, emphasis: ['jam'] },
            { id: 'vs-make', line: { speaker: 'momo', en: 'I make breakfast with some eggs.', tr: 'Yumurtalarla kahvaltı hazırlarım.' }, emphasis: ['breakfast'] },
          ],
          vocabRefs: ['v-bread', 'v-spread-jam', 'v-make-breakfast', 'v-honey', 'v-cheese', 'v-olives', 'v-jam', 'v-milk', 'v-eggs', 'v-tea'],
        },
      },
      vocab_quiz: {
        template: 'stamp-quiz',
        slots: { questions: ['v-bread', 'v-honey', 'v-olives', 'v-milk', 'v-make-breakfast'], showStreak: true, shield: true, hintBudget: 1 },
      },
      story: {
        template: 'scroll-story',
        slots: {
          mode: 'story',
          steps: [
            { id: 'ps-night', line: { speaker: 'narrator', en: 'It is midnight. Momo is in her small bakery.', tr: 'Gece yarısı. Momo küçük fırınında.' } },
            { id: 'ps-bake', line: { speaker: 'momo', en: 'I bake bread at night. I like warm bread!', tr: 'Gece ekmek pişiririm. Sıcak ekmeği severim!' } },
            { id: 'ps-piko', line: { speaker: 'piko', en: 'I like jam and cheese. Do you have some honey?', tr: 'Reçel ve peynir severim. Biraz balın var mı?' } },
          ],
          choice: {
            prompt: 'What should Piko eat?',
            options: [
              { text: 'Bread with jam.', feedback: 'Güzel seçim! Reçelli ekmek tatlı bir başlangıç.' },
              { text: 'Olives and cheese.', feedback: 'Olur! Zeytin ve peynir de harika bir kahvaltı.' },
            ],
          },
        },
      },
    },
  },
}

export const unit2TeacherGuide: TeacherGuide = {
  objective: 'Kahvaltı yiyecekleri ve I like / I don’t like, some / a / an kullanımı.',
  vocabulary: ['bread', 'honey', 'cheese', 'olives', 'jam', 'milk', 'eggs', 'tea', 'spread jam', 'make breakfast'],
  grammar: ['I like / I don’t like + isim', 'some (sayılamayan) / a, an (sayılabilen tekil)'],
  expectedDifficulties: ['Sayılabilen ve sayılamayan isim ayrımı (bread vs. an egg).', '“have” ve “make” karışıklığı (have breakfast / make breakfast).'],
  commonErrors: [
    { error: 'I like cheeses.', correction: 'I like cheese. (Peynir sayılamaz.)' },
    { error: 'Momo has a bread.', correction: 'Momo has some bread.' },
  ],
  questionsToAsk: ['Sabah kahvaltıda ne yersin?', 'Neyi sevmezsin?'],
  speakingPrompts: ['I like … / I don’t like … cümlesiyle üç yiyecek anlat.'],
  rolePlay: {
    situation: 'Sabah kahvaltı sofrası: Momo ile Piko.',
    roles: ['Momo (fırıncı)', 'Piko (misafir)'],
    steps: ['Momo ne olduğunu sorar.', 'Piko bir şey ister: “Can I have some …?”', 'Momo cevap verir ve servis eder.'],
  },
  listening: {
    script: 'Momo: I bake bread at night. Piko: I like jam and cheese. Momo: Do you have some honey?',
    questions: ['Momo ne zaman ekmek pişirir?', 'Piko neyi sever?'],
  },
  reinforcement: ['Her gün kahvaltıda ne yediğini “I like / I don’t like” ile yaz.'],
  suggestedActivities: ['Sınıf kahvaltı menüsü: “We have …”, “Some …”.'],
}
