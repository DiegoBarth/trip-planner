import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeContext } from '@/contexts/ThemeContext';

// Mock Lucide icons
vi.mock('lucide-react/dist/esm/icons/moon', () => ({
  default: () => <div data-testid="moon-icon" />
}));
vi.mock('lucide-react/dist/esm/icons/sun', () => ({
  default: () => <div data-testid="sun-icon" />
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    // Reset DOM state before each test
    document.documentElement.classList.remove('dark');
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Without ThemeContext (Local State)', () => {
    it('should render Moon icon when theme is light (default)', () => {
      // By default, document doesn't have 'dark' class
      render(<ThemeToggle />);
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.getByLabelText(/ativar tema escuro/i)).toBeInTheDocument();
    });

    it('should render Sun icon if document already has dark class', () => {
      // Simulate SSR or previous state where dark mode is active
      document.documentElement.classList.add('dark');
      render(<ThemeToggle />);
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should toggle theme and update DOM/localStorage on click', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button');

      // Switch to dark
      fireEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

      // Switch back to light
      fireEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });
  });

  describe('With ThemeContext', () => {
    it('should use theme from context and call toggleTheme on click', () => {
      const toggleTheme = vi.fn();

      // Provide a mock context value
      render(
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme }}>
          <ThemeToggle />
        </ThemeContext.Provider>
      );

      // Should show Sun icon because context says 'dark'
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should NOT handle local logic, but call the context function
      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  it('should prevent default and stop propagation on click', () => {
    // Check if the event is being correctly handled to avoid side effects in parents
    const toggleTheme = vi.fn();
    render(
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>
    );

    const button = screen.getByRole('button');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    vi.spyOn(clickEvent, 'preventDefault');
    vi.spyOn(clickEvent, 'stopPropagation');

    fireEvent(button, clickEvent);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
  });
});