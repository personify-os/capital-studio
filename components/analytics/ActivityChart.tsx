import { BarChart3 } from 'lucide-react'

interface DayData { date: string; count: number }

interface Props {
  dailyData: DayData[]
  maxDay:    number
}

// Aggregate daily buckets into weekly buckets for dense charts
function toWeekly(days: DayData[]): DayData[] {
  const weeks: DayData[] = []
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7)
    weeks.push({ date: slice[0].date, count: slice.reduce((s, d) => s + d.count, 0) })
  }
  return weeks
}

export default function ActivityChart({ dailyData, maxDay: _ }: Props) {
  const days = dailyData.length

  // Choose display granularity based on window size
  const buckets = days > 90 ? toWeekly(dailyData) : dailyData
  const unit    = days > 90 ? 'week' : 'day'
  const maxVal  = Math.max(...buckets.map((b) => b.count), 1)

  const label =
    days <= 7   ? 'last 7 days' :
    days <= 30  ? 'last 30 days' :
    days <= 90  ? 'last 90 days' :
    days <= 365 ? 'last 12 months' : 'all time'

  return (
    <div className="bg-white rounded-card shadow-card p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-brand-azure" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Daily Activity — {label}
        </p>
      </div>
      <div className="flex items-end gap-0.5 h-24">
        {buckets.map(({ date, count }) => {
          const heightPct = Math.round((count / maxVal) * 100)
          return (
            <div key={date} className="group relative flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full bg-brand-azure/80 hover:bg-brand-azure rounded-t transition-colors cursor-default"
                style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%` }}
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-navy text-white text-[9px] font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {date.slice(5)}{unit === 'week' ? '+' : ''}: {count}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-end gap-0.5 mt-1">
        {buckets.map(({ date }, i) => (
          <div key={date} className="flex-1 text-center">
            {i % (unit === 'week' ? 4 : 7) === 0 && (
              <span className="text-[8px] text-gray-400">{date.slice(5)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
