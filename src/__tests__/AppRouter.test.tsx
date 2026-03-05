import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import AppRouter from '@/AuthenticatedApp'

vi.mock('@/components/ui/BottomNav', () => ({ BottomNav: () => <div data-testid="bottom-nav" /> }))
vi.mock('@/components/ui/GlobalLoading', () => ({ GlobalLoading: () => <div data-testid="loading" /> }))
vi.mock('@/components/ui/ThemeToggle', () => ({ ThemeToggle: () => <button>Toggle Theme</button> }))
vi.mock('@/components/home/CountryFilter', () => ({ CountryFilter: () => <div data-testid="country-filter" /> }))
vi.mock('@/components/layout/SwipeLayout', () => ({
  SwipeLayout: () => (
    <div data-testid="swipe-layout">
      <Outlet />
    </div>
  )
}))

vi.mock('@/pages/BudgetPage', () => ({
  default: () => <div data-testid="budget-page" />
}))

vi.mock('@/pages/ExpensesPage', () => ({
  default: () => <div data-testid="expenses-page" />
}))

vi.mock('@/pages/AttractionsPage', () => ({
  default: () => <div data-testid="attractions-page" />
}))

vi.mock('@/pages/MapPage', () => ({
  default: () => <div data-testid="map-page" />
}))

vi.mock('@/pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page" />
}))

vi.mock('@/pages/ChecklistPage', () => ({
  default: () => <div data-testid="checklist-page" />
}))

vi.mock('@/pages/ReservationsPage', () => ({
  default: () => <div data-testid="reservations-page" />
}))

vi.mock('@/pages/TimelinePage', () => ({
  default: () => <div data-testid="timeline-page" />
}))

vi.mock('@/pages/ConverterPage', () => ({
  default: () => <div data-testid="converter-page" />
}))

describe('AppRouter Component', () => {
  const mockOnLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal('scrollTo', vi.fn())

    document.body.innerHTML = ''
    const actionsDiv = document.createElement('div')
    actionsDiv.id = 'header-actions'
    const filterDiv = document.createElement('div')
    filterDiv.id = 'header-filter'
    document.body.appendChild(actionsDiv)
    document.body.appendChild(filterDiv)
  })

  it('renders header and home page when path is "/"', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    expect(screen.getByText('Japão & Coreia')).toBeInTheDocument()
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument()
  })

  it('calls onLogout when logout button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    const logoutBtn = screen.getByTestId('logout-btn')
    fireEvent.click(logoutBtn)

    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })

  it('calls window.scrollTo(0,0) when route changes', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('does not render main header on subpages (e.g., /budgets)', async () => {
    render(
      <MemoryRouter initialEntries={['/budgets']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    expect(screen.queryByText('Japão & Coreia')).not.toBeInTheDocument()
  })

  it('renders CountryFilter portal only on Home', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    expect(screen.getByTestId('country-filter')).toBeInTheDocument()

    unmount()

    render(
      <MemoryRouter initialEntries={['/budgets']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('country-filter')).not.toBeInTheDocument()
  })

  it('renders budget page route', async () => {
    render(
      <MemoryRouter initialEntries={['/budgets']}>
        <AppRouter onLogout={mockOnLogout} />
      </MemoryRouter>
    )

    expect(await screen.findByTestId('budget-page')).toBeInTheDocument()
  })
})