import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Plus } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import type { ProfileRecord } from '../../db/db'
import { Avatar } from '../../components/Avatar'
import { PageHeading } from '../../components/PageHeading'
import { newExtra, newSection, PERSONAL_SCOPE, WORK_SCOPE, type ExtraField, type ExtraKind, type ExtraScope, type FieldKey, type SocialPlatform } from '../../lib/profileFields'
import { resizePhoto } from './resizePhoto'
import { FieldInput } from './FieldInput'
import { ExtraFieldInput } from './ExtraFieldInput'
import { AddFieldMenu } from './AddFieldMenu'
import { AddSection } from './AddSection'
import { SectionCard } from './SectionCard'

let pendingDraft: ProfileRecord | null = null
const readPendingDraft = () => pendingDraft
const writePendingDraft = (next: ProfileRecord | null) => { pendingDraft = next }

export function ProfileScreen() {
  const { profile, loading, save } = useProfile()
  const [draft, setDraftState] = useState<ProfileRecord | null>(readPendingDraft)
  const [justSaved, setJustSaved] = useState(false)
  const [activeTabId, setActiveTabId] = useState<string>(WORK_SCOPE)
  const [addingSection, setAddingSection] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)
  const savedTimer = useRef<number | undefined>(undefined)
  const setDraft = (next: ProfileRecord | null) => { writePendingDraft(next); setDraftState(next) }
  const shown = draft ?? profile
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(profile)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  useEffect(() => () => window.clearTimeout(savedTimer.current), [])
  if (loading) return <div className="page" aria-busy="true" />

  const update = (fields: Partial<ProfileRecord>) => setDraft({ ...shown, ...fields })
  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      update({ photo: await resizePhoto(file) })
      setPhotoError(false)
    } catch {
      setPhotoError(true)
    }
  }
  const setField = (key: FieldKey) => (value: string) => update({ [key]: value })
  const extras = shown.extras ?? []
  const updateExtra = (next: ExtraField) => update({ extras: extras.map((item) => item.id === next.id ? next : item) })
  const removeExtra = (id: string) => update({ extras: extras.filter((item) => item.id !== id) })
  const addExtra = (scope: ExtraScope) => (kind: ExtraKind, platform?: SocialPlatform) => update({ extras: [...extras, newExtra(kind, scope, undefined, '', platform)] })
  const sections = shown.sections ?? []
  const tabs = [
    { id: WORK_SCOPE as string, label: 'Professional' },
    { id: PERSONAL_SCOPE as string, label: 'Personal' },
    ...sections.map((section) => ({ id: section.id, label: section.name.trim() || 'Untitled' })),
  ]
  // A removed section leaves activeTab dangling, so fall back to the first tab.
  const activeTab = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : WORK_SCOPE
  const setActiveTab = setActiveTabId
  const addSection = (name: string) => {
    const section = newSection(name)
    update({ sections: [...sections, section] })
    setActiveTabId(section.id)
    setAddingSection(false)
  }
  const renameSection = (id: string, name: string) => update({ sections: sections.map((item) => item.id === id ? { ...item, name } : item) })
  // Removing a section also removes its fields, so they can't leak into another preset.
  const removeSection = (id: string) => update({ sections: sections.filter((item) => item.id !== id), extras: extras.filter((item) => item.scope !== id) })
  const renderExtras = (scope: ExtraScope) => extras.filter((item) => item.scope === scope).map((item) => (
    <ExtraFieldInput key={item.id} extra={item} onChange={updateExtra} onRemove={() => removeExtra(item.id)} />
  ))

  const handleSave = async () => {
    if (!draft) return
    await save({
      ...draft,
      extras: (draft.extras ?? []).filter((item) => item.value.trim()),
      // A section with no name can't be picked as a preset, so drop it (and its fields).
      sections: (draft.sections ?? []).filter((item) => item.name.trim()),
    })
    setDraft(null)
    setJustSaved(true)
    window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 2500)
  }

  return (
    <div className="page">
      <PageHeading title="My card" description="Keep your details current. Choose what to share whenever you meet someone." />
      <div className="section-stack">
        <section className="profile-hero">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <button type="button" onClick={() => photoInput.current?.click()} aria-label={shown.photo ? 'Change your photo' : 'Add your photo'} className="rounded-full border-0 bg-transparent p-0">
              <Avatar name={shown.name || 'You'} size="lg" photo={shown.photo} />
            </button>
            <input ref={photoInput} type="file" accept="image/*" hidden aria-label="Choose a photo" onChange={handlePhoto} />
            {shown.photo
              ? <button type="button" onClick={() => update({ photo: undefined })} className="border-0 bg-transparent p-0 text-xs text-white/70 underline">Remove</button>
              : <button type="button" onClick={() => photoInput.current?.click()} className="border-0 bg-transparent p-0 text-xs text-white/70 underline">Add photo</button>}
          </div>
          <div className="min-w-0 flex-1">
            <input aria-label="Your name" className="block w-full border-0 bg-transparent text-xl font-semibold outline-none placeholder:text-white/55" value={shown.name} placeholder="Your name" onChange={(event) => update({ name: event.target.value })} />
            <input aria-label="Your title" className="mt-1 block w-full border-0 bg-transparent text-sm outline-none placeholder:text-white/60" value={shown.title ?? ''} placeholder="Your title" onChange={(event) => update({ title: event.target.value })} />
          </div>
        </section>
        <p className="surface-copy -mt-2 mb-0 text-sm" role={photoError ? 'alert' : undefined}>{photoError ? 'Could not use that image. Try a different photo.' : 'Your photo stays on this device. It is never included in the QR code.'}</p>

        <div className="preset-bar !mb-0" role="group" aria-label="Choose a card to edit">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" aria-pressed={!addingSection && activeTab === tab.id} onClick={() => { setAddingSection(false); setActiveTab(tab.id) }} className="choice-chip shrink-0">{tab.label}</button>
          ))}
          <button type="button" aria-pressed={addingSection} onClick={() => setAddingSection(true)} className="choice-chip inline-flex shrink-0 items-center gap-1" aria-label="Add a section"><Plus size={14} />Section</button>
        </div>

        {addingSection && <AddSection onAdd={addSection} onCancel={() => setAddingSection(false)} />}

        <div className="form-grid">
          {!addingSection && activeTab === WORK_SCOPE && <section className="surface surface-pad">
            <p className="section-kicker">Professional</p>
            <FieldInput field="company" value={shown.company ?? ''} onChange={setField('company')} />
            <FieldInput field="workEmail" value={shown.workEmail ?? ''} onChange={setField('workEmail')} />
            <FieldInput field="workPhone" value={shown.workPhone ?? ''} onChange={setField('workPhone')} />
            <FieldInput field="linkedin" value={shown.linkedin ?? ''} onChange={setField('linkedin')} />
            {renderExtras(WORK_SCOPE)}
            <AddFieldMenu onAdd={addExtra(WORK_SCOPE)} />
          </section>}
          {!addingSection && activeTab === PERSONAL_SCOPE && <section className="surface surface-pad">
            <p className="section-kicker">Personal</p>
            <FieldInput field="personalPhone" value={shown.personalPhone ?? ''} onChange={setField('personalPhone')} />
            <FieldInput field="personalEmail" value={shown.personalEmail ?? ''} onChange={setField('personalEmail')} />
            <FieldInput field="instagram" value={shown.instagram ?? ''} onChange={setField('instagram')} />
            <FieldInput field="twitter" value={shown.twitter ?? ''} onChange={setField('twitter')} />
            {renderExtras(PERSONAL_SCOPE)}
            <AddFieldMenu onAdd={addExtra(PERSONAL_SCOPE)} />
          </section>}
          {!addingSection && sections.filter((section) => section.id === activeTab).map((section) => (
            <SectionCard key={section.id} name={section.name} itemCount={extras.filter((item) => item.scope === section.id).length} onRename={(name) => renameSection(section.id, name)} onRemove={() => removeSection(section.id)}>
              {renderExtras(section.id)}
              <AddFieldMenu onAdd={addExtra(section.id)} />
            </SectionCard>
          ))}
        </div>

        <section className="surface surface-pad">
          <div className="settings-row p-0">
            <div><div className="font-semibold">Include phone numbers when sharing</div><p className="surface-copy mb-0 mt-1 text-sm">This applies to every preset, including custom selections.</p></div>
            <button type="button" role="switch" aria-checked={shown.includePhones} aria-label="Include phone numbers when sharing" className="toggle" onClick={() => update({ includePhones: !shown.includePhones })} />
          </div>
        </section>

        <div className="profile-savebar flex flex-wrap items-center justify-between gap-3">
          <div role="status" aria-live="polite" className="text-sm text-ink-dim">{dirty ? 'Unsaved changes' : justSaved ? 'Saved on this device' : 'All changes saved on this device'}</div>
          <button type="button" onClick={handleSave} disabled={!dirty} className="primary-button disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">{dirty ? 'Save changes' : 'Saved'}</button>
        </div>
      </div>
    </div>
  )
}
