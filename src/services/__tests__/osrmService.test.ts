import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchOSRMRoute, fetchOSRMRouteWithFallback, straightLineRouteFromCoordinates } from '../osrmService'

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

  it('rejects with AbortError when already aborted before fetch', async () => {
    const ac = new AbortController()
    ac.abort()
    await expect(
      fetchOSRMRoute(
        [
          { lat: 35.68, lng: 139.69 },
          { lat: 35.69, lng: 139.70 },
        ],
        ac.signal
      )
    ).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('rejects with AbortError when external signal aborts during fetch', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ac = new AbortController()
    ;(fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          const s = init?.signal
          if (!s) return
          const fail = () => reject(new DOMException('Aborted', 'AbortError'))
          if (s.aborted) {
            fail()
            return
          }
          s.addEventListener('abort', fail, { once: true })
          queueMicrotask(() => ac.abort())
        })
    )
    const p = fetchOSRMRoute(
      [
        { lat: 35.68, lng: 139.69 },
        { lat: 35.69, lng: 139.70 },
      ],
      ac.signal
    )
    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
    warn.mockRestore()
  })

  it('straightLineRouteFromCoordinates returns path and legs between points', () => {
    const coords = [
      { lat: 35.68, lng: 139.69 },
      { lat: 35.69, lng: 139.7 },
    ]
    const r = straightLineRouteFromCoordinates(coords)
    expect(r.path).toEqual([
      [35.68, 139.69],
      [35.69, 139.7],
    ])
    expect(r.legs).toHaveLength(1)
    expect(r.legs![0].distanceKm).toBeGreaterThan(0)
    expect(r.distanceKm).toBeCloseTo(r.legs![0].distanceKm, 5)
  })

  it('fetchOSRMRouteWithFallback uses straight line when fetch fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))
    const coords = [
      { lat: 35.68, lng: 139.69 },
      { lat: 35.69, lng: 139.7 },
    ]
    const r = await fetchOSRMRouteWithFallback(coords)
    expect(r).not.toBeNull()
    expect(r!.legs).toHaveLength(1)
    expect(r!.path).toHaveLength(2)
    warn.mockRestore()
  })
})
