import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../Card'

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
    render(<Card onClick={() => { }}>Click me</Card>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Click</Card>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies hover classes when hover prop is true', () => {
    const { container } = render(<Card hover>Hover Test</Card>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('hover:shadow-md')
    expect(div.className).toContain('hover:border-gray-200')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>)
    const divOrButton = container.firstChild as HTMLElement
    expect(divOrButton.className).toContain('custom-class')
  })

  it('applies active:scale-[0.98] cursor-pointer when onClick', () => {
    const { container } = render(<Card onClick={() => { }}>Click</Card>)
    const button = container.firstChild as HTMLElement
    expect(button.className).toContain('active:scale-[0.98]')
    expect(button.className).toContain('cursor-pointer')
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardHeader className="custom-header">Header</CardHeader>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('custom-header')
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body</CardContent>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardContent className="custom-content">Body</CardContent>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('custom-content')
  })
})

describe('CardTitle', () => {
  it('renders children', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardTitle className="custom-title">Title</CardTitle>)
    const h3 = container.firstChild as HTMLElement
    expect(h3.className).toContain('custom-title')
  })
})

describe('CardDescription', () => {
  it('renders children', () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardDescription className="custom-desc">Description</CardDescription>)
    const p = container.firstChild as HTMLElement
    expect(p.className).toContain('custom-desc')
  })
})