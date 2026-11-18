import { NavLink, useLocation } from 'react-router-dom'
import { BookUser, Home, QrCode, ScanLine, Users } from 'lucide-react'

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/card', label: 'My card', icon: BookUser },
  { to: '/share', label: 'Share', icon: QrCode },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/network', label: 'Network', icon: Users },
]

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      {TABS.map(({ to, label, icon: Icon, end }) => {
        const active = (to === '/network' && pathname.startsWith('/network')) || pathname === to
        return (
          <NavLink key={to} to={to} end={end} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
            <Icon strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
