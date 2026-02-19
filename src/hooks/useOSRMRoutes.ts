import { useEffect, useState } from 'react'
import { fetchOSRMRoute } from '@/services/osrmService'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { Attraction } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'

export function useOSRMRoutes(groupedByDay: Record<number, Attraction[]>, accommodations: Accommodation[]) {
  const [routes, setRoutes] = useState<Record<number, [number, number][]>>({});
  const [distances, setDistances] = useState<Record<number, number>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadRoutes() {
      const newRoutes: Record<number, [number, number][]> = {};
      const newDistances: Record<number, number> = {};

      for (const [dayNum, points] of Object.entries(groupedByDay)) {
        const validPoints = points.filter(isMappableAttraction);

        if (validPoints.length < 2) continue;

        let routePoints = validPoints.map(p => ({
          lat: p.lat,
          lng: p.lng
        }));

        if (accommodations.length > 0) {
          const stay = accommodations[0];

          routePoints = [
            { lat: stay.lat, lng: stay.lng },
            ...routePoints,
            { lat: stay.lat, lng: stay.lng }
          ];
        }

        const result = await fetchOSRMRoute(routePoints);

        if (result) {
          newRoutes[Number(dayNum)] = result.path;
          newDistances[Number(dayNum)] = result.distanceKm;
        }
      }

      if (isMounted) {
        setRoutes(newRoutes);
        setDistances(newDistances);
      }
    }

    if (Object.keys(groupedByDay).length > 0) {
      loadRoutes();
    }

    return () => { isMounted = false; };
  }, [JSON.stringify(groupedByDay), JSON.stringify(accommodations)]);

  return { routes, distances }
}