import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ProfileScreen } from './features/profile/ProfileScreen'
import { ShareScreen } from './features/share/ShareScreen'
import { NetworkScreen } from './features/network/NetworkScreen'
import { ContactDetailScreen } from './features/contact/ContactDetailScreen'

// jsQR + the camera loop are meaningful weight that only the Scan tab
// needs, so it is the one screen loaded on demand rather than up front.
const ScanScreen = lazy(() => import('./features/scan/ScanScreen').then((m) => ({ default: m.ScanScreen })))

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<ProfileScreen />} />
          <Route path="/share" element={<ShareScreen />} />
          <Route
            path="/scan"
            element={
              <Suspense fallback={<div className="h-full bg-[#1b2420]" />}>
                <ScanScreen />
              </Suspense>
            }
          />
          <Route path="/network" element={<NetworkScreen />} />
          <Route path="/network/:id" element={<ContactDetailScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
