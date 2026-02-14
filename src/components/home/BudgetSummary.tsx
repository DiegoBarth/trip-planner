import { BudgetCard } from '@/components/home/BudgetCard'
import { useCountry } from '@/contexts/CountryContext'
import type { BudgetOrigin } from '@/types/Attraction'
import { Wallet } from 'lucide-react'

export function BudgetSummary() {
   const { budgetSummary } = useCountry()

   if (!budgetSummary) return null

   const { totalBudget, totalSpent, remainingBalance, byOrigin } = budgetSummary
   const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
   const isPositive = remainingBalance >= 0

   return (
      <div>
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
               <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
               Resumo Financeiro
            </h2>
         </div>

         {/* Card principal: saldo */}
         <div
            className={`
               rounded-2xl shadow-lg overflow-hidden mb-4
               ${isPositive
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-rose-500 to-pink-600'
               }
               text-white
            `}
         >
            <div className="p-5 md:p-6">
               <p className="text-sm font-medium opacity-90 mb-1">Saldo disponível</p>
               <p className="text-3xl md:text-4xl font-bold tracking-tight">
                  {new Intl.NumberFormat('pt-BR', {
                     style: 'currency',
                     currency: 'BRL',
                  }).format(remainingBalance)}
               </p>

               <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-xs font-medium opacity-90 mb-1.5">
                     <span>Gasto</span>
                     <span>Restante</span>
                  </div>
                  <div className="h-1.5 bg-white/25 rounded-full overflow-hidden">
                     <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                     />
                  </div>
                  <div className="flex justify-between mt-2 text-xs opacity-85">
                     <span>
                        {new Intl.NumberFormat('pt-BR', {
                           style: 'currency',
                           currency: 'BRL',
                           maximumFractionDigits: 0,
                        }).format(totalSpent)}
                     </span>
                     <span>
                        {new Intl.NumberFormat('pt-BR', {
                           style: 'currency',
                           currency: 'BRL',
                           maximumFractionDigits: 0,
                        }).format(totalBudget)}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* Cards por origem */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
