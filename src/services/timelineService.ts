import type { Attraction } from '@/types/Attraction'
import type { TimelineSegment, TimelineConflict, TimelineDay } from '@/types/Timeline'
import { fetchOSRMRoute } from './osrmService'

/**
 * Calculate travel time between two attractions using OSRM
 */
export async function calculateTravelSegment(
  from: Attraction,
  to: Attraction
): Promise<TimelineSegment | null> {
  if (!from.lat || !from.lng || !to.lat || !to.lng) {
    return null
  }

  try {
    const result = await fetchOSRMRoute([
      { lat: from.lat, lng: from.lng },
      { lat: to.lat, lng: to.lng }
    ])

    if (!result) return null

    console.log(result);

    // Estimate time: distance * 60 minutes / average speed (30 km/h in city)
    const durationMinutes = Math.ceil((result.distanceKm / 5) * 60)

    return {
      from,
      to,
      durationMinutes,
      distanceKm: result.distanceKm,
      travelMode: result.distanceKm > 5 ? 'transit' : 'walking'
    }
  } catch (error) {
    console.error('Error calculating travel segment:', error)
    return null
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
  segments: TimelineSegment[]
): TimelineConflict[] {
  const conflicts: TimelineConflict[] = []
  let currentTime = timeToMinutes('09:00') // Default start time

  for (let i = 0; i < attractions.length; i++) {
    const attraction = attractions[i]
    const segment = segments[i] // Travel TO this attraction

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

  // Calculate segments (travel between attractions)
  const segments: TimelineSegment[] = [];
  let totalDistance = 0;
  let totalTravelTime = 0;

  // Sempre calcula o segmento entre acomodação (primeiro item) e a primeira atração
  for (let i = 0; i < sortedAttractions.length - 1; i++) {
    const segment = await calculateTravelSegment(
      sortedAttractions[i],
      sortedAttractions[i + 1]
    );
    if (segment) {
      segments.push(segment);
      totalDistance += segment.distanceKm;
      totalTravelTime += segment.durationMinutes;
    }
  }

  // Detect conflicts
  const conflicts = detectConflicts(sortedAttractions, segments)

  // Calculate start and end times
  const startTime = '09:00';
  let currentMinutes = timeToMinutes(startTime);
  const arrivalTimes: string[] = [];
  const departureTimes: string[] = [];

  for (let i = 0; i < sortedAttractions.length; i++) {
    // Chegada: para o primeiro ponto, é o horário inicial; para os demais, é após deslocamento
    if (i === 0) {
      arrivalTimes.push(minutesToTime(currentMinutes));
    } else {
      // Chegada = saída do anterior + tempo de viagem
      const prevDeparture = departureTimes[i - 1] ? timeToMinutes(departureTimes[i - 1]) : currentMinutes;
      const travel = segments[i - 1]?.durationMinutes || 0;
      arrivalTimes.push(minutesToTime(prevDeparture + travel));
      currentMinutes = prevDeparture + travel;
    }
    // Saída = chegada + duração
    const duration = getAttractionDuration(sortedAttractions[i]);
    departureTimes.push(minutesToTime(currentMinutes + duration));
    currentMinutes = currentMinutes + duration;
  }

  const endTime = departureTimes[departureTimes.length - 1] || startTime;

  // Adiciona horários nos objetos de atração
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
