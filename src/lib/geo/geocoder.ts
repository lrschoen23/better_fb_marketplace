export interface LatLng {
  lat: number;
  lng: number;
}

// Swappable place-text -> coordinates lookup.
export interface Geocoder {
  lookup(locationText: string): Promise<LatLng | null>;
}
