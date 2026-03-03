import { describe, it, vi, beforeEach, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { ComponentProps } from 'react'

import { ModalExpense } from '@/components/expense/ModalExpense'
import { COUNTRIES } from '@/config/constants'

const mockSuccess = vi.fn()
const mockError = vi.fn()
const mockOnClose = vi.fn()
const mockOnSave = vi.fn()

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError
  })
}))

vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ rates: { BRL: 1, JPY: 0.05, KRW: 0.004 } })
}))

vi.mock('@/schemas/validateWithToast', () => ({
  validateWithToast: vi.fn(() => true)
}))

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: ({ id, value, onChange, options }: any) => (
    <select
      data-testid={`custom-select-${id}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value=""></option>
      {options?.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ id, onChange }: any) => (
    <input
      id={id}
      data-testid={id}
      type="date"
      onChange={(e: any) =>
        onChange?.(e.target.value ? new Date(e.target.value) : undefined)
      }
    />
  )
}))

vi.mock('@/components/ui/ModalBase', () => ({
  ModalBase: ({ title, onClose, onSave, children, loading }: any) => (
    <div data-testid="modal-base">
      <h2 data-testid="modal-title">{title}</h2>

      <form
        data-testid="modal-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSave?.(e)
        }}
      >
        <button
          data-testid="save-button"
          type="submit"
          disabled={loading}
        >
          Salvar
        </button>

        <div>{children}</div>
      </form>

      <button
        data-testid="close-button"
        type="button"
        onClick={onClose}
      >
        Fechar
      </button>
    </div>
  )
}))

// =======================
// helpers
// =======================

const mockExpense = {
  id: 1,
  description: 'Almoço teste',
  amount: 100,
  currency: 'BRL' as const,
  amountInBRL: 100,
  category: 'food' as const,
  budgetOrigin: 'Casal' as const,
  date: '2026-03-03',
  country: 'general' as const,
  notes: 'teste',
  receiptUrl: ''
}

const renderModal = (
  props?: Partial<ComponentProps<typeof ModalExpense>>
) =>
  render(
    <ModalExpense
      isOpen={true}
      onClose={mockOnClose}
      onSave={mockOnSave}
      {...props}
    />
  )

beforeEach(() => {
  vi.clearAllMocks()
})

// =======================
// tests
// =======================

describe('ModalExpense Component', () => {
  it('renders modal in create mode', () => {
    renderModal()

    expect(screen.getByText(/Novo Gasto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument()
    expect(screen.getByTestId('custom-select-expense-country')).toBeInTheDocument()
    expect(screen.getByTestId('custom-select-expense-currency')).toBeInTheDocument()
  })

  it('renders modal in edit mode with initial expense', () => {
    renderModal({ expense: mockExpense })

    expect(screen.getByText(/Editar Gasto/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Almoço teste')).toBeInTheDocument()
    expect(screen.getByDisplayValue('R$ 100,00')).toBeInTheDocument()
  })

  it('calls onSave when form is submitted', async () => {
    renderModal()

    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: 'Jantar Teste' }
    })

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })
  })

  it('sets country when CustomSelect returns a valid label', async () => {
    renderModal()

    const countrySelect = screen.getByTestId(
      'custom-select-expense-country'
    )

    const firstCountry = Object.values(COUNTRIES)[0]
    const label = `${firstCountry.flag} ${firstCountry.name}`

    fireEvent.change(countrySelect, {
      target: { value: label }
    })

    await waitFor(() => {
      expect(countrySelect).toBeInTheDocument()
    })
  })

  it('updates currency via CustomSelect', async () => {
    renderModal()

    const currencySelect = screen.getByTestId('custom-select-expense-currency')
    fireEvent.change(currencySelect, { target: { value: '¥ Iene (JPY)' } })

    await waitFor(() => {
      expect(currencySelect).toBeInTheDocument()
    })
  })

  it('does not call onSave when validation fails', async () => {
    const validateMock = await import('@/schemas/validateWithToast')
    vi.mocked(validateMock.validateWithToast).mockReturnValue(false)

    renderModal()

    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: 'Teste' }
    })

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })
})