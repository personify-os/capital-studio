import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:         string
  maxLength?:     number
  currentLength?: number
}

export default function Textarea({ label, maxLength, currentLength, className, ...props }: Props) {
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
          {maxLength !== undefined && currentLength !== undefined && (
            <span className="text-[10px] text-gray-400">{currentLength}/{maxLength}</span>
          )}
        </div>
      )}
      <textarea
        maxLength={maxLength}
        className={cn(
          'w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm resize-none',
          'focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent',
          'placeholder:text-gray-400 transition',
          className,
        )}
        {...props}
      />
    </div>
  )
}
