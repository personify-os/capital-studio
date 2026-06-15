import { describe, it, expect } from 'vitest'
import { buildIntentContext, getGenerationMode, buildIntentString, EMPTY_INTENT, TOPIC_TIERS } from '@/lib/content-intent'

describe('buildIntentContext', () => {
  it('returns null when nothing is set', () => {
    expect(buildIntentContext(EMPTY_INTENT)).toBeNull()
  })
  it('includes the topic label when a tier is set', () => {
    const ctx = buildIntentContext({ ...EMPTY_INTENT, tier1Id: 'espa-program', tier2Id: 'how-espa-works' })
    expect(ctx).toContain('ESPA / Preventive Access')
    expect(ctx).toContain('How ESPA Works')
  })
})

describe('getGenerationMode', () => {
  it('is structured for the ESPA savings calculator', () => {
    expect(getGenerationMode('espa-employer-savings')).toBe('structured')
  })
  it('is freeform for normal subtopics', () => {
    expect(getGenerationMode('how-espa-works')).toBe('freeform')
    expect(getGenerationMode(null)).toBe('freeform')
  })
})

describe('buildIntentString', () => {
  it('joins set parts and omits empties', () => {
    expect(buildIntentString(['Telehealth'], 'Education', '')).toBe('Topic: Telehealth · Purpose: Education')
    expect(buildIntentString([], '', '')).toBe('')
  })
})

describe('TOPIC_TIERS', () => {
  it('includes the ESPA program tier', () => {
    expect(TOPIC_TIERS.some((t) => t.id === 'espa-program')).toBe(true)
  })
})
