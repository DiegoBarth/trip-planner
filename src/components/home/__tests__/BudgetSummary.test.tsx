import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BudgetSummary from '../BudgetSummary'
import { useBudget } from '@/hooks/useBudget'

vi.mock('@/hooks/useBudget', () => ({
  useBudget: vi.fn(() => ({
    budgets: [],
    budgetSummary: {
      totalBudget: 1000,
      totalSpent: 400,
      remainingBalance: 600,
      byOrigin: {
        Casal: { totalBudget: 500, totalSpent: 200, remainingBalance: 300 },
        Individual: { totalBudget: 500, totalSpent: 200, remainingBalance: 300 },
      },
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    addBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    isDeleting: false,
  })),
}))

vi.mock('@/components/home/BudgetCard', () => ({
  BudgetCard: ({ origin, total, spent, remaining }: any) => (
    <div data-testid="budget-card">
      {origin} - {total} - {spent} - {remaining}
    </div>
  ),
}))

describe('BudgetSummary', () => {
  it('renders null when budgetSummary is undefined', () => {
    vi.mocked(useBudget).mockReturnValueOnce({
      budgetSummary: undefined,
      budgets: [],
      isLoading: false,
      error: null,
    } as any)

    const { container } = render(<BudgetSummary />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the total remaining balance', () => {
    render(<BudgetSummary />)
    expect(screen.getByText(/600,00/)).toBeInTheDocument()
  })

  it('renders BudgetCard components for each origin', () => {
    render(<BudgetSummary />)
    const cards = screen.getAllByTestId('budget-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Casal')
    expect(cards[1]).toHaveTextContent('Individual')
  })

  it('calculates the progress bar percentage correctly', () => {
    render(<BudgetSummary />)
    const progress = document.querySelector('div[style*="scaleX"]') as HTMLElement
    expect(progress.style.transform).toBe('scaleX(0.4)')
  })
  it('applies positive balance gradient (emerald/teal) when remainingBalance >= 0', () => {
    vi.mocked(useBudget).mockReturnValueOnce({
      budgetSummary: {
        totalBudget: 1000,
        totalSpent: 400,
        remainingBalance: 600, // >= 0 → isPositive = true
        byOrigin: {},
      },
      budgets: [],
      isLoading: false,
      error: null,
    } as any)

    render(<BudgetSummary />)

    const { container } = render(<BudgetSummary />)

    const summaryCard = container.querySelector('.rounded-2xl') as HTMLElement

    expect(summaryCard).toHaveClass('from-emerald-500')
    expect(summaryCard).toHaveClass('to-teal-600')
    expect(summaryCard).not.toHaveClass('from-rose-500')
  })

  it('applies negative balance gradient (rose/pink) when remainingBalance < 0', () => {
    vi.mocked(useBudget).mockReturnValueOnce({
      budgetSummary: {
        totalBudget: 1000,
        totalSpent: 1200,
        remainingBalance: -200, // < 0 → isPositive = false
        byOrigin: {},
      },
      budgets: [],
      isLoading: false,
      error: null,
    } as any)

    render(<BudgetSummary />)

    const summaryCard = screen.getByText('Saldo disponível').closest('.rounded-2xl')

    expect(summaryCard).toHaveClass('rounded-2xl', 'shadow-lg')
    expect(summaryCard).toHaveClass('from-rose-500', 'to-pink-600')
    expect(summaryCard).not.toHaveClass('from-emerald-500')
  })

  it('handles zero totalBudget correctly (percentSpent = 0)', () => {
    vi.mocked(useBudget).mockReturnValueOnce({
      budgetSummary: {
        totalBudget: 0,
        totalSpent: 400,
        remainingBalance: -400,
        byOrigin: {},
      },
      budgets: [],
      isLoading: false,
      error: null,
    } as any)

    render(<BudgetSummary />)

    const progressBar = document.querySelector('div[style*="scaleX"]') as HTMLElement
    expect(progressBar?.style.transform).toBe('scaleX(0)')
  })

  it('caps progress bar at 100% when percentSpent exceeds 100%', () => {
    vi.mocked(useBudget).mockReturnValueOnce({
      budgetSummary: {
        totalBudget: 1000,
        totalSpent: 1500, // 150% spent
        remainingBalance: -500,
        byOrigin: {},
      },
      budgets: [],
      isLoading: false,
      error: null,
    } as any)

    render(<BudgetSummary />)

    const progressBar = document.querySelector('div[style*="scaleX"]') as HTMLElement
    expect(progressBar?.style.transform).toBe('scaleX(1)')
  })


})