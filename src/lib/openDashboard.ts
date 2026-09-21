import { browser } from 'wxt/browser';

// Focus the dashboard tab if open, else create it.
export async function openDashboard(): Promise<void> {
  const url = browser.runtime.getURL('/dashboard.html' as never);
  const [existing] = await browser.tabs.query({ url });
  if (existing?.id !== undefined) {
    await browser.tabs.update(existing.id, { active: true });
    if (existing.windowId !== undefined) await browser.windows.update(existing.windowId, { focused: true });
  } else {
    await browser.tabs.create({ url });
  }
}
