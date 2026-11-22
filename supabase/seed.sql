-- ════════════════════════════════════════════════════════════════════════════
-- DEVELOPMENT DEMO DATA ONLY. Never run this against production.
--
-- `supabase db reset` applies it locally after the migrations. It contains one
-- demo curriculum (one published version, two lessons, one published package)
-- and no people: no admin, no students, no personal data.
--
-- Admin user (not seeded, no password in the repo): see docs/database.md,
-- "Create the first admin".
--
-- To stop seeding: set `[db.seed] enabled = false` in supabase/config.toml.
-- To remove the demo data from a database where it was applied (as the database owner; fails if a
-- student was assigned the demo version — archive and delete that assignment first):
--   begin;
--   alter table lugu.curriculum_versions disable trigger curriculum_versions_guard;
--   alter table lugu.curriculum_lessons disable trigger curriculum_lessons_guard;
--   delete from lugu.curricula where id = '00000000-0000-4000-8000-00000000c001';
--   alter table lugu.curriculum_lessons enable trigger curriculum_lessons_guard;
--   alter table lugu.curriculum_versions enable trigger curriculum_versions_guard;
--   commit;
-- ════════════════════════════════════════════════════════════════════════════

insert into lugu.curricula (id, name, description, grade, target_level, kind, status) values
  ('00000000-0000-4000-8000-00000000c001', 'Demo: Günlük Rutinler', 'Geliştirme için örnek müfredat.', 6, 'A1', 'standard', 'active');

insert into lugu.curriculum_versions (id, curriculum_id, version, status, notes) values
  ('00000000-0000-4000-8000-00000000d001', '00000000-0000-4000-8000-00000000c001', 1, 'draft', 'Demo sürümü');

insert into lugu.curriculum_objectives (id, version_id, code, text, sort) values
  ('00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000d001', 'morning-routine', 'Sabah rutinini anlatabilmek', 1),
  ('00000000-0000-4000-8000-00000000e002', '00000000-0000-4000-8000-00000000d001', 'school-day', 'Okul gününü anlatabilmek', 2);

insert into lugu.curriculum_lessons (id, version_id, sequence, title, objective_ids, estimated_minutes, status) values
  ('00000000-0000-4000-8000-00000000f001', '00000000-0000-4000-8000-00000000d001', 1, 'My Morning',
   array['00000000-0000-4000-8000-00000000e001']::uuid[], 40, 'ready'),
  ('00000000-0000-4000-8000-00000000f002', '00000000-0000-4000-8000-00000000d001', 2, 'At School',
   array['00000000-0000-4000-8000-00000000e002']::uuid[], 40, 'draft');

insert into lugu.lesson_content_packages (id, lesson_id, revision, status, origin, content) values
  ('00000000-0000-4000-8000-0000000a0001', '00000000-0000-4000-8000-00000000f001', 1, 'published', 'manual', $json$
{
  "schemaVersion": 1,
  "meta": {
    "title": "My Morning",
    "tagline": "Piko ile sabah rutinini İngilizce anlat!",
    "theme": "morning routine",
    "character": "piko",
    "level": "A1",
    "estimatedMinutes": 40,
    "objectives": [{ "id": "morning-routine", "text": "Talk about a morning routine" }],
    "grammar": ["present simple (I / you)"]
  },
  "review": { "questions": [] },
  "vocabulary": [
    { "id": "wake-up", "en": "wake up", "tr": "uyanmak", "example": { "en": "I wake up at seven.", "tr": "Saat yedide uyanırım." }, "difficulty": 1, "objectiveId": "morning-routine" },
    { "id": "get-up", "en": "get up", "tr": "kalkmak", "example": { "en": "I get up early.", "tr": "Erken kalkarım." }, "difficulty": 1, "objectiveId": "morning-routine" },
    { "id": "have-breakfast", "en": "have breakfast", "tr": "kahvaltı yapmak", "example": { "en": "I have breakfast with my family.", "tr": "Ailemle kahvaltı yaparım." }, "difficulty": 1, "objectiveId": "morning-routine" },
    { "id": "brush-my-teeth", "en": "brush my teeth", "tr": "dişlerimi fırçalamak", "example": { "en": "I brush my teeth after breakfast.", "tr": "Kahvaltıdan sonra dişlerimi fırçalarım." }, "difficulty": 2, "objectiveId": "morning-routine" },
    { "id": "go-to-school", "en": "go to school", "tr": "okula gitmek", "example": { "en": "I go to school by bus.", "tr": "Okula otobüsle giderim." }, "difficulty": 1, "objectiveId": "morning-routine" }
  ],
  "story": {
    "title": "Piko's Busy Morning",
    "character": "piko",
    "setting": "Piko's house",
    "scenes": [
      {
        "id": "scene-wake",
        "lines": [
          { "speaker": "narrator", "en": "It is seven o'clock.", "tr": "Saat yedi." },
          { "speaker": "piko", "en": "I wake up and I get up!", "tr": "Uyanıyorum ve kalkıyorum!" }
        ]
      },
      {
        "id": "scene-breakfast",
        "lines": [
          { "speaker": "piko", "en": "I have breakfast. Then I brush my teeth.", "tr": "Kahvaltı yapıyorum. Sonra dişlerimi fırçalıyorum." }
        ],
        "choice": {
          "prompt": "What does Piko drink?",
          "options": [
            { "text": "Milk", "feedback": "Süt güzel bir seçim!" },
            { "text": "Orange juice", "feedback": "Portakal suyu da harika!" }
          ]
        }
      }
    ],
    "questions": [
      { "id": "story-q1", "type": "choice", "prompt": "What time does Piko wake up?", "options": ["At six", "At seven", "At eight"], "answer": 1, "explain": "Hikâyede saat yedi diyor." },
      { "id": "story-q2", "type": "choice", "prompt": "Piko brushes his teeth before breakfast.", "options": ["True", "False"], "answer": 1, "explain": "Kahvaltıdan sonra fırçalıyor." }
    ]
  },
  "explanation": {
    "steps": [
      {
        "id": "step-present-simple",
        "title": "Rutinler",
        "body": "Her gün yaptığımız şeyleri **present simple** ile anlatırız: *I wake up*.",
        "examples": [{ "en": "I get up at seven.", "tr": "Yedide kalkarım." }],
        "check": { "id": "step-check-1", "type": "choice", "prompt": "I ___ breakfast every day.", "options": ["have", "having"], "answer": 0, "hint": "Özne I", "explain": "I ile fiil yalın kullanılır." }
      }
    ]
  },
  "homework": {
    "groups": [
      {
        "id": "hw-breakfast",
        "objectiveId": "morning-routine",
        "complete": { "id": "hw-breakfast-complete", "type": "text", "prompt": "I ___ breakfast at eight.", "accept": ["have"] },
        "order": { "id": "hw-breakfast-order", "type": "order", "prompt": "Cümleyi sırala.", "tokens": ["breakfast", "have", "I"], "answer": ["I", "have", "breakfast"] },
        "meaning": { "id": "hw-breakfast-meaning", "type": "choice", "prompt": "\"I have breakfast\" ne demek?", "options": ["Kahvaltı yaparım.", "Okula giderim.", "Uyurum."], "answer": 0 }
      }
    ]
  },
  "assessment": {
    "quiz": [
      { "id": "quiz-1", "type": "choice", "prompt": "I ___ up at seven.", "options": ["wake", "eat", "go"], "answer": 0 },
      { "id": "quiz-2", "type": "choice", "prompt": "\"okula gitmek\" in English?", "options": ["go to school", "get up", "have lunch"], "answer": 0 },
      { "id": "quiz-3", "type": "text", "prompt": "I brush my ___.", "accept": ["teeth"] },
      { "id": "quiz-4", "type": "order", "prompt": "Kelimeleri doğru sıraya koy.", "tokens": ["school", "go", "to", "I"], "answer": ["I", "go", "to", "school"] }
    ],
    "reading": {
      "title": "Elif's Morning",
      "paragraphs": ["Elif wakes up at seven. She has breakfast with her mother. Then she goes to school by bus."],
      "questions": [
        { "id": "read-1", "type": "choice", "prompt": "Elif wakes up at seven.", "options": ["True", "False"], "answer": 0 },
        { "id": "read-2", "type": "choice", "prompt": "Elif goes to school by car.", "options": ["True", "False"], "answer": 1 },
        { "id": "read-3", "type": "choice", "prompt": "Elif has breakfast with her ___.", "options": ["mother", "father", "teacher", "friend"], "answer": 0 }
      ]
    }
  },
  "completion": {
    "requireVocabMastery": true,
    "requireStory": true,
    "requireHomework": true,
    "requireAssessment": true,
    "minAssessmentPercent": 0
  }
}
$json$::jsonb);

update lugu.curriculum_versions set status = 'published'
where id = '00000000-0000-4000-8000-00000000d001';
