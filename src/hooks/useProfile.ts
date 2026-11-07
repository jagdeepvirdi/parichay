import { useLiveQuery } from 'dexie-react-hooks'
import { db, PROFILE_ID, type ProfileRecord } from '../db/db'

const EMPTY_PROFILE: ProfileRecord = {
  id: PROFILE_ID,
  name: '',
  includePhones: true,
}

export function useProfile() {
  const profile = useLiveQuery(() => db.profile.get(PROFILE_ID), [])

  const save = async (fields: Partial<ProfileRecord>) => {
    const current = (await db.profile.get(PROFILE_ID)) ?? EMPTY_PROFILE
    await db.profile.put({ ...current, ...fields, id: PROFILE_ID })
  }

  return {
    profile: profile ?? EMPTY_PROFILE,
    loading: profile === undefined,
    save,
  }
}
