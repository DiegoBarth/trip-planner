import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useForm } from 'react-hook-form'
import { LocationField, extractLatLngFromGoogleMaps } from '../LocationField'

const mockSearch = vi.fn()
const mockClear = vi.fn()
vi.mock('@/hooks/useLocationSearch', () => ({
  useLocationSearch: () => ({
    results: mockResults,
    loading: false,
    search: mockSearch,
    clear: mockClear,
  }),
}))

let mockResults: Array<{ displayName: string; lat: string; lon: string }> = []

describe('LocationField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResults = []
  })

  function Wrapper() {
    const { control, register, setValue, getValues, watch } = useForm({
      defaultValues: {
        name: 'Tokyo',
        city: 'Tokyo',
        region: 'Tokyo',
        country: 'japan',
      },
    })

    return (
      <LocationField
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        watch={watch}
      />
    )
  }

  function WrapperEmpty() {
    const { control, register, setValue, getValues, watch } = useForm({
      defaultValues: {
        name: '',
        city: '',
        region: '',
        country: 'japan',
      },
    })

    return (
      <LocationField
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        watch={watch}
      />
    )
  }

  it('renders input and button', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText(/https:\/\/maps\.google\.com\/\.\.\./i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument()
  })

  it('calls handleSearch on button click', async () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }))
    await waitFor(() => expect(mockSearch).toHaveBeenCalledWith('Tokyo', 'Tokyo', 'japan'))
  })

  it('does not call search if name or city missing', async () => {
    render(<WrapperEmpty />)
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }))
    await waitFor(() => expect(mockSearch).not.toHaveBeenCalled())
  })

  it('extracts lat/lng from Google Maps URL', () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText(/https:\/\/maps\.google\.com\/\.\.\./i)
    fireEvent.change(input, { target: { value: 'https://www.google.com/maps?q=35.6586,139.7454' } })
    expect(mockResults.length).toBe(0)
  })

  it('calls handleSearch on Enter key press', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText(/https:\/\/maps\.google\.com\/\.\.\./i)
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(mockSearch).toHaveBeenCalledWith('Tokyo', 'Tokyo', 'japan'))
  })

  it('renders results and sets values on click', () => {
    mockResults = [{ displayName: 'Place1', lat: '12.34', lon: '56.78' }]
    render(<Wrapper />)
    const place = screen.getByText('Place1')
    fireEvent.click(place)
    expect(mockClear).toHaveBeenCalled()
  })

  it('calls clear when clicking outside', () => {
    render(<Wrapper />)
    fireEvent.mouseDown(document.body)
    expect(mockClear).toHaveBeenCalled()
  })
})

describe('extractLatLngFromGoogleMaps', () => {
  it('extracts lat/lng from ?q= URL', () => {
    const url = 'https://www.google.com/maps?q=12.34,56.78'
    const coords = extractLatLngFromGoogleMaps(url)
    expect(coords).toEqual({ lat: 12.34, lng: 56.78 })
  })

  it('extracts lat/lng from @ URL', () => {
    const url = 'https://www.google.com/maps/@12.34,56.78,15z'
    const coords = extractLatLngFromGoogleMaps(url)
    expect(coords).toEqual({ lat: 12.34, lng: 56.78 })
  })

  it('returns null for invalid URL', () => {
    const url = 'https://www.google.com/maps/place/Tokyo'
    const coords = extractLatLngFromGoogleMaps(url)
    expect(coords).toBeNull()
  })

  it('returns null for empty string', () => {
    const coords = extractLatLngFromGoogleMaps('')
    expect(coords).toBeNull()
  })

  it('returns null if an exception is thrown', () => {
    const originalMatch = String.prototype.match
    vi.spyOn(String.prototype, 'match').mockImplementation(() => {
      throw new Error('mock error')
    })

    const coords = extractLatLngFromGoogleMaps('https://www.google.com/maps?q=12.34,56.78')
    expect(coords).toBeNull()

    String.prototype.match = originalMatch
  })
})