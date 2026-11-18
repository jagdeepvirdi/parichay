import { describe, expect, it } from 'vitest'
import { buildVCard, parseVCard } from './vcard'
import { newExtra, type ProfileFields } from './profileFields'

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

describe('extras', () => {
  const withExtras: ProfileFields = {
    ...profile,
    extras: [
      { id: 'a', kind: 'link', scope: 'work', label: 'Portfolio', value: 'jagdeep.dev' },
      { id: 'b', kind: 'link', scope: 'personal', label: 'My Blog', value: 'https://blog.example.com/jd' },
      { id: 'c', kind: 'phone', scope: 'work', label: 'Phone', value: '+66 80 000 0000' },
      { id: 'd', kind: 'email', scope: 'personal', label: 'Email', value: 'jd@example.com' },
      { id: 'e', kind: 'link', scope: 'work', label: 'Empty', value: '   ' },
    ],
  }

  it('writes extras to the vCard and skips blank ones', () => {
    const vcard = buildVCard(withExtras, [])
    expect(vcard).toContain('URL;TYPE=Portfolio:https://jagdeep.dev')
    expect(vcard).toContain('URL;TYPE=My-Blog:https://blog.example.com/jd')
    expect(vcard).toContain('TEL;TYPE=WORK,VOICE:+66 80 000 0000')
    expect(vcard).toContain('EMAIL;TYPE=HOME:jd@example.com')
    expect(vcard).not.toContain('Empty')
  })

  it('round-trips extras, keeping the link label', () => {
    const parsed = parseVCard(buildVCard(withExtras, ['workPhone']))
    // first work phone fills the fixed slot, the second becomes an extra
    expect(parsed?.workPhone).toBe('+66 81 234 5678')
    // personalEmail wasn't shared, so the personal email extra lands in that empty slot
    expect(parsed?.personalEmail).toBe('jd@example.com')
    expect(parsed?.extras).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'link', label: 'Portfolio', value: 'https://jagdeep.dev' }),
        expect.objectContaining({ kind: 'link', label: 'My Blog' }),
        expect.objectContaining({ kind: 'phone', scope: 'work', value: '+66 80 000 0000' }),
      ]),
    )
    expect(parsed?.extras).toHaveLength(3)
  })

  it('keeps an unlabelled URL from another app as a website, not as LinkedIn', () => {
    const parsed = parseVCard(['BEGIN:VCARD', 'FN:Meera Nair', 'URL:https://meera.dev', 'END:VCARD'].join('\r\n'))
    expect(parsed?.linkedin).toBeUndefined()
    expect(parsed?.extras).toEqual([expect.objectContaining({ kind: 'link', label: 'Website', value: 'https://meera.dev' })])
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

describe('social extras (several Instagrams)', () => {
  const base: ProfileFields = {
    name: 'Jagdeep Virdi',
    instagram: 'jagdeep',
    extras: [
      newExtra('social', 'kitchen', 'Kitchen Instagram', '@jaggiskitchen', 'instagram'),
      newExtra('social', 'work', 'Work Instagram', 'advancetech', 'instagram'),
      newExtra('social', 'photo', 'Photo YouTube', 'jaggishots', 'youtube'),
    ],
  }

  it('turns a bare handle into a URL for the chosen platform, keeping the label', () => {
    const vcard = buildVCard(base, [])
    expect(vcard).toContain('URL;TYPE=Kitchen-Instagram:https://instagram.com/jaggiskitchen')
    expect(vcard).toContain('URL;TYPE=Work-Instagram:https://instagram.com/advancetech')
    expect(vcard).toContain('URL;TYPE=Photo-YouTube:https://youtube.com/@jaggishots')
  })

  it('keeps a labelled Instagram out of the plain Instagram slot when read back', () => {
    const onlyKitchen = buildVCard({ ...base, extras: base.extras!.slice(0, 1) }, [])
    const parsed = parseVCard(onlyKitchen)
    expect(parsed?.instagram).toBeUndefined()
    expect(parsed?.extras).toEqual([expect.objectContaining({ label: 'Kitchen Instagram', value: 'https://instagram.com/jaggiskitchen' })])
  })

  it('still fills the plain slot for the fixed Instagram field', () => {
    const parsed = parseVCard(buildVCard(base, ['instagram']))
    expect(parsed?.instagram).toBe('https://instagram.com/jagdeep')
  })
})
