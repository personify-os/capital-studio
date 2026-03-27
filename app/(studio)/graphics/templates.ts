// Graphics templates available in the studio.
// Each template defines a visual format and the copy fields it uses.

export interface GraphicTemplate {
  id:          string
  name:        string
  description: string
  format:      string  // natural language description of the layout for the AI
  fields:      ('headline' | 'subtext' | 'cta')[]
  category:    'social' | 'email' | 'ad' | 'presentation'
}

export const GRAPHIC_TEMPLATES: GraphicTemplate[] = [
  // ── Social / Awareness ──────────────────────────────────────────────────
  {
    id:          'stat-callout',
    name:        'Stat Callout',
    description: 'A bold number or statistic with supporting context',
    format:      'Large centered statistic (e.g. "$550/employee") with a short supporting line below. Clean, minimal, high contrast.',
    fields:      ['headline', 'subtext'],
    category:    'social',
  },
  {
    id:          'quote-card',
    name:        'Quote Card',
    description: 'Pull quote or testimonial in a branded frame',
    format:      'Centered pull quote with quotation marks, author attribution below, subtle brand color background.',
    fields:      ['headline', 'subtext'],
    category:    'social',
  },
  {
    id:          'tip-card',
    name:        'Tip / Insight Card',
    description: 'A single actionable tip or insight',
    format:      'Numbered or icon-led tip with bold headline and one sentence of explanation. Clean card style.',
    fields:      ['headline', 'subtext'],
    category:    'social',
  },
  {
    id:          'announcement',
    name:        'Announcement',
    description: 'News, launch, or event announcement',
    format:      'Bold headline with urgency, short supporting text, clear CTA button. Brand primary color dominant.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'social',
  },
  {
    id:          'comparison',
    name:        'Before / After Comparison',
    description: 'Side-by-side comparison of old vs new approach',
    format:      'Two-column layout: left column shows the problem (muted colors), right shows the solution (brand colors). Each with 2-3 bullet points.',
    fields:      ['headline', 'subtext'],
    category:    'social',
  },
  {
    id:          'benefit-list',
    name:        'Benefits List',
    description: 'Checklist of key product benefits',
    format:      'Headline at top, then 3-5 checkmark bullet points, each on its own row. Clean vertical layout.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'social',
  },

  // ── SIMRP / Tax Savings Specific ────────────────────────────────────────
  {
    id:          'savings-calculator',
    name:        'Savings Snapshot',
    description: 'Visual showing estimated tax savings based on employee count',
    format:      'Calculator-style card with "X employees × $550 = $Y/year savings" layout. Large savings number in brand color. IRS code reference at bottom.',
    fields:      ['headline', 'subtext'],
    category:    'social',
  },
  {
    id:          'irs-code-explainer',
    name:        'IRS Code Explainer',
    description: 'Breaks down a specific IRS tax code in plain language',
    format:      'Code number (e.g. §125) large at top, plain-English explanation in body, benefit statement at bottom.',
    fields:      ['headline', 'subtext'],
    category:    'social',
  },
  {
    id:          'case-study-card',
    name:        'Case Study Card',
    description: 'Abbreviated version of a client success story',
    format:      'Company description at top, 3 bullet results with checkmarks, bottom line savings number in large text.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'social',
  },

  // ── Email / Lead Gen ────────────────────────────────────────────────────
  {
    id:          'email-header',
    name:        'Email Header Banner',
    description: 'Header image for email campaigns — 600×200px',
    format:      '600×200px email header. Brand logo on left, headline centered or right-aligned. Clean, professional.',
    fields:      ['headline', 'subtext'],
    category:    'email',
  },
  {
    id:          'cta-banner',
    name:        'CTA Banner',
    description: 'Call-to-action banner for emails or landing pages',
    format:      'Full-width banner with strong headline, one-sentence subtext, and a prominent CTA button. High contrast.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'email',
  },

  // ── Ad / Paid Social ────────────────────────────────────────────────────
  {
    id:          'linkedin-ad',
    name:        'LinkedIn Ad',
    description: '1200×627px LinkedIn single image ad',
    format:      '1200×627px. Professional, corporate visual. Headline at bottom on a semi-transparent overlay. Brand colors, no clip art.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'ad',
  },
  {
    id:          'story-ad',
    name:        'Story Ad (9:16)',
    description: 'Full-screen story format for Instagram/Facebook/TikTok',
    format:      '1080×1920px. Full-bleed design. Large centered headline, short subtext below, CTA button near bottom.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'ad',
  },
]

export function getTemplate(id: string): GraphicTemplate | undefined {
  return GRAPHIC_TEMPLATES.find((t) => t.id === id)
}
