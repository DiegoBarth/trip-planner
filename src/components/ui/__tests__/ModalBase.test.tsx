import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { ModalBase } from '../ModalBase'

// Mock dependencies
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({ current: null }))
}))
vi.mock('lucide-react/dist/esm/icons/x', () => ({
  default: vi.fn(() => <span data-testid="close-icon">X</span>)
}))
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...args: any[]) => args.filter(Boolean).join(' '))
}))

describe('ModalBase', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    children: <div data-testid="modal-content">Test content</div>,
    type: 'create' as const
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ModalBase {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when isOpen is true', () => {
    render(<ModalBase {...defaultProps} isOpen={true} />)
    
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(
      <ModalBase {...defaultProps} isOpen={true} size="lg" />
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Test different sizes
    rerender(<ModalBase {...defaultProps} isOpen={true} size="sm" />)
    rerender(<ModalBase {...defaultProps} isOpen={true} size="xl" />)
  })

  it('renders title and close button when title provided', () => {
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        title="Test Modal"
      />
    )
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument()
    expect(screen.getByTestId('close-icon')).toBeInTheDocument()
  })

  it('closes modal when clicking overlay', async () => {
    const onClose = vi.fn()
    render(
      <ModalBase {...defaultProps} isOpen={true} onClose={onClose} />
    )
    
    const overlay = screen.getByRole('dialog').firstChild as HTMLElement
    fireEvent.click(overlay)
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not close when clicking overlay during loading', () => {
    const onClose = vi.fn()
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        onClose={onClose}
        loading={true}
      />
    )
    
    const overlay = screen.getByRole('dialog').firstChild as HTMLElement
    fireEvent.click(overlay)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes modal with Escape key', async () => {
    const onClose = vi.fn()
    render(
      <ModalBase {...defaultProps} isOpen={true} onClose={onClose} />
    )
    
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escapeEvent)
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not close with Escape key during loading', () => {
    const onClose = vi.fn()
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        onClose={onClose}
        loading={true}
      />
    )
    
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escapeEvent)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders Cancel button and calls onClose', async () => {
    const onClose = vi.fn()
    render(
      <ModalBase {...defaultProps} isOpen={true} onClose={onClose} />
    )
    
    fireEvent.click(screen.getByText('Cancelar'))
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('renders Save button for create type', async () => {
    const onSave = vi.fn()
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        type="create"
        onSave={onSave}
      />
    )
    
    expect(screen.getByText('Salvar')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Salvar'))
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })

  it('renders Delete button for edit type with onDelete', async () => {
    const onDelete = vi.fn()
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        type="edit"
        onDelete={onDelete}
      />
    )
    
    expect(screen.getByText('Excluir')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Excluir'))
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })

  it('shows loading text on Save button', () => {
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        type="create"
        onSave={vi.fn()}
        loading={true}
        loadingText="Processando..."
      />
    )
    
    expect(screen.getByText('Processando...')).toBeInTheDocument()
  })

  it('shows loading text on Delete button', () => {
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        type="edit"
        onDelete={vi.fn()}
        loading={true}
        loadingText="Excluindo..."
      />
    )
    
    expect(screen.getByText('Excluindo...')).toBeInTheDocument()
  })

  it('disables buttons during loading', () => {
    render(
      <ModalBase 
        {...defaultProps} 
        isOpen={true} 
        onSave={vi.fn()}
        loading={true}
      />
    )
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('disabled')
    })
  })

  it('has correct ARIA attributes', () => {
    render(
      <ModalBase {...defaultProps} isOpen={true} title="Test" />
    )
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    
    const closeButton = screen.getByLabelText('Fechar modal')
    expect(closeButton).toHaveAttribute('aria-label', 'Fechar modal')
  })
})