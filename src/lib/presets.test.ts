import { describe, expect, it } from 'vitest'
import { getPreset } from './presets'
import { newExtra } from './profileFields'

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
