import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function useGroups() {
  const groups = useLiveQuery(() => db.groups.orderBy('name').toArray(), []) ?? []

  /** Finds an existing group by (trimmed, case-sensitive) name or creates
   * one. Returns its id, or undefined for a blank name. */
  const addGroup = async (name: string): Promise<number | undefined> => {
    const trimmed = name.trim()
    if (!trimmed) return undefined
    const existing = await db.groups.where('name').equals(trimmed).first()
    if (existing?.id !== undefined) return existing.id
    return db.groups.add({ name: trimmed, createdAt: Date.now() })
  }

  return { groups, addGroup }
}
