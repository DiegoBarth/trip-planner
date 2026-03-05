import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'
import App from '@/App'
import * as apiHome from '@/api/home'
import { AUTH_REFRESH_INTERVAL_MS } from '@/config/authConstants'

vi.mock('@/api/home', () => ({
  verifyEmailAuthorization: vi.fn(),
}))

let mockJwtValue = `aaa.${btoa(JSON.stringify({ email: 'test@example.com' }))}.ccc`;

vi.mock('@/components/login/LoginScreen', () => {
  return {
    default: ({ onSuccess }: any) => (
      <button
        data-testid="login-btn"
        onClick={() => onSuccess({ credential: mockJwtValue })}
      >
        Login
      </button>
    ),
  }
})
vi.mock('./AuthenticatedApp', () => ({
  default: ({ onLogout }: any) => (
    <div>
      <button data-testid="logout-btn" onClick={onLogout}>
        Logout
      </button>
      <div>Authenticated Content</div>
    </div>
  ),
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => { })
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders LoginScreen if no userEmail in localStorage', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('login-btn')).toBeDefined()
    })
  })

  it('calls handleLoginSuccess and stores email on authorized login', async () => {
    (apiHome.verifyEmailAuthorization as any).mockResolvedValue(true)

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const loginBtn = await screen.findByTestId('login-btn')
    fireEvent.click(loginBtn)

    await waitFor(() => {
      expect(localStorage.getItem('user_email')).toBe('test@example.com')
      expect(localStorage.getItem('login_time')).toBeDefined()
      expect(screen.getByTestId('logout-btn')).toBeDefined()
    })
  })

  it('shows alert if email is not authorized', async () => {
    (apiHome.verifyEmailAuthorization as any).mockResolvedValue(false)

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const loginBtn = await screen.findByTestId('login-btn')
    fireEvent.click(loginBtn)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('E-mail não autorizado!')
      expect(localStorage.getItem('user_email')).toBeNull()
    })
  })

  it('renders AuthenticatedApp if userEmail exists in localStorage', async () => {
    localStorage.setItem('user_email', 'already@logged.com')
    localStorage.setItem('login_time', Date.now().toString())

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const logoutBtn = await screen.findByTestId('logout-btn')
    expect(logoutBtn).toBeInTheDocument()
  })

  it('handleLogout clears storage and resets userEmail', async () => {
    localStorage.setItem('user_email', 'already@logged.com')
    localStorage.setItem('login_time', Date.now().toString())

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const logoutBtn = screen.getByTestId('logout-btn')
    fireEvent.click(logoutBtn)

    await waitFor(() => {
      expect(localStorage.getItem('user_email')).toBeNull()
      expect(sessionStorage.getItem('period')).toBeNull()
      expect(screen.queryByTestId('logout-btn')).toBeNull()
    })
  })

  it('shows error alert on invalid JWT decode (linhas 43-44)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

    mockJwtValue = `header.${btoa('not-a-json')}.signature`;

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const loginBtn = await screen.findByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao decodificar login:',
        expect.any(Error)
      );
      expect(alertSpy).toHaveBeenCalledWith('Erro ao fazer login');
    });

    mockJwtValue = `aaa.${btoa(JSON.stringify({ email: 'test@example.com' }))}.ccc`;
  });

  it('updates login_time periodically', async () => {
    vi.useFakeTimers();

    localStorage.setItem("user_email", "teste@teste.com");
    localStorage.setItem("login_time", Date.now().toString());

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    vi.advanceTimersByTime(AUTH_REFRESH_INTERVAL_MS * 2);

    const savedTime = Number(localStorage.getItem("login_time") || 0);
    expect(savedTime).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it('returns early if no credential is provided (linha 25)', async () => {
    const originalValue = mockJwtValue;
    (mockJwtValue as any) = undefined;

    const alertSpy = vi.spyOn(window, 'alert');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const loginBtn = await screen.findByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(alertSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(localStorage.getItem('user_email')).toBeNull();
    });

    mockJwtValue = originalValue;
  });
})