// ─── Brand Configuration ──────────────────────────────────────────────────────
// Single source of truth for the three brand identities used in Capital Studio.
// The AI generation services consume these configs to inject brand context into prompts.

export type BrandId = 'lhcapital' | 'simrp' | 'personal'

export interface BrandColors {
  primary:    string // dominant brand color
  secondary:  string // supporting color
  accent:     string // highlight / CTA
  dark:       string // dark text / backgrounds
  light:      string // light backgrounds / borders
}

export interface BrandConfig {
  id:          BrandId
  label:       string      // display name
  shortName:   string      // used in prompts and badges
  colors:      BrandColors
  fonts:       { heading: string; body: string }
  tagline:     string
  tone:        string      // natural language tone description for AI prompts
  audience:    string      // target audience description
  products:    string[]    // key products/offerings for prompt context
  voiceRestrictions?: {
    neverSay:  string[]
    alwaysDo:  string[]
  }
}

export const BRAND_CONFIGS: Record<BrandId, BrandConfig> = {
  lhcapital: {
    id:        'lhcapital',
    label:     'LH Capital',
    shortName: 'LHC',
    colors: {
      primary:   '#0475ae', // Vivid Azure (confirmed Canva)
      secondary: '#041740', // Dark Blue (confirmed Canva)
      accent:    '#ed6835', // Orange (confirmed lhccapital.org)
      dark:      '#070e1a', // Near-black (confirmed lhccapital.org)
      light:     '#f9f9f9', // Off-white (confirmed lhccapital.org)
    },
    fonts:    { heading: 'Inter', body: 'Inter' },
    tagline:  'Building Legacies. Protecting Futures.',
    tone:     'Professional, trustworthy, consultative. Speaks to business owners and HR/finance decision-makers. Clear, confident, never salesy.',
    audience: 'Business owners, HR directors, CFOs, and benefits managers at companies with 10–1,000+ employees',
    products: [
      'SIMRP (Self-Insured Medical Reimbursement Plan)',
      'Supplemental Benefits',
      'Employee Wellness Programs',
      'Group Life Insurance',
      'Critical Illness Coverage',
      'Tax Savings Strategies',
    ],
    voiceRestrictions: {
      neverSay: [
        '"insurance" to describe the SIMRP — it is a medical reimbursement plan, not insurance',
        '"free benefits" — always clarify it redirects existing payroll dollars',
        'specific dollar promises without noting these are estimates',
      ],
      alwaysDo: [
        'frame SIMRP savings as redirecting existing payroll tax dollars',
        'position LH Capital as a trusted consultant, not a vendor',
        'speak to CFO/HR director decision-making authority',
      ],
    },
  },

  simrp: {
    id:        'simrp',
    label:     'The SIMRP',
    shortName: 'SIMRP',
    colors: {
      primary:   '#689EB8',
      secondary: '#0B2147',
      accent:    '#00c4cc',
      dark:      '#0B2147',
      light:     '#F0F7FF',
    },
    fonts:    { heading: 'Inter', body: 'Inter' },
    tagline:  'The Infinite Savings Plan',
    tone:     'Educational, empowering, clarity-focused. Explains complex IRS tax codes in plain language. Outcome-driven: savings, benefits, zero impact on take-home pay.',
    audience: 'Employers, CFOs, business owners seeking tax-advantaged employee benefits without increasing costs',
    products: [
      'SIMRP — Self-Insured Medical Reimbursement Plan',
      'IRS §125 Cafeteria Plan',
      'IRS §105/106 Medical Benefits',
      '$550/employee/year average payroll tax savings',
      '$150/employee/month supplemental benefits allotment',
      'Telehealth (zero copay)',
    ],
    voiceRestrictions: {
      neverSay: [
        '"free" or "no cost" without explaining the payroll tax redirect mechanism',
        '"insurance" when describing the SIMRP',
        'specific savings dollar amounts as guarantees',
      ],
      alwaysDo: [
        'call it "the SIMRP" or "the Self-Insured Medical Reimbursement Plan"',
        'explain that savings come from redirecting FICA/payroll taxes, not adding new costs',
        'emphasize zero impact on employee take-home pay',
      ],
    },
  },

  personal: {
    id:        'personal',
    label:     'Personal Brand',
    shortName: 'Personal',
    colors: {
      primary:   '#188bf6',
      secondary: '#0B2147',
      accent:    '#37ca37',
      dark:      '#0B2147',
      light:     '#F5F8FF',
    },
    fonts:    { heading: 'Inter', body: 'Inter' },
    tagline:  '',   // set from Brand Vault
    tone:     '',   // set from Brand Vault
    audience: '',   // set from Brand Vault
    products: [],   // set from Brand Vault
  },
}

export function getBrandConfig(id: BrandId): BrandConfig {
  return BRAND_CONFIGS[id]
}

/** Builds a concise brand context block injected into AI prompts */
export function buildBrandPromptContext(brand: BrandConfig): string {
  const lines = [
    `Brand: ${brand.label} (${brand.shortName})`,
    `Tagline: ${brand.tagline}`,
    `Tone: ${brand.tone}`,
    `Audience: ${brand.audience}`,
    brand.products.length > 0
      ? `Key products/offerings: ${brand.products.join(', ')}`
      : null,
    `Primary color: ${brand.colors.primary}`,
    `Secondary color: ${brand.colors.secondary}`,
    brand.voiceRestrictions?.neverSay && brand.voiceRestrictions.neverSay.length > 0
      ? `Never say/imply: ${brand.voiceRestrictions.neverSay.join('; ')}`
      : null,
    brand.voiceRestrictions?.alwaysDo && brand.voiceRestrictions.alwaysDo.length > 0
      ? `Always do: ${brand.voiceRestrictions.alwaysDo.join('; ')}`
      : null,
  ]
  return lines.filter(Boolean).join('\n')
}
