import { useState } from 'react'
import { Plus } from 'lucide-react'
import { BudgetItemCard } from './BudgetItemCard'
import { ModalBudget } from './ModalBudget'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Budget } from '@/types/Budget'
import type { BudgetOrigin } from '@/types/Attraction'
import type { CreateBudgetPayload, UpdateBudgetPayload } from '@/api/budget'
import { BUDGET_ORIGINS } from '@/config/constants'

interface BudgetListProps {
  budgets: Budget[]
  isLoading: boolean
  onUpdate: (payload: UpdateBudgetPayload) => Promise<Budget>
  onCreate: (payload: CreateBudgetPayload) => Promise<Budget>
  onDelete: (id: number) => Promise<void>
}

export function BudgetList({ budgets, isLoading, onUpdate, onCreate, onDelete }: BudgetListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>()

  const groupedByOrigin = budgets.reduce((acc, budget) => {
    if (!acc[budget.origin]) {
      acc[budget.origin] = []
    }
    acc[budget.origin].push(budget)
    return acc
  }, {} as Record<BudgetOrigin, Budget[]>)

  Object.keys(groupedByOrigin).forEach(origin => {
    groupedByOrigin[origin as BudgetOrigin].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })

  const handleOpenModal = (budget?: Budget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingBudget(undefined)
    setIsModalOpen(false)
  }

  const handleSave = async (data: Omit<Budget, 'id'>) => {
    try {
      if (editingBudget) {
        await onUpdate({
          id: editingBudget.id,
          ...data
        })
      } else {
        await onCreate(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving budget:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Todos os Orçamentos
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({budgets.length})
          </span>
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedByOrigin).length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed">
            <div className="text-6xl mb-4">💵</div>
            <p className="text-lg font-medium">Nenhum orçamento encontrado</p>
            <p className="text-sm">Comece adicionando seu primeiro orçamento!</p>
          </div>
        ) : (
          Object.entries(groupedByOrigin).map(([origin, originBudgets]) => {
            const config = BUDGET_ORIGINS[origin as BudgetOrigin]
            return (
              <section key={origin}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{config.icon}</span>
                  <h3 className="text-xl font-bold" style={{ color: config.color }}>
                    {config.label}
                  </h3>
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
      </div>

      <ModalBudget
        budget={editingBudget}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
