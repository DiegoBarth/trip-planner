import { renderHook, act } from '@testing-library/react'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { useNavigate, useLocation } from 'react-router-dom'
import { SWIPE_ROUTES, EDGE_ZONE, SWIPE_MIN_DISTANCE_PX, TOP_PULL_ZONE_PX } from '@/config/constants'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}))

vi.mock('react-swipeable', () => ({
  useSwipeable: vi.fn((handlers) => ({
    ref: vi.fn(),
    ...handlers
  })),
}))

describe('useSwipeNavigation', () => {
  const mockNavigate = vi.fn()
  const mockLocation = { pathname: SWIPE_ROUTES[1] }

  beforeEach(() => {
    vi.clearAllMocks()
      ; (useNavigate as Mock).mockReturnValue(mockNavigate)
      ; (useLocation as Mock).mockReturnValue(mockLocation)

    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true, configurable: true })
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    })
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  it('should initialize with null arrow', () => {
    const { result } = renderHook(() => useSwipeNavigation())
    expect(result.current.arrow).toBeNull()
    expect(result.current.handlers).toBeDefined()
  })

  it('should set arrow left when swiping right from left edge', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [EDGE_ZONE - 1, 0],
        deltaX: SWIPE_MIN_DISTANCE_PX + 1,
        deltaY: 0,
      })
    })

    expect(result.current.arrow).toBe('left')
  })

  it('should set arrow right when swiping left from right edge', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [window.innerWidth - EDGE_ZONE + 1, 0],
        deltaX: -(SWIPE_MIN_DISTANCE_PX + 1),
        deltaY: 0,
      })
    })

    expect(result.current.arrow).toBe('right')
  })

  it('should navigate to next route on swiped left from right edge', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedLeft({
        initial: [window.innerWidth - EDGE_ZONE + 1, 0],
        deltaX: -(SWIPE_MIN_DISTANCE_PX + 1),
        deltaY: 0,
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith(SWIPE_ROUTES[2])
  })

  it('should navigate to previous route on swiped right from left edge', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedRight({
        initial: [EDGE_ZONE - 1, 0],
        deltaX: SWIPE_MIN_DISTANCE_PX + 1,
        deltaY: 0,
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith(SWIPE_ROUTES[0])
  })

  it('should reset arrow on onTouchEndOrOnMouseUp', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onTouchEndOrOnMouseUp()
    })

    expect(result.current.arrow).toBeNull()
  })

  it('should set arrow "up" when swiping down from the top', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [500, 0],
        deltaX: 0,
        deltaY: SWIPE_MIN_DISTANCE_PX + 1,
      })
    })

    expect(result.current.arrow).toBe('up')
  })

  it('should reset arrow "up" if swiping condition is no longer met', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [500, 0],
        deltaX: 0,
        deltaY: SWIPE_MIN_DISTANCE_PX + 1,
      })
    })

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [500, 0],
        deltaX: 100,
        deltaY: 0,
      })
    })

    expect(result.current.arrow).toBeNull()
  })

  it('should reload page on swiped down from the top', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedDown({
        initial: [100, TOP_PULL_ZONE_PX - 10],
        deltaY: SWIPE_MIN_DISTANCE_PX * 2 + 1,
      })
    })

    expect(result.current.arrow).toBeNull()
    expect(window.location.reload).toHaveBeenCalled()
  })

  it('should clear arrow "up" when moving away from pull-down condition', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [500, 0],
        deltaX: 0,
        deltaY: SWIPE_MIN_DISTANCE_PX + 1
      })
    })
    expect(result.current.arrow).toBe('up')

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwiping({
        initial: [500, 0],
        deltaX: SWIPE_MIN_DISTANCE_PX + 10,
        deltaY: 0
      })
    })
    expect(result.current.arrow).toBeNull()
  })

  it('should not navigate on onSwipedLeft when not startedOnRight', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedLeft({
        initial: [EDGE_ZONE - 1, 0],
        deltaX: -(SWIPE_MIN_DISTANCE_PX + 1),
        deltaY: 0,
      })
    })

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })

  it('should not navigate on onSwipedLeft when no next index', () => {
    ; (useLocation as Mock).mockReturnValue({ pathname: SWIPE_ROUTES[SWIPE_ROUTES.length - 1] })
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedLeft({
        initial: [window.innerWidth - EDGE_ZONE + 1, 0],
        deltaX: -(SWIPE_MIN_DISTANCE_PX + 1),
        deltaY: 0,
      })
    })

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })

  it('should not navigate on onSwipedRight when not startedOnLeft', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedRight({
        initial: [window.innerWidth - EDGE_ZONE + 1, 0],
        deltaX: SWIPE_MIN_DISTANCE_PX + 1,
        deltaY: 0,
      })
    })

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })

  it('should not navigate on onSwipedRight when no previous index', () => {
    ; (useLocation as Mock).mockReturnValue({ pathname: SWIPE_ROUTES[0] })
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedRight({
        initial: [EDGE_ZONE - 1, 0],
        deltaX: SWIPE_MIN_DISTANCE_PX + 1,
        deltaY: 0,
      })
    })

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })

  it('should not reload on onSwipedDown when scrollY !== 0', () => {
    Object.defineProperty(window, 'scrollY', { value: 1, writable: true, configurable: true })
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedDown({
        initial: [100, TOP_PULL_ZONE_PX - 10],
        deltaY: SWIPE_MIN_DISTANCE_PX * 2 + 1,
      })
    })

    expect(window.location.reload).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })

  it('should not reload on onSwipedDown when deltaY insuficiente', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedDown({
        initial: [100, TOP_PULL_ZONE_PX - 10],
        deltaY: SWIPE_MIN_DISTANCE_PX * 2 - 1,
      })
    })

    expect(window.location.reload).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })

  it('should not reload on onSwipedDown when touch did not start at top zone', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
    const { result } = renderHook(() => useSwipeNavigation())

    act(() => {
      const handlers = result.current.handlers as any
      handlers.onSwipedDown({
        initial: [100, TOP_PULL_ZONE_PX + 20],
        deltaY: SWIPE_MIN_DISTANCE_PX * 2 + 1,
      })
    })

    expect(window.location.reload).not.toHaveBeenCalled()
    expect(result.current.arrow).toBeNull()
  })
  it('COVERS LINE 34 - else if (arrow === "up")', () => {
    const { result, unmount } = renderHook(() => useSwipeNavigation())
    const handlers = result.current.handlers as any

    act(() => {
      handlers.onSwiping({ initial: [500, 0], deltaX: 0, deltaY: 60 })
    })

    unmount()
    const { result: result2 } = renderHook(() => useSwipeNavigation())
    const handlers2 = result2.current.handlers as any

    act(() => {
      handlers2.onSwiping({
        initial: [500, 0],
        deltaX: 0,
        deltaY: 40 
      })
    })

    expect(result2.current.arrow).toBeNull()
  })
})