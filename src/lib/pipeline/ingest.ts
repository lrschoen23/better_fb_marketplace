import type { AppDb } from '../db';
import type { Geocoder } from '../geo/geocoder';
import type { Listing, RawListing } from '../types';

// Fill missing coordinates from the place text.
async function withCoords(raw: RawListing, geocoder: Geocoder): Promise<RawListing> {
  if (raw.lat !== null && raw.lng !== null) return raw;
  const hit = raw.locationText ? await geocoder.lookup(raw.locationText) : null;
  return hit ? { ...raw, lat: hit.lat, lng: hit.lng } : raw;
}

// Geocode, then upsert. Keeps firstSeenAt, refreshes lastSeenAt.
export async function ingest(raws: RawListing[], db: AppDb, geocoder: Geocoder, now = Date.now()): Promise<number> {
  if (!raws.length) return 0;
  const resolved = await Promise.all(raws.map((r) => withCoords(r, geocoder)));
  await db.transaction('rw', db.listings, async () => {
    const existing = await db.listings.bulkGet(resolved.map((r) => r.id));
    const rows: Listing[] = resolved.map((r, i) => ({
      ...r,
      firstSeenAt: existing[i]?.firstSeenAt ?? now,
      lastSeenAt: now,
    }));
    await db.listings.bulkPut(rows);
  });
  return resolved.length;
}
