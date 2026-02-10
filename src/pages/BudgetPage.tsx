import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { BudgetList } from '@/components/budget/BudgetListComponent'
import { useBudget } from '@/hooks/useBudget'
import { useCountry } from '@/contexts/CountryContext'

export function BudgetPage() {
   const navigate = useNavigate()
   const {
      isLoading,
      createBudget,
      updateBudget,
      deleteBudget,
   } = useBudget()

   const { budgets } = useCountry()

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