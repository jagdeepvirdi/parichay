import type { FieldKey } from './profileFields'

export type PresetKey = 'professional' | 'personal' | 'everything' | 'digital'

export interface Preset {
  key: PresetKey
  label: string
  fields: FieldKey[]
}

// Mirrors the four presets from the design mockup. "digital" deliberately
// carries no phone numbers at all, independent of the profile-level
// "include phone numbers" toggle.
export const SHARE_PRESETS: Preset[] = [
  {
    key: 'professional',
    label: 'Professional',
    fields: ['title', 'company', 'workEmail', 'workPhone', 'linkedin'],
  },
  {
    key: 'personal',
    label: 'Personal',
    fields: ['personalPhone', 'personalEmail', 'instagram', 'twitter'],
  },
  {
    key: 'everything',
    label: 'Everything',
    fields: [
      'title',
      'company',
      'workEmail',
      'workPhone',
      'linkedin',
      'personalPhone',
      'personalEmail',
      'instagram',
      'twitter',
    ],
  },
  {
    key: 'digital',
    label: 'Digital only',
    fields: ['title', 'company', 'workEmail', 'linkedin', 'instagram', 'twitter'],
  },
]

export function getPreset(key: PresetKey): Preset {
  const preset = SHARE_PRESETS.find((p) => p.key === key)
  if (!preset) throw new Error(`Unknown preset: ${key}`)
  return preset
}
