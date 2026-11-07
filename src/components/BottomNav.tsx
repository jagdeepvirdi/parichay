import { NavLink } from 'react-router-dom'
import { User, QrCode, ScanLine, Users } from 'lucide-react'

const TABS = [
  { to: '/', label: 'Profile', icon: User },
  { to: '/share', label: 'Share', icon: QrCode },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/network', label: 'Network', icon: Users },
]

export function BottomNav() {
  return (
    <nav
      className="flex shrink-0 border-t border-line bg-surface"
      style={{
        boxShadow: '0 -6px 20px -14px rgba(22,35,31,0.25)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 pb-3 font-mono text-[10px] tracking-wide m-1.5 rounded-2xl transition-colors ${
              isActive ? 'bg-accent/[0.09] text-accent' : 'text-ink-dim'
            }`
          }
        >
          <Icon size={20} strokeWidth={1.7} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
