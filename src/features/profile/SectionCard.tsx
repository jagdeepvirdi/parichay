import { useState, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

/** One user-made section (e.g. "Kitchen"): renamable, with a two-tap remove. */
export function SectionCard({
  name,
  itemCount,
  onRename,
  onRemove,
  children,
}: {
  name: string
  itemCount: number
  onRename: (name: string) => void
  onRemove: () => void
  children: ReactNode
}) {
  const [confirming, setConfirming] = useState(false)
  return (
    <section className="surface surface-pad">
      <div className="mb-1 flex items-center justify-between gap-2">
        <input aria-label="Section name" className="section-kicker mb-0 min-w-0 flex-1 border-0 bg-transparent outline-none" value={name} placeholder="Section name" onChange={(event) => onRename(event.target.value)} />
        {!confirming && <button type="button" onClick={() => setConfirming(true)} aria-label={`Remove section ${name || ''}`.trim()} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-dim hover:bg-soft"><Trash2 size={16} /></button>}
      </div>
      {confirming && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E7C8C3] bg-[#FBF1EF] p-3">
          <span className="text-sm font-semibold text-[#7A352A]">Remove this section{itemCount ? ` and its ${itemCount} ${itemCount === 1 ? 'field' : 'fields'}` : ''}?</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirming(false)} className="secondary-button min-h-9 px-3 py-1 text-sm">Keep</button>
            <button type="button" onClick={onRemove} className="inline-flex min-h-9 items-center rounded-xl bg-[#8D3C30] px-3 text-sm font-semibold text-white">Remove</button>
          </div>
        </div>
      )}
      {children}
    </section>
  )
}
