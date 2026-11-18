import type { FieldKey } from '../../lib/profileFields'
import { FIELD_LABELS } from '../../lib/profileFields'

// Only free-text fields get capitalised; handles, URLs, emails and phones must not.
const WORD_CASE_FIELDS: FieldKey[] = ['company', 'title']

export function FieldInput({ field, value, onChange, placeholder }: { field: FieldKey; value: string; onChange: (value: string) => void; placeholder?: string }) {
  const inputType = field.toLowerCase().includes('email') ? 'email' : field.toLowerCase().includes('phone') ? 'tel' : 'text'
  return (
    <label className="field-editor">
      <span className="field-label">{FIELD_LABELS[field]}</span>
      <input type={inputType} autoCapitalize={WORD_CASE_FIELDS.includes(field) ? 'words' : 'none'} autoCorrect="off" value={value} placeholder={placeholder ?? FIELD_LABELS[field]} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
