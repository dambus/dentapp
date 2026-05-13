import type { HTMLAttributes } from 'react'

import { classNames } from '../../lib/classNames'

type InlineNoticeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type InlineNoticeProps = HTMLAttributes<HTMLDivElement> & {
  variant?: InlineNoticeVariant
}

const variantClasses: Record<InlineNoticeVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function InlineNotice({
  className,
  variant = 'neutral',
  ...props
}: InlineNoticeProps) {
  return (
    <div
      className={classNames(
        'rounded-md border px-3 py-2 text-sm font-medium leading-6',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
