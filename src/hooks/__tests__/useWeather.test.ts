import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWeather } from '../useWeather'
import { createQueryClientWrapper } from './wrapper'

const mockQueryFn = vi.fn()

vi.mock('@/services/weatherQueryService', () => ({
  getWeatherQueryOptions: (city: string) => ({
    queryKey: ['weather', city],
    queryFn: () => mockQueryFn(city),
    staleTime: 300000,
  }),
}))

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryFn.mockResolvedValue([
      { date: '2025-03-01', tempMin: 5, tempMax: 15, condition: 'sunny' },
    ])
  })

  it('returns forecast for given city', async () => {
    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useWeather('Tokyo'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.forecast).toHaveLength(1)
      expect(result.current.forecast[0]).toMatchObject({ date: '2025-03-01', tempMax: 15 })
    })
  })

  it('returns empty array when city has no data', async () => {
    mockQueryFn.mockResolvedValue([])
    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useWeather('Osaka'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.forecast).toEqual([])
    })
  })
})
