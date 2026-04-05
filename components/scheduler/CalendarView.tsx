'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduledPost } from './types'

export default function CalendarView({ posts }: { posts: ScheduledPost[] }) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const monthName    = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay     = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const daysInPrev   = new Date(year, month, 0).getDate()

  const postsByDate: Record<string, ScheduledPost[]> = {}
  for (const p of posts) {
    const d   = new Date(p.scheduledFor)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    postsByDate[key] = [...(postsByDate[key] ?? []), p]
  }

  type Cell = { day: number; currentMonth: boolean; date: string }
  const cells: Cell[] = []
  const prevM = month === 0 ? 11 : month - 1
  const prevY = month === 0 ? year - 1 : year
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    cells.push({ day: d, currentMonth: false, date: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }
  const nextM = month === 11 ? 0 : month + 1
  const nextY = month === 11 ? year + 1 : year
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ day: d, currentMonth: false, date: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-brand-navy min-w-[168px] text-center">{monthName}</span>
          <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
          className="text-xs font-medium text-brand-azure border border-brand-azure/30 px-2.5 py-1 rounded-lg hover:bg-brand-azure/5 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {cells.map((cell, i) => {
          const dayPosts = postsByDate[cell.date] ?? []
          const isToday  = cell.date === todayStr
          return (
            <div key={i} className={cn('bg-white min-h-[90px] p-1.5', !cell.currentMonth && 'bg-gray-50/60')}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 mx-auto',
                isToday ? 'bg-brand-azure text-white' : cell.currentMonth ? 'text-gray-700' : 'text-gray-300',
              )}>
                {cell.day}
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    title={p.caption ?? ''}
                    className={cn(
                      'text-[9px] px-1 py-0.5 rounded truncate font-medium',
                      p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700'
                        : p.status === 'FAILED' ? 'bg-red-100 text-red-600'
                        : 'bg-brand-azure/10 text-brand-azure',
                    )}
                  >
                    {p.caption ?? '(no caption)'}
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-[9px] text-gray-400 font-medium pl-1">+{dayPosts.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
