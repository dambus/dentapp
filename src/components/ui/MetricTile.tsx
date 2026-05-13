import type { HTMLAttributes, ReactNode } from 'react'

import { classNames } from '../../lib/classNames'

type MetricTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  value: ReactNode
  description?: ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning'
}

const toneClasses: Record<NonNullable<MetricTileProps['tone']>, string> = {
  default: 'border-slate-200 bg-white',
  info: 'border-cyan-200 bg-cyan-50/40',
  success: 'border-emerald-200 bg-emerald-50/40',
  warning: 'border-amber-200 bg-amber-50/50',
}

export function MetricTile({
  className,
  description,
  label,
  tone = 'default',
  value,
  ...props
}: MetricTileProps) {
  return (
    <div
      className={classNames(
        'rounded-md border p-4 shadow-sm',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold leading-6 text-slate-950">
        {value}
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-5 text-slate-600">{description}</p>
      ) : null}
    </div>
  )
}
