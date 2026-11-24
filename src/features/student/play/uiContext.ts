import { inject, type InjectionKey, type Ref } from 'vue'

/** What the lesson player lends to a play template. `timed` = a timed round is running (ambient goes off). */
export interface PlayUi {
  timed: Ref<boolean>
}

export const PLAY_UI: InjectionKey<PlayUi> = Symbol('play-ui')
export const usePlayUi = (): PlayUi | null => inject(PLAY_UI, null)
