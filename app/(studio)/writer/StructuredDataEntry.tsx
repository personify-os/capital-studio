'use client'

import SavingsForm from './forms/SavingsForm'
import EventForm   from './forms/EventForm'
import ClientForm  from './forms/ClientForm'

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

      {tier2Id === 'payroll-tax-savings' && <SavingsForm onChange={onChange} />}
      {tier2Id === 'event-webinar'       && <EventForm   onChange={onChange} />}
      {tier2Id === 'client-success'      && <ClientForm  onChange={onChange} />}
    </div>
  )
}
