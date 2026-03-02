import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReservationsPage from '../ReservationsPage'
import { createPageWrapper } from './pageWrapper'
import { useReservation } from '@/hooks/useReservation'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'
import type { Reservation } from '@/types/Reservation'

vi.mock('@/hooks/useReservation', () => ({
  useReservation: vi.fn(),
}))

vi.mock('@/contexts/toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/toast')>()
  return {
    ...actual,
    useToast: vi.fn(),
  }
})

vi.mock('@/contexts/CountryContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/CountryContext')>()
  return {
    ...actual,
    useCountry: vi.fn(),
  }
})

vi.mock('@/components/reservation/ReservationList', () => ({
  default: function ReservationList({
    reservations,
    onCreate,
    onUpdate,
    onDelete,
  }: {
    reservations: Reservation[]
    onCreate: (p: Omit<Reservation, 'id'>) => Promise<unknown>
    onUpdate: (p: Reservation) => Promise<unknown>
    onDelete: (id: number) => Promise<void>
  }) {
    return (
      <div data-testid="reservation-list">
        {reservations.map((r) => (
          <span key={r.id} data-testid={`reservation-${r.id}`}>
            {r.title}
            <button type="button" onClick={() => onDelete(r.id)} aria-label="Excluir reserva">Excluir</button>
          </span>
        ))}
        <button type="button" onClick={() => Promise.resolve(onCreate({ type: 'activity', title: 'Nova', status: 'pending' })).catch(() => {})}>trigger onCreate</button>
        <button type="button" onClick={() => reservations[0] && Promise.resolve(onUpdate({ ...reservations[0], title: 'Updated' })).catch(() => {})}>trigger onUpdate</button>
      </div>
    )
  },
}))

vi.mock('@/components/reservation/ModalReservation', () => ({
  ModalReservation: function ModalReservation({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean
    onClose: () => void
    onSave: (p: Omit<Reservation, 'id'>) => void | Promise<void>
  }) {
    if (!isOpen) return null
    const payload = { type: 'activity' as const, title: 'Nova reserva', status: 'pending' as const }
    return (
      <div data-testid="modal-reservation" role="dialog">
        <button type="button" onClick={onClose}>Fechar</button>
        <button type="button" onClick={() => Promise.resolve(onSave(payload)).then(onClose).catch(() => {})}>Salvar</button>
      </div>
    )
  },
}))

const mockUseReservation = vi.mocked(useReservation)
const mockUseToast = vi.mocked(useToast)
const mockUseCountry = vi.mocked(useCountry)

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 1,
    type: 'activity',
    title: 'Hotel Tokyo',
    status: 'confirmed',
    date: '2025-03-01',
    endDate: '2025-03-01',
    country: 'japan',
    ...overrides,
  }
}

describe('ReservationsPage', () => {
  const Wrapper = createPageWrapper()
  const mockSuccess = vi.fn()
  const mockError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: vi.fn(),
    })
    mockUseToast.mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
      warning: vi.fn(),
      clear: vi.fn(),
    })
    mockUseReservation.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      createReservation: vi.fn().mockResolvedValue(undefined),
      updateReservation: vi.fn().mockResolvedValue(undefined),
      deleteReservation: vi.fn().mockResolvedValue(undefined),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
  })

  it('renders page header with title and subtitle', () => {
    render(<ReservationsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Reservas/i })).toBeInTheDocument()
    expect(screen.getByText(/Gerencie suas reservas e documentos/i)).toBeInTheDocument()
  })

  it('renders Fab to add reservation', () => {
    render(<ReservationsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('renders ReservationList when loaded with reservations', async () => {
    mockUseReservation.mockReturnValue({
      reservations: [makeReservation({ id: 1, title: 'Hotel Tokyo' })],
      isLoading: false,
      error: null,
      createReservation: vi.fn(),
      updateReservation: vi.fn(),
      deleteReservation: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ReservationsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Hotel Tokyo/i)).toBeInTheDocument()
    })
  })

  it('handleCreate success via modal shows toast and closes modal', async () => {
    const createReservation = vi.fn().mockResolvedValue(undefined)
    mockUseReservation.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      createReservation,
      updateReservation: vi.fn(),
      deleteReservation: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ReservationsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-reservation')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(createReservation).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Reserva criada com sucesso!')
    })
    await waitFor(() => {
      expect(screen.queryByTestId('modal-reservation')).not.toBeInTheDocument()
    })
  })

  it('handleCreate error shows error toast', async () => {
    mockUseReservation.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      createReservation: vi.fn().mockRejectedValue(new Error('API error')),
      updateReservation: vi.fn(),
      deleteReservation: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ReservationsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onCreate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onCreate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao criar reserva')
    })
    errSpy.mockRestore()
  })

  it('handleUpdate success shows toast', async () => {
    const updateReservation = vi.fn().mockResolvedValue(undefined)
    mockUseReservation.mockReturnValue({
      reservations: [makeReservation({ id: 1, title: 'Hotel Tokyo' })],
      isLoading: false,
      error: null,
      createReservation: vi.fn(),
      updateReservation,
      deleteReservation: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ReservationsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onUpdate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(updateReservation).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Reserva atualizada com sucesso!')
    })
  })

  it('handleUpdate error shows error toast', async () => {
    mockUseReservation.mockReturnValue({
      reservations: [makeReservation({ id: 1, title: 'Hotel Tokyo' })],
      isLoading: false,
      error: null,
      createReservation: vi.fn(),
      updateReservation: vi.fn().mockRejectedValue(new Error('API error')),
      deleteReservation: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ReservationsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar reserva')
    })
    errSpy.mockRestore()
  })

  it('handleDelete success shows toast', async () => {
    const deleteReservation = vi.fn().mockResolvedValue(undefined)
    mockUseReservation.mockReturnValue({
      reservations: [makeReservation({ id: 1, title: 'Hotel Tokyo' })],
      isLoading: false,
      error: null,
      createReservation: vi.fn(),
      updateReservation: vi.fn(),
      deleteReservation,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ReservationsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir reserva/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Excluir reserva/i }))
    await waitFor(() => {
      expect(deleteReservation).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Reserva excluída com sucesso!')
    })
  })

  it('handleDelete error shows error toast', async () => {
    mockUseReservation.mockReturnValue({
      reservations: [makeReservation({ id: 1, title: 'Hotel Tokyo' })],
      isLoading: false,
      error: null,
      createReservation: vi.fn(),
      updateReservation: vi.fn(),
      deleteReservation: vi.fn().mockRejectedValue(new Error('API error')),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ReservationsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Excluir reserva/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao excluir reserva')
    })
    errSpy.mockRestore()
  })

  it('modal onClose hides modal', async () => {
    render(<ReservationsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-reservation')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('modal-reservation')).not.toBeInTheDocument()
    })
  })
})
