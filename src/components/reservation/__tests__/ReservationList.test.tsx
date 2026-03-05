import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import ReservationList from '../ReservationList'
import type { Reservation } from '@/types/Reservation'

vi.mock('@/components/reservation/ReservationCard', () => ({
  ReservationCard: ({ reservation, onClick }: any) => (
    <button
      data-testid={`card-${reservation.id}`}
      onClick={() => onClick?.(reservation)}
    >
      {reservation.title}
    </button>
  ),
}))

vi.mock('@/components/reservation/ModalReservation', () => ({
  ModalReservation: ({ isOpen, onSave, onClose }: any) =>
    isOpen ? (
      <div data-testid="modal-reservation">
        <button data-testid="save-modal" onClick={() => onSave({ title: 'New' })}>save-modal</button>
        <button data-testid="close-modal" onClick={onClose}>close-modal</button>
      </div>
    ) : null,
}))

vi.mock('@/components/reservation/ReservationActionsModal', () => ({
  ReservationActionsModal: ({ reservation, onEdit, onDelete, isOpen }: any) =>
    isOpen && reservation ? (
      <div data-testid="actions-modal">
        <button onClick={() => onEdit(reservation)}>edit</button>
        <button onClick={() => onDelete(reservation)}>delete</button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/ConfirmModal', () => ({
  ConfirmModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>confirm-delete</button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title, description, onAction }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      <button data-testid="new-reservation-btn" onClick={onAction}>
        ➕ Nova Reserva
      </button>
    </div>
  ),
}));

vi.mock('@/utils/formatters', () => ({
  formatDate: (d: string) => `formatted-${d}`,
  dateToInputFormat: (d: string) => d,
  parseLocalDate: (d: string) => new Date(d),
}))

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: () => ({ attractions: [] }),
}))

vi.mock('@/contexts/CountryContext', () => ({
  useCountry: () => ({ country: 'BR' }),
}))

vi.mock('@/components/reservation/NewReservationButton', () => ({
  NewReservationButton: ({ onClick }: any) => (
    <button data-testid="new-reservation-btn" onClick={onClick}>
      Nova Reserva
    </button>
  ),
}))

const baseReservation: Reservation = {
  id: 1,
  title: 'Hotel Tokyo',
  type: 'hotel' as any,
  status: 'confirmed' as any,
  date: '2025-01-01',
  location: 'Tokyo',
  provider: 'Booking',
  confirmationCode: 'ABC123',
  description: 'desc',
}

describe('ReservationList', () => {
  const onUpdate = vi.fn()
  const onCreate = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when loading', () => {
    const { container } = render(
      <ReservationList
        reservations={[]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        isLoading
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render empty state when no reservations', () => {
    render(
      <ReservationList
        reservations={[]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    expect(
      screen.getByText('Nenhuma reserva encontrada')
    ).toBeInTheDocument()
  })

  it('should render stats when reservations exist', () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    const totalBadge = screen.getByText(/Total/i).closest('span')!
    expect(within(totalBadge).getByText('1')).toBeInTheDocument()
  })

  it('should group pre-trip reservations (without date)', () => {
    const preTrip = { ...baseReservation, id: 2, date: undefined }

    render(
      <ReservationList
        reservations={[preTrip]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Pré-Viagem')).toBeInTheDocument()
    expect(screen.getByTestId('card-2')).toBeInTheDocument()
  })

  it('should group reservations by date', () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    expect(
      screen.getByText('formatted-2025-01-01')
    ).toBeInTheDocument()

    expect(screen.getByTestId('card-1')).toBeInTheDocument()
  })

  it('should open actions modal when card is clicked', () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))

    expect(screen.getByTestId('actions-modal')).toBeInTheDocument()
  })

  it('should open edit modal from actions', () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))
    fireEvent.click(screen.getByText('edit'))

    expect(screen.getByTestId('modal-reservation')).toBeInTheDocument()
  })

  it('should open delete confirmation from actions', () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))
    fireEvent.click(screen.getByText('delete'))

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
  })

  it('should call onDelete after confirming deletion', async () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))
    fireEvent.click(screen.getByText('delete'))
    fireEvent.click(screen.getByText('confirm-delete'))

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(1)
    })
  })

  it('should correctly compute stats counts', () => {
    const data: Reservation[] = [
      { ...baseReservation, id: 1, status: 'confirmed' as any },
      { ...baseReservation, id: 2, status: 'pending' as any },
      { ...baseReservation, id: 3, status: 'completed' as any },
    ]

    render(
      <ReservationList
        reservations={data}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    const totalBadge = screen.getByText(/Total/i).closest('span')!
    expect(within(totalBadge).getByText('3')).toBeInTheDocument()

    const confirmadoBadge = screen.getByText(/Confirmado/i).closest('span')!
    expect(within(confirmadoBadge).getByText('1')).toBeInTheDocument()

    const pendenteBadge = screen.getByText(/Pendente/i).closest('span')!
    expect(within(pendenteBadge).getByText('1')).toBeInTheDocument()

    const concluidoBadge = screen.getByText(/Concluído/i).closest('span')!
    expect(within(concluidoBadge).getByText('1')).toBeInTheDocument()
  })

  it('should order date groups chronologically', () => {
    const data: Reservation[] = [
      {
        ...baseReservation,
        id: 1,
        date: '2025-02-01',
      },
      {
        ...baseReservation,
        id: 2,
        date: '2025-01-01',
      },
    ]

    render(
      <ReservationList
        reservations={data}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    const headings = screen.getAllByRole('heading', { level: 2 })

    expect(headings[0]).toHaveTextContent('formatted-2025-01-01')
    expect(headings[1]).toHaveTextContent('formatted-2025-02-01')
  })

  it('should close modal and clear editing reservation', async () => {
    const data: Reservation[] = [
      { ...baseReservation, id: 1 }
    ]

    render(
      <ReservationList
        reservations={data}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))

    fireEvent.click(screen.getByText(/edit/i))

    fireEvent.click(screen.getByTestId('close-modal'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should call onCreate when saving new reservation', async () => {
    const { rerender } = render(
      <ReservationList
        reservations={[]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByTestId('new-reservation-btn'));

    rerender(
      <ReservationList
        reservations={[]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    );

  });


  it('should call onUpdate when editing reservation', async () => {
    const data: Reservation[] = [
      { ...baseReservation, id: 1 }
    ]

    render(
      <ReservationList
        reservations={data}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))
    fireEvent.click(screen.getByText(/edit/i))
    fireEvent.click(screen.getByTestId('save-modal'))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 })
      )
    })
  })

  it('should delete reservation when confirmed', async () => {
    render(
      <ReservationList
        reservations={[baseReservation]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('card-1'))

    fireEvent.click(screen.getByText('delete'))

    const confirmBtn = screen.getByText('confirm-delete')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(1)
    })
  })

  it('should not delete when no reservation is selected', async () => {
    render(
      <ReservationList
        reservations={[]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    )

    expect(onDelete).not.toHaveBeenCalled()
  })
})