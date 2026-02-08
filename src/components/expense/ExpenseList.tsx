import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { ExpenseCard } from './ExpenseCard'
import { ModalExpense } from './ModalExpense'
import type { Expense, ExpenseCategory } from '@/types/Expense'
import type { BudgetOrigin } from '@/types/Attraction'
import { EXPENSE_CATEGORIES, BUDGET_ORIGINS, COUNTRIES } from '@/config/constants'

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (expense: Expense) => void
  onCreate: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onUpdate, onCreate, onDelete }: ExpenseListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [filters, setFilters] = useState({
    category: 'all' as ExpenseCategory | 'all',
    origin: 'all' as BudgetOrigin | 'all',
    country: 'all' as 'japan' | 'south-korea' | 'all'
  })

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (filters.category !== 'all' && expense.category !== filters.category) return false
    if (filters.origin !== 'all' && expense.budgetOrigin !== filters.origin) return false
    if (filters.country !== 'all' && expense.country !== filters.country) return false
    return true
  })

  // Group by date (most recent first)
  const groupedByDate = filteredExpenses.reduce((acc, expense) => {
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

  // Calculate totals
  const totals = {
    overall: expenses.reduce((sum, exp) => sum + exp.amountInBRL, 0),
    byOrigin: expenses.reduce((acc, exp) => {
      if (!acc[exp.budgetOrigin]) acc[exp.budgetOrigin] = 0
      acc[exp.budgetOrigin] += exp.amountInBRL
      return acc
    }, {} as Record<BudgetOrigin, number>),
    byCategory: expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = 0
      acc[exp.category] += exp.amountInBRL
      return acc
    }, {} as Record<ExpenseCategory, number>)
  }

  const handleOpenModal = (expense?: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingExpense(undefined)
    setIsModalOpen(false)
  }

  const handleSave = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      onUpdate({
        ...data,
        id: editingExpense.id,
        createdAt: editingExpense.createdAt,
        updatedAt: new Date().toISOString()
      } as Expense)
    } else {
      onCreate(data)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              💸 Gastos
              <span className="text-sm font-normal text-gray-500">
                ({filteredExpenses.length})
              </span>
            </h1>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Gasto
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Total geral */}
            <div className="bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Total Gasto</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.overall)}
              </p>
            </div>

            {/* By origin */}
            {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
              <div 
                key={key}
                className="bg-white rounded-lg p-4 border-2"
                style={{ borderColor: config.color }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-sm font-medium text-gray-600">{config.label}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: config.color }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.byOrigin[key] || 0)}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="w-5 h-5 text-gray-500" />
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as ExpenseCategory | 'all' }))}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="all">Todas categorias</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            <select
              value={filters.origin}
              onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value as BudgetOrigin | 'all' }))}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="all">Todas origens</option>
              {Object.entries(BUDGET_ORIGINS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value as 'japan' | 'south-korea' | 'all' }))}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="all">Todos países</option>
              {Object.entries(COUNTRIES).map(([key, country]) => (
                <option key={key} value={key}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>

            {(filters.category !== 'all' || filters.origin !== 'all' || filters.country !== 'all') && (
              <button
                onClick={() => setFilters({ category: 'all', origin: 'all', country: 'all' })}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Expense list grouped by date */}
      <main className="max-w-6xl mx-auto p-4 space-y-8">
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
      </main>

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
