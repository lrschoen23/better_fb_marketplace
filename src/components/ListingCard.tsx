import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db } from '../lib/db';
import { listingUrl, renderTemplate, templateVars } from '../lib/outreach/templates';
import { messageSeller, shareWithContact } from '../lib/outreach/actions';
import type { Listing } from '../lib/types';

export function ListingCard({ listing: l }: { listing: Listing }) {
  const templates = useLiveQuery(() => db.templates.toArray(), [], []);
  const contacts = useLiveQuery(() => db.contacts.toArray(), [], []);
  const [tplId, setTplId] = useState<number | ''>('');
  const [contactId, setContactId] = useState<number | ''>('');
  const tpl = templates.find((t) => t.id === tplId) ?? templates[0];
  const contact = contacts.find((c) => c.id === contactId) ?? contacts[0];

  return (
    <article className="card">
      {l.photoUrl && <img src={l.photoUrl} alt="" loading="lazy" />}
      <div className="card-body">
        <a href={listingUrl(l.id)} target="_blank" rel="noreferrer">
          {l.title}
        </a>
        <div className="muted">
          {l.priceAmount === null ? 'No price' : `$${l.priceAmount}`} · {l.locationText || 'Unknown location'}
          {l.lat === null && ' (unmapped)'}
          {l.isSold && ' · sold'}
          {l.isPending && ' · pending'}
        </div>
        <div className="row">
          <select value={tpl?.id ?? ''} onChange={(e) => setTplId(Number(e.target.value))} disabled={!templates.length}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button disabled={!tpl} onClick={() => tpl && messageSeller(l, tpl)} title={tpl ? renderTemplate(tpl.body, templateVars(l)) : ''}>
            Message seller
          </button>
        </div>
        <div className="row">
          <select value={contact?.id ?? ''} onChange={(e) => setContactId(Number(e.target.value))} disabled={!contacts.length}>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <button disabled={!contact} onClick={() => contact && shareWithContact(l, l.title, contact.threadUrl)}>
            Share
          </button>
        </div>
      </div>
    </article>
  );
}
