import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  variant?: 'blue' | 'teal' | 'orange' | 'green' | 'gray'
  className?: string
}

const variants = {
  blue:   'bg-[#0475ae]/10 text-[#0475ae]',
  teal:   'bg-[#00c4cc]/10 text-[#00c4cc]',
  orange: 'bg-[#ed6835]/10 text-[#ed6835]',
  green:  'bg-[#37ca37]/10 text-[#37ca37]',
  gray:   'bg-gray-100 text-gray-600',
}

export default function Badge({ children, variant = 'blue', className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wide', variants[variant], className)}>
      {children}
    </span>
  )
}
