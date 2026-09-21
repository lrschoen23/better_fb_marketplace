import type { Geocoder, LatLng } from './geocoder';

// Row: [name, admin1, countryCode, lat, lng, population]
export type GazetteerRow = [string, string, string, number, number, number];

type Entry = { pop: number; at: LatLng };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

// Keep the most populous place per key.
function put(map: Map<string, Entry>, key: string, entry: Entry) {
  const prev = map.get(key);
  if (!prev || entry.pop > prev.pop) map.set(key, entry);
}

// Offline geocoder over a bundled city list (GeoNames). No network, no limits.
export class GazetteerGeocoder implements Geocoder {
  private exact = new Map<string, Entry>(); // "city|state"
  private loose = new Map<string, Entry>(); // "city" only

  constructor(rows: GazetteerRow[]) {
    for (const [name, admin1, , lat, lng, pop] of rows) {
      const entry = { pop, at: { lat, lng } };
      const city = norm(name);
      put(this.exact, `${city}|${norm(admin1)}`, entry);
      put(this.loose, city, entry);
    }
  }

  async lookup(locationText: string): Promise<LatLng | null> {
    const [cityPart, statePart] = locationText.split(',').map((s) => s.trim());
    if (!cityPart) return null;
    const city = norm(cityPart);
    if (statePart) {
      const hit = this.exact.get(`${city}|${norm(statePart)}`);
      if (hit) return hit.at;
    }
    return this.loose.get(city)?.at ?? null; // else biggest same-named city
  }
}
