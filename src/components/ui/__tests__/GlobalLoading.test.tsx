import { render, screen } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { GlobalLoading } from '../GlobalLoading'
import * as reactQuery from '@tanstack/react-query'

vi.mock('@tanstack/react-query', () => ({
  useIsMutating: vi.fn(),
}))

describe('GlobalLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when not mutating', () => {
    vi.mocked(reactQuery.useIsMutating).mockReturnValue(0)

    const { container } = render(<GlobalLoading />)
    expect(container.firstChild).toBeNull()
  })

  it('renders loader when mutating', () => {
    vi.mocked(reactQuery.useIsMutating).mockReturnValue(1)
    render(<GlobalLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Aguarde...')).toBeInTheDocument()
  })

  it('renders loader when multiple mutations in flight', () => {
    vi.mocked(reactQuery.useIsMutating).mockReturnValue(2)
    render(<GlobalLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Aguarde...')).toBeInTheDocument()
  })
})
