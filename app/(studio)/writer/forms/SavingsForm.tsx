'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { input, label, field } from './styles'

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

export default function SavingsForm({ onChange }: { onChange: (v: string) => void }) {
  const [employees, setEmployees] = useState('')
  const [industry,  setIndustry]  = useState('')
  const [focus,     setFocus]     = useState('')
  const [extra,     setExtra]     = useState('')

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
      <div className={field}>
        <label className={label}>Number of employees <span className="text-red-400">*</span></label>
        <input type="number" min="1" max="10000" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="e.g. 45" className={input} />
        {count > 0 && (
          <div className="mt-1.5 px-3 py-2 bg-brand-azure/5 border border-brand-azure/20 rounded-lg">
            <p className="text-[10px] text-brand-azure font-medium">
              Estimated savings: <span className="font-bold">${estimate.toLocaleString()}/year</span>
              <span className="text-brand-azure/60 font-normal ml-1">({count} employees × $550)</span>
            </p>
          </div>
        )}
      </div>

      <div className={field}>
        <label className={label}>Industry <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={input}>
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className={field}>
        <label className={label}>Content focus <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <div className="flex flex-wrap gap-1.5">
          {SAVINGS_FOCUS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFocus(focus === f.id ? '' : f.id)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full border transition-colors',
                focus === f.id
                  ? 'bg-brand-azure text-white border-brand-azure'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-azure hover:text-brand-azure',
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={field}>
        <label className={label}>Extra context <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)}
          placeholder="Any additional details — specific pain points, what they currently spend, etc."
          rows={2} maxLength={300} className={cn(input, 'resize-none')} />
      </div>
    </div>
  )
}
