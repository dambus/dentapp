import type { ReactNode } from 'react'

import { Card, CardContent } from './Card'

type ErrorStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <Card className="border-rose-200 bg-rose-50/70 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-rose-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-rose-900">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
