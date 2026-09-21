import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../lib/db';
import { applyFilters } from '../lib/filters/listingFilters';
import { filterByAreas } from '../lib/geo/areaFilter';
import { useAppStore } from '../state/useAppStore';
import type { Listing } from '../lib/types';

// All stored listings after attribute filters, then the drawn shape.
export function useVisibleListings(): { all: Listing[]; visible: Listing[] } {
  const all = useLiveQuery(() => db.listings.toArray(), [], [] as Listing[]);
  const filters = useAppStore((s) => s.filters);
  const areas = useAppStore((s) => s.areas);
  const visible = useMemo(() => filterByAreas(applyFilters(all, filters), areas), [all, filters, areas]);
  return { all, visible };
}
