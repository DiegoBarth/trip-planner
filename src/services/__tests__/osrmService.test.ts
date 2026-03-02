import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchOSRMRoute } from '../osrmService'

describe('osrmService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns null when fewer than 2 coordinates', async () => {
    expect(await fetchOSRMRoute([])).toBeNull()
    expect(await fetchOSRMRoute([{ lat: 35.68, lng: 139.69 }])).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null when response is not ok', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    })
    const result = await fetchOSRMRoute([
      { lat: 35.68, lng: 139.69 },
      { lat: 35.69, lng: 139.70 },
    ])
    expect(result).toBeNull()
    warn.mockRestore()
  })

  it('returns null when routes array is empty', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ routes: [] }),
    })
    const result = await fetchOSRMRoute([
      { lat: 35.68, lng: 139.69 },
      { lat: 35.69, lng: 139.70 },
    ])
    expect(result).toBeNull()
  })

  it('returns path, distanceKm and legs when OSRM returns valid route', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          routes: [
            {
              distance: 5000,
              duration: 600,
              geometry: { coordinates: [[139.69, 35.68], [139.70, 35.69]] },
              legs: [
                { distance: 5000, duration: 600 },
              ],
            },
          ],
        }),
    })
    const result = await fetchOSRMRoute([
      { lat: 35.68, lng: 139.69 },
      { lat: 35.69, lng: 139.70 },
    ])
    expect(result).not.toBeNull()
    expect(result?.distanceKm).toBe(5)
    expect(result?.path).toEqual([
      [35.68, 139.69],
      [35.69, 139.70],
    ])
    expect(result?.legs).toHaveLength(1)
    expect(result?.legs?.[0].distanceKm).toBe(5)
    expect(result?.legs?.[0].durationMinutes).toBe(10)
  })

  it('returns null on fetch error', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))
    const result = await fetchOSRMRoute([
      { lat: 35.68, lng: 139.69 },
      { lat: 35.69, lng: 139.70 },
    ])
    expect(result).toBeNull()
    consoleSpy.mockRestore()
  })
})
