import Dexie, { type EntityTable } from 'dexie'
import type { ProfileFields, Section } from '../lib/profileFields'

export interface ProfileRecord extends ProfileFields {
  id: 'me'
  includePhones: boolean
  /** User-made sections (e.g. "Kitchen"). Stored inside the profile record, so no schema bump. */
  sections?: Section[]
}

export interface GroupRecord {
  id?: number
  name: string
  createdAt: number
}

export interface ContactRecord extends ProfileFields {
  id?: number
  groupId: number | null
  note?: string
  metAt: number
}

class ParichayDB extends Dexie {
  profile!: EntityTable<ProfileRecord, 'id'>
  groups!: EntityTable<GroupRecord, 'id'>
  contacts!: EntityTable<ContactRecord, 'id'>

  constructor() {
    super('parichay')
    this.version(1).stores({
      profile: 'id',
      groups: '++id, name, createdAt',
      contacts: '++id, groupId, metAt, name',
    })
  }
}

export const db = new ParichayDB()

export const PROFILE_ID = 'me' as const
