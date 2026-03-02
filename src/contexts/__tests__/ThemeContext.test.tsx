import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

/**
 * Simple test component that exposes theme and toggle button.
 */
function TestComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

/**
 * Creates (or replaces) the meta theme-color tag.
 */
function ensureMetaTag() {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  return meta as HTMLMetaElement
}

describe('ThemeProvider and useTheme', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()

    // Reset root element state between tests
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')

    ensureMetaTag()
  })

  it('defaults to light theme when nothing is saved', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('loads dark theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('falls back to light for invalid saved value', () => {
    localStorage.setItem('theme', 'invalid')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('toggles from light to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    act(() => {
      screen.getByText('toggle').click()
    })

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggles from dark to light', () => {
    localStorage.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    act(() => {
      screen.getByText('toggle').click()
    })

    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('updates meta theme-color for dark and light', () => {
    const meta = ensureMetaTag()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Initially light
    expect(meta.getAttribute('content')).toBe('#ef4444')

    // Toggle to dark
    act(() => {
      screen.getByText('toggle').click()
    })

    expect(meta.getAttribute('content')).toBe('#111827')
  })

  it('does not crash if localStorage.setItem throws', async () => {
  // Mock localStorage.setItem directly
  const originalSetItem = localStorage.setItem

  const spy = vi.fn(() => {
    throw new Error('quota exceeded')
  })

  Object.defineProperty(window, 'localStorage', {
    value: {
      ...localStorage,
      setItem: spy,
    },
    configurable: true,
  })

  // Render should not crash even if setItem throws
  expect(() =>
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
  ).not.toThrow()

  // Wait for useEffect to run
  await screen.findByTestId('theme')

  expect(spy).toHaveBeenCalled()

  // Restore original localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      ...localStorage,
      setItem: originalSetItem,
    },
    configurable: true,
  })
})

  it('throws if useTheme is used outside provider', () => {
    // Suppress expected React error output
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within ThemeProvider'
    )

    errorSpy.mockRestore()
  })
})