import { useLiveQuery } from 'dexie-react-hooks'
import { db, PROFILE_ID, type ProfileRecord } from '../db/db'

const EMPTY_PROFILE: ProfileRecord = {
  id: PROFILE_ID,
  name: '',
  includePhones: true,
}

export function useProfile() {
  const result = useLiveQuery(() => db.profile.get(PROFILE_ID).then((record) => record ?? EMPTY_PROFILE), [], 'loading' as const)
  const loading = result === 'loading'
  const profile = loading ? EMPTY_PROFILE : result

  const save = async (fields: Partial<ProfileRecord>) => {
    const current = (await db.profile.get(PROFILE_ID)) ?? EMPTY_PROFILE
    await db.profile.put({ ...current, ...fields, id: PROFILE_ID })
  }

  return {
    profile,
    loading,
    save,
  }
}
