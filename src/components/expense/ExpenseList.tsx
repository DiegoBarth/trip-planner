import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ExpenseCard } from './ExpenseCard'
import { ModalExpense } from './ModalExpense'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Expense } from '@/types/Expense'
import { formatDate } from '@/utils/formatters'

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (expense: Expense) => void
  onCreate: (expense: Omit<Expense, 'id'>) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ExpenseList({ expenses, onUpdate, onCreate, onDelete, isLoading = false }: ExpenseListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  // Group by date (most recent first)
  const groupedByDate = expenses.reduce((acc, expense) => {
    const date = expense.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  const handleOpenModal = (expense?: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingExpense(undefined)
    setIsModalOpen(false)
  }

  const handleSave = (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      onUpdate({
        ...data,
        id: editingExpense.id
      } as Expense)
    } else {
      onCreate(data)
    }
    handleCloseModal()
  }

  // Show loading skeleton
  if (isLoading) {
    return <SkeletonList />
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Todos os Gastos
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({expenses.length})
          </span>
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Gasto
        </button>
      </div>

      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nenhum gasto encontrado"
            description="Comece registrando seu primeiro gasto!"
          />
        ) : (
          sortedDates.map(date => {
            const dateExpenses = groupedByDate[date]
            
            // Format date
            const formattedDate = formatDate(date)
            
            return (
              <section key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📅</span>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">
                    {formattedDate}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {dateExpenses.length} {dateExpenses.length === 1 ? 'gasto' : 'gastos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateExpenses.map(expense => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={() => handleOpenModal(expense)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>

      <ModalExpense
        expense={editingExpense}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
