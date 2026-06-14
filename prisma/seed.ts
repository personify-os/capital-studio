import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { BRAND_CONFIGS } from '../lib/brands'

const prisma = new PrismaClient()

async function main() {
  const email    = 'info@lhccapital.org'
  const password = process.env.SEED_PASSWORD ?? '$imrp2LHC'
  const name     = 'LH Capital'

  // Ensure tenant exists
  const tenant = await prisma.tenant.upsert({
    where:  { id: 'lhcapital' },
    create: { id: 'lhcapital', name: 'LH Capital', slug: 'lhcapital' },
    update: {},
  })

  const hashed = await bcrypt.hash(password, 12)

  // NOTE: never overwrite the password on update. Re-running the seed (locally
  // or in any env) must not clobber the live login password with SEED_PASSWORD.
  // The password is only set when the user is first created. To rotate it, set
  // SEED_PASSWORD and pass ROTATE_PASSWORD=1.
  const rotate = process.env.ROTATE_PASSWORD === '1'
  const user = await prisma.user.upsert({
    where:  { email },
    create: {
      email,
      name,
      password: hashed,
      tenantId: tenant.id,
      role:     'ADMIN',
    },
    update: {
      name,
      ...(rotate ? { password: hashed } : {}),
    },
  })

  console.log(`✓ User ready: ${user.email} (tenant: ${tenant.id})`)

  // Default ESPA (BizPower Benefits) brand profile so it appears, populated,
  // in the Brand Vault. The rich brand voice lives in lib/brands.ts; this seeds
  // a doc-derived knowledge summary the team can edit/extend (e.g. upload the
  // BizPower carrier PDFs to enrich it).
  const espaGuidelines = [
    'ESPA (Employer Sponsored Preventive Access) by BizPower Benefits integrates a compliant preventive health plan, a Self-Insured Medical Reimbursement Plan (SIMRP), and a Section 125 cafeteria plan.',
    'Employer value: average net savings of $505.20 per employee per year in FICA payroll taxes after admin fees, beginning the first payroll after enrollment. No net cost — fees and premiums are funded by the tax savings.',
    'Employee value: 24/7 telehealth (Amaze Health), mental health (psychiatry + unlimited counseling), 1,000+ $0 medications (Rx Valet), annual 75+ biomarker lab panel (Quest/Labcorp), vision care, virtual Rx renewal, and virtual pet care — zero out-of-pocket, for the whole family.',
    'Employees also receive ~$150/month to allocate toward voluntary benefits: Accident, Cancer, Critical Illness, Hospital Indemnity, Disability, and Life — with no reduction in take-home pay.',
    'Live Well USA member perks: legal resources, credit monitoring, identity protection, wholesale travel discounts, and a wellness app.',
    'Compliance: built on Section 125 and IRS 213(d); HIPAA, ERISA, and ACA compliant. Not tax advice; all figures are estimates.',
    'Eligibility: 10+ W-2 employees with access to health coverage (employer, spouse/parent, or individual). Excludes 1099 contractors, Medicare, and marketplace-subsidy employees. Open to businesses, nonprofits, churches, schools, counties, and cities.',
    'Implementation: census → exact savings + per-employee allotment → enrollment (auto/in-person/virtual) → payroll setup → savings begin next month.',
    'Contact: BizPower Benefits — 629-275-3255 — BizPowerBenefits.com — Nashville, TN & Tuscumbia, AL.',
  ].join('\n\n')

  // Populate the Brand Vault profile from the static ESPA config so colors,
  // voice/audience, products, etc. all show (and are editable) in the UI.
  const e = BRAND_CONFIGS.espa
  const espa = await prisma.brandProfile.upsert({
    where:  { id: 'brand-espa-default' },
    create: {
      id:        'brand-espa-default',
      tenantId:  tenant.id,
      type:      'ESPA',
      name:      'ESPA by BizPower',
      isDefault: true,
      logoUrl:   e.logoUrl || null,
      config:    {
        tagline:     e.tagline,
        tone:        e.tone,
        audience:    e.audience,
        products:    e.products,
        keyMessages: e.keyMessages,
        visualStyle: e.visualStyle,
        colors:      { ...e.colors } as Record<string, string>,
        guidelines:  espaGuidelines,
      },
    },
    update: {}, // idempotent — don't clobber edits the team has made in Brand Vault
  })

  console.log(`✓ ESPA brand profile ready: ${espa.name} (${espa.id})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
