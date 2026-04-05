import { Download, Copy, Check, Calendar, PenSquare } from 'lucide-react'

interface Props {
  id:             string
  url:            string
  copied:         string | null
  onCopy:         (id: string, url: string) => void
  onSchedule?:    (url: string) => void
  onWriteCaption?:(url: string) => void
}

export default function ImageCard({ id, url, copied, onCopy, onSchedule, onWriteCaption }: Props) {
  return (
    <div className="relative group rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Generated" className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
        <button type="button" onClick={() => window.open(url, '_blank', 'noopener')}
          className="flex items-center gap-1.5 bg-white text-brand-navy text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors w-full justify-center">
          <Download size={12} /> Download
        </button>
        <button type="button" onClick={() => onCopy(id, url)}
          className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-white/30 transition-colors w-full justify-center">
          {copied === id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy URL</>}
        </button>
        {onWriteCaption && (
          <button type="button" onClick={() => onWriteCaption(url)}
            className="flex items-center gap-1.5 bg-brand-teal/80 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-teal transition-colors w-full justify-center">
            <PenSquare size={12} /> Write Caption
          </button>
        )}
        {onSchedule && (
          <button type="button" onClick={() => onSchedule(url)}
            className="flex items-center gap-1.5 bg-brand-azure/80 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-azure transition-colors w-full justify-center">
            <Calendar size={12} /> Schedule
          </button>
        )}
      </div>
    </div>
  )
}
