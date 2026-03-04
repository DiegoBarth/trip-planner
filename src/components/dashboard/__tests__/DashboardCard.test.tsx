import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardCard } from '../DashboardCard'

describe('DashboardCard', () => {
  it('renders label, value and icon correctly', () => {
    render(
      <DashboardCard
        label="Total gasto"
        value="R$ 500"
        icon="💰"
        iconClass="bg-green-100 text-green-600"
      />
    )

    expect(screen.getByText('Total gasto')).toBeInTheDocument()
    expect(screen.getByText('R$ 500')).toBeInTheDocument()
    expect(screen.getByText('💰')).toBeInTheDocument()
  })

  it('renders subValue when provided', () => {
    render(
      <DashboardCard
        label="Orçamento"
        value={1000}
        subValue="Restante R$ 500"
        icon="💳"
        iconClass="bg-blue-100 text-blue-600"
      />
    )

    expect(screen.getByText('Restante R$ 500')).toBeInTheDocument()
  })

  it('does not render subValue when not provided', () => {
    render(
      <DashboardCard
        label="Orçamento"
        value={1000}
        icon="💳"
        iconClass="bg-blue-100 text-blue-600"
      />
    )

    expect(screen.queryByText(/Restante/i)).not.toBeInTheDocument()
  })

  it('applies icon class correctly', () => {
    const { container } = render(
      <DashboardCard
        label="Test"
        value="123"
        icon="⭐"
        iconClass="bg-purple-100 text-purple-600"
      />
    )

    const iconWrapper = container.querySelector('.bg-purple-100.text-purple-600')
    expect(iconWrapper).toBeInTheDocument()
  })
})