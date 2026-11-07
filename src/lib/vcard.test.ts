import { describe, expect, it } from 'vitest'
import { buildVCard, parseVCard } from './vcard'
import type { ProfileFields } from './profileFields'

const profile: ProfileFields = {
  name: 'Jagdeep Virdi',
  title: 'AI-Augmented BSS Architect',
  company: 'Advance Tech Solutions',
  workEmail: 'jagdeep@advancetech.co',
  workPhone: '+66 81 234 5678',
  linkedin: 'linkedin.com/in/jagdeepvirdi',
  personalPhone: '+66 89 876 5432',
  personalEmail: 'jagdeep@gmail.com',
  instagram: '@jaggiskitchen',
  twitter: '@jagdeepvirdi',
}

describe('buildVCard', () => {
  it('includes only the requested fields', () => {
    const vcard = buildVCard(profile, ['title', 'company', 'workEmail'])
    expect(vcard).toContain('FN:Jagdeep Virdi')
    expect(vcard).toContain('TITLE:AI-Augmented BSS Architect')
    expect(vcard).toContain('EMAIL;TYPE=WORK:jagdeep@advancetech.co')
    expect(vcard).not.toContain('TEL')
    expect(vcard).not.toContain('personalEmail')
    expect(vcard).not.toContain('jagdeep@gmail.com')
  })

  it('never leaks a phone number for the digital-only preset', () => {
    const vcard = buildVCard(profile, ['title', 'company', 'workEmail', 'linkedin'])
    expect(vcard).not.toMatch(/TEL/)
  })

  it('normalizes a bare handle into a full URL', () => {
    const vcard = buildVCard(profile, ['instagram'])
    expect(vcard).toContain('URL;TYPE=Instagram:https://instagram.com/jaggiskitchen')
  })

  it('escapes commas, semicolons and backslashes in free text', () => {
    const tricky: ProfileFields = { ...profile, company: 'A; B, C\\D' }
    const vcard = buildVCard(tricky, ['company', 'title'])
    expect(vcard).toContain('ORG:A\\; B\\, C\\\\D')
  })

  it('round-trips through parseVCard', () => {
    const vcard = buildVCard(profile, ['title', 'company', 'workEmail', 'workPhone', 'linkedin'])
    const parsed = parseVCard(vcard)
    expect(parsed).toMatchObject({
      name: 'Jagdeep Virdi',
      title: 'AI-Augmented BSS Architect',
      company: 'Advance Tech Solutions',
      workEmail: 'jagdeep@advancetech.co',
      workPhone: '+66 81 234 5678',
      linkedin: 'https://linkedin.com/in/jagdeepvirdi',
    })
    expect(parsed?.personalEmail).toBeUndefined()
  })
})

describe('parseVCard', () => {
  it('returns null for non-vCard text (so the scanner can say so)', () => {
    expect(parseVCard('just some random QR payload')).toBeNull()
  })

  it('reads a generic vCard from another app (no custom TYPE params)', () => {
    const generic = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Meera Nair',
      'N:Nair;Meera;;;',
      'ORG:Bluewave Labs',
      'TITLE:ML Engineer',
      'TEL;TYPE=WORK,VOICE:+1 555 0100',
      'EMAIL;TYPE=INTERNET:meera@bluewavelabs.ai',
      'END:VCARD',
    ].join('\r\n')

    const parsed = parseVCard(generic)
    expect(parsed).toMatchObject({
      name: 'Meera Nair',
      company: 'Bluewave Labs',
      title: 'ML Engineer',
      workPhone: '+1 555 0100',
      workEmail: 'meera@bluewavelabs.ai',
    })
  })

  it('unfolds wrapped lines per the vCard spec', () => {
    const folded = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:Meera Nair', 'NOTE:Table 4\\, asked about\r\n  agentic billing demos', 'END:VCARD'].join('\r\n')
    const parsed = parseVCard(folded)
    expect(parsed?.note).toBe('Table 4, asked about agentic billing demos')
  })
})
