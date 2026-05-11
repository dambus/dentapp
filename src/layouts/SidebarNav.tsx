import { NavLink } from 'react-router-dom'

import type { CurrentProfileResult } from '../features/auth/useCurrentProfile'
import { currentDemoUser } from '../lib/demoAuth'
import { getNavigationItemsForRole } from '../routes/navigationConfig'
import { routePaths } from '../routes/routePaths'

type SidebarNavProps = {
  currentProfile: CurrentProfileResult
}

export function SidebarNav({ currentProfile }: SidebarNavProps) {
  const { profile } = currentProfile
  const navigationRole = profile?.role ?? currentDemoUser.role
  const visibleNavigationItems = getNavigationItemsForRole(navigationRole)

  return (
    <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:block lg:px-5 lg:py-6">
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-950">
            DentApp
          </div>
          <div className="text-sm text-slate-500">Practice workspace</div>
        </div>
        <div className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 lg:mt-5 lg:inline-flex">
          Phase 1
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:flex-col lg:overflow-visible lg:px-4"
      >
        {visibleNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === routePaths.dashboard}
            className={({ isActive }) =>
              [
                'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                isActive
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
