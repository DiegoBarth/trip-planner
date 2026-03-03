import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReservationCard } from '../ReservationCard'

vi.mock('@/utils/formatters', () => ({
  formatDate: (date: string) => `formatted-${date}`,
}))

vi.mock('@/config/constants', () => ({
  RESERVATION_TYPES: {
    hotel: {
      label: 'Hotel',
      color: '#0000ff',
      icon: '🏨',
    },
  },
  BOOKING_STATUS: {
    confirmed: {
      label: 'Confirmado',
      color: '#00ff00',
    },
  },
  COUNTRIES: {
    br: { name: 'Brasil' },
    us: { name: 'Estados Unidos' },
  },
}))

const baseReservation = {
  id: '1',
  title: 'Reserva Teste',
  type: 'hotel',
  status: 'confirmed',
} as any

describe('ReservationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render basic reservation info', () => {
    render(<ReservationCard reservation={baseReservation} />)

    expect(screen.getByText('Reserva Teste')).toBeInTheDocument()
    expect(screen.getByText('Hotel')).toBeInTheDocument()
    expect(screen.getByText('Confirmado')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(
      <ReservationCard
        reservation={{ ...baseReservation, description: 'Descrição teste' }}
      />
    )

    expect(screen.getByText('Descrição teste')).toBeInTheDocument()
  })

  it('should render formatted date range', () => {
    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          date: '2025-01-01',
          endDate: '2025-01-05',
        }}
      />
    )

    expect(
      screen.getByText('formatted-2025-01-01 – formatted-2025-01-05')
    ).toBeInTheDocument()
  })

  it('should render single date when no endDate', () => {
    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          date: '2025-01-01',
        }}
      />
    )

    expect(screen.getByText('formatted-2025-01-01')).toBeInTheDocument()
  })

  it('should render time, location, country and provider', () => {
    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          time: '10:00',
          location: 'São Paulo',
          country: 'br',
          provider: 'Booking',
          confirmationCode: 'ABC123',
        }}
      />
    )

    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()
    expect(screen.getByText('Booking')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('should render booking and document links', () => {
    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          bookingUrl: 'https://booking.com',
          documentUrl: 'https://doc.com',
        }}
      />
    )

    const reservaLink = screen.getByRole('link', { name: /reserva/i })
    const documentoLink = screen.getByRole('link', { name: /documento/i })

    expect(reservaLink).toHaveAttribute('href', 'https://booking.com')
    expect(documentoLink).toHaveAttribute('href', 'https://doc.com')
  })

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn()

    render(
      <ReservationCard
        reservation={baseReservation}
        onClick={onClick}
      />
    )

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(onClick).toHaveBeenCalledWith(baseReservation)
  })

  it('should call onClick when pressing Enter', () => {
    const onClick = vi.fn()

    render(
      <ReservationCard
        reservation={baseReservation}
        onClick={onClick}
      />
    )

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })

    expect(onClick).toHaveBeenCalledWith(baseReservation)
  })

  it('should call onClick when pressing Space', () => {
    const onClick = vi.fn()

    render(
      <ReservationCard
        reservation={baseReservation}
        onClick={onClick}
      />
    )

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ' })

    expect(onClick).toHaveBeenCalledWith(baseReservation)
  })

  it('should NOT trigger card click when clicking link', () => {
    const onClick = vi.fn()

    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          bookingUrl: 'https://booking.com',
        }}
        onClick={onClick}
      />
    )

    const link = screen.getByRole('link', { name: /reserva/i })
    fireEvent.click(link)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should not have button role when onClick is not provided', () => {
    render(<ReservationCard reservation={baseReservation} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should stop propagation when clicking document link', () => {
    const onClick = vi.fn()

    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          documentUrl: 'https://doc.com',
        }}
        onClick={onClick}
      />
    )

    const card = screen.getByRole('button')
    const documentLink = screen.getByRole('link', { name: /documento/i })

    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)

    onClick.mockClear()

    fireEvent.click(documentLink)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should not render date section when date is missing', () => {
    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          date: undefined,
          endDate: undefined,
        }}
      />
    )

    expect(screen.queryByText(/formatted-/i)).not.toBeInTheDocument()
  })

  it('should format only start date when endDate is not provided', () => {
    render(
      <ReservationCard
        reservation={{
          ...baseReservation,
          date: '2025-01-01',
          endDate: undefined,
        }}
      />
    )

    expect(screen.getByText('formatted-2025-01-01')).toBeInTheDocument()
  })

})