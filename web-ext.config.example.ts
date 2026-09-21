// Copy to web-ext.config.ts and set your logged-in dev profile path.
import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  // Persistent profile so the Facebook login survives restarts.
  firefoxProfile: '/home/<you>/.config/mozilla/firefox/<id>.fbmp-dev',
  keepProfileChanges: true,
  startUrls: ['https://www.facebook.com/marketplace/'],
});
