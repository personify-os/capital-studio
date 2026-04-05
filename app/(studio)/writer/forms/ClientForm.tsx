'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { input, label, field } from './styles'

export default function ClientForm({ onChange }: { onChange: (v: string) => void }) {
  const [companyType, setCompanyType] = useState('')
  const [challenge,   setChallenge]   = useState('')
  const [outcome,     setOutcome]     = useState('')
  const [result,      setResult]      = useState('')
  const [quote,       setQuote]       = useState('')

  useEffect(() => {
    if (!companyType && !challenge) { onChange(''); return }
    const parts = [
      companyType ? `Client: ${companyType}` : null,
      challenge   ? `Challenge before SIMRP: ${challenge}` : null,
      outcome     ? `What changed after implementing SIMRP: ${outcome}` : null,
      result      ? `Key result: ${result}` : null,
      quote       ? `Client quote: "${quote}"` : null,
      'Note: use approximate/qualitative language — do not state specific savings as guarantees.',
    ].filter(Boolean)
    onChange(parts.join('\n'))
  }, [companyType, challenge, outcome, result, quote])

  return (
    <div className="space-y-3">
      <div className={field}>
        <label className={label}>Company type <span className="text-red-400">*</span></label>
        <input type="text" value={companyType} onChange={(e) => setCompanyType(e.target.value)} placeholder="e.g. 45-person manufacturing company in Ohio" className={input} maxLength={100} />
      </div>

      <div className={field}>
        <label className={label}>Challenge before SIMRP <span className="text-red-400">*</span></label>
        <textarea value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="What problem were they trying to solve? What was missing from their benefits package?" rows={2} maxLength={300} className={cn(input, 'resize-none')} />
      </div>

      <div className={field}>
        <label className={label}>What changed <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="What benefits did employees gain? What did the employer experience during implementation?" rows={2} maxLength={300} className={cn(input, 'resize-none')} />
      </div>

      <div className={field}>
        <label className={label}>Key result <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <input type="text" value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g. Added telehealth + supplemental benefits for all 45 employees at zero added cost" className={input} maxLength={200} />
      </div>

      <div className={field}>
        <label className={label}>Client quote <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Direct quote from the client (with permission)…" rows={2} maxLength={300} className={cn(input, 'resize-none')} />
      </div>

      <p className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
        Specific savings amounts will be framed as estimates — no dollar guarantees in the generated copy.
      </p>
    </div>
  )
}
