import { describe, it, expect, vi, beforeEach, afterEach, } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../ToastContext'

vi.mock('@/contexts/toast/ToastContainer', () => ({
  default: ({ toasts, onRemove }: any) => (
    <div>
      {toasts.map((t: any) => (
        <div key={t.id}>
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)}>
            remove-{t.message}
          </button>
        </div>
      ))}
    </div>
  ),
}))

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

function ZeroDurationConsumer() {
  const toast = useToast()
  return (
    <button onClick={() => toast.success('No auto remove', 0)}>
      Zero
    </button>
  )
}

function AllTypesConsumer() {
  const toast = useToast()
  return (
    <>
      <button onClick={() => toast.info('Info msg')}>Info</button>
      <button onClick={() => toast.warning('Warn msg')}>Warn</button>
    </>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
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


it('auto removes toast after duration', async () => {
  render(
    <ToastProvider>
      <Consumer />
    </ToastProvider>
  )

  // Add toast
  fireEvent.click(screen.getByText('Success'))
  expect(screen.getByText('Success msg')).toBeInTheDocument()

  // Advance exactly the default duration
  await act(async () => {
    vi.advanceTimersByTime(3000)
  })

  // Force microtask queue flush (CRUCIAL in Vitest)
  await Promise.resolve()

  expect(screen.queryByText('Success msg')).not.toBeInTheDocument()
})

  it('does not auto remove when duration is 0', () => {
    render(
      <ToastProvider>
        <ZeroDurationConsumer />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Zero'))
    expect(screen.getByText('No auto remove')).toBeInTheDocument()

    vi.runAllTimers()

    // Toast should remain because duration = 0
    expect(screen.getByText('No auto remove')).toBeInTheDocument()
  })

  it('shows info and warning toasts', () => {
    render(
      <ToastProvider>
        <AllTypesConsumer />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Info'))
    fireEvent.click(screen.getByText('Warn'))

    expect(screen.getByText('Info msg')).toBeInTheDocument()
    expect(screen.getByText('Warn msg')).toBeInTheDocument()
  })

  it('removes toast via ToastContainer onRemove', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Success'))
    expect(screen.getByText('Success msg')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/remove-Success msg/))

    expect(screen.queryByText('Success msg')).not.toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    const ConsoleSpy = () => {
      useToast()
      return null
    }

    expect(() => render(<ConsoleSpy />)).toThrow(
      'useToast must be used within a ToastProvider'
    )
  })
})