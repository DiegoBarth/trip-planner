import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useLocationSearch } from '../useLocationSearch'

const mockSearchLocations = vi.fn()

vi.mock('@/api/location', () => ({
  searchLocations: (...args: unknown[]) => mockSearchLocations(...args),
}))

describe('useLocationSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchLocations.mockResolvedValue([])
  })

  it('returns initial empty results and loading false', () => {
    const { result } = renderHook(() => useLocationSearch())
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.search).toBeDefined()
    expect(result.current.clear).toBeDefined()
  })

  it('search sets results and loading state', async () => {
    const locations = [
      { displayName: 'Tokyo Station', lat: '35.68', lon: '139.69' },
    ]
    mockSearchLocations.mockResolvedValue(locations)

    const { result } = renderHook(() => useLocationSearch())

    await act(async () => {
      result.current.search('Tokyo')
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.results).toEqual(locations)
    })
    expect(mockSearchLocations).toHaveBeenCalledWith('Tokyo', undefined, undefined)
  })

  it('clear resets results', async () => {
    mockSearchLocations.mockResolvedValue([{ displayName: 'A', lat: '0', lon: '0' }])
    const { result } = renderHook(() => useLocationSearch())
    await act(async () => {
      result.current.search('test')
    })
    await waitFor(() => expect(result.current.results).toHaveLength(1))
    act(() => {
      result.current.clear()
    })
    await waitFor(() => expect(result.current.results).toEqual([]))
  })
})
