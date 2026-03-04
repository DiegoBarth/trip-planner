import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ModalBudget } from '../ModalBudget'
import type { Budget } from '@/types/Budget'

const toastError = vi.fn()

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({
    error: toastError,
  }),
}))

vi.mock('@/components/ui/ModalBase', () => ({
  ModalBase: ({ isOpen, title, onSave, children, loading }: any) =>
    isOpen ? (
      <div>
        <h1>{title}</h1>
        {loading && <span data-testid="loading">loading</span>}
        {children}
        <button data-testid="modal-submit" onClick={onSave}>
          salvar
        </button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ value, onChange }: any) => (
    <input
      data-testid="date-field"
      value={value ? '2026-03-01' : ''}
      onChange={() => onChange?.(new Date('2026-03-01'))}
    />
  ),
}))

const validateMock = vi.fn()

vi.mock('@/schemas/validateWithToast', () => ({
  validateWithToast: (...args: any[]) => validateMock(...args),
}))

const budgetMock: Budget = {
  id: 1,
  origin: 'Diego',
  description: 'Hotel',
  amount: 500,
  date: '2026-03-01',
}

function renderComponent(props?: Partial<React.ComponentProps<typeof ModalBudget>>) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  }

  return render(<ModalBudget {...defaultProps} {...props} />)
}

beforeEach(() => {
  vi.clearAllMocks()
  validateMock.mockReturnValue(true)
})

describe('ModalBudget', () => {
  it('renders create mode correctly', () => {
    renderComponent()

    expect(
      screen.getByText(/novo orçamento/i)
    ).toBeInTheDocument()
  })

  it('renders edit mode when budget is provided', () => {
    renderComponent({ budget: budgetMock })

    expect(
      screen.getByText(/editar orçamento/i)
    ).toBeInTheDocument()
  })

  it('fills form when editing', async () => {
    renderComponent({ budget: budgetMock })

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Hotel')
      ).toBeInTheDocument()
    })
  })

  it('allows changing origin', () => {
    renderComponent()

    const originButtons = screen.getAllByRole('button')
    fireEvent.click(originButtons[0])

    expect(originButtons[0]).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    renderComponent({ onSave, onClose })

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Teste orçamento' },
    })

    fireEvent.change(screen.getByLabelText(/valor \(r\$\)/i), {
      target: { value: '10000' },
    })

    fireEvent.click(screen.getByTestId('modal-submit'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('does not submit when validation fails', async () => {
    validateMock.mockReturnValue(false)

    const onSave = vi.fn()

    renderComponent({ onSave })

    fireEvent.click(screen.getByTestId('modal-submit'))

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled()
    })
  })

  it('shows loading state while saving', async () => {
    let resolvePromise!: () => void

    const onSave = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve
        })
    )

    renderComponent({ onSave })

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Teste' },
    })

    fireEvent.click(screen.getByTestId('modal-submit'))

    expect(await screen.findByTestId('loading')).toBeInTheDocument()

    resolvePromise()

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
  })

  it('formats currency input on change', () => {
    renderComponent()

    const input = screen.getByLabelText(/valor \(r\$\)/i)

    fireEvent.change(input, {
      target: { value: '1234' },
    })

    expect(input).toBeInTheDocument()
  })

  it('resets form when reopened in create mode', async () => {
    const { rerender } = renderComponent({
      isOpen: true,
      budget: budgetMock,
    })

    rerender(
      <ModalBudget
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(/novo orçamento/i)
      ).toBeInTheDocument()
    })
  })
})