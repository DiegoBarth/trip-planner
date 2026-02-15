import { useQuery } from '@tanstack/react-query'
import type { Attraction } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'
import type { Country } from '@/types/Attraction'
import { fetchOSRMRoute } from '@/services/osrmService'
import { legsToSegments } from '@/services/timelineService'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { TimelineSegment } from '@/types/Timeline'
import { QUERY_STALE_TIME_MS } from '@/config/constants'

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

async function fetchRoutesForDays(
   groupedByDay: Record<number, Attraction[]>,
   accommodations: Accommodation[]
): Promise<{
   routes: Record<number, [number, number][]>
   distances: Record<number, number>
   segmentsByDay: Record<number, (TimelineSegment | null)[]>
}> {
   const routes: Record<number, [number, number][]> = {}
   const distances: Record<number, number> = {}
   const segmentsByDay: Record<number, (TimelineSegment | null)[]> = {}

   for (const [dayNum, points] of Object.entries(groupedByDay)) {
      const validPoints = points.filter(isMappableAttraction)
      if (validPoints.length < 2) continue

      const sortedAttractions = [...validPoints].sort((a, b) => a.order - b.order)
      let routePoints = sortedAttractions.map((p) => ({ lat: p.lat!, lng: p.lng! }))

      if (accommodations.length > 0) {
         const stay = accommodations[0]
         routePoints = [
            { lat: stay.lat, lng: stay.lng },
            ...routePoints,
            { lat: stay.lat, lng: stay.lng },
         ]
      }

      const result = await fetchOSRMRoute(routePoints)
      if (!result) continue

      const dNum = Number(dayNum)
      routes[dNum] = result.path
      distances[dNum] = result.distanceKm

      // Legs: 0=acc->att1, 1=att1->att2, ..., n=att(n)->acc. Build segments including acc->att1 so Timeline (with addAccommodationToDay) can use cache.
      if (result.legs && result.legs.length >= sortedAttractions.length) {
         const legsIncludingAcc = result.legs.slice(0, sortedAttractions.length)
         const sortedWithAcc =
            accommodations.length > 0 && sortedAttractions[0]
               ? [accommodationToAttraction(accommodations[0], sortedAttractions[0]), ...sortedAttractions]
               : sortedAttractions
         segmentsByDay[dNum] = legsToSegments(sortedWithAcc, legsIncludingAcc)
      } else {
         const segmentCount =
            accommodations.length > 0 && sortedAttractions.length > 0
               ? sortedAttractions.length
               : Math.max(0, sortedAttractions.length - 1)
         segmentsByDay[dNum] = new Array(segmentCount).fill(null)
      }
   }

   return { routes, distances, segmentsByDay }
}

function groupedByDayKey(
   groupedByDay: Record<number, Attraction[]>,
   accommodations: Accommodation[]
): string {
   const dayKeys = Object.keys(groupedByDay)
      .map((d) => {
         const points = groupedByDay[Number(d)]
         return `${d}:${points.map((p) => `${p.id}-${p.lat}-${p.lng}-${p.order}`).join(',')}`
      })
      .sort()
      .join('|')
   const accKey = accommodations.length ? accommodations.map((a) => `${a.id}-${a.lat}-${a.lng}`).join(',') : ''
   return `${dayKeys};${accKey}`
}

export function useOSRMRoutesQuery(
   groupedByDay: Record<number, Attraction[]>,
   accommodations: Accommodation[]
) {
   const key = groupedByDayKey(groupedByDay, accommodations)
   const hasDays = Object.keys(groupedByDay).length > 0

   const query = useQuery({
      queryKey: ['osrm-routes', key],
      queryFn: () => fetchRoutesForDays(groupedByDay, accommodations),
      staleTime: QUERY_STALE_TIME_MS,
      enabled: hasDays,
   })

   const data = query.data
   return {
      routes: data?.routes ?? {},
      distances: data?.distances ?? {},
      segmentsByDay: data?.segmentsByDay ?? {},
      isRoutesLoading: query.isLoading,
      refetch: query.refetch,
   }
}
