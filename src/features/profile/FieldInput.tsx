import type { FieldKey } from '../../lib/profileFields'
import { FIELD_LABELS } from '../../lib/profileFields'

export function FieldInput({
  field,
  value,
  onChange,
  placeholder,
}: {
  field: FieldKey
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1 border-b border-line/60 pb-2.5 last:border-none last:pb-0">
      <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">
        {FIELD_LABELS[field]}
      </span>
      <input
        className="bg-transparent text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-dim/60"
        value={value}
        placeholder={placeholder ?? FIELD_LABELS[field]}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
