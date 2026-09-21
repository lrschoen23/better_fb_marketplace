import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { exportAll, importAll, purgeStale } from '../lib/backup';
import { loadCaptures } from '../lib/debug/captures';
import { db } from '../lib/db';

// Trigger a browser download of `text`.
function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function DataPanel() {
  const stats = useLiveQuery(async () => {
    const all = await db.listings.toArray();
    const last = all.reduce((m, l) => Math.max(m, l.lastSeenAt), 0);
    return { total: all.length, mapped: all.filter((l) => l.lat !== null).length, last };
  }, [], { total: 0, mapped: 0, last: 0 });
  const [days, setDays] = useState(60);
  const [msg, setMsg] = useState('');

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      await importAll(db, JSON.parse(await file.text()));
      setMsg('Imported.');
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <section className="panel">
      <h3>Captured data</h3>
      <div>
        {stats.total} listings, {stats.mapped} with map position.
        <br />
        Last capture: {stats.last ? new Date(stats.last).toLocaleString() : 'never'}
      </div>
      <div className="muted">If this stays at 0 while you browse Marketplace, Facebook's response format probably changed.</div>
      <div className="row">
        <button onClick={async () => download('fbmp-backup.json', JSON.stringify(await exportAll(db)))}>Export</button>
        <input type="file" accept="application/json" onChange={(e) => onImport(e.target.files?.[0])} />
      </div>
      <div className="row">
        <input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        <button onClick={async () => setMsg(`Removed ${await purgeStale(db, days)} listings.`)}>Delete unseen for N days</button>
      </div>
      {import.meta.env.DEV && (
        <button onClick={async () => download('captures.fixture.json', JSON.stringify(await loadCaptures()))}>
          Download raw captures (dev)
        </button>
      )}
      {msg && <div className="muted">{msg}</div>}
    </section>
  );
}
