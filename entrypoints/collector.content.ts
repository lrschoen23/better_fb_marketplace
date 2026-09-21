import { browser } from 'wxt/browser';
import { saveCapture } from '@/src/lib/debug/captures';
import { parseResponseBody } from '@/src/lib/parse';
import { isPageMessage, type RuntimeMessage } from '@/src/lib/protocol';

// Isolated world: receives bodies from the interceptor, parses, forwards.
export default defineContentScript({
  matches: ['*://*.facebook.com/*'],
  runAt: 'document_start',
  main() {
    window.addEventListener('message', (e) => {
      if (e.source !== window || !isPageMessage(e.data)) return;
      const listings = parseResponseBody(e.data.body);
      if (!listings.length) return;
      if (import.meta.env.DEV) void saveCapture(e.data.body);
      const msg: RuntimeMessage = { type: 'listings', listings };
      void browser.runtime.sendMessage(msg).catch(() => {}); // background may be asleep; ignore
    });
  },
});
