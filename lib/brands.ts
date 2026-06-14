// ─── Brand Configuration ──────────────────────────────────────────────────────
// Single source of truth for the three brand identities used in Capital Studio.
// The AI generation services consume these configs to inject brand context into prompts.

export type BrandId = 'lhcapital' | 'simrp' | 'espa' | 'personal'

export interface BrandColors {
  primary:    string // dominant brand color
  secondary:  string // supporting color
  accent:     string // highlight / CTA
  dark:       string // dark text / backgrounds
  light:      string // light backgrounds / borders
}

export interface LogoVariant {
  label: string  // e.g. 'Horizontal', 'Icon', 'Dark', 'White'
  url:   string
}

export interface BrandConfig {
  id:          BrandId
  label:       string      // display name
  shortName:   string      // used in prompts and badges
  logoUrl:     string      // primary brand logo URL
  logoVariants?: LogoVariant[] // additional logo files (horizontal, icon, dark, white, etc.)
  includeLogo?:  boolean   // whether to inject logo URL into AI prompts (default: true if logoUrl exists)
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
      'SIMRP — The Infinite Savings Plan (Self-Insured Medical Reimbursement Plan)',
      'Hospital Indemnity Insurance',
      'Accident Insurance',
      'Critical Illness Insurance',
      'Chronic Illness Coverage',
      'Short-Term Disability Insurance',
      'Cancer Insurance',
      'Long-Term Care Insurance',
      'Term & Whole Life Insurance',
      'Telehealth (Sam by UCM — zero copay, 24/7)',
      'Employee Assistance Program (EAP)',
      'LegalShield & IDShield',
      'Freedom 365 Prescription & Wellness Discounts',
    ],
    knowledgeBase: [
      'LH Capital is a licensed insurance agency and financial services consulting firm based in Decatur, Alabama. Founded by Gabe Ross and Justin Carrington.',
      'LH Capital has 12 licensed agents, 25+ combined years of experience, and has served tens of thousands of clients.',
      'Primary offering: the SIMRP — a Self-Insured Medical Reimbursement Plan authorized under IRS §125, §105(b), §106(a), and §1.105-11.',
      'Employers save an average of ~$550 per enrolled employee per year in FICA payroll taxes by implementing the SIMRP.',
      'Employees receive $125–$150/month in supplemental benefits allotment with zero change to take-home pay.',
      'The SIMRP works alongside any existing group health insurance — no disruption to current benefits.',
      'Wellness and supplemental benefits include: 24/7 telehealth with zero copay (Sam by UCM), hospital indemnity, accident coverage, critical illness insurance, term life insurance, EAP, Freedom 365 prescription discounts, CoupleWise, and Wellution Wellness.',
      'Savings come from redirecting existing pre-tax FICA payroll dollars — no new cost to the employer.',
      'LH Capital handles white-glove implementation; 5-step process (Census → Proposal → Enrollment → Payroll → Savings); fully digital; ~10 minutes per employee.',
      'Serving businesses with 10+ W-2 employees across all industries; employees must earn $22K+/year and have health insurance access.',
      'LH Capital positions itself as a trusted consulting partner, not an insurance vendor.',
      'The SIMRP has been IRS-authorized since the early 2000s and is compliant with ADA, ERISA, HIPAA, and the ACA.',
      'Supplemental insurance products offered: Chronic Illness, Critical Illness, Short-Term Disability, Accident, Hospital Indemnity, Life Insurance, Cancer, Long-Term Care.',
      'Also offers LegalShield — legal services membership with attorney access, document review, and IDShield identity protection.',
      'At 50 employees, SIMRP saves the employer approximately $27,500/year in FICA taxes with zero new cost.',
      'Contact: 866.342.2728 | info@lhccapital.org | lhccapital.org',
    ],
    keyMessages: [
      "Building Legacies. Protecting Futures. — LH Capital helps businesses protect what they've built while creating lasting value for employees.",
      'Redirect existing payroll dollars into powerful employee benefits — at no new cost to the employer.',
      'The average employer saves ~$550 per employee per year, simply by implementing a smarter benefits structure.',
      'Give employees $125–$150/month in real benefits — telehealth, life insurance, and more — without touching take-home pay.',
      "LH Capital agents don't just sell benefits. They show businesses how to fund them from dollars already leaving the payroll.",
      'No new costs. No disruption to existing coverage. Just smarter tax strategy — and real results.',
      'From 10 employees to 500+, the savings compound every year — that is why we call it The Infinite Savings Plan.',
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
      'SIMRP — Self-Insured Medical Reimbursement Plan (The Infinite Savings Plan)',
      'IRS §125 Cafeteria Plan (salary reduction agreement)',
      'IRS §105(b) / §106(a) Medical Benefits',
      '~$550/employee/year average employer FICA savings',
      '$125–$150/employee/month supplemental benefits allotment',
      'Telehealth via Sam by UCM (zero copay, unlimited, 24/7)',
      'Hospital Indemnity | Accident | Critical Illness | Term Life Insurance',
      'Employee Assistance Program (EAP)',
      'Freedom 365 prescription, dental, and vision discounts',
      'CoupleWise counseling | Wellution Wellness programs',
    ],
    knowledgeBase: [
      'The SIMRP (Self-Insured Medical Reimbursement Plan) is an IRS-authorized tax strategy operating under §125, §105(b), §106(a), and §1.105-11 of the Internal Revenue Code.',
      'The SIMRP works by redirecting a portion of an employee\'s pre-tax payroll dollars into a tax-exempt supplemental benefits allotment via a §125 Cafeteria Plan salary reduction agreement.',
      'Employers save an average of ~$550 per enrolled employee per year in FICA taxes (employer\'s share is 7.65% of wages; redirecting wages reduces the taxable base for both employer and employee).',
      'Employees receive $125–$150/month (up to $1,800/year) in supplemental benefits — at zero change to their take-home pay (tax savings offset the salary reduction).',
      'Both the employer and employee save on FICA taxes because both sides of the 7.65% split apply to the redirected amount.',
      'Payroll example: employee earning $5,000/month with $225 allotment saves ~$17/month in FICA; employer saves the same. Zero net cost to the employee.',
      'The SIMRP is NOT fixed indemnity insurance — this is a critical compliance distinction. It is a self-insured medical reimbursement plan structured under §105.',
      'Benefits allotment covers: telehealth with zero copay (Sam by UCM — 24/7 urgent care, primary care, mental health, dermatology), hospital indemnity, accident coverage, critical illness, term life insurance, EAP, Freedom 365 (prescription/dental/vision discounts), CoupleWise, and Wellution Wellness.',
      'Telehealth via Sam by UCM includes unlimited visits, behavioral health, and prescription savings — all zero copay, immediately upon enrollment.',
      'The SIMRP does NOT replace or interfere with existing group health insurance. Employees must have access to qualifying health coverage to participate.',
      'Implementation: 5 steps (Census → Proposal → Enrollment → Payroll Integration → Savings). Fully digital; ~10 minutes per employee; typically 2–4 weeks to implement.',
      'Eligibility: 10+ W-2 employees, earning $22K+/year, with health insurance access. Employees on Medicare/Medicaid are not eligible.',
      'The SIMRP is compliant with ADA, ERISA, HIPAA, and the ACA. IRS-authorized structure used by tens of thousands of U.S. employers since the early 2000s.',
      'Implementation fee is nominal and is typically offset within the first month of FICA savings.',
      'At 50 employees: ~$27,500/year employer savings. At 100 employees: ~$55,000/year. Savings grow as headcount grows — hence "The Infinite Savings Plan."',
      'The SIMRP is participation-based (employees elect to enroll) and voluntary — employees can opt out without penalty.',
    ],
    keyMessages: [
      'The SIMRP is not insurance — it\'s a tax strategy that funds benefits using dollars already leaving your payroll.',
      'Your employees get $125–$150/month in real benefits. You save ~$550 per employee per year. Nobody\'s take-home pay changes.',
      'IRS §125, §105(b), and §106(a) authorized — the SIMRP has been helping employers save money for over 20 years.',
      'Telehealth, life insurance, accident coverage, critical illness — all funded by redirecting FICA taxes you\'re already paying.',
      'No disruption to existing benefits. No new costs. Just a smarter way to structure what you already offer.',
      'The Infinite Savings Plan — because as your team grows, so do your savings.',
      'IRS-compliant, ADA-compliant, ERISA-compliant, HIPAA-compliant. Your CPAs and attorneys will agree.',
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

  espa: {
    id:        'espa',
    label:     'ESPA by BizPower',
    shortName: 'ESPA',
    logoUrl:   '', // BizPower Benefits — set from Brand Vault
    colors: {
      primary:   '#2EA84F', // BizPower green
      secondary: '#16243F', // deep navy
      accent:    '#ED6A2C', // logo orange
      dark:      '#16243F',
      light:     '#EAF7EE', // pale green
    },
    fonts:    { heading: 'Inter', body: 'Inter' },
    tagline:  'More Care. More Savings. Zero Net Cost.',
    tone:     'Educational and benefits-forward, balancing two promises: better preventive health for employees AND real payroll-tax savings for employers. Warm, family-focused on the employee side; ROI-driven and compliance-confident on the employer side. Plain-language, never hypey.',
    audience: 'Business owners, HR directors, CFOs, and benefits decision-makers at organizations with 10+ W-2 employees — including businesses, nonprofits, churches, schools, counties, cities, and municipalities.',
    products: [
      'ESPA — Employer Sponsored Preventive Access Plan (Section 125 + SIMRP + IRS 213(d))',
      'Concierge virtual care: 24/7 telehealth, primary care, urgent care (powered by Amaze Health)',
      'Mental health support: psychiatry, medication management, unlimited counseling',
      'Rx program: 1,000+ common medications at $0 (powered by Rx Valet)',
      'Comprehensive annual lab panel (75+ biomarkers) via Quest or Labcorp',
      'Vision care, virtual Rx renewal, and virtual pet care',
      '~$150/month employee allotment for voluntary benefits',
      'Voluntary benefits: Accident, Cancer, Critical Illness, Hospital Indemnity, Disability, Life',
      'Live Well USA: legal resources, credit monitoring, identity protection, wellness app, travel discounts',
      'BizPower Benefits Employer Portal — onboarding, offboarding, and administration',
    ],
    knowledgeBase: [
      'ESPA (Employer Sponsored Preventive Access) is a next-generation employee benefits plan from BizPower Benefits that integrates a compliant preventive health plan, a Self-Insured Medical Reimbursement Plan (SIMRP), and a Section 125 cafeteria plan.',
      'ESPA delivers measurable payroll-tax savings to employers AND meaningful preventive health benefits to employees, with no reduction in take-home pay and no disruption to the existing major medical plan.',
      'Employers save an average of $505.20 per employee per year in NET FICA tax savings (after admin fees). Savings begin on the first payroll after enrollment — no waiting, no back-end true-ups.',
      'Built on Section 125 and IRS 213(d) frameworks; HIPAA, ERISA, ACA, and IRS compliant. This is not tax advice and all figures are estimates.',
      'Each employee generates an average of ~$150/month to spend on voluntary supplemental benefits (Accident, Cancer, Critical Illness, Hospital Indemnity, Disability, Life).',
      'Employees get unlimited 24/7 telehealth (urgent, primary, behavioral, women\'s health) with zero out-of-pocket cost, powered by Amaze Health.',
      'Mental health support includes psychiatric evaluations, medication management, and unlimited counseling with no referrals or waitlists — for the employee, spouse, and dependents.',
      'Rx program provides 1,000+ common medications at $0 (powered by Rx Valet); plus an annual 75+ biomarker lab panel via Quest Diagnostics or Labcorp.',
      'Additional services: vision care (Visibly), virtual Rx renewal, virtual pet care, and a biometric facial-scan health dashboard (Amaze).',
      'Live Well USA bundles legal resources, credit monitoring, identity protection, wholesale travel discounts, and a wellness app at no additional cost.',
      'Eligibility: employees must be W-2 (1099 contractors are not eligible) and must have access to health coverage (employer plan, spouse/parent plan, or individual policy). ESPA pairs with existing coverage — it does not replace it.',
      'Excluded: employees on Medicare or receiving a marketplace subsidy cannot participate. If an employee has no qualifying coverage, a qualifying option can be put in place.',
      'Who qualifies: any organization with 10+ W-2 employees with access to health insurance — including businesses, nonprofits, churches, schools, counties, cities, and municipalities.',
      'Implementation: census of employees → exact savings + per-employee allotment breakdown → enrollment (auto, in-person, or virtual) → payroll setup → savings begin next month with full benefits access.',
      'Powered by best-in-class voluntary benefits: Critical Illness, Cancer, Disability, Hospital Indemnity, Accident, and Life.',
      'BizPower Benefits: 501 Union St., 6th Floor, Nashville, TN 37219 | 101 E. 6th Street, Tuscumbia, AL 35674 | 629-275-3255 | BizPowerBenefits.com',
    ],
    keyMessages: [
      'More Care. More Savings. Zero Net Cost. — ESPA enhances employee benefits without raising your benefits budget or reducing take-home pay.',
      'Employers save an average of $505 per employee per year in net FICA taxes — and the savings start on the very next payroll.',
      'Employees get robust preventive health — 24/7 telehealth, mental health, $0 Rx, labs, vision — plus ~$150/month for voluntary benefits, with no change to their paycheck.',
      'ESPA works alongside your existing major medical plan — no disruption, no replacement, just enhancement.',
      'HIPAA, ERISA, ACA, and IRS compliant — built on Section 125 and IRS 213(d) and administered through the BizPower Benefits portal.',
      'Reduce absenteeism, boost retention, and strengthen your total compensation story — through proactive preventive care.',
      'If you have 10+ W-2 employees with access to health insurance, you likely qualify. Run your numbers with a census.',
    ],
    visualStyle: `Bright, healthy, modern benefits aesthetic. BizPower green (#2EA84F) as the signature color over deep navy (#16243F) panels, with orange (#ED6A2C) accents for emphasis. Clean rounded cards, simple line/solid icons (stethoscope, shield, heart, phone, dollar), and friendly family/workplace photography. Infographic-friendly: large savings numbers ("$505/yr", "$150/mo"), before/after paycheck comparisons, and benefit grids. Overall feel: trustworthy healthcare meets smart financial strategy — approachable, energetic, and credible.`,
    voiceRestrictions: {
      neverSay: [
        '"free" or "no cost" without explaining the program is funded through payroll-tax savings',
        '"insurance" to describe ESPA itself — it is a preventive access plan built on a SIMRP and Section 125',
        'specific savings figures as guarantees — always note they are estimates',
      ],
      alwaysDo: [
        'call it "ESPA" or "the Employer Sponsored Preventive Access plan" (by BizPower Benefits)',
        'pair the employer savings story with the employee preventive-health story',
        'emphasize zero reduction in take-home pay and no disruption to existing major medical coverage',
        'note ESPA requires 10+ W-2 employees with access to health coverage',
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
    // Only inject logo URL when includeLogo is not explicitly false
    if (brand.logoUrl && brand.includeLogo !== false) lines.push(`Brand logo URL: ${brand.logoUrl}`)
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
