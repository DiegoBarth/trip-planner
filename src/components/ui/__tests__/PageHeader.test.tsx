import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageHeader } from '../PageHeader';
import { BrowserRouter } from 'react-router-dom';
import * as mediaQueryHook from '@/hooks/useMediaQuery';

// Mock useNavigate from react-router-dom
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

// Mock ThemeToggle as it might depend on complex providers
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('PageHeader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      title: 'Test Title',
      ...props,
    };
    return render(
      <BrowserRouter>
        <PageHeader {...defaultProps} />
      </BrowserRouter>
    );
  };

  it('should render the title correctly', () => {
    // Check if the title is visible on screen
    renderComponent({ title: 'Dashboard' });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should navigate back when the back button is clicked', () => {
    // Test navigation logic
    renderComponent({ showBack: true });
    const backButton = screen.getByLabelText(/voltar/i);
    fireEvent.click(backButton);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
  });

  it('should not show the back button if showBack is false', () => {
    // Ensure conditional rendering of back button
    renderComponent({ showBack: false });
    expect(screen.queryByLabelText(/voltar/i)).not.toBeInTheDocument();
  });

  it('should render the subtitle only on desktop', () => {
    // Mock useMediaQuery to return false (desktop view)
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(false);
    
    renderComponent({ subtitle: 'Welcome back' });
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('should hide the subtitle on mobile', () => {
    // Mock useMediaQuery to return true (mobile view)
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    
    renderComponent({ subtitle: 'Welcome back' });
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument();
  });

  it('should open the filter sheet on mobile when filter icon is clicked', () => {
    // Setup mobile environment with a filter prop
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    const filterContent = <div data-testid="filter-content">My Filters</div>;
    
    renderComponent({ filter: filterContent });

    // Filter button should be present
    const filterButton = screen.getByLabelText(/filtros/i);
    fireEvent.click(filterButton);

    // Filter sheet content should now be visible
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /filtros/i })).toBeInTheDocument();
  });

  it('should close the filter sheet when the close button is clicked', () => {
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    renderComponent({ filter: <div>Filter</div> });

    // Open sheet
    fireEvent.click(screen.getByLabelText(/filtros/i));
    
    // Close sheet
    const closeButton = screen.getByLabelText(/fechar/i);
    fireEvent.click(closeButton);

    // Content should be removed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close the filter sheet when the Escape key is pressed', () => {
    vi.spyOn(mediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    renderComponent({ filter: <div>Filter</div> });

    // Open sheet
    fireEvent.click(screen.getByLabelText(/filtros/i));
    
    // Simulate Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should apply the custom className to the header', () => {
    // Verify CSS class injection
    const customClass = 'custom-bg-class';
    const { container } = renderComponent({ className: customClass });
    const header = container.querySelector('header');
    expect(header).toHaveClass(customClass);
  });
});