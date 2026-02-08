import { Layout } from '@/components/layout/Layout'
import { BudgetList } from '@/components/budget/BudgetListComponent'
import type { Budget } from '@/types/Budget'

interface BudgetPageProps {
  onBack: () => void
}

// Mock data
const mockBudgets: Budget[] = []

export function BudgetPage({ onBack }: BudgetPageProps) {
  const handleCreate = (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Criar orçamento:', data)
  }

  const handleUpdate = (budget: Budget) => {
    console.log('Atualizar orçamento:', budget)
  }

  const handleDelete = (id: string) => {
    console.log('Deletar orçamento:', id)
  }

  return (
    <Layout
      title="💰 Orçamento"
      onBack={onBack}
      headerClassName="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    >
      <BudgetList
        budgets={mockBudgets}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Layout>
  )
}
