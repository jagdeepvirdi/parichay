// The full set of fields a profile (or a received contact) can carry.
// Kept as one flat shape so the same type works for "my card", a scanned
// contact, and a vCard built for sharing — only which keys are *present*
// changes between those.
export interface ProfileFields {
  name: string
  /** User-added fields beyond the fixed set: extra phones/emails, a portfolio or blog link, etc. */
  extras?: ExtraField[]
  title?: string
  company?: string
  workEmail?: string
  workPhone?: string
  linkedin?: string
  personalPhone?: string
  personalEmail?: string
  instagram?: string
  twitter?: string
}

export type ExtraKind = 'phone' | 'email' | 'link'
/** Which card an extra lives in — also what the Professional/Personal presets key off. */
export type ExtraScope = 'work' | 'personal'

export interface ExtraField {
  id: string
  kind: ExtraKind
  scope: ExtraScope
  /** Free text the user picks, e.g. "Portfolio", "Blog", "Home". */
  label: string
  value: string
}

export const EXTRA_KIND_LABELS: Record<ExtraKind, string> = {
  phone: 'Phone',
  email: 'Email',
  link: 'Website / link',
}

const EXTRA_DEFAULT_LABELS: Record<ExtraKind, string> = {
  phone: 'Phone',
  email: 'Email',
  link: 'Website',
}

let extraCounter = 0

export function newExtra(kind: ExtraKind, scope: ExtraScope, label?: string, value = ''): ExtraField {
  extraCounter += 1
  return {
    id: `x${Date.now().toString(36)}${extraCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    kind,
    scope,
    label: label ?? EXTRA_DEFAULT_LABELS[kind],
    value,
  }
}

export type FieldKey = Exclude<keyof ProfileFields, 'name' | 'extras'>

export const FIELD_KEYS: FieldKey[] = [
  'title',
  'company',
  'workEmail',
  'workPhone',
  'linkedin',
  'personalPhone',
  'personalEmail',
  'instagram',
  'twitter',
]

export const FIELD_LABELS: Record<FieldKey, string> = {
  title: 'Title',
  company: 'Company',
  workEmail: 'Work email',
  workPhone: 'Work phone',
  linkedin: 'LinkedIn',
  personalPhone: 'Personal phone',
  personalEmail: 'Personal email',
  instagram: 'Instagram',
  twitter: 'X / Twitter',
}

export const PHONE_FIELDS: FieldKey[] = ['workPhone', 'personalPhone']
