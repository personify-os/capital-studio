'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Download, PenSquare } from 'lucide-react'
import { useGenerate } from '@/hooks/useGenerate'
import AudioControls, { VOICES } from '@/components/audio/AudioControls'
import AudioRow, { type RecentAudio } from '@/components/audio/AudioRow'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'
import type { ContentPillar } from '@/components/writer/types'

import type { ScriptDuration } from '@/components/audio/types'

interface AudioAsset { id: string; url: string }
interface GenerateResponse { asset: AudioAsset }

export default function AudioClient({ recentAudio: initial }: { recentAudio: RecentAudio[] }) {
  const router = useRouter()
  const [script,          setScript]          = useState('')
  const [voiceId,         setVoiceId]         = useState(VOICES[0].id)
  const [brandId,         setBrandId]         = useState<BrandId>('lhcapital')
  const [recentAudio,     setRecentAudio]     = useState(initial)
  const [intentOpen,      setIntentOpen]      = useState(true)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedCta,     setSelectedCta]     = useState('')
  const [scriptTopic,     setScriptTopic]     = useState('')
  const [scriptDuration,  setScriptDuration]  = useState<ScriptDuration>('60')
  const [scriptLoading,   setScriptLoading]   = useState(false)
  const [scriptError,     setScriptError]     = useState<string | null>(null)
  const [scriptOpen,      setScriptOpen]      = useState(false)
  const [scriptPillar,    setScriptPillar]    = useState<ContentPillar | ''>('')

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
    endpoint:  '/api/v1/generate/audio',
    onSuccess: (res) => {
      const voice = VOICES.find((v) => v.id === voiceId)
      setRecentAudio((prev) => [
        { id: res.asset.id, s3Url: res.asset.url, metadata: { text: script.slice(0, 100), voiceName: voice?.name }, createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 12))
    },
  })

  const handleGenerate = useCallback(() => {
    if (!script.trim()) return
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const ctaLabel     = CTA_OPTIONS.find((c) => c.id === selectedCta)?.label ?? ''
    const intent       = buildIntentString(topicLabels, purposeLabel, ctaLabel)
    const fullText     = intent ? `${script.trim()}\n\n[Context: ${intent}]` : script.trim()
    generate({ text: fullText, voiceId, brandId })
  }, [script, voiceId, brandId, selectedTopics, selectedPurpose, selectedCta, generate])

  async function handleGenerateScript() {
    if (!scriptTopic.trim()) return
    setScriptLoading(true); setScriptError(null)
    try {
      const res  = await fetch('/api/v1/generate/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: scriptTopic.trim(), duration: scriptDuration, brandId, contentPillar: scriptPillar || undefined }) })
      const json = await res.json()
      if (!res.ok) { setScriptError(json.message ?? 'Script generation failed'); return }
      if (json.script) setScript(json.script)
    } catch {
      setScriptError('Script generation failed — please try again')
    } finally {
      setScriptLoading(false)
    }
  }

  return (
    <div className="flex bg-app-bg">
      <AudioControls
        brandId={brandId}               onBrandChange={setBrandId}
        script={script}                 onScript={setScript}
        voiceId={voiceId}               onVoiceId={setVoiceId}
        scriptTopic={scriptTopic}       onScriptTopic={setScriptTopic}
        scriptDuration={scriptDuration} onScriptDuration={setScriptDuration}
        scriptOpen={scriptOpen}         onScriptOpen={setScriptOpen}
        scriptLoading={scriptLoading}   scriptError={scriptError}   onGenerateScript={handleGenerateScript}
        scriptPillar={scriptPillar}     onScriptPillar={setScriptPillar}
        intentOpen={intentOpen}         onIntentOpen={setIntentOpen}
        selectedTopics={selectedTopics}
        onToggleTopic={(id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        selectedPurpose={selectedPurpose} onPurposeChange={setSelectedPurpose}
        selectedCta={selectedCta} onCtaChange={setSelectedCta}
        loading={loading} error={error} onGenerate={handleGenerate}
      />

      <div className="flex-1 p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Generating voiceover…</p>
            <p className="text-xs text-gray-400">ElevenLabs is synthesizing your audio</p>
          </div>
        )}

        {!loading && data?.asset && (
          <div className="mb-8 bg-white rounded-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
              <div className="flex items-center gap-3">
                {script.trim() && (
                  <button type="button" onClick={() => { localStorage.setItem('writerDraft', JSON.stringify({ referenceContent: script.trim() })); router.push('/writer') }}
                    className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline">
                    <PenSquare size={12} /> Write Caption
                  </button>
                )}
                <a href={data.asset.url} download className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                  <Download size={12} /> Download MP3
                </a>
              </div>
            </div>
            <audio src={data.asset.url} controls className="w-full" />
          </div>
        )}

        {!loading && !data && recentAudio.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
              <Mic size={26} className="text-brand-orange" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Your voiceovers appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">Enter a script on the left, pick a voice, and click Generate.</p>
          </div>
        )}

        {recentAudio.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Your Audio Library</p>
            <div className="space-y-3 max-w-2xl">
              {recentAudio.map((a) => <AudioRow key={a.id} audio={a} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
