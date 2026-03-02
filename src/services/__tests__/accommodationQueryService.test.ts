import { describe, it, expect, vi, beforeEach } from 'vitest'
import { accommodationsQueryKey, getAccommodationsQueryOptions } from '../accommodationQueryService'

const mockGetAccommodations = vi.fn()
vi.mock('@/api/accommodation', () => ({
  getAccommodations: (...args: unknown[]) => mockGetAccommodations(...args),
}))

describe('accommodationQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accommodationsQueryKey returns stable key', () => {
    expect(accommodationsQueryKey()).toEqual(['accommodations'])
  })

  it('getAccommodationsQueryOptions returns queryKey and queryFn that calls getAccommodations', async () => {
    mockGetAccommodations.mockResolvedValue([])
    const options = getAccommodationsQueryOptions()
    expect(options.queryKey).toEqual(['accommodations'])
    await options.queryFn()
    expect(mockGetAccommodations).toHaveBeenCalledTimes(1)
  })
})
