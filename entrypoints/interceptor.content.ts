import { installInterceptor } from '@/src/lib/intercept/install';
import { PAGE_TAG, type PageMessage } from '@/src/lib/protocol';

// Runs in the page's own JS world so it can see the page's fetch/XHR.
export default defineContentScript({
  matches: ['*://*.facebook.com/*'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    installInterceptor(window, (body) => {
      const msg: PageMessage = { tag: PAGE_TAG, body };
      window.postMessage(msg, window.location.origin);
    });
  },
});
