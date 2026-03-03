import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BudgetOriginFilter } from '../BudgetOriginFilter'
import { useFilterSheet } from '@/contexts/FilterSheetContext'

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: ({
    id,
    value,
    onChange,
    options,
    variant,
    leftIcon,
    placeholder,
    dropdownPosition
  }: any) => {
    return (
      <div data-testid={`${id}-select`}>
        <input
          data-testid={`${id}-input`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <span data-testid={`${id}-value`}>{value}</span>
        <span data-testid={`${id}-options`}>{options?.join(', ')}</span>
        <span data-testid={`${id}-variant`}>{variant}</span>
        {leftIcon && <div data-testid="left-icon">{leftIcon}</div>}
        <span data-testid={`${id}-dropdown-position`}>{dropdownPosition}</span>
      </div>
    )
  },
}))

vi.mock('@/contexts/FilterSheetContext', () => ({
  useFilterSheet: vi.fn(),
}))

vi.mock('@/config/constants', () => ({
  BUDGET_ORIGINS: {
    Diego: { label: 'Diego', icon: '👨', color: '#1d4ed8' },
    Pamela: { label: 'Pamela', icon: '👩', color: '#be185d' },
    Casal: { label: 'Casal', icon: '💑', color: '#5b21b6' },
    Alimentação: { label: 'Alimentação', icon: '🍱', color: '#991b1b' },
    Atrações: { label: 'Atrações', icon: '🎫', color: '#155e75' },
    Transporte: { label: 'Transporte', icon: '🚈', color: '#14532d' }
  },
}))

vi.mock('lucide-react/dist/esm/icons/wallet', () => ({
  default: () => <div data-testid="wallet-icon" />,
}))

describe('BudgetOriginFilter', () => {
  const mockUseFilterSheet = vi.mocked(useFilterSheet)
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFilterSheet.mockReturnValue('below')
  })

  it('renders with all options sorted alphabetically', () => {
    render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

    expect(screen.getByTestId('budget-origin-filter-options')).toHaveTextContent(
      'Todos, Alimentação, Atrações, Casal, Diego, Pamela, Transporte'
    )
  })

  it('valueToLabel converts BudgetOrigin to label correctly', () => {
    render(<BudgetOriginFilter value="Alimentação" onChange={mockOnChange} />)

    expect(screen.getByTestId('budget-origin-filter-value')).toHaveTextContent('Alimentação')
  })

  it('valueToLabel returns "Todos" for unknown value', () => {
    render(<BudgetOriginFilter value={"Inexistente" as any} onChange={mockOnChange} />)

    expect(screen.getByTestId('budget-origin-filter-value')).toHaveTextContent('Todos')
  })

  it('labelToValue converts label to BudgetOrigin correctly', () => {
    render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

    fireEvent.change(screen.getByTestId('budget-origin-filter-input'), {
      target: { value: 'Diego' }
    })

    expect(mockOnChange).toHaveBeenCalledWith('Diego')
  })

  it('handles "Todos" label → "all" value roundtrip', () => {
    render(
      <BudgetOriginFilter
        value="Atrações"
        onChange={mockOnChange}
      />
    )

    const input = screen.getByTestId('budget-origin-filter-input');
    fireEvent.change(input, { target: { value: 'Todos' } });

    expect(mockOnChange).toHaveBeenCalledWith('all');
  });

  describe('useFilterSheet integration', () => {
    it('uses "glass" variant and Wallet icon when dropdownPosition="below"', () => {
      mockUseFilterSheet.mockReturnValue('below')

      render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

      expect(screen.getByTestId('budget-origin-filter-variant')).toHaveTextContent('glass')
      expect(screen.getByTestId('wallet-icon')).toBeInTheDocument()
    })

    it('uses "default" variant without icon when dropdownPosition="above"', () => {
      mockUseFilterSheet.mockReturnValue('above')

      render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

      expect(screen.getByTestId('budget-origin-filter-variant')).toHaveTextContent('default')
      expect(screen.queryByTestId('wallet-icon')).not.toBeInTheDocument()
    })
  })

  it('full roundtrip: label change triggers onChange with correct value using real origins', () => {
    render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

    fireEvent.change(screen.getByTestId('budget-origin-filter-input'), {
      target: { value: 'Transporte' }
    })

    expect(mockOnChange).toHaveBeenCalledWith('Transporte')
  })
})