import { useState } from 'react'
import { HomePage } from '@/pages/HomePage'
import { BudgetPage } from '@/pages/BudgetPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { AttractionsPage } from '@/pages/AttractionsPage'
import { DashboardPage } from '@/pages/DashboardPage'

type Page = 'home' | 'budget' | 'expenses' | 'attractions' | 'dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  switch (currentPage) {
    case 'budget':
      return <BudgetPage onBack={() => handleNavigate('home')} />
    case 'expenses':
      return <ExpensesPage onBack={() => handleNavigate('home')} />
    case 'attractions':
      return <AttractionsPage onBack={() => handleNavigate('home')} />
    case 'dashboard':
      return <DashboardPage onBack={() => handleNavigate('home')} />
    default:
      return <HomePage onNavigate={handleNavigate} />
  }
}

export default App
