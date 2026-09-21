import bbox from '@turf/bbox';
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { AreaShape, Listing } from '../types';

type Box = [number, number, number, number];

// Precompute bboxes once so most points fail a cheap check first.
export function compileAreas(areas: AreaShape[]) {
  const boxes: Box[] = areas.map((a) => bbox(a) as Box);
  return (lat: number, lng: number): boolean =>
    areas.some((area, i) => {
      const [minX, minY, maxX, maxY] = boxes[i]!;
      if (lng < minX || lng > maxX || lat < minY || lat > maxY) return false;
      return booleanPointInPolygon(point([lng, lat]), area); // boundary counts as inside
    });
}

// No areas = no restriction. Listings without coordinates can't match a shape.
export function filterByAreas<T extends Pick<Listing, 'lat' | 'lng'>>(items: T[], areas: AreaShape[]): T[] {
  if (!areas.length) return items;
  const inside = compileAreas(areas);
  return items.filter((l) => l.lat !== null && l.lng !== null && inside(l.lat, l.lng));
}
