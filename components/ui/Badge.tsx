import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  variant?: 'blue' | 'teal' | 'orange' | 'green' | 'gray'
  className?: string
}

const variants = {
  blue:   'bg-brand-azure/10 text-brand-azure',
  teal:   'bg-brand-teal/10 text-brand-teal',
  orange: 'bg-brand-orange/10 text-brand-orange',
  green:  'bg-brand-green/10 text-brand-green',
  gray:   'bg-gray-100 text-gray-600',
}

export default function Badge({ children, variant = 'blue', className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wide', variants[variant], className)}>
      {children}
    </span>
  )
}
