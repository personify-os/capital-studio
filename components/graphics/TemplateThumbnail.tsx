import { EMBER_GLOW_BG } from '@/lib/template-constants'

interface Props { id: string; active: boolean }

export default function TemplateThumbnail({ id, active }: Props) {
  const base = active ? 'bg-brand-navy' : 'bg-gray-800'
  const bar1 = active ? 'bg-white/90' : 'bg-white/70'
  const bar2 = active ? 'bg-white/40' : 'bg-white/30'
  const half = active ? 'bg-brand-azure' : 'bg-gray-600'
  const btn  = active ? 'bg-brand-orange' : 'bg-gray-500'

  if (id === 'stat-callout') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className={`${bar1} h-6 w-3/5 rounded`} />
      <div className={`${bar2} h-2 w-2/5 rounded`} />
    </div>
  )
  if (id === 'quote-card') return (
    <div className={`w-full h-full ${half} flex flex-col items-center justify-center gap-1 p-2`}>
      <div className="text-white/60 text-2xl font-serif leading-none mb-0.5">"</div>
      <div className={`${bar1} h-1.5 w-4/5 rounded`} />
      <div className={`${bar1} h-1.5 w-3/5 rounded`} />
      <div className={`${bar2} h-1 w-2/5 rounded mt-1`} />
    </div>
  )
  if (id === 'tip-card') return (
    <div className="w-full h-full bg-white flex flex-col justify-center gap-1.5 p-2">
      <div className="flex items-center gap-1">
        <div className={`w-4 h-4 rounded-full ${half} flex-shrink-0`} />
        <div className="h-2 w-3/5 rounded bg-gray-800/60" />
      </div>
      <div className="h-1.5 w-full rounded bg-gray-300" />
      <div className="h-1.5 w-4/5 rounded bg-gray-200" />
    </div>
  )
  if (id === 'announcement') return (
    <div className={`w-full h-full ${base} flex flex-col justify-between p-2`}>
      <div className={`${bar1} h-3 w-4/5 rounded`} />
      <div className={`${bar2} h-1.5 w-3/5 rounded`} />
      <div className={`${btn} h-3.5 w-2/5 rounded`} />
    </div>
  )
  if (id === 'comparison') return (
    <div className="w-full h-full flex gap-0.5">
      <div className="flex-1 bg-gray-600 flex flex-col justify-center gap-1 p-1.5">
        <div className="h-1.5 w-full rounded bg-white/30" />
        <div className="h-1 w-3/4 rounded bg-white/20" />
        <div className="h-1 w-3/4 rounded bg-white/20" />
      </div>
      <div className={`flex-1 ${half} flex flex-col justify-center gap-1 p-1.5`}>
        <div className="h-1.5 w-full rounded bg-white/70" />
        <div className="h-1 w-3/4 rounded bg-white/50" />
        <div className="h-1 w-3/4 rounded bg-white/50" />
      </div>
    </div>
  )
  if (id === 'benefit-list') return (
    <div className="w-full h-full bg-white flex flex-col justify-center gap-1 p-2">
      <div className="h-2 w-4/5 rounded bg-gray-700 mb-1" />
      {[1,2,3].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-sm ${active ? 'bg-brand-azure' : 'bg-gray-400'} flex-shrink-0`} />
          <div className="h-1.5 flex-1 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
  if (id === 'savings-calculator') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-center gap-1 p-2`}>
      <div className={`${bar2} h-1.5 w-3/5 rounded`} />
      <div className={`${bar1} h-5 w-2/3 rounded`} />
      <div className={`${bar2} h-1 w-2/5 rounded`} />
    </div>
  )
  if (id === 'irs-code-explainer') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className={`${bar1} h-5 w-2/5 rounded font-mono text-center`} />
      <div className={`${bar2} h-1.5 w-4/5 rounded`} />
      <div className={`${bar2} h-1.5 w-3/5 rounded`} />
    </div>
  )
  if (id === 'case-study-card') return (
    <div className={`w-full h-full ${half} flex flex-col justify-between p-2`}>
      <div className="h-1.5 w-3/4 rounded bg-white/70" />
      <div className="space-y-0.5">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
            <div className="h-1 flex-1 rounded bg-white/40" />
          </div>
        ))}
      </div>
      <div className="h-3 w-3/5 rounded bg-white/90" />
    </div>
  )
  if (id === 'email-header') return (
    <div className={`w-full h-full ${base} flex items-center justify-between px-2`}>
      <div className="w-6 h-6 rounded bg-white/30" />
      <div className="flex flex-col items-end gap-1">
        <div className="h-2 w-12 rounded bg-white/70" />
        <div className="h-1 w-8 rounded bg-white/30" />
      </div>
    </div>
  )
  if (id === 'cta-banner') return (
    <div className={`w-full h-full ${btn} flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className="h-2.5 w-4/5 rounded bg-white/90" />
      <div className="h-1.5 w-3/5 rounded bg-white/50" />
      <div className="h-3 w-2/5 rounded bg-white mt-1" />
    </div>
  )
  if (id === 'linkedin-ad') return (
    <div className="w-full h-full bg-gray-700 flex flex-col justify-end">
      <div className="bg-black/60 p-1.5">
        <div className="h-1.5 w-4/5 rounded bg-white/90 mb-1" />
        <div className="h-1 w-2/5 rounded bg-white/50" />
      </div>
    </div>
  )
  if (id === 'story-ad') return (
    <div className="w-full h-full bg-gradient-to-b from-brand-navy to-brand-azure flex flex-col items-center justify-center gap-1.5 p-2">
      <div className="h-3 w-4/5 rounded bg-white/90" />
      <div className="h-1.5 w-3/5 rounded bg-white/50" />
      <div className="h-3.5 w-2/5 rounded bg-white/90 mt-1" />
    </div>
  )

  // ── Style templates ────────────────────────────────────────────────────
  if (id === 'split-layout') return (
    <div className="w-full h-full flex gap-0">
      <div className="flex-1 bg-gray-500 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-gray-800" />
      </div>
      <div className="flex-1 bg-gray-800 flex flex-col justify-center gap-1 p-1.5">
        <div className="h-2.5 w-full rounded bg-white/80" />
        <div className="h-1.5 w-3/4 rounded bg-white/40" />
        <div className="h-1.5 w-4/5 rounded bg-white/30" />
      </div>
    </div>
  )
  if (id === 'numbered-list') return (
    <div className={`w-full h-full ${base} flex flex-col justify-center gap-1 p-2`}>
      <div className="h-2 w-3/4 rounded bg-white/80 mb-1" />
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-1.5 border-t border-white/10 pt-1">
          <span className={`text-[10px] font-bold ${active ? 'text-brand-azure' : 'text-gray-400'} w-3 text-center`}>{n}</span>
          <div className="h-1.5 flex-1 rounded bg-white/30" />
        </div>
      ))}
    </div>
  )
  if (id === 'event-poster') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-between p-2`}>
      <div className="h-1 w-3/5 rounded bg-white/30" />
      <div className="flex flex-col items-center gap-1">
        <div className="h-3 w-4/5 rounded bg-white/80" />
        <div className={`h-2 w-1/4 rounded ${active ? 'bg-brand-azure' : 'bg-gray-500'}`} />
        <div className="h-1.5 w-2/3 rounded bg-white/30" />
      </div>
      <div className={`h-3 w-3/5 rounded ${btn}`} />
    </div>
  )
  if (id === 'diagonal-overlay') return (
    <div className="w-full h-full bg-gray-500 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.72) 100%)' }} />
      <div className="absolute bottom-2 left-2 right-2 space-y-1">
        <div className="h-2 w-4/5 rounded bg-white/85" />
        <div className="h-1.5 w-3/5 rounded bg-white/45" />
      </div>
    </div>
  )
  if (id === 'center-vignette') return (
    <div className="w-full h-full bg-gray-500 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 rounded" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.82) 100%)' }} />
      <div className="relative z-10 flex flex-col items-center gap-1">
        <div className="h-2.5 w-14 rounded bg-white/85" />
        <div className="h-1.5 w-10 rounded bg-white/45" />
      </div>
    </div>
  )
  if (id === 'light-gradient') return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 ${active ? 'bg-gradient-to-br from-brand-azure to-brand-teal' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
      <div className="h-2.5 w-4/5 rounded bg-gray-900/80" />
      <div className="h-1.5 w-3/5 rounded bg-gray-900/50" />
      <div className="h-3 w-2/5 rounded bg-gray-900/70 mt-1" />
    </div>
  )
  if (id === 'ember-glow') return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2" style={{ background: EMBER_GLOW_BG }}>
      <div className="h-2.5 w-4/5 rounded bg-white/80" />
      <div className="h-1.5 w-3/5 rounded bg-white/40" />
      <div className="h-3 w-2/5 rounded border border-white/30 mt-1" />
    </div>
  )
  if (id === 'type-decoration') return (
    <div className={`w-full h-full ${base} flex items-center justify-center relative overflow-hidden p-2`}>
      <div className="absolute w-12 h-12 rounded-full border border-white/10 -bottom-2 -right-2" />
      <div className="absolute w-6 h-6 rounded-full border border-white/8 top-1 left-1" />
      <div className="flex flex-col items-center gap-1">
        <div className="h-3 w-4/5 rounded bg-white/80" />
        <div className={`h-1 w-1 rounded-full ${active ? 'bg-brand-azure' : 'bg-gray-500'}`} />
        <div className="h-1.5 w-3/5 rounded bg-white/35" />
      </div>
    </div>
  )

  return (
    <div className={`w-full h-full ${base} flex items-center justify-center`}>
      <div className={`w-8 h-8 rounded-lg ${bar2}`} />
    </div>
  )
}
