import { Layout } from '@/components/layout/Layout'
import { BudgetList } from '@/components/budget/BudgetListComponent'
import { useBudget } from '@/hooks/useBudget'

interface BudgetPageProps {
  onBack: () => void
}

export function BudgetPage({ onBack }: BudgetPageProps) {
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
      onBack={onBack}
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
