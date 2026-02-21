import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/ui/BottomNav'
import { GlobalLoading } from '@/components/ui/GlobalLoading'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

interface AppRouterProps {
  onLogout: () => void
}

const HomePage = lazy(() => import('@/pages/HomePage'))
const BudgetPage = lazy(() => import('@/pages/BudgetPage'))
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'))
const AttractionsPage = lazy(() => import('@/pages/AttractionsPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ChecklistPage = lazy(() => import('@/pages/ChecklistPage'))
const ReservationsPage = lazy(() => import('@/pages/ReservationsPage'))
const TimelinePage = lazy(() => import('@/pages/TimelinePage'))

export function AppRouter({ onLogout }: AppRouterProps) {
  return (
    <>
      <GlobalLoading />
      <ScrollToTop />

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-500">
              Carregando…
            </div>
          </div>
        }
      >
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