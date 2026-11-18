import { PERSONAL_SCOPE, WORK_SCOPE, type ExtraField, type FieldKey, type Section } from './profileFields'

export type BuiltInPresetKey = 'professional' | 'personal' | 'everything' | 'digital'
/** Built-in keys, or `section:<id>` for a user-made section. */
export type PresetKey = BuiltInPresetKey | `section:${string}`

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
    includesExtra: (e) => e.scope === WORK_SCOPE,
  },
  {
    key: 'personal',
    label: 'Personal',
    fields: ['personalPhone', 'personalEmail', 'instagram', 'twitter'],
    includesExtra: (e) => e.scope === PERSONAL_SCOPE,
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

/** A preset that shares only what lives in one user-made section (plus the name, always). */
export function sectionPreset(section: Section): Preset {
  return {
    key: `section:${section.id}`,
    label: section.name,
    fields: [],
    includesExtra: (e) => e.scope === section.id,
  }
}

/** Built-in presets followed by one per section, in the order the sections were made. */
export function presetsFor(sections: Section[] = []): Preset[] {
  return [...SHARE_PRESETS, ...sections.map(sectionPreset)]
}

export function getPreset(key: PresetKey): Preset {
  const preset = SHARE_PRESETS.find((p) => p.key === key)
  if (!preset) throw new Error(`Unknown preset: ${key}`)
  return preset
}
