import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ContactRecord } from '../db/db'

export function useContacts() {
  return useLiveQuery(() => db.contacts.orderBy('metAt').reverse().toArray(), []) ?? []
}

export function useContact(id: number | undefined) {
  return useLiveQuery(() => (id === undefined ? undefined : db.contacts.get(id)), [id])
}

export async function saveContact(contact: Omit<ContactRecord, 'id'>): Promise<number> {
  const id = await db.contacts.add(contact)
  return id as number
}

export async function deleteContact(id: number): Promise<void> {
  await db.contacts.delete(id)
}
