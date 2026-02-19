import type { Attraction } from './Attraction'

export interface TimelineSegment {
  from: Attraction
  to: Attraction
  durationMinutes: number
  distanceKm: number
  travelMode: 'walking' | 'driving' | 'transit'
}

export interface TimelineConflict {
  attractionId: number
  type: 'overlap' | 'late-arrival' | 'closed' | 'rush'
  message: string
  severity: 'warning' | 'error'
}

export interface TimelineDay {
  date: string
  dayNumber: number
  attractions: Attraction[]
  segments: (TimelineSegment | null)[]
  conflicts: TimelineConflict[]
  totalDistance: number
  totalTravelTime: number
  startTime: string
  endTime: string
}