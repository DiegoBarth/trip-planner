import { Trash2, Pencil, Calendar } from 'lucide-react'
import type { Expense } from '@/types/Expense'
import {
  EXPENSE_CATEGORIES,
  BUDGET_ORIGINS,
  getCategoryFromLabel,
  getBudgetOriginFromLabel,
} from '@/config/constants'
import { formatCurrency, formatDate } from '@/utils/formatters'

// Cores por categoria - identidade visual da tela de gastos (diferente do orçamento)
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

interface ExpenseCardProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: () => void
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const categoryKey = EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES]
    ? expense.category
    : getCategoryFromLabel(expense.category as string)
  const budgetOriginKey = BUDGET_ORIGINS[expense.budgetOrigin as keyof typeof BUDGET_ORIGINS]
    ? expense.budgetOrigin
    : getBudgetOriginFromLabel(expense.budgetOrigin as string)

  const categoryConfig = EXPENSE_CATEGORIES[categoryKey as keyof typeof EXPENSE_CATEGORIES]
  const originConfig = BUDGET_ORIGINS[budgetOriginKey as keyof typeof BUDGET_ORIGINS]
  const topBarClass = CATEGORY_TOP_BAR[categoryKey] ?? CATEGORY_TOP_BAR.other
  const iconBgClass = CATEGORY_ICON_BG[categoryKey] ?? CATEGORY_ICON_BG.other

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      {/* Faixa superior por categoria - identidade visual da tela de gastos */}
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
                  className="text-xs px-2 py-0.5 rounded-md font-medium"
                  style={{
                    backgroundColor: `${originConfig.color}18`,
                    color: originConfig.color,
                  }}
                >
                  {originConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit?.(expense)}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Editar"
                aria-label="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.()}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Excluir"
                aria-label="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-rose-600 tabular-nums">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
              {expense.currency !== 'BRL' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(expense.amountInBRL)}
                </p>
              )}
            </div>
          </div>
        </div>

        {expense.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 pl-0">
            {expense.notes}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(expense.date)}</span>
        </div>
      </div>
    </div>
  )
}
