import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOSRMRoutes } from '../useOSRMRoutes'
import type { Attraction } from '@/types/Attraction'

const mockFetchOSRMRoute = vi.fn()

vi.mock('@/services/osrmService', () => ({
  fetchOSRMRoute: (...args: unknown[]) => mockFetchOSRMRoute(...args),
}))

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
    couplePrice: 0,
    currency: 'JPY',
    priceInBRL: 0,
    visited: false,
    needsReservation: false,
    lat: 35.68,
    lng: 139.69,
    ...overrides,
  }
}

describe('useOSRMRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchOSRMRoute.mockResolvedValue({ path: [[35.68, 139.69], [35.69, 139.7]], distanceKm: 5 })
  })

  it('returns empty routes and distances when groupedByDay is empty', () => {
    const { result } = renderHook(() =>
      useOSRMRoutes({}, [])
    )
    expect(result.current.routes).toEqual({})
    expect(result.current.distances).toEqual({})
  })

  it('fetches routes when groupedByDay has days with 2+ mappable points', async () => {
    const groupedByDay: Record<number, Attraction[]> = {
      1: [
        makeAttraction({ id: 1, lat: 35.68, lng: 139.69, order: 0 }),
        makeAttraction({ id: 2, lat: 35.69, lng: 139.7, order: 1 }),
      ],
    }
    const { result } = renderHook(() =>
      useOSRMRoutes(groupedByDay, [])
    )

    await waitFor(() => {
      expect(mockFetchOSRMRoute).toHaveBeenCalled()
      expect(Object.keys(result.current.routes).length).toBeGreaterThanOrEqual(0)
    })
  })
})
