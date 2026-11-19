import { useState } from 'react'

export function AddSection({ onAdd, onCancel }: { onAdd: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const submit = () => {
    if (!name.trim()) return
    onAdd(name)
  }
  return (
    <div className="surface surface-pad flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1">
        <label className="field-label" htmlFor="new-section">New section</label>
        <input id="new-section" autoFocus className="text-input" placeholder="e.g. Kitchen, Photography" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit() }} />
      </div>
      <button type="button" onClick={submit} disabled={!name.trim()} className="primary-button disabled:bg-slate-300 disabled:shadow-none">Add</button>
      <button type="button" onClick={onCancel} className="secondary-button">Cancel</button>
    </div>
  )
}
