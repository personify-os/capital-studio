import { FileText } from 'lucide-react'

interface InsightData {
  total:       number
  topTopics:   { id: string; label: string; count: number }[]
  topPurposes: { id: string; label: string; count: number }[]
  ctaCount:    number
  ctaPct:      number
}

export default function IntentInsights({ data }: { data: InsightData }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <FileText size={14} className="text-brand-azure" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Caption Intent Insights</p>
        <span className="text-[10px] bg-brand-azure/10 text-brand-azure font-semibold px-2 py-0.5 rounded-badge">
          {data.total} captions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Topics */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Top Topics</p>
          {data.topTopics.length === 0 ? (
            <p className="text-sm text-gray-400">No topic data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topTopics.map(({ id, label, count }) => {
                const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 font-medium truncate flex-1">{label}</span>
                      <span className="text-xs font-semibold text-brand-navy ml-2">{count}</span>
                      <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-azure rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Purposes */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Top Purposes</p>
          {data.topPurposes.length === 0 ? (
            <p className="text-sm text-gray-400">No purpose data yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.topPurposes.map(({ id, label, count }) => (
                <div key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-navy/5 border border-brand-navy/10">
                  <span className="text-xs font-medium text-brand-navy">{label}</span>
                  <span className="text-[10px] text-brand-navy/60 font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Usage */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">CTA Usage</p>
          <div className="flex flex-col items-start gap-2">
            <p className="text-3xl font-bold text-brand-orange">{data.ctaPct}%</p>
            <p className="text-xs text-gray-500">of captions included a call to action</p>
            <p className="text-[10px] text-gray-400">{data.ctaCount} of {data.total} generated</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${data.ctaPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
