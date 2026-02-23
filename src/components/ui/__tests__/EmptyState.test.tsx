import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders icon, title and description', () => {
    render(
      <EmptyState
        icon="📭"
        title="Nenhum item"
        description="Adicione algo para começar."
      />
    )
    expect(screen.getByText('📭')).toBeInTheDocument()
    expect(screen.getByText('Nenhum item')).toBeInTheDocument()
    expect(screen.getByText('Adicione algo para começar.')).toBeInTheDocument()
  })

  it('renders without description when not provided', () => {
    render(<EmptyState icon="📭" title="Vazio" />)
    expect(screen.getByText('Vazio')).toBeInTheDocument()
    expect(screen.queryByText('Adicione algo')).not.toBeInTheDocument()
  })
})
