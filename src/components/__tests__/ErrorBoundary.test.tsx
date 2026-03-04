import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary } from '../ErrorBoundary'

const FlakyComponent = ({ shouldFail }: { shouldFail: boolean }) => {
  if (shouldFail) {
    throw new Error('Boom!');
  }
  return <div>Conteúdo Seguro</div>;
};

describe('ErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <FlakyComponent shouldFail={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/conteúdo seguro/i)).toBeInTheDocument()
  })

  it('renders default error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <FlakyComponent shouldFail={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>fallback custom</div>}>
        <FlakyComponent shouldFail={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/fallback custom/i)).toBeInTheDocument()
  })

  it('calls console.error when error is caught', () => {
    render(
      <ErrorBoundary>
        <FlakyComponent shouldFail={true} />
      </ErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('resets error state when retry is clicked', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <FlakyComponent shouldFail={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <FlakyComponent shouldFail={false} />
      </ErrorBoundary>
    );

    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/conteúdo seguro/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/algo deu errado/i)).not.toBeInTheDocument();
  });
})