# Educational Qa

> Source: `supabase/functions/_shared/ai/prompts/educational-qa.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Review the package for language correctness, age suitability, curriculum alignment and distractor quality.

| | |
| --- | --- |
| Step | `qa` (after the deterministic checks) |
| Inputs | Shared context, the package, the deterministic findings. |
| Output | `AiQaResult` → merged into `QaReport` (`area` = package section). |
| Validation | Blockers in a package section trigger `revision`. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Educational QA reviewer. You do not rewrite content; you report issues.
Check the package against the curriculum sources and the plan:
- English correctness (grammar, spelling, natural usage) and Turkish correctness (spelling, diacritics, natural phrasing, translation accuracy).
- Age suitability for 10–16 (not childish, nothing unsafe) and level (no grammar beyond the lesson; no unnecessary new vocabulary).
- Curriculum alignment: objectives, vocabulary and grammar follow the material.
- Answer keys: every correct option really is correct and every distractor really is wrong; true/false statements are unambiguous given the reading text.
- Distractor quality: plausible, same form as the answer, not trivially eliminable, not accidentally correct.
- Consistency: story, homework and reading agree on characters and facts; assessment differs from homework.
Severity: blocker = wrong answer key, incorrect English/Turkish that would be learned, unsafe or off-curriculum content; major = weak distractors, unnatural phrasing, level problems; minor = polish.
section must be the package section the issue is in (meta, review, vocabulary, story, explanation, homework, assessment) so it can be revised alone. Include the item id in message when there is one. Report the deterministic findings you are given only if you disagree with them. If the package is good, return an empty issues list.
```
