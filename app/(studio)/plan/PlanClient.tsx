'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { UploadCloud, Loader2, Sparkles, FileSpreadsheet, ArrowRight, AlertCircle, CheckCircle2, X } from 'lucide-react'
import BrandSelector from '@/components/shared/BrandSelector'
import { useDefaultBrand } from '@/components/shared/DefaultBrandProvider'
import type { BrandId } from '@/lib/brands'
import PlanResultCard, { type PlanResult } from './PlanResultCard'
import type { PlanRow } from '@/lib/plan-parse'

const ACCEPT = '.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'

export default function PlanClient() {
  const [brandId,    setBrandId]    = useState<BrandId>(useDefaultBrand())
  const [rows,       setRows]       = useState<PlanRow[] | null>(null)
  const [fileName,   setFileName]   = useState('')
  const [parsing,    setParsing]    = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results,    setResults]    = useState<PlanResult[] | null>(null)
  const [error,      setError]      = useState('')
  const [dragOver,   setDragOver]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(''); setResults(null); setRows(null); setParsing(true); setFileName(file.name)
    try {
      const body = new FormData(); body.append('file', file)
      const res  = await fetch('/api/v1/plan/parse', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.message ?? 'Could not read this plan.'); return }
      setRows(json.rows as PlanRow[])
    } catch { setError('Could not read this plan.') } finally { setParsing(false) }
  }

  async function generate() {
    if (!rows) return
    setGenerating(true); setError('')
    try {
      const res  = await fetch('/api/v1/plan/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, rows }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.message ?? 'Generation failed.'); return }
      setResults(json.results as PlanResult[])
    } catch { setError('Generation failed.') } finally { setGenerating(false) }
  }

  function reset() { setRows(null); setResults(null); setFileName(''); setError('') }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <BrandSelector value={brandId} onChange={setBrandId} />

      {/* Drop zone */}
      {!rows && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-card p-12 text-center transition-colors ${dragOver ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-300 hover:border-brand-azure'}`}
        >
          {parsing ? (
            <div className="flex flex-col items-center gap-2 text-brand-azure">
              <Loader2 size={28} className="animate-spin" /><p className="text-sm font-medium">Reading {fileName}…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-brand-azure/10 flex items-center justify-center"><UploadCloud size={26} className="text-brand-azure" /></div>
              <p className="font-semibold text-brand-navy">Drop a content plan to generate every post</p>
              <p className="text-sm text-gray-400">Excel (.xlsx) or CSV with columns like Day, Audience, Theme, Platform, Hook/Headline, Post Copy, CTA</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={13} /> {error}</p>}

      {/* Parsed preview */}
      {rows && !results && (
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-brand-navy flex items-center gap-2"><FileSpreadsheet size={15} className="text-brand-azure" />{fileName} · <span className="text-gray-400">{rows.length} posts</span></p>
            <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-lg">
            <table className="w-full text-[11px]">
              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                <tr>{['Day', 'Audience', 'Theme', 'Platform', 'Hook'].map((h) => <th key={h} className="text-left font-semibold px-2 py-1.5">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-2 py-1.5 text-gray-500">{r.day ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-700">{r.audience ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-700">{r.theme ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-500">{r.platforms ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-700 truncate max-w-[16rem]">{r.hook ?? r.copy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={generate} disabled={generating}
            className="mt-4 flex items-center gap-2 bg-brand-azure text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-60">
            {generating ? <><Loader2 size={15} className="animate-spin" />Generating {rows.length} captions…</> : <><Sparkles size={15} />Generate {rows.length} captions</>}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-card px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
              <CheckCircle2 size={13} /> Generated {results.filter((r) => r.ok).length} of {results.length} — all saved to your Library.
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={reset} className="text-xs font-semibold text-gray-500 hover:text-gray-700">New plan</button>
              <Link href="/library?type=CAPTION" className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline whitespace-nowrap">View Library <ArrowRight size={12} /></Link>
            </div>
          </div>
          {results.map((r) => <PlanResultCard key={r.idx} result={r} brandId={brandId} />)}
        </div>
      )}
    </div>
  )
}
