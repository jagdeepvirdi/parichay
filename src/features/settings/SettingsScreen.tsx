import { Link } from 'react-router-dom'
import { ArrowRight, Database, LockKeyhole, WifiOff } from 'lucide-react'
import { PageHeading } from '../../components/PageHeading'

export function SettingsScreen() {
  return (
    <div className="page">
      <PageHeading title="Settings" description="Privacy and app information for this device." />
      <div className="mx-auto max-w-3xl section-stack">
        <section className="surface surface-pad">
          <h2 className="surface-title mb-1">Your privacy</h2>
          <div className="settings-row">
            <div className="flex items-start gap-3"><LockKeyhole className="mt-1 text-accent" size={19} /><div><div className="font-semibold">Your details stay here</div><p className="surface-copy mb-0 mt-1 text-sm">Parichay has no account or sync. Your profile, groups and contacts are kept in this browser.</p></div></div>
          </div>
          <div className="settings-row">
            <div className="flex items-start gap-3"><WifiOff className="mt-1 text-accent" size={19} /><div><div className="font-semibold">Works offline</div><p className="surface-copy mb-0 mt-1 text-sm">Cards are created and scanned on your device. No network connection is needed to exchange details.</p></div></div>
          </div>
          <div className="settings-row">
            <div className="flex items-start gap-3"><Database className="mt-1 text-accent" size={19} /><div><div className="font-semibold">Choose what you share</div><p className="surface-copy mb-0 mt-1 text-sm">Pick a share preset and adjust individual fields. Phone numbers also follow your card privacy setting.</p></div></div>
            <Link className="secondary-button shrink-0" to="/card">My card <ArrowRight size={16} /></Link>
          </div>
        </section>
        <section className="surface surface-pad">
          <h2 className="surface-title">About Parichay</h2>
          <p className="surface-copy mb-0 mt-2 text-sm">A simple, private way to exchange contact details face to face. No account, tracking, or service in between.</p>
          <div className="mt-4 border-t border-line pt-4 text-sm text-ink-dim">Parichay · Contact exchange</div>
        </section>
      </div>
    </div>
  )
}
