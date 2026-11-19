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

export type ExtraKind = 'phone' | 'email' | 'link' | 'social'
export type SocialPlatform = 'instagram' | 'x' | 'linkedin' | 'youtube' | 'facebook' | 'tiktok'

export const SOCIAL_PLATFORMS: Record<SocialPlatform, { label: string; prefix: string }> = {
  instagram: { label: 'Instagram', prefix: 'instagram.com/' },
  x: { label: 'X / Twitter', prefix: 'x.com/' },
  linkedin: { label: 'LinkedIn', prefix: 'linkedin.com/in/' },
  youtube: { label: 'YouTube', prefix: 'youtube.com/@' },
  facebook: { label: 'Facebook', prefix: 'facebook.com/' },
  tiktok: { label: 'TikTok', prefix: 'tiktok.com/@' },
}

export const WORK_SCOPE = 'work'
export const PERSONAL_SCOPE = 'personal'
/** Which part of the card an extra lives in: 'work', 'personal', or the id of a
 * user-made Section (e.g. "Kitchen"). Presets key off this. */
export type ExtraScope = string

/** A user-named bucket of fields (a hobby, a side project…) that can be shared on its own. */
export interface Section {
  id: string
  name: string
}

export function newSection(name: string): Section {
  return { id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: name.trim() }
}

export interface ExtraField {
  id: string
  kind: ExtraKind
  scope: ExtraScope
  /** Free text the user picks, e.g. "Portfolio", "Blog", "Home". */
  label: string
  value: string
  /** Only for kind 'social': decides how a bare handle turns into a URL. */
  platform?: SocialPlatform
}

export const EXTRA_KIND_LABELS: Record<ExtraKind, string> = {
  phone: 'Phone',
  email: 'Email',
  link: 'Website / link',
  social: 'Social profile',
}

const EXTRA_DEFAULT_LABELS: Record<ExtraKind, string> = {
  phone: 'Phone',
  email: 'Email',
  link: 'Website',
  social: 'Social',
}

let extraCounter = 0

export function newExtra(
  kind: ExtraKind,
  scope: ExtraScope,
  label?: string,
  value = '',
  platform?: SocialPlatform,
): ExtraField {
  extraCounter += 1
  return {
    id: `x${Date.now().toString(36)}${extraCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    kind,
    scope,
    label: label ?? (kind === 'social' && platform ? SOCIAL_PLATFORMS[platform].label : EXTRA_DEFAULT_LABELS[kind]),
    value,
    ...(kind === 'social' ? { platform: platform ?? 'instagram' } : {}),
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
