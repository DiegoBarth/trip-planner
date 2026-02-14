import { useState } from 'react'
import { ExpenseCard } from './ExpenseCard'
import { ModalExpense } from './ModalExpense'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Expense } from '@/types/Expense'
import { COUNTRIES } from '@/config/constants'
import { formatCurrency } from '@/utils/formatters'
import { Receipt } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (expense: Expense) => void
  onCreate: (expense: Omit<Expense, 'id'>) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ExpenseList({
  expenses,
  onUpdate,
  onCreate,
  onDelete,
  isLoading = false,
}: ExpenseListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  const groupedByCountry = expenses.reduce((acc, expense) => {
    const country = expense.country ?? 'outros'
    if (!acc[country]) {
      acc[country] = []
    }
    acc[country].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

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
      onUpdate({ ...data, id: editingExpense.id } as Expense)
    } else {
      onCreate(data)
    }
  }

  if (isLoading) {
    return <SkeletonList />
  }

  const totalBRL = expenses.reduce((sum, e) => sum + (e.amountInBRL ?? 0), 0)
  const hasExpenses = expenses.length > 0

  return (
    <div>
      {/* Resumo total - identidade da tela de gastos */}
      {hasExpenses && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total em gastos</p>
              <p className="text-xl font-bold text-rose-700 tabular-nums">
                {formatCurrency(totalBRL)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {Object.keys(groupedByCountry).length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nenhum gasto encontrado"
            description="Comece registrando seu primeiro gasto!"
          />
        ) : (
          Object.entries(groupedByCountry).map(([country, countryExpenses]) => {
            const countryConfig = COUNTRIES[country as keyof typeof COUNTRIES]
            const countryName =
              countryConfig?.name ?? (country === 'outros' ? 'Outros' : country)
            const countryFlag = countryConfig?.flag ?? '🌍'
            const sectionTotal = countryExpenses.reduce(
              (s, e) => s + (e.amountInBRL ?? 0),
              0
            )

            return (
              <section key={country} className="space-y-4">
                {/* Cabeçalho por destino - estilo único (pill com fundo) */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-200">
                    <span className="text-xl" aria-hidden>
                      {countryFlag}
                    </span>
                    <h2 className="text-base font-semibold text-gray-900">
                      {countryName}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {countryExpenses.length}{' '}
                      {countryExpenses.length === 1 ? 'gasto' : 'gastos'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-rose-600 tabular-nums">
                    {formatCurrency(sectionTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
