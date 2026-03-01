import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaQuery } from '../useMediaQuery'

describe('useMediaQuery', () => {
  const mockMatchMedia = vi.fn()
  let listeners: Array<() => void> = []

  beforeEach(() => {
    listeners = []
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)',
      addEventListener: (_: string, listener: () => void) => {
        listeners.push(listener)
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial matches from media query', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)')
    expect(result.current).toBe(true)
  })

  it('returns false for non-matching query', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 400px)'))
    expect(result.current).toBe(false)
  })
})
