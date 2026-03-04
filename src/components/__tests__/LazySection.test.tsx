import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LazySection } from '../LazySection'
import { useInView } from 'react-intersection-observer'

vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(),
}))

describe('LazySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render only the placeholder when not in view', () => {
    (useInView as any).mockReturnValue({
      ref: vi.fn(),
      inView: false,
    })

    render(
      <LazySection height={300}>
        <div data-testid="lazy-content">Heavy Content</div>
      </LazySection>
    )

    expect(screen.queryByTestId('lazy-content')).not.toBeInTheDocument()
    
    const placeholder = screen.queryByTestId('lazy-content')
    expect(placeholder).toBeNull()
  })

  it('should render children when in view', () => {
    (useInView as any).mockReturnValue({
      ref: vi.fn(),
      inView: true,
    })

    render(
      <LazySection height={300}>
        <div data-testid="lazy-content">Heavy Content</div>
      </LazySection>
    )

    expect(screen.getByTestId('lazy-content')).toBeInTheDocument()
    expect(screen.getByText('Heavy Content')).toBeInTheDocument()
  })

  it('should apply the provided min-height to the wrapper', () => {
    (useInView as any).mockReturnValue({
      ref: vi.fn(),
      inView: false,
    })

    const customHeight = 500
    const { container } = render(
      <LazySection height={customHeight}>
        <div>Child</div>
      </LazySection>
    )

    const wrapperDiv = container.firstChild as HTMLElement
    expect(wrapperDiv.style.minHeight).toBe(`${customHeight}px`)
  })

  it('should use default height of 200px when no height is provided', () => {
    (useInView as any).mockReturnValue({
      ref: vi.fn(),
      inView: false,
    })

    const { container } = render(
      <LazySection>
        <div>Child</div>
      </LazySection>
    )

    const wrapperDiv = container.firstChild as HTMLElement
    expect(wrapperDiv.style.minHeight).toBe('200px')
  })

  it('should initialize useInView with correct performance options', () => {
    (useInView as any).mockReturnValue({
      ref: vi.fn(),
      inView: false,
    })

    render(
      <LazySection>
        <div>Child</div>
      </LazySection>
    )

    expect(useInView).toHaveBeenCalledWith({
      triggerOnce: true,
      rootMargin: '200px',
    })
  })
})