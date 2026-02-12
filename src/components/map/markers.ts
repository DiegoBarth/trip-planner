import L from 'leaflet'

export function createCustomIcon(color: string, isClosed: boolean) {
   return L.divIcon({
      html: `
      <div style="position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
          fill="${isClosed ? '#ef4444' : color}" stroke="white" stroke-width="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
      className: 'custom-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
   })
}
