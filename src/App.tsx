import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { BudgetPage } from '@/pages/BudgetPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { AttractionsPage } from '@/pages/AttractionsPage'
import { MapPage } from './pages/MapPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ChecklistPage } from '@/pages/ChecklistPage'
import { ReservationsPage } from '@/pages/ReservationsPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { BottomNav } from '@/components/ui/BottomNav'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/budgets" element={<BudgetPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/attractions" element={<AttractionsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export default App
