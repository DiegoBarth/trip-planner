import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BudgetPage from '../BudgetPage'
import { createPageWrapper } from './pageWrapper'
import { useBudget } from '@/hooks/useBudget'
import { useToast } from '@/contexts/toast'

vi.mock('@/hooks/useBudget', () => ({
  useBudget: vi.fn(),
}))

vi.mock('@/contexts/toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/toast')>()
  return {
    ...actual,
    useToast: vi.fn(),
  }
})

vi.mock('@/components/budget/BudgetList', () => ({
  default: function BudgetList({
    budgets,
    onCreate,
    onUpdate,
    onDelete,
  }: {
    budgets: { id: number; origin: string; description: string }[]
    onCreate: (p: unknown) => Promise<unknown>
    onUpdate: (p: unknown) => Promise<unknown>
    onDelete: (id: number) => Promise<void>
  }) {
    return (
      <div data-testid="budget-list">
        {budgets.map((b) => (
          <span key={b.id} data-testid={`budget-${b.id}`}>
            {b.description}
            <button type="button" onClick={() => onDelete(b.id)} aria-label="Excluir orçamento">Excluir</button>
          </span>
        ))}
        <button type="button" onClick={() => Promise.resolve(onCreate({ origin: 'Atrações', description: 'Novo', amount: 1000, date: '2025-03-01' })).catch(() => {})}>trigger onCreate</button>
        <button type="button" onClick={() => budgets[0] && Promise.resolve(onUpdate({ ...budgets[0], amount: 6000 })).catch(() => {})}>trigger onUpdate</button>
      </div>
    )
  },
}))

vi.mock('@/components/budget/ModalBudget', () => ({
  ModalBudget: function ModalBudget({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean
    onClose: () => void
    onSave: (p: unknown) => void | Promise<void>
  }) {
    if (!isOpen) return null
    const payload = { origin: 'Atrações', description: 'Novo', amount: 1000, date: '2025-03-01' }
    return (
      <div data-testid="modal-budget" role="dialog">
        <button type="button" onClick={onClose}>Fechar</button>
        <button type="button" onClick={() => Promise.resolve(onSave(payload)).then(onClose).catch(() => {})}>Salvar</button>
      </div>
    )
  },
}))

const mockUseBudget = vi.mocked(useBudget)
const mockUseToast = vi.mocked(useToast)

describe('BudgetPage', () => {
  const Wrapper = createPageWrapper()
  const mockSuccess = vi.fn()
  const mockError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseToast.mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
      warning: vi.fn(),
      clear: vi.fn(),
    })
    mockUseBudget.mockReturnValue({
      budgets: [],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue(undefined),
      createBudget: vi.fn().mockResolvedValue({ id: 1 }),
      updateBudget: vi.fn().mockResolvedValue(undefined),
      deleteBudget: vi.fn().mockResolvedValue(undefined),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
  })

  it('renders page header with title and subtitle', () => {
    render(<BudgetPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Orçamento/i })).toBeInTheDocument()
    expect(screen.getByText(/Gerencie o orçamento da sua viagem/i)).toBeInTheDocument()
  })

  it('renders Fab to add budget', () => {
    render(<BudgetPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('renders BudgetList when loaded', async () => {
    mockUseBudget.mockReturnValue({
      budgets: [{
        id: 1,
        origin: 'Atrações',
        description: 'Passeios',
        amount: 5000,
        date: '2025-03-01',
      }],
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
    render(<BudgetPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Passeios/i)).toBeInTheDocument()
    })
  })

  it('handleCreate success via modal shows toast and closes modal', async () => {
    const createBudget = vi.fn().mockResolvedValue({ id: 1 })
    mockUseBudget.mockReturnValue({
      budgets: [],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createBudget,
      updateBudget: vi.fn(),
      deleteBudget: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<BudgetPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-budget')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(createBudget).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Orçamento criado com sucesso!')
    })
    await waitFor(() => {
      expect(screen.queryByTestId('modal-budget')).not.toBeInTheDocument()
    })
  })

  it('handleCreate error shows error toast', async () => {
    mockUseBudget.mockReturnValue({
      budgets: [],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createBudget: vi.fn().mockRejectedValue(new Error('API error')),
      updateBudget: vi.fn(),
      deleteBudget: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<BudgetPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onCreate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onCreate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao criar orçamento')
    })
    errSpy.mockRestore()
  })

  it('handleUpdate success shows toast', async () => {
    const updateBudget = vi.fn().mockResolvedValue(undefined)
    mockUseBudget.mockReturnValue({
      budgets: [{ id: 1, origin: 'Atrações', description: 'Passeios', amount: 5000, date: '2025-03-01' }],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createBudget: vi.fn(),
      updateBudget,
      deleteBudget: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<BudgetPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onUpdate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(updateBudget).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Orçamento atualizado com sucesso!')
    })
  })

  it('handleUpdate error shows error toast', async () => {
    mockUseBudget.mockReturnValue({
      budgets: [{ id: 1, origin: 'Atrações', description: 'Passeios', amount: 5000, date: '2025-03-01' }],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createBudget: vi.fn(),
      updateBudget: vi.fn().mockRejectedValue(new Error('API error')),
      deleteBudget: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<BudgetPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar orçamento')
    })
    errSpy.mockRestore()
  })

  it('handleDelete success shows toast', async () => {
    const deleteBudget = vi.fn().mockResolvedValue(undefined)
    mockUseBudget.mockReturnValue({
      budgets: [{ id: 1, origin: 'Atrações', description: 'Passeios', amount: 5000, date: '2025-03-01' }],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createBudget: vi.fn(),
      updateBudget: vi.fn(),
      deleteBudget,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<BudgetPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir orçamento/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Excluir orçamento/i }))
    await waitFor(() => {
      expect(deleteBudget).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Orçamento excluído com sucesso!')
    })
  })

  it('handleDelete error shows error toast', async () => {
    mockUseBudget.mockReturnValue({
      budgets: [{ id: 1, origin: 'Atrações', description: 'Passeios', amount: 5000, date: '2025-03-01' }],
      budgetSummary: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createBudget: vi.fn(),
      updateBudget: vi.fn(),
      deleteBudget: vi.fn().mockRejectedValue(new Error('API error')),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<BudgetPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Excluir orçamento/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao excluir orçamento')
    })
    errSpy.mockRestore()
  })

  it('modal onClose hides modal', async () => {
    render(<BudgetPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-budget')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('modal-budget')).not.toBeInTheDocument()
    })
  })
})
