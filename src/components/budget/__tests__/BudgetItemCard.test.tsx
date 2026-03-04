import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BudgetItemCard } from '../BudgetItemCard'

vi.mock('@/utils/formatters', () => ({
  formatCurrency: (v: number) => `R$ ${v.toFixed(2)}`,
  formatDate: (d: string) => `DATE:${d}`,
}))

const baseBudget = {
  id: 1,
  origin: 'Diego',
  description: 'Hotel Copacabana',
  amount: 750,
  date: '2026-03-01',
} as const

function renderComponent(
  props?: Partial<React.ComponentProps<typeof BudgetItemCard>>
) {
  const defaultProps = {
    budget: baseBudget,
    onClick: vi.fn(),
  }

  return render(<BudgetItemCard {...defaultProps} {...props} />)
}

describe('BudgetItemCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders budget information correctly', () => {
    renderComponent()

    expect(screen.getByText('Hotel Copacabana')).toBeInTheDocument()
    expect(screen.getByText('R$ 750.00')).toBeInTheDocument()
    expect(screen.getByText('DATE:2026-03-01')).toBeInTheDocument()
  })

  it('applies border color from origin config', () => {
    const { container } = renderComponent()

    const card = container.firstChild as HTMLElement
    expect(card).toHaveStyle({ borderLeftColor: '#1d4ed8' })
  })

  it('renders as button when onClick is provided', () => {
    renderComponent()

    const card = screen.getByRole('button')

    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('tabindex', '0')
  })

  it('does not render button role when onClick is not provided', () => {
    renderComponent({ onClick: undefined })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()

    renderComponent({ onClick })

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledWith(baseBudget)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when pressing Enter', () => {
    const onClick = vi.fn()

    renderComponent({ onClick })

    const card = screen.getByRole('button')

    fireEvent.keyDown(card, { key: 'Enter' })

    expect(onClick).toHaveBeenCalledWith(baseBudget)
  })

  it('calls onClick when pressing Space', () => {
    const onClick = vi.fn()

    renderComponent({ onClick })

    const card = screen.getByRole('button')

    fireEvent.keyDown(card, { key: ' ' })

    expect(onClick).toHaveBeenCalledWith(baseBudget)
  })

  it('does not call onClick for other keys', () => {
    const onClick = vi.fn()

    renderComponent({ onClick })

    const card = screen.getByRole('button')

    fireEvent.keyDown(card, { key: 'Escape' })

    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not crash when onClick is undefined and card is clicked', () => {
    const { container } = renderComponent({ onClick: undefined })

    const card = container.firstChild as HTMLElement

    expect(() => fireEvent.click(card)).not.toThrow()
  })

  it('sets description as title attribute (tooltip)', () => {
    renderComponent()

    const title = screen.getByTitle('Hotel Copacabana')
    expect(title).toBeInTheDocument()
  })
})