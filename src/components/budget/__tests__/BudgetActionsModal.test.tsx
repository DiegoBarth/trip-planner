import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BudgetActionsModal } from '../BudgetActionsModal'

vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
}))

const baseBudget = {
  id: 1,
  origin: 'Diego',
  description: 'Hotel',
  amount: 500,
  date: '2026-03-01',
} as const

function renderComponent(props?: Partial<React.ComponentProps<typeof BudgetActionsModal>>) {
  const defaultProps = {
    budget: baseBudget,
    isOpen: true,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }

  return render(<BudgetActionsModal {...defaultProps} {...props} />)
}

describe('BudgetActionsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when closed', () => {
    renderComponent({ isOpen: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render when budget is null', () => {
    renderComponent({ budget: null })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders budget information correctly', () => {
    renderComponent()

    expect(screen.getByText('Hotel')).toBeInTheDocument()
    expect(screen.getByText('Diego')).toBeInTheDocument()
    expect(screen.getByText('👨')).toBeInTheDocument()
    expect(screen.getByText('R$ 500.00')).toBeInTheDocument()
  })

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn()

    renderComponent({ onClose })

    fireEvent.click(screen.getByLabelText(/fechar/i))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking overlay', () => {
    const onClose = vi.fn()

    renderComponent({ onClose })

    const overlay = document.querySelector('[aria-hidden="true"]')!
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit and onClose when clicking edit', () => {
    const onClose = vi.fn()
    const onEdit = vi.fn()

    renderComponent({ onClose, onEdit })

    fireEvent.click(screen.getByRole('button', { name: /editar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(baseBudget)
  })

  it('calls onDelete and onClose when clicking delete', () => {
    const onClose = vi.fn()
    const onDelete = vi.fn()

    renderComponent({ onClose, onDelete })

    fireEvent.click(screen.getByRole('button', { name: /excluir/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(baseBudget)
  })

  it('closes when pressing Escape', () => {
    const onClose = vi.fn()

    renderComponent({ onClose })

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    renderComponent()

    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'budget-actions-title')
  })

  it('renders origin info only when origin exists', () => {
    renderComponent()

    expect(screen.getByText('Diego')).toBeInTheDocument()
  })
})