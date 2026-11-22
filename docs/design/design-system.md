# Lugu design system

Lugu: "Küçük adımlar, büyük hayaller." The student side is a warm, illustrated learning world. The admin side is a calm education-management tool. Both use one brand, one token set and one kit (rei-kit 4.4.0).

Sources of truth: `src/assets/main.css` holds the tokens, `src/design/characters.ts` the character themes, and `src/design/components/` the parts. Run the visual review at `/dev/design` (`DesignGallery.vue`, dev builds only).

## 1. Principles

1. **One focus per screen.** On student home, the current lesson is the hero. Everything else is quieter.
2. **Warm, not childish.** Shapes are soft and organic, and the illustration has small details (cats, stars, sparkles). Copy talks to a 13-year-old as a peer. No baby talk, no confetti storms, no exclamation marks on every line.
3. **Decoration lives at the edges.** Scenery stays in corners and along the ground band. The reading area stays calm.
4. **Never colour alone.** Every state also has an icon and a word.
5. **Progress only grows.** XP never decreases, a wrong answer is never punished, and students are never compared with each other.
6. **Use the kit first.** If rei-kit has a control, use it. Lugu adds illustration and layout, not controls (see §11 for the gaps).

## 2. Hierarchy

| Level | Student expression | Admin expression |
|---|---|---|
| 1 Brand | `LuguLogo` in the top bar; mark = steps rising to a star | Logo + "Yönetim" suffix, sidebar head |
| 2 Navigation | Top `NavLinks` (≥768px) / floating `TabBar` (phone), icon + label | `AdminNavList`: vertical, icon + label, active = wash + primary bar |
| 3 Program | `type-hero` (Fredoka 600, clamp 28–40px), `WorldBackground intensity="rich"` | `type-title`, plain canvas |
| 4 Lesson | `type-title` (Fredoka 600, 22–28px) + `type-eyebrow` "Ders 12"; map node = 72px stone | table row / page title |
| 5 Section | `type-section` (Fredoka 500, 20px); `SectionStepper`; the character theme switches here (`SECTION_CHARACTER`) | — |
| 6 Task | `type-task` (Nunito 700, 18px) on a `surface` card, `rounded-card` | — |
| 7 Interaction | rei-kit `BaseButton` with a 3px "lip" that sinks on press; ≥44px | flat buttons, 1px shadow |
| 8 Feedback | `CharacterBubble live` + `positive`/`negative` edge + icon + word | `BaseAlert`, toast |
| 9 Progress | `ProgressStars`, `XpBadge`, map trail, `ProgressBar` | `ProgressBar`, `StatCard`, charts |

Moving down a level means less size, less colour and less ornament. Only levels 1–4 carry illustration.

## 3. Typography

- **Display:** Fredoka 500/600 (`--font-display`, utility `font-display`). Base styles apply it to `h1–h3`. In the admin area `--font-display` is remapped to Nunito.
- **Body/UI:** Nunito Variable (`--font-sans`).
- **Scale:** `type-hero`, `type-title`, `type-section`, `type-task`, `text-base` (16px, line-height 1.5), `text-sm` for secondary text, and `type-eyebrow` (12px, 800, uppercase, tracked). Never go below 12px.
- Set `<html lang="tr">` so that uppercase renders "i" as "İ". Eyebrow copy is always Turkish.

## 4. Colour tokens

Kit roles are redefined, never renamed. All pairs are measured in `src/design/styling.test.ts`.

| Role | Day | Night | Note |
|---|---|---|---|
| canvas | `#fdf7ee` | `#15112a` | warm cream / deep night |
| surface | `#ffffff` | `#1f1a38` | |
| muted | `#f5ebdd` | `#2a2448` | |
| wash | `#efebfb` | `#241e44` | soft ground of the active theme (Lugu addition) |
| ink / ink-soft | `#251d3a` / `#5f5672` | `#f3eefc` / `#b4abc8` | ink-soft ≥5.8:1 on every ground |
| hair | `#eadfce` | `#342d52` | |
| primary / on | `#43399e` / white (9.1:1) | `#a9a1ff` / `#15112a` (8.1) | "gece mavisi" |
| accent / on | `#f08159` / ink (6.1) | `#ff9c7a` / night (9.0) | sunset |
| positive / on | `#23804f` / white (4.9) | `#5fd394` / night (9.8) | |
| negative / on | `#c4423a` / white (5.0) | `#ff8a80` / night (8.0) | |
| warning / on | `#e3a21a` / ink (7.2) | `#f5c04f` / night (10.9) | |
| star | `#f6b92b` | `#f6c443` | stars and XP glyphs only, never text |

**Character themes.** `characterThemeStyle(key)` writes `--char-*` variables. Pair it with `data-character`. These remap primary, accent and wash for that subtree. Role colour is the character's *deep* shade (Piko `#0b6e94`, Sasha `#b42a6f`, Momo `#8a5a00`, Dora `#7438bf`, Leo `#b04a0c`), and each is ≥5.1:1 on canvas. Mascot body colours are decoration. Layout never changes with the theme.

**Admin.** `[data-area="admin"]` sets a neutral canvas (`#f6f6f9`), cooler ink, tighter radii, a flat control edge and the body font for headings. Shells mirror `data-area` onto `<html>` so teleported overlays (drawer, toasts) match.

Rule from the kit: a role never writes on a wash of itself. Words are `text-ink`.

## 5. Spacing, radii, elevation

- Spacing uses the Tailwind 4px scale. Page gutter is 16px on phone and 24px from md. Cards are padded 16–24px. Sections are 40px apart.
- Radii (student / admin): cell 4/4, control 14/10, card 20/14, shell 32/20. Always use `rounded-card` and the other role names, never `rounded-xl`.
- Elevation: `surface`, `surface-raised` and `surface-overlay`, plus `shadow-(--shadow-*)`. Student shadows are warm (`--shadow-color #4a3412`). Controls stand on a 3px lip (`--shadow-control`) and drop to 1px when pressed.

## 6. Motion

- Kit durations are 150/200/340/420ms. Lugu adds `--duration-celebrate` (900ms) and `--duration-idle` (3.6s).
- Utilities: `animate-bob`, `animate-twinkle`, `animate-drift`, `animate-burst`, plus the kit's `animate-pop` and `animate-glow`.
- Mascot idle (bob + blink) is opt-in (`animated`). The celebration burst plays once and never loops.
- Under `prefers-reduced-motion`, every Lugu animation stops and kit durations go to 0. The only thing that keeps moving is the spinner (slow fade), so the page never looks hung.
- Never fade text. Opacity animation is used only on decorative SVG.

## 7. Layout

**Student** (phone/tablet first). `StudentShell` has a brand bar, `<main>` scrolls, and the floating `TabBar` shows below 768px (`NavLinks` from 768px). Content max width is 72rem. The map runs as one winding column with ±22% swing on phone and ±30% from md.

**Admin** (desktop first, usable on tablet). `AdminShell` has a 256px sidebar from 1024px. Below that, a top-bar menu button opens rei-kit's `BaseDrawer`. Content is capped at `--measure-page`. Tables use `DataTable`.

Breakpoints are Tailwind defaults: sm 640, md 768 (tablet), lg 1024 (admin sidebar), xl 1280.

## 8. Accessibility

- Contrast: AA (4.5:1) for all text and on-* pairs, both themes, all character themes and admin. This is enforced by tests.
- Focus: kit controls ring themselves. Hand-drawn controls use `focus-ring` or `peer-focus-visible` (the AvatarPicker tiles).
- Touch targets are ≥44px (kit `md` buttons, map stones are 72px, nav rows are 44px).
- Status is never shown by colour alone. The map uses icon + visible state word + `aria-current="step"` + "Şu an buradasın" (sr). Stars use dashed outlines when empty. The selected avatar shows a tick.
- Landmarks: each shell has `SkipLink`, a header, a named nav and `<main id>`. Mascots are `aria-hidden` unless given a `label`.
- Live regions: `CompletionCelebration` (status), `CharacterBubble live`, `EmptyScene tone="error"` (alert), `LoadingScene` (kit spinner status).

## 9. States

| State | Component | Notes |
|---|---|---|
| Loading (page/panel) | `LoadingScene` (Piko thinking + `BaseSpinner`) | lists: kit `SkeletonList` |
| Empty | `EmptyScene` (mascot + kit `EmptyState`) | always offer the way out in the slot |
| Error | `EmptyScene tone="error"` | surprised host, "Tekrar dene" |
| Completion | `CompletionCelebration` | stars, XP, actions slot |
| Break | `BreakScene` | page supplies countdown + "Erken dön"/"Başla"; nothing starts automatically |
| Feedback | `CharacterBubble live` | |
| Toasts | kit `ToastHost` (inside both shells) | App.vue must not add another |

## 10. Preset

`rei-kit/web.css` is used, not `mobile.css`. The mobile preset's shell is a fixed 430px phone column (`.shell-frame`, slide transitions). That is wrong for a student app that must also be good on tablets, and for an admin that is desktop-first. Every component style ships in both presets, so the floating `TabBar` and sheets still work. Lugu builds its own shells and takes the wide shell's page fade.

## 11. Kit gaps (built in Lugu, should move to rei-kit)

- **Picture radio group:** `BaseRadioGroup` is text-only, so `AvatarPicker` hand-writes a fieldset of sr-only radios.
- **Vertical nav with icons:** `NavLinks` is a horizontal row without icons, so `AdminNavList` is hand-written.
- **Two banners:** `TabBar` renders its own `<header>`, so the student shell has two banner landmarks on phone.
- **Hard dependency on `vue-i18n`:** rei-kit's main entry statically imports `vue-i18n` (an optional peer). An app without it fails at runtime in Vite.
