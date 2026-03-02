import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TimelinePage from '../TimelinePage'
import { createPageWrapper } from './pageWrapper'
import { useCountry } from '@/contexts/CountryContext'
import { useAttraction } from '@/hooks/useAttraction'
import { useAccommodation } from '@/hooks/useAccommodation'
import { useOSRMRoutesQuery } from '@/hooks/useOSRMRoutesQuery'
import { useToast } from '@/contexts/toast'
import { buildDayTimeline } from '@/services/timelineService'
import type { Attraction, Country } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'
import type { TimelineDay } from '@/types/Timeline'

vi.mock('@/contexts/CountryContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/CountryContext')>()
  return { ...actual, useCountry: vi.fn() }
})
vi.mock('@/hooks/useAttraction', () => ({ useAttraction: vi.fn() }))
vi.mock('@/hooks/useAccommodation', () => ({ useAccommodation: vi.fn() }))
vi.mock('@/hooks/useOSRMRoutesQuery', () => ({ useOSRMRoutesQuery: vi.fn() }))
vi.mock('@/contexts/toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/toast')>()
  return { ...actual, useToast: vi.fn() }
})
vi.mock('@/services/timelineService', () => ({
  buildDayTimeline: vi.fn(),
}))
vi.mock('@/utils/exportTimelineToPDF', () => ({
  exportTimelineToPDF: vi.fn(),
}))

vi.mock('@/components/timeline/Timeline', () => ({
  default: function Timeline({
    timeline,
    onToggleVisited,
  }: {
    timeline: TimelineDay | null
    onToggleVisited?: (id: number) => void
  }) {
    return (
      <div data-testid="timeline-component">
        {timeline ? (
          <>
            <span data-testid="timeline-day">Dia {timeline.dayNumber}</span>
            {timeline.attractions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onToggleVisited?.(a.id)}
                aria-label={`Toggle visitado ${a.name}`}
              >
                {a.name}
              </button>
            ))}
          </>
        ) : (
          <span>Nenhuma atração para mostrar na timeline</span>
        )}
      </div>
    )
  },
}))

const mockUseCountry = vi.mocked(useCountry)
const mockUseAttraction = vi.mocked(useAttraction)
const mockUseAccommodation = vi.mocked(useAccommodation)
const mockUseOSRMRoutesQuery = vi.mocked(useOSRMRoutesQuery)
const mockUseToast = vi.mocked(useToast)
const mockBuildDayTimeline = vi.mocked(buildDayTimeline)

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'Templo',
    country: 'japan' as Country,
    city: 'Tokyo',
    day: 1,
    date: '2025-03-01',
    dayOfWeek: 'Seg',
    type: 'temple',
    order: 0,
    couplePrice: 1000,
    currency: 'JPY',
    priceInBRL: 50,
    visited: false,
    needsReservation: false,
    lat: 35.68,
    lng: 139.76,
    ...overrides,
  } as Attraction
}

function makeTimelineDay(dayNum: number, attractions: Attraction[]): TimelineDay {
  return {
    date: attractions[0]?.date ?? '2025-03-01',
    dayNumber: dayNum,
    attractions,
    segments: [],
    conflicts: [],
    totalDistance: 0,
    totalTravelTime: 0,
    startTime: '09:00',
    endTime: '18:00',
  }
}

describe('TimelinePage', () => {
  const Wrapper = createPageWrapper()
  const mockSuccess = vi.fn()
  const mockError = vi.fn()
  const mockSetDay = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 1,
      setDay: mockSetDay,
    })
    mockUseToast.mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
      warning: vi.fn(),
      clear: vi.fn(),
    })
    mockUseAttraction.mockReturnValue({
      attractions: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn().mockResolvedValue(undefined),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockUseAccommodation.mockReturnValue({
      accommodations: [] as Accommodation[],
      isLoading: false,
      error: null,
    })
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    mockBuildDayTimeline.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loading spinner when isLoading', () => {
    mockUseAttraction.mockReturnValue({
      attractions: [],
      isLoading: true,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders page header with title and subtitle', () => {
    render(<TimelinePage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Timeline/i })).toBeInTheDocument()
    expect(screen.getByText(/Visualize seu dia com rotas e clima/i)).toBeInTheDocument()
  })

  it('syncs day from searchParams when valid integer', () => {
    const WrapperWithDay = createPageWrapper(['/timeline?day=2'])
    render(<TimelinePage />, { wrapper: WrapperWithDay })
    expect(mockSetDay).toHaveBeenCalledWith(2)
  })

  it('shows empty state when day is all and no mappable attractions', () => {
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: mockSetDay,
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    expect(screen.getByText(/Nenhuma atração com coordenadas/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ir para Atrações/i })).toBeInTheDocument()
  })

  it('shows empty state when day is specific and no attractions for that day', () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ id: 1, day: 2, lat: 35.68, lng: 139.76 })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [2],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    expect(screen.getByText(/Nenhuma atração para o Dia 1/i)).toBeInTheDocument()
  })

  it('shows loading routes message when isRoutesLoading', () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: true,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    expect(screen.getByText(/Carregando rotas em segundo plano/i)).toBeInTheDocument()
  })

  it('renders single Timeline when day is set and has mappable attractions', async () => {
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const timelineDay = makeTimelineDay(1, [att])
    mockBuildDayTimeline.mockResolvedValue(timelineDay)
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-day')).toHaveTextContent('Dia 1')
    })
  })

  it('calls handleToggleVisited and shows success toast', async () => {
    const toggleVisited = vi.fn().mockResolvedValue(undefined)
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited,
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(makeTimelineDay(1, [att]))
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Toggle visitado Templo/i }))
    await waitFor(() => {
      expect(toggleVisited).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Status da atração atualizado')
    })
  })

  it('handleToggleVisited error shows error toast', async () => {
    const toggleVisited = vi.fn().mockRejectedValue(new Error('API error'))
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited,
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(makeTimelineDay(1, [att]))
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Toggle visitado Templo/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar atração')
    })
    errSpy.mockRestore()
  })

  it('does not show export button when no timeline data', () => {
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: mockSetDay,
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    expect(screen.queryByRole('button', { name: /Exportar PDF/i })).not.toBeInTheDocument()
  })

  it('shows export button and exports PDF for single day', async () => {
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    const timelineDay = makeTimelineDay(1, [att])
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(timelineDay)
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    const { exportTimelineToPDF } = await import('@/utils/exportTimelineToPDF')
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })
    const exportBtn = screen.getByRole('button', { name: /Exportar PDF/i })
    expect(exportBtn).toBeInTheDocument()
    fireEvent.click(exportBtn)
    await waitFor(() => {
      expect(exportTimelineToPDF).toHaveBeenCalledWith([timelineDay])
      expect(mockSuccess).toHaveBeenCalledWith('PDF exportado com sucesso!')
    })
  })

  it('export PDF single day shows error when no timeline generated', async () => {
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(null)
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })
    const exportBtn = screen.getByRole('button', { name: /Exportar PDF/i })
    fireEvent.click(exportBtn)
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Nenhuma timeline gerada para exportar')
    })
  })

  it('export PDF all days path exports and shows success', async () => {
    const att1 = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    const att2 = makeAttraction({ id: 2, day: 2, lat: 35.69, lng: 139.77 })
    mockBuildDayTimeline.mockImplementation((_attrs: Attraction[]) =>
      Promise.resolve(makeTimelineDay(_attrs[0]?.day ?? 1, _attrs))
    )
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: mockSetDay,
    })
    mockUseAttraction.mockReturnValue({
      attractions: [att1, att2],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1, 2],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: { 1: [], 2: [] },
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getAllByTestId('timeline-component').length).toBeGreaterThanOrEqual(1)
    })
    const exportBtn = screen.getByRole('button', { name: /Exportar PDF/i })
    fireEvent.click(exportBtn)
    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith('PDF exportado com sucesso!')
    })
  })

  it('export PDF catch error shows error toast', async () => {
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    const { exportTimelineToPDF } = await import('@/utils/exportTimelineToPDF')
    vi.mocked(exportTimelineToPDF).mockImplementation(() => {
      throw new Error('PDF failed')
    })
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(makeTimelineDay(1, [att]))
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Exportar PDF/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao exportar PDF')
    })
    errSpy.mockRestore()
  })

  it('day label shows "Dia 1" when day is 1 and has attractions', async () => {
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(makeTimelineDay(1, [att]))
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: {},
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Dia 1 - Visualize seu dia com rotas e clima/i)).toBeInTheDocument()
    })
  })

  it('day label shows "1 dia" when day is all and one day group', async () => {
    const att = makeAttraction({ id: 1, day: 1, lat: 35.68, lng: 139.76 })
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: mockSetDay,
    })
    mockUseAttraction.mockReturnValue({
      attractions: [att],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockBuildDayTimeline.mockResolvedValue(makeTimelineDay(1, [att]))
    mockUseOSRMRoutesQuery.mockReturnValue({
      segmentsByDay: { 1: [] },
      isRoutesLoading: false,
      routes: {},
      distances: {},
      refetch: vi.fn(),
    })
    render(<TimelinePage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/1 dia - Visualize seu dia com rotas e clima/i)).toBeInTheDocument()
    })
  })
})
