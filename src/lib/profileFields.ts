// The full set of fields a profile (or a received contact) can carry.
// Kept as one flat shape so the same type works for "my card", a scanned
// contact, and a vCard built for sharing — only which keys are *present*
// changes between those.
export interface ProfileFields {
  name: string
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

export type FieldKey = Exclude<keyof ProfileFields, 'name'>

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
