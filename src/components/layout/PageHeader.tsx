import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  navigation?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  navigation,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        {navigation ? <div className="mb-2">{navigation}</div> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="print-hidden shrink-0">{actions}</div> : null}
    </div>
  )
}
