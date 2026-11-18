import type { ExtraField } from '../../lib/profileFields'

const INPUT_MODE = { phone: 'tel', email: 'email', link: 'url' } as const
const PLACEHOLDER = { phone: '+1 555 0100', email: 'name@example.com', link: 'yoursite.com' } as const

/** One user-added field: an editable label (e.g. "Portfolio") over its value. */
export function ExtraFieldInput({
  extra,
  onChange,
  onRemove,
}: {
  extra: ExtraField
  onChange: (next: ExtraField) => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/60 pb-2.5 last:border-none last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <input
          aria-label="Field label"
          className="min-w-0 flex-1 bg-transparent font-mono text-[10.5px] uppercase tracking-wider text-ink-dim outline-none"
          value={extra.label}
          placeholder="Label"
          onChange={(e) => onChange({ ...extra, label: e.target.value })}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${extra.label || 'field'}`}
          className="-m-2 p-2 text-[15px] leading-none text-ink-dim"
        >
          ×
        </button>
      </div>
      <input
        className="bg-transparent text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-dim/60"
        value={extra.value}
        inputMode={INPUT_MODE[extra.kind]}
        autoCapitalize="none"
        autoCorrect="off"
        placeholder={PLACEHOLDER[extra.kind]}
        onChange={(e) => onChange({ ...extra, value: e.target.value })}
      />
    </div>
  )
}
