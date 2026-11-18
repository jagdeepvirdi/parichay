import { X } from 'lucide-react'
import { SOCIAL_PLATFORMS, type ExtraField, type SocialPlatform } from '../../lib/profileFields'

const INPUT_MODE = { phone: 'tel', email: 'email', link: 'url', social: 'text' } as const
const PLACEHOLDER = { phone: '+1 555 0100', email: 'name@example.com', link: 'yoursite.com', social: '@yourhandle' } as const

export function ExtraFieldInput({ extra, onChange, onRemove }: { extra: ExtraField; onChange: (next: ExtraField) => void; onRemove: () => void }) {
  return (
    <div className="field-editor">
      <div className="flex items-center gap-2">
        <input aria-label="Field label" className="field-label mb-0 min-w-0 flex-1 border-0 bg-transparent outline-none" value={extra.label} placeholder={extra.kind === 'social' ? 'Label, e.g. Kitchen' : 'Field label'} onChange={(event) => onChange({ ...extra, label: event.target.value })} />
        <button type="button" onClick={onRemove} aria-label={`Remove ${extra.label || 'field'}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-dim hover:bg-soft"><X size={16} /></button>
      </div>
      {extra.kind === 'social' && (
        <select aria-label="Platform" className="w-fit rounded-md border border-line bg-white px-2 py-1 text-xs" value={extra.platform ?? 'instagram'} onChange={(event) => onChange({ ...extra, platform: event.target.value as SocialPlatform })}>
          {(Object.keys(SOCIAL_PLATFORMS) as SocialPlatform[]).map((platform) => <option key={platform} value={platform}>{SOCIAL_PLATFORMS[platform].label}</option>)}
        </select>
      )}
      <input className="w-full border-0 bg-transparent py-1 text-[.94rem] font-medium outline-none focus:shadow-[0_1px_#167C70]" value={extra.value} inputMode={INPUT_MODE[extra.kind]} autoCapitalize="none" autoCorrect="off" placeholder={PLACEHOLDER[extra.kind]} onChange={(event) => onChange({ ...extra, value: event.target.value })} />
    </div>
  )
}
