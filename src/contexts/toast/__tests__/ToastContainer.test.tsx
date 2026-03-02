import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToastContainer from '../ToastContainer'

// Mock ToastItem to isolate ToastContainer behavior
vi.mock('@/contexts/toast/ToastItem', () => ({
  ToastItem: ({ toast, onRemove }: any) => (
    <div data-testid={`toast-${toast.id}`}>
      <span>{toast.message}</span>
      <button onClick={onRemove}>remove-{toast.id}</button>
    </div>
  ),
}))

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders container correctly', () => {
    render(<ToastContainer toasts={[]} onRemove={vi.fn()} />)

    // Container should exist even with no toasts
    const container = document.querySelector('.fixed')
    expect(container).toBeInTheDocument()
  })

  it('renders all toast items', () => {
    const toasts = [
      { id: 1, message: 'Toast 1' },
      { id: 2, message: 'Toast 2' },
    ] as any

    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />)

    // Each toast should be rendered
    expect(screen.getByTestId('toast-1')).toBeInTheDocument()
    expect(screen.getByTestId('toast-2')).toBeInTheDocument()
  })

  it('calls onRemove with correct id when a toast requests removal', () => {
    const onRemove = vi.fn()

    const toasts = [
      { id: 10, message: 'Test toast' },
    ] as any

    render(<ToastContainer toasts={toasts} onRemove={onRemove} />)

    // Click the mocked remove button
    fireEvent.click(screen.getByText('remove-10'))

    // onRemove should be called with the toast id
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith(10)
  })

  it('does not crash when there are no toasts', () => {
    render(<ToastContainer toasts={[]} onRemove={vi.fn()} />)

    // There should be no toast items
    const items = screen.queryAllByTestId(/toast-/)
    expect(items.length).toBe(0)
  })

  it('passes correct toast data to ToastItem', () => {
    const toasts = [
      { id: 5, message: 'Hello world' },
    ] as any

    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />)

    // Ensure the mocked ToastItem received and rendered message
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
})