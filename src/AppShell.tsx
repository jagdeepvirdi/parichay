import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookUser, Home, QrCode, ScanLine, Settings, Users } from 'lucide-react'
import { Wordmark } from './components/Logo'
import { BottomNav } from './components/BottomNav'

const links = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/card', label: 'My card', icon: BookUser },
  { to: '/share', label: 'Share my card', icon: QrCode },
  { to: '/scan', label: 'QR scanner', icon: ScanLine },
  { to: '/network', label: 'My network', icon: Users },
]

function SideNavigation() {
  const location = useLocation()
  return (
    <aside className="desktop-nav" aria-label="Main navigation">
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive || (to === '/network' && location.pathname.startsWith('/network/')) ? ' active' : ''}`}>
            <Icon size={19} strokeWidth={1.8} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-10 border-t border-line pt-5 text-xs leading-6 text-ink-dim">
        Your card and contacts stay on this device.
      </div>
    </aside>
  )
}

export function AppShell() {
  return (
    <div className="app-frame">
      <header className="app-topbar">
        <Wordmark />
        <div className="topbar-actions">
          <span className="offline-indicator">Stored on this device</span>
          <NavLink className="icon-button" to="/settings" aria-label="Settings" title="Settings"><Settings size={19} /></NavLink>
        </div>
      </header>
      <div className="app-main">
        <SideNavigation />
        <main className="route-content"><Outlet /></main>
      </div>
      <BottomNav />
    </div>
  )
}
