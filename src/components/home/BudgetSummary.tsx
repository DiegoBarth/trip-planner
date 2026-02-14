import { BudgetCard } from '@/components/home/BudgetCard'
import { useBudget } from '@/hooks/useBudget'
import type { BudgetOrigin } from '@/types/Attraction'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function BudgetSummary() {
   const { budgetSummary } = useBudget()

   if (!budgetSummary) return null

   const { totalBudget, totalSpent, remainingBalance, byOrigin } = budgetSummary
   const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

   return (
      <div>
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
               <Wallet className="w-5 h-5 text-gray-600" />
               Resumo Financeiro
            </h2>
         </div>

         <Card className="mb-4 overflow-hidden">
            <div className={`
               p-6 
               ${remainingBalance >= 0 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                  : 'bg-gradient-to-br from-rose-500 to-pink-600'
               }
               text-white
            `}>
               <div className="flex items-start justify-between mb-4">
                  <div>
                     <p className="text-sm font-medium opacity-90 mb-1">Saldo Disponível</p>
                     <p className="text-3xl md:text-4xl font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                           style: 'currency',
                           currency: 'BRL',
                        }).format(remainingBalance)}
                     </p>
                  </div>
                  {remainingBalance >= 0 ? (
                     <TrendingUp className="w-8 h-8 opacity-80" />
                  ) : (
                     <TrendingDown className="w-8 h-8 opacity-80" />
                  )}
               </div>

               {/* Progress Bar */}
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium opacity-90">
                     <span>Gasto: {percentSpent.toFixed(0)}%</span>
                     <span>Restante: {(100 - percentSpent).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-xs opacity-80">
                     <span>
                        Orçamento:{' '}
                        {new Intl.NumberFormat('pt-BR', {
                           style: 'currency',
                           currency: 'BRL',
                           maximumFractionDigits: 0,
                        }).format(totalBudget)}
                     </span>
                     <span>
                        Gasto:{' '}
                        {new Intl.NumberFormat('pt-BR', {
                           style: 'currency',
                           currency: 'BRL',
                           maximumFractionDigits: 0,
                        }).format(totalSpent)}
                     </span>
                  </div>
               </div>
            </div>
         </Card>

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