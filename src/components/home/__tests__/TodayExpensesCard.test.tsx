import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TodayExpensesCard from '../TodayExpensesCard'
import { useCountry } from '@/contexts/CountryContext'
import { useExpense } from '@/hooks/useExpense'
import type { ExpenseCategory, Expense } from '@/types/Expense' // Tipagem correta

vi.mock('@/contexts/CountryContext', () => ({
  useCountry: vi.fn(() => ({
    country: 'all',
    setCountry: vi.fn(),
    day: 'all',
    setDay: vi.fn(),
  })),
}))

vi.mock('@/hooks/useExpense', () => ({
  useExpense: vi.fn(() => ({
    expenses: [],
    isLoading: false,
    error: null,
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
  })),
}))

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}))

vi.mock('lucide-react/dist/esm/icons/wallet', () => ({
  default: () => <div data-testid="wallet-icon" />,
}))

vi.mock('lucide-react/dist/esm/icons/chevron-right', () => ({
  default: () => <div data-testid="chevron-right-icon" />,
}))

describe('TodayExpensesCard', async () => {
  const mockUseCountry = vi.mocked(useCountry)
  const mockUseExpense = vi.mocked(useExpense)
  const mockFormatCurrency = vi.mocked((await import('@/utils/formatters')).formatCurrency)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: vi.fn(),
    })
  })

  const defaultExpensesReturn = (expenses: Expense[] = []): any => ({
    expenses,
    isLoading: false,
    error: null,
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
  })

  it('renders empty state (R$ 0,00) when no expenses today', () => {
    mockUseExpense.mockReturnValue(defaultExpensesReturn([]))

    render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    expect(screen.getByText('Gastos de hoje')).toBeInTheDocument()
    expect(screen.getByText('R$ 0.00')).toBeInTheDocument()
    expect(screen.queryByText(/registro/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument()
    expect(mockFormatCurrency).toHaveBeenCalledWith(0, 'BRL')
  })

  it('renders today expenses total and count when expenses exist', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const expenses: Expense[] = [
      {
        id: 1,
        date: todayStr,
        amountInBRL: 150.50,
        description: 'Lunch',
        amount: 150.50,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
      {
        id: 2,
        date: todayStr,
        amountInBRL: 45.75,
        description: 'Coffee',
        amount: 45.75,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
    ]

    mockFormatCurrency.mockReturnValue('R$ 196,25')
    mockUseExpense.mockReturnValue(defaultExpensesReturn(expenses))

    render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    expect(screen.getByText('Gastos de hoje')).toBeInTheDocument()
    expect(screen.getByText('R$ 196,25')).toBeInTheDocument()
    expect(screen.getByText('2 registros')).toBeInTheDocument()
    expect(mockFormatCurrency).toHaveBeenCalledWith(196.25, 'BRL')
  })

  it('renders single expense count correctly (1 registro)', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const expenses: Expense[] = [{
      id: 1,
      date: todayStr,
      amountInBRL: 89.99,
      description: 'Dinner',
      amount: 89.99,
      currency: 'BRL' as any,
      category: 'food' as ExpenseCategory,
      budgetOrigin: 'personal' as any
    }]

    mockFormatCurrency.mockReturnValue('R$ 89,99')
    mockUseExpense.mockReturnValue(defaultExpensesReturn(expenses))

    render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    expect(screen.getByText('1 registro')).toBeInTheDocument()
  })

  it('filters only today expenses correctly (ignores past/future dates)', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const yesterdayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate() - 1).padStart(2, '0')}`
    const tomorrowStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate() + 1).padStart(2, '0')}`

    const expenses: Expense[] = [
      {
        id: 1,
        date: todayStr,
        amountInBRL: 100,
        description: 'Today',
        amount: 100,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
      {
        id: 2,
        date: yesterdayStr,
        amountInBRL: 50,
        description: 'Yesterday',
        amount: 50,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
      {
        id: 3,
        date: tomorrowStr,
        amountInBRL: 75,
        description: 'Tomorrow',
        amount: 75,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
      {
        id: 4,
        date: '03/03/2026',
        amountInBRL: 25,
        description: 'Formatted',
        amount: 25,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
    ]

    mockFormatCurrency.mockReturnValue('R$ 125,00')
    mockUseExpense.mockReturnValue(defaultExpensesReturn(expenses))

    render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    expect(screen.getByText('R$ 125,00')).toBeInTheDocument()
    expect(screen.getByText('2 registros')).toBeInTheDocument()
    expect(mockFormatCurrency).toHaveBeenCalledWith(125, 'BRL')
  })

  it('handles toYYYYMMDD conversion for different date formats', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const expenses: Expense[] = [
      // ✅ YYYY-MM-DD (direto)
      {
        id: 1,
        date: todayStr,
        amountInBRL: 50,
        description: 'Direct',
        amount: 50,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
      // ✅ DD/MM/YYYY (converte)
      {
        id: 2,
        date: `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`,
        amountInBRL: 30,
        description: 'Slash format',
        amount: 30,
        currency: 'BRL' as any,
        category: 'food' as ExpenseCategory,
        budgetOrigin: 'personal' as any
      },
    ]

    mockFormatCurrency.mockReturnValue('R$ 80,00')
    mockUseExpense.mockReturnValue(defaultExpensesReturn(expenses))

    render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    expect(screen.getByText('R$ 80,00')).toBeInTheDocument()
    expect(screen.getByText('2 registros')).toBeInTheDocument()
  })

  it('has correct Link href with today date', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    mockUseExpense.mockReturnValue(defaultExpensesReturn([]))

    const { container } = render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    const link = container.querySelector('a')!
    expect(link.getAttribute('href')).toBe(`/expenses?date=${todayStr}`)
  })

  it('applies correct styling and accessibility attributes', () => {
    mockUseExpense.mockReturnValue(defaultExpensesReturn([]))

    render(
      <MemoryRouter>
        <TodayExpensesCard />
      </MemoryRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-2xl', 'shadow-md')
    expect(link).toHaveAttribute('href', expect.stringContaining('/expenses?date='))
  })
})
