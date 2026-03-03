import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/test-path' }),
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
}))

const mockUseCountry = vi.fn()
const mockUseAccommodation = vi.fn()
const mockUseAttraction = vi.fn()
const mockUseOSRMRoutesQuery = vi.fn()

vi.mock('@/contexts/CountryContext', () => ({
  useCountry: () => mockUseCountry(),
}))

vi.mock('@/hooks/useAccommodation', () => ({
  useAccommodation: () => mockUseAccommodation(),
}))

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: (country: string) => mockUseAttraction(country),
}))

vi.mock('@/hooks/useOSRMRoutesQuery', () => ({
  useOSRMRoutesQuery: (...args: any[]) =>
    mockUseOSRMRoutesQuery(...args),
}))

vi.mock('@/utils/typeGuards', () => ({
  isMappableAttraction: (a: any) =>
    typeof a.lat === 'number' && typeof a.lng === 'number',
}))

const fitBoundsSpy = vi.fn()
const mapRoutesSpy = vi.fn()

vi.mock('@/components/map/FitBounds', () => ({
  FitBounds: (props: any) => {
    fitBoundsSpy(props)
    return <div data-testid="fit-bounds" />
  },
}))

vi.mock('@/components/map/MapRoutes', () => ({
  MapRoutes: (props: any) => {
    mapRoutesSpy(props)
    return <div data-testid="map-routes" />
  },
}))

import { MapView } from '../MapView'

const createAttraction = (overrides: any = {}) => ({
  id: Math.random(),
  name: 'Test',
  country: 'japan',
  city: 'Tokyo',
  day: 1,
  date: '2025-01-01',
  dayOfWeek: 'Mon',
  type: 'park',
  order: 1,
  visited: false,
  needsReservation: false,
  couplePrice: 0,
  currency: 'JPY',
  priceInBRL: 0,
  lat: 35,
  lng: 139,
  ...overrides,
})

const createAccommodation = (overrides: any = {}) => ({
  id: Math.random(),
  city: 'Tokyo',
  lat: 35.1,
  lng: 139.1,
  ...overrides,
})

describe('MapView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseOSRMRoutesQuery.mockReturnValue({ routes: [] })

    mockUseCountry.mockReturnValue({
      country: 'japan',
      day: 'all',
    })

    mockUseAccommodation.mockReturnValue({
      accommodations: [],
    })

    mockUseAttraction.mockReturnValue({
      attractions: [],
    })
  })

  it('renders map container and children', () => {
    render(<MapView />)

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
    expect(screen.getByTestId('fit-bounds')).toBeInTheDocument()
    expect(screen.getByTestId('map-routes')).toBeInTheDocument()
  })

  it('filters attractions by selected day', () => {
    mockUseCountry.mockReturnValue({
      country: 'japan',
      day: '1',
    })

    mockUseAttraction.mockReturnValue({
      attractions: [
        createAttraction({ id: 1, day: 1 }),
        createAttraction({ id: 2, day: 2 }),
      ],
    })

    render(<MapView />)

    const fitBoundsProps = fitBoundsSpy.mock.calls[0][0]
    expect(fitBoundsProps.attractions).toHaveLength(1)
    expect(fitBoundsProps.attractions[0].day).toBe(1)
  })

  it('keeps all attractions when day is "all"', () => {
    mockUseCountry.mockReturnValue({
      country: 'japan',
      day: 'all',
    })

    mockUseAttraction.mockReturnValue({
      attractions: [
        createAttraction({ id: 1, day: 1 }),
        createAttraction({ id: 2, day: 2 }),
      ],
    })

    render(<MapView />)

    const fitBoundsProps = fitBoundsSpy.mock.calls[0][0]
    expect(fitBoundsProps.attractions).toHaveLength(2)
  })

  it('filters accommodations by first attraction city when day is specific', () => {
    mockUseCountry.mockReturnValue({
      country: 'japan',
      day: '1',
    })

    mockUseAttraction.mockReturnValue({
      attractions: [
        createAttraction({ id: 1, city: 'Tokyo', day: 1, order: 1 }),
      ],
    })

    mockUseAccommodation.mockReturnValue({
      accommodations: [
        createAccommodation({ id: 10, city: 'Tokyo' }),
        createAccommodation({ id: 11, city: 'Osaka' }),
      ],
    })

    render(<MapView />)

    const mapRoutesProps = mapRoutesSpy.mock.calls[0][0]
    expect(mapRoutesProps.accommodations).toHaveLength(1)
    expect(mapRoutesProps.accommodations[0].city).toBe('Tokyo')
  })

  it('highlights first non-visited attraction', () => {
    mockUseAttraction.mockReturnValue({
      attractions: [
        createAttraction({ id: 1, order: 1, visited: true }),
        createAttraction({ id: 2, order: 2, visited: false }),
      ],
    })

    render(<MapView />)

    const mapRoutesProps = mapRoutesSpy.mock.calls[0][0]
    expect(mapRoutesProps.highlightAttractionId).toBe(2)
  })

  it('groups attractions by day correctly', () => {
    mockUseAttraction.mockReturnValue({
      attractions: [
        createAttraction({ id: 1, day: 1 }),
        createAttraction({ id: 2, day: 1 }),
        createAttraction({ id: 3, day: 2 }),
      ],
    })

    render(<MapView />)

    const mapRoutesProps = mapRoutesSpy.mock.calls[0][0]
    const grouped = mapRoutesProps.groupedByDay

    expect(grouped[1]).toHaveLength(2)
    expect(grouped[2]).toHaveLength(1)
  })

  it('passes routes from OSRM hook to MapRoutes', () => {
    mockUseOSRMRoutesQuery.mockReturnValue({
      routes: ['route-1'],
    })

    render(<MapView />)

    const mapRoutesProps = mapRoutesSpy.mock.calls[0][0]
    expect(mapRoutesProps.routes).toEqual(['route-1'])
  })

  it('mounts without crashing (leaflet css effect)', () => {
    render(<MapView />)

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
})