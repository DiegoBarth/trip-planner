import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TodaysPendencies from '../TodaysPendencies'
import { useReservation } from '@/hooks/useReservation'
import { useChecklist } from '@/hooks/useChecklist'
import type { Reservation, ReservationType, BookingStatus } from '@/types/Reservation'

vi.mock('@/hooks/useReservation', () => ({
  useReservation: vi.fn(() => ({
    reservations: [],
    isLoading: false,
    error: null,
    createReservation: vi.fn(),
    updateReservation: vi.fn(),
    deleteReservation: vi.fn(),
  })),
}))

vi.mock('@/hooks/useChecklist', () => ({
  useChecklist: vi.fn(() => ({
    items: [],
    isLoading: false,
    error: null,
    togglePacked: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    createItem: vi.fn(),
  })),
}))

const icons = ['check-square', 'alert-circle', 'file-text', 'chevron-right']
icons.forEach(name => {
  vi.mock(`lucide-react/dist/esm/icons/${name}`, () => ({
    default: () => <div data-testid={`${name}-icon`} />,
  }))
})

describe('TodaysPendencies', () => {
  const mockUseReservation = vi.mocked(useReservation)
  const mockUseChecklist = vi.mocked(useChecklist)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultReservationReturn = (reservations: Reservation[] = []): any => ({
    reservations,
    isLoading: false,
    error: null,
    createReservation: vi.fn(),
    updateReservation: vi.fn(),
    deleteReservation: vi.fn(),
  })

  const defaultChecklistReturn = (items: any[] = []): any => ({
    items,
    isLoading: false,
    error: null,
    togglePacked: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    createItem: vi.fn(),
  })

  describe('Empty State (total === 0)', () => {
    it('renders "Tudo em dia!" when no pendencies', () => {
      mockUseReservation.mockReturnValue(defaultReservationReturn([]))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn([]))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.getByText('Tudo em dia!')).toBeInTheDocument()
      expect(screen.getByText('Nenhuma pendência no momento')).toBeInTheDocument()
      expect(screen.getByTestId('check-square-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('alert-circle-icon')).not.toBeInTheDocument()
    })
  })

  describe('Pendencies List (total > 0)', () => {
    it('renders checklist pendency (unpacked items)', () => {
      const unpackedItems = [
        { id: 1, name: 'Camisa', isPacked: false },
        { id: 2, name: 'Calça', isPacked: false },
      ]

      mockUseReservation.mockReturnValue(defaultReservationReturn([]))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn(unpackedItems))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.getByText('Pendências')).toBeInTheDocument()
      expect(screen.getByText('2 itens para resolver')).toBeInTheDocument()
      expect(screen.getByText('Checklist')).toBeInTheDocument()
      expect(screen.getByText('2 itens para empacotar')).toBeInTheDocument()
      expect(screen.queryByText(/reserva pendente/i)).not.toBeInTheDocument()
      expect(screen.getAllByTestId('chevron-right-icon')).toHaveLength(1)
    })

    it('renders reservations pendency (status === "pending")', () => {
      const pendingReservations: Reservation[] = [
        {
          id: 1,
          type: 'accommodation' as ReservationType,
          title: 'Hotel Tokyo',
          status: 'pending' as BookingStatus
        },
        {
          id: 2,
          type: 'flight' as ReservationType,
          title: 'Voo GRU-NRT',
          status: 'pending' as BookingStatus
        },
      ]

      mockUseReservation.mockReturnValue(defaultReservationReturn(pendingReservations))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn([]))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.getByText('2 itens para resolver')).toBeInTheDocument()
      expect(screen.getByText('Reservas')).toBeInTheDocument()
      expect(screen.getByText('2 reservas pendentes')).toBeInTheDocument()
      expect(screen.queryByText(/item.*empacotar/i)).not.toBeInTheDocument()
      expect(screen.getAllByTestId('chevron-right-icon')).toHaveLength(1)
    })

    it('renders both checklist and reservations pendencies', () => {
      const unpackedItems = [{ id: 1, name: 'Passaporte', isPacked: false }]
      const pendingReservations: Reservation[] = [{
        id: 1,
        type: 'transport-pass' as ReservationType,
        title: 'Táxi Aeroporto',
        status: 'pending' as BookingStatus
      }]

      mockUseReservation.mockReturnValue(defaultReservationReturn(pendingReservations))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn(unpackedItems))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.getByText('2 itens para resolver')).toBeInTheDocument()
      expect(screen.getByText('1 item para empacotar')).toBeInTheDocument()
      expect(screen.getByText('1 reserva pendente')).toBeInTheDocument()
      expect(screen.getAllByTestId('chevron-right-icon')).toHaveLength(2)
    })

    it('renders singular forms correctly (1 item)', () => {
      const unpackedItems = [{ id: 1, name: 'Toothbrush', isPacked: false }]

      mockUseReservation.mockReturnValue(defaultReservationReturn([]))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn(unpackedItems))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.getByText('1 item para resolver')).toBeInTheDocument()
      expect(screen.getByText('1 item para empacotar')).toBeInTheDocument()
    })

    it('renders singular reservation form correctly (1 reserva pendente)', () => {
      const pendingReservations: Reservation[] = [{
        id: 1,
        type: 'flight' as ReservationType,
        title: 'Airbnb Kyoto',
        status: 'pending' as BookingStatus
      }]

      mockUseReservation.mockReturnValue(defaultReservationReturn(pendingReservations))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn([]))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.getByText('1 item para resolver')).toBeInTheDocument()
      expect(screen.getByText('1 reserva pendente')).toBeInTheDocument()
    })

    it('ignores confirmed reservations (status !== "pending")', () => {
      const confirmedReservations: Reservation[] = [
        { id: 1, type: 'hotel' as ReservationType, title: 'Confirmed Hotel', status: 'confirmed' as BookingStatus },
        { id: 2, type: 'flight' as ReservationType, title: 'Completed Flight', status: 'completed' as BookingStatus },
      ]

      mockUseReservation.mockReturnValue(defaultReservationReturn(confirmedReservations))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn([]))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.queryByText('Reservas')).not.toBeInTheDocument()
      expect(screen.queryByText(/reserva.*pendente/i)).not.toBeInTheDocument()
    })

    it('ignores packed checklist items (isPacked === true)', () => {
      const packedItems = [
        { id: 1, name: 'Camisa', isPacked: true },
        { id: 2, name: 'Calça', isPacked: true },
      ]

      mockUseChecklist.mockReturnValue(defaultChecklistReturn(packedItems))
      mockUseReservation.mockReturnValue(defaultReservationReturn([]))

      render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      expect(screen.queryByText('Checklist')).not.toBeInTheDocument()
      expect(screen.queryByText(/item.*empacotar/i)).not.toBeInTheDocument()
    })
  })

  describe('Links and Navigation', () => {
    it('links to /checklist when checklist pendency exists', () => {
      const unpackedItems = [{ id: 1, name: 'Shirt', isPacked: false }]

      mockUseReservation.mockReturnValue(defaultReservationReturn([]))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn(unpackedItems))

      const { container } = render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      const checklistLink = container.querySelector('a[href="/checklist"]')
      expect(checklistLink).toBeInTheDocument()
    })

    it('links to /reservations when reservations pendency exists', () => {
      const pendingReservations: Reservation[] = [{
        id: 1,
        type: 'accommodation' as ReservationType,
        title: 'Flight',
        status: 'pending' as BookingStatus
      }]

      mockUseReservation.mockReturnValue(defaultReservationReturn(pendingReservations))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn([]))

      const { container } = render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      const reservationsLink = container.querySelector('a[href="/reservations"]')
      expect(reservationsLink).toBeInTheDocument()
    })
  })

  describe('Styling and Accessibility', () => {
    it('applies correct styling classes for empty state', () => {
      mockUseReservation.mockReturnValue(defaultReservationReturn([]))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn([]))

      const { container } = render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      const card = container.querySelector('div')!
      expect(card).toHaveClass('bg-gradient-to-br', 'from-green-500', 'to-emerald-600')
    })

    it('applies correct styling classes for pendencies state', () => {
      const unpackedItems = [{ id: 1, name: 'Test', isPacked: false }]

      mockUseReservation.mockReturnValue(defaultReservationReturn([]))
      mockUseChecklist.mockReturnValue(defaultChecklistReturn(unpackedItems))

      const { container } = render(
        <MemoryRouter>
          <TodaysPendencies />
        </MemoryRouter>
      )

      const header = container.querySelector('div.bg-gradient-to-r')
      expect(header).toHaveClass('from-orange-500', 'to-red-500')
      const link = screen.getByRole('link')
      expect(link).toHaveClass('hover:bg-gray-50', 'transition-colors')
    })
  })
})
