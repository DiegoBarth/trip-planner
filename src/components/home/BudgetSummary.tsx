import { BudgetCard } from '@/components/home/BudgetCard'
import { useBudget } from '@/hooks/useBudget'
import type { BudgetOrigin } from '@/types/Attraction'

export function BudgetSummary() {
   const { budgetSummary } = useBudget()

   if (!budgetSummary) return null

   const { totalBudget, totalSpent, remainingBalance, byOrigin } = budgetSummary

   return (
      <div>
         <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            💰 Resumo Financeiro
         </h2>

         <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-6 shadow-lg mb-6">
            <h3 className="text-lg mb-2 opacity-90">Saldo Total</h3>
            <p className="text-4xl font-bold mb-4">
               {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
               }).format(remainingBalance)}
            </p>
            <div className="flex justify-between text-sm opacity-90">
               <span>
                  Total:{' '}
                  {new Intl.NumberFormat('pt-BR', {
                     style: 'currency',
                     currency: 'BRL',
                  }).format(totalBudget)}
               </span>
               <span>
                  Gasto:{' '}
                  {new Intl.NumberFormat('pt-BR', {
                     style: 'currency',
                     currency: 'BRL',
                  }).format(totalSpent)}
               </span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(byOrigin).map(([origin, totals]) => (
               <BudgetCard
                  key={origin}
                  origin={origin as BudgetOrigin}
                  total={totals.totalBudget}
                  spent={totals.totalSpent}
                  remaining={totals.remainingBalance}
               />
            ))}
         </div>
      </div>
   )
}
