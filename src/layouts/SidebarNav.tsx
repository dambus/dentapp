import { NavLink } from 'react-router-dom'

import type { CurrentProfileResult } from '../features/auth/useCurrentProfile'
import { classNames } from '../lib/classNames'
import { currentDemoUser } from '../lib/demoAuth'
import { getNavigationItemsForRole } from '../routes/navigationConfig'
import { routePaths } from '../routes/routePaths'

type SidebarNavProps = {
  currentProfile: CurrentProfileResult
}

const navigationMarkers: Record<string, string> = {
  [routePaths.dashboard]: 'D',
  [routePaths.calendar]: 'C',
  [routePaths.appointments]: 'A',
  [routePaths.patients]: 'P',
  [routePaths.treatmentPlans]: 'TP',
  [routePaths.payments]: '$',
  [routePaths.commissions]: '%',
  [routePaths.inventory]: 'I',
  [routePaths.reports]: 'R',
  [routePaths.settings]: 'S',
}

function getVisibleNavigationItems(currentProfile: CurrentProfileResult) {
  const { profile } = currentProfile
  const navigationRole = profile?.role ?? currentDemoUser.role

  return getNavigationItemsForRole(navigationRole)
}

export function SidebarNav({ currentProfile }: SidebarNavProps) {
  const visibleNavigationItems = getVisibleNavigationItems(currentProfile)

  return (
    <aside className="app-shell-sidebar sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white md:block md:w-20 xl:w-72">
      <div className="flex h-full flex-col">
        <div className="flex min-h-20 items-center justify-center border-b border-slate-200 px-3 xl:justify-between xl:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-700 text-sm font-semibold text-white">
              DA
            </div>
            <div className="hidden min-w-0 xl:block">
              <div className="text-lg font-semibold tracking-tight text-slate-950">
                DentApp
              </div>
              <div className="text-sm text-slate-500">Practice workspace</div>
            </div>
          </div>
          <div className="hidden rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 xl:inline-flex">
            MVP
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 xl:px-4"
        >
          {visibleNavigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === routePaths.dashboard}
              title={item.label}
              className={({ isActive }) =>
                classNames(
                  'group flex min-h-12 items-center rounded-md text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                  'md:justify-center md:px-0 xl:justify-start xl:gap-3 xl:px-3',
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={classNames(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold',
                      isActive
                        ? 'border-teal-200 bg-white text-teal-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-slate-300',
                    )}
                  >
                    {navigationMarkers[item.path] ?? item.label.slice(0, 1)}
                  </span>
                  <span className="hidden truncate xl:inline">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export function MobileNavigationDrawer({
  currentProfile,
  isOpen,
  onClose,
}: SidebarNavProps & {
  isOpen: boolean
  onClose: () => void
}) {
  const visibleNavigationItems = getVisibleNavigationItems(currentProfile)

  if (!isOpen) {
    return null
  }

  return (
    <div className="app-shell-mobile-drawer fixed inset-0 z-50 md:hidden">
      <button
        aria-label="Close navigation menu"
        className="absolute inset-0 h-full w-full bg-slate-950/40"
        onClick={onClose}
        type="button"
      />
      <div className="relative flex h-full w-full flex-col overflow-x-hidden bg-white">
        <div className="flex min-h-20 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-700 text-sm font-semibold text-white">
              DA
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight text-slate-950">
                DentApp
              </div>
              <div className="truncate text-sm text-slate-500">
                Practice workspace
              </div>
            </div>
          </div>
          <button
            className="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <nav
          aria-label="Mobile main navigation"
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5"
        >
          {visibleNavigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === routePaths.dashboard}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex min-h-14 items-center gap-3 rounded-md border px-4 text-base font-semibold',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                  isActive
                    ? 'border-teal-200 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-white text-slate-700',
                )
              }
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                {navigationMarkers[item.path] ?? item.label.slice(0, 1)}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
