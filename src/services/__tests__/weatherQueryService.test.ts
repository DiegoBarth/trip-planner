import { describe, it, expect, vi, beforeEach } from 'vitest'
import { weatherQueryKey, getWeatherQueryOptions } from '../weatherQueryService'

const mockFetchWeatherForecast = vi.fn()
vi.mock('@/services/weatherService', () => ({
  fetchWeatherForecast: (city: string) => mockFetchWeatherForecast(city),
}))

describe('weatherQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('weatherQueryKey returns key with city', () => {
    expect(weatherQueryKey('Tokyo')).toEqual(['weather', 'Tokyo'])
    expect(weatherQueryKey('Seoul')).toEqual(['weather', 'Seoul'])
  })

  it('getWeatherQueryOptions returns queryKey and queryFn that calls fetchWeatherForecast', async () => {
    mockFetchWeatherForecast.mockResolvedValue([])
    const options = getWeatherQueryOptions('Tokyo')
    expect(options.queryKey).toEqual(['weather', 'Tokyo'])
    await options.queryFn()
    expect(mockFetchWeatherForecast).toHaveBeenCalledWith('Tokyo')
  })
})
