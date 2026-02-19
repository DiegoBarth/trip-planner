import L from 'leaflet'
import type { MappableAttraction } from '@/types/MappableAttraction'

type MarkerType = 'attraction' | 'closed' | 'accommodation'

export function createCustomIcon(
  color: string,
  type: MarkerType = 'attraction',
  attraction?: MappableAttraction
) {
  let isClosedOnVisitDay = false;

  if (attraction) {
    isClosedOnVisitDay =
      !!attraction.closedDays &&
      !!attraction.dayOfWeek &&
      attraction.closedDays
        .split(',')
        .map(d => d.trim())
        .includes(attraction.dayOfWeek);
  }

  let fillColor = color;

  if (type === 'accommodation') {
    fillColor = '#111827';
  }

  if (type === 'closed' || isClosedOnVisitDay) {
    fillColor = '#ef4444';
  }

  const innerIcon =
    type === 'accommodation'
      ? `<text x="12" y="14" text-anchor="middle" font-size="10" fill="white">🏠</text>`
      : `<circle cx="12" cy="10" r="3" fill="white"></circle>`;

  return L.divIcon({
    html: `
      <div style="position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24"
          fill="${fillColor}" stroke="white" stroke-width="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          ${innerIcon}
        </svg>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 42]
  });
}