import Dexie, { type EntityTable } from 'dexie';
import type { Contact, Listing, SavedArea, Template } from './types';

export class AppDb extends Dexie {
  listings!: EntityTable<Listing, 'id'>;
  areas!: EntityTable<SavedArea, 'id'>;
  contacts!: EntityTable<Contact, 'id'>;
  templates!: EntityTable<Template, 'id'>;

  constructor(name = 'better-fb-marketplace') {
    super(name);
    this.version(1).stores({
      listings: '&id, lastSeenAt, firstSeenAt, priceAmount',
      areas: '++id, name',
      contacts: '++id, label',
      templates: '++id, label',
    });
  }
}

// Shared instance for the extension; tests build their own via `new AppDb(name)`.
export const db = new AppDb();
