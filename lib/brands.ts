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
  logoUrl:     string      // brand logo URL for visual reference (image/graphic prompts)
  colors:      BrandColors
  fonts:       { heading: string; body: string }
  tagline:     string
  tone:        string      // natural language tone description for AI prompts
  audience:    string      // target audience description
  products:    string[]    // key products/offerings for prompt context
  knowledgeBase: string[]  // key facts, proof points, and talking points
  keyMessages:   string[]  // core messaging pillars (for copy and captions)
  visualStyle:   string    // visual aesthetic description for image/graphic/video AI prompts
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
    logoUrl:   'https://lhccapital.org/wp-content/uploads/lhc-logo.png', // update with confirmed URL
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
    knowledgeBase: [
      'LH Capital is a financial services consulting firm specializing in employee benefits optimization and tax savings strategies.',
      'Primary offering: the SIMRP — a Self-Insured Medical Reimbursement Plan authorized under IRS §125, §105, and §106.',
      'Employers save an average of $550 per enrolled employee per year in FICA/payroll taxes.',
      'Employees receive a $150/month supplemental benefits allotment with zero change to take-home pay.',
      'The SIMRP works alongside any existing group health insurance — no disruption to current benefits.',
      'Benefits included: telehealth (zero copay, 24/7), hospital indemnity, accident coverage, critical illness, term life insurance.',
      'Savings come from redirecting existing pre-tax payroll dollars — no new cost to the employer.',
      'LH Capital handles white-glove implementation and ongoing support; enrollment is fully digital and takes ~10 minutes per employee.',
      'LH Capital agents earn residual income on every employee enrolled, creating a recurring revenue stream.',
      'Serving businesses of 5–5,000+ employees across all industries; no industry restrictions.',
      'LH Capital positions itself as a trusted consulting partner, not an insurance vendor.',
      'The SIMRP has been IRS-authorized since the early 2000s and is used by tens of thousands of companies nationwide.',
    ],
    keyMessages: [
      "Building Legacies. Protecting Futures. — LH Capital helps businesses protect what they've built while creating lasting value for employees.",
      'Redirect existing payroll dollars into powerful employee benefits — at no new cost to the employer.',
      'The average employer saves $550 per employee per year, simply by implementing a smarter benefits structure.',
      'Give employees $150/month in real benefits — telehealth, life insurance, and more — without touching take-home pay.',
      "LH Capital agents don't just sell benefits. They show businesses how to fund them from dollars already leaving the payroll.",
      'No new costs. No disruption to existing coverage. Just smarter tax strategy — and real results.',
    ],
    visualStyle: `Clean, modern corporate aesthetic. Dark navy (#041740) and azure blue (#0475ae) as the foundation, with strategic orange (#ed6835) accents for CTAs and highlights. Photography style: confident professionals in business settings, handshakes, meetings, and office environments. Typography: bold, clean sans-serif (Inter) with generous whitespace. Infographic elements should use clear data visualization — dollar amounts, percentages, and employee counts in large, prominent type. Overall feel: trustworthy, established, premium but approachable.`,
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
    logoUrl:   'https://thesimrp.com/wp-content/uploads/simrp-logo.png', // update with confirmed URL
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
    knowledgeBase: [
      'The SIMRP (Self-Insured Medical Reimbursement Plan) is an IRS-authorized tax strategy operating under §125, §105, and §106 of the Internal Revenue Code.',
      'The SIMRP works by redirecting a portion of an employee\'s pre-tax payroll dollars into a tax-exempt supplemental benefits allotment.',
      'Employers save an average of $550 per enrolled employee per year in FICA taxes (employer\'s share is 7.65% of wages).',
      'Employees receive $150/month (up to $1,800/year) in supplemental benefits — at zero change to their take-home pay.',
      'The employee\'s taxable income is reduced, which means both the employer and employee pay less in FICA taxes.',
      'Benefits allotment covers: telehealth with zero copay (24/7, including mental health and dermatology), hospital indemnity, accident coverage, critical illness, and term life insurance.',
      'Telehealth benefit includes unlimited doctor visits, prescription savings, and specialist consultations — available immediately upon enrollment.',
      'The SIMRP does NOT replace or interfere with existing group health insurance. It works alongside any current coverage.',
      'Implementation is fully digital: enrollment takes approximately 10 minutes per employee.',
      'The SIMRP is compliant with ACA, ERISA, and IRS regulations. It has been used by tens of thousands of U.S. employers since the early 2000s.',
      'No minimum employee count to qualify — businesses with as few as 5 employees can implement the SIMRP.',
      'There is no cost to the employer beyond the implementation fee, which is typically offset within the first month of savings.',
      'The tagline "The Infinite Savings Plan" reflects the fact that savings compound year-over-year as headcount grows.',
    ],
    keyMessages: [
      'The SIMRP is not insurance — it\'s a tax strategy that funds benefits using dollars already leaving your payroll.',
      'Your employees get $150/month in real benefits. You save $550 per employee per year. Nobody\'s take-home pay changes.',
      'IRS §125, §105, and §106 authorized — the SIMRP has been helping employers save money for over 20 years.',
      'Telehealth, life insurance, accident coverage, critical illness — all funded by redirecting FICA taxes you\'re already paying.',
      'No disruption to existing benefits. No new costs. Just a smarter way to structure what you already offer.',
      'The Infinite Savings Plan — because as your team grows, so do your savings.',
    ],
    visualStyle: `Clean, data-driven educational aesthetic. Navy (#0B2147) and sky blue (#689EB8) as the foundation, with teal (#00c4cc) as the signature accent. Heavy use of infographic-style layouts: large bold numbers (e.g., "$550", "7.65%"), comparison tables (before/after), and flow diagrams showing how payroll dollars redirect. Icons: simple, line-based (calculator, shield, dollar sign, checkmark). Photography: diverse workplace settings, happy employees, HR meetings. Typography: clear, readable sans-serif. Overall feel: educational, trustworthy, data-backed — like a well-designed financial explainer.`,
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
    logoUrl:   '', // set from Brand Vault
    colors: {
      primary:   '#188bf6',
      secondary: '#0B2147',
      accent:    '#37ca37',
      dark:      '#0B2147',
      light:     '#F5F8FF',
    },
    fonts:    { heading: 'Inter', body: 'Inter' },
    tagline:  '',      // set from Brand Vault
    tone:     '',      // set from Brand Vault
    audience: '',      // set from Brand Vault
    products: [],      // set from Brand Vault
    knowledgeBase: [], // set from Brand Vault
    keyMessages:   [], // set from Brand Vault
    visualStyle:   '', // set from Brand Vault
  },
}

export function getBrandConfig(id: BrandId): BrandConfig {
  return BRAND_CONFIGS[id]
}

/**
 * Builds a rich, structured brand context block injected into AI generation prompts.
 *
 * @param brand   The BrandConfig to serialize
 * @param mode    'full' (default) for all fields, 'visual' for image/graphic/video prompts,
 *                'copy' for text/caption/script prompts
 */
export function buildBrandPromptContext(
  brand: BrandConfig,
  mode: 'full' | 'visual' | 'copy' = 'full',
): string {
  const isPersonal = brand.id === 'personal'
  const lines: (string | null)[] = []

  // ── Core identity ─────────────────────────────────────────────────────────
  lines.push(`Brand: ${brand.label} (${brand.shortName})`)
  if (brand.tagline) lines.push(`Tagline: "${brand.tagline}"`)
  if (brand.audience) lines.push(`Target audience: ${brand.audience}`)

  // ── Visual style & colors (skip for copy-only mode) ───────────────────────
  if (mode !== 'copy') {
    lines.push(`Primary color: ${brand.colors.primary}`)
    lines.push(`Secondary color: ${brand.colors.secondary}`)
    lines.push(`Accent color: ${brand.colors.accent}`)
    if (brand.logoUrl) lines.push(`Brand logo URL: ${brand.logoUrl}`)
    if (brand.visualStyle) lines.push(``, `Visual style: ${brand.visualStyle}`)
  }

  // ── Tone & voice (skip for visual-only mode) ──────────────────────────────
  if (mode !== 'visual') {
    if (brand.tone) lines.push(``, `Tone of voice: ${brand.tone}`)

    // Key products
    if (brand.products.length > 0) {
      lines.push(``, `Key products/offerings:`)
      brand.products.forEach((p) => lines.push(`  • ${p}`))
    }

    // Key messages
    if (brand.keyMessages.length > 0) {
      lines.push(``, `Core messaging pillars:`)
      brand.keyMessages.forEach((m) => lines.push(`  • ${m}`))
    }

    // Knowledge base
    if (brand.knowledgeBase.length > 0) {
      lines.push(``, `Brand knowledge base (key facts & proof points):`)
      brand.knowledgeBase.forEach((fact) => lines.push(`  • ${fact}`))
    }

    // Voice restrictions
    if (brand.voiceRestrictions?.neverSay && brand.voiceRestrictions.neverSay.length > 0) {
      lines.push(``, `NEVER say or imply:`)
      brand.voiceRestrictions.neverSay.forEach((n) => lines.push(`  ✗ ${n}`))
    }
    if (brand.voiceRestrictions?.alwaysDo && brand.voiceRestrictions.alwaysDo.length > 0) {
      lines.push(``, `ALWAYS do:`)
      brand.voiceRestrictions.alwaysDo.forEach((a) => lines.push(`  ✓ ${a}`))
    }
  }

  // ── Personal brand fallback notice ────────────────────────────────────────
  if (isPersonal && brand.knowledgeBase.length === 0) {
    lines.push(``, `Note: This is a personal brand profile. Generate content that is professional, authentic, and tailored to a financial services / benefits expert positioning themselves as a trusted authority.`)
  }

  return lines.filter((l) => l !== null).join('\n')
}
