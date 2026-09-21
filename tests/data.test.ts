import { beforeEach, describe, expect, it } from 'vitest';
import { exportAll, importAll, purgeStale } from '../src/lib/backup';
import { AppDb } from '../src/lib/db';
import { applyFilters, defaultFilters } from '../src/lib/filters/listingFilters';
import type { Geocoder } from '../src/lib/geo/geocoder';
import { renderTemplate, templateVars } from '../src/lib/outreach/templates';
import { normalizeThreadUrl } from '../src/lib/outreach/links';
import { ingest } from '../src/lib/pipeline/ingest';
import type { Listing, RawListing } from '../src/lib/types';

const raw = (id: string, over: Partial<RawListing> = {}): RawListing => ({
  id, title: `Item ${id}`, priceAmount: 100, currency: 'USD', lat: null, lng: null,
  locationText: 'Portland, OR', photoUrl: '', sellerName: 'Sam', sellerId: '1',
  isSold: false, isPending: false, raw: {}, ...over,
});
const geocoder: Geocoder = { lookup: async (t) => (t.startsWith('Portland') ? { lat: 45.5, lng: -122.6 } : null) };

let db: AppDb;
beforeEach(() => {
  db = new AppDb(`t-${Math.random()}`); // fresh DB per test
});

describe('ingest', () => {
  it('geocodes missing coords and stores', async () => {
    await ingest([raw('1')], db, geocoder, 1000);
    expect(await db.listings.get('1')).toMatchObject({ lat: 45.5, lng: -122.6, firstSeenAt: 1000 });
  });
  it('keeps firstSeenAt but refreshes lastSeenAt on re-sight', async () => {
    await ingest([raw('1')], db, geocoder, 1000);
    await ingest([raw('1')], db, geocoder, 5000);
    expect(await db.listings.get('1')).toMatchObject({ firstSeenAt: 1000, lastSeenAt: 5000 });
  });
  it('keeps unmapped listings when geocoding fails', async () => {
    await ingest([raw('2', { locationText: 'Nowhere' })], db, geocoder);
    expect((await db.listings.get('2'))?.lat).toBeNull();
  });
});

describe('filters', () => {
  const L = (id: string, o: Partial<Listing> = {}): Listing => ({ ...raw(id), firstSeenAt: 0, lastSeenAt: 0, ...o });
  it('applies price, keyword, sold, and sort', () => {
    const items = [L('a', { title: 'Red Bike', priceAmount: 50 }), L('b', { title: 'Blue Bike', priceAmount: 200 }), L('c', { title: 'Bike', priceAmount: 10, isSold: true })];
    const out = applyFilters(items, { ...defaultFilters, keyword: 'bike', priceMax: 100, sort: 'priceAsc' });
    expect(out.map((l) => l.id)).toEqual(['a']); // c is sold, b too expensive
  });
  it('filters by first-seen recency', () => {
    const now = 10 * 86_400_000;
    const items = [L('new', { firstSeenAt: now - 1000 }), L('old', { firstSeenAt: 0 })];
    expect(applyFilters(items, { ...defaultFilters, seenWithinDays: 7 }, now).map((l) => l.id)).toEqual(['new']);
  });
});

describe('outreach', () => {
  it('renders known placeholders and leaves unknown ones', () => {
    const l: Listing = { ...raw('9'), firstSeenAt: 0, lastSeenAt: 0 };
    expect(renderTemplate('{{title}} {{price}} {{nope}}', templateVars(l))).toBe('Item 9 $100 {{nope}}');
  });
  it('only accepts facebook/messenger https URLs', () => {
    expect(normalizeThreadUrl('https://www.facebook.com/messages/t/123')).toBeTruthy();
    expect(normalizeThreadUrl('https://evil.com/facebook.com')).toBeNull();
    expect(normalizeThreadUrl('http://facebook.com/x')).toBeNull();
    expect(normalizeThreadUrl('not a url')).toBeNull();
  });
});

describe('backup', () => {
  it('round-trips and purges stale', async () => {
    await ingest([raw('1'), raw('2')], db, geocoder, 0);
    await db.templates.add({ label: 't', body: 'b' });
    const data = await exportAll(db);
    const db2 = new AppDb(`t-${Math.random()}`);
    await importAll(db2, data);
    expect(await db2.listings.count()).toBe(2);
    expect(await db2.templates.count()).toBe(1);
    expect(await purgeStale(db2, 1, 3 * 86_400_000)).toBe(2);
  });
});
