import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const fitBoundsMock = vi.fn()

vi.mock('react-leaflet', () => ({
  useMap: () => ({
    fitBounds: fitBoundsMock,
  }),
}))

import { FitBounds } from '../FitBounds'

const createPoint = (overrides: any = {}) => ({
  lat: 10,
  lng: 20,
  ...overrides,
})

describe('FitBounds', () => {
  beforeEach(() => {
    vi.clearAllMocks()

      ; (window as any).L = {
        latLngBounds: vi.fn((points) => ({ mockedBounds: points })),
      }
  })

  it('does nothing when attractions array is empty', () => {
    render(<FitBounds attractions={[]} />)

    expect(fitBoundsMock).not.toHaveBeenCalled()
  })

  it('filters invalid coordinates before fitting bounds', () => {
    render(
      <FitBounds
        attractions={[
          createPoint({ lat: 10, lng: 20 }),
          createPoint({ lat: undefined }),
          createPoint({ lng: undefined }),
        ] as any}
      />
    )

    expect(window.L.latLngBounds).toHaveBeenCalledWith([[10, 20]])
    expect(fitBoundsMock).toHaveBeenCalledTimes(1)
  })

  it('calls fitBounds when there are valid points', () => {
    render(
      <FitBounds
        attractions={[
          createPoint({ lat: 1, lng: 2 }),
          createPoint({ lat: 3, lng: 4 }),
        ]}
      />
    )

    expect(window.L.latLngBounds).toHaveBeenCalledWith([
      [1, 2],
      [3, 4],
    ])

    expect(fitBoundsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mockedBounds: [
          [1, 2],
          [3, 4],
        ],
      }),
      { padding: [50, 50] }
    )
  })

  it('does not call fitBounds when no valid points remain', () => {
    render(
      <FitBounds
        attractions={[
          createPoint({ lat: undefined }),
          createPoint({ lng: undefined }),
        ] as any}
      />
    )

    expect(fitBoundsMock).not.toHaveBeenCalled()
  })

  it('does nothing when Leaflet global is missing', () => {
    delete (window as any).L

    render(
      <FitBounds
        attractions={[createPoint({ lat: 1, lng: 2 })]}
      />
    )

    expect(fitBoundsMock).not.toHaveBeenCalled()
  })

  it('re-runs when attractions change', () => {
    const { rerender } = render(
      <FitBounds attractions={[createPoint({ lat: 1, lng: 2 })]} />
    )

    expect(fitBoundsMock).toHaveBeenCalledTimes(1)

    rerender(
      <FitBounds attractions={[createPoint({ lat: 3, lng: 4 })]} />
    )

    expect(fitBoundsMock).toHaveBeenCalledTimes(2)
  })
})