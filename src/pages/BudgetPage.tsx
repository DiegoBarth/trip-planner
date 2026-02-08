import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { BudgetList } from '@/components/budget/BudgetListComponent'
import { useBudget } from '@/hooks/useBudget'

export function BudgetPage() {
  const navigate = useNavigate()
  const {
    budgets,
    isLoading,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudget()

  return (
    <Layout
      title="💰 Orçamento"
      onBack={() => navigate('/')}
      headerClassName="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    >
      <BudgetList
        budgets={budgets}
        isLoading={isLoading}
        onCreate={createBudget}
        onUpdate={updateBudget}
        onDelete={deleteBudget}
      />
    </Layout>
  )
}
