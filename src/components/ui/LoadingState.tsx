type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 p-5 text-sm font-medium leading-6 text-slate-600 shadow-sm">
      {label}
    </div>
  )
}
