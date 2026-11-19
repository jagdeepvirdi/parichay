import { describe, expect, it } from 'vitest'
import { getPreset, presetsFor, sectionPreset } from './presets'
import { newExtra, newSection } from './profileFields'

describe('preset extras', () => {
  const workLink = newExtra('link', 'work', 'Portfolio', 'x.dev')
  const personalPhone = newExtra('phone', 'personal', 'Home', '123')
  const personalLink = newExtra('link', 'personal', 'Blog', 'b.dev')

  it('professional carries work extras only', () => {
    const p = getPreset('professional')
    expect([workLink, personalPhone, personalLink].filter(p.includesExtra)).toEqual([workLink])
  })

  it('personal carries personal extras only', () => {
    const p = getPreset('personal')
    expect([workLink, personalPhone, personalLink].filter(p.includesExtra)).toEqual([personalPhone, personalLink])
  })

  it('digital only never carries an extra phone', () => {
    const p = getPreset('digital')
    expect([workLink, personalPhone, personalLink].filter(p.includesExtra)).toEqual([workLink, personalLink])
  })

  it('everything carries all extras', () => {
    const p = getPreset('everything')
    expect([workLink, personalPhone, personalLink].filter(p.includesExtra)).toHaveLength(3)
  })
})

describe('section presets', () => {
  const kitchen = newSection('Kitchen')
  const photography = newSection('Photography')
  const kitchenInsta = newExtra('social', kitchen.id, 'Kitchen Instagram', 'jaggiskitchen', 'instagram')
  const photoInsta = newExtra('social', photography.id, 'Photo Instagram', 'jaggi.shots', 'instagram')
  const workInsta = newExtra('social', 'work', 'Work Instagram', 'advancetech', 'instagram')
  const all = [kitchenInsta, photoInsta, workInsta]

  it('adds one preset per section after the built-in ones', () => {
    const presets = presetsFor([kitchen, photography])
    expect(presets.map((p) => p.label)).toEqual(['Professional', 'Personal', 'Everything', 'Digital only', 'Kitchen', 'Photography'])
    expect(presets[4].key).toBe(`section:${kitchen.id}`)
  })

  it('a section preset carries only that section, and no fixed fields', () => {
    const p = sectionPreset(kitchen)
    expect(all.filter(p.includesExtra)).toEqual([kitchenInsta])
    expect(p.fields).toEqual([])
  })

  it('professional and personal never pick up hobby sections', () => {
    expect(all.filter(getPreset('professional').includesExtra)).toEqual([workInsta])
    expect(all.filter(getPreset('personal').includesExtra)).toEqual([])
  })

  it('everything carries every section', () => {
    expect(all.filter(getPreset('everything').includesExtra)).toEqual(all)
  })
})
