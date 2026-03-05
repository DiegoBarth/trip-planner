import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginScreen from '@/components/login/LoginScreen'

vi.mock('@/components/login/GoogleLoginButton', () => ({
  default: ({ onSuccess }: any) => (
    <button data-testid="login-btn" onClick={() => onSuccess({ credential: 'token' })}>
      Login
    </button>
  )
}))

describe('LoginScreen', () => {
  const onSuccess = vi.fn()
  const onError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and description texts', () => {
    render(<LoginScreen onSuccess={onSuccess} onError={onError} />)
    expect(screen.getByText(/Trip Planner/i)).toBeDefined()
    expect(screen.getByText(/Acesse com sua conta Google/i)).toBeDefined()
    expect(screen.getByText(/Apenas e-mails autorizados/i)).toBeDefined()
  })

  it('renders Suspense fallback before lazy loads', () => {
    render(<LoginScreen onSuccess={onSuccess} onError={onError} />)
    const fallback = screen.getByText((_, el) => !!el && el.className.includes('h-10'))
    expect(fallback).toBeDefined()
  })

  it('renders GoogleLoginButton and triggers onSuccess', async () => {
    render(<LoginScreen onSuccess={onSuccess} onError={onError} />)
    const loginBtn = await screen.findByTestId('login-btn')
    expect(loginBtn).toBeDefined()

    fireEvent.click(loginBtn)
    expect(onSuccess).toHaveBeenCalledWith({ credential: 'token' })
  })
})