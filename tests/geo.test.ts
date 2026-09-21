import { describe, expect, it } from 'vitest';
import { filterByAreas } from '../src/lib/geo/areaFilter';
import { GazetteerGeocoder } from '../src/lib/geo/gazetteer';
import type { AreaShape } from '../src/lib/types';

// Square from (0,0) to (10,10) in lng/lat.
const square: AreaShape = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
};
const pt = (lat: number | null, lng: number | null) => ({ lat, lng });

describe('filterByAreas', () => {
  it('keeps inside, drops outside and unmapped', () => {
    const items = [pt(5, 5), pt(20, 5), pt(null, null)];
    expect(filterByAreas(items, [square])).toEqual([pt(5, 5)]);
  });
  it('counts the boundary as inside', () => {
    expect(filterByAreas([pt(0, 5)], [square])).toHaveLength(1);
  });
  it('returns everything when no areas are drawn', () => {
    const items = [pt(20, 20), pt(null, null)];
    expect(filterByAreas(items, [])).toEqual(items);
  });
});

describe('GazetteerGeocoder', () => {
  const g = new GazetteerGeocoder([
    ['Portland', 'OR', 'US', 45.5, -122.6, 650000],
    ['Portland', 'ME', 'US', 43.6, -70.2, 68000],
    ['São Paulo', 'SP', 'BR', -23.5, -46.6, 12000000],
  ]);
  it('matches city + state', async () => {
    expect(await g.lookup('Portland, ME')).toEqual({ lat: 43.6, lng: -70.2 });
  });
  it('falls back to the biggest same-named city', async () => {
    expect(await g.lookup('Portland')).toEqual({ lat: 45.5, lng: -122.6 });
  });
  it('ignores accents and case', async () => {
    expect(await g.lookup('sao paulo')).toMatchObject({ lat: -23.5 });
  });
  it('returns null for unknown places', async () => {
    expect(await g.lookup('Nowhereville, ZZ')).toBeNull();
  });
});
