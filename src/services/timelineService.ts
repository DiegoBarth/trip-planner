import type { Attraction } from '@/types/Attraction'
import type { TimelineSegment, TimelineConflict, TimelineDay } from '@/types/Timeline'
import { fetchOSRMRoute } from './osrmService'

/**
 * One OSRM request for the whole day: all coordinates in order.
 * Returns segments between consecutive attractions (null when no coords or no route).
 */
async function fetchSegmentsForDay(sortedAttractions: Attraction[]): Promise<(TimelineSegment | null)[]> {
   const n = sortedAttractions.length
   const segments: (TimelineSegment | null)[] = new Array(n - 1)

   const withCoords = sortedAttractions
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => a.lat != null && a.lng != null) as { a: Attraction; i: number }[]

   const coords = withCoords.map(({ a }) => ({ lat: a.lat!, lng: a.lng! }))

   if (coords.length < 2) {
      return segments.fill(null)
   }

   const result = await fetchOSRMRoute(coords)
   if (!result?.legs || result.legs.length === 0) {
      return segments.fill(null)
   }

   const legs = result.legs

   for (let i = 0; i < n - 1; i++) {
      const from = sortedAttractions[i]
      const to = sortedAttractions[i + 1]
      if (!from.lat || !from.lng || !to.lat || !to.lng) {
         segments[i] = null
         continue
      }
      const legIndex = withCoords.findIndex((w) => w.i === i)
      if (legIndex < 0 || legIndex + 1 >= withCoords.length || withCoords[legIndex + 1].i !== i + 1) {
         segments[i] = null
         continue
      }
      const leg = legs[legIndex]
      const travelMode: 'walking' | 'transit' = leg.distanceKm > 3 ? 'transit' : 'walking'
      // Tempo a pé: ~5 km/h. O OSRM público às vezes devolve duração irreal (ex.: 2.8 km em 5 min).
      const durationMinutes =
         travelMode === 'walking'
            ? Math.ceil((leg.distanceKm / 5) * 60)
            : leg.durationMinutes
      segments[i] = {
         from,
         to,
         distanceKm: leg.distanceKm,
         durationMinutes,
         travelMode,
      }
   }

   return segments
}

/**
 * Calculate travel time between two attractions using OSRM (single leg).
 * Used when only two points or as fallback.
 */
export async function calculateTravelSegment(
   from: Attraction,
   to: Attraction
): Promise<TimelineSegment | null> {
   if (!from.lat || !from.lng || !to.lat || !to.lng) {
      return null
   }

   const result = await fetchOSRMRoute([
      { lat: from.lat, lng: from.lng },
      { lat: to.lat, lng: to.lng }
   ])

   if (!result) return null

   const travelMode = result.distanceKm > 5 ? 'transit' : 'walking'
   const durationMinutes =
      travelMode === 'walking'
         ? Math.ceil((result.distanceKm / 5) * 60)
         : (result.legs?.[0]?.durationMinutes ?? Math.ceil((result.distanceKm / 5) * 60))

   return {
      from,
      to,
      durationMinutes,
      distanceKm: result.distanceKm,
      travelMode,
   }
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
   const [hours, minutes] = time.split(':').map(Number)
   return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
   const hours = Math.floor(minutes / 60)
   const mins = minutes % 60
   return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Calculate estimated time for attraction visit
 */
function getAttractionDuration(attraction: Attraction): number {
   // Use attraction duration if provided
   // If duration is explicitly 0, return 0 (e.g., for accommodations that are just starting points)
   // Otherwise default to 60 minutes
   if (attraction.duration === 0) return 0
   return attraction.duration || 60
}

/**
 * Detect scheduling conflicts for a timeline day
 */
function detectConflicts(
   attractions: Attraction[],
   segments: (TimelineSegment | null)[]
): TimelineConflict[] {
   const conflicts: TimelineConflict[] = []
   let currentTime = timeToMinutes('09:00') // Default start time

   for (let i = 0; i < attractions.length; i++) {
      const attraction = attractions[i]
      const segment = i > 0 ? segments[i - 1] : null // Travel TO this attraction (from i-1 to i)

      // Add travel time from previous attraction
      if (segment) {
         currentTime += segment.durationMinutes
      }

      const arrivalTime = currentTime
      const arrivalTimeStr = minutesToTime(arrivalTime)
      const duration = getAttractionDuration(attraction)
      const departureTime = currentTime + duration
      const departureTimeStr = minutesToTime(departureTime)

      // Check if attraction has opening hours
      if (attraction.openingTime && attraction.closingTime) {
         const openingMinutes = timeToMinutes(attraction.openingTime)
         const closingMinutes = timeToMinutes(attraction.closingTime)

         // Arriving before opening
         if (arrivalTime < openingMinutes) {
            conflicts.push({
               attractionId: attraction.id,
               type: 'late-arrival',
               message: `Chegada às ${arrivalTimeStr}, mas abre às ${attraction.openingTime}`,
               severity: 'warning'
            })
            currentTime = openingMinutes // Wait until opening
         }

         // Arriving after closing or staying past closing
         if (arrivalTime >= closingMinutes) {
            conflicts.push({
               attractionId: attraction.id,
               type: 'closed',
               message: `Chegada às ${arrivalTimeStr}, mas fecha às ${attraction.closingTime}`,
               severity: 'error'
            })
         } else if (departureTime > closingMinutes) {
            conflicts.push({
               attractionId: attraction.id,
               type: 'overlap',
               message: `Saída prevista ${departureTimeStr}, mas fecha às ${attraction.closingTime}`,
               severity: 'warning'
            })
         }
      }

      // Check if too many hours in one day (more than 12 hours)
      if (currentTime > timeToMinutes('21:00')) {
         conflicts.push({
            attractionId: attraction.id,
            type: 'rush',
            message: `Dia muito extenso - chegada prevista às ${arrivalTimeStr}`,
            severity: 'warning'
         })
      }

      currentTime = departureTime
   }

   return conflicts
}

/**
 * Build timeline for a specific day
 */
export async function buildDayTimeline(
   attractions: Attraction[]
): Promise<TimelineDay | null> {
   if (attractions.length === 0) return null

   // Sort attractions by order
   const sortedAttractions = [...attractions].sort((a, b) => a.order - b.order)

   const segments = await fetchSegmentsForDay(sortedAttractions)
   const totalDistance = segments.reduce((sum, s) => sum + (s?.distanceKm ?? 0), 0)
   const totalTravelTime = segments.reduce((sum, s) => sum + (s?.durationMinutes ?? 0), 0)

   // Detect conflicts
   const conflicts = detectConflicts(sortedAttractions, segments)

   // Calculate start and end times
   const startTime = '09:00';
   let currentMinutes = timeToMinutes(startTime);
   const arrivalTimes: string[] = [];
   const departureTimes: string[] = [];

   for (let i = 0; i < sortedAttractions.length; i++) {
      if (i === 0) {
         arrivalTimes.push(minutesToTime(currentMinutes));
      } else {
         const prevDeparture = departureTimes[i - 1] ? timeToMinutes(departureTimes[i - 1]) : currentMinutes;
         const travel = segments[i - 1]?.durationMinutes || 0;
         arrivalTimes.push(minutesToTime(prevDeparture + travel));
         currentMinutes = prevDeparture + travel;
      }
      const duration = getAttractionDuration(sortedAttractions[i]);
      departureTimes.push(minutesToTime(currentMinutes + duration));
      currentMinutes = currentMinutes + duration;
   }

   const endTime = departureTimes[departureTimes.length - 1] || startTime;

   const attractionsWithTimes = sortedAttractions.map((a, idx) => ({
      ...a,
      arrivalTime: arrivalTimes[idx],
      departureTime: departureTimes[idx],
   }));

   return {
      date: sortedAttractions[0].date,
      dayNumber: sortedAttractions[0].day,
      attractions: attractionsWithTimes,
      segments,
      conflicts,
      totalDistance,
      totalTravelTime,
      startTime,
      endTime,
   };
}

/**
 * Calculate estimated arrival time at an attraction
 */
export function calculateArrivalTime(
   attractions: Attraction[],
   segments: TimelineSegment[],
   index: number,
   startTime: string = '09:00'
): string {
   let currentTime = timeToMinutes(startTime)

   for (let i = 0; i < index; i++) {
      // Add travel time TO this attraction
      const segment = segments[i]
      if (segment) {
         currentTime += segment.durationMinutes
      }

      // Add duration AT this attraction
      currentTime += getAttractionDuration(attractions[i])
   }

   // Add final travel time TO the target attraction
   if (segments[index]) {
      currentTime += segments[index].durationMinutes
   }

   return minutesToTime(currentTime)
}