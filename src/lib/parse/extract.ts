import type { RawListing } from '../types';
import { at, findCoords, firstString, isObj, toNumber, type Obj } from './readers';

const MAX_DEPTH = 40;

// Shape test, not a path test: id + title + price object with an amount.
// This survives Facebook renaming any enclosing container.
export function looksLikeListing(node: Obj): boolean {
  return (
    typeof node.id === 'string' &&
    /^\d+$/.test(node.id) &&
    !!firstString(node, ['marketplace_listing_title'], ['custom_title'], ['title']) &&
    isObj(node.listing_price) &&
    toNumber(node.listing_price.amount) !== null
  );
}

// Map a matched node onto our normalized shape.
export function normalize(node: Obj): RawListing {
  const coords = findCoords(node.location) ?? findCoords(node);
  const city = firstString(node, ['location', 'reverse_geocode', 'city'], ['location', 'city']);
  const state = firstString(node, ['location', 'reverse_geocode', 'state']);
  const locationText = [city, state].filter(Boolean).join(', ') || firstString(node, ['location_text', 'text']);
  return {
    id: node.id as string,
    title: firstString(node, ['marketplace_listing_title'], ['custom_title'], ['title']),
    priceAmount: toNumber(at(node, 'listing_price', 'amount')),
    currency: firstString(node, ['listing_price', 'currency']) || 'USD',
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    locationText,
    photoUrl: firstString(node, ['primary_listing_photo', 'image', 'uri'], ['listing_photos', '0', 'image', 'uri']),
    sellerName: firstString(node, ['marketplace_listing_seller', 'name']),
    sellerId: firstString(node, ['marketplace_listing_seller', 'id']),
    isSold: node.is_sold === true,
    isPending: node.is_pending === true,
    raw: node,
  };
}

// Walk any parsed JSON and collect every listing-shaped node.
export function extractListings(root: unknown): RawListing[] {
  const found = new Map<string, RawListing>();
  const walk = (node: unknown, depth: number) => {
    if (depth > MAX_DEPTH) return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
    if (!isObj(node)) return;
    if (looksLikeListing(node)) {
      found.set(node.id as string, normalize(node)); // don't descend into a match
      return;
    }
    for (const v of Object.values(node)) walk(v, depth + 1);
  };
  walk(root, 0);
  return [...found.values()];
}
