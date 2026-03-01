import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import { useFocusTrap } from '../useFocusTrap'

function TestModal({ isOpen }: { isOpen: boolean }) {
  const trapRef = useFocusTrap(isOpen)
  return (
    <div ref={trapRef} data-testid="modal">
      <button type="button">First</button>
      <input type="text" aria-label="Input" />
      <button type="button">Last</button>
    </div>
  )
}

function TestModalEmpty({ isOpen }: { isOpen: boolean }) {
  const trapRef = useFocusTrap(isOpen)
  return <div ref={trapRef} data-testid="modal-empty">No focusable</div>
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false))
    expect(result.current).toHaveProperty('current')
  })

  it('focuses first focusable element when active', () => {
    render(<TestModal isOpen={true} />)
    const firstButton = screen.getByRole('button', { name: 'First' })
    expect(document.activeElement).toBe(firstButton)
  })

  it('does not throw when inactive', () => {
    render(<TestModal isOpen={false} />)
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('does not throw when active but no focusable elements', () => {
    render(<TestModalEmpty isOpen={true} />)
    expect(screen.getByTestId('modal-empty')).toBeInTheDocument()
  })

  it('Tab on last focusable wraps to first', () => {
    render(<TestModal isOpen={true} />)
    const firstButton = screen.getByRole('button', { name: 'First' })
    const lastButton = screen.getByRole('button', { name: 'Last' })
    lastButton.focus()
    expect(document.activeElement).toBe(lastButton)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(firstButton)
  })

  it('Shift+Tab on first focusable wraps to last', () => {
    render(<TestModal isOpen={true} />)
    const firstButton = screen.getByRole('button', { name: 'First' })
    const lastButton = screen.getByRole('button', { name: 'Last' })
    firstButton.focus()
    expect(document.activeElement).toBe(firstButton)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(lastButton)
  })

  it('restores focus to previous element when trap becomes inactive', () => {
    const { rerender } = render(
      <>
        <button type="button" data-testid="outside">Outside</button>
        <TestModal isOpen={false} />
      </>
    )
    const outside = screen.getByTestId('outside')
    outside.focus()
    expect(document.activeElement).toBe(outside)
    rerender(
      <>
        <button type="button" data-testid="outside">Outside</button>
        <TestModal isOpen={true} />
      </>
    )
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }))
    rerender(
      <>
        <button type="button" data-testid="outside">Outside</button>
        <TestModal isOpen={false} />
      </>
    )
    expect(document.activeElement).toBe(outside)
  })
})
