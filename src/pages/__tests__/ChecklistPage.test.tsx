import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChecklistPage from '../ChecklistPage'
import { createPageWrapper } from './pageWrapper'
import { useChecklist } from '@/hooks/useChecklist'
import { useToast } from '@/contexts/toast'
import type { ChecklistItem } from '@/types/ChecklistItem'

vi.mock('@/hooks/useChecklist', () => ({
  useChecklist: vi.fn(),
}))

vi.mock('@/contexts/toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/toast')>()
  return {
    ...actual,
    useToast: vi.fn(),
  }
})

vi.mock('@/components/checklist/ChecklistList', () => ({
  default: function ChecklistList({
    items,
    onCreate,
    onUpdate,
    onDelete,
    onTogglePacked,
  }: {
    items: ChecklistItem[]
    onCreate: (p: Omit<ChecklistItem, 'id'>) => Promise<unknown>
    onUpdate: (p: ChecklistItem) => Promise<unknown>
    onDelete: (id: number) => Promise<void>
    onTogglePacked: (id: number, isPacked: boolean) => Promise<void>
  }) {
    return (
      <div data-testid="checklist-list">
        <span>Checklist de Viagem</span>
        {items.map((item) => (
          <span key={item.id} data-testid={`checklist-item-${item.id}`}>
            {item.description}
            <button type="button" onClick={() => onDelete(item.id)} aria-label="Excluir item">Excluir</button>
            <button type="button" onClick={() => onTogglePacked(item.id, !item.isPacked)} aria-label="Toggle empacotado">Toggle empacotado</button>
          </span>
        ))}
        <button type="button" onClick={() => Promise.resolve(onCreate({ description: 'Novo', category: 'other', isPacked: false })).catch(() => {})}>trigger onCreate</button>
        <button type="button" onClick={() => items[0] && Promise.resolve(onUpdate({ ...items[0], description: 'Updated' })).catch(() => {})}>trigger onUpdate</button>
      </div>
    )
  },
}))

vi.mock('@/components/checklist/ModalChecklistItem', () => ({
  ModalChecklistItem: function ModalChecklistItem({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean
    onClose: () => void
    onSave: (p: Omit<ChecklistItem, 'id'>) => void | Promise<void>
  }) {
    if (!isOpen) return null
    const payload = { description: 'Novo item', category: 'other' as const, isPacked: false }
    return (
      <div data-testid="modal-checklist-item" role="dialog">
        <h2>Novo Item</h2>
        <button type="button" onClick={onClose}>Fechar</button>
        <button type="button" onClick={() => Promise.resolve(onSave(payload)).then(onClose).catch(() => {})}>Salvar</button>
      </div>
    )
  },
}))

const mockUseChecklist = vi.mocked(useChecklist)
const mockUseToast = vi.mocked(useToast)

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: 1,
    description: 'Passaporte',
    category: 'documents',
    isPacked: false,
    ...overrides,
  }
}

describe('ChecklistPage', () => {
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
    mockUseChecklist.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      createItem: vi.fn().mockResolvedValue(undefined),
      updateItem: vi.fn().mockResolvedValue(undefined),
      deleteItem: vi.fn().mockResolvedValue(undefined),
      togglePacked: vi.fn().mockResolvedValue(undefined),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
  })

  it('renders page header with title', () => {
    render(<ChecklistPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Checklist/i })).toBeInTheDocument()
  })

  it('renders ChecklistList content when loaded', async () => {
    render(<ChecklistPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Checklist de Viagem/i)).toBeInTheDocument()
    })
  })

  it('renders Fab to add item', () => {
    render(<ChecklistPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('opens modal when Fab is clicked', async () => {
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Novo Item/i })).toBeInTheDocument()
    })
  })

  it('renders when isLoading (ChecklistList returns null)', () => {
    mockUseChecklist.mockReturnValue({
      items: [],
      isLoading: true,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    render(<ChecklistPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Checklist/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('handleCreate success via modal shows toast and closes modal', async () => {
    const createItem = vi.fn().mockResolvedValue(undefined)
    mockUseChecklist.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      createItem,
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-checklist-item')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(createItem).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Item adicionado com sucesso!')
    })
    await waitFor(() => {
      expect(screen.queryByTestId('modal-checklist-item')).not.toBeInTheDocument()
    })
  })

  it('handleCreate error shows error toast', async () => {
    mockUseChecklist.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      createItem: vi.fn().mockRejectedValue(new Error('API error')),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ChecklistPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onCreate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onCreate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao adicionar item')
    })
    errSpy.mockRestore()
  })

  it('handleUpdate success shows toast', async () => {
    const updateItem = vi.fn().mockResolvedValue(undefined)
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A' })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem,
      deleteItem: vi.fn(),
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    render(<ChecklistPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onUpdate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(updateItem).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Item atualizado com sucesso!')
    })
  })

  it('handleUpdate error shows error toast', async () => {
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A' })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn().mockRejectedValue(new Error('API error')),
      deleteItem: vi.fn(),
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar item')
    })
    errSpy.mockRestore()
  })

  it('handleDelete success shows toast', async () => {
    const deleteItem = vi.fn().mockResolvedValue(undefined)
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A' })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem,
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    render(<ChecklistPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir item/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Excluir item/i }))
    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Item excluído com sucesso!')
    })
  })

  it('handleDelete error shows error toast', async () => {
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A' })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn().mockRejectedValue(new Error('API error')),
      togglePacked: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Excluir item/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao excluir item')
    })
    errSpy.mockRestore()
  })

  it('handleTogglePacked success when packing shows toast', async () => {
    const togglePacked = vi.fn().mockResolvedValue(undefined)
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A', isPacked: false })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      togglePacked,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Toggle empacotado/i }))
    await waitFor(() => {
      expect(togglePacked).toHaveBeenCalledWith({ id: 1, isPacked: true })
      expect(mockSuccess).toHaveBeenCalledWith('Item marcado como empacotado!')
    })
  })

  it('handleTogglePacked success when unpacking shows toast', async () => {
    const togglePacked = vi.fn().mockResolvedValue(undefined)
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A', isPacked: true })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      togglePacked,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Toggle empacotado/i }))
    await waitFor(() => {
      expect(togglePacked).toHaveBeenCalledWith({ id: 1, isPacked: false })
      expect(mockSuccess).toHaveBeenCalledWith('Item desmarcado!')
    })
  })

  it('handleTogglePacked error shows error toast', async () => {
    mockUseChecklist.mockReturnValue({
      items: [makeItem({ id: 1, description: 'Item A' })],
      isLoading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      togglePacked: vi.fn().mockRejectedValue(new Error('API error')),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isToggling: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Toggle empacotado/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar item')
    })
    errSpy.mockRestore()
  })

  it('modal onClose hides modal', async () => {
    render(<ChecklistPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-checklist-item')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('modal-checklist-item')).not.toBeInTheDocument()
    })
  })
})
