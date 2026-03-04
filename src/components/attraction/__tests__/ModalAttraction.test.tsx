import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ModalAttraction } from '../ModalAttraction'
import type { Attraction } from '@/types/Attraction'

vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ rates: { JPY: 1, KRW: 0.025, BRL: 0.019 } })
}))

vi.mock('@/hooks/useReservation', () => ({
  useReservation: () => ({
    reservations: [{ id: 1, title: 'Reserva 1' }]
  })
}))

vi.mock('@/contexts/toast', () => ({
  useToast: () => vi.fn()
}))

vi.mock('@/schemas/validateWithToast', () => ({
  validateWithToast: vi.fn(() => true)
}))

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: ({ value, onChange, options }: any) => (
    <select
      data-testid="custom-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ value, onChange }: any) => (
    <input
      type="date"
      data-testid="date-field"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}))

vi.mock('@/components/attraction/LocationField', () => ({
  LocationField: () => <div data-testid="location-field">LocationField</div>
}))

describe('ModalAttraction', () => {
  const onClose = vi.fn()
  const onSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(props = {}) {
    return render(
      <ModalAttraction
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        {...props}
      />
    )
  }

  it('renders all main sections', () => {
    renderComponent()
    expect(screen.getByText(/Informações Básicas/i)).toBeInTheDocument()
    expect(screen.getByText(/Data e Horário/i)).toBeInTheDocument()
    expect(screen.getByText(/Valores/i)).toBeInTheDocument()
    expect(screen.getByText(/Links e Status/i)).toBeInTheDocument()
    expect(screen.getByTestId('location-field')).toBeInTheDocument()
  })

  it('updates name input', async () => {
    renderComponent()
    const input = screen.getByPlaceholderText(/Ex: Templo Senso-ji/i)
    fireEvent.change(input, { target: { value: 'Templo Teste' } })
    expect((input as HTMLInputElement).value).toBe('Templo Teste')
  })

  it('updates couple price and BRL calculation', async () => {
    renderComponent()
    const couplePriceInput = screen.getByPlaceholderText(/¥ 0/i)
    fireEvent.change(couplePriceInput, { target: { value: '1000' } })
    expect((couplePriceInput as HTMLInputElement).value).toBe('¥ 1.000')
    expect(screen.getByText(/Valor em Reais/i)).toBeInTheDocument()
  })

  it('sets reservationStatus to pending when needsReservation is checked', async () => {
    renderComponent()
    const checkbox = screen.getByLabelText(/Necessita Reserva/i)
    fireEvent.click(checkbox)

    const selects = screen.getAllByTestId('custom-select')
    const statusSelect = selects[4]
    await waitFor(() =>
      expect(statusSelect).toHaveValue('⏳ Pendente')
    )
  })

  it('submits the form and calls onSave + onClose', async () => {
    renderComponent()
    const nameInput = screen.getByPlaceholderText(/Ex: Templo Senso-ji/i)
    fireEvent.change(nameInput, { target: { value: 'Templo Teste' } })

    const saveButton = screen.getByText(/Salvar/i) || screen.getByRole('button', { name: /Salvar/i })
    fireEvent.click(saveButton)

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('closes modal on onClose', async () => {
    renderComponent()
    const closeButton = screen.getByText(/Cancelar/i) || screen.getByRole('button', { name: /Cancelar/i })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('resets form with attraction data and updates previousCurrency', () => {
    const attractionMock = {
      name: 'Templo Senso-ji',
      country: 'japan',
      city: 'Tóquio',
      couplePrice: 1000,
      currency: 'JPY',
      priceInBRL: 0,
      type: 'other',
      date: '2026-03-04',
      dayOfWeek: 'Wednesday',
      visited: false,
      needsReservation: false,
      openingTime: '09:00',
      closingTime: '18:00',
      closedDays: '',
      ticketLink: '',
      location: '',
      duration: 60,
      notes: '',
      imageUrl: ''
    } as Attraction;

    render(<ModalAttraction isOpen={true} attraction={attractionMock} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByDisplayValue('Templo Senso-ji')).toBeInTheDocument();
    expect(screen.getByDisplayValue('¥ Iene (JPY)')).toBeInTheDocument();
  });

  it('updates country selection and auto-sets currency', async () => {
    renderComponent()

    const countrySelect = screen.getAllByTestId('custom-select')[0]
    fireEvent.change(countrySelect, { target: { value: '🇯🇵 Japão' } })

    const currencySelect = screen.getAllByTestId('custom-select')[3]
    await waitFor(() => {
      expect(currencySelect).toHaveValue('¥ Iene (JPY)')
    })
  })

  it('updates currency selection and auto-sets country', async () => {
    renderComponent()

    const currencySelect = screen.getAllByTestId('custom-select')[3]
    fireEvent.change(currencySelect, { target: { value: '₩ Won (KRW)' } })

    const countrySelect = screen.getAllByTestId('custom-select')[0]
    await waitFor(() => {
      expect(countrySelect).toHaveValue('🇰🇷 Coreia do Sul')
    })
  })

  it('handles attraction type selection', async () => {
    renderComponent()

    const typeSelect = screen.getAllByTestId('custom-select')[1]
    fireEvent.change(typeSelect, { target: { value: '🏛️ Museu' } })

    await waitFor(() => {
      expect(typeSelect).toHaveValue('🏛️ Museu')
    })
  })

  it('handles closed days checkboxes correctly', async () => {
    renderComponent()

    const mondayCheckbox = screen.getByLabelText('Seg')
    fireEvent.click(mondayCheckbox)

    expect(mondayCheckbox).toBeChecked()

    fireEvent.click(mondayCheckbox)
    expect(mondayCheckbox).not.toBeChecked()
  })

  it('handles currency conversion when changing currency', async () => {
    const attractionMock = {
      name: 'Test Attraction',
      country: 'japan' as const,
      city: 'Tokyo',
      couplePrice: 1000,
      currency: 'JPY' as const,
      priceInBRL: 50,
      type: 'other' as const,
      date: '2026-03-04',
      dayOfWeek: 'Wednesday',
      visited: false,
      needsReservation: false,
    } as Attraction

    renderComponent({ attraction: attractionMock })

    const currencySelect = screen.getAllByTestId('custom-select')[3]
    fireEvent.change(currencySelect, { target: { value: '₩ Won (KRW)' } })

    const couplePriceInput = screen.getByPlaceholderText(/₩ 0/i)
    await waitFor(() => {
      expect((couplePriceInput as HTMLInputElement).value).toContain('₩')
    })
  })


  it('auto-sets pending status and shows reservation fields', async () => {
    renderComponent()

    const checkbox = screen.getByLabelText(/Necessita Reserva/i)
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(screen.getByText(/Status da Reserva/i)).toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getAllByTestId('custom-select')).toHaveLength(6)
  })

  it('handles reservation status selection', async () => {
    renderComponent()

    const needsReservationCheckbox = screen.getByLabelText(/Necessita Reserva/i)
    fireEvent.click(needsReservationCheckbox)

    await waitFor(() => {
      const statusSelects = screen.getAllByTestId('custom-select')
      const statusSelect = statusSelects.find(select =>
        (select as HTMLSelectElement).innerHTML.includes('⏳ Pendente')
      )
      expect(statusSelect).toBeInTheDocument()
    })
  })

  it('handles form validation failure', async () => {
    vi.doMock('@/schemas/validateWithToast', () => ({
      validateWithToast: vi.fn(() => false)
    }))

    const { rerender } = renderComponent()
    rerender(
      <ModalAttraction
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    )

    const nameInput = screen.getByPlaceholderText(/Ex: Templo Senso-ji/i)
    fireEvent.change(nameInput, { target: { value: 'Test' } })

    const saveButton = screen.getByRole('button', { name: /Salvar/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled()
    })
  })


  it('handles save loading state', async () => {
    const mockOnSave = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderComponent({ onSave: mockOnSave })

    const nameInput = screen.getByPlaceholderText(/Ex: Templo Senso-ji/i)
    fireEvent.change(nameInput, { target: { value: 'Test' } })

    const saveButton = screen.getByRole('button', { name: /Salvar/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(saveButton).toHaveAttribute('disabled')
      expect(screen.getByText('Salvando...')).toBeInTheDocument()
    })
  })
})