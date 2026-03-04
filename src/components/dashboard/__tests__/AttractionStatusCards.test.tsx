import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AttractionStatusCards } from '../AttractionStatusCards'
import type { AttractionStats } from '@/types/Dashboard'

describe('AttractionStatusCards', () => {
  const baseStatus: AttractionStats = {
    total: 10,
    visited: 4,
    pendingReservation: 2,
    visitedPercentage: 40
  }

  it('renders title and percentage correctly', () => {
    render(<AttractionStatusCards status={baseStatus} />)

    expect(screen.getByText('🎢 Progresso da Viagem')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('renders total, visited and pending values correctly', () => {
    render(<AttractionStatusCards status={baseStatus} />)

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Visitados')).toBeInTheDocument()
    expect(screen.getByText('Pendentes')).toBeInTheDocument()

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('applies correct progress bar width', () => {
    const { container } = render(
      <AttractionStatusCards status={baseStatus} />
    )

    const progressBar = container.querySelector(
      '.bg-gradient-to-r.from-purple-500.to-indigo-500'
    ) as HTMLElement

    expect(progressBar).toBeInTheDocument()
    expect(progressBar.style.width).toBe('40%')
  })

  it('rounds percentage when necessary', () => {
    const status: AttractionStats = {
      total: 5,
      visited: 2,
      pendingReservation: 1,
      visitedPercentage: 39.6
    }

    render(<AttractionStatusCards status={status} />)

    expect(screen.getByText('40%')).toBeInTheDocument()
  })
})