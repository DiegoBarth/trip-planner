import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthenticatedApp from '@/AuthenticatedApp'

// mock AppRouter
vi.mock('@/AppRouter', () => ({
  default: ({ onLogout }: { onLogout: () => void }) => (
    <div data-testid="app-router" onClick={onLogout}>
      AppRouter
    </div>
  )
}))

// mock PWA component (lazy)
vi.mock('@/components/PWAUpdatePrompt', () => ({
  default: () => <div data-testid="pwa-update-prompt" />
}))

describe('AuthenticatedApp', () => {
  it('renders AppRouter', () => {
    const mockLogout = vi.fn()

    render(<AuthenticatedApp onLogout={mockLogout} />)

    expect(screen.getByTestId('app-router')).toBeInTheDocument()
  })

  it('passes onLogout to AppRouter', () => {
    const mockLogout = vi.fn()

    render(<AuthenticatedApp onLogout={mockLogout} />)

    screen.getByTestId('app-router').click()

    expect(mockLogout).toHaveBeenCalled()
  })

  it('renders PWAUpdatePrompt after lazy load', async () => {
    const mockLogout = vi.fn()

    render(<AuthenticatedApp onLogout={mockLogout} />)

    const prompt = await screen.findByTestId('pwa-update-prompt')

    expect(prompt).toBeInTheDocument()
  })
})