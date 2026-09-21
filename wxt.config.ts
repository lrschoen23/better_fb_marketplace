import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 3, // Firefox defaults to MV2 otherwise
  manifest: ({ browser }) => ({
    name: 'Better FB Marketplace',
    description: 'Filter Marketplace listings by a shape drawn on a map.',
    action: { default_title: 'Open Better Marketplace' },
    // Only what's needed: storage, tab control, and Facebook pages.
    permissions: ['storage', 'tabs'],
    host_permissions: ['*://*.facebook.com/*'],
    // Firefox only. Stable id keeps IndexedDB across reloads of the temp add-on.
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: { id: 'better-fb-marketplace@local', data_collection_permissions: { required: ['none'] } },
      },
    }),
  }),
});
