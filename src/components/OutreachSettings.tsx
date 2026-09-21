import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db } from '../lib/db';
import { normalizeThreadUrl } from '../lib/outreach/links';

const HINT = 'Placeholders: {{title}} {{price}} {{url}} {{seller}} {{location}}';

export function OutreachSettings() {
  const templates = useLiveQuery(() => db.templates.toArray(), [], []);
  const contacts = useLiveQuery(() => db.contacts.toArray(), [], []);
  const [tLabel, setTLabel] = useState('');
  const [tBody, setTBody] = useState('Hi! Is "{{title}}" ({{price}}) still available?');
  const [cLabel, setCLabel] = useState('');
  const [cUrl, setCUrl] = useState('');
  const [err, setErr] = useState('');

  const addTemplate = async () => {
    if (!tLabel.trim() || !tBody.trim()) return;
    await db.templates.add({ label: tLabel.trim(), body: tBody });
    setTLabel('');
  };

  const addContact = async () => {
    const url = normalizeThreadUrl(cUrl);
    if (!url) return setErr('Paste a facebook.com or messenger.com thread URL.');
    setErr('');
    await db.contacts.add({ label: cLabel.trim() || 'Friend', threadUrl: url, lastUsedAt: 0 });
    setCLabel('');
    setCUrl('');
  };

  return (
    <div className="settings">
      <section className="panel">
        <h3>Message templates</h3>
        <input placeholder="Label" value={tLabel} onChange={(e) => setTLabel(e.target.value)} />
        <textarea rows={3} value={tBody} onChange={(e) => setTBody(e.target.value)} />
        <div className="muted">{HINT}</div>
        <button onClick={addTemplate}>Add template</button>
        {templates.map((t) => (
          <div className="row spread" key={t.id}>
            <span>
              <b>{t.label}</b>: {t.body}
            </span>
            <button onClick={() => db.templates.delete(t.id!)}>Delete</button>
          </div>
        ))}
      </section>
      <section className="panel">
        <h3>Friends</h3>
        <div className="muted">Open the chat in Messenger once and paste its URL here.</div>
        <input placeholder="Name" value={cLabel} onChange={(e) => setCLabel(e.target.value)} />
        <input placeholder="https://www.facebook.com/messages/t/..." value={cUrl} onChange={(e) => setCUrl(e.target.value)} />
        {err && <div className="error">{err}</div>}
        <button onClick={addContact}>Add friend</button>
        {contacts.map((c) => (
          <div className="row spread" key={c.id}>
            <span>{c.label}</span>
            <button onClick={() => db.contacts.delete(c.id!)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}
