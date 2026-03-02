import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickActions } from '../QuickActions';
import { BrowserRouter } from 'react-router-dom';
import * as mediaQueryHook from '@/hooks/useMediaQuery';

describe('QuickActions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    );
  };

  it('should render all actions when in desktop view', () => {
    // Mock useMediaQuery to return true (desktop)
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);

    renderComponent();

    // Check if all 5 actions are present
    expect(screen.getByText('Orçamento')).toBeInTheDocument();
    expect(screen.getByText('Gastos')).toBeInTheDocument();
    expect(screen.getByText('Atrações')).toBeInTheDocument();
    expect(screen.getByText('Reservas')).toBeInTheDocument();
    expect(screen.getByText('Conversor')).toBeInTheDocument();
  });

  it('should hide "Conversor" action when in mobile view', () => {
    // Mock useMediaQuery to return false (mobile)
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(false);

    renderComponent();

    // Check if other actions exist but Conversor is filtered out
    expect(screen.getByText('Orçamento')).toBeInTheDocument();
    expect(screen.queryByText('Conversor')).not.toBeInTheDocument();
  });

  it('should have correct navigation links for each action', () => {
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);

    renderComponent();

    // Verify if links point to the correct internal routes
    expect(screen.getByRole('link', { name: /orçamento/i })).toHaveAttribute('href', '/budgets');
    expect(screen.getByRole('link', { name: /gastos/i })).toHaveAttribute('href', '/expenses');
    expect(screen.getByRole('link', { name: /atrações/i })).toHaveAttribute('href', '/attractions');
    expect(screen.getByRole('link', { name: /conversor/i })).toHaveAttribute('href', '/converter');
  });

  it('should apply correct color classes from the action config', () => {
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);

    renderComponent();

    const budgetLink = screen.getByText('Orçamento');
    // Check if emerald classes are applied (using part of the class list)
    expect(budgetLink).toHaveClass('text-emerald-800');
  });

  it('should render the correct grid structure', () => {
    // The container div should have the specific grid classes
    const { container } = renderComponent();
    const gridDiv = container.firstChild;

    expect(gridDiv).toHaveClass('grid');
    expect(gridDiv).toHaveClass('grid-cols-2');
    expect(gridDiv).toHaveClass('md:grid-cols-4');
  });
});