import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAccommodation } from '../useAccommodation'
import { createQueryClientWrapper } from './wrapper'

const mockQueryFn = vi.fn()

vi.mock('@/services/accommodationQueryService', () => ({
  getAccommodationsQueryOptions: () => ({
    queryKey: ['accommodations'],
    queryFn: mockQueryFn,
    staleTime: 300000,
  }),
}))

function makeAccommodation(
  overrides: Partial<{ id: number; city: string; country: 'japan' | 'south-korea' | 'general' }> = {}
) {
  return {
    id: 1,
    description: 'Hotel',
    city: 'Tokyo',
    country: 'japan' as const,
    lat: 35.68,
    lng: 139.69,
    checkIn: '2025-03-01',
    checkOut: '2025-03-05',
    ...overrides,
  }
}

describe('useAccommodation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryFn.mockResolvedValue([])
  })

  it('returns accommodations, isLoading and error', async () => {
    const accommodations = [
      makeAccommodation({ id: 1 }),
      makeAccommodation({ id: 2, city: 'Kyoto' }),
    ]

    mockQueryFn.mockResolvedValue(accommodations)

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useAccommodation('japan'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.accommodations).toHaveLength(2)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('filters accommodations by country', async () => {
    const accommodations = [
      makeAccommodation({ id: 1, country: 'japan' }),
      makeAccommodation({ id: 2, country: 'south-korea' }),
    ]

    mockQueryFn.mockResolvedValue(accommodations)

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useAccommodation('japan'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.accommodations).toHaveLength(1)
      expect(result.current.accommodations[0].country).toBe('japan')
    })
  })

  it('returns all accommodations when country is all', async () => {
    const accommodations = [
      makeAccommodation({ id: 1, country: 'japan' }),
      makeAccommodation({ id: 2, country: 'south-korea' }),
    ]

    mockQueryFn.mockResolvedValue(accommodations)

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useAccommodation('all'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.accommodations).toHaveLength(2)
    })
  })
})