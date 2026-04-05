'use client'

import { useState } from 'react'
import { ImageIcon, Film, Mic, Layers, BarChart3, FileText } from 'lucide-react'
import useAnalytics, { type AssetRecord, MODULE_CONFIG } from '@/hooks/useAnalytics'
import ActivityChart from '@/components/analytics/ActivityChart'
import IntentInsights from '@/components/analytics/IntentInsights'

const RANGE_OPTIONS = [
  { label: '7d', days: 7 }, { label: '30d', days: 30 }, { label: '90d', days: 90 },
  { label: '1y', days: 365 }, { label: 'All Time', days: Infinity },
]

const BRAND_DISPLAY = [
  { id: 'lhcapital', label: 'LH Capital', bgClass: 'bg-brand-azure' },
  { id: 'simrp',     label: 'The SIMRP',  bgClass: 'bg-brand-light' },
  { id: 'personal',  label: 'Personal',   bgClass: 'bg-brand-green' },
]

const MODULE_ICONS: Record<string, React.ElementType> = {
  IMAGE: ImageIcon, VIDEO: Film, MOTION: Film, VOICEOVER: Mic,
  MUSIC: BarChart3, GRAPHIC: Layers, CAPTION: FileText,
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

export default function AnalyticsClient({ assets }: { assets: AssetRecord[] }) {
  const [rangeDays, setRangeDays] = useState(30)
  const { total, images, videos, captions, brandCounts, moduleCounts, modelCounts, dailyData, maxDay, totalCost, pillarCounts, intentInsights } =
    useAnalytics(assets, rangeDays)

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
                rangeDays === days ? 'bg-brand-azure text-white' : 'text-gray-500 hover:text-brand-navy'
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
        <StatCard label="Captions"        value={captions} accent="text-brand-orange" />
      </div>

      {/* By Module + By Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Content by Module</p>
          <div className="space-y-4">
            {MODULE_CONFIG.map(({ type, label }) => {
              const Icon  = MODULE_ICONS[type] ?? BarChart3
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
                    <div className="h-full bg-brand-azure rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

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
                      <span className="text-xs bg-brand-azure/10 text-brand-azure font-semibold px-2 py-0.5 rounded-badge shrink-0">{count}</span>
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
      </div>

      {/* Brand Breakdown */}
      {Object.keys(brandCounts).length > 0 && (
        <div className="bg-white rounded-card shadow-card p-5 mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Content by Brand</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BRAND_DISPLAY.map(({ id, label, bgClass }) => {
              const count = brandCounts[id] ?? 0
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${bgClass}`} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-brand-navy">{count}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${bgClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ActivityChart dailyData={dailyData} maxDay={maxDay} />

      {totalCost !== null && (
        <div className="bg-white rounded-card shadow-card p-5 mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Estimated Cost</p>
          <p className="text-3xl font-bold text-brand-navy">${totalCost.toFixed(4)}</p>
          <p className="text-xs text-gray-400 mt-1">Based on cost data stored in asset metadata for this period.</p>
        </div>
      )}

      {pillarCounts.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-5 mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Content by Pillar</p>
          <div className="space-y-3">
            {pillarCounts.map(([pillar, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const label = pillar === 'case-study' ? 'Case Study' : pillar.charAt(0).toUpperCase() + pillar.slice(1)
              return (
                <div key={pillar}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700 flex-1 capitalize">{label}</span>
                    <span className="text-xs bg-brand-teal/10 text-brand-teal font-semibold px-2 py-0.5 rounded-badge">{count}</span>
                    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {intentInsights && <IntentInsights data={intentInsights} />}

    </div>
  )
}
