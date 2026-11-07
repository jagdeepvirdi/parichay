import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContact, deleteContact } from '../../hooks/useContacts'
import { useGroups } from '../../hooks/useGroups'
import { Avatar } from '../../components/Avatar'
import { buildVCardFile } from '../../lib/vcard'
import { FIELD_LABELS, type FieldKey } from '../../lib/profileFields'

const ALL_FIELDS: FieldKey[] = ['title', 'company', 'workEmail', 'workPhone', 'linkedin', 'personalEmail', 'personalPhone', 'instagram', 'twitter']

function formatMetAt(timestamp: number): string {
  const date = new Date(timestamp)
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return sameDay ? `Today, ${time}` : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

export function ContactDetailScreen() {
  const { id } = useParams()
  const contact = useContact(id ? Number(id) : undefined)
  const { groups } = useGroups()
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!contact) return null

  const groupName = contact.groupId !== null ? groups.find((g) => g.id === contact.groupId)?.name : undefined

  const pushToContacts = () => {
    const fields = ALL_FIELDS.filter((f) => !!contact[f])
    const vcf = buildVCardFile(contact, fields, contact.note)
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contact.name || 'contact'}.vcf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    await deleteContact(contact.id!)
    navigate('/network')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2.5 px-6 pt-4 pb-2.5">
        <Link to="/network" aria-label="Back to your network" className="text-ink">
          ←
        </Link>
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">Contact</div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5">
            <Avatar name={contact.name} tone="warm" size="lg" />
            <div>
              <div className="text-[19px] font-bold">{contact.name}</div>
              <div className="text-[13.5px] text-ink-dim">
                {[contact.title, contact.company].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>

          {groupName && (
            <div>
              <span className="rounded-full bg-accent-warm/[0.12] px-2.75 py-1 font-mono text-[10.5px] text-accent-warm shadow-[0_1px_4px_rgba(154,106,31,0.18)]">
                {groupName}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {ALL_FIELDS.filter((f) => !!contact[f]).map((f) => (
              <div key={f} className="flex flex-col gap-0.5 border-b border-line pb-2.5">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">{FIELD_LABELS[f]}</span>
                <span className="text-[14px] font-medium">{contact[f]}</span>
              </div>
            ))}
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">Met</span>
              <span className="text-[14px] font-medium">{formatMetAt(contact.metAt)}</span>
            </div>
          </div>

          {contact.note && (
            <div className="flex flex-col gap-1.5">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">Note</div>
              <div className="shadow-card rounded-xl border border-line bg-surface px-3.5 py-3 text-[13.5px] text-ink-dim italic">
                {contact.note}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-6 pt-2 pb-5 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={pushToContacts}
          className="shadow-btn w-full rounded-xl py-3.25 text-center text-[15px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))' }}
        >
          Push to phone contacts
        </button>
        <div className="text-center text-[11.5px] text-ink-dim">Saves a vCard — your phone handles the rest.</div>
        <button
          type="button"
          onClick={handleDelete}
          onBlur={() => setConfirmingDelete(false)}
          className="rounded-xl py-2.5 text-center text-[13px] font-medium text-ink-dim"
        >
          {confirmingDelete ? 'Tap again to remove this card' : 'Remove from Parichay'}
        </button>
      </div>
    </div>
  )
}
