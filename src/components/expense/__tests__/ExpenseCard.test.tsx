import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseCard } from '../ExpenseCard'
import type { Expense } from '@/types/Expense'

// Mocks
vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((amount, currency = 'BRL') =>
    currency === 'BRL' ? `R$ ${amount}` : `${currency} ${amount}`
  ),
  formatDate: vi.fn((date) => `Formatted ${date}`),
}))

// Mocking Lucide Icons
vi.mock('lucide-react/dist/esm/icons/calendar', () => ({
  default: () => <div data-testid="calendar-icon" />,
}))

describe('ExpenseCard', () => {
  const mockExpense: Expense = {
    id: 1,
    description: 'Sushi Dinner',
    amount: 5000,
    currency: 'JPY',
    amountInBRL: 180,
    category: 'food',
    budgetOrigin: 'Diego',
    date: '2026-03-03',
    notes: 'Dinner at Tsukiji',
  }

  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render expense details correctly', () => {
    render(<ExpenseCard expense={mockExpense} />)

    expect(screen.getByText('Sushi Dinner')).toBeInTheDocument()
    expect(screen.getByText('JPY 5000')).toBeInTheDocument()
    expect(screen.getByText('R$ 180')).toBeInTheDocument()
    expect(screen.getByText('Formatted 2026-03-03')).toBeInTheDocument()
    expect(screen.getByText('Dinner at Tsukiji')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('should render the correct category label and icon', () => {
    render(<ExpenseCard expense={mockExpense} />)

    // Food category icon is 🍱 and label is Alimentação
    expect(screen.getAllByText('🍱')).toHaveLength(1) // One in large icon, one in badge
    expect(screen.getByText(/Alimentação/i)).toBeInTheDocument()
  })

  it('should apply correct origin badge classes for Diego', () => {
    render(<ExpenseCard expense={mockExpense} />)

    const badge = screen.getByText('Diego')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('should call onClick when clicked', () => {
    render(<ExpenseCard expense={mockExpense} onClick={mockOnClick} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(mockOnClick).toHaveBeenCalledWith(mockExpense)
  })

  it('should handle keyboard interaction (Enter and Space)', () => {
    render(<ExpenseCard expense={mockExpense} onClick={mockOnClick} />)

    const card = screen.getByRole('button')

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(mockOnClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(card, { key: ' ' })
    expect(mockOnClick).toHaveBeenCalledTimes(2)
  })

  it('should not have button role or tabIndex if onClick is not provided', () => {
    const { container } = render(<ExpenseCard expense={mockExpense} />)
    const card = container.firstChild as HTMLElement

    expect(card).not.toHaveAttribute('role', 'button')
    expect(card).not.toHaveAttribute('tabIndex')
  })

  it('should use fallback logic for unknown category labels', () => {
    const expenseWithLabel = { ...mockExpense, category: 'Compras' as any }
    render(<ExpenseCard expense={expenseWithLabel} />)

    // "Compras" label maps to "shopping" key via getCategoryFromLabel
    expect(screen.getByText('🛒 Compras')).toBeInTheDocument()
  })

  it('should use fallback logic for unknown budget origin labels', () => {
    const expenseWithLabel = { ...mockExpense, budgetOrigin: 'Casal' as any }
    render(<ExpenseCard expense={expenseWithLabel} />)

    expect(screen.getByText('Casal')).toBeInTheDocument()
  })

  it('should use "other" fallback when category is completely invalid', () => {
    const invalidExpense = { ...mockExpense, category: 'invalid' as any }
    render(<ExpenseCard expense={invalidExpense} />)

    // Should fallback to categoryConfig for 'other' which is 'Outros' / '💰'
    expect(screen.getByText(/Outros/i)).toBeInTheDocument()
    expect(screen.getAllByText('💰')).toHaveLength(1)
  })

  it('should not render BRL conversion if currency is already BRL', () => {
    const brlExpense = { ...mockExpense, currency: 'BRL' as any }
    render(<ExpenseCard expense={brlExpense} />)

    // In our mock formatCurrency returns "R$ value" for BRL. 
    // We check that the small text for conversion is not there
    const amounts = screen.getAllByText(/R\$/)
    expect(amounts).toHaveLength(1) // Only the main amount
  })

  it('should not render notes section if notes are empty', () => {
    const noNotesExpense = { ...mockExpense, notes: '' }
    render(<ExpenseCard expense={noNotesExpense} />)

    expect(screen.queryByText('Dinner at Tsukiji')).not.toBeInTheDocument()
  })
})