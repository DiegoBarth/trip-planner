import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ExpenseCard } from './ExpenseCard'
import { ModalExpense } from './ModalExpense'
import type { Expense } from '@/types/Expense'

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (expense: Expense) => void
  onCreate: (expense: Omit<Expense, 'id'>) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onUpdate, onCreate, onDelete }: ExpenseListProps) {
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
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Gasto
        </button>
      </div>

      {/* Expense list grouped by date */}
      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🧾</div>
            <p className="text-lg">Nenhum gasto encontrado</p>
            <p className="text-sm">Comece registrando seu primeiro gasto!</p>
          </div>
        ) : (
          sortedDates.map(date => {
            const dateExpenses = groupedByDate[date]
            const dateTotal = dateExpenses.reduce((sum, exp) => sum + exp.amountInBRL, 0)
            
            return (
              <section key={date}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {new Date(date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h2>
                    <span className="text-sm text-gray-400">
                      {dateExpenses.length} {dateExpenses.length === 1 ? 'gasto' : 'gastos'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total do dia</p>
                    <p className="text-xl font-bold text-red-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dateTotal)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateExpenses.map(expense => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={() => handleOpenModal(expense)}
                      onDelete={onDelete}
                      onViewAttraction={(id) => console.log('View attraction:', id)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>

      {/* Modal */}
      <ModalExpense
        expense={editingExpense}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
