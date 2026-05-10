import { Outlet } from 'react-router-dom'

import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:flex">
      <SidebarNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
