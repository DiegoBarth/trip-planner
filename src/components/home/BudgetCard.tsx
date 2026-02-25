import { formatCurrency } from '@/utils/formatters'
import { BUDGET_ORIGINS } from '@/config/constants'
import type { BudgetOrigin } from '@/types/Attraction'

interface BudgetCardProps {
  origin: BudgetOrigin
  total: number
  spent: number
  remaining: number
}

export function BudgetCard({ origin, total, spent, remaining }: BudgetCardProps) {
  const config = BUDGET_ORIGINS[origin];
  const percentSpent = total > 0 ? (spent / total) * 100 : 0;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 transition-shadow hover:shadow-lg"
      style={{ borderLeftColor: config.color }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl" aria-hidden>{config.icon}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{config.label}</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</span>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-500 dark:text-gray-400">Gasto</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(spent)}</span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-500 dark:text-gray-400">Restante</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(remaining)}</span>
          </div>
        </div>

        <div className="pt-3 border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Utilizado</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{percentSpent.toFixed(1)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentSpent, 100)}%`, backgroundColor: config.color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}