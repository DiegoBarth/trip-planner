import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToastItem } from '../ToastItem'
import type { Toast } from '../ToastContext'

function createToast(overrides?: Partial<Toast>): Toast {
  return {
    id: 1,
    message: 'Test message',
    type: 'success',
    duration: 3000,
    ...overrides,
  }
}

describe('ToastItem', () => {
  it('renders the toast message', () => {
    render(
      <ToastItem toast={createToast()} onRemove={vi.fn()} />
    )

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('calls onRemove when close button is clicked', () => {
    const onRemove = vi.fn()

    render(
      <ToastItem toast={createToast()} onRemove={onRemove} />
    )

    fireEvent.click(screen.getByRole('button', { name: /fechar notificação/i }))

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('renders success icon color', () => {
    render(
      <ToastItem toast={createToast({ type: 'success' })} onRemove={vi.fn()} />
    )

    const iconWrapper = document.querySelector('.text-emerald-200')
    expect(iconWrapper).toBeInTheDocument()
  })

  it('renders error icon color', () => {
    render(
      <ToastItem toast={createToast({ type: 'error' })} onRemove={vi.fn()} />
    )

    const iconWrapper = document.querySelector('.text-red-200')
    expect(iconWrapper).toBeInTheDocument()
  })

  it('renders info icon color', () => {
    render(
      <ToastItem toast={createToast({ type: 'info' })} onRemove={vi.fn()} />
    )

    const iconWrapper = document.querySelector('.text-blue-200')
    expect(iconWrapper).toBeInTheDocument()
  })

  it('renders warning icon color', () => {
    render(
      <ToastItem toast={createToast({ type: 'warning' })} onRemove={vi.fn()} />
    )

    const iconWrapper = document.querySelector('.text-amber-200')
    expect(iconWrapper).toBeInTheDocument()
  })

  it('applies slideUp animation style', () => {
    render(
      <ToastItem toast={createToast()} onRemove={vi.fn()} />
    )

    const container = screen.getByText('Test message').closest('div')
    expect(container).toHaveStyle({ animation: 'slideUp 0.3s ease-out' })
  })
})