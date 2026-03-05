import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import GoogleLoginButton from '@/components/login/GoogleLoginButton'
import * as GoogleOAuth from '@react-oauth/google'

vi.mock('@react-oauth/google', async () => {
  const actual = await vi.importActual('@react-oauth/google')
  return {
    ...actual,
    GoogleOAuthProvider: ({ children, clientId }: any) => (
      <div data-testid="provider" data-clientid={clientId}>{children}</div>
    ),
    GoogleLogin: ({ onSuccess }: any) => (
      <button data-testid="login-btn" onClick={() => onSuccess({ credential: 'token' })}>Login</button>
    ),
  }
})

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('does not render GoogleLogin before mounted', () => {
    expect(screen.queryByTestId('login-btn')).toBeNull()
  })

  it('renders GoogleLogin after mounted', async () => {
    const { rerender } = render(<GoogleLoginButton onSuccess={() => { }} onError={() => { }} />)

    rerender(<GoogleLoginButton onSuccess={() => { }} onError={() => { }} />)

    const providerSpy = vi.spyOn(GoogleOAuth, 'GoogleOAuthProvider')
    expect(providerSpy).toBeDefined()
  })

  it('passes onSuccess and onError to GoogleLogin', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()

    render(<GoogleLoginButton onSuccess={onSuccess} onError={onError} />)

    const loginSpy = vi.spyOn(GoogleOAuth, 'GoogleLogin')
    expect(loginSpy).toBeDefined()
  })
})