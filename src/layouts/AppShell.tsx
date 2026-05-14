import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { MobileNavigationDrawer, SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'

export function AppShell() {
  const currentProfile = useCurrentProfile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950 md:flex">
      <SidebarNav currentProfile={currentProfile} />
      <MobileNavigationDrawer
        currentProfile={currentProfile}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <TopBar
          currentProfile={currentProfile}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
