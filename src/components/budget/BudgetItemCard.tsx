import Calendar from 'lucide-react/dist/esm/icons/Calendar';
import type { Budget } from '@/types/Budget'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { BUDGET_ORIGINS } from '@/config/constants'

interface BudgetItemCardProps {
  budget: Budget
  onClick?: (budget: Budget) => void
}

export function BudgetItemCard({ budget, onClick }: BudgetItemCardProps) {
  const originConfig = BUDGET_ORIGINS[budget.origin];

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(budget)}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(budget)
        }
      }}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50' : ''}`}
      style={{ borderLeftColor: originConfig.color }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${originConfig.color}18` }}
          >
            {originConfig.icon}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1" title={budget.description}>
            {budget.description}
          </h3>
          <span className="text-lg font-bold tabular-nums flex-shrink-0 text-emerald-700 dark:text-emerald-300">
            {formatCurrency(budget.amount)}
          </span>
        </div>

        <div className="pt-3 border-gray-100 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{formatDate(budget.date)}</span>
        </div>
      </div>
    </div>
  );
}