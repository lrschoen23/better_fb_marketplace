import { useMemo } from 'react';
import type { Listing } from '../lib/types';
import { useAppStore } from '../state/useAppStore';
import { ListingCard } from './ListingCard';

const CAP = 200; // render cap; the map still shows everything

export function ListingList({ listings }: { listings: Listing[] }) {
  const picked = useAppStore((s) => s.pickedIds);
  const setPicked = useAppStore((s) => s.setPicked);
  // If pins are picked on the map, narrow the list to them.
  const shown = useMemo(() => {
    if (!picked.length) return listings;
    const set = new Set(picked);
    return listings.filter((l) => set.has(l.id));
  }, [listings, picked]);

  return (
    <section className="list">
      <div className="muted list-head">
        {shown.length} listing{shown.length === 1 ? '' : 's'}
        {picked.length > 0 && <button onClick={() => setPicked([])}>Clear map selection</button>}
      </div>
      {shown.slice(0, CAP).map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
      {shown.length > CAP && <div className="muted">Showing first {CAP}. Narrow the filters to see more.</div>}
      {shown.length === 0 && <div className="muted">Nothing here yet. Browse Facebook Marketplace and listings will appear.</div>}
    </section>
  );
}
