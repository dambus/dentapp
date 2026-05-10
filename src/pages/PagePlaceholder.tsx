type PagePlaceholderProps = {
  title: string
  description: string
  eyebrow?: string
  status?: string
}

export function PagePlaceholder({
  title,
  description,
  eyebrow = 'Phase 1 placeholder',
  status = 'Routing is configured. This screen is intentionally minimal.',
}: PagePlaceholderProps) {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800">
          {eyebrow}
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            {description}
          </p>
        </div>

        <div className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {status}
        </div>
      </section>
    </main>
  )
}
