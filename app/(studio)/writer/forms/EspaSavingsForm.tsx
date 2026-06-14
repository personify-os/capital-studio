'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { input, label, field } from './styles'

const INDUSTRIES = [
  'Healthcare', 'Professional Services', 'Construction', 'Retail',
  'Manufacturing', 'Restaurant / Hospitality', 'Nonprofit', 'Church / Ministry',
  'School / Education', 'Municipality / Government', 'Technology', 'Other',
]

const ESPA_FOCUS = [
  { id: 'employer-savings', label: 'Employer FICA savings' },
  { id: 'allotment',        label: '$150/mo benefit allotment' },
  { id: 'no-net-cost',      label: 'No net cost angle' },
  { id: 'preventive-care',  label: 'Preventive health value' },
]

// ESPA figures (per program materials; estimates)
const SAVINGS_PER_EMPLOYEE = 505
const MONTHLY_ALLOTMENT     = 150

export default function EspaSavingsForm({ onChange }: { onChange: (v: string) => void }) {
  const [employees, setEmployees] = useState('')
  const [industry,  setIndustry]  = useState('')
  const [focus,     setFocus]     = useState('')
  const [extra,     setExtra]     = useState('')

  const count           = parseInt(employees) || 0
  const employerSavings = count * SAVINGS_PER_EMPLOYEE
  const annualAllotment = count * MONTHLY_ALLOTMENT * 12

  useEffect(() => {
    if (!employees) { onChange(''); return }
    const parts = [
      `Company size: ${employees} employees`,
      industry ? `Industry: ${industry}` : null,
      count > 0 ? `Estimated employer net FICA savings: approximately $${employerSavings.toLocaleString()}/year (based on ~$505/employee/year after admin fees — an estimate, not a guarantee)` : null,
      count > 0 ? `Employee voluntary-benefit allotment: ~$${MONTHLY_ALLOTMENT}/employee/month (~$${annualAllotment.toLocaleString()}/year across the team), with no reduction in take-home pay` : null,
      focus ? `Content focus: ${ESPA_FOCUS.find((f) => f.id === focus)?.label}` : null,
      extra ? `Additional context: ${extra}` : null,
      'Compliance: ESPA is built on Section 125 + IRS 213(d); HIPAA/ERISA/ACA compliant. Use estimate language; do not promise specific savings or tax outcomes.',
    ].filter(Boolean)
    onChange(parts.join('\n'))
  }, [employees, industry, focus, extra])

  return (
    <div className="space-y-3">
      <div className={field}>
        <label className={label}>Number of employees <span className="text-red-400">*</span></label>
        <input type="number" min="1" max="10000" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="e.g. 45" className={input} />
        {count > 0 && (
          <div className="mt-1.5 px-3 py-2 bg-brand-emerald/5 border border-brand-emerald/20 rounded-lg space-y-0.5">
            <p className="text-[10px] text-brand-emerald font-medium">
              Employer savings: <span className="font-bold">${employerSavings.toLocaleString()}/year</span>
              <span className="text-brand-emerald/60 font-normal ml-1">({count} × $505)</span>
            </p>
            <p className="text-[10px] text-brand-emerald font-medium">
              Employee allotment: <span className="font-bold">${MONTHLY_ALLOTMENT}/mo each</span>
              <span className="text-brand-emerald/60 font-normal ml-1">(~${annualAllotment.toLocaleString()}/yr total)</span>
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
          {ESPA_FOCUS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFocus(focus === f.id ? '' : f.id)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full border transition-colors',
                focus === f.id
                  ? 'bg-brand-emerald text-white border-brand-emerald'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-emerald hover:text-brand-emerald',
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={field}>
        <label className={label}>Extra context <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)}
          placeholder="Any additional details — current benefits, pain points, etc."
          rows={2} maxLength={300} className={cn(input, 'resize-none')} />
      </div>
    </div>
  )
}
