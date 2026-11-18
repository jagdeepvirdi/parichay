import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
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
  if (contact === undefined) return <div className="page" aria-busy="true" />
  if (!contact) return <div className="page"><section className="surface empty-state"><h1 className="m-0 font-display text-xl font-bold">Contact not found</h1><p className="mt-2 text-sm text-ink-dim">This card may have been removed from your network.</p><Link className="inline-link mt-2" to="/network">Back to your network</Link></section></div>

  const groupName = contact.groupId !== null ? groups.find((group) => group.id === contact.groupId)?.name : undefined
  const pushToContacts = () => {
    const fields = ALL_FIELDS.filter((field) => Boolean(contact[field]))
    const vcard = buildVCardFile(contact, fields, contact.note)
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${contact.name || 'contact'}.vcf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const handleDelete = async () => {
    if (!contact.id) return
    await deleteContact(contact.id)
    navigate('/network')
  }
  const visibleFields = ALL_FIELDS.filter((field) => Boolean(contact[field]))

  return (
    <div className="page">
      <Link to="/network" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-dim no-underline"><ArrowLeft size={17} />Back to network</Link>
      <div className="mx-auto max-w-3xl section-stack">
        <section className="profile-hero">
          <Avatar name={contact.name} tone="warm" size="lg" />
          <div className="min-w-0 flex-1"><h1 className="m-0 truncate font-display text-2xl font-bold">{contact.name}</h1><p className="mb-0 mt-1 truncate text-sm text-white/70">{[contact.title, contact.company].filter(Boolean).join(' · ') || 'Contact'}</p></div>
        </section>
        <section className="surface surface-pad">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="surface-title">Contact details</h2>
            {groupName && <span className="rounded-full bg-[#E8F2EE] px-3 py-1.5 text-xs font-semibold text-accent">{groupName}</span>}
          </div>
          {visibleFields.map((field) => <div className="field-row" key={field}><span className="field-label">{FIELD_LABELS[field]}</span><div className="field-value">{contact[field]}</div></div>)}
          {(contact.extras ?? []).map((extra) => <div className="field-row" key={extra.id}><span className="field-label">{extra.label}</span><div className="field-value">{extra.value}</div></div>)}
          <div className="field-row"><span className="field-label">Met</span><div className="field-value">{formatMetAt(contact.metAt)}</div></div>
        </section>
        {contact.note && <section className="surface surface-pad"><h2 className="surface-title">Your note</h2><p className="mb-0 mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-dim">{contact.note}</p></section>}
        <div className="section-stack gap-2">
          <button type="button" onClick={pushToContacts} className="primary-button w-full"><Download size={18} />Export contact as .vcf</button>
          <p className="m-0 text-center text-xs leading-5 text-ink-dim">Your phone will open its own contact import flow.</p>
          {confirmingDelete ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E7C8C3] bg-[#FBF1EF] p-4"><span className="text-sm font-semibold text-[#7A352A]">Remove this contact from Parichay?</span><div className="flex gap-2"><button type="button" onClick={() => setConfirmingDelete(false)} className="secondary-button">Keep contact</button><button type="button" onClick={handleDelete} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#8D3C30] px-4 text-sm font-semibold text-white"><Trash2 size={16} />Remove</button></div></div> : <button type="button" onClick={() => setConfirmingDelete(true)} className="mx-auto mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-ink-dim hover:bg-soft"><Trash2 size={16} />Remove from Parichay</button>}
        </div>
      </div>
    </div>
  )
}
