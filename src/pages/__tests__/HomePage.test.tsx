import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import HomePage from '../HomePage'
import { createPageWrapper } from './pageWrapper'
import { useAttraction } from '@/hooks/useAttraction'

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: vi.fn(),
}))

vi.mock('@/components/home/NextDaySummary', () => ({
  default: function NextDaySummary() {
    return <div data-testid="next-day-summary">Resumo do Próximo Dia</div>
  },
}))

vi.mock('@/components/ui/QuickActions', () => ({
  QuickActions: function QuickActions() {
    return <div data-testid="quick-actions">Navegação Rápida</div>
  },
}))

const mockUseAttraction = vi.mocked(useAttraction)

describe('HomePage', () => {
  const Wrapper = createPageWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAttraction.mockReturnValue({
      attractions: [],
      isLoading: false,
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
  })

  it('renders converter link on mobile', () => {
    render(<HomePage onLogout={() => {}} />, { wrapper: Wrapper })
    expect(screen.getByRole('link', { name: /Abrir conversor de moeda/i })).toBeInTheDocument()
    expect(screen.getByText(/Conversor de moeda/i)).toBeInTheDocument()
  })

  it('renders NextDaySummary', async () => {
    render(<HomePage onLogout={() => {}} />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('next-day-summary')).toBeInTheDocument()
    })
  })

  it('renders QuickActions section', () => {
    render(<HomePage onLogout={() => {}} />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Navegação Rápida/i })).toBeInTheDocument()
  })

  it('renders Resumo Financeiro section', () => {
    render(<HomePage onLogout={() => {}} />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Resumo Financeiro/i })).toBeInTheDocument()
  })
})
