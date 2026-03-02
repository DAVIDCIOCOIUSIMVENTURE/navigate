import { describe, it, expect } from 'vitest'
import { USE_CASES } from './use-cases'

describe('USE_CASES data integrity', () => {
  it('has at least one use case', () => {
    expect(USE_CASES.length).toBeGreaterThan(0)
  })

  it('every use case has required top-level fields', () => {
    for (const uc of USE_CASES) {
      expect(uc).toHaveProperty('title')
      expect(typeof uc.title).toBe('string')
      expect(uc.title.length).toBeGreaterThan(0)
      expect(uc).toHaveProperty('jobs')
      expect(uc).toHaveProperty('customer')
      expect(uc).toHaveProperty('subSegment')
    }
  })

  it('every job has all JTBD fields and at least one problem', () => {
    for (const uc of USE_CASES) {
      expect(uc.jobs.length).toBeGreaterThan(0)
      for (const job of uc.jobs) {
        expect(typeof job.job).toBe('string')
        expect(typeof job.functional).toBe('string')
        expect(typeof job.emotional).toBe('string')
        expect(typeof job.social).toBe('string')
        expect(Array.isArray(job.problems)).toBe(true)
        expect(job.problems.length).toBeGreaterThan(0)
      }
    }
  })

  it('every customer has all required fields as non-empty strings', () => {
    const requiredFields = [
      'segment', 'ageFrom', 'ageTo',
      'whoTheyAre', 'whatTheyDo',
      'goalsAndMotivations', 'frustrationsAndChallenges',
    ] as const
    for (const uc of USE_CASES) {
      for (const field of requiredFields) {
        expect(typeof uc.customer[field]).toBe('string')
        expect(uc.customer[field].length).toBeGreaterThan(0)
      }
    }
  })

  it('every subSegment has all required fields as non-empty strings', () => {
    const requiredFields = [
      'name', 'differentiators', 'specificContext', 'uniqueNeeds',
    ] as const
    for (const uc of USE_CASES) {
      for (const field of requiredFields) {
        expect(typeof uc.subSegment[field]).toBe('string')
        expect(uc.subSegment[field].length).toBeGreaterThan(0)
      }
    }
  })
})
