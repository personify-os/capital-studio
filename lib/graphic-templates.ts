// Graphics templates available in the studio.
// Each template defines a visual format and the copy fields it uses.
// Kept in lib/ because format strings are sent verbatim as AI prompts and may
// contain hex colors describing template aesthetics (not LH Capital brand colors).

export interface GraphicTemplate {
  id:          string
  name:        string
  description: string
  format:      string  // natural language description of the layout for the AI
  fields:      ('headline' | 'subtext' | 'cta')[]
  category:    'social' | 'email' | 'ad' | 'presentation' | 'style'
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

  // ── Visual Style Templates ──────────────────────────────────────────────
  {
    id:          'split-layout',
    name:        'Split Layout',
    description: '50/50 photo left, dark text panel right with gradient bleed',
    format:      '1080×1080px. CSS grid two equal columns. Left: photo with filter: contrast(1.1) saturate(0.75) brightness(0.85) and a right-edge gradient fade (linear-gradient to-right from transparent to dark bg color) bleeding into the right panel. Right: dark background panel with headline and subtext left-aligned. Strong visual contrast between photo and text side.',
    fields:      ['headline', 'subtext'],
    category:    'style',
  },
  {
    id:          'numbered-list',
    name:        'Numbered List Story',
    description: '3-5 ranked items with large accent-color numbers (9:16)',
    format:      '1080×1920px 9:16 story format. Dark background. Bold headline at top (10% padding). Below: 3-5 list items, each row showing a large display-font number in the brand accent color (left) and body text (right). Thin 1px separator line between items at 15% opacity. Optional bottom CTA line.',
    fields:      ['headline', 'subtext'],
    category:    'style',
  },
  {
    id:          'event-poster',
    name:        'Event Announcement',
    description: 'Formal event poster with PRESENTS label, edition number, and CTA',
    format:      '1080×1350px. Dark background. Small caps "PRESENTS" label at top with letter-spacing. Corner bracket decorations (thin lines forming 90° corners in brand accent color). Large bold headline centered. Edition number (e.g. "VOL. 1" or "III") in accent color below headline. Date/location/details section with accent-colored dividers. Solid CTA button near bottom.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'style',
  },
  {
    id:          'diagonal-overlay',
    name:        'Diagonal Photo Overlay',
    description: 'Photo with cinematic 135° gradient — darkens corners, vivid center',
    format:      '1080×1080px. Full-bleed photo background with filter: contrast(1.1) saturate(0.75) brightness(0.85). Overlay div: linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.72) 100%). Text positioned at bottom-left with 8% padding. Headline large and bold, subtext smaller below.',
    fields:      ['headline', 'subtext'],
    category:    'style',
  },
  {
    id:          'center-vignette',
    name:        'Center Radial Vignette',
    description: 'Photo with cinematic vignette — bright center, dark edges',
    format:      '1080×1080px. Full-bleed photo background with filter: contrast(1.1) saturate(0.75) brightness(0.85). Overlay div: radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.82) 100%). Headline centered vertically and horizontally in large bold white text. Subtext below headline, slightly smaller.',
    fields:      ['headline', 'subtext'],
    category:    'style',
  },
  {
    id:          'light-gradient',
    name:        'Light Gradient',
    description: 'Inverted: dark text on bright accent-color gradient — stands out in dark feeds',
    format:      '1080×1080px. Background: bright gradient using brand accent/secondary colors (light, energetic). ALL text in dark (near-black) color — this is fully inverted from dark-bg templates. Headline bold and large, subtext smaller, CTA button with dark background and light text. High visual contrast. Premium, eye-catching.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'style',
  },
  {
    id:          'ember-glow',
    name:        'Ember Glow',
    description: 'Dark bg with warm amber center glow — premium moody aesthetic',
    format:      '1080×1080px. Background: linear-gradient(135deg, #080808 0%, #2a1508 50%, #080808 100%) creating a warm amber center glow on a near-black field. White headline text. Optional subtext in light gray. Optional outline CTA button (border: 1px solid rgba(255,255,255,0.3), transparent background). Very premium, editorial feel.',
    fields:      ['headline', 'subtext', 'cta'],
    category:    'style',
  },
  {
    id:          'type-decoration',
    name:        'Typography Decoration',
    description: 'Text-only with subtle CSS circle, stripe, and ring ornaments',
    format:      '1080×1080px. No photo. Dark background. Headline 3-5 words max in large bold display font. Decorative elements using ::before/::after or extra divs at very low opacity (4-8%): one large circle (border-radius: 50%, border: 1px solid white, opacity: 0.06, positioned off-center), two angled 1px stripe lines (rotate(-30deg), opacity: 0.07). Optional small accent dot between headline words. Subtext in small caps below.',
    fields:      ['headline', 'subtext'],
    category:    'style',
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
