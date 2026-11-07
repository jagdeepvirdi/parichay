import type { FieldKey, ProfileFields } from './profileFields'

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
  if (note) {
    lines.push(`NOTE:${escapeText(note)}`)
  }

  lines.push('END:VCARD')
  return lines.join('\r\n')
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
      case 'TEL':
        if (type.includes('CELL') || type.includes('HOME')) result.personalPhone = rawValue
        else result.workPhone = rawValue
        break
      case 'EMAIL':
        if (type.includes('HOME')) result.personalEmail = rawValue
        else result.workEmail = rawValue
        break
      case 'URL':
        if (type.includes('LINKEDIN')) result.linkedin = rawValue
        else if (type.includes('INSTAGRAM')) result.instagram = rawValue
        else if (type.includes('TWITTER')) result.twitter = rawValue
        else if (!result.linkedin) result.linkedin = rawValue
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
