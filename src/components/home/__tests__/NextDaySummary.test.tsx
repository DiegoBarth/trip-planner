import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NextDaySummary from '../NextDaySummary'
import { useCountry } from '@/contexts/CountryContext'
import { useAttraction } from '@/hooks/useAttraction'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/contexts/CountryContext', () => ({
  useCountry: vi.fn(() => ({
    country: 'all',
    setCountry: vi.fn(),
    day: 'all',
    setDay: vi.fn(),
  })),
}))

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: vi.fn(),
}))

const icons = ['calendar', 'map-pin', 'clock', 'navigation', 'chevron-right', 'check-circle-2', 'circle']
icons.forEach(name => {
  vi.mock(`lucide-react/dist/esm/icons/${name}`, () => ({
    default: () => <div data-testid={`${name}-icon`} />,
  }))
})

const originalOpen = window.open
beforeEach(() => {
  window.open = vi.fn()
})
afterEach(() => {
  vi.clearAllMocks()
  window.open = originalOpen
})

describe('NextDaySummary', () => {
  const mockUseCountry = vi.mocked(useCountry)
  const mockUseAttraction = vi.mocked(useAttraction)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: vi.fn(),
    })
  })

  const getDefaultHookReturn = (attractions: any[] = [], toggleVisited: any = vi.fn()) => ({
    attractions,
    availableDays: [1, 2, 3],
    citiesToPrefetch: [],
    isLoading: false,
    error: null,
    createAttraction: vi.fn(),
    updateAttraction: vi.fn(),
    deleteAttraction: vi.fn(),
    toggleVisited,
    bulkUpdate: vi.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  })

  it('renders empty state when no attractions', () => {
    mockUseAttraction.mockReturnValue(getDefaultHookReturn())

    render(
      <MemoryRouter initialEntries={['/']}>
        <NextDaySummary />
      </MemoryRouter>
    )
    expect(screen.getByText(/Nenhum dia planejado/i)).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('renders next day attractions correctly', () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const attractions = [
      { id: 1, name: 'Attraction 1', date: dateStr, lat: 1, lng: 2, order: 1, day: 1, visited: false },
      { id: 2, name: 'Attraction 2', date: dateStr, lat: 1, lng: 2, order: 2, day: 1, visited: true },
      { id: -999, name: 'Blocked Attraction', date: dateStr, lat: 1, lng: 2, order: 3, day: 1, visited: false },
    ]
    const toggleVisited = vi.fn()
    mockUseAttraction.mockReturnValue(getDefaultHookReturn(attractions, toggleVisited))

    render(
      <MemoryRouter initialEntries={['/']}>
        <NextDaySummary />
      </MemoryRouter>
    )

    expect(screen.getByText(/Attraction 1/i, { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText(/Attraction 2/i, { selector: 'span, p' })).toBeInTheDocument()
    expect(screen.getByText(/Blocked Attraction/i, { selector: 'span, p' })).toBeInTheDocument()

    const navButtons = screen.getAllByText(/Navegar/i)
    expect(navButtons.length).toBeGreaterThan(0)
    fireEvent.click(navButtons[0])
    expect(window.open).toHaveBeenCalled()
  })

  it('calls toggleVisited when clicking on visit button', () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const attractions = [
      { id: 1, name: 'Attraction 1', date: dateStr, lat: 1, lng: 2, order: 1, day: 1, visited: false },
      { id: -999, name: 'Blocked Attraction', date: dateStr, lat: 1, lng: 2, order: 2, day: 1, visited: false },
    ]
    const toggleVisited = vi.fn()
    mockUseAttraction.mockReturnValue(getDefaultHookReturn(attractions, toggleVisited))

    render(
      <MemoryRouter initialEntries={['/']}>
        <NextDaySummary />
      </MemoryRouter>
    )

    // Filtra pelo botão do Attraction 1
    const visitButton = screen.getAllByRole('button').find(button =>
      button.textContent?.includes('Attraction 1')
    )
    fireEvent.click(visitButton!)
    expect(toggleVisited).toHaveBeenCalledWith(1)
    expect(toggleVisited).toHaveBeenCalledTimes(1)
  })

  it('renders all attractions when count > 3', () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const attractions = Array.from({ length: 5 }).map((_, idx) => ({
      id: idx + 1,
      name: `Attraction ${idx + 1}`,
      lat: 1, lng: 2, order: idx + 1, day: 1, date: dateStr, visited: false,
    }))

    mockUseAttraction.mockReturnValue(getDefaultHookReturn(attractions))

    render(
      <MemoryRouter initialEntries={['/']}>
        <NextDaySummary />
      </MemoryRouter>
    )

    expect(screen.getByText('5 locais planejados')).toBeInTheDocument()
    expect(screen.getAllByText(/Attraction \d+/i)).toHaveLength(6)
  })

  it('finds next date after today (executa .find() + fallback null)', () => {
    const attractions = [
      { id: 1, name: 'Past', date: '2026-03-01', lat: 1, lng: 2, order: 1, day: 1, visited: false },
    ]

    mockUseAttraction.mockReturnValue(getDefaultHookReturn(attractions))

    render(
      <MemoryRouter initialEntries={['/']}>
        <NextDaySummary />
      </MemoryRouter>
    )

    expect(screen.getByText(/Nenhum dia planejado/i)).toBeInTheDocument()
  })

  it('renders attractions list quando !showTravelMode (executa <li>)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01'))

    const attractions = [
      { id: 1, name: 'Attraction 1', date: '2026-04-02', lat: 1, lng: 2, order: 1, day: 2, visited: false },
      { id: 2, name: 'Attraction 2', date: '2026-04-02', lat: 1, lng: 2, order: 2, day: 2, visited: false },
    ]

    mockUseAttraction.mockReturnValue({
      ...getDefaultHookReturn(attractions),
      toggleVisited: vi.fn()
    })

    mockUseCountry.mockReturnValue({
      country: 'japan',
      setCountry: vi.fn(),
      day: 'all',
      setDay: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <NextDaySummary />
      </MemoryRouter>
    )

    expect(screen.getByText(/Primeiros locais/i)).toBeInTheDocument()
    expect(screen.getByText(/Attraction 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Attraction 2/i)).toBeInTheDocument()

    expect(screen.queryByText(/Toque para marcar visitado/i)).not.toBeInTheDocument()

    vi.useRealTimers()
  })
})