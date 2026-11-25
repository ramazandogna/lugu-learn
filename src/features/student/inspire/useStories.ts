import { computed, ref } from 'vue'

import { STORIES } from './stories'
import type { Choice, Frame, Line, Story, StoryProgress } from './storyTypes'

/*
 * Hikâye ilerlemesi: localStorage `lugu.story.v1` = Record<storyId, StoryProgress>.
 * Hatıra şekeri çaba kriteriyle gelir (hikâyeyi sonuna kadar oynamak): kayıp yok, kilit yok.
 */
const KEY = 'lugu.story.v1'
export const BADGE_NAME = 'Hikâye Koleksiyoncusu'

function read(): Record<string, StoryProgress> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const out: Record<string, StoryProgress> = {}
    for (const [id, v] of Object.entries(raw as Record<string, Partial<StoryProgress>>)) {
      if (!STORIES.some((s) => s.id === id) || !v || typeof v.frame !== 'number') continue
      out[id] = {
        frame: v.frame,
        picks: v.picks && typeof v.picks === 'object' ? v.picks : {},
        done: !!v.done,
        endingsSeen: Array.isArray(v.endingsSeen) ? v.endingsSeen.filter((x): x is string => typeof x === 'string') : [],
        at: typeof v.at === 'string' ? v.at : '',
      }
    }
    return out
  } catch {
    return {}
  }
}

const all = ref<Record<string, StoryProgress>>(read())

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(all.value))
  } catch {
    /* storage blocked: progress lasts for this visit only */
  }
}

/** The choice that decides the ending: the last one in the story. */
export function endingChoice(story: Story): Choice | undefined {
  return [...story.frames].reverse().find((f) => f.choice)?.choice
}

function pickedOption(story: Story, picks: Record<string, string>, choiceId: string) {
  const choice = story.frames.find((f) => f.choice?.id === choiceId)?.choice
  return choice?.options.find((o) => o.id === picks[choiceId])
}

/** `{pick:id}` filled from the learner's picks; a missing pick shows an ellipsis. */
export function fillLine(story: Story, line: Line, picks: Record<string, string>): Line {
  const sub = (s: string, k: 'en' | 'tr') => s.replace(/\{pick:(\w+)\}/g, (_, id: string) => pickedOption(story, picks, id)?.[k] ?? '…')
  return { en: sub(line.en, 'en'), tr: sub(line.tr, 'tr') }
}

/** What a frame says: a result frame speaks the result of the option picked. */
export function lineOf(story: Story, frame: Frame, picks: Record<string, string>): Line {
  if (frame.from) {
    const o = pickedOption(story, picks, frame.from)
    if (o) return fillLine(story, o.result, picks)
  }
  return fillLine(story, frame.line, picks)
}

export function useStories() {
  const progress = (id: string): StoryProgress | undefined => all.value[id]
  const save = (id: string, p: StoryProgress) => {
    all.value = { ...all.value, [id]: { ...p, at: new Date().toISOString() } }
    persist()
  }
  /** Saves the frame the learner is on; leaving keeps this spot. */
  function setFrame(story: Story, frame: number, picks: Record<string, string>) {
    const p = progress(story.id)
    save(story.id, { frame, picks, done: p?.done ?? false, endingsSeen: p?.endingsSeen ?? [], at: '' })
  }
  /** Reached the end: souvenir is earned, the ending seen is noted. */
  function finish(story: Story, picks: Record<string, string>) {
    const p = progress(story.id)
    const end = endingChoice(story)
    const seen = new Set(p?.endingsSeen ?? [])
    const o = end ? picks[end.id] : undefined
    if (o) seen.add(o)
    save(story.id, { frame: story.frames.length - 1, picks, done: true, endingsSeen: [...seen], at: '' })
  }
  /** "Bu sefer farklı seç": back to frame 1, souvenir and endings kept. */
  function restart(story: Story) {
    const p = progress(story.id)
    save(story.id, { frame: 0, picks: {}, done: p?.done ?? false, endingsSeen: p?.endingsSeen ?? [], at: '' })
  }
  const doneCount = computed(() => STORIES.filter((s) => all.value[s.id]?.done).length)
  const resumable = computed(() => {
    const open = STORIES.filter((s) => {
      const p = all.value[s.id]
      return p && !p.done && p.frame > 0
    }).sort((a, b) => (all.value[b.id]?.at ?? '').localeCompare(all.value[a.id]?.at ?? ''))
    return open[0]
  })
  return { progress, setFrame, finish, restart, doneCount, resumable, badge: computed(() => doneCount.value >= STORIES.length) }
}
