import { Outlet } from 'react-router-dom'

import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'

export function AppShell() {
  const currentProfile = useCurrentProfile()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:flex">
      <SidebarNav currentProfile={currentProfile} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar currentProfile={currentProfile} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
