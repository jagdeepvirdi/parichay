import { useEffect, useRef, useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import type { ProfileRecord } from '../../db/db'
import { Wordmark } from '../../components/Logo'
import { Avatar } from '../../components/Avatar'
import { FieldCard } from '../../components/FieldCard'
import { newExtra, type ExtraField, type ExtraKind, type ExtraScope, type FieldKey } from '../../lib/profileFields'
import { FieldInput } from './FieldInput'
import { ExtraFieldInput } from './ExtraFieldInput'
import { AddFieldMenu } from './AddFieldMenu'

// Unsaved edits live here, not in component state, so switching tabs and
// coming back doesn't silently throw them away.
let pendingDraft: ProfileRecord | null = null
const readPendingDraft = () => pendingDraft
const writePendingDraft = (next: ProfileRecord | null) => {
  pendingDraft = next
}

export function ProfileScreen() {
  const { profile, loading, save } = useProfile()
  const [draft, setDraftState] = useState<ProfileRecord | null>(readPendingDraft)
  const [justSaved, setJustSaved] = useState(false)
  const savedTimer = useRef<number | undefined>(undefined)

  const setDraft = (next: ProfileRecord | null) => {
    writePendingDraft(next)
    setDraftState(next)
  }

  const shown = draft ?? profile
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(profile)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => () => window.clearTimeout(savedTimer.current), [])

  if (loading) return null

  const update = (fields: Partial<ProfileRecord>) => setDraft({ ...shown, ...fields })
  const setField = (key: FieldKey) => (value: string) => update({ [key]: value })

  const extras = shown.extras ?? []
  const updateExtra = (next: ExtraField) => update({ extras: extras.map((x) => (x.id === next.id ? next : x)) })
  const removeExtra = (id: string) => update({ extras: extras.filter((x) => x.id !== id) })
  const addExtra = (scope: ExtraScope) => (kind: ExtraKind) => update({ extras: [...extras, newExtra(kind, scope)] })

  const renderExtras = (scope: ExtraScope) =>
    extras
      .filter((x) => x.scope === scope)
      .map((x) => <ExtraFieldInput key={x.id} extra={x} onChange={updateExtra} onRemove={() => removeExtra(x.id)} />)

  const handleSave = async () => {
    if (!draft) return
    // A field with no value is just an empty row — don't store it.
    await save({ ...draft, extras: (draft.extras ?? []).filter((x) => x.value.trim()) })
    setDraft(null)
    setJustSaved(true)
    window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 2500)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-1.5 px-6 pt-4 pb-3">
        <Wordmark />
        <h1 className="text-[22px] font-bold">Your card</h1>
        <p className="text-[13px] text-ink-dim">Fill it once. You choose what to share each time.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5">
            <Avatar name={shown.name || 'You'} />
            <div className="min-w-0">
              <input
                className="w-full bg-transparent text-[17px] font-semibold text-ink outline-none"
                value={shown.name}
                placeholder="Your name"
                onChange={(e) => update({ name: e.target.value })}
              />
              <input
                className="w-full bg-transparent text-[13px] text-ink-dim outline-none"
                value={shown.title ?? ''}
                placeholder="Your title"
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
          </div>

          <FieldCard label="Professional">
            <FieldInput field="title" value={shown.title ?? ''} onChange={setField('title')} />
            <FieldInput field="company" value={shown.company ?? ''} onChange={setField('company')} />
            <FieldInput field="workEmail" value={shown.workEmail ?? ''} onChange={setField('workEmail')} />
            <FieldInput field="workPhone" value={shown.workPhone ?? ''} onChange={setField('workPhone')} />
            <FieldInput field="linkedin" value={shown.linkedin ?? ''} onChange={setField('linkedin')} />
            {renderExtras('work')}
            <AddFieldMenu onAdd={addExtra('work')} />
          </FieldCard>

          <FieldCard label="Personal" tone="warm">
            <FieldInput field="personalPhone" value={shown.personalPhone ?? ''} onChange={setField('personalPhone')} />
            <FieldInput field="personalEmail" value={shown.personalEmail ?? ''} onChange={setField('personalEmail')} />
            <FieldInput field="instagram" value={shown.instagram ?? ''} onChange={setField('instagram')} />
            <FieldInput field="twitter" value={shown.twitter ?? ''} onChange={setField('twitter')} />
            {renderExtras('personal')}
            <AddFieldMenu onAdd={addExtra('personal')} />
          </FieldCard>

          <button
            type="button"
            onClick={() => update({ includePhones: !shown.includePhones })}
            className="shadow-card flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3"
            aria-pressed={shown.includePhones}
          >
            <span className="max-w-57 text-left text-[13.5px]">Include phone numbers when sharing</span>
            <span
              className="relative h-5.5 w-9.5 shrink-0 rounded-full transition-colors"
              style={{
                background: shown.includePhones
                  ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))'
                  : 'var(--color-line)',
              }}
            >
              <span
                className="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-[left]"
                style={{ left: shown.includePhones ? '18px' : '2px' }}
              />
            </span>
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-6 pt-2 pb-4">
        <div role="status" aria-live="polite" className="text-center font-mono text-[11.5px]">
          {dirty ? (
            <span className="text-accent-warm">● Unsaved changes</span>
          ) : (
            <span className="text-ink-dim">{justSaved ? '✓ Saved on this device' : 'All changes saved'}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className={`block w-full rounded-xl py-3.25 text-center text-[15px] font-semibold ${dirty ? 'shadow-btn text-white' : 'bg-line text-ink-dim'}`}
          style={dirty ? { background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))' } : undefined}
        >
          {dirty ? 'Save changes' : 'Saved'}
        </button>
      </div>
    </div>
  )
}
