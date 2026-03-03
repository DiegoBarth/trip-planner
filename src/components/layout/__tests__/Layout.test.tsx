import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders title and subtitle', () => {
    render(
      <Layout title="Main Title" subtitle="Sub Title">
        <div>Content</div>
      </Layout>
    )

    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByText('Sub Title')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Layout title="Page Title">
        <div data-testid="child-content">Child Content</div>
      </Layout>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders headerSlot if provided', () => {
    render(
      <Layout title="Header Test" headerSlot={<div data-testid="slot">Slot Content</div>}>
        <div>Content</div>
      </Layout>
    )

    expect(screen.getByTestId('slot')).toBeInTheDocument()
    expect(screen.getByText('Slot Content')).toBeInTheDocument()
  })

  it('renders back button and calls onBack when clicked', () => {
    const onBack = vi.fn()
    render(
      <Layout title="Back Test" onBack={onBack}>
        <div>Content</div>
      </Layout>
    )

    const button = screen.getByRole('button', { name: /voltar para home/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('does not render subtitle or back button if not provided', () => {
    render(<Layout title="No Subtitle Test"><div>Content</div></Layout>)

    expect(screen.queryByText('No Subtitle Test')).toBeInTheDocument()
    expect(screen.queryByText(/voltar para home/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/./, { selector: 'p' })).not.toBeInTheDocument()
  })
})