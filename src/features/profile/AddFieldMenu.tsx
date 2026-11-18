import { useState } from 'react'
import { EXTRA_KIND_LABELS, type ExtraKind } from '../../lib/profileFields'

const KINDS: ExtraKind[] = ['phone', 'email', 'link']

/** "+ Add field" that expands inline into a Phone / Email / Website picker. */
export function AddFieldMenu({ onAdd }: { onAdd: (kind: ExtraKind) => void }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start py-1 font-mono text-[11.5px] font-medium text-ink-dim"
      >
        + Add field
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => {
            onAdd(kind)
            setOpen(false)
          }}
          className="rounded-full border border-line bg-surface px-3 py-1.75 font-mono text-[11px] text-ink"
        >
          {EXTRA_KIND_LABELS[kind]}
        </button>
      ))}
      <button type="button" onClick={() => setOpen(false)} className="px-1 font-mono text-[11px] text-ink-dim">
        Cancel
      </button>
    </div>
  )
}
