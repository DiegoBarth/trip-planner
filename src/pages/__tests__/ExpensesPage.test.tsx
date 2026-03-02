import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExpensesPage from '../ExpensesPage'
import { createPageWrapper } from './pageWrapper'
import { useExpense } from '@/hooks/useExpense'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'
import type { Expense } from '@/types/Expense'

vi.mock('@/hooks/useExpense', () => ({
  useExpense: vi.fn(),
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

vi.mock('@/components/expense/ExpenseList', () => ({
  default: function ExpenseList({
    expenses,
    onCreate,
    onUpdate,
    onDelete,
  }: {
    expenses: Expense[]
    onCreate: (p: Omit<Expense, 'id'>) => Promise<unknown>
    onUpdate: (p: Expense) => Promise<unknown>
    onDelete: (id: number) => Promise<void>
  }) {
    return (
      <div data-testid="expense-list">
        {expenses.map((e) => (
          <span key={e.id} data-testid={`expense-${e.id}`}>
            {e.description}
            <button type="button" onClick={() => onDelete(e.id)} aria-label="Excluir gasto">Excluir</button>
          </span>
        ))}
        <button type="button" onClick={() => Promise.resolve(onCreate({ description: 'Novo', amount: 100, currency: 'JPY', amountInBRL: 5, category: 'food', budgetOrigin: 'Atrações', date: '2025-03-01' })).catch(() => {})}>trigger onCreate</button>
        <button type="button" onClick={() => expenses[0] && Promise.resolve(onUpdate({ ...expenses[0], description: 'Updated' })).catch(() => {})}>trigger onUpdate</button>
      </div>
    )
  },
}))

vi.mock('@/components/expense/ModalExpense', () => ({
  ModalExpense: function ModalExpense({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean
    onClose: () => void
    onSave: (p: Omit<Expense, 'id'>) => void | Promise<void>
  }) {
    if (!isOpen) return null
    const payload = { description: 'Novo gasto', amount: 100, currency: 'JPY' as const, amountInBRL: 5, category: 'food' as const, budgetOrigin: 'Atrações' as const, date: '2025-03-01' }
    return (
      <div data-testid="modal-expense" role="dialog">
        <button type="button" onClick={onClose}>Fechar</button>
        <button type="button" onClick={() => Promise.resolve(onSave(payload)).then(onClose).catch(() => {})}>Salvar</button>
      </div>
    )
  },
}))

const mockUseExpense = vi.mocked(useExpense)
const mockUseToast = vi.mocked(useToast)
const mockUseCountry = vi.mocked(useCountry)

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    description: 'Almoço',
    amount: 50,
    currency: 'JPY',
    amountInBRL: 2,
    category: 'food',
    budgetOrigin: 'Atrações',
    date: '2025-03-01',
    ...overrides,
  }
}

describe('ExpensesPage', () => {
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
    mockUseExpense.mockReturnValue({
      expenses: [],
      isLoading: false,
      error: null,
      createExpense: vi.fn().mockResolvedValue(undefined),
      updateExpense: vi.fn().mockResolvedValue(undefined),
      deleteExpense: vi.fn().mockResolvedValue(undefined),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
  })

  it('renders page header with title', () => {
    render(<ExpensesPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Gastos/i })).toBeInTheDocument()
  })

  it('renders Fab to add expense', () => {
    render(<ExpensesPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('renders ExpenseList when loaded', async () => {
    mockUseExpense.mockReturnValue({
      expenses: [makeExpense({ id: 1, description: 'Almoço' })],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ExpensesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Almoço/i)).toBeInTheDocument()
    })
  })

  it('handleCreate success via modal shows toast and closes modal', async () => {
    const createExpense = vi.fn().mockResolvedValue(undefined)
    mockUseExpense.mockReturnValue({
      expenses: [],
      isLoading: false,
      error: null,
      createExpense,
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ExpensesPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-expense')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(createExpense).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Gasto criado com sucesso!')
    })
    await waitFor(() => {
      expect(screen.queryByTestId('modal-expense')).not.toBeInTheDocument()
    })
  })

  it('handleCreate error shows error toast', async () => {
    mockUseExpense.mockReturnValue({
      expenses: [],
      isLoading: false,
      error: null,
      createExpense: vi.fn().mockRejectedValue(new Error('API error')),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ExpensesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onCreate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onCreate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao criar gasto')
    })
    errSpy.mockRestore()
  })

  it('handleUpdate success shows toast', async () => {
    const updateExpense = vi.fn().mockResolvedValue(undefined)
    mockUseExpense.mockReturnValue({
      expenses: [makeExpense({ id: 1, description: 'Almoço' })],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense,
      deleteExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ExpensesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onUpdate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(updateExpense).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Gasto atualizado com sucesso!')
    })
  })

  it('handleUpdate error shows error toast', async () => {
    mockUseExpense.mockReturnValue({
      expenses: [makeExpense({ id: 1, description: 'Almoço' })],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn().mockRejectedValue(new Error('API error')),
      deleteExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ExpensesPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar gasto')
    })
    errSpy.mockRestore()
  })

  it('handleDelete success shows toast', async () => {
    const deleteExpense = vi.fn().mockResolvedValue(undefined)
    mockUseExpense.mockReturnValue({
      expenses: [makeExpense({ id: 1, description: 'Almoço' })],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<ExpensesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir gasto/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Excluir gasto/i }))
    await waitFor(() => {
      expect(deleteExpense).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Gasto excluído com sucesso!')
    })
  })

  it('handleDelete error shows error toast', async () => {
    mockUseExpense.mockReturnValue({
      expenses: [makeExpense({ id: 1, description: 'Almoço' })],
      isLoading: false,
      error: null,
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn().mockRejectedValue(new Error('API error')),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ExpensesPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Excluir gasto/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao excluir gasto')
    })
    errSpy.mockRestore()
  })

  it('modal onClose hides modal', async () => {
    render(<ExpensesPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-expense')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('modal-expense')).not.toBeInTheDocument()
    })
  })

  it('shows date filter in subtitle when searchParams has date', () => {
    const WrapperWithDate = createPageWrapper(['/expenses?date=2025-03-01'])
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
    render(<ExpensesPage />, { wrapper: WrapperWithDate })
    expect(screen.getByText(/Filtrando por/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Limpar filtro de data/i })).toBeInTheDocument()
  })
})
