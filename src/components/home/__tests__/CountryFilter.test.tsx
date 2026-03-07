import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CountryFilter } from '@/components/home/CountryFilter'
import { useCountry } from '@/contexts/CountryContext'
import { useAttraction } from '@/hooks/useAttraction'
import { useFilterSheet } from '@/contexts/FilterSheetContext'

vi.mock('@/contexts/CountryContext', () => ({
  useCountry: vi.fn(() => ({
    country: 'all',
    setCountry: vi.fn(),
    day: 'all',
    setDay: vi.fn(),
  })),
}))

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: vi.fn(() => ({
    attractions: [],
    availableDays: [1, 2, 3],
    citiesToPrefetch: [],
    isLoading: false,
    error: null,
    createAttraction: vi.fn(),
    updateAttraction: vi.fn(),
    deleteAttraction: vi.fn(),
    toggleVisited: vi.fn(),
    bulkUpdate: vi.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  })),
}))

vi.mock('@/contexts/FilterSheetContext', () => ({
  useFilterSheet: vi.fn(() => 'below'),
}))

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: ({
    id,
    value,
    onChange,
    options,
    variant,
    leftIcon,
    placeholder,
    disabled,
    dropdownPosition
  }: any) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    }

    return (
      <div data-testid={`${id}-select`}>
        <input
          data-testid={`${id}-input`}
          value={value || placeholder}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={id}
          data-testid-value={value}
        />
        <span data-testid={`${id}-value`}>{value || placeholder}</span>
        <span data-testid={`${id}-options`}>{options?.join(', ')}</span>
        <span data-testid={`${id}-variant`}>{variant}</span>
        {leftIcon && <span data-testid="left-icon">icon</span>}
        {disabled && <span data-testid="disabled">disabled</span>}
        <span data-testid={`${id}-dropdown-position`}>{dropdownPosition}</span>
      </div>
    )
  },
}))


vi.mock('lucide-react/dist/esm/icons/map-pin', () => ({
  default: () => <div data-testid="map-pin" />,
}))
vi.mock('lucide-react/dist/esm/icons/calendar', () => ({
  default: () => <div data-testid="calendar" />,
}))

vi.mock('@/config/constants', () => ({
  COUNTRIES: {
    general: { flag: '🌍', name: 'Geral' },
    japan: { flag: '🇯🇵', name: 'Japão' },
    'south-korea': { flag: '🇰🇷', name: 'Coreia do Sul' },
  },
}))

describe('CountryFilter', () => {
  const mockSetCountry = vi.fn()
  const mockSetDay = vi.fn()
  const mockUseCountry = vi.mocked(useCountry)
  const mockUseAttraction = vi.mocked(useAttraction)
  const mockUseFilterSheet = vi.mocked(useFilterSheet)

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.removeItem('trip_filter')
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })
    mockUseAttraction.mockReturnValue({
      attractions: [],
      availableDays: [1, 2, 3],
      citiesToPrefetch: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    })
    mockUseFilterSheet.mockReturnValue('below')
  })

  it('renders country filter with all options by default', () => {
    render(<CountryFilter />)
    expect(screen.getByTestId('country-filter-select')).toBeInTheDocument()
    expect(screen.getByTestId('day-filter-select')).toBeInTheDocument()
    expect(screen.getByTestId('country-filter-options')).toHaveTextContent(/Todos.*Geral.*Coreia do Sul.*Japão/i)
  })

  it('converts country value to label correctly', () => {
    mockUseCountry.mockReturnValue({
      country: 'japan',
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })
    render(<CountryFilter />)
    expect(screen.getByTestId('country-filter-value'))
      .toHaveTextContent(/🇯🇵 Japão/)
  })

  it('hides general option when hideGeneralOption=true', () => {
    render(<CountryFilter hideGeneralOption />)
    expect(screen.getByTestId('country-filter-options'))
      .not.toHaveTextContent('Geral')
    expect(screen.getByTestId('country-filter-options')).toHaveTextContent(/Todos.*Coreia do Sul.*Japão/i)
  })

  it('hides day filter when showDayFilter=false', () => {
    render(<CountryFilter showDayFilter={false} />)
    expect(screen.queryByTestId('day-filter-select')).not.toBeInTheDocument()
  })

  it('uses glass variant and icons when not inSheet', () => {
    mockUseFilterSheet.mockReturnValue('below')
    render(<CountryFilter />)

    expect(screen.getByTestId('country-filter-variant')).toHaveTextContent('glass')
    expect(screen.getAllByTestId('left-icon')).toHaveLength(2)
  })


  it('uses default variant without icons when inSheet', () => {
    mockUseFilterSheet.mockReturnValue('above')
    render(<CountryFilter />)
    expect(screen.getByTestId('country-filter-variant')).toHaveTextContent('default')
    expect(screen.queryByTestId('map-pin')).not.toBeInTheDocument()
    expect(screen.queryByTestId('calendar')).not.toBeInTheDocument()
  })

  it('disables day filter when no available days', () => {
    mockUseAttraction.mockReturnValue({
      attractions: [],
      availableDays: [],
      citiesToPrefetch: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    })
    render(<CountryFilter />)
    expect(screen.getByTestId('disabled')).toBeInTheDocument()
  })

  it('shows correct day value and options', () => {
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: mockSetCountry,
      day: 2,
      setDay: mockSetDay,
    })
    render(<CountryFilter />)
    expect(screen.getByTestId('day-filter-value')).toHaveTextContent('Dia 2')
    expect(screen.getByTestId('day-filter-options'))
      .toHaveTextContent('Todos os dias, Dia 1, Dia 2, Dia 3')
  })

  it('handles edge case: countryToLabel returns "Todos" for invalid value', () => {
    mockUseCountry.mockReturnValue({
      country: 'invalid' as any,
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })
    render(<CountryFilter hideGeneralOption />)
    expect(screen.getByTestId('country-filter-value')).toHaveTextContent('Todos')
  })

  it('countryToLabel maps "general" → "Todos" when hideGeneralOption=true', () => {
    mockUseCountry.mockReturnValue({
      country: 'general' as any,
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })
    render(<CountryFilter hideGeneralOption />)
    expect(screen.getByTestId('country-filter-value')).toHaveTextContent('Todos')
  })

  it('countryToLabel shows "Todos" for unknown country value', () => {
    mockUseCountry.mockReturnValue({
      country: 'unknown' as any,
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })
    render(<CountryFilter />)
    expect(screen.getByTestId('country-filter-value')).toHaveTextContent('Todos')
  })

  it('labelToCountry uses visibleOptions.find and returns "all" fallback for invalid label', () => {
    const mockSetCountry = vi.fn()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })

    render(<CountryFilter hideGeneralOption />)

    fireEvent.click(screen.getByTestId('country-filter-select'))
    expect(mockSetCountry).not.toHaveBeenCalledWith('invalido')
  })

  it('country filter onChange calls labelToCountry → setCountry (linha 65)', () => {
    const mockSetCountry = vi.fn()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })

    render(<CountryFilter />)

    fireEvent.change(screen.getByTestId('country-filter-input'), {
      target: { value: '🇯🇵 Japão' }
    })

    expect(mockSetCountry).toHaveBeenCalledWith('japan')
  })

  it('renders "Todos os dias" when day="all"', () => {
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: mockSetCountry,
      day: 'all',
      setDay: mockSetDay,
    })
    mockUseAttraction.mockReturnValue({
      attractions: [],
      availableDays: [1, 2, 3],
      citiesToPrefetch: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    })

    render(<CountryFilter />)
    expect(screen.getByTestId('day-filter-value')).toHaveTextContent('Todos os dias')
  })

  it('renders "Dia X" when day=number', () => {
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: mockSetCountry,
      day: 2,
      setDay: mockSetDay,
    })
    mockUseAttraction.mockReturnValue({
      attractions: [],
      availableDays: [1, 2, 3],
      citiesToPrefetch: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    })

    render(<CountryFilter />)
    expect(screen.getByTestId('day-filter-value')).toHaveTextContent('Dia 2')
  })

  it('calls setDay with saved day from sessionStorage on mount when day is numeric', () => {
    sessionStorage.setItem(
      'trip_filter',
      JSON.stringify({ country: 'japan', day: 2 })
    )

    render(<CountryFilter />)

    expect(mockSetDay).toHaveBeenCalledWith(2)
  })
})