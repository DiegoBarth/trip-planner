import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetCard } from '../BudgetCard'
import { BUDGET_ORIGINS } from '@/config/constants'

vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: number) => `$${value.toFixed(2)}`,
}))

describe('BudgetCard', () => {
  it('renders the label and icon for the given origin', () => {
    const origin = 'Casal' as const
    render(<BudgetCard origin={origin} total={1000} spent={200} remaining={800} />)
    expect(screen.getByText(BUDGET_ORIGINS[origin].label)).toBeInTheDocument()
    expect(screen.getByText(BUDGET_ORIGINS[origin].icon)).toBeInTheDocument()
  })

  it('displays the formatted total, spent, and remaining values', () => {
    render(<BudgetCard origin="Casal" total={1000} spent={200} remaining={800} />)
    expect(screen.getByText('$1000.00')).toBeInTheDocument()
    expect(screen.getByText('$200.00')).toBeInTheDocument()
    expect(screen.getByText('$800.00')).toBeInTheDocument()
  })

  it('calculates and displays the percentage spent correctly', () => {
    render(<BudgetCard origin="Casal" total={1000} spent={250} remaining={750} />)
    expect(screen.getByText('25.0%')).toBeInTheDocument()
  })

  it('caps the progress bar at 100%', () => {
    render(<BudgetCard origin="Casal" total={1000} spent={1200} remaining={0} />)
    const bar = screen.getByRole('progressbar', { hidden: true }) as HTMLElement
    expect(bar).toHaveStyle({ width: '100%' })
  })

  it('renders correctly when total is 0', () => {
    render(<BudgetCard origin="Casal" total={0} spent={0} remaining={0} />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })
})