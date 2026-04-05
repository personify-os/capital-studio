import { useMemo } from 'react'
import { TOPIC_TIERS, PURPOSES } from '@/lib/content-intent'

type AssetMeta = Record<string, unknown> | null

export interface AssetRecord { id: string; type: string; brandId: string | null; metadata: AssetMeta; createdAt: string }

export const MODULE_CONFIG: { type: string; label: string }[] = [
  { type: 'IMAGE',     label: 'Images'    },
  { type: 'VIDEO',     label: 'Videos'    },
  { type: 'MOTION',    label: 'Motion'    },
  { type: 'VOICEOVER', label: 'Voiceover' },
  { type: 'MUSIC',     label: 'Music'     },
  { type: 'GRAPHIC',   label: 'Graphics'  },
  { type: 'CAPTION',   label: 'Captions'  },
]

function cutoffDate(days: number): Date {
  if (!isFinite(days)) return new Date(0)
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function fmtDay(d: Date) { return d.toISOString().slice(0, 10) }

export default function useAnalytics(assets: AssetRecord[], rangeDays: number) {
  const filtered = useMemo(() => {
    const cutoff = cutoffDate(rangeDays)
    return assets.filter((a) => new Date(a.createdAt) >= cutoff)
  }, [assets, rangeDays])

  const total    = filtered.length
  const images   = filtered.filter((a) => a.type === 'IMAGE').length
  const videos   = filtered.filter((a) => a.type === 'VIDEO').length
  const captions = filtered.filter((a) => a.type === 'CAPTION').length

  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of filtered) {
      const id = a.brandId ?? a.metadata?.brandId as string | undefined
      if (!id) continue
      map[id] = (map[id] ?? 0) + 1
    }
    return map
  }, [filtered])

  const moduleCounts = useMemo(() =>
    Object.fromEntries(MODULE_CONFIG.map(({ type }) => [
      type,
      filtered.filter((a) => a.type === type).length,
    ])),
  [filtered])

  const modelCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of filtered) {
      const model = a.metadata?.model as string | undefined
      if (!model) continue
      map[model] = (map[model] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  const dailyData = useMemo(() => {
    // For "All time", use the actual span from oldest asset to today (min 7 days)
    const oldestMs   = filtered.length > 0 ? Math.min(...filtered.map((a) => new Date(a.createdAt).getTime())) : Date.now()
    const spanDays   = Math.ceil((Date.now() - oldestMs) / 86_400_000)
    const windowDays = isFinite(rangeDays) ? rangeDays : Math.max(spanDays, 7)
    const days: { date: string; count: number }[] = []
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ date: fmtDay(d), count: 0 })
    }
    const cutoff = cutoffDate(rangeDays)
    for (const a of filtered) {
      if (new Date(a.createdAt) < cutoff) continue
      const key  = fmtDay(new Date(a.createdAt))
      const slot = days.find((d) => d.date === key)
      if (slot) slot.count++
    }
    return days
  }, [filtered, rangeDays])

  const maxDay = Math.max(...dailyData.map((d) => d.count), 1)

  const totalCost = useMemo(() => {
    let sum = 0, hasCost = false
    for (const a of filtered) {
      const cost = a.metadata?.cost as number | undefined
      if (typeof cost === 'number') { sum += cost; hasCost = true }
    }
    return hasCost ? sum : null
  }, [filtered])

  const pillarCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of filtered) {
      const pillar = a.metadata?.contentPillar as string | undefined
      if (!pillar) continue
      map[pillar] = (map[pillar] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  const intentInsights = useMemo(() => {
    const caps = filtered.filter((a) => a.type === 'CAPTION')
    if (caps.length === 0) return null
    const tier1Map: Record<string, number> = {}
    const purposeMap: Record<string, number> = {}
    let ctaCount = 0
    for (const a of caps) {
      const intent = a.metadata?.intent as Record<string, unknown> | undefined
      if (!intent) continue
      const t1  = intent.tier1Id   as string | undefined
      const pid = intent.purposeId as string | undefined
      if (t1)  tier1Map[t1]   = (tier1Map[t1]   ?? 0) + 1
      if (pid) purposeMap[pid] = (purposeMap[pid] ?? 0) + 1
      if (intent.ctaId || intent.hasCustomCta) ctaCount++
    }
    const topTopics = Object.entries(tier1Map).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([id, count]) => {
        const cat = TOPIC_TIERS.find((t) => t.id === id)
        return { id, label: cat ? `${cat.icon} ${cat.label}` : id, count }
      })
    const topPurposes = Object.entries(purposeMap).sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: PURPOSES.find((p) => p.id === id)?.label ?? id, count }))
    const ctaPct = caps.length > 0 ? Math.round((ctaCount / caps.length) * 100) : 0
    return { total: caps.length, topTopics, topPurposes, ctaCount, ctaPct }
  }, [filtered])

  return { filtered, total, images, videos, captions, brandCounts, moduleCounts, modelCounts, dailyData, maxDay, totalCost, pillarCounts, intentInsights }
}
