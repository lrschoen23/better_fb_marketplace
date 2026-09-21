import type { AppDb } from './db';

const VERSION = 1;
const DAY = 86_400_000;

// Everything user-owned, as one JSON-able object.
export async function exportAll(db: AppDb) {
  const [listings, areas, contacts, templates] = await Promise.all([
    db.listings.toArray(),
    db.areas.toArray(),
    db.contacts.toArray(),
    db.templates.toArray(),
  ]);
  return { version: VERSION, listings, areas, contacts, templates };
}

// Merge a backup in. Ids are reassigned for auto-increment tables.
export async function importAll(db: AppDb, data: Awaited<ReturnType<typeof exportAll>>): Promise<void> {
  if (data?.version !== VERSION) throw new Error('Unsupported backup version');
  const strip = <T extends { id?: number }>(rows: T[]) => rows.map(({ id: _id, ...rest }) => rest);
  await db.transaction('rw', db.listings, db.areas, db.contacts, db.templates, async () => {
    await db.listings.bulkPut(data.listings ?? []);
    await db.areas.bulkAdd(strip(data.areas ?? []) as never);
    await db.contacts.bulkAdd(strip(data.contacts ?? []) as never);
    await db.templates.bulkAdd(strip(data.templates ?? []) as never);
  });
}

// Delete listings not seen for `days`. Returns how many were removed.
export async function purgeStale(db: AppDb, days: number, now = Date.now()): Promise<number> {
  return db.listings.where('lastSeenAt').below(now - days * DAY).delete();
}
