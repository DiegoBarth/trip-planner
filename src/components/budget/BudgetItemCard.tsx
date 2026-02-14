import { Trash2, Pencil, Calendar } from 'lucide-react'
import type { Budget } from '@/types/Budget'
import { BUDGET_ORIGINS } from '@/config/constants'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface BudgetItemCardProps {
  budget: Budget
  onEdit?: (budget: Budget) => void
  onDelete?: (id: number) => void
}

export function BudgetItemCard({ budget, onEdit, onDelete }: BudgetItemCardProps) {
  const originConfig = BUDGET_ORIGINS[budget.origin]

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 transition-all hover:shadow-lg"
      style={{ borderLeftColor: originConfig.color }}
    >
      <div className="p-4">
        {/* Linha 1: ícone + descrição (uma linha) + ações */}
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
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit?.(budget)}
              className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Editar"
              aria-label="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(budget.id)}
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Excluir"
              aria-label="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linha 2: pill da origem (Casal, Diego, etc.) */}
        <span
          className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-md w-fit"
          style={{
            backgroundColor: `${originConfig.color}18`,
            color: originConfig.color,
          }}
        >
          {originConfig.label}
        </span>

        {/* Linha 3: data + valor */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{formatDate(budget.date)}</span>
          </div>
          <span
            className="text-lg font-bold tabular-nums flex-shrink-0"
            style={{ color: originConfig.color }}
          >
            {formatCurrency(budget.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}
