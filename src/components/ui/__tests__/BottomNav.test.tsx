import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from '../BottomNav'

vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    )

    const navLabels = ['Início', 'Roteiro', 'Mapa', 'Checklist', 'Resumo']
    navLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('applies active classes to the current path', () => {
    render(
      <MemoryRouter initialEntries={['/map']}>
        <BottomNav />
      </MemoryRouter>
    )

    const activeLink = screen.getByText('Mapa').closest('a')
    expect(activeLink).toHaveClass('text-blue-600')
    expect(activeLink).toHaveClass('dark:text-blue-400')
  })

  it('applies inactive classes to non-active paths', () => {
    render(
      <MemoryRouter initialEntries={['/map']}>
        <BottomNav />
      </MemoryRouter>
    )

    const inactiveLink = screen.getByText('Início').closest('a')
    expect(inactiveLink).toHaveClass('text-gray-600')
    expect(inactiveLink).toHaveClass('dark:text-gray-400')
  })

  it('renders icons inside the links', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    )

    const homeIcon = screen.getByText('Início').previousSibling
    expect(homeIcon).toBeInTheDocument()
  })
})