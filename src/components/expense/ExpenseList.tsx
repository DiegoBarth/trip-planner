import { useState } from 'react'
import { ExpenseCard } from './ExpenseCard'
import { ModalExpense } from './ModalExpense'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Expense } from '@/types/Expense'
import { COUNTRIES } from '@/config/constants'

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

  // Group by country
  const groupedByCountry = expenses.reduce((acc, expense) => {
    const country = expense.country ?? 'outros'
    if (!acc[country]) {
      acc[country] = []
    }
    acc[country].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  // Sort expenses within each country by date (most recent first)
  Object.values(groupedByCountry).forEach(countryExpenses => {
    countryExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

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
    <div>
      <div className="space-y-10">
        {Object.keys(groupedByCountry).length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nenhum gasto encontrado"
            description="Comece registrando seu primeiro gasto!"
          />
        ) : (
          Object.entries(groupedByCountry).map(([country, countryExpenses]) => (
            <section key={country} className="space-y-6">
              {/* Country header */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {COUNTRIES[country as keyof typeof COUNTRIES]?.name ?? country}
                </h2>
                <span className="text-sm text-gray-400">
                  {countryExpenses.length} {countryExpenses.length === 1 ? 'gasto' : 'gastos'}
                </span>
              </div>

              {/* Expenses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countryExpenses.map(expense => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={() => handleOpenModal(expense)}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </section>
          ))
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
