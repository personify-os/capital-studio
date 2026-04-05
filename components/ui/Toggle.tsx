'use client'

import { cn } from '@/lib/utils'

export default function Toggle({
  checked,
  onChange,
  color = 'bg-brand-azure',
}: {
  checked:  boolean
  onChange: (v: boolean) => void
  color?:   string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 w-9 h-5 rounded-full transition-colors',
        checked ? color : 'bg-gray-300',
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-[left] duration-200',
        checked ? 'left-4' : 'left-0.5',
      )} />
    </button>
  )
}
