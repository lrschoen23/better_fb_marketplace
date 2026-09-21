import type { RawListing } from '../types';
import { extractListings } from './extract';
import { parseRoots, stripGuard } from './ndjson';

// Public entry: raw response text in, normalized listings out.
export function parseResponseBody(body: string): RawListing[] {
  const byId = new Map<string, RawListing>();
  for (const root of parseRoots(stripGuard(body))) {
    for (const l of extractListings(root)) byId.set(l.id, l);
  }
  return [...byId.values()];
}
