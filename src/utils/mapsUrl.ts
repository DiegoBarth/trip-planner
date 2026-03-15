import type { CountryFilterValue } from '@/types/Attraction'

/**
 * Returns the URL to open a location in a map app.
 * Uses Naver Map for South Korea (better local support), Google Maps otherwise.
 */
export function getMapsUrl(
  lat: number,
  lng: number,
  country: CountryFilterValue
): string {
  if (country === 'south-korea') {
    return `https://map.naver.com/v5/?c=${lng},${lat},15,0,0,0,dh`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Opens the map URL in a new tab (uses getMapsUrl with the given country).
 */
export function openInMaps(
  lat: number,
  lng: number,
  country: CountryFilterValue
): void {
  window.open(getMapsUrl(lat, lng, country), '_blank');
}
