// Shared Content Intent pill options used across all studio modules

export const TOPIC_PILLS = [
  'Employee Benefits',
  'SIMRP Savings',
  'Tax Strategy',
  'Wellness Plans',
  'Supplemental Benefits',
  'Business Growth',
  'HR Solutions',
  'Client Success',
]

export const PURPOSE_PILLS = [
  { label: 'Educate',        emoji: '📚' },
  { label: 'Generate Leads', emoji: '🎯' },
  { label: 'Engage',         emoji: '💬' },
  { label: 'Announce',       emoji: '📣' },
  { label: 'Inspire',        emoji: '✨' },
  { label: 'Build Trust',    emoji: '🤝' },
]

export const CTA_PILLS = [
  'Book Assessment',
  'Learn More',
  'Contact Us',
  'Schedule Call',
  'Get a Quote',
  'Share This',
]

export function buildIntentString(topics: string[], purpose: string, cta: string): string {
  const parts = [
    topics.length ? `Topic: ${topics.join(', ')}` : null,
    purpose       ? `Purpose: ${purpose}`          : null,
    cta           ? `CTA: ${cta}`                  : null,
  ].filter(Boolean)
  return parts.join(' · ')
}
