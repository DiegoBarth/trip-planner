import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeatherForDate, getWeatherRecommendation, fetchWeatherForecast } from '../weatherService'
import type { WeatherData } from '@/types/Weather'

function makeWeatherData(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    date: '2025-03-01',
    temp: 18,
    tempMin: 12,
    tempMax: 22,
    description: 'nublado',
    icon: '☁️',
    humidity: 60,
    windSpeed: 5,
    pop: 0.2,
    rain: 0,
    ...overrides,
  }
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.stubGlobal('import.meta.env', { VITE_OPENWEATHER_API_KEY: 'key' })
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('getWeatherForDate', () => {
    it('returns null when forecast is empty', () => {
      expect(getWeatherForDate([], '2025-03-01')).toBeNull()
    })

    it('returns null when date is empty', () => {
      const forecast = [makeWeatherData({ date: '2025-03-01' })]
      expect(getWeatherForDate(forecast, '')).toBeNull()
    })

    it('returns matching forecast when date matches', () => {
      const w = makeWeatherData({ date: '2025-03-01', temp: 20 })
      expect(getWeatherForDate([w], '2025-03-01')).toEqual(w)
    })

    it('returns null when no forecast for date', () => {
      const forecast = [makeWeatherData({ date: '2025-03-01' })]
      expect(getWeatherForDate(forecast, '2025-03-02')).toBeNull()
    })

    it('normalizes date with dd/mm/yyyy and finds match', () => {
      const w = makeWeatherData({ date: '2025-03-01' })
      expect(getWeatherForDate([w], '01/03/2025')).toEqual(w)
    })

    it('normalizes date with yyyy-mm-dd and finds match', () => {
      const w = makeWeatherData({ date: '2025-03-01' })
      expect(getWeatherForDate([w], '2025-3-1')).toEqual(w)
    })

    it('normalizes date with T and uses date part', () => {
      const w = makeWeatherData({ date: '2025-03-01' })
      expect(getWeatherForDate([w], '2025-03-01T12:00:00')).toEqual(w)
    })

    it('normalizes date with yyyy/mm/dd (year first) and finds match', () => {
      const w = makeWeatherData({ date: '2025-03-01' })
      expect(getWeatherForDate([w], '2025/03/01')).toEqual(w)
    })

    it('returns null when normalized date does not match any forecast', () => {
      const w = makeWeatherData({ date: '2025-03-01' })
      expect(getWeatherForDate([w], 'other')).toBeNull()
    })
  })

  describe('getWeatherRecommendation', () => {
    it('returns rain recommendation when pop > 0.7', () => {
      expect(getWeatherRecommendation(makeWeatherData({ pop: 0.8 }))).toContain('Alta chance de chuva')
    })

    it('returns possibility of rain when pop > 0.4 and <= 0.7', () => {
      expect(getWeatherRecommendation(makeWeatherData({ pop: 0.5 }))).toContain('Possibilidade de chuva')
    })

    it('returns heat recommendation when temp > 30', () => {
      expect(getWeatherRecommendation(makeWeatherData({ temp: 32, pop: 0 }))).toContain('Muito calor')
    })

    it('returns cold recommendation when temp < 10', () => {
      expect(getWeatherRecommendation(makeWeatherData({ temp: 5, pop: 0 }))).toContain('Frio')
    })

    it('returns wind recommendation when windSpeed > 10', () => {
      expect(getWeatherRecommendation(makeWeatherData({ windSpeed: 12, pop: 0, temp: 20 }))).toContain('Vento forte')
    })

    it('returns snow recommendation when description contains neve', () => {
      expect(getWeatherRecommendation(makeWeatherData({ description: 'neve leve', pop: 0, temp: 20, windSpeed: 2 }))).toContain('Neve')
    })

    it('returns favorable when no special conditions', () => {
      const w = makeWeatherData({ pop: 0.1, temp: 20, windSpeed: 3 })
      expect(getWeatherRecommendation(w)).toContain('favorável')
    })
  })

  describe('fetchWeatherForecast', () => {
    it('returns [] when city has no coordinates', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await fetchWeatherForecast('UnknownCity')
      expect(result).toEqual([])
      expect(fetch).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    it('returns [] when response is not ok', async () => {
      const err = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 })
      const result = await fetchWeatherForecast('Tokyo')
      expect(result).toEqual([])
      err.mockRestore()
    })

    it('returns [] when data.list is empty', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ list: [] }),
      })
      const result = await fetchWeatherForecast('Tokyo')
      expect(result).toEqual([])
    })

    it('returns [] when fetch throws', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))
      const err = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await fetchWeatherForecast('Tokyo')
      expect(result).toEqual([])
      err.mockRestore()
    })

    it('returns daily forecasts when API returns valid data', async () => {
      const dt = Math.floor(new Date('2025-03-01T12:00:00Z').getTime() / 1000)
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            city: { timezone: 0 },
            list: [
              {
                dt,
                main: { temp: 18, temp_min: 12, temp_max: 22, humidity: 60 },
                weather: [{ icon: '03d', description: 'nublado' }],
                wind: { speed: 5 },
                pop: 0.2,
                rain: undefined,
              },
            ],
          }),
      })
      const result = await fetchWeatherForecast('Tokyo')
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0].date).toBeDefined()
      expect(result[0].temp).toBe(18)
      expect(result[0].description).toBe('nublado')
    })
  })
})
