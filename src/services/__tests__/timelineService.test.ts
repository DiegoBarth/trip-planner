import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  legsToSegments,
  calculateTravelSegment,
  buildDayTimeline,
  calculateArrivalTime,
} from '../timelineService'
import type { Attraction } from '@/types/Attraction'
import type { OSRMLeg } from '@/services/osrmService'

type AttractionWithTimes = Attraction & { arrivalTime: string; departureTime: string }

function mockOSRMWithLegs(legs: { distance: number; duration: number }[]) {
  ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        routes: [
          {
            distance: legs.reduce((s, l) => s + l.distance, 0),
            geometry: { coordinates: [] },
            legs: legs.map(l => ({ distance: l.distance, duration: l.duration })),
          },
        ],
      }),
  })
}

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'A',
    country: 'japan',
    city: 'Tokyo',
    day: 1,
    date: '2025-03-01',
    dayOfWeek: 'Mon',
    type: 'temple',
    order: 0,
    couplePrice: 1000,
    currency: 'JPY',
    priceInBRL: 50,
    visited: false,
    needsReservation: false,
    lat: 35.68,
    lng: 139.69,
    ...overrides,
  }
}

describe('timelineService', () => {
  describe('legsToSegments', () => {
    it('returns array of nulls when fewer than 2 attractions have coords', () => {
      const atts = [
        makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69 }),
        makeAttraction({ id: 2, order: 1, lat: undefined, lng: undefined }),
      ]
      const legs: OSRMLeg[] = [{ distanceKm: 1, durationMinutes: 10 }]
      const result = legsToSegments(atts, legs)
      expect(result).toHaveLength(1)
      expect(result[0]).toBeNull()
    })

    it('returns array of nulls when legs is empty', () => {
      const atts = [
        makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69 }),
        makeAttraction({ id: 2, order: 1, lat: 35.69, lng: 139.70 }),
      ]
      const result = legsToSegments(atts, [])
      expect(result).toHaveLength(1)
      expect(result[0]).toBeNull()
    })

    it('builds segment between two attractions when leg matches', () => {
      const a1 = makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69 })
      const a2 = makeAttraction({ id: 2, order: 1, lat: 35.69, lng: 139.70 })
      const legs: OSRMLeg[] = [{ distanceKm: 2, durationMinutes: 15 }]
      const result = legsToSegments([a1, a2], legs)
      expect(result).toHaveLength(1)
      expect(result[0]).not.toBeNull()
      expect(result[0]?.from).toEqual(a1)
      expect(result[0]?.to).toEqual(a2)
      expect(result[0]?.distanceKm).toBe(2)
      expect(result[0]?.durationMinutes).toBeGreaterThanOrEqual(0)
    })

    it('uses transit and leg duration when leg.distanceKm > 3', () => {
      const a1 = makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69 })
      const a2 = makeAttraction({ id: 2, order: 1, lat: 35.69, lng: 139.70 })
      const legs: OSRMLeg[] = [{ distanceKm: 5, durationMinutes: 25 }]
      const result = legsToSegments([a1, a2], legs)
      expect(result[0]?.travelMode).toBe('transit')
      expect(result[0]?.durationMinutes).toBe(25)
    })
  })

  describe('calculateArrivalTime', () => {
    it('returns startTime for first attraction when no segment to first', () => {
      const atts = [makeAttraction({ id: 1 }), makeAttraction({ id: 2 })]
      const segments: { from: Attraction; to: Attraction; durationMinutes: number; distanceKm: number; travelMode: 'walking' }[] = []
      expect(calculateArrivalTime(atts, segments, 0, '09:00')).toBe('09:00')
    })

    it('returns startTime + segment to first + duration at first when index 1', () => {
      const atts = [makeAttraction({ id: 1 }), makeAttraction({ id: 2 })]
      const segments = [
        { from: atts[0], to: atts[1], durationMinutes: 30, distanceKm: 1, travelMode: 'walking' as const },
      ]
      const arrival = calculateArrivalTime(atts, segments, 1, '09:00')
      expect(arrival).toBe('10:30')
    })

    it('uses default startTime 09:00 when not provided', () => {
      const atts = [makeAttraction({ id: 1 })]
      expect(calculateArrivalTime(atts, [], 0)).toBe('09:00')
    })
  })

  describe('calculateTravelSegment', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn())
    })

    it('returns null when from has no lat/lng', async () => {
      const from = makeAttraction({ lat: undefined, lng: undefined })
      const to = makeAttraction({ lat: 35.69, lng: 139.70 })
      expect(await calculateTravelSegment(from, to)).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('returns segment when OSRM returns route', async () => {
      ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            routes: [
              {
                distance: 3000,
                legs: [{ distance: 3000, duration: 360 }],
              },
            ],
          }),
      })
      const from = makeAttraction({ id: 1, lat: 35.68, lng: 139.69 })
      const to = makeAttraction({ id: 2, lat: 35.69, lng: 139.70 })
      const result = await calculateTravelSegment(from, to)
      expect(result).not.toBeNull()
      expect(result?.from).toEqual(from)
      expect(result?.to).toEqual(to)
      expect(result?.distanceKm).toBe(3)
    })

    it('returns transit and uses legs[0] duration when distanceKm > 5', async () => {
      ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            routes: [{ distance: 6000, legs: [{ distance: 6000, duration: 600 }] }],
          }),
      })
      const from = makeAttraction({ id: 1, lat: 35.68, lng: 139.69 })
      const to = makeAttraction({ id: 2, lat: 35.69, lng: 139.70 })
      const result = await calculateTravelSegment(from, to)
      expect(result?.travelMode).toBe('transit')
      expect(result?.durationMinutes).toBe(10)
    })

    it('uses fallback duration when result has no legs', async () => {
      ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            routes: [{ distance: 6000 }],
          }),
      })
      const from = makeAttraction({ id: 1, lat: 35.68, lng: 139.69 })
      const to = makeAttraction({ id: 2, lat: 35.69, lng: 139.70 })
      const result = await calculateTravelSegment(from, to)
      expect(result?.travelMode).toBe('transit')
      expect(result?.durationMinutes).toBeGreaterThanOrEqual(0)
    })

    it('returns null when to has no lat/lng', async () => {
      const from = makeAttraction({ lat: 35.68, lng: 139.69 })
      const to = makeAttraction({ lat: undefined, lng: undefined })
      expect(await calculateTravelSegment(from, to)).toBeNull()
    })
  })

  describe('buildDayTimeline', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn())
    })

    it('returns null when attractions is empty', async () => {
      expect(await buildDayTimeline([])).toBeNull()
    })

    it('returns TimelineDay with date, dayNumber, times when one attraction and precomputedSegments', async () => {
      const att = makeAttraction({ id: 1, order: 0, date: '2025-03-01', day: 1 })
      const result = await buildDayTimeline([att], [])
      expect(result).not.toBeNull()
      expect(result?.date).toBe('2025-03-01')
      expect(result?.dayNumber).toBe(1)
      expect(result?.attractions).toHaveLength(1)
      const att0 = result?.attractions[0] as AttractionWithTimes | undefined
      expect(att0?.arrivalTime).toBeDefined()
      expect(att0?.departureTime).toBeDefined()
      expect(result?.startTime).toBe('09:00')
      expect(result?.segments).toHaveLength(0)
      expect(result?.conflicts).toEqual([])
    })

    it('calls fetchOSRMRoute and builds segments when no precomputedSegments and 2+ attractions', async () => {
      mockOSRMWithLegs([{ distance: 2000, duration: 240 }])
      const a1 = makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69, date: '2025-03-01', day: 1 })
      const a2 = makeAttraction({ id: 2, order: 1, lat: 35.69, lng: 139.70, date: '2025-03-01', day: 1 })
      const result = await buildDayTimeline([a2, a1])
      expect(result).not.toBeNull()
      expect(result?.attractions).toHaveLength(2)
      expect(result?.segments).toHaveLength(1)
      expect(result?.segments[0]?.distanceKm).toBe(2)
    })

    it('builds segment with transit when OSRM leg distance > 3km', async () => {
      mockOSRMWithLegs([{ distance: 5000, duration: 600 }])
      const a1 = makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69, date: '2025-03-01', day: 1 })
      const a2 = makeAttraction({ id: 2, order: 1, lat: 35.69, lng: 139.70, date: '2025-03-01', day: 1 })
      const result = await buildDayTimeline([a1, a2])
      expect(result?.segments[0]?.travelMode).toBe('transit')
    })

    it('builds day with null segments when OSRM returns no routes', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ routes: [] }),
      })
      const a1 = makeAttraction({ id: 1, order: 0, lat: 35.68, lng: 139.69, date: '2025-03-01', day: 1 })
      const a2 = makeAttraction({ id: 2, order: 1, lat: 35.69, lng: 139.70, date: '2025-03-01', day: 1 })
      const result = await buildDayTimeline([a1, a2])
      expect(result?.segments).toHaveLength(1)
      expect(result?.segments[0]).toBeNull()
    })

    it('uses attraction duration 0 for first attraction', async () => {
      const att = makeAttraction({ id: 1, order: 0, date: '2025-03-01', day: 1, duration: 0 })
      const result = await buildDayTimeline([att], [])
      const att0 = result?.attractions[0] as AttractionWithTimes | undefined
      expect(att0?.arrivalTime).toBe('09:00')
      expect(att0?.departureTime).toBe('09:00')
    })

    it('detects late-arrival conflict when arriving before opening', async () => {
      const a1 = makeAttraction({
        id: 1,
        order: 0,
        date: '2025-03-01',
        day: 1,
        openingTime: '10:00',
        closingTime: '18:00',
      })
      const result = await buildDayTimeline([a1], [])
      const lateArrival = result?.conflicts.find(c => c.type === 'late-arrival')
      expect(lateArrival).toBeDefined()
      expect(lateArrival?.message).toContain('abre às 10:00')
    })

    it('detects closed conflict when arriving after closing', async () => {
      const a1 = makeAttraction({
        id: 1,
        order: 0,
        date: '2025-03-01',
        day: 1,
        openingTime: '08:00',
        closingTime: '09:00',
      })
      const result = await buildDayTimeline([a1], [])
      const closed = result?.conflicts.find(c => c.type === 'closed')
      expect(closed).toBeDefined()
    })

    it('detects overlap conflict when departure after closing', async () => {
      const a1 = makeAttraction({
        id: 1,
        order: 0,
        date: '2025-03-01',
        day: 1,
        openingTime: '09:00',
        closingTime: '10:00',
        duration: 90,
      })
      const result = await buildDayTimeline([a1], [])
      const overlap = result?.conflicts.find(c => c.type === 'overlap')
      expect(overlap).toBeDefined()
    })

    it('detects rush conflict when day extends past 21:00', async () => {
      const atts = Array.from({ length: 14 }, (_, i) =>
        makeAttraction({ id: i + 1, order: i, date: '2025-03-01', day: 1, duration: 60 })
      )
      const segments = atts.slice(0, -1).map((_, i) => ({
        from: atts[i],
        to: atts[i + 1],
        durationMinutes: 0,
        distanceKm: 0,
        travelMode: 'walking' as const,
      }))
      const result = await buildDayTimeline(atts, segments)
      const rush = result?.conflicts.find(c => c.type === 'rush')
      expect(rush).toBeDefined()
    })

    it('calculateArrivalTime with segment at target index adds that segment duration', () => {
      const atts = [
        makeAttraction({ id: 1 }),
        makeAttraction({ id: 2 }),
        makeAttraction({ id: 3 }),
      ]
      const segments = [
        { from: atts[0], to: atts[1], durationMinutes: 10, distanceKm: 1, travelMode: 'walking' as const },
        { from: atts[1], to: atts[2], durationMinutes: 20, distanceKm: 1, travelMode: 'walking' as const },
      ]
      const arrival = calculateArrivalTime(atts, segments, 2, '09:00')
      expect(arrival).toBe('11:30')
    })
  })
})
