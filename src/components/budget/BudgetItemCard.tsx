import { Trash2, Edit2, Calendar, DollarSign } from 'lucide-react'
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
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all border-l-4"
      style={{ borderLeftColor: originConfig.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${originConfig.color}20` }}
          >
            {originConfig.icon}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 leading-tight">
              {budget.description}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  backgroundColor: `${originConfig.color}20`,
                  color: originConfig.color 
                }}
              >
                {originConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit?.(budget)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(budget.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Valor e Data */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(budget.date)}</span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: originConfig.color }} />
          <span 
            className="text-xl font-bold"
            style={{ color: originConfig.color }}
          >
            {formatCurrency(budget.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}
