import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useContacts } from '../../hooks/useContacts'
import { useGroups } from '../../hooks/useGroups'
import { Avatar } from '../../components/Avatar'
import { PageHeading } from '../../components/PageHeading'

export function DashboardScreen() {
  const { profile, loading } = useProfile()
  const contacts = useContacts()
  const { groups } = useGroups()
  const recent = contacts.slice(0, 4)
  const name = profile.name.trim().split(/\s+/)[0]
  const profileReady = Boolean(profile.name && (profile.title || profile.company || profile.workEmail || profile.personalEmail))

  return (
    <div className="page">
      <PageHeading title={name ? `Good to see you, ${name}.` : 'Your introductions, thoughtfully kept.'} description="A clear view of your card and the people you’ve met." />
      <div className="dashboard-grid">
        <div className="section-stack">
          <section className="profile-hero">
            <Avatar name={profile.name || 'You'} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold">{profile.name || 'Your name'}</div>
              <div className="mt-1 truncate text-sm text-white/70">{[profile.title, profile.company].filter(Boolean).join(' · ') || 'Your professional introduction'}</div>
            </div>
            <Link to="/card" aria-label="Edit my card" className="icon-button"><ArrowRight size={19} /></Link>
          </section>

          <section className="surface surface-pad">
            <p className="eyebrow">Your local network</p>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="font-display text-3xl font-bold tracking-tight">{contacts.length}</div><div className="mt-1 text-sm text-ink-dim">{contacts.length === 1 ? 'contact' : 'contacts'}</div></div>
              <div><div className="font-display text-3xl font-bold tracking-tight">{groups.length}</div><div className="mt-1 text-sm text-ink-dim">{groups.length === 1 ? 'group' : 'groups'}</div></div>
            </div>
          </section>

          {!loading && !profileReady && (
            <section className="surface surface-pad">
              <h2 className="surface-title">Make your card yours</h2>
              <p className="surface-copy mb-4 mt-2 text-sm">Add a few details, then choose exactly what to share each time.</p>
              <Link className="primary-button" to="/card">Complete your card <ArrowRight size={17} /></Link>
            </section>
          )}

          <section className="surface surface-pad">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="surface-title">Recently met</h2>
              <Link className="inline-link text-sm" to="/network">View network <ArrowRight className="ml-1 inline" size={15} /></Link>
            </div>
            {recent.length ? recent.map((contact) => (
              <Link className="contact-row" key={contact.id} to={`/network/${contact.id}`}>
                <Avatar name={contact.name} tone="accent" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="contact-name truncate">{contact.name}</div>
                  <div className="contact-subtitle truncate">{[contact.title, contact.company].filter(Boolean).join(' · ') || 'Contact'}</div>
                </div>
                <span className="text-xs text-ink-dim">{(contact.groupId !== null && groups.find((group) => group.id === contact.groupId)?.name) || 'Ungrouped'}</span>
              </Link>
            )) : (
              <div className="empty-state min-h-[170px]">
                <div className="mb-2 text-base font-semibold">Your network starts here</div>
                <p className="m-0 max-w-sm text-sm leading-6 text-ink-dim">Scan someone’s Parichay QR card and keep their details on this device.</p>
                <Link className="inline-link mt-4" to="/scan">Scan a card <ArrowRight className="ml-1 inline" size={15} /></Link>
              </div>
            )}
          </section>
        </div>

        <div className="section-stack">
          <p className="m-0 px-1 text-xs leading-5 text-ink-dim">Private by design. Your profile and contacts are stored in this browser and stay available offline.</p>
        </div>
      </div>
    </div>
  )
}
