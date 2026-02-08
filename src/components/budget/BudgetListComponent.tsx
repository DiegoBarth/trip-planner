import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { BudgetItemCard } from './BudgetItemCard'
import { ModalBudget } from './ModalBudget'
import type { Budget } from '@/types/Budget'
import type { BudgetOrigin } from '@/types/Attraction'
import { BUDGET_ORIGINS } from '@/config/constants'

interface BudgetListProps {
  budgets: Budget[]
  onUpdate: (budget: Budget) => void
  onCreate: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
}

export function BudgetList({ budgets, onUpdate, onCreate, onDelete }: BudgetListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
  const [filters, setFilters] = useState({
    origin: 'all' as BudgetOrigin | 'all',
    type: 'all' as 'income' | 'adjustment' | 'all'
  })

  // Filtrar orçamentos
  const filteredBudgets = budgets.filter(budget => {
    if (filters.origin !== 'all' && budget.origin !== filters.origin) return false
    if (filters.type !== 'all' && budget.type !== filters.type) return false
    return true
  })

  // Agrupar por origem
  const groupedByOrigin = filteredBudgets.reduce((acc, budget) => {
    if (!acc[budget.origin]) {
      acc[budget.origin] = []
    }
    acc[budget.origin].push(budget)
    return acc
  }, {} as Record<BudgetOrigin, Budget[]>)

  // Ordenar cada grupo por data (mais recente primeiro)
  Object.keys(groupedByOrigin).forEach(origin => {
    groupedByOrigin[origin as BudgetOrigin].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })

  // Calcular totais
  const totals = budgets.reduce((acc, budget) => {
    if (!acc[budget.origin]) {
      acc[budget.origin] = 0
    }
    acc[budget.origin] += budget.amount
    return acc
  }, {} as Record<BudgetOrigin, number>)

  const handleOpenModal = (budget?: Budget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingBudget(undefined)
    setIsModalOpen(false)
  }

  const handleSave = (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBudget) {
      onUpdate({
        ...data,
        id: editingBudget.id
      } as Budget)
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
              💰 Orçamentos
              <span className="text-sm font-normal text-gray-500">
                ({filteredBudgets.length})
              </span>
            </h1>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Orçamento
            </button>
          </div>

          {/* Resumo por origem */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
              <div 
                key={key}
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 border-2"
                style={{ borderColor: config.color }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-sm font-medium text-gray-600">{config.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: config.color }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals[key] || 0)}
                </p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="w-5 h-5 text-gray-500" />
            
            <select
              value={filters.origin}
              onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value as BudgetOrigin | 'all' }))}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Todas origens</option>
              {Object.entries(BUDGET_ORIGINS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'income' | 'adjustment' | 'all' }))}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Todos tipos</option>
              <option value="income">💰 Receitas</option>
              <option value="adjustment">⚖️ Ajustes</option>
            </select>

            {(filters.origin !== 'all' || filters.type !== 'all') && (
              <button
                onClick={() => setFilters({ origin: 'all', type: 'all' })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Lista de orçamentos agrupados por origem */}
      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {Object.keys(groupedByOrigin).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">💵</div>
            <p className="text-lg">Nenhum orçamento encontrado</p>
            <p className="text-sm">Comece adicionando seu primeiro orçamento!</p>
          </div>
        ) : (
          Object.entries(groupedByOrigin).map(([origin, originBudgets]) => {
            const config = BUDGET_ORIGINS[origin as BudgetOrigin]
            return (
              <section key={origin}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{config.icon}</span>
                  <h2 className="text-xl font-bold" style={{ color: config.color }}>
                    {config.label}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {originBudgets.length} {originBudgets.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {originBudgets.map(budget => (
                    <BudgetItemCard
                      key={budget.id}
                      budget={budget}
                      onEdit={() => handleOpenModal(budget)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      {/* Modal */}
      <ModalBudget
        budget={editingBudget}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
