import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import { ErrorBoundary } from '../../ErrorBoundary'

const Throw = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>Child content</span>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders fallback UI when child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('renders custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Throw />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('retry button resets error state and re-renders children', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true
    const MaybeThrow = () => {
      if (shouldThrow) throw new Error('Test')
      return <span>Recovered</span>
    }
    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument()
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(screen.getByText('Recovered')).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
