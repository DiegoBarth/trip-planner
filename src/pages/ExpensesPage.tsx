import { Layout } from '@/components/layout/Layout'
import { ExpenseList } from '@/components/expense/ExpenseList'
import type { Expense } from '@/types/Expense'

interface ExpensesPageProps {
  onBack: () => void
}

// Mock data
const mockExpenses: Expense[] = []

export function ExpensesPage({ onBack }: ExpensesPageProps) {
  const handleCreate = (data: Omit<Expense, 'id'>) => {
    console.log('Criar gasto:', data)
  }

  const handleUpdate = (expense: Expense) => {
    console.log('Atualizar gasto:', expense)
  }

  const handleDelete = (id: string) => {
    console.log('Deletar gasto:', id)
  }

  return (
    <Layout
      title="💸 Gastos"
      onBack={onBack}
      headerClassName="bg-gradient-to-r from-red-600 to-orange-600 text-white"
    >
      <ExpenseList
        expenses={mockExpenses}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Layout>
  )
}
