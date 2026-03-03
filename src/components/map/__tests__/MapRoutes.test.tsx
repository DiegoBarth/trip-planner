import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/attraction/AttractionCard', () => ({
  AttractionCard: ({ attraction }: any) => (
    <div data-testid="attraction-card">{attraction.name}</div>
  ),
}))

vi.mock('react-leaflet', () => ({
  Marker: ({ children, eventHandlers, ...props }: any) => (
    <div
      data-testid="marker"
      ref={(el) => {
        if (el) (el as any)._eventHandlers = eventHandlers;
      }}
      {...props}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: any) => (
    <div data-testid="popup">{children}</div>
  ),
}))

vi.mock('react-leaflet-markercluster', () => ({
  default: ({ children }: any) => (
    <div data-testid="cluster">{children}</div>
  ),
}))

const { iconSpy, polylineSpy } = vi.hoisted(() => ({
  iconSpy: vi.fn<
    (color: string, type: string, point?: any) => any
  >(() => ({ mocked: true })),
  polylineSpy: vi.fn(),
}))

vi.mock('../PolylineWithArrows', () => ({
  PolylineWithArrows: (props: any) => {
    polylineSpy(props)
    return <div data-testid="polyline" />
  },
}))

vi.mock('../markers', () => ({
  createCustomIcon: iconSpy,
}))

// --- IMPORT DEPOIS DOS MOCKS --- //
import { MapRoutes } from '../MapRoutes'

// --- FUNÇÕES AUXILIARES --- //
const createAttraction = (overrides: any = {}) => ({
  id: Math.random(),
  name: 'Test Attraction',
  lat: 10,
  lng: 20,
  day: 1,
  type: 'temple',
  ...overrides,
})

const createAccommodation = (overrides: any = {}) => ({
  id: Math.random(),
  lat: 30,
  lng: 40,
  description: 'Hotel Test',
  address: 'Some address',
  ...overrides,
})

const getColorMock = vi.fn((d: number) => `color-${d}`)

// --- TESTES --- //
describe('MapRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders polylines only for days that have routes', () => {
    render(
      <MapRoutes
        groupedByDay={{ 1: [createAttraction()], 2: [createAttraction()] }}
        routes={{ 1: [[0, 0]] }}
        accommodations={[]}
        getColor={getColorMock}
      />
    )

    expect(polylineSpy).toHaveBeenCalledTimes(1)
    expect(polylineSpy.mock.calls[0][0].positions).toEqual([[0, 0]])
  })

  it('renders accommodation markers', () => {
    render(
      <MapRoutes
        groupedByDay={{}}
        routes={{}}
        accommodations={[createAccommodation(), createAccommodation()]}
        getColor={getColorMock}
      />
    )

    const markers = screen.getAllByTestId('marker')
    expect(markers.length).toBe(2)
  })

  it('creates correct Google Maps link for accommodation', () => {
    render(
      <MapRoutes
        groupedByDay={{}}
        routes={{}}
        accommodations={[createAccommodation({ lat: 1, lng: 2 })]}
        getColor={getColorMock}
      />
    )

    const link = screen.getByRole('link', { name: /abrir no google maps/i })
    expect(link).toHaveAttribute('href', 'https://www.google.com/maps?q=1,2')
  })

  it('renders attraction markers from groupedByDay', () => {
    render(
      <MapRoutes
        groupedByDay={{
          1: [createAttraction({ id: 1 }), createAttraction({ id: 2 })],
        }}
        routes={{}}
        accommodations={[]}
        getColor={getColorMock}
      />
    )

    const cards = screen.getAllByTestId('attraction-card')
    expect(cards).toHaveLength(2)
  })

  it('highlights the correct attraction', () => {
    render(
      <MapRoutes
        groupedByDay={{
          1: [
            createAttraction({ id: 1, day: 1 }),
            createAttraction({ id: 2, day: 1 }),
          ],
        }}
        routes={{}}
        accommodations={[]}
        getColor={getColorMock}
        highlightAttractionId={2}
      />
    )

    const highlightCall = iconSpy.mock.calls.find(
      (c) => c[0] === '#16a34a'
    )

    expect(highlightCall).toBeTruthy()
  })

  it('uses getColor for non-highlighted attractions', () => {
    render(
      <MapRoutes
        groupedByDay={{
          3: [createAttraction({ id: 10, day: 3 })],
        }}
        routes={{}}
        accommodations={[]}
        getColor={getColorMock}
      />
    )

    expect(getColorMock).toHaveBeenCalledWith(3)
  })

  it('renders MarkerClusterGroup wrapper', () => {
    render(
      <MapRoutes
        groupedByDay={{}}
        routes={{}}
        accommodations={[]}
        getColor={getColorMock}
      />
    )

    expect(screen.getByTestId('cluster')).toBeInTheDocument()
  })

  it('sets aria-label on accommodation marker via event handler', () => {
    render(
      <MapRoutes
        groupedByDay={{}}
        routes={{}}
        accommodations={[createAccommodation({ id: 1, description: 'Hotel ABC' })]}
        getColor={getColorMock}
      />
    )

    const marker = screen.getByTestId('marker')

    const fakeIcon = document.createElement('div')
    const handlers = (marker as any)._eventHandlers
    handlers.add({ target: { _icon: fakeIcon } })

    expect(fakeIcon.getAttribute('aria-label')).toContain('Hospedagem: Hotel ABC')
  })

  it('sets aria-label on attraction marker via event handler', () => {
    render(
      <MapRoutes
        groupedByDay={{
          1: [createAttraction({ id: 1, name: 'Temple X' })],
        }}
        routes={{}}
        accommodations={[]}
        getColor={getColorMock}
      />
    )

    const marker = screen.getAllByTestId('marker')[0]
    const fakeIcon = document.createElement('div')
    const handlers = (marker as any)._eventHandlers
    handlers.add({ target: { _icon: fakeIcon } })

    expect(fakeIcon.getAttribute('aria-label')).toContain('Temple X')
  })
})