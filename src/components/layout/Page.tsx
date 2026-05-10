import type { ReactNode } from 'react'

type PageProps = {
  children: ReactNode
}

export function Page({ children }: PageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {children}
    </div>
  )
}
