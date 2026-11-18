import { useLiveQuery } from 'dexie-react-hooks'
import { db, PROFILE_ID, type ProfileRecord } from '../db/db'

const EMPTY_PROFILE: ProfileRecord = {
  id: PROFILE_ID,
  name: '',
  includePhones: true,
}

export function useProfile() {
  // A brand-new user has no profile row, so get() resolves to undefined. Map that
  // to EMPTY_PROFILE inside the query and use a sentinel default for "still
  // loading" — otherwise "no row yet" is indistinguishable from "loading" and
  // the Profile screen never renders.
  const result = useLiveQuery(
    () => db.profile.get(PROFILE_ID).then((record) => record ?? EMPTY_PROFILE),
    [],
    'loading' as const,
  )
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
