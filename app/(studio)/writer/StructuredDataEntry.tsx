'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ─── Shared input style ────────────────────────────────────────────────────────

const input = 'w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition'
const label = 'block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5'
const field = 'space-y-1'

// ─── Savings Calculator Form ───────────────────────────────────────────────────

const INDUSTRIES = [
  'Healthcare', 'Professional Services', 'Construction', 'Retail',
  'Manufacturing', 'Restaurant / Hospitality', 'Technology', 'Real Estate',
  'Transportation / Logistics', 'Other',
]

const SAVINGS_FOCUS = [
  { id: 'annual-total',   label: 'Total annual savings' },
  { id: 'per-employee',   label: '$550/employee framing' },
  { id: 'small-business', label: 'Small business angle' },
  { id: 'vs-cost',        label: 'Savings vs. benefits cost' },
]

function SavingsForm({ onChange }: { onChange: (v: string) => void }) {
  const [employees,   setEmployees]   = useState('')
  const [industry,    setIndustry]    = useState('')
  const [focus,       setFocus]       = useState('')
  const [extra,       setExtra]       = useState('')

  const count    = parseInt(employees) || 0
  const estimate = count * 550

  useEffect(() => {
    if (!employees) { onChange(''); return }
    const parts = [
      `Company size: ${employees} employees`,
      industry ? `Industry: ${industry}` : null,
      count > 0 ? `Estimated annual FICA savings: approximately $${estimate.toLocaleString()} (based on $550/employee/year average)` : null,
      focus ? `Content focus: ${SAVINGS_FOCUS.find((f) => f.id === focus)?.label}` : null,
      extra ? `Additional context: ${extra}` : null,
    ].filter(Boolean)
    onChange(parts.join('\n'))
  }, [employees, industry, focus, extra])

  return (
    <div className="space-y-3">
      {/* Employee count + live preview */}
      <div className={field}>
        <label className={label}>Number of employees <span className="text-red-400">*</span></label>
        <input
          type="number"
          min="1"
          max="10000"
          value={employees}
          onChange={(e) => setEmployees(e.target.value)}
          placeholder="e.g. 45"
          className={input}
        />
        {count > 0 && (
          <div className="mt-1.5 px-3 py-2 bg-brand-azure/5 border border-brand-azure/20 rounded-lg">
            <p className="text-[10px] text-brand-azure font-medium">
              Estimated savings: <span className="font-bold">${estimate.toLocaleString()}/year</span>
              <span className="text-brand-azure/60 font-normal ml-1">({count} employees × $550)</span>
            </p>
          </div>
        )}
      </div>

      {/* Industry */}
      <div className={field}>
        <label className={label}>Industry <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={input}>
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Focus angle */}
      <div className={field}>
        <label className={label}>Content focus <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <div className="flex flex-wrap gap-1.5">
          {SAVINGS_FOCUS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFocus(focus === f.id ? '' : f.id)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full border transition-colors',
                focus === f.id
                  ? 'bg-brand-azure text-white border-brand-azure'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-azure hover:text-brand-azure',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extra context */}
      <div className={field}>
        <label className={label}>Extra context <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Any additional details — specific pain points, what they currently spend, etc."
          rows={2}
          maxLength={300}
          className={cn(input, 'resize-none')}
        />
      </div>
    </div>
  )
}

// ─── Event Announcement Form ───────────────────────────────────────────────────

const EVENT_FORMATS = ['Virtual', 'In-Person', 'Hybrid']

function EventForm({ onChange }: { onChange: (v: string) => void }) {
  const [eventName, setEventName] = useState('')
  const [date,      setDate]      = useState('')
  const [time,      setTime]      = useState('')
  const [format,    setFormat]    = useState('Virtual')
  const [location,  setLocation]  = useState('')
  const [takeaway,  setTakeaway]  = useState('')
  const [regLink,   setRegLink]   = useState('')

  useEffect(() => {
    if (!eventName) { onChange(''); return }
    const parts = [
      `Event: ${eventName}`,
      date     ? `Date: ${date}` : null,
      time     ? `Time: ${time}` : null,
      `Format: ${format}`,
      location ? `Location/Platform: ${location}` : null,
      takeaway ? `What attendees will learn or gain: ${takeaway}` : null,
      regLink  ? `Registration link: ${regLink}` : null,
    ].filter(Boolean)
    onChange(parts.join('\n'))
  }, [eventName, date, time, format, location, takeaway, regLink])

  return (
    <div className="space-y-3">
      <div className={field}>
        <label className={label}>Event name <span className="text-red-400">*</span></label>
        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. SIMRP 101 Webinar" className={input} maxLength={100} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={field}>
          <label className={label}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </div>
        <div className={field}>
          <label className={label}>Time</label>
          <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="2:00 PM EST" className={input} />
        </div>
      </div>

      <div className={field}>
        <label className={label}>Format</label>
        <div className="flex gap-1.5">
          {EVENT_FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={cn(
                'flex-1 py-1.5 text-[10px] font-medium rounded-lg border transition-colors',
                format === f
                  ? 'bg-brand-azure text-white border-brand-azure'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-azure',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={field}>
        <label className={label}>{format === 'Virtual' ? 'Platform' : 'Location'} <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={format === 'Virtual' ? 'Zoom, Teams, etc.' : 'City, venue'} className={input} />
      </div>

      <div className={field}>
        <label className={label}>What attendees will learn <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <textarea value={takeaway} onChange={(e) => setTakeaway(e.target.value)} placeholder="Key takeaway or outcome from attending…" rows={2} maxLength={200} className={cn(input, 'resize-none')} />
      </div>

      <div className={field}>
        <label className={label}>Registration link <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <input type="url" value={regLink} onChange={(e) => setRegLink(e.target.value)} placeholder="https://…" className={input} />
      </div>
    </div>
  )
}

// ─── Client Success Story Form ─────────────────────────────────────────────────

function ClientForm({ onChange }: { onChange: (v: string) => void }) {
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

// ─── Main Component ────────────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  'payroll-tax-savings': 'Savings Calculator',
  'event-webinar':       'Event Details',
  'client-success':      'Success Story Details',
}

interface Props {
  tier2Id:  string
  onChange: (formText: string) => void
}

export default function StructuredDataEntry({ tier2Id, onChange }: Props) {
  return (
    <div className="bg-brand-azure/5 border border-brand-azure/20 rounded-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-azure" />
        <p className="text-[10px] font-semibold text-brand-azure uppercase tracking-widest">
          {LABELS[tier2Id] ?? 'Post Details'}
        </p>
        <span className="text-[9px] text-brand-azure/60">structured mode</span>
      </div>

      {tier2Id === 'payroll-tax-savings' && <SavingsForm   onChange={onChange} />}
      {tier2Id === 'event-webinar'       && <EventForm     onChange={onChange} />}
      {tier2Id === 'client-success'      && <ClientForm    onChange={onChange} />}
    </div>
  )
}
