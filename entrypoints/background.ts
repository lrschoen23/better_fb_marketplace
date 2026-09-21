import { browser } from 'wxt/browser';
import { db } from '@/src/lib/db';
import { getGeocoder } from '@/src/lib/geo/defaultGeocoder';
import { openDashboard } from '@/src/lib/openDashboard';
import { ingest } from '@/src/lib/pipeline/ingest';
import type { RuntimeMessage } from '@/src/lib/protocol';

export default defineBackground(() => {
  // Toolbar icon opens the dashboard.
  browser.action.onClicked.addListener(() => void openDashboard());

  // Listings from content scripts -> geocode -> DB.
  browser.runtime.onMessage.addListener((msg: RuntimeMessage) => {
    if (msg?.type !== 'listings') return;
    void getGeocoder().then((g) => ingest(msg.listings, db, g));
  });
});
