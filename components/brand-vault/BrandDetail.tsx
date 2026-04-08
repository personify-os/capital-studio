'use client'

import { useState } from 'react'
import { FileText, MessageSquare, Palette, Pencil, X, Plus, Trash2 } from 'lucide-react'
import { BRAND_CONFIGS } from '@/lib/brands'
import type { BrandType } from './types'

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5 mb-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}

// ─── Intelligence Edit Modal ──────────────────────────────────────────────────

interface IntelligenceModalProps {
  type:       BrandType
  brandId:    string
  initial:    { knowledgeBase: string[]; keyMessages: string[]; visualStyle: string }
  onClose:    () => void
  onSaved:    (patch: { knowledgeBase: string[]; keyMessages: string[]; visualStyle: string }) => void
}

export function IntelligenceModal({ type, brandId, initial, onClose, onSaved }: IntelligenceModalProps) {
  const [kb,          setKb]          = useState(initial.knowledgeBase.join('\n'))
  const [messages,    setMessages]    = useState(initial.keyMessages.join('\n'))
  const [visualStyle, setVisualStyle] = useState(initial.visualStyle)
  const [saving,      setSaving]      = useState(false)
  const [err,         setErr]         = useState('')

  const textareaCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure font-mono leading-relaxed'

  async function handleSave() {
    setSaving(true); setErr('')
    const knowledgeBase = kb.split('\n').map((s) => s.trim()).filter(Boolean)
    const keyMessages   = messages.split('\n').map((s) => s.trim()).filter(Boolean)
    try {
      const res  = await fetch(`/api/v1/brands/${brandId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ knowledgeBase, keyMessages, visualStyle }),
      })
      if (!res.ok) { setErr('Save failed. Please try again.'); return }
      onSaved({ knowledgeBase, keyMessages, visualStyle })
      onClose()
    } catch {
      setErr('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-card shadow-card-hover overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-brand-navy text-sm">Edit Brand Intelligence</p>
            <p className="text-[10px] text-gray-400">Changes are injected into every AI prompt for this brand</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={11} className="text-brand-azure" />
              <p className="text-xs font-semibold text-brand-navy">Knowledge Base</p>
              <span className="text-[10px] text-gray-400">— one fact per line</span>
            </div>
            <textarea value={kb} onChange={(e) => setKb(e.target.value)} rows={10} className={textareaCls}
              placeholder="LH Capital is a financial services consulting firm...&#10;The SIMRP saves employers ~$550 per employee per year...&#10;..." />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={11} className="text-brand-teal" />
              <p className="text-xs font-semibold text-brand-navy">Core Messaging Pillars</p>
              <span className="text-[10px] text-gray-400">— one message per line</span>
            </div>
            <textarea value={messages} onChange={(e) => setMessages(e.target.value)} rows={6} className={textareaCls}
              placeholder="Building Legacies. Protecting Futures.&#10;Redirect existing payroll dollars into powerful benefits..." />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette size={11} className="text-brand-orange" />
              <p className="text-xs font-semibold text-brand-navy">Visual Style Guide</p>
            </div>
            <textarea value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} rows={4} className={textareaCls}
              placeholder="Clean, modern corporate aesthetic. Dark navy and azure blue as the foundation..." />
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="button" disabled={saving} onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold bg-brand-azure hover:bg-brand-navy text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Intelligence'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Built-in Knowledge (display mode) ───────────────────────────────────────

const BRAND_TYPE_TO_ID = { LHC: 'lhcapital', SIMRP: 'simrp', PERSONAL: 'personal' } as const

interface BuiltInProps {
  type:          BrandType
  brandId:       string
  configOverrides?: { knowledgeBase?: string[]; keyMessages?: string[]; visualStyle?: string }
  onSaved:       (patch: { knowledgeBase: string[]; keyMessages: string[]; visualStyle: string }) => void
}

export function BuiltInKnowledge({ type, brandId, configOverrides, onSaved }: BuiltInProps) {
  const [kbOpen,     setKbOpen]     = useState(false)
  const [msgOpen,    setMsgOpen]    = useState(false)
  const [editing,    setEditing]    = useState(false)

  const staticCfg = BRAND_CONFIGS[BRAND_TYPE_TO_ID[type]]

  // Use DB overrides if present, otherwise fall back to static config
  const knowledgeBase = (configOverrides?.knowledgeBase?.length ? configOverrides.knowledgeBase : null) ?? staticCfg?.knowledgeBase ?? []
  const keyMessages   = (configOverrides?.keyMessages?.length   ? configOverrides.keyMessages   : null) ?? staticCfg?.keyMessages   ?? []
  const visualStyle   = configOverrides?.visualStyle ?? staticCfg?.visualStyle ?? ''

  if (knowledgeBase.length === 0 && keyMessages.length === 0 && !visualStyle) return null

  return (
    <>
      {editing && (
        <IntelligenceModal
          type={type} brandId={brandId}
          initial={{ knowledgeBase, keyMessages, visualStyle }}
          onClose={() => setEditing(false)}
          onSaved={(patch) => { onSaved(patch); setEditing(false) }}
        />
      )}
      <div className="bg-white rounded-card shadow-card p-5 mb-4 space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest flex-1">Brand Intelligence</p>
          <span className="text-[9px] text-gray-400">— injected into every AI prompt</span>
          <button type="button" onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[10px] text-brand-azure hover:underline">
            <Pencil size={9} /> Edit
          </button>
        </div>

        {knowledgeBase.length > 0 && (
          <div>
            <button type="button" onClick={() => setKbOpen((v) => !v)} className="flex items-center gap-2 w-full text-left mb-2">
              <FileText size={11} className="text-brand-azure flex-shrink-0" />
              <p className="text-xs font-medium text-brand-navy">Knowledge Base</p>
              <span className="text-[10px] text-gray-400 ml-1">{knowledgeBase.length} facts</span>
              <span className="ml-auto text-[10px] text-gray-400">{kbOpen ? '▲' : '▼'}</span>
            </button>
            {kbOpen && (
              <ul className="space-y-1.5 pl-4 border-l-2 border-brand-azure/20">
                {knowledgeBase.map((fact, i) => (
                  <li key={i} className="text-[11px] text-gray-600 leading-relaxed">{fact}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {keyMessages.length > 0 && (
          <div>
            <button type="button" onClick={() => setMsgOpen((v) => !v)} className="flex items-center gap-2 w-full text-left mb-2">
              <MessageSquare size={11} className="text-brand-teal flex-shrink-0" />
              <p className="text-xs font-medium text-brand-navy">Core Messaging Pillars</p>
              <span className="text-[10px] text-gray-400 ml-1">{keyMessages.length} pillars</span>
              <span className="ml-auto text-[10px] text-gray-400">{msgOpen ? '▲' : '▼'}</span>
            </button>
            {msgOpen && (
              <ul className="space-y-1.5 pl-4 border-l-2 border-brand-teal/20">
                {keyMessages.map((msg, i) => (
                  <li key={i} className="text-[11px] text-gray-600 leading-relaxed">&ldquo;{msg}&rdquo;</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {visualStyle && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette size={11} className="text-brand-orange flex-shrink-0" />
              <p className="text-xs font-medium text-brand-navy">Visual Style Guide</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed pl-4 border-l-2 border-brand-orange/20">{visualStyle}</p>
          </div>
        )}
      </div>
    </>
  )
}
