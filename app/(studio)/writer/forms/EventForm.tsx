'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { input, label, field } from './styles'

const EVENT_FORMATS = ['Virtual', 'In-Person', 'Hybrid']

export default function EventForm({ onChange }: { onChange: (v: string) => void }) {
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
            <button key={f} type="button" onClick={() => setFormat(f)}
              className={cn(
                'flex-1 py-1.5 text-[10px] font-medium rounded-lg border transition-colors',
                format === f
                  ? 'bg-brand-azure text-white border-brand-azure'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-azure',
              )}>
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
