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
        {leftIcon && <div data-testid="left-icon-container">{leftIcon}</div>}
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

  it('converts BudgetOrigin to label correctly', () => {
    render(<BudgetOriginFilter value="Alimentação" onChange={mockOnChange} />)

    expect(screen.getByTestId('budget-origin-filter-value')).toHaveTextContent('Alimentação')
  })

  it('always uses "default" variant and shows Wallet icon', () => {
    // Regardless of context value, the component is now static
    mockUseFilterSheet.mockReturnValue('above')

    render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

    expect(screen.getByTestId('budget-origin-filter-variant')).toHaveTextContent('default')
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument()
  })

  it('passes dropdownPosition from context to CustomSelect', () => {
    mockUseFilterSheet.mockReturnValue('above')
    render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

    expect(screen.getByTestId('budget-origin-filter-dropdown-position')).toHaveTextContent('above')
  })

  it('handles label to value conversion on change', () => {
    render(<BudgetOriginFilter value="all" onChange={mockOnChange} />)

    fireEvent.change(screen.getByTestId('budget-origin-filter-input'), {
      target: { value: 'Diego' }
    })

    expect(mockOnChange).toHaveBeenCalledWith('Diego')
  })

  it('handles "Todos" label → "all" value conversion', () => {
    render(<BudgetOriginFilter value="Diego" onChange={mockOnChange} />)

    fireEvent.change(screen.getByTestId('budget-origin-filter-input'), {
      target: { value: 'Todos' }
    });

    expect(mockOnChange).toHaveBeenCalledWith('all');
  });
})