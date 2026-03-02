import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SwipeArrow } from '../SwipeArrow';

// Mocking Lucide icons to simplify testing their presence
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left" />,
  ChevronRight: () => <svg data-testid="chevron-right" />,
  RefreshCcw: () => <svg data-testid="refresh-icon" />,
}));

describe('SwipeArrow Component', () => {
  it('should return null when direction is null', () => {
    // Component should not render anything if no direction is provided
    const { container } = render(<SwipeArrow direction={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render ChevronLeft and correct styles when direction is "left"', () => {
    // Testing horizontal swipe to the left
    render(<SwipeArrow direction="left" />);

    const icon = screen.getByTestId('chevron-left');
    const container = icon.parentElement;

    expect(icon).toBeInTheDocument();
    expect(container).toHaveClass('left-4');
    expect(container).toHaveStyle({ '--swipe-x': '-24px' });
  });

  it('should render ChevronRight and correct styles when direction is "right"', () => {
    // Testing horizontal swipe to the right
    render(<SwipeArrow direction="right" />);

    const icon = screen.getByTestId('chevron-right');
    const container = icon.parentElement;

    expect(icon).toBeInTheDocument();
    expect(container).toHaveClass('right-4');
    expect(container).toHaveStyle({ '--swipe-x': '24px' });
  });

  it('should render RefreshCcw and centering styles when direction is "up"', () => {
    // Testing vertical swipe (pull-to-refresh style)
    render(<SwipeArrow direction="up" />);

    const icon = screen.getByTestId('refresh-icon');
    const container = icon.parentElement;

    expect(icon).toBeInTheDocument();
    expect(container).toHaveClass('top-4', 'left-[50%]', '-translate-x-1/2');
    expect(container).toHaveStyle({ '--swipe-y': '-24px' });
  });

  it('should apply fixed positioning and high z-index', () => {
    // Ensuring the indicator is always on top and fixed
    render(<SwipeArrow direction="left" />);
    const container = screen.getByTestId('chevron-left').parentElement;

    expect(container).toHaveClass('fixed', 'z-[9999]', 'pointer-events-none');
  });

  it('should include the animation class', () => {
    // Check if the Tailwind arbitrary value for animation is present
    render(<SwipeArrow direction="up" />);
    const container = screen.getByTestId('refresh-icon').parentElement;

    expect(container?.className).toContain('[animation:swipeArrowIn_0.18s_ease-out]');
  });
});