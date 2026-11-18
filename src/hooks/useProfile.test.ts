import { renderHook, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, PROFILE_ID } from '../db/db'
import { useProfile } from './useProfile'

describe('useProfile', () => {
  beforeEach(async () => {
    await db.profile.clear()
  })

  it('finishes loading with an empty profile when nothing has been saved yet', async () => {
    const { result } = renderHook(() => useProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.profile.name).toBe('')
    expect(result.current.profile.includePhones).toBe(true)
  })

  it('returns the stored profile once one exists', async () => {
    await db.profile.put({ id: PROFILE_ID, name: 'Asha Rao', includePhones: false })
    const { result } = renderHook(() => useProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.profile.name).toBe('Asha Rao')
    expect(result.current.profile.includePhones).toBe(false)
  })

  it('picks up a profile saved after first load', async () => {
    const { result } = renderHook(() => useProfile())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save({ name: 'Asha Rao' })
    })

    await waitFor(() => expect(result.current.profile.name).toBe('Asha Rao'))
  })
})
