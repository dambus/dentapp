import type { HTMLAttributes } from 'react'

import { classNames } from '../../lib/classNames'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-800',
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
