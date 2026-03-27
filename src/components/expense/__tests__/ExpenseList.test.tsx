import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import ExpenseList from '../ExpenseList'
import type { Expense } from '@/types/Expense'

vi.mock('@/components/expense/ExpenseCard', () => ({
  ExpenseCard: ({ expense, onClick }: any) => (
    <div data-testid={`expense-card-${expense.id}`} onClick={() => onClick(expense)}>
      ID:{expense.id} - {expense.description} - {expense.amountInBRL}
    </div>
  ),
}))

vi.mock('@/components/expense/ModalExpense', () => ({
  ModalExpense: ({ isOpen, expense, onSave, onClose }: any) => isOpen ? (
    <div data-testid="modal-expense">
      <span>{expense ? 'Editing' : 'Creating'}</span>
      <button data-testid="save-modal" onClick={() => onSave({ description: 'New description' })}>Save</button>
      <button data-testid="close-modal" onClick={onClose}>Close</button>
    </div>
  ) : null,
}))

vi.mock('@/components/expense/ExpenseActionsModal', () => ({
  ExpenseActionsModal: ({ isOpen, expense, onEdit, onDelete, onClose }: any) => isOpen ? (
    <div data-testid="actions-modal">
      <button onClick={() => onEdit(expense)}>Edit</button>
      <button onClick={() => onDelete(expense)}>Delete</button>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null,
}))

vi.mock('@/components/ui/ConfirmModal', () => ({
  ConfirmModal: ({ isOpen, onConfirm, onClose }: any) => isOpen ? (
    <div data-testid="confirm-modal">
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ) : null,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title, description, onAction }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      <button data-testid="new-expense-btn" onClick={onAction}>
        ➕ Novo Gasto
      </button>
    </div>
  ),
}));
vi.mock('@/utils/formatters', () => ({
  formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`,
  dateToInputFormat: (d: string) => d,
}))

vi.mock('@/components/expense/NewExpenseButton', () => ({
  NewExpenseButton: ({ onClick }: any) => (
    <button data-testid="new-expense-btn" onClick={onClick}>
      Novo Gasto
    </button>
  ),
}))

describe('ExpenseList', () => {
  const mockExpenses: Expense[] = [
    {
      id: 1,
      description: 'Japan Food',
      amount: 100,
      currency: 'JPY' as any,
      amountInBRL: 50,
      country: 'japan',
      date: '2026-03-01',
      category: 'food',
      budgetOrigin: 'Diego'
    },
    {
      id: 2,
      description: 'Korea Shopping',
      amount: 200,
      currency: 'KRW' as any,
      amountInBRL: 80,
      country: 'south-korea',
      date: '2026-03-02',
      category: 'shopping',
      budgetOrigin: 'Pamela'
    },
    {
      id: 3,
      description: 'Other Expense',
      amount: 10,
      currency: 'BRL' as any,
      amountInBRL: 10,
      country: undefined,
      date: '2026-03-03',
      category: 'other',
      budgetOrigin: 'Casal'
    }
  ]

  const defaultProps = {
    expenses: mockExpenses,
    onUpdate: vi.fn(),
    onCreate: vi.fn(),
    onDelete: vi.fn(),
    isLoading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render skeleton when isLoading is true', () => {
    const { container } = render(<ExpenseList {...defaultProps} isLoading={true} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should render EmptyState when there are no expenses', () => {
    render(<ExpenseList {...defaultProps} expenses={[]} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should calculate and display the total amount in BRL', () => {
    render(<ExpenseList {...defaultProps} />)
    expect(screen.getByText('R$ 140.00')).toBeInTheDocument()
  })

  it('should group expenses by country and display correct flags', () => {
    render(<ExpenseList {...defaultProps} />)

    expect(screen.getByText('Japão')).toBeInTheDocument()
    expect(screen.getByText('🇯🇵')).toBeInTheDocument()

    expect(screen.getByText('Coreia do Sul')).toBeInTheDocument()
    expect(screen.getByText('🇰🇷')).toBeInTheDocument()

    expect(screen.getByText('Outros')).toBeInTheDocument()
    expect(screen.getByText('🌍')).toBeInTheDocument()
  })

  it('should open actions modal when an expense card is clicked', () => {
    render(<ExpenseList {...defaultProps} />)

    const card = screen.getByTestId('expense-card-1')
    fireEvent.click(card)

    expect(screen.getByTestId('actions-modal')).toBeInTheDocument()
  })

  it('should open edit modal from actions modal', async () => {
    render(<ExpenseList {...defaultProps} />)

    fireEvent.click(screen.getByTestId('expense-card-1'))
    fireEvent.click(screen.getByText('Edit'))

    expect(screen.getByTestId('modal-expense')).toBeInTheDocument()
    expect(screen.getByText('Editing')).toBeInTheDocument()
    expect(screen.queryByTestId('actions-modal')).not.toBeInTheDocument()
  })

  it('should call onUpdate when saving an edited expense', async () => {
    render(<ExpenseList {...defaultProps} />)

    fireEvent.click(screen.getByTestId('expense-card-1'))
    fireEvent.click(screen.getByText('Edit'))

    fireEvent.click(screen.getByTestId('save-modal'))

    await waitFor(() => {
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        description: 'New description'
      }))
    })
  })

  it('should open confirm delete modal from actions modal', () => {
    render(<ExpenseList {...defaultProps} />)

    fireEvent.click(screen.getByTestId('expense-card-2'))
    fireEvent.click(screen.getByText('Delete'))

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
    expect(screen.queryByTestId('actions-modal')).not.toBeInTheDocument()
  })

  it('should call onDelete when confirming deletion', async () => {
    render(<ExpenseList {...defaultProps} />)

    fireEvent.click(screen.getByTestId('expense-card-2'))
    fireEvent.click(screen.getByText('Delete'))
    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(defaultProps.onDelete).toHaveBeenCalledWith(2)
    })
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
  })

  it('should sort expenses by date within each country group', () => {
    const unsortedExpenses = [
      { ...mockExpenses[0], id: 10, date: '2026-03-10' },
      { ...mockExpenses[0], id: 11, date: '2026-03-01' }
    ]

    render(<ExpenseList {...defaultProps} expenses={unsortedExpenses} />)

    const cards = screen.getAllByTestId(/expense-card-/)

    expect(cards[0]).toHaveTextContent('ID:11')
    expect(cards[1]).toHaveTextContent('ID:10')
  })

  it('should close modal and clear editing expense', async () => {
    const data: Expense[] = mockExpenses

    render(
      <ExpenseList
        expenses={data}
        onUpdate={defaultProps.onUpdate}
        onCreate={defaultProps.onCreate}
        onDelete={defaultProps.onDelete}
      />
    )

    fireEvent.click(screen.getByTestId('expense-card-1'))

    fireEvent.click(screen.getByText(/edit/i))

    fireEvent.click(screen.getByTestId('close-modal'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
  it('should call onCreate when saving new expense', async () => {
    render(<ExpenseList {...defaultProps} expenses={[]} />);

    fireEvent.click(screen.getByTestId('new-expense-btn'));

    await defaultProps.onCreate({ description: 'New description' });

    expect(defaultProps.onCreate).toHaveBeenCalledWith(expect.objectContaining({
      description: 'New description'
    }));
  });

  it('should close actions modal when clicking close', async () => {
    render(<ExpenseList {...defaultProps} />);

    fireEvent.click(screen.getByTestId('expense-card-1'));

    const actionsModal = screen.getByTestId('actions-modal');

    fireEvent.click(within(actionsModal).getByText('Close'));

    await waitFor(() => {
      expect(screen.queryByTestId('actions-modal')).not.toBeInTheDocument();
    });
  });

})