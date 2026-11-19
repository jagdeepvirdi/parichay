import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { DashboardScreen } from './features/dashboard/DashboardScreen'
import { ProfileScreen } from './features/profile/ProfileScreen'
import { ShareScreen } from './features/share/ShareScreen'
import { NetworkScreen } from './features/network/NetworkScreen'
import { ContactDetailScreen } from './features/contact/ContactDetailScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'

const ScanScreen = lazy(() => import('./features/scan/ScanScreen').then((m) => ({ default: m.ScanScreen })))

export function App() {
  return (
    <BrowserRouter basename="/app">
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/card" element={<ProfileScreen />} />
          <Route path="/share" element={<ShareScreen />} />
          <Route path="/scan" element={<Suspense fallback={<div className="camera-surface" />}><ScanScreen /></Suspense>} />
          <Route path="/network" element={<NetworkScreen />} />
          <Route path="/network/:id" element={<ContactDetailScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
