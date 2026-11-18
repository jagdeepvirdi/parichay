import { useState } from 'react'
import { Plus } from 'lucide-react'

export function AddSection({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const submit = () => {
    if (!name.trim()) return
    onAdd(name)
    setName('')
    setOpen(false)
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="secondary-button self-start"><Plus size={16} />Add a section</button>
  return (
    <div className="surface surface-pad flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1">
        <label className="field-label" htmlFor="new-section">New section</label>
        <input id="new-section" autoFocus className="text-input" placeholder="e.g. Kitchen, Photography" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit() }} />
      </div>
      <button type="button" onClick={submit} disabled={!name.trim()} className="primary-button disabled:bg-slate-300 disabled:shadow-none">Add</button>
      <button type="button" onClick={() => { setOpen(false); setName('') }} className="secondary-button">Cancel</button>
    </div>
  )
}
