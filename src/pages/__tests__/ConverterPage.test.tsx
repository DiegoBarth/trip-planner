import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConverterPage from '../ConverterPage'
import { createPageWrapper } from './pageWrapper'
import { useCurrency } from '@/hooks/useCurrency'

const mockRates = { JPY_BRL: 0.04, KRW_BRL: 0.0007, BRL_BRL: 1 }

vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: vi.fn(),
}))

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: function CustomSelect({
    id,
    value,
    onChange,
    options,
    placeholder
  }: {
    id?: string
    value: string
    onChange: (val: string) => void
    options: string[]
    placeholder?: string
  }) {
    return (
      <select
        data-testid={id ?? 'custom-select'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  },
}))

const mockUseCurrency = vi.mocked(useCurrency)

describe('ConverterPage', () => {
  const Wrapper = createPageWrapper()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseCurrency.mockReturnValue({
      rates: mockRates,
      isLoading: false,
      error: null,
    })
  })

  it('renders page header', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    expect(
      screen.getByRole('heading', { name: /Conversor/i })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Converta entre iene, won e real/i)
    ).toBeInTheDocument()
  })

  it('renders amount input and selects', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    expect(screen.getByPlaceholderText(/Digite um valor/i)).toBeInTheDocument()

    expect(screen.getByText(/^De$/)).toBeInTheDocument()
    expect(screen.getByText(/^Para$/)).toBeInTheDocument()

    expect(screen.getByTestId('converter-from')).toBeInTheDocument()
    expect(screen.getByTestId('converter-to')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseCurrency.mockReturnValue({
      rates: null,
      isLoading: true,
      error: null,
    })

    render(<ConverterPage />, { wrapper: Wrapper })

    expect(screen.getByText(/Carregando taxas/i)).toBeInTheDocument()
  })

  it('shows error view', () => {
    mockUseCurrency.mockReturnValue({
      rates: null,
      isLoading: false,
      error: new Error('Network error'),
    })

    render(<ConverterPage />, { wrapper: Wrapper })

    expect(
      screen.getByText(/Não foi possível carregar as taxas de câmbio/i)
    ).toBeInTheDocument()
  })

  it('shows placeholder when no amount entered', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    expect(screen.getByText(/^Digite um valor$/)).toBeInTheDocument()
  })

  it('updates amount and shows conversion', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    const input = screen.getByPlaceholderText(/Digite um valor/i)

    fireEvent.change(input, { target: { value: '100' } })

    expect(input).toHaveValue('¥ 100')

    expect(screen.getByText('R$ 4,00')).toBeInTheDocument()
  })

  it('swap button disables when currencies equal', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    const toSelect = screen.getByTestId('converter-to')

    fireEvent.change(toSelect, { target: { value: '¥ Iene (JPY)' } })

    const swapBtn = screen.getByRole('button', { name: /swap currencies/i })

    expect(swapBtn).toBeDisabled()
  })

  it('swap currencies updates values', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    const input = screen.getByPlaceholderText(/Digite um valor/i)

    fireEvent.change(input, { target: { value: '100' } })

    const swapBtn = screen.getByRole('button', { name: /swap currencies/i })

    fireEvent.click(swapBtn)

    expect(screen.getByTestId('converter-from')).toHaveValue('R$ Real (BRL)')
    expect(screen.getByTestId('converter-to')).toHaveValue('¥ Iene (JPY)')
  })

  it('changing "De" currency updates select', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    const fromSelect = screen.getByTestId('converter-from')

    fireEvent.change(fromSelect, { target: { value: '₩ Won (KRW)' } })

    expect(fromSelect).toHaveValue('₩ Won (KRW)')
  })

  it('changing "Para" currency updates select', () => {
    render(<ConverterPage />, { wrapper: Wrapper })

    const toSelect = screen.getByTestId('converter-to')

    fireEvent.change(toSelect, { target: { value: '¥ Iene (JPY)' } })

    expect(toSelect).toHaveValue('¥ Iene (JPY)')
  })

  it('retry button reloads page', () => {
    const reloadMock = vi.fn()

    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    })

    mockUseCurrency.mockReturnValue({
      rates: null,
      isLoading: false,
      error: new Error('Network error'),
    })

    render(<ConverterPage />, { wrapper: Wrapper })

    const retryBtn = screen.getByRole('button', { name: /Tentar novamente/i })

    fireEvent.click(retryBtn)

    expect(reloadMock).toHaveBeenCalled()
  })
  it('shows BRL placeholder when from currency is BRL', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const fromSelect = screen.getByTestId('converter-from')
    fireEvent.change(fromSelect, { target: { value: 'R$ Real (BRL)' } })
    const input = screen.getByRole('textbox', { name: /Valor/i })
    expect(input).toHaveAttribute('placeholder', 'Digite um valor')
  })

  it('when changing De currency with amount entered, converts and updates input', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const input = screen.getByRole('textbox', { name: /Valor/i })
    fireEvent.change(input, { target: { value: '100' } })
    expect(input).toHaveValue('¥ 100')
    const fromSelect = screen.getByTestId('converter-from')
    fireEvent.change(fromSelect, { target: { value: 'R$ Real (BRL)' } })
    expect((input as HTMLInputElement).value).toMatch(/R\$\s*4,00/)
  })
})