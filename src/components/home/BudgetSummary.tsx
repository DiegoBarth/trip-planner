import { BudgetCard } from '@/components/home/BudgetCard'
import { useBudget } from '@/hooks/useBudget'
import type { BudgetOrigin } from '@/types/Attraction'

export default function BudgetSummary() {
  const { budgetSummary } = useBudget();

  if (!budgetSummary) return null;

  const { totalBudget, totalSpent, remainingBalance, byOrigin } = budgetSummary;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isPositive = remainingBalance >= 0;

  return (
    <div>
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
            <div className="h-full bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-white origin-left transition-transform duration-500"
                style={{ transform: `scaleX(${Math.min(percentSpent, 100) / 100})` }}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(byOrigin)
          .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
          .map(([origin, totals]) => (
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
  );
}