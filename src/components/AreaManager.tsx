import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db } from '../lib/db';
import { useAppStore } from '../state/useAppStore';

// Save the shapes on the map under a name; reload them later.
export function AreaManager() {
  const areas = useAppStore((s) => s.areas);
  const setAreas = useAppStore((s) => s.setAreas);
  const saved = useLiveQuery(() => db.areas.toArray(), [], []);
  const [name, setName] = useState('');

  const save = async () => {
    if (!name.trim() || !areas.length) return;
    // One saved row per shape; multiple shapes get numbered.
    await db.areas.bulkAdd(
      areas.map((shape, i) => ({
        name: areas.length > 1 ? `${name.trim()} ${i + 1}` : name.trim(),
        shape,
        createdAt: Date.now(),
      })),
    );
    setName('');
  };

  return (
    <section className="panel">
      <h3>Saved areas</h3>
      <div className="row">
        <input placeholder="Name current shape" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={save} disabled={!name.trim() || !areas.length}>
          Save
        </button>
      </div>
      {saved.map((a) => (
        <div className="row spread" key={a.id}>
          <span>{a.name}</span>
          <span>
            <button onClick={() => setAreas([a.shape])}>Load</button>
            <button onClick={() => db.areas.delete(a.id!)}>Delete</button>
          </span>
        </div>
      ))}
    </section>
  );
}
