// Small tolerant readers. All field-name knowledge about Facebook lives in
// this file, so a schema change means editing one place.

export type Obj = Record<string, unknown>;

export const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

// Read a nested path; undefined if any hop is missing.
export function at(node: unknown, ...path: string[]): unknown {
  let cur: unknown = node;
  for (const key of path) {
    if (!isObj(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

// First path that yields a non-empty string.
export function firstString(node: unknown, ...paths: string[][]): string {
  for (const p of paths) {
    const v = at(node, ...p);
    if (typeof v === 'string' && v) return v;
  }
  return '';
}

// Depth-limited search for an object holding numeric latitude + longitude.
export function findCoords(node: unknown, depth = 5): { lat: number; lng: number } | null {
  if (!isObj(node) || depth < 0) return null;
  const { latitude, longitude } = node;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { lat: latitude, lng: longitude };
  }
  for (const v of Object.values(node)) {
    const hit = findCoords(v, depth - 1);
    if (hit) return hit;
  }
  return null;
}

export function toNumber(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
}
