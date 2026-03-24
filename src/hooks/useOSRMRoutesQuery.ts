import { useQuery } from '@tanstack/react-query'
import { fetchOSRMRoute } from '@/services/osrmService'
import { legsToSegments } from '@/services/timelineService'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { TimelineSegment } from '@/types/Timeline'
import type { Attraction } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'
import type { Country } from '@/types/Attraction'

function accommodationToAttraction(acc: Accommodation, first: Attraction): Attraction {
  return {
    id: -999,
    name: acc.description,
    lat: acc.lat,
    lng: acc.lng,
    city: acc.city,
    region: first.region,
    country: acc.country as Country,
    order: 0,
    date: first.date,
    day: first.day,
    dayOfWeek: first.dayOfWeek,
    type: 'other',
    duration: 0,
    couplePrice: 0,
    priceInBRL: 0,
    currency: first.currency,
    visited: false,
    needsReservation: false,
    openingTime: undefined,
    closingTime: undefined,
    imageUrl: undefined,
  }
}

export type RoutesByDay = {
  path: [number, number][]
  distanceKm: number
  segments: (TimelineSegment | null)[]
}

function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase();
}

function accommodationForCity(accommodations: Accommodation[], city: string): Accommodation | undefined {
  const key = normalizeCityKey(city);
  return accommodations.find((a) => normalizeCityKey(a.city) === key);
}

/** Pick the city that appears most often in the day's attractions (avoids wrong accommodation when first attraction is in another city). */
function mainCityForDay(sortedAttractions: Attraction[]): string {
  const countByKey = new Map<string, number>();
  const cityByKey = new Map<string, string>();
  for (const a of sortedAttractions) {
    const key = normalizeCityKey(a.city);
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
    if (!cityByKey.has(key)) cityByKey.set(key, a.city);
  }
  let maxCount = 0;
  let mainKey = normalizeCityKey(sortedAttractions[0].city);
  for (const [key, count] of countByKey) {
    if (count > maxCount) {
      maxCount = count;
      mainKey = key;
    }
  }
  return cityByKey.get(mainKey) ?? sortedAttractions[0].city;
}

async function fetchRoutesForDays(
  groupedByDay: Record<number, Attraction[]>,
  accommodations: Accommodation[]
): Promise<{
  routes: Record<number, [number, number][]>
  distances: Record<number, number>
  segmentsByDay: Record<number, (TimelineSegment | null)[]>
}> {
  const entries = Object.entries(groupedByDay)
    .map(([dayNum, points]) => {
      const validPoints = points.filter(isMappableAttraction);
      if (validPoints.length < 2) return null;
      const sortedAttractions = [...validPoints].sort((a, b) => a.order - b.order);
      const city = mainCityForDay(sortedAttractions);
      const stay = accommodationForCity(accommodations, city);
      let routePoints = sortedAttractions.map((p) => ({ lat: p.lat!, lng: p.lng! }));
      if (stay?.lat != null && stay?.lng != null) {
        routePoints = [
          { lat: stay.lat, lng: stay.lng },
          ...routePoints,
          { lat: stay.lat, lng: stay.lng },
        ];
      }
      return { dayNum: Number(dayNum), routePoints, sortedAttractions, stay };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  const results = await Promise.all(
    entries.map(({ dayNum, routePoints }) =>
      fetchOSRMRoute(routePoints).then((result) => ({ dayNum, result }))
    )
  );

  const routes: Record<number, [number, number][]> = {};
  const distances: Record<number, number> = {};
  const segmentsByDay: Record<number, (TimelineSegment | null)[]> = {};

  for (let i = 0; i < results.length; i++) {
    const { dayNum, result } = results[i];
    const { sortedAttractions, stay } = entries[i];
    if (!result) continue;

    routes[dayNum] = result.path;
    distances[dayNum] = result.distanceKm;

    if (result.legs && result.legs.length >= sortedAttractions.length) {
      const legsIncludingAcc = result.legs.slice(0, sortedAttractions.length);
      const sortedWithAcc = stay != null && sortedAttractions[0]
        ? [accommodationToAttraction(stay, sortedAttractions[0]), ...sortedAttractions]
        : sortedAttractions;
      segmentsByDay[dayNum] = legsToSegments(sortedWithAcc, legsIncludingAcc);
    } else {
      const segmentCount = stay != null && sortedAttractions.length > 0
        ? sortedAttractions.length
        : Math.max(0, sortedAttractions.length - 1);
      segmentsByDay[dayNum] = new Array(segmentCount).fill(null);
    }
  }

  return { routes, distances, segmentsByDay };
}

function groupedByDayKey(groupedByDay: Record<number, Attraction[]>, accommodations: Accommodation[]): string {
  const dayKeys = Object.keys(groupedByDay)
    .map((d) => {
      const points = groupedByDay[Number(d)]
      return `${d}:${points.map((p) => `${p.id}-${p.lat}-${p.lng}-${p.order}`).join(',')}`
    })
    .sort()
    .join('|');

  const accKey = accommodations.length ? accommodations.map((a) => `${a.id}-${a.lat}-${a.lng}`).join(',') : '';

  return `${dayKeys};${accKey}`;
}

export type UseOSRMRoutesQueryOptions = {
  /** When false, the query does not run. Use to avoid duplicate requests: wait until attractions and accommodations are ready before enabling. */
  enabled?: boolean;
};

export function getOSRMRoutesQueryOptions(groupedByDay: Record<number, Attraction[]>, accommodations: Accommodation[]) {
  const key = groupedByDayKey(groupedByDay, accommodations);
  const hasDays = Object.keys(groupedByDay).length > 0;

  return {
    queryKey: ['osrm-routes', key] as const,
    queryFn: () => fetchRoutesForDays(groupedByDay, accommodations),
    staleTime: Infinity,
    enabled: hasDays,
  };
}

export function useOSRMRoutesQuery(
  groupedByDay: Record<number, Attraction[]>,
  accommodations: Accommodation[],
  opts?: UseOSRMRoutesQueryOptions
) {
  const options = getOSRMRoutesQueryOptions(groupedByDay, accommodations);
  const enabled = (opts?.enabled !== false) && options.enabled;

  const query = useQuery({
    ...options,
    enabled,
  });

  const data = query.data;

  return {
    routes: data?.routes ?? {},
    distances: data?.distances ?? {},
    segmentsByDay: data?.segmentsByDay ?? {},
    isRoutesLoading: query.isLoading,
    refetch: query.refetch,
  };
}