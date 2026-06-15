import { describe, it, expect } from 'vitest'
import { parsePlan, rowToBrief } from '@/lib/plan-parse'

const csv = [
  'ESPA 30-Day Calendar',
  'Day,Audience,Theme,Platform(s),Hook / Headline,Post Copy,CTA,Asset / Format',
  '1,Employer,1 Problem,"LinkedIn, FB",Your people can\'t afford more.,"Most employers are stuck, between costs and pay.",Run your numbers,Static card',
  '2,Referral,4 Opportunity,"FB, IG",Side income without selling.,Know business owners? Introduce us.,Become a partner,Reel',
  ',,,,,,,',
]
  .join('\n')

describe('parsePlan (CSV)', () => {
  it('detects the header row and maps columns', async () => {
    const rows = await parsePlan(Buffer.from(csv, 'utf8'), 'plan.csv')
    expect(rows).toHaveLength(2)
    expect(rows[0].day).toBe('1')
    expect(rows[0].audience).toBe('Employer')
    expect(rows[0].theme).toBe('1 Problem')
    expect(rows[0].platforms).toBe('LinkedIn, FB')
    expect(rows[0].hook).toBe("Your people can't afford more.")
    expect(rows[0].copy).toContain('Most employers are stuck, between costs and pay.') // quoted comma preserved
    expect(rows[0].cta).toBe('Run your numbers')
  })

  it('skips empty rows (no hook or copy)', async () => {
    const rows = await parsePlan(Buffer.from(csv, 'utf8'), 'plan.csv')
    expect(rows.every((r) => r.hook || r.copy)).toBe(true)
  })

  it('rejects unsupported extensions', async () => {
    await expect(parsePlan(Buffer.from('x'), 'plan.txt')).rejects.toThrow()
  })

  it('returns [] when no recognizable header exists', async () => {
    const rows = await parsePlan(Buffer.from('just,some\nrandom,data', 'utf8'), 'x.csv')
    expect(rows).toEqual([])
  })
})

describe('rowToBrief', () => {
  it('renders labeled, non-empty fields in order', () => {
    const brief = rowToBrief({ day: '3', audience: 'Employer', hook: 'Same paycheck.', cta: 'Learn more' })
    expect(brief).toBe('Day: 3\nAudience: Employer\nHook/Headline: Same paycheck.\nCall to action: Learn more')
  })
})
