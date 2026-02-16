import { useState } from 'react'
import { BudgetItemCard } from './BudgetItemCard'
import { ModalBudget } from './ModalBudget'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Budget } from '@/types/Budget'
import type { BudgetOrigin } from '@/types/Attraction'
import type { CreateBudgetPayload, UpdateBudgetPayload } from '@/api/budget'
import { BUDGET_ORIGINS } from '@/config/constants'
import { useToast } from '@/contexts/toast'

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
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)
  const toast = useToast()
  
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
        await onUpdate({ id: editingBudget.id, ...data })
      } else {
        await onCreate(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error('Erro ao salvar orçamento')
    }
  }

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return
    await onDelete(budgetToDelete.id)
    setBudgetToDelete(null)
  }

  if (isLoading) return null

  return (
    <div>
      <div className="space-y-8">
        {Object.keys(groupedByOrigin).length === 0 ? (
          <EmptyState
            icon="💵"
            title="Nenhum orçamento encontrado"
            description="Comece adicionando seu primeiro orçamento!"
          />
        ) : (
          Object.entries(groupedByOrigin).map(([origin, originBudgets]) => {
            const config = BUDGET_ORIGINS[origin as BudgetOrigin]
            return (
              <section key={origin} className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
                  <span className="text-xl">{config.icon}</span>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {config.label}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {originBudgets.length} {originBudgets.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {originBudgets.map(budget => (
                    <BudgetItemCard
                      key={budget.id}
                      budget={budget}
                      onEdit={() => handleOpenModal(budget)}
                      onDelete={() => setBudgetToDelete(budget)}
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

      <ConfirmModal
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        title="Excluir orçamento"
        message={
          budgetToDelete ? (
            <>Tem certeza que deseja excluir &quot;{budgetToDelete.description}&quot;?</>
          ) : null
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
