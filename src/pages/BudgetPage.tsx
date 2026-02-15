import { useState, useMemo } from 'react'
import { BudgetList } from '@/components/budget/BudgetList'
import { useBudget } from '@/hooks/useBudget'
import { useCountry } from '@/contexts/CountryContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { BudgetOriginFilter } from '@/components/expense/BudgetOriginFilter'
import { Fab } from '@/components/ui/Fab'
import { ModalBudget } from '@/components/budget/ModalBudget'
import { Plus } from 'lucide-react'
import type { BudgetOrigin } from '@/types/Attraction'

export function BudgetPage() {
   const [showModal, setShowModal] = useState(false)
   const [budgetOrigin, setBudgetOrigin] = useState<BudgetOrigin | 'all'>('all')
   const {
      createBudget,
      updateBudget,
      deleteBudget,
   } = useBudget()

   const { budgets, isReady } = useCountry()

   const filteredBudgets = useMemo(() => {
      if (budgetOrigin === 'all') return budgets
      return budgets.filter((b) => b.origin === budgetOrigin)
   }, [budgets, budgetOrigin])

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
         <PageHeader
            title="Orçamento"
            subtitle="Gerencie o orçamento da sua viagem"
            filter={<BudgetOriginFilter value={budgetOrigin} onChange={setBudgetOrigin} />}
         />

         <main className="max-w-6xl mx-auto px-4 py-6 mb-12">
            <BudgetList
               budgets={filteredBudgets}
               isLoading={!isReady}
               onCreate={createBudget}
               onUpdate={updateBudget}
               onDelete={deleteBudget}
            />
         </main>

         <Fab
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-6 h-6" />}
            label="Adicionar"
         />

         {showModal && (
            <ModalBudget
               isOpen={showModal}
               onClose={() => setShowModal(false)}
               onSave={async (data) => {
                  await createBudget(data)
                  setShowModal(false)
               }}
            />
         )}
      </div>
   )
}