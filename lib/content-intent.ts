// ─── Content Intent Engine ─────────────────────────────────────────────────────
// Provides structured pre-generation context for the Writer module.
// Pipeline: Tier1 Category → Tier2 Subtopic → Purpose → CTA → Series Arc

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Tier2SubTopic {
  id:                string
  label:             string
  copyAngles:        string[]   // 2–3 angles Claude can take
  suggestedHashtags: string[]   // 3–5 hashtags
  bestPlatforms:     string[]   // 2–3 platforms
  generationMode?:   'freeform' | 'structured'  // structured = data-entry form instead of textarea
}

/** Returns 'structured' for subtopics with a dedicated data-entry form */
export function getGenerationMode(tier2Id: string | null): 'freeform' | 'structured' {
  const STRUCTURED = new Set(['payroll-tax-savings', 'event-webinar', 'client-success'])
  return tier2Id && STRUCTURED.has(tier2Id) ? 'structured' : 'freeform'
}

export interface Tier1Category {
  id:        string
  label:     string
  icon:      string
  subtopics: Tier2SubTopic[]
}

export interface PurposeConfig {
  id:             string
  label:          string
  toneDirective:  string   // 1–2 sentences injected into Claude prompt
  captionOpeners: string[] // 2–3 example openers
  captionLength:  string   // e.g. "short (50–100 words)"
}

export interface CTAOption {
  id:                 string
  label:              string
  group:              'contact' | 'learn-more' | 'engage'
  graphicText:        string | null
  captionInstruction: string // 1–2 sentences
}

export interface QuickStart {
  label:     string
  icon:      string
  tier1Id:   string
  tier2Id:   string
  purposeId: string
  ctaId?:    string
}

export interface ContentIntent {
  tier1Id:       string | null
  tier2Id:       string | null
  purposeId:     string | null
  ctaId:         string | null
  customCta:     string | null
  ctaPlacement:  'graphic' | 'caption' | 'both' | null
  customTopic?:  string | null
  customPurpose?: string | null
}

// ─── Series Funnel Arcs (internal) ─────────────────────────────────────────────

const SERIES_FUNNEL_ARC: Record<string, string[]> = {
  education:   [
    'Awareness — introduce the problem or concept',
    'Deep Dive — explain how it works',
    'Outcome — show the result or benefit',
  ],
  promotion:   [
    'Hook — grab attention with a bold claim',
    'Problem — the pain point',
    'Solution — introduce the SIMRP/LHC offering',
    'Proof — evidence or client example',
    'CTA — invite action',
  ],
  engagement:  [
    'Hook — bold question or statement',
    'Value — deliver something useful',
    'Community — invite conversation',
  ],
  story:       [
    'Setup — context and stakes',
    'Conflict — the challenge faced',
    'Resolution — the outcome and what it means',
  ],
  default:     [
    'Opening — introduce the theme',
    'Body — develop the idea',
    'Close — summarize and transition',
  ],
}

// ─── Topic Tiers ───────────────────────────────────────────────────────────────

export const TOPIC_TIERS: Tier1Category[] = [
  {
    id:    'simrp-solutions',
    label: 'SIMRP Solutions',
    icon:  '🛡️',
    subtopics: [
      {
        id:                'how-simrp-works',
        label:             'How SIMRP Works',
        copyAngles:        [
          'Walk through the 3-step mechanism: redirect payroll dollars → fund medical reimbursements → save FICA taxes',
          'Compare before/after payroll structure to show the dollar impact on employer and employee',
          'Demystify the IRS authorization and explain why this is legal, compliant, and proven',
        ],
        suggestedHashtags: ['#SIMRP', '#PayrollSavings', '#EmployeeBenefits', '#TaxStrategy', '#LHCapital'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'infinite-savings-plan',
        label:             'The Infinite Savings Plan',
        copyAngles:        [
          'Position the SIMRP as the "Infinite Savings Plan" — savings that compound year over year per employee added',
          'Use an analogy: it\'s like a pay raise for the employer funded by tax code, not revenue',
          'Highlight that savings scale with headcount — bigger teams mean bigger returns',
        ],
        suggestedHashtags: ['#InfiniteSavingsPlan', '#SIMRP', '#BusinessStrategy', '#EmployerROI', '#TaxAdvantaged'],
        bestPlatforms:     ['linkedin', 'instagram', 'facebook'],
      },
      {
        id:                'section-125',
        label:             '§125 Cafeteria Plan',
        copyAngles:        [
          'Explain IRS §125 as the legal container that makes pre-tax benefit contributions possible',
          'Show how §125 reduces both employer FICA and employee income tax simultaneously',
          'Address the common misconception that cafeteria plans are only for large corporations',
        ],
        suggestedHashtags: ['#Section125', '#CafeteriaPlan', '#TaxCode', '#EmployeeBenefits', '#SIMRP'],
        bestPlatforms:     ['linkedin', 'facebook', 'youtube'],
      },
      {
        id:                'section-105-106',
        label:             '§105/106 Medical Benefits',
        copyAngles:        [
          'Explain how IRS §105/106 allows employers to reimburse medical expenses tax-free',
          'Show the difference between a traditional group health plan and a §105/106 reimbursement arrangement',
          'Highlight that §106 excludes employer-paid medical benefits from employee gross income',
        ],
        suggestedHashtags: ['#Section105', '#Section106', '#MedicalReimbursement', '#TaxFree', '#SIMRP'],
        bestPlatforms:     ['linkedin', 'facebook', 'youtube'],
      },
      {
        id:                'zero-cost-benefits',
        label:             'Zero-Cost Benefits',
        copyAngles:        [
          'Lead with the outcome: employees gain meaningful benefits without any change to take-home pay',
          'Explain that the cost is covered by redirecting payroll taxes — no new budget required',
          'Use the "same dollar, different destination" framing to clarify the mechanism',
        ],
        suggestedHashtags: ['#ZeroCostBenefits', '#SIMRP', '#EmployeeBenefits', '#PayrollSavings', '#HRStrategy'],
        bestPlatforms:     ['linkedin', 'instagram', 'facebook'],
      },
      {
        id:                'telehealth',
        label:             'Telehealth Coverage',
        copyAngles:        [
          'Highlight that SIMRP-enrolled employees get telehealth with zero copay — doctor visits without a bill',
          'Frame telehealth as the benefits upgrade employees actually notice and use every day',
          'Connect telehealth access to productivity: fewer sick days, faster care, happier workforce',
        ],
        suggestedHashtags: ['#Telehealth', '#EmployeeWellness', '#ZeroCopay', '#SIMRP', '#WorkplaceBenefits'],
        bestPlatforms:     ['instagram', 'facebook', 'linkedin'],
      },
    ],
  },

  {
    id:    'employer-roi',
    label: 'Employer ROI',
    icon:  '📈',
    subtopics: [
      {
        id:                'payroll-tax-savings',
        generationMode:    'structured',
        label:             'Payroll Tax Savings',
        copyAngles:        [
          'Lead with the average: $550/employee/year in FICA savings — show what that means at 50 or 100 employees',
          'Break down FICA: employer pays 7.65% on every dollar of wages — show how SIMRP reduces that taxable base',
          'Frame it as passive savings: once implemented, savings recur every pay period automatically',
        ],
        suggestedHashtags: ['#PayrollTaxSavings', '#FICA', '#EmployerROI', '#SIMRP', '#BusinessOwner'],
        bestPlatforms:     ['linkedin', 'facebook', 'x'],
      },
      {
        id:                'benefits-without-cost',
        label:             'Benefits Without Cost Increase',
        copyAngles:        [
          'Challenge the assumption that better benefits require a bigger budget',
          'Show that SIMRP-funded benefits come from a reallocation of existing payroll dollars, not new spending',
          'Position this as a competitive advantage: offer Fortune-500-style benefits on a small-business budget',
        ],
        suggestedHashtags: ['#BenefitsWithoutCost', '#SmallBusiness', '#EmployeeBenefits', '#SIMRP', '#HRStrategy'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'employee-retention',
        label:             'Employee Retention',
        copyAngles:        [
          'Connect SIMRP benefits to retention: employees who feel valued stay longer',
          'Share the cost of turnover (1.5–2x annual salary) vs. the cost of implementing SIMRP (zero)',
          'Highlight that supplemental benefits like telehealth and critical illness coverage are retention differentiators',
        ],
        suggestedHashtags: ['#EmployeeRetention', '#TalentRetention', '#CompanyBenefits', '#SIMRP', '#HRLeadership'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'roi-small-business',
        label:             'ROI for Small Business',
        copyAngles:        [
          'Bust the myth that SIMRP is only for large employers — it works best at 10–500 employees',
          'Use a real-number example: 25 employees × $550 = $13,750/year back in the business',
          'Frame it as leveling the playing field: small businesses can compete with enterprise benefit packages',
        ],
        suggestedHashtags: ['#SmallBusinessROI', '#SIMRP', '#BusinessOwner', '#TaxSavings', '#EmployeeBenefits'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
    ],
  },

  {
    id:    'client-education',
    label: 'Client Education',
    icon:  '📚',
    subtopics: [
      {
        id:                'simrp-explainer',
        label:             'What Is the SIMRP?',
        copyAngles:        [
          'Start with the problem: most businesses overpay payroll taxes and don\'t know it',
          'Define the SIMRP in plain language: a Self-Insured Medical Reimbursement Plan that redirects FICA dollars into employee benefits',
          'End with the promise: no new cost, no change to take-home pay, meaningful benefits for everyone',
        ],
        suggestedHashtags: ['#WhatIsSIMRP', '#SIMRP', '#EmployeeBenefits', '#TaxStrategy', '#LHCapital'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'myths-busting',
        label:             'Common Myths',
        copyAngles:        [
          'Myth: "It\'s too good to be true." Reality: it\'s IRS-authorized and has been used for decades',
          'Myth: "It\'s insurance." Reality: it\'s a medical reimbursement plan — different structure, no insurance premiums',
          'Myth: "Only big companies qualify." Reality: SIMRP is most impactful for 10–500 employee businesses',
        ],
        suggestedHashtags: ['#MythBusting', '#SIMRP', '#EmployeeBenefits', '#TaxFacts', '#BusinessOwner'],
        bestPlatforms:     ['instagram', 'facebook', 'linkedin'],
      },
      {
        id:                'tax-codes',
        label:             'IRS Tax Codes Explained',
        copyAngles:        [
          'Break down the 4 key codes (§125, §105, §106, §213(d)) in plain English — one per post or all in one',
          'Use a visual analogy: each code is a "lane" that legally routes dollars away from taxable payroll',
          'Position IRS codes as tools business owners can use — not just accountant jargon',
        ],
        suggestedHashtags: ['#TaxCodes', '#IRS', '#Section125', '#SIMRP', '#TaxStrategy'],
        bestPlatforms:     ['linkedin', 'youtube', 'facebook'],
      },
      {
        id:                'client-success',
        generationMode:    'structured',
        label:             'Client Success Story',
        copyAngles:        [
          'Lead with the before: what the business was paying, what benefits they had, what they were missing',
          'Describe the SIMRP implementation: how easy it was, what the team\'s reaction was',
          'Close with the after: savings achieved, employee satisfaction, and the decision they wish they\'d made sooner',
        ],
        suggestedHashtags: ['#ClientSuccess', '#SIMRP', '#CaseStudy', '#EmployeeBenefits', '#LHCapital'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'faq',
        label:             'FAQ',
        copyAngles:        [
          'Answer the #1 question: "How is this different from regular health insurance?"',
          'Address compliance questions: "Is this IRS-approved?" — yes, with proper plan documents',
          'Tackle the implementation fear: "How long does it take to set up?" — typically 2–4 weeks',
        ],
        suggestedHashtags: ['#FAQ', '#SIMRP', '#EmployeeBenefits', '#BusinessOwner', '#LHCapital'],
        bestPlatforms:     ['linkedin', 'instagram', 'facebook'],
      },
    ],
  },

  {
    id:    'engagement',
    label: 'Engagement',
    icon:  '💬',
    subtopics: [
      {
        id:                'question-poll',
        label:             'Question / Poll',
        copyAngles:        [
          'Ask a question that makes business owners reflect on their current benefits situation',
          'Use a "which would you prefer" framing to surface preference and spark replies',
          'Pose a scenario: "If you could add $500/year per employee to your bottom line without raising prices, would you?"',
        ],
        suggestedHashtags: ['#BusinessOwner', '#HRTips', '#EmployeeBenefits', '#Poll', '#WorkplaceWellness'],
        bestPlatforms:     ['instagram', 'facebook', 'linkedin'],
      },
      {
        id:                'fun-fact',
        label:             'Fun Fact / Stat',
        copyAngles:        [
          'Share a surprising FICA statistic: employers and employees together pay 15.3% on every dollar of wages',
          'Lead with a bold number: "The average employer overpays $550/employee/year in avoidable payroll taxes"',
          'Use a relatable comparison: "That\'s the cost of a team lunch — every single week, for every employee"',
        ],
        suggestedHashtags: ['#FunFact', '#PayrollStats', '#BusinessFacts', '#SIMRP', '#TaxSavings'],
        bestPlatforms:     ['instagram', 'x', 'facebook'],
      },
      {
        id:                'tag-someone',
        label:             'Tag Someone',
        copyAngles:        [
          'Prompt followers to tag a business owner or HR manager who needs to hear this',
          'Use a relatable pain point as the hook before the tag prompt',
          'Keep it warm and helpful — "know someone who could use $10K+ back in their business?"',
        ],
        suggestedHashtags: ['#TagAFriend', '#BusinessOwner', '#HRLeader', '#EmployeeBenefits', '#SIMRP'],
        bestPlatforms:     ['instagram', 'facebook', 'threads'],
      },
      {
        id:                'trending',
        label:             'Trending / Timely',
        copyAngles:        [
          'Connect a current business news story (layoffs, benefits cuts, cost-of-living pressures) to the SIMRP solution',
          'Use a seasonal hook: open enrollment, Q4 tax planning, New Year business goals',
          'React to a trending topic with a SIMRP angle — keep it relevant and value-first',
        ],
        suggestedHashtags: ['#TrendingNow', '#BusinessTips', '#EmployeeBenefits', '#SIMRP', '#OpenEnrollment'],
        bestPlatforms:     ['x', 'instagram', 'linkedin'],
      },
    ],
  },

  {
    id:    'announcements',
    label: 'Announcements',
    icon:  '📣',
    subtopics: [
      {
        id:                'event-webinar',
        generationMode:    'structured',
        label:             'Event / Webinar',
        copyAngles:        [
          'Lead with the outcome attendees will walk away with — not just the topic',
          'Include the essential logistics: date, time, registration link, what to expect',
          'Create urgency: limited seats, live Q&A, free resource for registrants',
        ],
        suggestedHashtags: ['#Webinar', '#FreeTraining', '#EmployeeBenefits', '#SIMRP', '#LHCapital'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'partnership',
        label:             'New Partnership',
        copyAngles:        [
          'Announce the partnership with context: who they are, why this matters to clients',
          'Focus on the client benefit — what does this mean for employers and employees they serve?',
          'Express genuine excitement and shared mission between the two organizations',
        ],
        suggestedHashtags: ['#Partnership', '#NewPartner', '#LHCapital', '#SIMRP', '#EmployeeBenefits'],
        bestPlatforms:     ['linkedin', 'facebook', 'instagram'],
      },
      {
        id:                'company-update',
        label:             'Company Update',
        copyAngles:        [
          'Share a milestone or growth update with appropriate humility and gratitude to clients',
          'Connect the update to what it means for clients going forward',
          'Use transparent, behind-the-scenes tone to build trust and relatability',
        ],
        suggestedHashtags: ['#CompanyUpdate', '#LHCapital', '#TeamGrowth', '#SIMRP', '#MilestoneAlert'],
        bestPlatforms:     ['linkedin', 'instagram', 'facebook'],
      },
    ],
  },

  {
    id:    'personal-brand',
    label: 'Personal Brand',
    icon:  '👤',
    subtopics: [
      {
        id:                'my-story',
        label:             'My Story',
        copyAngles:        [
          'Share what led you to the benefits industry — the moment that changed your perspective',
          'Be honest about what you didn\'t know when you started, and what you know now',
          'Connect your personal journey to the mission: helping businesses and their people thrive',
        ],
        suggestedHashtags: ['#MyStory', '#WhyIDoThis', '#EmployeeBenefits', '#Consultant', '#LHCapital'],
        bestPlatforms:     ['instagram', 'linkedin', 'facebook'],
      },
      {
        id:                'my-why',
        label:             'Why I Do This Work',
        copyAngles:        [
          'Lead with a specific moment or client story that reaffirmed your purpose',
          'Connect your "why" to a real business problem you help solve — make it tangible',
          'Close with an invitation: share your story if you resonate',
        ],
        suggestedHashtags: ['#MyWhy', '#PurposeDriven', '#EmployeeBenefits', '#BusinessConsultant', '#SIMRP'],
        bestPlatforms:     ['instagram', 'linkedin', 'threads'],
      },
      {
        id:                'thought-leadership',
        label:             'Industry Perspective',
        copyAngles:        [
          'Share a contrarian or underrepresented view on employee benefits or business finance',
          'Draw on your client experience to offer a perspective the audience won\'t find elsewhere',
          'Back your take with a specific data point or trend you\'ve observed',
        ],
        suggestedHashtags: ['#ThoughtLeadership', '#EmployeeBenefits', '#BenefitsIndustry', '#BusinessFinance', '#LHCapital'],
        bestPlatforms:     ['linkedin', 'x', 'threads'],
      },
      {
        id:                'milestone',
        label:             'Personal Milestone',
        copyAngles:        [
          'Celebrate a milestone with gratitude first — clients, team, and the mission that drives you',
          'Be specific: number of clients served, businesses helped, or dollars saved for employers',
          'Look forward: share what\'s next and how you plan to keep delivering value',
        ],
        suggestedHashtags: ['#Milestone', '#Grateful', '#LHCapital', '#EmployeeBenefits', '#SIMRP'],
        bestPlatforms:     ['instagram', 'linkedin', 'facebook'],
      },
    ],
  },
]

// ─── Purposes ──────────────────────────────────────────────────────────────────

export const PURPOSES: PurposeConfig[] = [
  {
    id:            'value-add',
    label:         'Value Add',
    toneDirective: 'Deliver immediate, actionable value to business owners and HR/finance decision-makers. Write as a trusted advisor sharing expertise freely — no pitch, no ask. The goal is to be genuinely useful about employee benefits and payroll optimization.',
    captionOpeners: [
      'Here\'s something most business owners don\'t know:',
      'A quick tip for CFOs and HR directors:',
      'If you manage payroll, this is worth 60 seconds of your time.',
    ],
    captionLength: 'medium (100–180 words)',
  },
  {
    id:            'education',
    label:         'Education',
    toneDirective: 'Teach clearly and accessibly. Break down complex IRS tax codes, benefit structures, and payroll mechanics into language that a non-finance business owner can understand and act on. Prioritize clarity over comprehensiveness.',
    captionOpeners: [
      'Let\'s break down how this actually works:',
      'Most people have never heard of IRS §125. Here\'s what it means for your business:',
      'Quick explainer — because this matters more than most business owners realize:',
    ],
    captionLength: 'medium-long (150–220 words)',
  },
  {
    id:            'information',
    label:         'Information',
    toneDirective: 'Present factual, relevant information clearly and concisely. Write in a neutral, professional tone suited to HR directors and CFOs. Stick to verified facts about the SIMRP, IRS codes, or LH Capital offerings — no embellishment.',
    captionOpeners: [
      'Here are the facts:',
      'What you need to know about',
      'Key information for employers:',
    ],
    captionLength: 'short-medium (80–140 words)',
  },
  {
    id:            'inspiration',
    label:         'Inspiration',
    toneDirective: 'Motivate and inspire business owners and HR leaders with a message grounded in possibility. Connect the SIMRP or LH Capital mission to a bigger vision — doing right by employees, building sustainable businesses, creating real impact. Keep it authentic, not preachy.',
    captionOpeners: [
      'The best decisions for your business are often the ones that also do right by your people.',
      'Imagine what it means for a family when their employer finally gets this right.',
      'There\'s a version of your business where benefits don\'t cost more — and everyone wins.',
    ],
    captionLength: 'short-medium (80–150 words)',
  },
  {
    id:            'promotion',
    label:         'Promotion',
    toneDirective: 'Promote LH Capital\'s offerings or the SIMRP with confidence and specificity. Lead with the outcome (savings, benefits, ROI), support it with mechanism or proof, and close with a clear next step. Be direct but never pushy — speak to CFO-level decision logic.',
    captionOpeners: [
      'If you haven\'t looked at the SIMRP for your business yet, here\'s why now is the time:',
      'LH Capital is helping businesses like yours add real benefits — without adding cost.',
      'The numbers speak for themselves:',
    ],
    captionLength: 'medium (100–180 words)',
  },
  {
    id:            'engagement',
    label:         'Engagement',
    toneDirective: 'Write to spark a response. Ask a genuine question, pose a relatable scenario, or share a surprising insight that makes business owners stop and think about their own situation. Keep it conversational and low-friction — no jargon, no hard sell.',
    captionOpeners: [
      'Quick question for business owners:',
      'Be honest — did you know this?',
      'What would you do with an extra',
    ],
    captionLength: 'short (50–100 words)',
  },
  {
    id:            'announcement',
    label:         'Announcement',
    toneDirective: 'Announce clearly and with appropriate excitement. Lead with the news, follow with context (why this matters to the audience), and close with a next step or invitation. Tone should be professional and warm — confident but not hypey.',
    captionOpeners: [
      'Big news:',
      'We\'re excited to announce',
      'Mark your calendar:',
    ],
    captionLength: 'short-medium (60–120 words)',
  },
  {
    id:            'story',
    label:         'Story',
    toneDirective: 'Tell a real, human story with a clear arc: setup, conflict, and resolution. Write in first person or close third. Focus on the emotional journey — not just the numbers. Let the SIMRP or LH Capital\'s role emerge naturally from the story, not as a sales pitch.',
    captionOpeners: [
      'A few months ago, I sat across from a business owner who was frustrated.',
      'I want to tell you about a client who almost said no.',
      'This is a story about what happens when a company finally gets benefits right.',
    ],
    captionLength: 'medium-long (150–250 words)',
  },
]

// ─── CTA Options ───────────────────────────────────────────────────────────────

export const CTA_OPTIONS: CTAOption[] = [
  {
    id:                 'book-a-call',
    label:              'Book a Call',
    group:              'contact',
    graphicText:        'Book a Free Strategy Call',
    captionInstruction: 'End with a direct, low-pressure invitation to book a free consultation call. Use language like "Book a free 20-minute call to see what this looks like for your business."',
  },
  {
    id:                 'send-message',
    label:              'Send a Message',
    group:              'contact',
    graphicText:        'Message Us Today',
    captionInstruction: 'Close with an invitation to send a direct message. Keep it conversational: "Reach out anytime — happy to answer questions with zero obligation."',
  },
  {
    id:                 'dm-for-info',
    label:              'DM for Info',
    group:              'contact',
    graphicText:        'DM for Details',
    captionInstruction: 'Prompt followers to DM for more information. Use casual, friendly language: "DM me the word SIMRP and I\'ll send you everything you need to know."',
  },
  {
    id:                 'tag-someone',
    label:              'Tag Someone',
    group:              'engage',
    graphicText:        null,
    captionInstruction: 'End with a prompt to tag a business owner, HR director, or CFO who should see this. Keep it warm and genuine: "Tag a business owner who needs to hear this."',
  },
  {
    id:                 'link-in-bio',
    label:              'Link in Bio',
    group:              'learn-more',
    graphicText:        'Link in Bio',
    captionInstruction: 'Direct followers to the link in bio for more information, to register, or to book. Be specific about what they\'ll find there.',
  },
  {
    id:                 'watch-video',
    label:              'Watch the Video',
    group:              'learn-more',
    graphicText:        'Watch Now',
    captionInstruction: 'Prompt followers to watch a linked video for the full explanation or demo. Tease what they\'ll learn by watching.',
  },
  {
    id:                 'save-post',
    label:              'Save This Post',
    group:              'engage',
    graphicText:        null,
    captionInstruction: 'Encourage followers to save this post so they can reference it later. Use language like "Save this for your next benefits conversation" or "Bookmark this — you\'ll want to share it."',
  },
  {
    id:                 'share-it',
    label:              'Share This',
    group:              'engage',
    graphicText:        null,
    captionInstruction: 'Ask followers to share this post with someone who needs to see it. Keep it specific: "Share with any business owner paying more in payroll taxes than they have to."',
  },
  {
    id:                 'answer-below',
    label:              'Answer Below',
    group:              'engage',
    graphicText:        null,
    captionInstruction: 'Invite followers to answer a question or share their experience in the comments. Make the ask specific and low-effort: "Drop your answer below — curious what you think."',
  },
]

// ─── Quick Starts ──────────────────────────────────────────────────────────────

export const QUICK_STARTS: QuickStart[] = [
  {
    label:     'Explain the SIMRP',
    icon:      '🛡️',
    tier1Id:   'simrp-solutions',
    tier2Id:   'how-simrp-works',
    purposeId: 'education',
    ctaId:     'book-a-call',
  },
  {
    label:     'Show payroll tax savings',
    icon:      '📈',
    tier1Id:   'employer-roi',
    tier2Id:   'payroll-tax-savings',
    purposeId: 'promotion',
    ctaId:     'book-a-call',
  },
  {
    label:     'Bust a myth',
    icon:      '🔍',
    tier1Id:   'client-education',
    tier2Id:   'myths-busting',
    purposeId: 'education',
  },
  {
    label:     'Client success story',
    icon:      '🌟',
    tier1Id:   'client-education',
    tier2Id:   'client-success',
    purposeId: 'story',
  },
  {
    label:     'Tax code explained',
    icon:      '📋',
    tier1Id:   'client-education',
    tier2Id:   'tax-codes',
    purposeId: 'education',
    ctaId:     'save-post',
  },
  {
    label:     'Announce an event',
    icon:      '📣',
    tier1Id:   'announcements',
    tier2Id:   'event-webinar',
    purposeId: 'announcement',
    ctaId:     'link-in-bio',
  },
  {
    label:     'Engagement question',
    icon:      '💬',
    tier1Id:   'engagement',
    tier2Id:   'question-poll',
    purposeId: 'engagement',
  },
  {
    label:     'My why',
    icon:      '👤',
    tier1Id:   'personal-brand',
    tier2Id:   'my-why',
    purposeId: 'story',
  },
]

// ─── Empty Intent ──────────────────────────────────────────────────────────────

export const EMPTY_INTENT: ContentIntent = {
  tier1Id:      null,
  tier2Id:      null,
  purposeId:    null,
  ctaId:        null,
  customCta:    null,
  ctaPlacement: null,
}

// ─── Build Intent Context ──────────────────────────────────────────────────────

/**
 * Builds a structured context block injected into the AI generation prompt.
 * Returns null if no intent fields are set.
 */
export function buildIntentContext(intent: ContentIntent, seriesCount = 1): string | null {
  const { tier1Id, tier2Id, purposeId, ctaId, customCta, ctaPlacement, customTopic, customPurpose } = intent

  if (!tier1Id && !tier2Id && !purposeId && !ctaId && !customCta && !customTopic && !customPurpose) return null

  const tier1   = TOPIC_TIERS.find((t) => t.id === tier1Id)
  const tier2   = tier1?.subtopics.find((s) => s.id === tier2Id)
  const purpose = PURPOSES.find((p) => p.id === purposeId)
  const cta     = CTA_OPTIONS.find((c) => c.id === ctaId)

  const lines: string[] = ['## Content Intent']

  // Topic (structured or freeform)
  if (tier1) {
    const topicLabel = tier2 ? `${tier1.label} → ${tier2.label}` : tier1.label
    lines.push(`Topic: ${topicLabel}`)
  } else if (customTopic?.trim()) {
    lines.push(`Topic: ${customTopic.trim()}`)
  }

  // Purpose + caption length (structured or freeform)
  if (purpose) {
    lines.push(`Purpose: ${purpose.label}`)
    lines.push(`Caption length target: ${purpose.captionLength}`)
  } else if (customPurpose?.trim()) {
    lines.push(`Purpose: ${customPurpose.trim()}`)
  }

  // Tone directive
  if (purpose?.toneDirective) {
    lines.push('', `Tone directive: ${purpose.toneDirective}`)
  }

  // Caption openers
  if (purpose?.captionOpeners.length) {
    lines.push('', 'Example openers (choose one or write your own in this style):')
    purpose.captionOpeners.forEach((opener) => lines.push(`  - ${opener}`))
  }

  // Copy angles
  if (tier2?.copyAngles.length) {
    lines.push('', 'Copy angles to consider:')
    tier2.copyAngles.forEach((angle) => lines.push(`  - ${angle}`))
  }

  // Suggested hashtags
  if (tier2?.suggestedHashtags.length) {
    lines.push('', `Suggested hashtags: ${tier2.suggestedHashtags.join(' ')}`)
  }

  // CTA
  const ctaText = customCta ?? cta?.captionInstruction ?? null
  if (ctaText) {
    const placement = ctaPlacement ?? 'caption'
    lines.push('', `Call to action (${placement}): ${ctaText}`)
  }

  // Series arc
  if (seriesCount > 1) {
    const arcKey = purposeId && SERIES_FUNNEL_ARC[purposeId] ? purposeId : 'default'
    const arc    = SERIES_FUNNEL_ARC[arcKey]
    const ctaFinalThreshold = seriesCount - 2

    lines.push('', `Series arc (${seriesCount} posts):`)
    for (let i = 0; i < seriesCount; i++) {
      const stage    = arc[i % arc.length]
      const isCtaPost = i >= ctaFinalThreshold
      const ctaNote  = isCtaPost && ctaText ? ' [include CTA in this post]' : ' [no CTA — focus on content]'
      lines.push(`  Post ${i + 1}: ${stage}${ctaNote}`)
    }
  }

  return lines.join('\n')
}

// ─── Intent String Builder ─────────────────────────────────────────────────────
// Simple string concatenation used by Images, Graphics, Audio, and Videos modules
// to inject intent context into their generation prompts.

export function buildIntentString(topics: string[], purpose: string, cta: string): string {
  const parts = [
    topics.length ? `Topic: ${topics.join(', ')}` : null,
    purpose       ? `Purpose: ${purpose}`          : null,
    cta           ? `CTA: ${cta}`                  : null,
  ].filter(Boolean)
  return parts.join(' · ')
}
