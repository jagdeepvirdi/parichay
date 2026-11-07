import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useContacts } from '../../hooks/useContacts'
import { useGroups } from '../../hooks/useGroups'
import { Avatar } from '../../components/Avatar'
import type { ContactRecord } from '../../db/db'

export function NetworkScreen() {
  const contacts = useContacts()
  const { groups } = useGroups()
  const [query, setQuery] = useState('')

  const groupName = useMemo(() => {
    const map = new Map<number, string>()
    for (const g of groups) if (g.id !== undefined) map.set(g.id, g.name)
    return map
  }, [groups])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) => {
      const group = c.groupId !== null ? groupName.get(c.groupId) ?? '' : ''
      return [c.name, c.company, c.title, group].some((v) => v?.toLowerCase().includes(q))
    })
  }, [contacts, query, groupName])

  const sections = useMemo(() => {
    const byGroup = new Map<string, ContactRecord[]>()
    for (const c of filtered) {
      const label = c.groupId !== null ? groupName.get(c.groupId) ?? 'Ungrouped' : 'Ungrouped'
      byGroup.set(label, [...(byGroup.get(label) ?? []), c])
    }
    const named = [...byGroup.entries()].filter(([label]) => label !== 'Ungrouped').sort((a, b) => a[0].localeCompare(b[0]))
    const ungrouped = byGroup.get('Ungrouped')
    return ungrouped ? [...named, ['Ungrouped', ungrouped] as const] : named
  }, [filtered, groupName])

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-3 px-6 pt-4 pb-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[22px] font-bold">Your network</h1>
          <span className="font-mono text-[10.5px] text-ink-dim">
            {contacts.length} card{contacts.length === 1 ? '' : 's'}
          </span>
        </div>
        <input
          className="shadow-card rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-dim"
          placeholder="Search name, company, group…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {contacts.length === 0 ? (
          <div className="pt-10 text-center text-[13.5px] text-ink-dim">
            Nothing here yet — scan someone's card to add them.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {sections.map(([label, items]) => (
              <div key={label} className="flex flex-col gap-2.5">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">
                  {label} · {items.length}
                </div>
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to={`/network/${c.id}`}
                    className="shadow-card flex items-center gap-3 rounded-xl border border-line bg-surface px-3.25 py-2.75"
                  >
                    <Avatar name={c.name} tone={c.id! % 2 === 0 ? 'warm' : 'accent'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-semibold">{c.name}</div>
                      <div className="truncate text-[12.5px] text-ink-dim">
                        {[c.title, c.company].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-ink-dim" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
