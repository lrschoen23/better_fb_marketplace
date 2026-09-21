import { browser } from 'wxt/browser';

const KEY = 'debugCaptures';
const MAX = 8;

// Dev aid: keep the last few raw bodies that yielded listings, to build fixtures.
export async function saveCapture(body: string): Promise<void> {
  const cur = await loadCaptures();
  await browser.storage.local.set({ [KEY]: [body, ...cur].slice(0, MAX) });
}

export async function loadCaptures(): Promise<string[]> {
  const got = await browser.storage.local.get(KEY);
  return (got[KEY] as string[] | undefined) ?? [];
}
