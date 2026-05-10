import { currentDemoUser } from '../lib/demoAuth'

export function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-medium text-slate-500">DentApp MVP</p>
          <p className="text-base font-semibold text-slate-950">
            App foundation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700">
            Demo role: {currentDemoUser.roleLabel}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-800">
            {currentDemoUser.authStatusLabel}
          </span>
        </div>
      </div>
    </header>
  )
}
