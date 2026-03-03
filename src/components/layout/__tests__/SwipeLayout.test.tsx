import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SwipeLayout } from '@/components/layout/SwipeLayout'

const handlersMock = {
  onTouchStart: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchEnd: vi.fn(),
}
vi.mock('@/hooks/useSwipeNavigation', () => ({
  useSwipeNavigation: () => ({
    handlers: handlersMock,
    arrow: 'left',
  }),
}))

vi.mock('@/components/ui/SwipeArrow', () => ({
  SwipeArrow: ({ direction }: { direction: string }) => (
    <div data-testid="swipe-arrow">{direction}</div>
  ),
}))

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}))

describe('SwipeLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders SwipeArrow with the correct direction', () => {
    render(<SwipeLayout />)
    const arrow = screen.getByTestId('swipe-arrow')
    expect(arrow).toBeInTheDocument()
    expect(arrow.textContent).toBe('left')
  })

  it('renders the Outlet', () => {
    render(<SwipeLayout />)
    const outlet = screen.getByTestId('outlet')
    expect(outlet).toBeInTheDocument()
    expect(outlet.textContent).toBe('Outlet Content')
  })

  it('calls swipe handlers when events are fired', () => {
    const { container } = render(<SwipeLayout />)
    const div = container.firstChild as HTMLElement

    fireEvent.touchStart(div)
    fireEvent.touchMove(div)
    fireEvent.touchEnd(div)

    expect(handlersMock.onTouchStart).toHaveBeenCalled()
    expect(handlersMock.onTouchMove).toHaveBeenCalled()
    expect(handlersMock.onTouchEnd).toHaveBeenCalled()
  })
})