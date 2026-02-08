import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ExpenseList } from '@/components/expense/ExpenseList'
import { useExpense } from '@/hooks/useExpense'
import { useToast } from '@/contexts/toast'
import type { Expense } from '@/types/Expense'

export function ExpensesPage() {
  const navigate = useNavigate()
  const { expenses, isLoading, createExpense, updateExpense, deleteExpense } = useExpense()
  const toast = useToast()

  const handleCreate = async (data: Omit<Expense, 'id'>) => {
    try {
      await createExpense(data)
      toast.success('Gasto criado com sucesso!')
    } catch (error) {
      console.error('Error creating expense:', error)
      toast.error('Erro ao criar gasto')
    }
  }

  const handleUpdate = async (expense: Expense) => {
    try {
      await updateExpense(expense)
      toast.success('Gasto atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating expense:', error)
      toast.error('Erro ao atualizar gasto')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense(id)
      toast.success('Gasto excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Erro ao excluir gasto')
    }
  }

  return (
    <Layout
      title="💸 Gastos"
      onBack={() => navigate('/')}
      headerClassName="bg-gradient-to-r from-red-600 to-orange-600 text-white"
    >
      <ExpenseList
        expenses={expenses}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </Layout>
  )
}
