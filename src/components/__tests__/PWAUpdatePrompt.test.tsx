import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockUseRegisterSW = vi.hoisted(() =>
  vi.fn<
    (options?: any) => {
      needRefresh: [boolean, (v: boolean) => void]
      updateServiceWorker: (reload?: boolean) => Promise<void>
    }
  >()
)

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: mockUseRegisterSW,
}))

import PWAUpdatePrompt from '@/components/PWAUpdatePrompt'

describe('PWAUpdatePrompt', () => {
  const setNeedRefresh = vi.fn()
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => { })
    vi.spyOn(console, 'warn').mockImplementation(() => { })
  })

  it('should render nothing when no update is available', () => {
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [false, setNeedRefresh],
      updateServiceWorker,
    })

    const { container } = render(<PWAUpdatePrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('should show the update banner when a new version is available', () => {
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [true, setNeedRefresh],
      updateServiceWorker,
    })

    render(<PWAUpdatePrompt />)

    expect(screen.getByText(/Nova versão disponível!/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Atualizar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Depois/i })).toBeInTheDocument()
  })

  it('should close the banner when "Depois" is clicked', () => {
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [true, setNeedRefresh],
      updateServiceWorker,
    })

    render(<PWAUpdatePrompt />)

    fireEvent.click(screen.getByRole('button', { name: /Depois/i }))
    expect(setNeedRefresh).toHaveBeenCalledWith(false)
  })

  it('should trigger SW update when "Atualizar" is clicked', () => {
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [true, setNeedRefresh],
      updateServiceWorker,
    })

    render(<PWAUpdatePrompt />)

    fireEvent.click(screen.getByRole('button', { name: /Atualizar/i }))
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('should log registration scope on successful registration', () => {
    const consoleSpy = vi.spyOn(console, 'log')

    let onRegisteredCallback: any

    mockUseRegisterSW.mockImplementation((options: any) => {
      onRegisteredCallback = options?.onRegistered
      return {
        needRefresh: [false, setNeedRefresh],
        updateServiceWorker,
      }
    })

    render(<PWAUpdatePrompt />)

    onRegisteredCallback?.({ scope: '/' })
    expect(consoleSpy).toHaveBeenCalledWith('SW registered:', '/')
  })

  it('should warn on registration error', () => {
    const warnSpy = vi.spyOn(console, 'warn')

    let onRegisterErrorCallback: any

    mockUseRegisterSW.mockImplementation((options: any) => {
      onRegisterErrorCallback = options?.onRegisterError
      return {
        needRefresh: [false, setNeedRefresh],
        updateServiceWorker,
      }
    })

    render(<PWAUpdatePrompt />)

    onRegisterErrorCallback?.('Registration failed')
    expect(warnSpy).toHaveBeenCalledWith(
      'SW registration error:',
      'Registration failed'
    )
  })
})