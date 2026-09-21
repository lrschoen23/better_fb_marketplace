import type { Feature, Polygon, MultiPolygon } from 'geojson';

// Listing as extracted from a response, before we stamp times on it.
export interface RawListing {
  id: string;
  title: string;
  priceAmount: number | null;
  currency: string;
  lat: number | null;
  lng: number | null;
  locationText: string; // "City, ST" when known
  photoUrl: string;
  sellerName: string;
  sellerId: string;
  isSold: boolean;
  isPending: boolean;
  raw: unknown; // source node, kept so new fields can be mined later
}

// Persisted listing.
export interface Listing extends RawListing {
  firstSeenAt: number;
  lastSeenAt: number;
}

export type AreaShape = Feature<Polygon | MultiPolygon>;

export interface SavedArea {
  id?: number;
  name: string;
  shape: AreaShape;
  createdAt: number;
}

export interface Contact {
  id?: number;
  label: string;
  threadUrl: string;
  lastUsedAt: number;
}

export interface Template {
  id?: number;
  label: string;
  body: string;
}
