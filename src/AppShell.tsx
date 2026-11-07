import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'

const TAB_ROUTES = new Set(['/', '/share', '/scan', '/network'])

export function AppShell() {
  const { pathname } = useLocation()
  const showNav = TAB_ROUTES.has(pathname)

  return (
    <div className="mx-auto flex h-full max-w-105 flex-col bg-bg">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
