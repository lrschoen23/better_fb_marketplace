import { useState } from 'react';
import { AreaManager } from '@/src/components/AreaManager';
import { DataPanel } from '@/src/components/DataPanel';
import { FilterPanel } from '@/src/components/FilterPanel';
import { ListingList } from '@/src/components/ListingList';
import { MapView } from '@/src/components/MapView';
import { OutreachSettings } from '@/src/components/OutreachSettings';
import { useVisibleListings } from '@/src/hooks/useVisibleListings';
import { useAppStore } from '@/src/state/useAppStore';

type Tab = 'browse' | 'messaging' | 'data';

export default function App() {
  const [tab, setTab] = useState<Tab>('browse');
  const { visible } = useVisibleListings();
  const areas = useAppStore((s) => s.areas);
  const setAreas = useAppStore((s) => s.setAreas);
  const setPicked = useAppStore((s) => s.setPicked);

  return (
    <div className="app">
      <header>
        <b>Better Marketplace</b>
        {(['browse', 'messaging', 'data'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </header>
      {/* Browse stays mounted so the map keeps its state across tabs. */}
      <main className="browse" hidden={tab !== 'browse'}>
        <aside>
          <FilterPanel />
          <AreaManager />
          <ListingList listings={visible} />
        </aside>
        <MapView listings={visible} areas={areas} onAreasChange={setAreas} onPick={setPicked} />
      </main>
      {tab === 'messaging' && <OutreachSettings />}
      {tab === 'data' && <DataPanel />}
    </div>
  );
}
