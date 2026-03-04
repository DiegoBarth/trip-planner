import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import BudgetByOriginChart from '../BudgetByOriginChart'
import type { BudgetByOrigin } from '@/types/Dashboard'

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((val: number) => `R$ ${val}`)
}))

describe('BudgetByOriginChart', () => {
  const baseData: BudgetByOrigin[] = [
    {
      origin: 'personal' as any,
      totalBudget: 1000,
      spent: 600,
      remaining: 400
    },
    {
      origin: 'couple' as any,
      totalBudget: 2000,
      spent: 1500,
      remaining: 500
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and svg chart', () => {
    render(<BudgetByOriginChart data={baseData} />)

    expect(screen.getByText('Orçamento vs. Realizado')).toBeInTheDocument()
    expect(screen.getByLabelText('Gráfico orçamento por origem')).toBeInTheDocument()
  })

  it('renders origins on x axis', () => {
    render(<BudgetByOriginChart data={baseData} />)

    expect(screen.getByText('personal')).toBeInTheDocument()
    expect(screen.getByText('couple')).toBeInTheDocument()
  })

  it('renders legend labels', () => {
    render(<BudgetByOriginChart data={baseData} />)

    expect(screen.getByText('Orçado')).toBeInTheDocument()
    expect(screen.getByText('Gasto')).toBeInTheDocument()
  })

  it('shows tooltip with budget value on hover', () => {
    render(<BudgetByOriginChart data={baseData} />)

    const rects = document.querySelectorAll('rect')
    fireEvent.mouseEnter(rects[0])

    expect(screen.getByText(/Orçado: R\$ 1000/i)).toBeInTheDocument()
  })

  it('shows tooltip with spent value on hover', () => {
    render(<BudgetByOriginChart data={baseData} />)

    const rects = document.querySelectorAll('rect')
    fireEvent.mouseEnter(rects[1])

    expect(screen.getByText(/Gasto: R\$ 600/i)).toBeInTheDocument()
  })

  it('renders correctly with empty data', () => {
    render(<BudgetByOriginChart data={[]} />)

    expect(screen.getByLabelText('Gráfico orçamento por origem')).toBeInTheDocument()
  })
})