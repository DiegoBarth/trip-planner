import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReservationActionsModal } from '../ReservationActionsModal'

vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

vi.mock('@/config/constants', () => ({
  RESERVATION_TYPES: {
    hotel: {
      label: 'Hotel',
      color: 'blue',
      icon: '🏨',
    },
  },
  BOOKING_STATUS: {
    confirmed: {
      label: 'Confirmado',
      color: 'green',
    },
  },
}))

const mockReservation = {
  id: '1',
  title: 'Reserva Teste',
  type: 'hotel',
  status: 'confirmed',
} as any

describe('ReservationActionsModal', () => {
  const onClose = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen={false}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should not render when reservation is null', () => {
    render(
      <ReservationActionsModal
        reservation={null}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render reservation title and info', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Reserva Teste')).toBeInTheDocument()
    expect(screen.getByText('Hotel')).toBeInTheDocument()
    expect(screen.getByText('Confirmado')).toBeInTheDocument()
  })

  it('should call onClose when clicking backdrop', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const backdrop = screen.getByTestId('reservation-backdrop')

    expect(backdrop).toBeInTheDocument()

    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when clicking backdrop', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const backdrop = screen.getByTestId('reservation-backdrop')
    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onEdit and close when clicking Editar', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByText('Editar'))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(mockReservation)
  })

  it('should call onDelete and close when clicking Excluir', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByText('Excluir'))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(mockReservation)
  })

  it('should close when pressing Escape', () => {
    render(
      <ReservationActionsModal
        reservation={mockReservation}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})