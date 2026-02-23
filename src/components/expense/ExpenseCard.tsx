import Calendar from 'lucide-react/dist/esm/icons/calendar';
import { formatCurrency, formatDate } from '@/utils/formatters'
import { EXPENSE_CATEGORIES, BUDGET_ORIGINS, getCategoryFromLabel, getBudgetOriginFromLabel } from '@/config/constants'
import { cn } from '@/lib/utils'
import type { Expense } from '@/types/Expense'

const CATEGORY_TOP_BAR: Record<string, string> = {
  food: 'bg-amber-500',
  attraction: 'bg-violet-500',
  shopping: 'bg-emerald-500',
  cosmetics: 'bg-pink-500',
  electronics: 'bg-blue-500',
  accommodation: 'bg-indigo-500',
  transport: 'bg-cyan-500',
  other: 'bg-slate-500',
}
const CATEGORY_ICON_BG: Record<string, string> = {
  food: 'bg-amber-100',
  attraction: 'bg-violet-100',
  shopping: 'bg-emerald-100',
  cosmetics: 'bg-pink-100',
  electronics: 'bg-blue-100',
  accommodation: 'bg-indigo-100',
  transport: 'bg-cyan-100',
  other: 'bg-slate-100',
}

/* Badge de origem com contraste WCAG em tema claro e escuro */
const ORIGIN_BADGE_CLASS: Record<string, string> = {
  Diego: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
  Pamela: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300',
  Casal: 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300',
  Alimentação: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
  Atrações: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300',
  Transporte: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
}

interface ExpenseCardProps {
  expense: Expense
  onClick?: (expense: Expense) => void
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const categoryKey = EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES]
    ? expense.category
    : getCategoryFromLabel(expense.category as string);

  const budgetOriginKey = BUDGET_ORIGINS[expense.budgetOrigin as keyof typeof BUDGET_ORIGINS]
    ? expense.budgetOrigin
    : getBudgetOriginFromLabel(expense.budgetOrigin as string);

  const categoryConfig = EXPENSE_CATEGORIES[categoryKey as keyof typeof EXPENSE_CATEGORIES];
  const originConfig = BUDGET_ORIGINS[budgetOriginKey as keyof typeof BUDGET_ORIGINS];
  const topBarClass = CATEGORY_TOP_BAR[categoryKey] ?? CATEGORY_TOP_BAR.other;
  const iconBgClass = CATEGORY_ICON_BG[categoryKey] ?? CATEGORY_ICON_BG.other;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(expense)}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(expense)
        }
      }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-shadow ${onClick ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50' : ''}`}
    >
      <div className={`h-1 ${topBarClass}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${iconBgClass}`}
            >
              {categoryConfig.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {expense.description}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {categoryConfig.icon} {categoryConfig.label}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-md font-medium',
                    ORIGIN_BADGE_CLASS[budgetOriginKey as keyof typeof ORIGIN_BADGE_CLASS] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {originConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-rose-800 dark:text-rose-300 tabular-nums">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            {expense.currency !== 'BRL' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(expense.amountInBRL)}
              </p>
            )}
          </div>
        </div>

        {expense.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 pl-0">
            {expense.notes}
          </p>
        )}

        <div className="flex items-center gap-2 pt-3 border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(expense.date)}</span>
        </div>
      </div>
    </div>
  );
}