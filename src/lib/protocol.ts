import type { RawListing } from './types';

// MAIN world -> ISOLATED world (window.postMessage envelope).
export const PAGE_TAG = 'fbmp:graphql';
export interface PageMessage {
  tag: typeof PAGE_TAG;
  body: string;
}

export const isPageMessage = (v: unknown): v is PageMessage =>
  typeof v === 'object' && v !== null && (v as PageMessage).tag === PAGE_TAG && typeof (v as PageMessage).body === 'string';

// ISOLATED world -> background (runtime messaging).
export type RuntimeMessage = { type: 'listings'; listings: RawListing[] };

// Cheap pre-check so we don't forward unrelated GraphQL traffic.
export const LIKELY_LISTING = /listing/i;

// Only these request URLs are inspected.
export const GRAPHQL_PATH = '/api/graphql';
