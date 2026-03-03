import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PolylineWithArrows } from '../PolylineWithArrows'
import { useMap } from 'react-leaflet'

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(),
  Polyline: ({ children }: any) => <div>{children}</div>,
}))

describe('PolylineWithArrows', () => {
  let mapMock: any

  beforeEach(() => {
    mapMock = {
      removeLayer: vi.fn()
    } as any

    ;(window as any).L = {
      polyline: vi.fn(() => ({ addTo: vi.fn() })),
      polylineDecorator: vi.fn(() => ({ addTo: vi.fn() })),
      Symbol: { arrowHead: vi.fn(() => ({})) }
    }

    vi.mocked(useMap).mockReturnValue(mapMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders polyline and decorator when positions have at least 2 points', () => {
    const positions: [number, number][] = [
      [0, 0],
      [1, 1]
    ]
    
    render(
      <PolylineWithArrows
        positions={positions}
        pathOptions={{ color: 'red', weight: 3, opacity: 0.5 }}
      />
    )

    expect((window as any).L.polyline).toHaveBeenCalledWith(positions, {
      color: 'red',
      weight: 3,
      opacity: 0.5
    })
    expect((window as any).L.polylineDecorator).toHaveBeenCalledWith(positions, expect.any(Object))
  })

  it('does not render polyline if less than 2 positions', () => {
    const positions: [number, number][] = [[0, 0]]
    
    render(<PolylineWithArrows positions={positions} pathOptions={{ color: 'blue' }} />)

    expect((window as any).L.polyline).not.toHaveBeenCalled()
    expect((window as any).L.polylineDecorator).not.toHaveBeenCalled()
  })

  it('removes layers on unmount', () => {
    const positions: [number, number][] = [
      [0, 0],
      [1, 1]
    ]
    
    const { unmount } = render(
      <PolylineWithArrows
        positions={positions}
        pathOptions={{ color: 'green' }}
      />
    )

    unmount()

    expect(mapMock.removeLayer).toHaveBeenCalledTimes(2)
  })
})