import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../ToastContext'

function Consumer() {
  const toast = useToast()
  return (
    <div>
      <button type="button" onClick={() => toast.success('Success msg')}>
        Success
      </button>
      <button type="button" onClick={() => toast.error('Error msg')}>
        Error
      </button>
      <button type="button" onClick={() => toast.clear()}>
        Clear
      </button>
    </div>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('renders children', () => {
    render(
      <ToastProvider>
        <span>Child</span>
      </ToastProvider>
    )
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('shows toast when add is called via useToast', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Success'))
    expect(screen.getByText('Success msg')).toBeInTheDocument()
  })

  it('shows error toast', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Error'))
    expect(screen.getByText('Error msg')).toBeInTheDocument()
  })

  it('clear removes toasts', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Success'))
    expect(screen.getByText('Success msg')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Clear'))
    expect(screen.queryByText('Success msg')).not.toBeInTheDocument()
  })

  vi.useRealTimers()
})

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    const ConsoleSpy = () => {
      useToast()
      return null
    }
    expect(() => render(<ConsoleSpy />)).toThrow('useToast must be used within a ToastProvider')
  })
})
