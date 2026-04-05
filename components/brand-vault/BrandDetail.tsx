'use client'

import { useState } from 'react'
import { FileText, MessageSquare, Palette, Lock } from 'lucide-react'
import { BRAND_CONFIGS } from '@/lib/brands'
import { BrandType } from './types'

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5 mb-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}

// ─── Built-in Knowledge ───────────────────────────────────────────────────────

const BRAND_TYPE_TO_ID = { LHC: 'lhcapital', SIMRP: 'simrp', PERSONAL: 'personal' } as const

export function BuiltInKnowledge({ type }: { type: BrandType }) {
  const [kbOpen,  setKbOpen]  = useState(false)
  const [msgOpen, setMsgOpen] = useState(false)

  const staticCfg = BRAND_CONFIGS[BRAND_TYPE_TO_ID[type]]
  if (!staticCfg || (staticCfg.knowledgeBase.length === 0 && staticCfg.keyMessages.length === 0 && !staticCfg.visualStyle)) return null

  return (
    <div className="bg-white rounded-card shadow-card p-5 mb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lock size={11} className="text-gray-400" />
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Built-in Brand Intelligence</p>
        <span className="text-[9px] text-gray-400 normal-case font-normal tracking-normal">— injected into every AI prompt</span>
      </div>

      {staticCfg.knowledgeBase.length > 0 && (
        <div>
          <button type="button" onClick={() => setKbOpen((v) => !v)} className="flex items-center gap-2 w-full text-left mb-2">
            <FileText size={11} className="text-brand-azure flex-shrink-0" />
            <p className="text-xs font-medium text-brand-navy">Knowledge Base</p>
            <span className="text-[10px] text-gray-400 ml-1">{staticCfg.knowledgeBase.length} facts</span>
            <span className="ml-auto text-[10px] text-gray-400">{kbOpen ? '▲' : '▼'}</span>
          </button>
          {kbOpen && (
            <ul className="space-y-1.5 pl-4 border-l-2 border-brand-azure/20">
              {staticCfg.knowledgeBase.map((fact, i) => (
                <li key={i} className="text-[11px] text-gray-600 leading-relaxed">{fact}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {staticCfg.keyMessages.length > 0 && (
        <div>
          <button type="button" onClick={() => setMsgOpen((v) => !v)} className="flex items-center gap-2 w-full text-left mb-2">
            <MessageSquare size={11} className="text-brand-teal flex-shrink-0" />
            <p className="text-xs font-medium text-brand-navy">Core Messaging Pillars</p>
            <span className="text-[10px] text-gray-400 ml-1">{staticCfg.keyMessages.length} pillars</span>
            <span className="ml-auto text-[10px] text-gray-400">{msgOpen ? '▲' : '▼'}</span>
          </button>
          {msgOpen && (
            <ul className="space-y-1.5 pl-4 border-l-2 border-brand-teal/20">
              {staticCfg.keyMessages.map((msg, i) => (
                <li key={i} className="text-[11px] text-gray-600 leading-relaxed">&ldquo;{msg}&rdquo;</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {staticCfg.visualStyle && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette size={11} className="text-brand-orange flex-shrink-0" />
            <p className="text-xs font-medium text-brand-navy">Visual Style Guide</p>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed pl-4 border-l-2 border-brand-orange/20">{staticCfg.visualStyle}</p>
        </div>
      )}
    </div>
  )
}
