import { describe, expect, it } from 'vitest'

import { testPackage } from './testing/package'
import {
  advanceScene,
  answerStoryQuestion,
  backScene,
  canAdvanceScene,
  chooseInScene,
  currentScene,
  currentStoryQuestion,
  isStoryComplete,
  nextStoryQuestion,
  restoreStory,
  revealStoryHint,
  snapshotStory,
  startStory,
} from './story'

const pkg = testPackage()

describe('story', () => {
  it('blocks a scene with a choice until a choice is made; every choice is acceptable', () => {
    const r = startStory(pkg)
    expect(chooseInScene(r, 0)).toBeNull() // scene 1 has no choice
    expect(advanceScene(r)).toBe(true)
    expect(currentScene(r)?.id).toBe('sc-2')
    expect(canAdvanceScene(r)).toBe(false)
    expect(advanceScene(r)).toBe(false)
    expect(chooseInScene(r, 1)).toBe('Ama okul var!')
    expect(chooseInScene(r, 0)).toBe('Afiyet olsun!')
    expect(chooseInScene(r, 5)).toBeNull()
    expect(r.choices['sc-2']).toBe(0)
    expect(advanceScene(r)).toBe(true)
    expect(backScene(r)).toBe(true)
    expect(currentScene(r)?.id).toBe('sc-2')
  })

  it('moves into practice questions with hints, retries and explanations', () => {
    const r = startStory(pkg)
    advanceScene(r)
    chooseInScene(r, 1)
    advanceScene(r)
    advanceScene(r)
    expect(r.phase).toBe('questions')
    expect(nextStoryQuestion(r)).toBe(false) // must answer first
    expect(revealStoryHint(r)).toBe('Sahne 2')
    expect(answerStoryQuestion(r, 1)).toEqual({ questionId: 'sq-1', correct: false, attemptNo: 1, hintUsed: true, explain: 'Evet.' })
    expect(answerStoryQuestion(r, 0)).toMatchObject({ correct: true, attemptNo: 2, hintUsed: false })
    expect(nextStoryQuestion(r)).toBe(true)
    expect(currentStoryQuestion(r)?.id).toBe('sq-2')
    expect(revealStoryHint(r)).toBeNull()
    expect(answerStoryQuestion(r, 'the park')?.correct).toBe(false)
    expect(isStoryComplete(r)).toBe(true) // answered at least once is enough
    expect(nextStoryQuestion(r)).toBe(true)
    expect(r.phase).toBe('done')
    expect(r.stats['sq-1']).toEqual({ attempts: 2, correct: true, hintUsed: true })
  })

  it('snapshot round-trips and rejects foreign snapshots', () => {
    const r = startStory(pkg)
    advanceScene(r)
    chooseInScene(r, 1)
    const snap = JSON.parse(JSON.stringify(snapshotStory(r))) as unknown
    const back = restoreStory(snap, pkg)
    expect(back.scene).toBe(1)
    expect(back.choices).toEqual({ 'sc-2': 1 })
    expect(restoreStory({ ...snapshotStory(r), choices: { 'sc-2': 7 } }, pkg).scene).toBe(0)
    expect(restoreStory({ ...snapshotStory(r), sceneIds: ['x'] }, pkg).scene).toBe(0)
    expect(restoreStory(42, pkg).phase).toBe('scenes')
  })
})
