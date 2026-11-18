import type { ExtraField, FieldKey } from './profileFields'

export type PresetKey = 'professional' | 'personal' | 'everything' | 'digital'

export interface Preset {
  key: PresetKey
  label: string
  fields: FieldKey[]
  /** Which user-added extras this preset carries. */
  includesExtra: (extra: ExtraField) => boolean
}

// Mirrors the four presets from the design mockup. "digital" deliberately
// carries no phone numbers at all, independent of the profile-level
// "include phone numbers" toggle.
export const SHARE_PRESETS: Preset[] = [
  {
    key: 'professional',
    label: 'Professional',
    fields: ['title', 'company', 'workEmail', 'workPhone', 'linkedin'],
    includesExtra: (e) => e.scope === 'work',
  },
  {
    key: 'personal',
    label: 'Personal',
    fields: ['personalPhone', 'personalEmail', 'instagram', 'twitter'],
    includesExtra: (e) => e.scope === 'personal',
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
    includesExtra: () => true,
  },
  {
    key: 'digital',
    label: 'Digital only',
    fields: ['title', 'company', 'workEmail', 'linkedin', 'instagram', 'twitter'],
    includesExtra: (e) => e.kind !== 'phone',
  },
]

export function getPreset(key: PresetKey): Preset {
  const preset = SHARE_PRESETS.find((p) => p.key === key)
  if (!preset) throw new Error(`Unknown preset: ${key}`)
  return preset
}
