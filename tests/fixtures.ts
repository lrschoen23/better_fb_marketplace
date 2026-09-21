// Synthetic listing node in the shape we believe Facebook uses.
export const listingNode = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  marketplace_listing_title: `Item ${id}`,
  listing_price: { amount: '150.00', currency: 'USD' },
  location: { reverse_geocode: { city: 'Portland', state: 'OR' } },
  primary_listing_photo: { image: { uri: 'https://img/x.jpg' } },
  marketplace_listing_seller: { name: 'Sam', id: '99' },
  is_sold: false,
  is_pending: false,
  ...extra,
});
