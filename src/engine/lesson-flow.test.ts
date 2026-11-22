import { describe, expect, it } from 'vitest'

import { testPackage } from './testing/package'
import {
  canEnter,
  complete,
  createLessonFlow,
  enter,
  isLessonComplete,
  nextSection,
  offersBreakAfter,
  sectionStatus,
  sectionStatuses,
  skip,
} from './lesson-flow'

const pkg = testPackage()
const withReview = testPackage({ review: { questions: [{ id: 'rv-1', type: 'choice', prompt: 'Review?', options: ['a', 'b'], answer: 0 }] } })
const rules = pkg.completion

describe('lesson flow', () => {
  it('skips review when there is nothing to review', () => {
    expect(createLessonFlow(pkg).sections[0]).toBe('vocabulary')
    expect(createLessonFlow(pkg, { runtimeReviewCount: 2 }).sections[0]).toBe('review')
    expect(createLessonFlow(withReview).sections[0]).toBe('review')
  })

  it('locks every section behind an incomplete mandatory one', () => {
    const f = createLessonFlow(pkg)
    expect(sectionStatus(f, 'vocabulary')).toBe('available')
    expect(sectionStatus(f, 'vocab_quiz')).toBe('locked')
    expect(canEnter(f, 'story')).toBe(false)
    expect(enter(f, 'story')).toBe(false)
    expect(enter(f, 'vocabulary')).toBe(true)
    expect(sectionStatus(f, 'vocabulary')).toBe('in_progress')
    expect(complete(f, 'vocab_quiz')).toBe(false)
    complete(f, 'vocabulary')
    expect(sectionStatus(f, 'vocabulary')).toBe('completed')
    expect(sectionStatus(f, 'vocab_quiz')).toBe('available')
    expect(sectionStatus(f, 'story')).toBe('locked')
  })

  it('review is optional: later sections are open and it can be skipped', () => {
    const f = createLessonFlow(withReview)
    expect(sectionStatus(f, 'vocabulary')).toBe('available')
    expect(nextSection(f)).toBe('review')
    expect(skip(f, 'review')).toBe(true)
    expect(nextSection(f)).toBe('vocabulary')
    expect(canEnter(f, 'review')).toBe(true)
    expect(skip(f, 'vocabulary')).toBe(false)
  })

  it('can go back to completed sections and follows the order to the end', () => {
    const f = createLessonFlow(pkg)
    for (const k of f.sections) {
      expect(nextSection(f)).toBe(k)
      enter(f, k)
      complete(f, k)
    }
    expect(nextSection(f)).toBeNull()
    expect(enter(f, 'vocabulary')).toBe(true)
    expect(sectionStatus(f, 'vocabulary')).toBe('completed')
    expect(sectionStatuses(f).every((s) => s.status === 'completed')).toBe(true)
  })

  it('a section whose rule is off does not block the next one', () => {
    const f = createLessonFlow({ ...pkg, completion: { ...rules, requireStory: false } })
    complete(f, 'vocabulary')
    complete(f, 'vocab_quiz')
    expect(sectionStatus(f, 'explanation')).toBe('available')
    expect(f.mandatory.has('story')).toBe(false)
  })

  it('resumes from server progress', () => {
    const f = createLessonFlow(pkg, { completed: ['vocabulary', 'vocab_quiz', 'review'], started: ['story'] })
    expect(sectionStatus(f, 'story')).toBe('in_progress')
    expect(f.completed.has('review')).toBe(false)
    expect(nextSection(f)).toBe('story')
  })

  it('offers breaks between sections, never after the assessment', () => {
    const f = createLessonFlow(pkg)
    expect(offersBreakAfter(f, 'vocabulary')).toBe(false)
    complete(f, 'vocabulary')
    expect(offersBreakAfter(f, 'vocabulary')).toBe(true)
    for (const k of f.sections) complete(f, k)
    expect(offersBreakAfter(f, 'homework')).toBe(false)
    expect(offersBreakAfter(f, 'assessment')).toBe(false)
  })
})

describe('isLessonComplete', () => {
  const done = { vocabMastered: true, storyCompleted: true, homeworkCompleted: true, assessmentSubmitted: true, assessmentPercent: 40 }

  it('requires every enabled rule', () => {
    expect(isLessonComplete(rules, done)).toEqual({ complete: true, missing: [] })
    expect(isLessonComplete(rules, { ...done, vocabMastered: false, storyCompleted: false }).missing).toEqual(['vocab_mastery', 'story'])
  })

  it('a high assessment never replaces vocabulary mastery', () => {
    expect(isLessonComplete(rules, { ...done, vocabMastered: false, assessmentPercent: 100 }).complete).toBe(false)
  })

  it('applies the supplementary assessment threshold', () => {
    const strict = { ...rules, minAssessmentPercent: 60 }
    expect(isLessonComplete(strict, done).missing).toEqual(['assessment_percent'])
    expect(isLessonComplete(strict, { ...done, assessmentPercent: 60 }).complete).toBe(true)
    expect(isLessonComplete({ ...strict, requireAssessment: false }, { ...done, assessmentSubmitted: false, assessmentPercent: null }).missing).toEqual(['assessment'])
  })

  it('disabled rules are not checked', () => {
    const loose = { ...rules, requireStory: false, requireHomework: false, requireAssessment: false }
    expect(isLessonComplete(loose, { ...done, storyCompleted: false, homeworkCompleted: false, assessmentSubmitted: false }).complete).toBe(true)
  })
})
