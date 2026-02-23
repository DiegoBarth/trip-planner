import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import { QueryErrorView } from '../QueryErrorView'

describe('QueryErrorView', () => {
  it('renders default title and message', () => {
    render(<QueryErrorView />)
    expect(screen.getByRole('heading', { name: /Erro ao carregar/i })).toBeInTheDocument()
    expect(screen.getByText(/Não foi possível carregar os dados/i)).toBeInTheDocument()
  })

  it('renders custom title and message', () => {
    render(
      <QueryErrorView
        title="Falha na rede"
        message="Verifique sua conexão."
      />
    )
    expect(screen.getByRole('heading', { name: 'Falha na rede' })).toBeInTheDocument()
    expect(screen.getByText('Verifique sua conexão.')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<QueryErrorView onRetry={onRetry} />)
    const button = screen.getByRole('button', { name: /Tentar novamente/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<QueryErrorView />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has role="alert" and aria-live="polite"', () => {
    render(<QueryErrorView />)
    const container = screen.getByRole('alert')
    expect(container).toHaveAttribute('aria-live', 'polite')
  })
})
