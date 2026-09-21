import { browser } from 'wxt/browser';
import type { StateStorage } from 'zustand/middleware';

// zustand persist adapter backed by extension storage.
export const extensionStorage: StateStorage = {
  async getItem(key) {
    const got = await browser.storage.local.get(key);
    return (got[key] as string | undefined) ?? null;
  },
  async setItem(key, value) {
    await browser.storage.local.set({ [key]: value });
  },
  async removeItem(key) {
    await browser.storage.local.remove(key);
  },
};
