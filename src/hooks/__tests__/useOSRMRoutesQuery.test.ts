import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOSRMRoutesQuery } from '../useOSRMRoutesQuery'
import { createQueryClientWrapper } from './wrapper'
import type { Attraction } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'

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

describe('useOSRMRoutesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchOSRMRoute.mockResolvedValue({
      path: [[35.68, 139.69], [35.69, 139.7]],
      distanceKm: 5,
      legs: [{ distance: 1000, duration: 120 }, { distance: 2000, duration: 240 }],
    })
  })

  it('returns empty routes and distances when groupedByDay is empty', () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(
      () => useOSRMRoutesQuery({}, []),
      { wrapper: Wrapper }
    )
    expect(result.current.routes).toEqual({})
    expect(result.current.distances).toEqual({})
    expect(result.current.segmentsByDay).toEqual({})
  })

  it('fetches routes when enabled', async () => {
    const groupedByDay: Record<number, Attraction[]> = {
      1: [
        makeAttraction({ id: 1, lat: 35.68, lng: 139.69, order: 0 }),
        makeAttraction({ id: 2, lat: 35.69, lng: 139.7, order: 1 }),
      ],
    }
    const accommodations: Accommodation[] = []
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(
      () => useOSRMRoutesQuery(groupedByDay, accommodations),
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      expect(result.current.isRoutesLoading).toBe(false)
    })
    expect(mockFetchOSRMRoute).toHaveBeenCalled()
  })
})
