import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChecklistList from '../ChecklistList'
import type { ChecklistItem } from '@/types/ChecklistItem'

vi.mock('@/components/checklist/ChecklistCard', () => ({
  ChecklistCard: ({ item, onClick }: any) => (
    <div data-testid="card" onClick={() => onClick?.(item)}>
      {item.description}
    </div>
  ),
}))

vi.mock('@/components/checklist/ModalChecklistItem', () => ({
  ModalChecklistItem: ({ isOpen, onClose, onSave }: any) =>
    isOpen ?
      <div data-testid="modal-item">
        <button onClick={onClose}>close-modal</button>
        <button
          onClick={() =>
            onSave({
              description: 'Novo',
              category: 'documents',
              isPacked: false,
            })
          }
        >
          save-modal
        </button>
      </div>
      : null
}))

vi.mock('@/components/checklist/ChecklistActionsModal', () => ({
  ChecklistActionsModal: ({ isOpen, onEdit, onDelete, item }: any) =>
    isOpen ? (
      <div data-testid="actions-modal">
        <button onClick={() => onEdit(item)}>edit</button>
        <button onClick={() => onDelete(item)}>delete</button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/ConfirmModal', () => ({
  ConfirmModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>confirm</button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title }: any) => <div>{title}</div>,
}))

vi.mock('@/utils/exportChecklistToPDF', () => ({
  exportChecklistToPDF: vi.fn(),
}))

const baseItems: ChecklistItem[] = [
  {
    id: 1,
    description: 'Passaporte',
    category: 'documents',
    isPacked: true,
  },
  {
    id: 2,
    description: 'Camisa',
    category: 'clothes',
    isPacked: false,
  },
]

describe('ChecklistList', () => {
  const onUpdate = vi.fn()
  const onCreate = vi.fn()
  const onDelete = vi.fn()
  const onTogglePacked = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header stats correctly', () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    expect(screen.getByText(/2 itens no total/i)).toBeInTheDocument()
    expect(screen.getByText(/1 de 2 \(50%\)/i)).toBeInTheDocument()
  })

  it('renders grouped categories', () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('Roupas')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(
      <ChecklistList
        items={[]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    expect(
      screen.getByText(/Nenhum item no checklist/i)
    ).toBeInTheDocument()
  })

  it('does not render when loading', () => {
    const { container } = render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
        isLoading
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('opens actions modal when card is clicked', () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    fireEvent.click(screen.getAllByTestId('card')[0])

    expect(screen.getByTestId('actions-modal')).toBeInTheDocument()
  })

  it('opens edit modal from actions modal', () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    fireEvent.click(screen.getAllByTestId('card')[0])
    fireEvent.click(screen.getByText('edit'))

    expect(screen.getByTestId('modal-item')).toBeInTheDocument()
  })

  it('opens confirm modal and deletes item', async () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    fireEvent.click(screen.getAllByTestId('card')[0])
    fireEvent.click(screen.getByText('delete'))

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByText('confirm'))

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(1)
    })
  })

  it('exports PDF when clicking export button', async () => {
    const { exportChecklistToPDF } = await import(
      '@/utils/exportChecklistToPDF'
    )

    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    fireEvent.click(screen.getByText(/Exportar PDF/i))

    await waitFor(() => {
      expect(exportChecklistToPDF).toHaveBeenCalledWith({
        items: baseItems,
      })
    })
  })

  it('closes edit modal correctly', () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    fireEvent.click(screen.getAllByTestId('card')[0])
    fireEvent.click(screen.getByText('edit'))

    expect(screen.getByTestId('modal-item')).toBeInTheDocument()

    fireEvent.click(screen.getByText('close-modal'))

    expect(screen.queryByTestId('modal-item')).not.toBeInTheDocument()
  })

  it('calls onUpdate when saving existing item', async () => {
    render(
      <ChecklistList
        items={baseItems}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onTogglePacked={onTogglePacked}
      />
    )

    fireEvent.click(screen.getAllByTestId('card')[0])
    fireEvent.click(screen.getByText('edit'))
    fireEvent.click(screen.getByText('save-modal'))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
    })
  })
})