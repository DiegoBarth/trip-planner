import { lazy, Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Routes, Route, useLocation } from 'react-router-dom'
import LogOut from 'lucide-react/dist/esm/icons/log-out'
import { BottomNav } from '@/components/ui/BottomNav'
import { GlobalLoading } from '@/components/ui/GlobalLoading'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CountryFilter } from '@/components/home/CountryFilter'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function HeaderPortals({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [headerEls, setHeaderEls] = useState<{ actionsEl: HTMLElement | null; filterEl: HTMLElement | null }>({
    actionsEl: null,
    filterEl: null,
  })

  useEffect(() => {
    const actionsEl = document.getElementById('header-actions')
    const filterEl = document.getElementById('header-filter')
    setHeaderEls({ actionsEl, filterEl })
  }, [])
  if (!headerEls.actionsEl) return null

  const actions = (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <button
        type="button"
        onClick={onLogout}
        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Sair da conta"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  )

  return (
    <>
      {createPortal(actions, headerEls.actionsEl)}
      {isHome && headerEls.filterEl && createPortal(<CountryFilter hideGeneralOption />, headerEls.filterEl)}
    </>
  )
}

interface AppRouterProps {
  onLogout: () => void
}

import HomePage from '@/pages/HomePage'
const BudgetPage = lazy(() => import('@/pages/BudgetPage'))
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'))
const AttractionsPage = lazy(() => import('@/pages/AttractionsPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ChecklistPage = lazy(() => import('@/pages/ChecklistPage'))
const ReservationsPage = lazy(() => import('@/pages/ReservationsPage'))
const TimelinePage = lazy(() => import('@/pages/TimelinePage'))

export default function AppRouter({ onLogout }: AppRouterProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <>
      {isHome && (
        <header className="app-header">
          <div className="app-header__inner">
            <div className="app-header__row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1>Japão & Coreia</h1>
                <p className="app-header__subtitle">Planeje cada momento da sua aventura</p>
              </div>
              <div id="header-actions"></div>
            </div>
            <div id="header-filter"></div>
          </div>
        </header>
      )}

      <HeaderPortals onLogout={onLogout} />
      <GlobalLoading />
      <ScrollToTop />

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage onLogout={onLogout} />} />
          <Route path="/budgets" element={<BudgetPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/attractions" element={<AttractionsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Routes>
      </Suspense>

      <BottomNav />
    </>
  )
}