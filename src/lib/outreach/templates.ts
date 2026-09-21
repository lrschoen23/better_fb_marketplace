import type { Listing } from '../types';

export const listingUrl = (id: string) => `https://www.facebook.com/marketplace/item/${id}/`;

// Values available to {{placeholders}} in a template body.
export function templateVars(l: Listing): Record<string, string> {
  return {
    title: l.title,
    price: l.priceAmount === null ? '' : `${l.currency === 'USD' ? '$' : l.currency + ' '}${l.priceAmount}`,
    url: listingUrl(l.id),
    seller: l.sellerName,
    location: l.locationText,
  };
}

// Replace {{name}}; unknown names are left visible so typos are obvious.
export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key: string) => (vars[key] ?? m));
}
