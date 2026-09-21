import type { Listing } from '../types';

export type SortKey = 'newest' | 'priceAsc' | 'priceDesc';

export interface ListingFilters {
  priceMin: number | null;
  priceMax: number | null;
  keyword: string;
  hideSold: boolean;
  hidePending: boolean;
  seenWithinDays: number | null; // by firstSeenAt; null = any time
  sort: SortKey;
}

export const defaultFilters: ListingFilters = {
  priceMin: null,
  priceMax: null,
  keyword: '',
  hideSold: true,
  hidePending: false,
  seenWithinDays: null,
  sort: 'newest',
};

const DAY = 86_400_000;

// Every non-spatial filter, as pure functions.
export function applyFilters(items: Listing[], f: ListingFilters, now = Date.now()): Listing[] {
  const words = f.keyword.toLowerCase().split(/\s+/).filter(Boolean);
  const out = items.filter((l) => {
    if (f.hideSold && l.isSold) return false;
    if (f.hidePending && l.isPending) return false;
    if (f.priceMin !== null && (l.priceAmount ?? 0) < f.priceMin) return false;
    if (f.priceMax !== null && (l.priceAmount ?? Infinity) > f.priceMax) return false;
    if (f.seenWithinDays !== null && now - l.firstSeenAt > f.seenWithinDays * DAY) return false;
    const title = l.title.toLowerCase();
    return words.every((w) => title.includes(w)); // all keywords must match
  });
  return sortListings(out, f.sort);
}

export function sortListings(items: Listing[], key: SortKey): Listing[] {
  const price = (l: Listing) => l.priceAmount ?? Infinity;
  const sorters: Record<SortKey, (a: Listing, b: Listing) => number> = {
    newest: (a, b) => b.firstSeenAt - a.firstSeenAt,
    priceAsc: (a, b) => price(a) - price(b),
    priceDesc: (a, b) => (b.priceAmount ?? -1) - (a.priceAmount ?? -1),
  };
  return [...items].sort(sorters[key]);
}
