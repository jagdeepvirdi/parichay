import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { EXTRA_KIND_LABELS, SOCIAL_PLATFORMS, type ExtraKind, type SocialPlatform } from '../../lib/profileFields'

const KINDS: ExtraKind[] = ['phone', 'email', 'link', 'social']

export function AddFieldMenu({ onAdd }: { onAdd: (kind: ExtraKind, platform?: SocialPlatform) => void }) {
  const [open, setOpen] = useState(false)
  const [pickingPlatform, setPickingPlatform] = useState(false)
  const close = () => { setOpen(false); setPickingPlatform(false) }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"><Plus size={16} />Add field</button>

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {pickingPlatform
        ? (Object.keys(SOCIAL_PLATFORMS) as SocialPlatform[]).map((platform) => (
            <button key={platform} type="button" onClick={() => { onAdd('social', platform); close() }} className="secondary-button min-h-9 px-3 py-1 text-sm">{SOCIAL_PLATFORMS[platform].label}</button>
          ))
        : KINDS.map((kind) => (
            <button key={kind} type="button" onClick={() => { if (kind === 'social') setPickingPlatform(true); else { onAdd(kind); close() } }} className="secondary-button min-h-9 px-3 py-1 text-sm">{EXTRA_KIND_LABELS[kind]}</button>
          ))}
      <button type="button" onClick={close} aria-label="Cancel adding field" className="grid h-9 w-9 place-items-center rounded-lg text-ink-dim"><X size={16} /></button>
    </div>
  )
}
