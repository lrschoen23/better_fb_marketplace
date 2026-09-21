import { GazetteerGeocoder, type GazetteerRow } from './gazetteer';
import type { Geocoder } from './geocoder';

let cached: Promise<Geocoder> | null = null;

// Lazy-load the bundled city list once. Swap this to change the geocoder.
export function getGeocoder(): Promise<Geocoder> {
  cached ??= import('../../data/gazetteer.json').then((m) => new GazetteerGeocoder(m.default as GazetteerRow[]));
  return cached;
}
