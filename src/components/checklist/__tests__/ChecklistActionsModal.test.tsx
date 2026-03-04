import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChecklistActionsModal } from '../ChecklistActionsModal'
import type { ChecklistItem } from '@/types/ChecklistItem'

vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null })
}))

vi.mock('@/config/constants', () => ({
  CHECKLIST_CATEGORIES: {
    documents: { label: 'Documentos', icon: '📄', color: '#1d4ed8' }
  }
}))

describe('ChecklistActionsModal', () => {
  const baseItem: ChecklistItem = {
    id: 1,
    description: 'Passaporte',
    category: 'documents',
    isPacked: false
  }

  const onClose = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when closed', () => {
    render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen={false}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render when item is null', () => {
    render(
      <ChecklistActionsModal
        item={null}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal with item data', () => {
    render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Passaporte')).toBeInTheDocument()
    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Excluir')).toBeInTheDocument()
  })

  it('calls onClose when clicking overlay', () => {
    const { container } = render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const overlay = container.querySelector('.bg-black\\/40') as HTMLElement
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking close button', () => {
    render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByLabelText('Fechar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls edit flow correctly', () => {
    render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByText('Editar'))

    expect(onClose).toHaveBeenCalled()
    expect(onEdit).toHaveBeenCalledWith(baseItem)
  })

  it('calls delete flow correctly', () => {
    render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByText('Excluir'))

    expect(onClose).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(baseItem)
  })

  it('closes on Escape key', () => {
    render(
      <ChecklistActionsModal
        item={baseItem}
        isOpen
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})