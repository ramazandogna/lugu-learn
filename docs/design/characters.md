# Lugu character bible

Five original creatures: no animal mascot from any existing product, no copied silhouettes. They are drawn in code: rigs live in `src/design/mascots/<key>.ts` and the registry in `src/design/characters.ts`. To show one, use `LuguMascot`.

## Shared rules (all characters)

- **Canvas:** 120×120 viewBox with a ground shadow at y≈111.
- **Line and fill:** 3px outline in the character's own dark ink, round joins. Flat body, one shade crescent at lower-right, one white highlight at upper-left, and a lighter belly or face.
- **Silhouette:** must be recognisable at 32px. The parts that make each one recognisable are never removed (see "Silhouette").
- **Expressions:** shared rules in `mascots/expressions.ts`. Each expression is a face, an arm pose and extras: `happy`, `thinking` (hand to chin, thought dots), `celebrating` (arms up, sparkles), `encouraging` (wave, star), `resting` (folded arms, closed eyes, z), `surprised` (open arms, small "o").
- **Emotional states:** these map onto the expressions. A correct answer is `celebrating` (small) or `happy`. A wrong answer is `encouraging`, never sad or angry. Explanations use `thinking`, breaks use `resting`, discoveries use `surprised`. **No character is ever disappointed in the learner.**
- **Animation:** an opt-in bob of 2.5px over 3.6s and a blink every ~5s. Celebrations play once. All of it is off under reduced motion.
- **Voice:** Turkish. Characters talk to the learner as a peer and say "sen". Lines are short, warm and specific, with no diminutives and no baby talk. At most one exclamation mark per bubble.
- **UI role:** a character hosts a moment. It speaks through `CharacterBubble`, which always shows its name, and lends its theme colours to that section. The mascot is decoration: the text carries the meaning.
- **Consistency:** never recolour a character, change its proportions, add a mouth with teeth, give it weapons, or put it on a dark outline-less background. A new pose is a new arm pose in the shared rules, not a one-off drawing.

## Piko — meraklı, sakin, zeki

- **Role:** grammar, explanations, tips, discovery, problem-solving. Hosts `vocabulary`, `explanation` and loading.
- **Palette:** body `#4cc3e6`, shade `#2a9cc4`, light `#c9f0fb`, bulb `#ffe27a`, ink `#1d2a4a`. UI theme: primary `#0b6e94`, accent `#5cc8ec`, wash `#e4f4fb` (night: `#6fd0f2` / `#10283a`).
- **Appearance and silhouette:** a sea-sky droplet with a pointed top, a curled antenna ending in a glowing idea-bulb, and two side fins. **Recognisable by:** the droplet point plus the antenna curl.
- **Clothing and accessories:** big round glasses.
- **Interaction style:** appears beside explanations and offers one tip at a time, never a wall of text.
- **Motif:** ocean and sky (waves, bubbles, cloud).
- **Speech tone:** calm and precise, the voice of "let's work it out".
- **Catchphrases:** "Bir bakalım, bunun bir kuralı var." · "Küçük bir ipucu: fiile dikkat et." · "Hata yapmak keşfin bir parçası." · "Adım adım çözelim."

## Sasha — enerjik, sosyal, pozitif

- **Role:** quizzes, games, celebration, speaking, motivation. Hosts `vocab_quiz`, `assessment` and completion.
- **Palette:** body `#f47eb6`, shade `#d9579a`, light `#ffd6ea`, star `#ffd25e`, ink `#3a1838`. Theme: primary `#b42a6f`, accent `#ff8fc4`, wash `#fde9f2`.
- **Silhouette:** a round body with two tall petal-shaped ears in a V and a star-tipped tail. **Recognisable by:** the V of the petal ears.
- **Accessories:** a blossom hair clip and a tiny headset mic (for speaking).
- **Interaction style:** cheers after streaks of effort, not only after correct answers.
- **Motif:** blossom and sparkle.
- **Speech tone:** upbeat and social, but not loud.
- **Catchphrases:** "Hadi, bir tur daha!" · "Sesini duymak istiyorum." · "İşte bu! Harika gidiyorsun." · "Yanlış cevap da bir adım."

## Momo — maceracı, meraklı, kaşif

- **Role:** missions, discovery, travel, the map. Hosts `review` and empty states, and guides the learning map.
- **Palette:** body `#f6c431`, shade `#dba11a`, light `#fff0b8`, hat `#8a5a24`, band `#e2553b`, ink `#3b2a10`. Theme: primary `#8a5a00` (deep honey, so it can carry text), accent `#f6c431`, wash `#fff4cf`.
- **Silhouette:** a wide round body under a broad flat-brimmed explorer hat, with round ears peeking out. **Recognisable by:** the horizontal hat brim.
- **Accessories:** explorer hat with a star on the band, satchel strap.
- **Interaction style:** points the way, for example standing beside the current map node.
- **Motif:** sunshine (sun rays, rolling hills).
- **Speech tone:** curious and forward-looking.
- **Catchphrases:** "Haritada yeni bir yer açıldı!" · "Görev hazır, sen hazır mısın?" · "Bakalım bu yol nereye çıkıyor." · "Bir keşif daha tamam."

## Dora — hayalperest, yaratıcı, sakin

- **Role:** reading, story, listening, dialogue, imagination. Hosts `story` and breaks.
- **Palette:** body `#a77be8`, shade `#8256c9`, face `#e9ddff`, cap `#4b2f86`, moon `#ffd56b`, ink `#2a1c4a`. Theme: primary `#7438bf`, accent `#b99cf2`, wash `#f1eafd`.
- **Silhouette:** a tall oval owl-moth in a floppy night cap that droops to one side with a star pom. Cape wings and large eyes (face scale 1.15). **Recognisable by:** the drooping cap.
- **Accessories:** night cap with a crescent, moon pendant.
- **Interaction style:** slows the pace, asks "what happens next?"
- **Motif:** dream and story (crescent moon, stars, clouds).
- **Speech tone:** soft and storyteller-like.
- **Catchphrases:** "Bir hikâye başlamak üzere…" · "Kelimeleri bir resim gibi düşün." · "Yavaşça oku, acele yok." · "Sence sonra ne olacak?"

## Leo — cesur, kararlı, cesaretlendirici

- **Role:** role-play, speaking challenges, real-life use. Hosts `homework`.
- **Palette:** body `#ff9d45`, mane `#e3772a`, muzzle `#ffe2c2`, bandana `#c8402f`, star `#ffd25e`, ink `#3a1e10`. Theme: primary `#b04a0c`, accent `#ff9d45`, wash `#ffeedf`.
- **Silhouette:** a round head ringed by a mane of rounded sun-spikes, on a small body. **Recognisable by:** the spiky ring.
- **Accessories:** bandana with a star badge.
- **Interaction style:** frames tasks as challenges you can win, and links them to real life.
- **Motif:** courage (mountains, a flag on the peak, the sun).
- **Speech tone:** brave and steady, never macho.
- **Catchphrases:** "Gerçek hayatta da yapabilirsin." · "Zor mu? O zaman tam bize göre." · "Bir kez daha, bu sefer daha cesur." · "Bugün bir adım daha."

## Asset list (per character)

| Asset | Status |
|---|---|
| Rig and 6 expressions (SVG, code) | done (`LuguMascot`) |
| 32px icon readability | done (gallery column) |
| Theme tokens (day/night) | done (`CHARACTERS[key].theme`) |
| World motif | done (`WorldBackground`, `world-motifs.ts`) |
| Bubble | done (`CharacterBubble`) |
| Reference sheet | `/dev/design` |
| Lesson spot illustrations | open: add per content need, using the same rig rules |

## Supporting cast

- **Tiny cats** (`TinyCat`: sit, sleep, peek, walk) are decoration only. They are never named and never speak.
- **Avatars** (`avatars.ts`, 14 original animal explorers composed from parts) use stable keys. Never rename or reuse a key.
