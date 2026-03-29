'use client'

import { useState, useMemo } from 'react'
import { ImageIcon, Film, Mic, Layers, BarChart3 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetRecord { id: string; type: string; metadata: any; createdAt: string }
interface Props { assets: AssetRecord[] }

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { label: '7d',       days: 7 },
  { label: '30d',      days: 30 },
  { label: '90d',      days: 90 },
  { label: '1y',       days: 365 },
  { label: 'All Time', days: Infinity },
]

const MODULE_CONFIG: { type: string; label: string; Icon: React.ElementType }[] = [
  { type: 'IMAGE',     label: 'Images',     Icon: ImageIcon },
  { type: 'VIDEO',     label: 'Videos',     Icon: Film },
  { type: 'VOICEOVER', label: 'Voiceover',  Icon: Mic },
  { type: 'GRAPHIC',   label: 'Graphics',   Icon: Layers },
]

function cutoffDate(days: number): Date {
  if (!isFinite(days)) return new Date(0)
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function fmtDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsClient({ assets }: Props) {
  const [rangeDays, setRangeDays] = useState(30)

  // Filter assets by selected range
  const filtered = useMemo(() => {
    const cutoff = cutoffDate(rangeDays)
    return assets.filter((a) => new Date(a.createdAt) >= cutoff)
  }, [assets, rangeDays])

  // Stat counts
  const total    = filtered.length
  const images   = filtered.filter((a) => a.type === 'IMAGE').length
  const videos   = filtered.filter((a) => a.type === 'VIDEO').length
  const audioGfx = filtered.filter((a) => a.type === 'VOICEOVER' || a.type === 'GRAPHIC').length

  // By module counts
  const moduleCounts = useMemo(() =>
    Object.fromEntries(MODULE_CONFIG.map(({ type }) => [
      type,
      filtered.filter((a) => a.type === type).length,
    ])),
  [filtered])

  // By model counts
  const modelCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of filtered) {
      const model = (a.metadata as any)?.model as string | undefined
      if (!model) continue
      map[model] = (map[model] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  // Daily activity — last 30 days always (independent of range)
  const dailyData = useMemo(() => {
    const days: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ date: fmtDay(d), count: 0 })
    }
    const cutoff = cutoffDate(30)
    for (const a of assets) {
      if (new Date(a.createdAt) < cutoff) continue
      const key = fmtDay(new Date(a.createdAt))
      const slot = days.find((d) => d.date === key)
      if (slot) slot.count++
    }
    return days
  }, [assets])

  const maxDay = Math.max(...dailyData.map((d) => d.count), 1)

  // Estimated cost
  const totalCost = useMemo(() => {
    let sum = 0
    let hasCost = false
    for (const a of filtered) {
      const cost = (a.metadata as any)?.cost as number | undefined
      if (typeof cost === 'number') { sum += cost; hasCost = true }
    }
    return hasCost ? sum : null
  }, [filtered])

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header + range pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Content creation tracking across all modules</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-card shadow-card p-1">
          {RANGE_OPTIONS.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setRangeDays(days)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                rangeDays === days
                  ? 'bg-brand-azure text-white'
                  : 'text-gray-500 hover:text-brand-navy'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total Generated" value={total}    accent="text-brand-navy" />
        <StatCard label="Images"          value={images}   accent="text-brand-azure" />
        <StatCard label="Videos"          value={videos}   accent="text-brand-light" />
        <StatCard label="Audio & Graphics" value={audioGfx} accent="text-brand-orange" />
      </div>

      {/* By Module + By Model side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* By Module */}
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Content by Module</p>
          <div className="space-y-4">
            {MODULE_CONFIG.map(({ type, label, Icon }) => {
              const count = moduleCounts[type] ?? 0
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-brand-azure/10 flex items-center justify-center shrink-0">
                      <Icon size={12} className="text-brand-azure" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
                    <span className="text-sm font-semibold text-brand-navy">{count}</span>
                    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-azure rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By Model */}
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Content by Model</p>
          {modelCounts.length === 0 ? (
            <p className="text-sm text-gray-400">No model data in this range.</p>
          ) : (
            <div className="space-y-3">
              {modelCounts.map(([model, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={model}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-700 flex-1 truncate font-medium">{model}</span>
                      <span className="text-xs bg-brand-azure/10 text-brand-azure font-semibold px-2 py-0.5 rounded-badge shrink-0">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-azure rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-card shadow-card p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-brand-azure" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Daily Activity (last 30 days)</p>
        </div>
        <div className="flex items-end gap-0.5 h-24">
          {dailyData.map(({ date, count }) => {
            const heightPct = Math.round((count / maxDay) * 100)
            const shortDate = date.slice(5) // MM-DD
            return (
              <div key={date} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-brand-azure/80 hover:bg-brand-azure rounded-t transition-colors cursor-default"
                  style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%` }}
                />
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-navy text-white text-[9px] font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {shortDate}: {count}
                </div>
              </div>
            )
          })}
        </div>
        {/* x-axis labels — every 7th day */}
        <div className="flex items-end gap-0.5 mt-1">
          {dailyData.map(({ date }, i) => (
            <div key={date} className="flex-1 text-center">
              {i % 7 === 0 && (
                <span className="text-[8px] text-gray-400">{date.slice(5)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Cost */}
      {totalCost !== null && (
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Estimated Cost</p>
          <p className="text-3xl font-bold text-brand-navy">
            ${totalCost.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Based on cost data stored in asset metadata for this period.</p>
        </div>
      )}

    </div>
  )
}
