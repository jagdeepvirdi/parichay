import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useContacts } from '../../hooks/useContacts'
import { useGroups } from '../../hooks/useGroups'
import { Avatar } from '../../components/Avatar'
import { PageHeading } from '../../components/PageHeading'
import type { ContactRecord } from '../../db/db'

export function NetworkScreen() {
  const contacts = useContacts()
  const { groups } = useGroups()
  const [query, setQuery] = useState('')
  const groupName = useMemo(() => new Map(groups.flatMap((group) => group.id === undefined ? [] : [[group.id, group.name] as const])), [groups])
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return contacts
    return contacts.filter((contact) => {
      const group = contact.groupId !== null ? groupName.get(contact.groupId) ?? '' : ''
      return [contact.name, contact.company, contact.title, group].some((value) => value?.toLowerCase().includes(term))
    })
  }, [contacts, query, groupName])
  const sections = useMemo(() => {
    const byGroup = new Map<string, ContactRecord[]>()
    for (const contact of filtered) {
      const label = contact.groupId !== null ? groupName.get(contact.groupId) ?? 'Ungrouped' : 'Ungrouped'
      byGroup.set(label, [...(byGroup.get(label) ?? []), contact])
    }
    const named = [...byGroup.entries()].filter(([label]) => label !== 'Ungrouped').sort(([a], [b]) => a.localeCompare(b))
    const ungrouped = byGroup.get('Ungrouped')
    return ungrouped ? [...named, ['Ungrouped', ungrouped] as const] : named
  }, [filtered, groupName])

  return (
    <div className="page">
      <PageHeading title="My network" description="People you’ve met, kept close and organized into groups." action={<span className="shrink-0 rounded-full bg-[#E8F2EE] px-3 py-2 text-sm font-semibold text-accent">{contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}</span>} />
      <label className="network-search mb-7 block">
        <Search size={18} aria-hidden="true" />
        <input className="text-input" aria-label="Search your network" placeholder="Search name, company or group" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>

      {contacts.length === 0 ? (
        <section className="surface empty-state">
          <Users className="mb-3 text-accent" size={28} strokeWidth={1.7} />
          <h2 className="m-0 font-display text-lg font-bold">Your network is ready to grow</h2>
          <p className="mb-0 mt-2 max-w-sm text-sm leading-6 text-ink-dim">Scan a Parichay QR card and choose a group to keep each new introduction close at hand.</p>
          <Link className="primary-button mt-5" to="/scan">Open scanner</Link>
        </section>
      ) : filtered.length === 0 ? (
        <section className="surface empty-state"><Search className="mb-3 text-ink-dim" size={26} /><h2 className="m-0 font-display text-lg font-bold">No matches found</h2><p className="mb-0 mt-2 text-sm text-ink-dim">Try another name, company or group.</p></section>
      ) : (
        <div className="max-w-3xl">
          {sections.map(([label, items]) => <section key={label} className="mb-8">
            <h2 className="network-group">{label} <span className="ml-1 font-normal normal-case tracking-normal text-ink-dim">{items.length}</span></h2>
            <div className="surface px-4">
              {items.map((contact) => <Link key={contact.id} to={`/network/${contact.id}`} className="contact-row">
                <Avatar name={contact.name} tone={contact.id! % 2 === 0 ? 'warm' : 'accent'} size="sm" />
                <div className="min-w-0 flex-1"><div className="contact-name truncate">{contact.name}</div><div className="contact-subtitle truncate">{[contact.title, contact.company].filter(Boolean).join(' · ') || 'Contact'}</div></div>
                <span className="hidden text-xs text-ink-dim sm:block">{new Date(contact.metAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </Link>)}
            </div>
          </section>)}
        </div>
      )}
    </div>
  )
}
