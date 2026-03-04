import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { AttractionCard } from '../AttractionCard'
import type { Attraction } from '@/types/Attraction'

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((v: number) => `R$ ${v}`),
  formatTime: vi.fn((t: string) => t),
  formatDuration: vi.fn((d: number) => `${d}h`)
}))

const createAttraction = (overrides?: Partial<Attraction>): Attraction => ({
  id: 1,
  name: 'Tokyo Tower',
  country: 'japan',
  city: 'Tokyo',
  region: 'Kanto',
  day: 1,
  date: '2026-01-01',
  dayOfWeek: 'Monday',
  type: 'viewpoint',
  order: 1,
  visited: false,
  needsReservation: false,
  couplePrice: 100,
  currency: 'JPY',
  priceInBRL: 4,
  ...overrides
})

describe('AttractionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders attraction basic info', () => {
    const attraction = createAttraction()

    render(<AttractionCard attraction={attraction} />)

    expect(screen.getByText('Tokyo Tower')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('Kanto, Tokyo')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const attraction = createAttraction()
    const onClick = vi.fn()

    render(<AttractionCard attraction={attraction} onClick={onClick} />)

    fireEvent.click(screen.getByText('Tokyo Tower'))
    expect(onClick).toHaveBeenCalled()
  })

  it('calls onDelete when delete button is clicked', () => {
    const attraction = createAttraction()
    const onDelete = vi.fn()

    render(<AttractionCard attraction={attraction} onDelete={onDelete} />)

    fireEvent.click(screen.getByLabelText(/Excluir/i))
    expect(onDelete).toHaveBeenCalledWith(attraction.id)
  })

  it('calls onCheckVisited when visited button is clicked', () => {
    const attraction = createAttraction()
    const onCheckVisited = vi.fn()

    render(
      <AttractionCard
        attraction={attraction}
        onCheckVisited={onCheckVisited}
      />
    )

    fireEvent.click(screen.getByLabelText(/Marcar como visitado/i))
    expect(onCheckVisited).toHaveBeenCalledWith(attraction.id)
  })

  it('renders image when imageUrl exists', () => {
    const attraction = createAttraction({
      imageUrl: 'https://example.com/image.jpg'
    })

    render(<AttractionCard attraction={attraction} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('renders placeholder icon when no image exists', () => {
    const attraction = createAttraction({
      imageUrl: '',
      thumbnailUrl: ''
    })

    render(<AttractionCard attraction={attraction} />)

    // placeholder uses emoji, so just ensure no img exists
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows free label when couplePrice is zero', () => {
    const attraction = createAttraction({
      couplePrice: 0
    })

    render(<AttractionCard attraction={attraction} />)

    expect(screen.getByText(/Gratuito/i)).toBeInTheDocument()
  })

  it('shows formatted price when paid', () => {
    const attraction = createAttraction({
      couplePrice: 200
    })

    render(<AttractionCard attraction={attraction} />)

    expect(screen.getByText(/R\$ 200/)).toBeInTheDocument()
  })

  it('shows closed badge when closed on visit day', () => {
    const attraction = createAttraction({
      closedDays: 'Monday'
    })

    render(<AttractionCard attraction={attraction} />)

    expect(screen.getByText(/Fechado neste dia/i)).toBeInTheDocument()
  })

  it('renders reservation badge when needed', () => {
    const attraction = createAttraction({
      needsReservation: true,
      reservationStatus: 'confirmed'
    })

    render(<AttractionCard attraction={attraction} />)

    expect(screen.getByText(/Confirmada/i)).toBeInTheDocument()
  })

  it('renders ideal period badge', () => {
    const attraction = createAttraction({
      idealPeriod: 'morning'
    })

    render(<AttractionCard attraction={attraction} />)

    expect(screen.getByText(/Manhã/i)).toBeInTheDocument()
  })

  it('renders map link when coordinates exist', () => {
    const attraction = createAttraction({
      lat: 35,
      lng: 139
    })

    render(<AttractionCard attraction={attraction} />)

    const link = screen.getByLabelText(/Abrir no mapa/i)
    expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps'))
  })

  it('returns null and logs error for invalid type', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    const attraction = createAttraction({
      type: 'invalid-type' as any
    })

    const { container } = render(
      <AttractionCard attraction={attraction} />
    )

    expect(container.firstChild).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('uses high fetchPriority when priority=true', () => {
    const attraction = createAttraction({
      imageUrl: 'https://example.com/image.jpg'
    })

    render(<AttractionCard attraction={attraction} priority />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('uses low fetchPriority by default', () => {
    const attraction = createAttraction({
      imageUrl: 'https://example.com/image.jpg'
    })

    render(<AttractionCard attraction={attraction} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('fetchpriority', 'low')
  })
})