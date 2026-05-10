import type { ReactNode } from 'react'

import { Card, CardContent } from './Card'

type ErrorStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent>
        <h2 className="text-lg font-semibold tracking-tight text-red-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-red-800">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
