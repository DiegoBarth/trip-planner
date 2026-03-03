import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseActionsModal } from '../ExpenseActionsModal'
import type { Expense } from '@/types/Expense'

// Mocks
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({ current: null })),
}))

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((amount, currency) => `${currency} ${amount}`),
}))

vi.mock('@/config/constants', () => ({
  BUDGET_ORIGINS: {
    Diego: { label: 'Diego', icon: '👨' },
    Alimentação: { label: 'Alimentação', icon: '🍱' },
  },
  COUNTRIES: {
    japan: { name: 'Japão', flag: '🇯🇵' },
  },
  getBudgetOriginFromLabel: vi.fn((label) => label),
}))

vi.mock('lucide-react/dist/esm/icons/x', () => ({ default: () => <div data-testid="x-icon" /> }))
vi.mock('lucide-react/dist/esm/icons/pencil', () => ({ default: () => <div data-testid="pencil-icon" /> }))
vi.mock('lucide-react/dist/esm/icons/trash-2', () => ({ default: () => <div data-testid="trash-icon" /> }))

describe('ExpenseActionsModal', () => {
  const mockExpense: Expense = {
    id: 1,
    description: 'Dinner in Tokyo',
    amount: 5000,
    currency: 'JPY',
    amountInBRL: 180,
    category: 'food',
    budgetOrigin: 'Diego',
    country: 'japan',
    date: '2026-03-03',
  };

  const defaultProps = {
    expense: mockExpense,
    isOpen: true,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering Guards & Coverage ---

  it('should return null if isOpen is false', () => {
    const { container } = render(<ExpenseActionsModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null if expense is null', () => {
    const { container } = render(<ExpenseActionsModal {...defaultProps} expense={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not register event listener when closed', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    render(<ExpenseActionsModal {...defaultProps} isOpen={false} />);
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });

  // --- Core Functionality ---

  it('should render expense details correctly', () => {
    render(<ExpenseActionsModal {...defaultProps} />);

    expect(screen.getByText('Dinner in Tokyo')).toBeInTheDocument();
    expect(screen.getByText('JPY 5000')).toBeInTheDocument();
    expect(screen.getByText('Diego')).toBeInTheDocument();
    expect(screen.getByText('Japão')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ExpenseActionsModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<ExpenseActionsModal {...defaultProps} />);
    // Selects the backdrop overlay
    const backdrop = screen.getByRole('dialog').firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // --- Actions ---

  it('should call onEdit and onClose when edit button is clicked', () => {
    render(<ExpenseActionsModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockExpense);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onDelete and onClose when delete button is clicked', () => {
    render(<ExpenseActionsModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /excluir/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockExpense);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // --- Event Listeners & Branch Coverage ---

  it('should call onClose when Escape key is pressed', () => {
    render(<ExpenseActionsModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should not call onClose when a key other than Escape is pressed', () => {
    render(<ExpenseActionsModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should remove event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<ExpenseActionsModal {...defaultProps} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('should handle budgetOrigin mapping when key is not found (label fallback)', () => {
    const expenseWithLabel = { ...mockExpense, budgetOrigin: 'Alimentação' as any };
    render(<ExpenseActionsModal {...defaultProps} expense={expenseWithLabel} />);

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('🍱')).toBeInTheDocument();
  });
});