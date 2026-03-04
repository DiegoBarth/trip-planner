import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExpensesByCategoryChart from '../ExpensesByCategoryChart'
import type { ExpenseByCategory } from '@/types/Dashboard'

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((val: number) => `R$ ${val}`)
}))

vi.mock('@/config/constants', () => ({
  EXPENSE_CATEGORIES: {
    food: { label: 'Alimentação' },
    transport: { label: 'Transporte' }
  }
}))

describe('ExpensesByCategoryChart', () => {
  const baseData: ExpenseByCategory[] = [
    { category: 'food' as any, total: 100 },
    { category: 'transport' as any, total: 50 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and svg', () => {
    render(<ExpensesByCategoryChart data={baseData} />)

    expect(screen.getByText('Gastos por Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Gráfico de gastos por categoria')).toBeInTheDocument()
  })

  it('renders legend labels', () => {
    render(<ExpensesByCategoryChart data={baseData} />)

    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
  })

  it('shows tooltip on segment hover', () => {
    const { container } = render(<ExpensesByCategoryChart data={baseData} />)

    const paths = container.querySelectorAll('path')
    fireEvent.mouseEnter(paths[0])

    const tooltips = screen.getAllByText(/Alimentação:\s*R\$\s*100/i)
    expect(tooltips.some(el => el.tagName.toLowerCase() === 'div')).toBe(true)
  })

  it('hides tooltip on mouse leave', () => {
    const { container } = render(<ExpensesByCategoryChart data={baseData} />)

    const paths = container.querySelectorAll('path')
    fireEvent.mouseEnter(paths[0])
    fireEvent.mouseLeave(paths[0])

    expect(screen.queryByText(/Alimentação:\s*R\$\s*100/i)).not.toBeInTheDocument()
  })

  it('renders correctly with empty data', () => {
    render(<ExpensesByCategoryChart data={[]} />)

    expect(screen.getByLabelText('Gráfico de gastos por categoria')).toBeInTheDocument()
  })
})