import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import BudgetList from '../BudgetList'
import type { Budget } from '@/types/Budget'

vi.mock('@/components/budget/BudgetItemCard', () => ({
  BudgetItemCard: ({ budget, onClick }: any) => (
    <button
      data-testid={`budget-card-${budget.id}`}
      onClick={() => onClick?.(budget)}
    >
      {budget.description}
    </button>
  ),
}))

vi.mock('@/components/budget/ModalBudget', () => ({
  ModalBudget: ({ isOpen, onSave }: any) =>
    isOpen ? (
      <button
        data-testid="modal-save"
        onClick={() =>
          onSave({
            origin: 'Diego',
            description: 'Novo orçamento',
            amount: 100,
            date: '2026-03-01',
          })
        }
      >
        salvar
      </button>
    ) : null,
}))

vi.mock('@/components/budget/BudgetActionsModal', () => ({
  BudgetActionsModal: ({ isOpen, budget, onEdit, onDelete }: any) =>
    isOpen ? (
      <div data-testid="actions-modal">
        <button onClick={() => onEdit(budget)}>editar</button>
        <button onClick={() => onDelete(budget)}>deletar</button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/ConfirmModal', () => ({
  ConfirmModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <button data-testid="confirm-delete" onClick={onConfirm}>
        confirmar
      </button>
    ) : null,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title }: any) => <div>{title}</div>,
}))

const toastError = vi.fn()

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({
    error: toastError,
  }),
}))

const budgetA: Budget = {
  id: 1,
  origin: 'Diego',
  description: 'Hotel',
  amount: 500,
  date: '2026-03-02',
}

const budgetB: Budget = {
  id: 2,
  origin: 'Pamela',
  description: 'Passeio',
  amount: 300,
  date: '2026-03-01',
}

function renderComponent(props?: Partial<React.ComponentProps<typeof BudgetList>>) {
  const defaultProps = {
    budgets: [],
    isLoading: false,
    onUpdate: vi.fn(),
    onCreate: vi.fn(),
    onDelete: vi.fn(),
  }

  return render(<BudgetList {...defaultProps} {...props} />)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => { })
})

afterEach(() => {
   vi.restoreAllMocks()
})

describe('BudgetList', () => {
  it('shows skeleton when loading', () => {
    const { container } = renderComponent({ isLoading: true })
    expect(container.firstChild).not.toBeNull()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no budgets', () => {
    renderComponent({ budgets: [] })

    expect(
      screen.getByText(/nenhum orçamento encontrado/i)
    ).toBeInTheDocument()
  })

  it('renders grouped budgets', () => {
    renderComponent({ budgets: [budgetA, budgetB] })

    expect(screen.getByText('Diego')).toBeInTheDocument()
    expect(screen.getByText('Pamela')).toBeInTheDocument()
  })

  it('sorts budgets by date desc inside group', () => {
    const older: Budget = { ...budgetA, id: 3, date: '2026-02-01' }

    renderComponent({ budgets: [older, budgetA] })

    const cards = screen.getAllByTestId(/budget-card-/)

    expect(cards[0]).toHaveTextContent('Hotel')
  })

  it('opens actions modal when card is clicked', () => {
    renderComponent({ budgets: [budgetA] })

    fireEvent.click(screen.getByTestId('budget-card-1'))

    expect(screen.getByTestId('actions-modal')).toBeInTheDocument()
  })

  it('opens edit modal from actions', async () => {
    renderComponent({ budgets: [budgetA] })

    fireEvent.click(screen.getByTestId('budget-card-1'))
    fireEvent.click(screen.getByText(/editar/i))

    await waitFor(() => {
      expect(screen.getByTestId('modal-save')).toBeInTheDocument()
    })
  })

  it('calls onUpdate when editing existing budget', async () => {
    const onUpdate = vi.fn().mockResolvedValue(budgetA)

    renderComponent({
      budgets: [budgetA],
      onUpdate,
    })

    fireEvent.click(screen.getByTestId('budget-card-1'))
    fireEvent.click(screen.getByText(/editar/i))
    fireEvent.click(await screen.findByTestId('modal-save'))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
    })
  })

  it('opens delete confirmation from actions', async () => {
    renderComponent({ budgets: [budgetA] })

    fireEvent.click(screen.getByTestId('budget-card-1'))
    fireEvent.click(screen.getByText(/deletar/i))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete')).toBeInTheDocument()
    })
  })

  it('calls onDelete after confirmation', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)

    renderComponent({
      budgets: [budgetA],
      onDelete,
    })

    fireEvent.click(screen.getByTestId('budget-card-1'))
    fireEvent.click(screen.getByText(/deletar/i))
    fireEvent.click(await screen.findByTestId('confirm-delete'))

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(1)
    })
  })

  it('shows toast when save fails', async () => {
    const onUpdate = vi.fn().mockRejectedValue(new Error('fail'))

    renderComponent({
      budgets: [budgetA],
      onUpdate,
    })

    fireEvent.click(screen.getByTestId('budget-card-1'))
    fireEvent.click(screen.getByText(/editar/i))
    fireEvent.click(await screen.findByTestId('modal-save'))

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        'Erro ao salvar orçamento'
      )
    })
  })
})