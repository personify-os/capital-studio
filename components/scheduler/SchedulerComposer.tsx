'use client'

import { PenSquare, Eye, X, Calendar, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { type SocialAccount, type ConnectModalId } from '@/components/scheduler/types'
import AccountSelector from '@/components/scheduler/AccountSelector'

interface LibraryAsset { id: string; s3Url: string }

interface Props {
  accounts:       SocialAccount[]
  selectedAccts:  string[]
  onToggleAccount:(id: string) => void
  onOpenModal:    (modal: ConnectModalId) => void
  onDisconnect:   (id: string) => Promise<void>
  caption:        string
  onCaption:      (v: string) => void
  igCaption:      string
  onIgCaption:    (v: string) => void
  hasFacebook:    boolean
  imageUrl:       string
  onImageUrl:     (v: string) => void
  libraryAssets:  LibraryAsset[]
  pickerOpen:     boolean
  onPickerOpen:   (v: boolean) => void
  scheduledFor:   string
  onScheduledFor: (v: string) => void
  scheduling:     boolean
  scheduleError:  string
  onSchedule:     () => void
  onScheduleNow:  () => void
}

export default function SchedulerComposer({
  accounts, selectedAccts, onToggleAccount, onOpenModal, onDisconnect,
  caption, onCaption, igCaption, onIgCaption, hasFacebook,
  imageUrl, onImageUrl, libraryAssets, pickerOpen, onPickerOpen,
  scheduledFor, onScheduledFor, scheduling, scheduleError,
  onSchedule, onScheduleNow,
}: Props) {
  return (
    <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
      <div className="space-y-4 pb-4">

        <AccountSelector
          accounts={accounts}
          selectedAccts={selectedAccts}
          onToggle={onToggleAccount}
          onOpenModal={onOpenModal}
          onDisconnect={onDisconnect}
        />

        {/* Post Copy */}
        <div className="bg-gray-50 rounded-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Post Copy</p>
            <a href="/writer" className="flex items-center gap-1 text-[10px] text-brand-azure hover:text-brand-navy font-semibold transition-colors">
              <PenSquare size={10} /> Content Writer
            </a>
          </div>
          <Textarea
            placeholder="Paste copy from the Content Writer, or type directly..."
            value={caption}
            onChange={(e) => onCaption(e.target.value)}
            rows={5}
            maxLength={5000}
            currentLength={caption.length}
          />
          {hasFacebook && (
            <div className="border-t border-gray-200 pt-3">
              <Textarea
                label="Instagram copy (optional — leave blank to auto-trim)"
                placeholder="Shorter Instagram version (max 2,200 chars)..."
                value={igCaption}
                onChange={(e) => onIgCaption(e.target.value)}
                rows={3}
                maxLength={2200}
                currentLength={igCaption.length}
              />
            </div>
          )}
        </div>

        {/* Media URL */}
        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Media URL <span className="normal-case font-normal text-gray-400">(image or video)</span>
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onImageUrl(e.target.value)}
              placeholder="Paste image or video URL..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
            <button type="button" onClick={() => onPickerOpen(!pickerOpen)}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-brand-azure hover:text-brand-azure transition-colors">
              <Eye size={12} /> Library
            </button>
          </div>
          {pickerOpen && libraryAssets.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 mt-2 max-h-36 overflow-y-auto">
              {libraryAssets.map((a) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.id} src={a.s3Url} alt=""
                  className={cn('w-full aspect-square object-cover rounded cursor-pointer border-2 transition-all', imageUrl === a.s3Url ? 'border-brand-azure' : 'border-transparent hover:border-brand-azure')}
                  onClick={() => { onImageUrl(a.s3Url); onPickerOpen(false) }}
                />
              ))}
            </div>
          )}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mt-2 w-full h-28 object-cover rounded-lg" onError={() => onImageUrl('')} />
          )}
        </div>

        {/* Schedule time */}
        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Scheduled Time</p>
          <input
            type="datetime-local"
            value={scheduledFor}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => onScheduledFor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
          />
        </div>

        {scheduleError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{scheduleError}</p>
          </div>
        )}

        {(!caption.trim() || selectedAccts.length === 0) && (
          <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {!caption.trim() && selectedAccts.length === 0
              ? 'Add a caption and connect an account to schedule.'
              : !caption.trim()
              ? 'Write a caption to schedule.'
              : 'Select at least one account to schedule.'}
          </p>
        )}
        <div className="flex gap-2">
          <Button className="flex-1" size="lg"
            disabled={!caption.trim() || selectedAccts.length === 0 || scheduling}
            loading={scheduling}
            onClick={onSchedule}>
            <Calendar size={14} /> Schedule
          </Button>
          <Button variant="secondary" size="lg"
            disabled={!caption.trim() || selectedAccts.length === 0 || scheduling}
            onClick={onScheduleNow}
            aria-label="Publish now"
            title="Publish immediately">
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
