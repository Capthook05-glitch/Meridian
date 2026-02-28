import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-accent)]/15 text-[var(--color-accent-300)] border border-[var(--color-accent)]/25',
        secondary: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
        success: 'bg-[var(--color-success)]/15 text-emerald-400 border border-emerald-500/25',
        warning: 'bg-[var(--color-warning)]/15 text-amber-400 border border-amber-500/25',
        danger: 'bg-[var(--color-danger)]/15 text-red-400 border border-red-500/25',
        outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
