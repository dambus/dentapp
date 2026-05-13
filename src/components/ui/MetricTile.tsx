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
  info: 'border-cyan-200 bg-white',
  success: 'border-emerald-200 bg-white',
  warning: 'border-amber-200 bg-white',
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
        'rounded-md border p-4',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-slate-950">
        {value}
      </div>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
    </div>
  )
}
