import { fetchOSRMRoute, type OSRMLeg } from '@/services/osrmService'
import { PERIOD_START } from '@/config/constants'
import type { Attraction } from '@/types/Attraction'
import type { TimelineSegment, TimelineConflict, TimelineDay, FreeTimeBlock } from '@/types/Timeline'

/**
 * Convert OSRM legs + sorted attractions to timeline segments (for use with cached route data).
 */
export function legsToSegments(sortedAttractions: Attraction[], legs: OSRMLeg[]): (TimelineSegment | null)[] {
  const n = sortedAttractions.length;
  const segments: (TimelineSegment | null)[] = new Array(n - 1);

  const withCoords = sortedAttractions.map((a, i) => ({ a, i }))
    .filter(({ a }) => a.lat != null && a.lng != null) as { a: Attraction; i: number }[];

  if (withCoords.length < 2 || legs.length === 0) {
    return segments.fill(null);
  }

  for (let i = 0; i < n - 1; i++) {
    const from = sortedAttractions[i];
    const to = sortedAttractions[i + 1];

    if (!from.lat || !from.lng || !to.lat || !to.lng) {
      segments[i] = null;

      continue;
    }

    const legIndex = withCoords.findIndex((w) => w.i === i);

    if (legIndex < 0 || legIndex + 1 >= withCoords.length || withCoords[legIndex + 1].i !== i + 1 || !legs[legIndex]) {
      segments[i] = null;

      continue;
    }

    const leg = legs[legIndex];
    const travelMode: 'walking' | 'transit' = leg.distanceKm > 3 ? 'transit' : 'walking';
    const durationMinutes = travelMode === 'walking' ? Math.ceil((leg.distanceKm / 5) * 60) : leg.durationMinutes;

    segments[i] = {
      from,
      to,
      distanceKm: leg.distanceKm,
      durationMinutes,
      travelMode,
    };
  }

  return segments;
}

/**
 * One OSRM request for the whole day: all coordinates in order.
 * Returns segments between consecutive attractions (null when no coords or no route).
 */
async function fetchSegmentsForDay(sortedAttractions: Attraction[]): Promise<(TimelineSegment | null)[]> {
  const n = sortedAttractions.length;
  const segments: (TimelineSegment | null)[] = new Array(n - 1);

  const withCoords = sortedAttractions.map((a, i) => ({ a, i }))
    .filter(({ a }) => a.lat != null && a.lng != null) as { a: Attraction; i: number }[];

  const coords = withCoords.map(({ a }) => ({ lat: a.lat!, lng: a.lng! }));

  if (coords.length < 2) {
    return segments.fill(null);
  }

  const result = await fetchOSRMRoute(coords);

  if (!result?.legs || result.legs.length === 0) {
    return segments.fill(null);
  }

  const legs = result.legs;

  for (let i = 0; i < n - 1; i++) {
    const from = sortedAttractions[i];
    const to = sortedAttractions[i + 1];

    if (!from.lat || !from.lng || !to.lat || !to.lng) {
      segments[i] = null;

      continue;
    }
    const legIndex = withCoords.findIndex((w) => w.i === i);

    if (legIndex < 0 || legIndex + 1 >= withCoords.length || withCoords[legIndex + 1].i !== i + 1) {
      segments[i] = null;

      continue;
    }

    const leg = legs[legIndex];
    const travelMode: 'walking' | 'transit' = leg.distanceKm > 3 ? 'transit' : 'walking';
    const durationMinutes = travelMode === 'walking' ? Math.ceil((leg.distanceKm / 5) * 60) : leg.durationMinutes;

    segments[i] = {
      from,
      to,
      distanceKm: leg.distanceKm,
      durationMinutes,
      travelMode,
    };
  }

  return segments;
}

/**
 * Calculate travel time between two attractions using OSRM (single leg).
 * Used when only two points or as fallback.
 */
export async function calculateTravelSegment(from: Attraction, to: Attraction): Promise<TimelineSegment | null> {
  if (!from.lat || !from.lng || !to.lat || !to.lng) {
    return null;
  }

  const result = await fetchOSRMRoute([
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng }
  ]);

  if (!result) return null;

  const travelMode = result.distanceKm > 5 ? 'transit' : 'walking';
  const durationMinutes = travelMode === 'walking'
    ? Math.ceil((result.distanceKm / 5) * 60)
    : (result.legs?.[0]?.durationMinutes ?? Math.ceil((result.distanceKm / 5) * 60));

  return {
    from,
    to,
    durationMinutes,
    distanceKm: result.distanceKm,
    travelMode,
  };
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate estimated time for attraction visit
 */
function getAttractionDuration(attraction: Attraction): number {
  // Use attraction duration if provided
  // If duration is explicitly 0, return 0 (e.g., for accommodations that are just starting points)
  // Otherwise default to 60 minutes
  if (attraction.duration === 0) return 0;

  return attraction.duration || 60;
}

/**
 * Detect scheduling conflicts using final arrival/departure times (e.g. after ideal period / free time).
 * Use this so conflicts reflect the actual schedule shown to the user (and in the PDF).
 */
function detectConflictsFromTimes(
  attractions: Attraction[],
  arrivalTimes: string[],
  departureTimes: string[]
): TimelineConflict[] {
  const conflicts: TimelineConflict[] = [];

  for (let i = 0; i < attractions.length; i++) {
    const attraction = attractions[i];
    const arrivalTime = timeToMinutes(arrivalTimes[i] ?? '00:00');
    const departureTime = timeToMinutes(departureTimes[i] ?? '00:00');
    const arrivalTimeStr = arrivalTimes[i] ?? '00:00';
    const departureTimeStr = departureTimes[i] ?? '00:00';

    if (attraction.openingTime && attraction.closingTime) {
      const openingMinutes = timeToMinutes(attraction.openingTime);
      const closingMinutes = timeToMinutes(attraction.closingTime);

      if (arrivalTime < openingMinutes) {
        conflicts.push({
          attractionId: attraction.id,
          type: 'late-arrival',
          message: `Chegada às ${arrivalTimeStr}, mas abre às ${attraction.openingTime}`,
          severity: 'warning'
        });
      }

      if (arrivalTime >= closingMinutes) {
        conflicts.push({
          attractionId: attraction.id,
          type: 'closed',
          message: `Chegada às ${arrivalTimeStr}, mas fecha às ${attraction.closingTime}`,
          severity: 'error'
        });
      } else if (departureTime > closingMinutes) {
        conflicts.push({
          attractionId: attraction.id,
          type: 'overlap',
          message: `Saída prevista ${departureTimeStr}, mas fecha às ${attraction.closingTime}`,
          severity: 'warning'
        });
      }
    }

    if (arrivalTime > timeToMinutes('21:00')) {
      conflicts.push({
        attractionId: attraction.id,
        type: 'rush',
        message: `Dia muito extenso - chegada prevista às ${arrivalTimeStr}`,
        severity: 'warning'
      });
    }
  }

  return conflicts;
}

/**
 * Compute arrival/departure times from a given start time (sync, no OSRM).
 */
function computeTimesFromStartTime(
  sortedAttractions: Attraction[],
  segments: (TimelineSegment | null)[],
  startTime: string
): { arrivalTimes: string[]; departureTimes: string[]; endTime: string } {
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
  return { arrivalTimes, departureTimes, endTime };
}

/**
 * Apply ideal period: if an attraction has idealPeriod and we'd arrive before that period starts,
 * insert a free time block and set arrival to the period start; then recompute subsequent times.
 * Returns the list of free time blocks to show in the timeline.
 */
function applyIdealPeriods(
  sortedAttractions: Attraction[],
  segments: (TimelineSegment | null)[],
  arrivalTimes: string[],
  departureTimes: string[]
): FreeTimeBlock[] {
  const freeTimeBlocks: FreeTimeBlock[] = [];
  const n = sortedAttractions.length;

  for (let i = 0; i < n; i++) {
    const a = sortedAttractions[i];
    const idealPeriod = a.idealPeriod as keyof typeof PERIOD_START | undefined;
    if (!idealPeriod || idealPeriod === 'full-day') continue;
    const periodStart = PERIOD_START[idealPeriod];
    if (!periodStart) continue;

    const arrivalM = timeToMinutes(arrivalTimes[i]);
    const periodStartM = timeToMinutes(periodStart);
    if (arrivalM >= periodStartM) continue;

    freeTimeBlocks.push({
      beforeAttractionIndex: i,
      startTime: arrivalTimes[i],
      endTime: periodStart,
    });
    arrivalTimes[i] = periodStart;
    const duration = getAttractionDuration(a);
    departureTimes[i] = minutesToTime(periodStartM + duration);

    for (let j = i + 1; j < n; j++) {
      const prevDep = timeToMinutes(departureTimes[j - 1]);
      const travel = segments[j - 1]?.durationMinutes || 0;
      arrivalTimes[j] = minutesToTime(prevDep + travel);
      const dur = getAttractionDuration(sortedAttractions[j]);
      departureTimes[j] = minutesToTime(prevDep + travel + dur);
    }
  }
  return freeTimeBlocks;
}

/**
 * Total wait time (minutes) when arriving before opening at attractions that have openingTime.
 */
function totalWaitMinutes(
  sortedAttractions: Attraction[],
  segments: (TimelineSegment | null)[],
  startTime: string
): number {
  const { arrivalTimes } = computeTimesFromStartTime(sortedAttractions, segments, startTime);
  let total = 0;
  for (let i = 0; i < sortedAttractions.length; i++) {
    const a = sortedAttractions[i];
    if (a.openingTime) {
      const arrivalM = timeToMinutes(arrivalTimes[i]);
      const openingM = timeToMinutes(a.openingTime);
      if (arrivalM < openingM) total += openingM - arrivalM;
    }
  }
  return total;
}

/**
 * True if with this start time we never arrive after closing at any attraction.
 */
function isStartTimeFeasible(
  sortedAttractions: Attraction[],
  segments: (TimelineSegment | null)[],
  startTime: string
): boolean {
  const { arrivalTimes, departureTimes } = computeTimesFromStartTime(sortedAttractions, segments, startTime);
  for (let i = 0; i < sortedAttractions.length; i++) {
    const a = sortedAttractions[i];
    if (a.closingTime) {
      const arrivalM = timeToMinutes(arrivalTimes[i]);
      const closingM = timeToMinutes(a.closingTime);
      if (arrivalM >= closingM) return false;
      const depM = timeToMinutes(departureTimes[i]);
      if (depM > closingM) return false;
    }
  }
  return true;
}

/**
 * Suggests a start time that minimizes total wait at openings, without arriving after closing anywhere.
 * Only considers feasible start times (no arrival after closing); among those, picks the one with
 * minimum wait, and in tie the earliest (so we don't suggest 12:45 when 08:00 already gives 0 wait).
 */
export function suggestStartTime(
  attractions: Attraction[],
  segments: (TimelineSegment | null)[]
): string {
  if (attractions.length === 0 || segments.length !== attractions.length - 1) return '09:00';
  const sorted = [...attractions].sort((a, b) => a.order - b.order);

  const isAccommodationAtStart = sorted[0]?.id === -999;
  const firstArrivalIndex = isAccommodationAtStart ? 1 : 0;
  const firstAttraction = sorted[firstArrivalIndex];
  const travelToFirstMinutes = firstArrivalIndex === 0 ? 0 : (segments[0]?.durationMinutes ?? 0);
  const defaultStart = '09:00';
  const computedStart =
    firstAttraction?.openingTime && firstAttraction.openingTime !== ''
      ? minutesToTime(Math.max(0, timeToMinutes(firstAttraction.openingTime) - travelToFirstMinutes))
      : defaultStart;

  let bestStart = computedStart;
  if (!isStartTimeFeasible(sorted, segments, bestStart)) {
    bestStart = defaultStart;
    if (!isStartTimeFeasible(sorted, segments, bestStart)) return computedStart;
  }
  let bestWait = totalWaitMinutes(sorted, segments, bestStart);

  for (let h = 4; h <= 12; h++) {
    for (let m = 0; m < 60; m += 15) {
      const start = minutesToTime(h * 60 + m);
      if (!isStartTimeFeasible(sorted, segments, start)) continue;
      const wait = totalWaitMinutes(sorted, segments, start);
      const earlierAndSameWait = wait === bestWait && timeToMinutes(start) < timeToMinutes(bestStart);
      if (wait < bestWait || earlierAndSameWait) {
        bestWait = wait;
        bestStart = start;
      }
    }
  }
  return bestStart;
}

/**
 * Recompute a timeline with a new start time (same segments; updates times, conflicts, freeTimeBlocks).
 */
export function recomputeTimelineWithStartTime(timeline: TimelineDay, newStartTime: string): TimelineDay {
  const sorted = [...timeline.attractions].sort((a, b) => a.order - b.order);
  const { arrivalTimes, departureTimes } = computeTimesFromStartTime(sorted, timeline.segments, newStartTime);
  const freeTimeBlocks = applyIdealPeriods(sorted, timeline.segments, arrivalTimes, departureTimes);
  const endTime = departureTimes[departureTimes.length - 1] || newStartTime;
  const conflicts = detectConflictsFromTimes(sorted, arrivalTimes, departureTimes);
  const attractionsWithTimes = sorted.map((a, idx) => ({
    ...a,
    arrivalTime: arrivalTimes[idx],
    departureTime: departureTimes[idx],
  }));
  return {
    ...timeline,
    attractions: attractionsWithTimes,
    conflicts,
    startTime: newStartTime,
    endTime,
    freeTimeBlocks: freeTimeBlocks.length > 0 ? freeTimeBlocks : undefined,
  };
}

/**
 * Build timeline for a specific day.
 * If precomputedSegments is provided, skips OSRM fetch and uses them (e.g. from cache).
 */
export async function buildDayTimeline(attractions: Attraction[], precomputedSegments?: (TimelineSegment | null)[]): Promise<TimelineDay | null> {
  if (attractions.length === 0) return null;

  const sortedAttractions = [...attractions].sort((a, b) => a.order - b.order);

  const segments = precomputedSegments != null && precomputedSegments.length === sortedAttractions.length - 1
    ? precomputedSegments
    : await fetchSegmentsForDay(sortedAttractions);

  const totalDistance = segments.reduce((sum, s) => sum + (s?.distanceKm ?? 0), 0);
  const totalTravelTime = segments.reduce((sum, s) => sum + (s?.durationMinutes ?? 0), 0);

  const isAccommodationAtStart = sortedAttractions[0]?.id === -999;
  const firstArrivalIndex = isAccommodationAtStart ? 1 : 0;
  const firstAttraction = sortedAttractions[firstArrivalIndex];
  const travelToFirstMinutes = firstArrivalIndex === 0 ? 0 : (segments[0]?.durationMinutes ?? 0);
  const defaultStart = '09:00';

  let startTime: string;
  if (firstAttraction?.openingTime && firstAttraction.openingTime !== '') {
    const arrivalAtFirstMinutes = timeToMinutes(firstAttraction.openingTime);
    const leaveMinutes = arrivalAtFirstMinutes - travelToFirstMinutes;
    startTime = minutesToTime(Math.max(0, leaveMinutes));
  } else {
    startTime = defaultStart;
  }

  const { arrivalTimes, departureTimes } = computeTimesFromStartTime(sortedAttractions, segments, startTime);
  const freeTimeBlocks = applyIdealPeriods(sortedAttractions, segments, arrivalTimes, departureTimes);
  const endTime = departureTimes[departureTimes.length - 1] || startTime;
  const conflicts = detectConflictsFromTimes(sortedAttractions, arrivalTimes, departureTimes);

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
    freeTimeBlocks: freeTimeBlocks.length > 0 ? freeTimeBlocks : undefined,
  };
}

/**
 * Calculate estimated arrival time at an attraction
 */
export function calculateArrivalTime(attractions: Attraction[], segments: TimelineSegment[], index: number, startTime: string = '09:00'): string {
  let currentTime = timeToMinutes(startTime);

  for (let i = 0; i < index; i++) {
    // Add travel time TO this attraction
    const segment = segments[i];

    if (segment) {
      currentTime += segment.durationMinutes;
    }

    // Add duration AT this attraction
    currentTime += getAttractionDuration(attractions[i]);
  }

  // Add final travel time TO the target attraction
  if (segments[index]) {
    currentTime += segments[index].durationMinutes;
  }

  return minutesToTime(currentTime);
}