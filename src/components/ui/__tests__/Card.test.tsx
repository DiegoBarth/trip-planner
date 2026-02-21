import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card, CardHeader, CardContent } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders as div by default', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.querySelector('div')).toBeInTheDocument()
    expect(container.querySelector('button')).not.toBeInTheDocument()
  })

  it('renders as button when onClick is provided', () => {
    render(<Card onClick={() => {}}>Click me</Card>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Click</Card>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body</CardContent>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})
