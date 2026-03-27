import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary:   'bg-brand-azure hover:bg-[#035d8a] text-white disabled:opacity-60',
  secondary: 'border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white disabled:opacity-50',
  ghost:     'text-gray-600 hover:bg-gray-100 disabled:opacity-50',
  danger:    'bg-red-600 hover:bg-red-700 text-white disabled:opacity-60',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
