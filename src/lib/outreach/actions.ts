import { browser } from 'wxt/browser';
import type { Listing, Template } from '../types';
import { listingUrl, renderTemplate, templateVars } from './templates';

// Nothing is ever sent for the user: copy the text, open the page, they paste.
async function copyAndOpen(text: string, url: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard can fail without a user gesture; page still opens
  }
  await browser.tabs.create({ url });
}

export const messageSeller = (l: Listing, t: Template) =>
  copyAndOpen(renderTemplate(t.body, templateVars(l)), listingUrl(l.id));

export const shareWithContact = (l: Listing, note: string, threadUrl: string) =>
  copyAndOpen(`${note}\n${listingUrl(l.id)}`.trim(), threadUrl);
