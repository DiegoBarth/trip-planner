import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function FitBounds({ attractions }: { attractions: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (!attractions.length) return;

    const validPoints = attractions.filter(
      p => typeof p.lat === 'number' && typeof p.lng === 'number'
    );

    if (validPoints.length > 0) {
      const L = window.L;
      if (!L) return;

      const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [attractions, map]);

  return null;
}