import { newExtra, type ExtraKind, type ExtraScope, type FieldKey, type ProfileFields } from './profileFields'

// A tiny, deliberately narrow VCARD 3.0 reader/writer. It only knows about
// the fields Parichay itself cares about, so it is not a general vCard
// library — it just has to round-trip what buildVCard produces, and read a
// normal card's name/org/title/tel/email/url fields when a native camera
// app's QR (or another vCard, generally) is scanned instead.

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

/** Build a VCARD 3.0 string carrying only `fields` (plus the name, always). */
export function buildVCard(profile: ProfileFields, fields: FieldKey[], note?: string): string {
  const has = (key: FieldKey) => fields.includes(key) && !!profile[key]
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  lines.push(`FN:${escapeText(profile.name)}`)
  lines.push(`N:${escapeText(profile.name)};;;;`)

  if (has('company') || has('title')) {
    lines.push(`ORG:${escapeText(profile.company ?? '')}`)
  }
  if (has('title')) {
    lines.push(`TITLE:${escapeText(profile.title!)}`)
  }
  if (has('workPhone')) {
    lines.push(`TEL;TYPE=WORK,VOICE:${escapeText(profile.workPhone!)}`)
  }
  if (has('personalPhone')) {
    lines.push(`TEL;TYPE=CELL:${escapeText(profile.personalPhone!)}`)
  }
  if (has('workEmail')) {
    lines.push(`EMAIL;TYPE=WORK:${escapeText(profile.workEmail!)}`)
  }
  if (has('personalEmail')) {
    lines.push(`EMAIL;TYPE=HOME:${escapeText(profile.personalEmail!)}`)
  }
  if (has('linkedin')) {
    lines.push(`URL;TYPE=LinkedIn:${escapeText(normalizeUrl(profile.linkedin!, 'linkedin.com/in/'))}`)
  }
  if (has('instagram')) {
    lines.push(`URL;TYPE=Instagram:${escapeText(normalizeUrl(profile.instagram!, 'instagram.com/'))}`)
  }
  if (has('twitter')) {
    lines.push(`URL;TYPE=Twitter:${escapeText(normalizeUrl(profile.twitter!, 'x.com/'))}`)
  }
  // Extras are not gated by `fields` — the caller decides which extras are
  // shared by passing a profile whose `extras` already holds only those.
  for (const extra of profile.extras ?? []) {
    const value = extra.value.trim()
    if (!value) continue
    const work = extra.scope === 'work'
    if (extra.kind === 'phone') {
      lines.push(`TEL;TYPE=${work ? 'WORK,VOICE' : 'CELL'}:${escapeText(value)}`)
    } else if (extra.kind === 'email') {
      lines.push(`EMAIL;TYPE=${work ? 'WORK' : 'HOME'}:${escapeText(value)}`)
    } else {
      const url = value.includes('.') || /^https?:\/\//i.test(value) ? normalizeUrl(value, '') : value
      lines.push(`URL;TYPE=${typeFromLabel(extra.label)}:${escapeText(url)}`)
    }
  }
  if (note) {
    lines.push(`NOTE:${escapeText(note)}`)
  }

  lines.push('END:VCARD')
  return lines.join('\r\n')
}

// A URL's TYPE param carries the user's label ("My Blog" -> "My-Blog"), since
// a TYPE value can't hold spaces or commas.
function typeFromLabel(label: string): string {
  const cleaned = label.trim().replace(/[^A-Za-z0-9 -]/g, '').replace(/\s+/g, '-')
  return cleaned || 'Website'
}

const GENERIC_URL_TYPES = new Set(['WORK', 'HOME', 'PREF', 'INTERNET', 'OTHER'])

function labelFromType(typeParam: string | undefined): string {
  const first = typeParam?.slice(5).split(',')[0]?.trim() ?? ''
  if (!first || GENERIC_URL_TYPES.has(first.toUpperCase())) return 'Website'
  return first.replace(/-/g, ' ')
}

function normalizeUrl(handleOrUrl: string, prefix: string): string {
  const trimmed = handleOrUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  // Already a domain/path (e.g. "linkedin.com/in/x") rather than a bare handle.
  if (trimmed.includes('.')) return `https://${trimmed.replace(/^\/+/, '')}`
  const handle = trimmed.replace(/^@/, '')
  return `https://${prefix}${handle}`
}

export interface ParsedVCard extends ProfileFields {
  note?: string
}

/** Parse a scanned VCARD string back into our flat field shape. Returns
 * null if the text isn't a vCard at all (so callers can show "not a
 * Parichay card" rather than a blank contact). */
export function parseVCard(text: string): ParsedVCard | null {
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
  const lines = unfolded.split(/\r\n|\n|\r/).map((l) => l.trim()).filter(Boolean)

  if (!lines.some((l) => l.toUpperCase() === 'BEGIN:VCARD')) return null

  const result: ParsedVCard = { name: '' }
  const addExtra = (kind: ExtraKind, scope: ExtraScope, label: string | undefined, value: string) => {
    result.extras = [...(result.extras ?? []), newExtra(kind, scope, label, value)]
  }

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const rawKey = line.slice(0, colonIndex)
    const rawValue = unescapeText(line.slice(colonIndex + 1))
    const [prop, ...params] = rawKey.split(';')
    const propUpper = prop.toUpperCase()
    const typeParam = params.find((p) => p.toUpperCase().startsWith('TYPE='))
    const type = typeParam ? typeParam.slice(5).toUpperCase() : ''

    switch (propUpper) {
      case 'FN':
        if (!result.name) result.name = rawValue
        break
      case 'N':
        if (!result.name) result.name = rawValue.split(';').filter(Boolean).join(' ')
        break
      case 'ORG':
        result.company = rawValue
        break
      case 'TITLE':
        result.title = rawValue
        break
      // The first value of each kind fills the fixed slot; any further ones
      // (a second phone, a portfolio URL…) are kept as extras, not dropped.
      case 'TEL': {
        const personal = type.includes('CELL') || type.includes('HOME')
        if (personal && !result.personalPhone) result.personalPhone = rawValue
        else if (!personal && !result.workPhone) result.workPhone = rawValue
        else addExtra('phone', personal ? 'personal' : 'work', undefined, rawValue)
        break
      }
      case 'EMAIL': {
        const personal = type.includes('HOME')
        if (personal && !result.personalEmail) result.personalEmail = rawValue
        else if (!personal && !result.workEmail) result.workEmail = rawValue
        else addExtra('email', personal ? 'personal' : 'work', undefined, rawValue)
        break
      }
      case 'URL':
        if (type.includes('LINKEDIN') && !result.linkedin) result.linkedin = rawValue
        else if (type.includes('INSTAGRAM') && !result.instagram) result.instagram = rawValue
        else if (type.includes('TWITTER') && !result.twitter) result.twitter = rawValue
        else addExtra('link', 'work', labelFromType(typeParam), rawValue)
        break
      case 'NOTE':
        result.note = rawValue
        break
      default:
        break
    }
  }

  if (!result.name) return null
  return result
}

/** Build a full .vcf file's contents for one or more contacts (used by the
 * "push to phone contacts" export — see contactsExport.ts). */
export function buildVCardFile(profile: ProfileFields, fields: FieldKey[], note?: string): string {
  return buildVCard(profile, fields, note) + '\r\n'
}
