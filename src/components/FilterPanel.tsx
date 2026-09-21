import type { SortKey } from '../lib/filters/listingFilters';
import { useAppStore } from '../state/useAppStore';

// Empty input -> null, otherwise a number.
const num = (v: string) => (v === '' ? null : Number(v));

export function FilterPanel() {
  const { filters: f, setFilters, resetFilters } = useAppStore();
  return (
    <section className="panel">
      <h3>Filters</h3>
      <div className="row">
        <input type="number" placeholder="Min $" value={f.priceMin ?? ''} onChange={(e) => setFilters({ priceMin: num(e.target.value) })} />
        <input type="number" placeholder="Max $" value={f.priceMax ?? ''} onChange={(e) => setFilters({ priceMax: num(e.target.value) })} />
      </div>
      <input placeholder="Keywords in title" value={f.keyword} onChange={(e) => setFilters({ keyword: e.target.value })} />
      <div className="row">
        <select value={f.sort} onChange={(e) => setFilters({ sort: e.target.value as SortKey })}>
          <option value="newest">Newest seen</option>
          <option value="priceAsc">Price low-high</option>
          <option value="priceDesc">Price high-low</option>
        </select>
        <select
          value={f.seenWithinDays ?? ''}
          onChange={(e) => setFilters({ seenWithinDays: num(e.target.value) })}
        >
          <option value="">Any time</option>
          <option value="1">Last 24h</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>
      <label>
        <input type="checkbox" checked={f.hideSold} onChange={(e) => setFilters({ hideSold: e.target.checked })} /> Hide sold
      </label>
      <label>
        <input type="checkbox" checked={f.hidePending} onChange={(e) => setFilters({ hidePending: e.target.checked })} /> Hide pending
      </label>
      <button onClick={resetFilters}>Reset</button>
    </section>
  );
}
