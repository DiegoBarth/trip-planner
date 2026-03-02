import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../DashboardPage'
import { createPageWrapper } from './pageWrapper'
import { useAttraction } from '@/hooks/useAttraction'
import { useBudget } from '@/hooks/useBudget'
import { useExpense } from '@/hooks/useExpense'
import type { Attraction } from '@/types/Attraction'

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: vi.fn(),
}))

vi.mock('@/hooks/useBudget', () => ({
  useBudget: vi.fn(),
}))

vi.mock('@/hooks/useExpense', () => ({
  useExpense: vi.fn(),
}))

const mockUseAttraction = vi.mocked(useAttraction)
const mockUseBudget = vi.mocked(useBudget)
const mockUseExpense = vi.mocked(useExpense)

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'Atração',
    country: 'japan',
    city: 'Tokyo',
    day: 1,
    date: '2025-03-01',
    dayOfWeek: 'Seg',
    type: 'temple',
    order: 0,
    couplePrice: 0,
    currency: 'JPY',
    priceInBRL: 0,
    visited: false,
    needsReservation: true,
    reservationStatus: 'pending',
    ...overrides,
  } as Attraction
}

describe('DashboardPage', () => {
  const Wrapper = createPageWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ id: 1, day: 1, date: '2025-03-01', visited: false, needsReservation: true, reservationStatus: 'pending' })],
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
    mockUseBudget.mockReturnValue({
      budgets: [{ id: 1, origin: 'Atrações', description: '', amount: 5000, date: '2025-03-01' }],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue(undefined),
      createBudget: vi.fn(),
      updateBudget: vi.fn(),
      deleteBudget: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    mockUseExpense.mockReturnValue({
      expenses: [],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
  })

  it('shows loading state when isLoading', () => {
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
    render(<DashboardPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Carregando dados da viagem/i)).toBeInTheDocument()
  })

  it('renders dashboard stats when loaded', async () => {
    render(<DashboardPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Total Gasto/i)).toBeInTheDocument()
      expect(screen.getByText(/Saldo Restante/i)).toBeInTheDocument()
      expect(screen.getByText(/Duração da Viagem/i)).toBeInTheDocument()
      expect(screen.getByText(/Atrações Pendentes/i)).toBeInTheDocument()
    })
  })
})
