// ─── Platform Context Engine ────────────────────────────────────────────────────
// Rich per-platform best practices injected into AI generation system prompts.
// Sources: Meta, LinkedIn, X, TikTok, YouTube, Threads platform documentation
// + social media content performance research (2024–2025).

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'tiktok'
  | 'threads'
  | 'bluesky'
  | 'substack'
  | 'medium'

export interface PlatformContext {
  id:           SocialPlatform
  label:        string
  charLimit:    number       // hard character limit (0 = none enforced)
  optimalRange: string       // optimal length for engagement
  audience:     string       // who actually uses this platform for B2B/professional content
  structure:    string       // how to structure a post
  hooks:        string[]     // proven hook openers for this platform
  hashtagRule:  string       // hashtag count + strategy
  tone:         string       // tone and voice guidance
  engagement:   string       // tactics that drive comments/shares
  avoid:        string[]     // patterns that kill reach or engagement
  proTip:       string       // one high-leverage advanced tactic
}

export const PLATFORM_CONTEXTS: Record<SocialPlatform, PlatformContext> = {

  instagram: {
    id:           'instagram',
    label:        'Instagram',
    charLimit:    2200,
    optimalRange: '138–150 chars for the visible hook; 300–600 total for captions with substance',
    audience:     'Decision-makers and employees aged 25–45 who follow professional brands for visual inspiration and behind-the-scenes content',
    structure: [
      'Line 1–2: Strong hook — the visible text before "more". Must stand alone.',
      'Line 3–5: Supporting detail, stats, or story that pays off the hook.',
      'Final line: Clear CTA or question.',
      'Blank line then hashtags — or post hashtags as the first comment.',
    ].join(' '),
    hooks: [
      'Most employers are leaving $[X] on the table every year.',
      'Your employees already have this benefit. They just don\'t know it.',
      'We helped [Company] save $[X] without changing a single benefit.',
      'What if you could give employees a raise without touching payroll?',
      'Real talk: [bold claim about SIMRP or LHC]',
    ],
    hashtagRule: '3–8 hashtags. Mix: 1–2 branded (#SIMRP, #LHCapital), 2–3 niche (#EmployeeBenefits, #PayrollSavings), 1–2 broad (#BusinessOwner, #HRLeader). Avoid 20+ hashtag dumps — algorithmic penalty since 2023.',
    tone:         'Visual-first, punchy, results-oriented. Contrast with LinkedIn\'s formal tone — Instagram allows slightly more personality and human moments while staying professional. Lead with an outcome, not a feature.',
    engagement:   'End with a direct question to drive comments: "What\'s your current FICA savings strategy?" Use line breaks generously — dense blocks of text are skipped. Posts with a bold data point in the first line see 2–3× more saves.',
    avoid: [
      'Opening with "I" or the brand name — leads always underperform vs. opening with the value/insight',
      'Passive voice and corporate speak: "We are pleased to announce…"',
      'Hashtag dumps of 15–20 tags — these are now flagged as spam behavior',
      'Captions that only work paired with the image — caption must make sense in isolation',
    ],
    proTip: 'Save-worthy content outperforms like-bait. A stat, checklist, or "did you know" that someone wants to screenshot gets 5–10× more algorithmic reach than a generic motivational post.',
  },

  facebook: {
    id:           'facebook',
    label:        'Facebook',
    charLimit:    0,
    optimalRange: '40–80 chars for native reach boost; 250–500 for business pages with engaged communities',
    audience:     'Business owners, HR directors, and employees 30–55. Facebook Groups remain the highest-engagement channel for B2B benefit discussions.',
    structure: [
      'Short punchy first sentence (40–80 chars) — the preview line.',
      'Optional expansion: 2–4 short paragraphs with clear spacing.',
      'End with a question or CTA.',
      '1–2 hashtags max.',
    ].join(' '),
    hooks: [
      'Quick question for any business owner:',
      'If you have employees, read this.',
      'We just saved [Company] $[X] without changing their benefits package.',
      'HR directors — this one\'s for you.',
      'The tax code has a loophole most employers don\'t know exists.',
    ],
    hashtagRule: '1–2 hashtags only. Facebook\'s algorithm in 2024 de-emphasizes hashtags — they no longer meaningfully expand reach. Use sparingly only for brand tracking (#SIMRP).',
    tone:         'Conversational and community-focused. More casual than LinkedIn. Reads like a post from a knowledgeable colleague, not a press release. Storytelling works well: "I was talking to a business owner last week…"',
    engagement:   'Ask direct, polarizing, or relatable questions: "Has your accountant ever told you about SIMRP?" Polls and "yes/no" prompts dramatically increase comment rate. Videos get 3–5× organic reach over static posts.',
    avoid: [
      'Hashtag stuffing — actively hurts reach on Facebook',
      'Overly promotional language ("Buy now", "Sign up today") — Facebook organic deprioritizes direct sales content',
      'Long unbroken paragraphs — mobile users skip walls of text',
      'Generic stock-photo language — Facebook users expect authenticity',
    ],
    proTip: 'Post that starts a conversation in the comments beats a polished broadcast post every time. "Comment YES if you\'d want to know how much FICA your company overpaid last year" routinely drives 50–100 comments on business pages.',
  },

  linkedin: {
    id:           'linkedin',
    label:        'LinkedIn',
    charLimit:    3000,
    optimalRange: '150–300 chars for the above-the-fold hook; 1,200–1,600 total for high-engagement posts',
    audience:     'CFOs, HR directors, COOs, and business owners actively looking to optimize cost and benefits. Highest-intent audience for SIMRP/LHC messaging.',
    structure: [
      'Hook: 1–2 punchy lines that stop the scroll. Must work before "see more".',
      'Blank line after hook.',
      '3–5 short paragraphs (2–3 lines each) with blank lines between.',
      'Use a numbered or bulleted list for at least one section.',
      'Close with a question or specific CTA.',
      '3–5 hashtags on the final line.',
    ].join(' '),
    hooks: [
      'Most CFOs don\'t realize they\'re overpaying FICA taxes on every paycheck.',
      'I\'ve seen companies save $550 per employee, per year. Here\'s exactly how:',
      'The IRS authorized this benefit structure in 2001. Most businesses still don\'t use it.',
      'Unpopular opinion: your benefits broker hasn\'t told you about your biggest tax savings.',
      '$550/employee/year. No new cost. No disruption. This is the SIMRP.',
    ],
    hashtagRule: '3–5 hashtags at the end. Use niche professional tags (#EmployeeBenefits, #PayrollStrategy, #CFO, #HRLeadership, #SIMRP). Avoid broad generic tags (#Business, #Success) — they no longer drive discovery.',
    tone:         'Professional but personal. First-person "I" voice outperforms brand voice on LinkedIn. Thought leadership, insight-sharing, and contrarian takes drive the most engagement. Data and specifics are highly valued — vague claims perform poorly.',
    engagement:   'End every post with a direct question that invites professional disagreement or reflection: "Has your current benefits strategy addressed FICA savings? Why or why not?" Posts with 20+ comments in the first hour get 10× algorithmic boost. Tag relevant people or companies when contextually appropriate.',
    avoid: [
      'Opening with "I\'m excited to share…" or "We\'re pleased to announce…" — consistently underperforms',
      'Emoji overuse — 1–3 is fine, 10+ makes professional content look like spam',
      'Humble-brag framing: "Honored to be recognized…" without delivering actual value',
      'Ending without a question — misses the comment-driving opportunity',
      'Dense unbroken paragraphs — 3 lines max before a line break on mobile',
    ],
    proTip: 'The LinkedIn algorithm rewards dwell time. A post that makes someone pause, read carefully, and think before reacting outperforms a post optimized for fast likes. Write for the 30-second reader, not the 3-second skimmer.',
  },

  x: {
    id:           'x',
    label:        'X (Twitter)',
    charLimit:    280,
    optimalRange: '71–100 chars for standalone tweets; threads of 3–6 posts for longer ideas',
    audience:     'Entrepreneurs, financial professionals, and startup operators. B2B content on X works best as sharp insights and contrarian takes, not feature announcements.',
    structure: [
      'Standalone tweet: One complete idea in under 280 chars. No hashtags in the main tweet.',
      'Thread format: Post 1 is the hook/claim. Posts 2–5 are the proof/expansion. Final post is CTA or summary.',
      'Leave hashtags off the main tweet entirely — they visually dilute the message.',
    ].join(' '),
    hooks: [
      'Hot take: most businesses pay 7.65% in FICA taxes on every dollar they don\'t have to.',
      'The IRS has a benefit most employers ignore. Here\'s how it works: 🧵',
      '$550/employee/year. Tax savings. Legal. Simple. Most accountants won\'t tell you this.',
      'Thread: How the SIMRP works and why you\'ve never heard of it',
      'Your payroll taxes are higher than they need to be. A thread on how to fix that:',
    ],
    hashtagRule: '0 hashtags in the main tweet for maximum reach. If using a thread, 1 hashtag on the final post only (#SIMRP or #EmployeeBenefits). X\'s 2024 algorithm actively deprioritizes posts with hashtags in the main text.',
    tone:         'Direct, opinionated, conversational. Short declarative statements outperform polished prose. First-person voice. Contrarian or surprising claims drive the most engagement. No corporate language.',
    engagement:   'Replies matter more than likes on X — design content to provoke thoughtful responses. Ask a provocative question as a standalone post. The thread format is the highest-engagement format for educational content: hook → proof → CTA.',
    avoid: [
      'Hashtags in the main post body — kills algorithmic reach as of 2024',
      'Asking for retweets or follows — marked as spam behavior',
      'Corporate passive voice: "Employers may wish to consider…"',
      'Exceeding 280 chars on the first post of a thread — gets truncated and loses impact',
      'Threads longer than 8 posts — engagement drops sharply after post 5',
    ],
    proTip: 'On X, the reply is the algorithm signal. Write a first post that makes a professional think "wait, is that right?" or "I\'ve never thought of it that way." Replies and quote-tweets drive 10× more reach than likes.',
  },

  youtube: {
    id:           'youtube',
    label:        'YouTube',
    charLimit:    5000,
    optimalRange: '150–250 chars shown in search preview; 300–600 total for educational videos with timestamps',
    audience:     'Business owners and HR professionals doing research. YouTube is a high-intent discovery channel — people searching "employee benefits tax savings" are actively shopping for solutions.',
    structure: [
      'Lines 1–2: Keyword-rich description of exactly what the video covers.',
      'Lines 3–5: Supporting detail — who this is for, what they\'ll learn.',
      'Timestamps (if video is over 5 min): help SEO and watch time.',
      'Links: website, calendly/booking, related videos.',
      'Keywords: repeat 2–3 target phrases naturally.',
    ].join(' '),
    hooks: [
      'In this video, you\'ll learn exactly how the SIMRP saves employers $550 per employee per year in payroll taxes — legally, using IRS §125 and §105/106.',
      'Most business owners overpay FICA taxes on every paycheck. This video explains how to stop.',
      'A step-by-step breakdown of how LH Capital\'s SIMRP works, who qualifies, and what you\'ll save.',
    ],
    hashtagRule: '3–5 hashtags in the description. YouTube treats them as search tags. Use specific educational tags: #EmployeeBenefits, #SIMRP, #PayrollTaxSavings, #SmallBusiness, #HRStrategy.',
    tone:         'Educational and informative. This is a research channel — viewers want clear, accurate, helpful content. Use plain language to explain complex IRS topics. Authority and credibility matter more here than personality.',
    engagement:   'Ask viewers to comment with a specific question: "Comment below: how many employees does your business have? I\'ll reply with an estimate of your potential savings." This drives comments and watch time signals.',
    avoid: [
      'Vague descriptions that don\'t state what the video covers — YouTube\'s algorithm needs keyword signals',
      'Missing timestamps for videos over 5 minutes — kills watch completion rate',
      'Hashtag stuffing beyond 15 — YouTube ignores all hashtags when more than 15 are added',
      'Asking for likes/subscribes in the description — comes across as desperate',
    ],
    proTip: 'YouTube SEO: The first 100 characters of the description are what shows in search results. Front-load your primary keyword phrase ("SIMRP employee benefits savings") in the first sentence. This single change can 2–3× organic search discovery.',
  },

  tiktok: {
    id:           'tiktok',
    label:        'TikTok',
    charLimit:    2200,
    optimalRange: '100–150 chars. Caption should reinforce the video hook, not repeat it.',
    audience:     'Younger HR professionals, employees, and entrepreneurs 25–40. TikTok is an underutilized B2B channel — financial education content performs strongly with the "FinTok" and "BusinessTok" communities.',
    structure: [
      'Line 1: Caption that extends or reinforces the first 3 seconds of the video.',
      '1–2 lines of supporting context or hook.',
      '3–5 hashtags.',
    ].join(' '),
    hooks: [
      'Did you know your employer could be saving $550/year per employee? 👀',
      'POV: Your HR director just discovered the SIMRP',
      'Things your payroll company isn\'t telling you 👇',
      'Stitch this: real talk about employee benefits that nobody talks about',
      'Business owners — this is the tax hack you didn\'t know existed',
    ],
    hashtagRule: '3–5 hashtags. Mix: 1 trending business tag (#BusinessTok, #FinanceTok), 2 niche (#EmployeeBenefits, #PayrollSavings), 1 branded (#SIMRP). TikTok discovery is primarily algorithm-driven, not hashtag-driven — hashtags are supplemental.',
    tone:         'Authentic, casual, human. TikTok punishes polished corporate content. Even for B2B, the best-performing content sounds like a knowledgeable friend explaining something, not a company making an announcement. Conversational and direct.',
    engagement:   'Stitch and Duet hooks drive massive engagement: "Reply to @[username] — here\'s why the SIMRP is legal" or "Stitch this with your own employee benefits situation." Comment replies showing in the video = 10× engagement signal.',
    avoid: [
      'Corporate tone and formal language — TikTok audiences scroll past immediately',
      'Caption that just restates what\'s already in the video',
      'Too many hashtags (10+) — looks spammy, no algorithmic benefit',
      'CTAs like "check our website" without a clear reason why',
    ],
    proTip: 'TikTok\'s algorithm weights completion rate above all else. The caption should create "pattern interruption" — a reason to watch longer or rewatch. "Here\'s the IRS code that makes this legal 👇" in the caption drives video scrubbing to find the reference.',
  },

  threads: {
    id:           'threads',
    label:        'Threads',
    charLimit:    500,
    optimalRange: '150–300 chars. Threads is a casual conversation platform — shorter posts feel more native.',
    audience:     'Instagram crossover audience — professionals, creators, and business owners who prefer lower-pressure conversation over LinkedIn\'s formal tone.',
    structure: [
      'Single thought, clearly stated.',
      'Optional: 2nd thread post as expansion or question.',
      '0–2 hashtags or none at all.',
    ].join(' '),
    hooks: [
      'Hot take: most HR packages are costing companies more than they need to.',
      'Genuinely curious — do you know how much your company spends on FICA taxes?',
      'Something nobody tells business owners about payroll taxes:',
      'The SIMRP in one sentence:',
      'Asking for a friend: has anyone actually implemented a Self-Insured Medical Reimbursement Plan?',
    ],
    hashtagRule: '0–2 hashtags. Threads\' discovery algorithm is still maturing — hashtags provide minimal reach boost. Prioritize post quality over hashtag optimization.',
    tone:         'Casual, authentic, conversational. Think of it as a less-curated Instagram — more raw thoughts, less polished campaigns. First-person voice, direct statements, and genuine questions outperform brand-speak.',
    engagement:   'Start a genuine conversation thread: post an observation, then reply to your own post with the detail. This "thread" format mirrors how the platform was designed and drives more responses than a single post.',
    avoid: [
      'Formal brand voice ("We are pleased to share…")',
      'Excessive hashtags — Threads users are not hashtag browsers',
      'Reposting identical content from Instagram without adaptation',
      'CTAs that feel like an ad ("Click the link in bio to learn more about our services")',
    ],
    proTip: 'Threads rewards genuine curiosity and opinion-sharing. A post like "Genuinely surprised more HR directors don\'t know about SIMRP — has anyone here implemented it?" can spark a discussion thread that gets 50+ replies from exactly the right audience.',
  },

  bluesky: {
    id:           'bluesky',
    label:        'Bluesky',
    charLimit:    300,
    optimalRange: '180–260 chars. Bluesky favors dense, substantive posts — the character limit forces precision.',
    audience:     'Tech-forward professionals, finance and policy thinkers, journalists, and early-adopter business owners who migrated from X seeking authentic conversation free of algorithm manipulation.',
    structure: [
      'Strong opening statement or contrarian take.',
      '1–2 supporting sentences with data or specifics.',
      'Optional: end with a genuine question to spark thread replies.',
      'No hashtags required — Bluesky uses custom feeds and starter packs instead.',
    ].join(' '),
    hooks: [
      'Most business owners don\'t realize payroll taxes are partially optional.',
      'The SIMRP has been legal since 1954. Most CFOs have never heard of it.',
      'Here\'s what your payroll company isn\'t incentivized to tell you:',
      'Real question for HR directors: do you know how much FICA your company overpaid last year?',
      'The IRS code that changes everything about how businesses fund employee benefits:',
    ],
    hashtagRule: 'Avoid hashtags — Bluesky\'s discovery system uses curated custom feeds, starter packs, and network-based signals. Hashtags carry no algorithmic weight and look out of place. Focus on quality content that gets shared within relevant starter pack communities.',
    tone:         'Direct, intellectually sharp, and authentic. Bluesky users left X to escape algorithm-optimized content — they immediately detect and distrust anything that reads like a growth-hack. Write like a subject-matter expert speaking plainly to peers, not a brand broadcasting to an audience.',
    engagement:   'Thread replies are the primary engagement signal. End posts with a question that invites disagreement or experience-sharing: "Has anyone here actually run a SIMRP audit on their payroll? What did you find?" Genuine curiosity outperforms calls to action.',
    avoid: [
      'Hashtag spam — Bluesky users find it jarring and it provides no reach benefit',
      'Corporate brand voice or promotional language',
      'Recycled content from X or LinkedIn without rewriting for a Bluesky audience',
      'Engagement-bait questions that feel formulaic ("Drop a 🔥 if you agree")',
    ],
    proTip: 'Bluesky\'s Starter Packs let you build a curated audience of exactly the right professionals — create or join a "Benefits & HR Leaders" or "Financial Services" starter pack. Posts that get quoted (not just liked) by credible accounts in those packs can reach thousands of highly targeted readers organically.',
  },

  substack: {
    id:           'substack',
    label:        'Substack',
    charLimit:    0,
    optimalRange: '800–2,000 words for a newsletter post; 150–300 words for a Substack Note (short-form update).',
    audience:     'Opted-in subscribers who actively chose to receive your content — the highest-intent audience of any platform. Typically professionals, decision-makers, and engaged readers willing to invest time in long-form content.',
    structure: [
      'Subject line: specific, curiosity-driving, benefit-led (not clever for its own sake).',
      'Opening paragraph: hook with a specific stat, story, or insight — no preamble.',
      'Body: structured with headers, short paragraphs, and clear logical flow.',
      'Practical takeaways or numbered insights.',
      'Closing CTA: direct ask — reply, share, or specific next step.',
    ].join(' '),
    hooks: [
      'Last quarter, we ran the numbers. The average employer is overpaying $550 per employee in FICA taxes every year.',
      'If you\'ve never heard of a Self-Insured Medical Reimbursement Plan, that\'s not an accident.',
      'Three things most CFOs get wrong about employee benefits — and the IRS code that changes all three.',
      'The benefit that pays for itself: a practical breakdown for business owners.',
      'We\'ve helped [X] companies reduce payroll tax burden without cutting benefits. Here\'s what they all had in common.',
    ],
    hashtagRule: 'No hashtags — Substack is an email-first platform. Discovery happens through the Substack network, cross-promotion, and SEO on public posts. Tags (categories) on your publication help with Substack discovery but are set at the publication level, not per-post.',
    tone:         'Substantive, expert, and generous. Substack readers chose to subscribe — they expect real depth and insight, not surface-level content. Write as a knowledgeable advisor sharing genuine expertise. First-person narrative works well. Teach something useful in every issue.',
    engagement:   'Reply-driving CTAs are most effective: "Hit reply and tell me how your company currently handles this" gets responses because the subscriber relationship feels personal. Include a clear question at the end of each issue. Referral programs ("Share this with one HR director you know") drive the most new subscribers.',
    avoid: [
      'Generic newsletter intros ("In this week\'s issue…") — get to the value immediately',
      'Promotional language that treats subscribers like leads rather than readers',
      'Issues longer than 3,000 words without a clear reason for the length',
      'Inconsistent publishing cadence — subscriber churn spikes when issues go dark for weeks',
    ],
    proTip: 'Substack\'s "Recommendations" feature is the platform\'s most powerful growth lever — other Substack writers recommend your publication to their readers. Write at least one issue specifically designed to be worth recommending: a definitive guide, original data, or contrarian take that other writers in adjacent niches would want their audience to see.',
  },

  medium: {
    id:           'medium',
    label:        'Medium',
    charLimit:    0,
    optimalRange: '1,200–2,500 words. Medium\'s Partner Program and SEO performance both favor articles with enough depth to reach 7–10 minute read time.',
    audience:     'Professionals seeking practical knowledge and industry perspective. Medium\'s business/finance audience includes mid-level managers, startup founders, HR professionals, and self-employed individuals researching financial and operational topics.',
    structure: [
      'Title: SEO-informed but benefit-driven — include a primary keyword naturally.',
      'Subtitle: 1–2 sentence expansion of the title promise.',
      'Opening: hook within the first 2 sentences — stat, story, or provocative statement.',
      'Subheadings every 300–400 words to aid scanning.',
      'Practical numbered lists or frameworks in the body.',
      'Conclusion with clear takeaway and optional CTA.',
    ].join(' '),
    hooks: [
      'Most business owners are paying a tax they don\'t have to — and their payroll company benefits from keeping it that way.',
      'I ran the numbers on 50 small businesses. Every single one was overpaying FICA taxes.',
      'The SIMRP has existed since the Eisenhower administration. Here\'s why most CFOs have never seen it implemented.',
      'If your employee benefits package looks like everyone else\'s, your company is probably leaving significant money on the table.',
      'What the payroll industry doesn\'t want HR directors to know about Section 105 of the IRS code.',
    ],
    hashtagRule: 'Use 3–5 tags (Medium calls them "topics"). Choose from Medium\'s official topic list where possible — "Business," "Finance," "Human Resources," "Entrepreneurship," "Leadership" perform well. Tags determine which curated topic feeds your article appears in and directly affect distribution to non-followers.',
    tone:         'Authoritative but accessible. Medium readers expect expertise delivered clearly — not academic jargon, not blog fluff. Write like a senior practitioner explaining something important to a smart colleague who isn\'t a specialist in your domain. Data, examples, and structured frameworks outperform opinion-only pieces.',
    engagement:   'Medium claps and responses are secondary to read ratio (percentage of openers who finish the article). A high read ratio (60%+) unlocks Partner Program earnings and algorithmic distribution. Structure your article so every section delivers on the headline promise — readers who feel misled by a clickbait title abandon immediately and tank your ratio.',
    avoid: [
      'Titles that overpromise ("The One Secret That Will Transform Your Business")',
      'Walls of text without subheadings — Medium readers are scanners first',
      'Promotional content disguised as editorial — Medium curators penalize thinly-veiled ads',
      'Articles shorter than 800 words — Partner Program rarely distributes short pieces widely',
    ],
    proTip: 'Submit your best articles to curated Medium publications in your niche ("Better Business," "The Startup," "Personal Finance"). Accepted submissions get distributed to the publication\'s entire subscriber base — a single accepted piece in a major publication can drive 5,000–20,000 readers who would never find you through organic search or your own followers.',
  },
}

/**
 * Universal list of overused AI and marketing phrases that make copy sound generic.
 * Injected into ALL copy generation system prompts.
 */
export const BANNED_PHRASES = [
  // AI clichés
  'game-changer', 'game changer', 'cutting-edge', 'cutting edge', 'revolutionary', 'groundbreaking',
  'innovative solution', 'state-of-the-art', 'next-generation', 'next generation', 'transformative',
  'seamless', 'seamlessly', 'robust', 'leverage' /* as a verb */, 'synergy', 'synergize',
  'unlock', 'unlocking', 'empowering', 'empower your', 'utilize', 'utilize the power',
  'in today\'s world', 'in today\'s fast-paced', 'more than ever before', 'at the end of the day',
  'it\'s no secret', 'the fact of the matter', 'when it comes to',
  // Generic opener phrases
  'are you tired of', 'have you ever wondered', 'did you know that', 'in a world where',
  'look no further', 'we are excited to', 'we are proud to', 'we are pleased to announce',
  'we are thrilled', 'introducing the', 'meet the future of',
  // Vague value claims
  'world-class', 'best-in-class', 'industry-leading', 'best of breed', 'unparalleled',
  'unrivaled', 'second to none', 'top-notch', 'first-rate', 'premier',
  'comprehensive solution', 'holistic approach', 'end-to-end', 'full-spectrum', 'all-encompassing',
  // Filler transitions
  'needless to say', 'it goes without saying', 'as we all know', 'as mentioned earlier',
  'last but not least', 'first and foremost', 'without further ado', 'with that being said',
  // Buzzwords
  'ecosystem', 'paradigm shift', 'disruptive', 'disrupt', 'pivot', 'scale' /* as a verb */,
  'bandwidth', 'boil the ocean', 'circle back', 'deep dive', 'move the needle',
  'value proposition', 'low-hanging fruit', 'think outside the box', 'on the same page',
]

export const BANNED_PHRASES_RULE = `BANNED WORDS & PHRASES — never use any of the following in any output:\n${BANNED_PHRASES.map((p) => `  ✗ "${p}"`).join('\n')}`

/**
 * Builds a rich system prompt for AI caption/content generation.
 * Injected as the `system` parameter in Claude API calls — carries more
 * weight than user-message context.
 *
 * @param platform  The target social platform
 * @param brandCtx  Brand context string from buildBrandPromptContext()
 * @param mode      'caption' | 'series' — adjusts guidance emphasis
 */
export function buildPlatformSystemPrompt(
  platform:  SocialPlatform | string,
  brandCtx:  string,
  mode:      'caption' | 'series' = 'caption',
): string {
  const ctx = PLATFORM_CONTEXTS[platform as SocialPlatform]

  const sections: string[] = [
    `You are an expert social media copywriter specializing in financial services, employee benefits, and B2B content marketing.`,
    `Your writing is precise, engaging, and always anchored in real business value — never vague or generic.`,
    ``,
    `═══════════════════════════════`,
    `BRAND CONTEXT`,
    `═══════════════════════════════`,
    brandCtx,
  ]

  if (ctx) {
    sections.push(
      ``,
      `═══════════════════════════════`,
      `PLATFORM: ${ctx.label.toUpperCase()} — BEST PRACTICES`,
      `═══════════════════════════════`,
      ``,
      `AUDIENCE`,
      ctx.audience,
      ``,
      `OPTIMAL LENGTH`,
      ctx.optimalRange,
      ...(ctx.charLimit > 0 ? [`Hard character limit: ${ctx.charLimit} characters.`] : []),
      ``,
      `POST STRUCTURE`,
      ctx.structure,
      ``,
      `TONE & VOICE`,
      ctx.tone,
      ``,
      `PROVEN HOOK PATTERNS (adapt, don\'t copy verbatim)`,
      ...ctx.hooks.map((h) => `  • ${h}`),
      ``,
      `HASHTAG STRATEGY`,
      ctx.hashtagRule,
      ``,
      `ENGAGEMENT TACTICS`,
      ctx.engagement,
      ``,
      `AVOID THESE PATTERNS`,
      ...ctx.avoid.map((a) => `  ✗ ${a}`),
      ``,
      `PRO TIP`,
      ctx.proTip,
    )
  } else {
    // Generic fallback for platforms without a config
    sections.push(
      ``,
      `Platform: ${platform}`,
      `Write in a clear, professional, engaging tone appropriate for this platform.`,
    )
  }

  if (mode === 'series') {
    sections.push(
      ``,
      `═══════════════════════════════`,
      `SERIES CONTENT RULES`,
      `═══════════════════════════════`,
      `Each post in the series must be able to stand alone — readers may see them out of order.`,
      `Build a narrative arc: awareness → education → credibility → action.`,
      `Vary the hook type across posts: open with a stat, a story, a question, a myth-bust, a contrarian take.`,
      `Ensure each post ends in a way that creates curiosity for the next without requiring it.`,
    )
  }

  sections.push(
    ``,
    `═══════════════════════════════`,
    BANNED_PHRASES_RULE,
    `═══════════════════════════════`,
    ``,
    `═══════════════════════════════`,
    `OUTPUT RULES`,
    `═══════════════════════════════`,
    `- Apply the brand voice restrictions above without exception.`,
    `- Use specific numbers and facts where available (e.g., $550/employee, 7.65% FICA, §125).`,
    `- Never open a post with the brand name or "We".`,
    `- Write for a decision-maker who is skeptical and time-pressed — earn their attention in the first line.`,
  )

  return sections.join('\n')
}

/** Returns the platform character limit, or 0 if none enforced. */
export function getPlatformCharLimit(platform: string): number {
  return PLATFORM_CONTEXTS[platform as SocialPlatform]?.charLimit ?? 0
}

/**
 * Builds a system prompt for voiceover / audio script generation.
 * Injected as the `system` parameter in Claude API calls.
 *
 * @param brandCtx  Brand context string from buildBrandPromptContext()
 */
export function buildVoiceoverSystemPrompt(brandCtx: string): string {
  return [
    `You are an expert voiceover scriptwriter specializing in financial services, employee benefits, and B2B marketing.`,
    `Your scripts are written for the human ear — conversational, rhythmic, and built for professional narration.`,
    ``,
    `═══════════════════════════════`,
    `BRAND CONTEXT`,
    `═══════════════════════════════`,
    brandCtx,
    ``,
    `═══════════════════════════════`,
    `VOICEOVER SCRIPT BEST PRACTICES`,
    `═══════════════════════════════`,
    ``,
    `STRUCTURE`,
    `Open with a hook: a surprising stat, a provocative question, or a bold claim within the first 5–8 words.`,
    `Middle: one focused point — explain, prove, or illustrate. Don't try to say everything.`,
    `Close: one clear call to action or a line that sticks in the listener's mind.`,
    ``,
    `SPOKEN STYLE`,
    `Write for the ear, not the page. Short sentences (8–12 words) with natural breathing points.`,
    `Use contractions: "you're", "it's", "we've" — never "you are", "it is", "we have".`,
    `Vary sentence rhythm: mix short punchy statements with slightly longer explanations.`,
    ``,
    `TONE`,
    `Confident but not aggressive. Authoritative but accessible.`,
    `The voice should feel like a trusted advisor speaking directly to a decision-maker, not a salesperson pitching.`,
    ``,
    `AVOID`,
    `  ✗ Jargon without explanation ("FICA redirect" must be briefly clarified on first use)`,
    `  ✗ Passive voice ("benefits are provided" → "you provide benefits")`,
    BANNED_PHRASES_RULE,
    ``,
    `═══════════════════════════════`,
    `OUTPUT RULES`,
    `═══════════════════════════════`,
    `- Output only the script text — no labels, headers, stage directions, or [PAUSE] markers.`,
    `- Use specific numbers and facts where available (e.g., $550/employee, 7.65% FICA, §125).`,
    `- Respect the word count target — do not pad or truncate significantly.`,
  ].join('\n')
}
