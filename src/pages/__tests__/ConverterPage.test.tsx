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
    placeholder,
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
        <option value="">{placeholder}</option>
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

  it('renders page header with title and subtitle', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Conversor/i })).toBeInTheDocument()
    expect(screen.getByText(/Converta entre iene, won e real/i)).toBeInTheDocument()
  })

  it('renders amount input and currency selects', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    expect(screen.getByRole('textbox', { name: /Valor/i })).toBeInTheDocument()
    expect(screen.getByText(/^De$/)).toBeInTheDocument()
    expect(screen.getByText(/^Para$/)).toBeInTheDocument()
  })

  it('shows loading state when isLoading', () => {
    mockUseCurrency.mockReturnValue({
      rates: null,
      isLoading: true,
      error: null,
    })
    render(<ConverterPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Carregando taxas/i)).toBeInTheDocument()
  })

  it('shows QueryErrorView when error', () => {
    mockUseCurrency.mockReturnValue({
      rates: null,
      isLoading: false,
      error: new Error('Network error'),
    })
    render(<ConverterPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Não foi possível carregar as taxas de câmbio/i)).toBeInTheDocument()
  })

  it('shows placeholder when no amount entered', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Digite um valor para ver a conversão/i)).toBeInTheDocument()
  })

  it('renders swap button for currencies', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const swapBtn = screen.getByRole('button', { name: /Trocar moedas/i })
    expect(swapBtn).toBeInTheDocument()
  })

  it('updates amount input and shows conversion when amount > 0', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const input = screen.getByRole('textbox', { name: /Valor/i })
    fireEvent.change(input, { target: { value: '100' } })
    expect(input).toHaveValue('¥ 100')
    expect(screen.getByText(/¥\s*100\s*=/)).toBeInTheDocument()
    expect(screen.getByText('R$ 4,00')).toBeInTheDocument()
  })

  it('swap button is disabled when from and to currency are the same', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const toSelect = screen.getByTestId('converter-to')
    fireEvent.change(toSelect, { target: { value: '¥ Iene (JPY)' } })
    const swapBtn = screen.getByRole('button', { name: /Trocar moedas/i })
    expect(swapBtn).toBeDisabled()
  })

  it('swap exchanges from and to currency and updates amount', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const input = screen.getByRole('textbox', { name: /Valor/i })
    fireEvent.change(input, { target: { value: '100' } })
    expect(input).toHaveValue('¥ 100')
    const swapBtn = screen.getByRole('button', { name: /Trocar moedas/i })
    fireEvent.click(swapBtn)
    expect(screen.getByTestId('converter-from')).toHaveValue('R$ Real (BRL)')
    expect(screen.getByTestId('converter-to')).toHaveValue('¥ Iene (JPY)')
    expect((input as HTMLInputElement).value).toMatch(/R\$\s*4,00/)
  })

  it('changing De currency updates select', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const fromSelect = screen.getByTestId('converter-from')
    fireEvent.change(fromSelect, { target: { value: '₩ Won (KRW)' } })
    expect(fromSelect).toHaveValue('₩ Won (KRW)')
  })

  it('changing Para currency updates select', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const toSelect = screen.getByTestId('converter-to')
    fireEvent.change(toSelect, { target: { value: '¥ Iene (JPY)' } })
    expect(toSelect).toHaveValue('¥ Iene (JPY)')
  })

  it('shows BRL placeholder when from currency is BRL', () => {
    render(<ConverterPage />, { wrapper: Wrapper })
    const fromSelect = screen.getByTestId('converter-from')
    fireEvent.change(fromSelect, { target: { value: 'R$ Real (BRL)' } })
    const input = screen.getByRole('textbox', { name: /Valor/i })
    expect(input).toHaveAttribute('placeholder', 'R$ 0,00')
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

  it('error view shows retry button and calls onRetry when clicked', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', { value: { reload: reloadMock }, writable: true })
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
})
